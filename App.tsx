import React, { useState, useEffect } from 'react';
import { ViewState, Session, Question, User, Assessment } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import FacultyDashboard from './components/FacultyDashboard';
import QuestionnaireCreator from './components/QuestionnaireCreator';
import LiveSession from './components/LiveSession';
import StudentPoll from './components/StudentPoll';
import ErrorBoundary from './components/ErrorBoundary';
import { useFeedback } from './components/FeedbackContext';

import { Icons, STORAGE_KEYS } from './constants';
import { db, ref, onValue, set, update, get } from './firebase';
import { secureLog, handleGenericError, sanitizeInput } from './utils/securityUtils';

const SESSION_KEY = STORAGE_KEYS.SESSION;
const USER_KEY = STORAGE_KEYS.USER;
const DB_KEY = STORAGE_KEYS.QUESTIONS;

import { safeStorage } from './utils/storageUtils';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [studentSession, setStudentSession] = useState<Session | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [identities, setIdentities] = useState<Record<string, string>>({});
  const [joinAttempts, setJoinAttempts] = useState(0);
  const [joinCooldown, setJoinCooldown] = useState<number | null>(null);
  
  const { showFeedback } = useFeedback();

  const GUEST_FACULTY: User = {
    id: 'faculty_guest',
    email: 'academic@umak.edu.ph',
    name: 'Institutional Faculty',
    role: 'FACULTY'
  };

  // Deep Linking for Student QR Code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('access');
    if (code && !studentSession && view === 'HOME') {
      secureLog(`Deep Link detected: Attempting auto-join for code ${code}`);
      handleJoinSession(code);
    }
  }, [activeSession, db]); // Check on load once db is ready

  useEffect(() => {
    // 1. Real-time Session Sync via Firebase
    if (!db) {
      secureLog("Firebase database not initialized. Sync skipped.");
      return;
    }

    const sessionRef = ref(db, 'active_session');

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      const session: Session | null = data || null;

      if (session) {
          // Update basic session state (identities will be merged by the attendance listener)
          setActiveSession(prev => prev ? { ...prev, ...session } : session);

          // Restore view only if this specific device is the host of the active session (All non-terminal states)
          if (session && (session.status === 'active' || session.status === 'paused' || session.status === 'waiting') && !studentSession) {
            const hostOfId = safeStorage.getItem('umak_host_of');
            if (hostOfId === session.id && view === 'HOME') {
              setView('FACULTY_LIVE');
            }
          }

          // Sync student session state
          setStudentSession(current => {
            if (!current) return null;
            if (!session || session.id !== current.id) return null;
            return { ...current, ...session };
          });
      } else {
        setActiveSession(null);
      }
    });

    // 2. Dedicated Attendance Listener for Host (Real-time participant registry)
    const hostOfId = safeStorage.getItem('umak_host_of');
    let attendanceUnsubscribe: (() => void) | null = null;

    if (activeSession?.accessCode && hostOfId === activeSession.id) {
       const targetRef = ref(db, `attendance/${activeSession.accessCode}`);
       attendanceUnsubscribe = onValue(targetRef, (snapshot) => {
         const data = snapshot.exists() ? snapshot.val() : {};
         setIdentities(data);
       });
    }

    return () => {
      unsubscribe();
      if (attendanceUnsubscribe) attendanceUnsubscribe();
    };
  }, [view, studentSession?.id, activeSession?.id]);

  const handleEnterFacultyMode = () => {
    setView('FACULTY_DASHBOARD');
  };

  const saveToDatabase = (assessment: Assessment) => {
    const db = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const existingIdx = db.findIndex((a: Assessment) => a.id === assessment.id);

    if (existingIdx > -1) {
      db[existingIdx] = { ...assessment, creatorId: GUEST_FACULTY.id };
    } else {
      db.push({ ...assessment, creatorId: GUEST_FACULTY.id });
    }

    localStorage.setItem(DB_KEY, JSON.stringify(db));
  };

  const handleSaveDraft = (assessment: Assessment) => {
    saveToDatabase({ ...assessment, isDraft: true });
    showFeedback("Draft saved automatically to your workspace.", "success", "Progress Secured");
    setView('FACULTY_DASHBOARD');
  };

  const handleCreateSession = async (assessment: Assessment) => {
    try {
      saveToDatabase({ ...assessment, isDraft: false });

      const newSession: Session = {
        id: Math.random().toString(36).substring(7),
        accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
        questions: assessment.questions,
        currentQuestionIndex: 0,
        status: assessment.hasLobby ? 'waiting' : 'active',
        participantsCount: 0,
        allResponses: {},
        startTime: Date.now(),
        isStarted: !assessment.hasLobby,
        preventMultipleResponses: assessment.preventMultipleResponses ?? true, // Default to true for Academic integrity
        requireStudentName: assessment.requireStudentName || false,
        identities: {}
      };

      // Ensure we clear any old active session reference first
      await set(ref(db, 'active_session'), null);

      // Push the new session
      await set(ref(db, 'active_session'), newSession);

      // Mark THIS device as the official host for auto-resume logic
      safeStorage.setItem('umak_host_of', newSession.id);

      setActiveSession(newSession);
      setView('FACULTY_LIVE');
    } catch (e) {
      handleGenericError(e, "Could not launch session. Please check your network connection or Firebase rules.");
    }
  };

  const handleEditDraft = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setView('FACULTY_EDIT');
  };

  const handleStudentSubmit = async (responseIndex: any, studentName?: string) => {
    const sessionRef = ref(db, 'active_session');

    try {
      const snapshot = await get(sessionRef);
      const session: Session = snapshot.val();
      if (!session || session.status !== 'active') return;

      const qIdx = session.currentQuestionIndex || 0;

      // 1. Session Integrity & Participation Tracking
      const { validateSessionIntegrity, sanitizeInput, hasUserJoined, markUserJoined } = await import('./utils/securityUtils');
      
      if (!validateSessionIntegrity(session.id)) {
        throw new Error("Security Violation: Session fingerprint mismatch.");
      }

      const updates: any = {};
      
      // Only increment participant count if this is the student's first response in THIS session
      if (!hasUserJoined(session.id)) {
        const { increment } = await import('./firebase');
        updates['participantsCount'] = increment(1);
        markUserJoined(session.id);
      }

      // Store named response if available (Part of question analytics)
      if (studentName) {
        const namedResponses = (session.allResponses && session.allResponses[qIdx] && session.allResponses[qIdx].namedResponses) || [];
        const secureName = sanitizeInput(studentName);
        updates[`allResponses/${qIdx}/namedResponses`] = [...namedResponses, { name: secureName, answer: responseIndex }];
      }

      if (typeof responseIndex === 'number') {
        const { increment } = await import('./firebase');
        updates[`allResponses/${qIdx}/${responseIndex}`] = increment(1);
      } else if (Array.isArray(responseIndex)) {
        const currentRankings = (session.allResponses && session.allResponses[qIdx] && session.allResponses[qIdx].rankings) || [];
        updates[`allResponses/${qIdx}/rankings`] = [...currentRankings, responseIndex];
      } else {
        const currentTexts = (session.allResponses && session.allResponses[qIdx] && session.allResponses[qIdx].text) || [];
        // Apply strict sanitization to all text responses
        const sanitizedResponse = sanitizeInput(responseIndex);
        updates[`allResponses/${qIdx}/text`] = [...currentTexts, sanitizedResponse];
      }

      await update(sessionRef, updates);
    } catch (e) {
      handleGenericError(e, "Failed to submit your response. Please check your connection.");
    }
  };

  const handleRegisterIdentity = async (name: string, sessionId?: string) => {
    try {
      const targetCode = activeSession?.accessCode || studentSession?.accessCode || sessionId;
      if (!targetCode) {
        secureLog("Cannot register identity: No target access code found.");
        return;
      }

      const { sanitizeInput } = await import('./utils/securityUtils');
      const secureName = sanitizeInput(name);
      if (!secureName) return;

      // Sanitization for Firebase Keys
      const nameKey = secureName.replace(/[.$#[\]/]/g, '_');
      secureLog(`Registering attendance for session ${targetCode}: ${secureName}`);

      // Use the visible accessCode as the key to prevent internal ID mismatches
      const attendanceRef = ref(db, `attendance/${targetCode}/${nameKey}`);
      await set(attendanceRef, secureName);
      
      secureLog("Attendance registered successfully.");
    } catch (e: any) {
      secureLog("Failed to register identity", e);
      showFeedback(e.message, 'error', 'Registration Error', true);
    }
  };

  const handleJoinSession = async (code: string, honeypotValue = '') => {
    // 1. Cooldown Check (Brute-force protection)
    if (joinCooldown && Date.now() < joinCooldown) {
      const remainingSeconds = Math.ceil((joinCooldown - Date.now()) / 1000);
      showFeedback(`Too many failed attempts. Please wait ${remainingSeconds} seconds.`, 'error', 'Security Lockout', true);
      return;
    }

    const normalizedCode = code.trim().toUpperCase();

    // 2. Antigravity Honeypot Check
    if (honeypotValue) {
      secureLog("Bot detected via honeymoon field.");
      return;
    }

    try {
      const snapshot = await get(ref(db, 'active_session'));
      const session: Session | null = snapshot.val();

      if (session) {
        if (String(session.accessCode).trim().toUpperCase() === normalizedCode) {
          // SUCCESS LOCK
          setJoinAttempts(0);
          setJoinCooldown(null);

          if (session.status === 'ended') {
            showFeedback('This academic session has already concluded.', 'warning', 'Session Ended');
          } else {
            // Initialize fingerprint on join
            const { validateSessionIntegrity } = await import('./utils/securityUtils');
            validateSessionIntegrity(session.id);
            setStudentSession(session);
            setView('STUDENT_POLL');
          }
        } else {
          // FAILURE INCREMENT
          const newAttempts = joinAttempts + 1;
          setJoinAttempts(newAttempts);

          if (newAttempts >= 5) {
            const cooldownPeriod = Date.now() + 30000; // 30 second penalty
            setJoinCooldown(cooldownPeriod);
            showFeedback('Maximum attempts reached. You are locked out for 30 seconds for security reasons.', 'error', 'Security Lockout', true);
          } else {
            showFeedback(`The code "${normalizedCode}" does not match. (${5 - newAttempts} attempts remaining)`, 'error', 'Access Denied');
          }
        }
      } else {
        showFeedback('There are no active academic sessions detected in the database.', 'info', 'No Active Sessions');
      }
    } catch (e) {
      handleGenericError(e, "An error occurred while joining the session.");
    }
  };

  const renderView = () => {
    try {
      switch (view) {
        case 'HOME':
          return <Home setView={setView} onJoin={handleJoinSession} onEnterFaculty={handleEnterFacultyMode} />;
        case 'FACULTY_DASHBOARD':
          return (
            <FacultyDashboard
              user={GUEST_FACULTY}
              onCreateNew={() => { setEditingAssessment(null); setView('FACULTY_CREATE'); }}
              onStartSession={handleCreateSession}
              onEditDraft={(a: Assessment) => { setEditingAssessment(a); setView('FACULTY_EDIT'); }}
            />
          );
        case 'FACULTY_CREATE':
        case 'FACULTY_EDIT':
          return <QuestionnaireCreator
            initialData={editingAssessment || undefined}
            onCreate={handleCreateSession}
            onSaveDraft={handleSaveDraft}
            onCancel={() => setView('FACULTY_DASHBOARD')}
          />;
        case 'FACULTY_LIVE':
          return activeSession ? (
            <LiveSession 
              session={{ ...activeSession, identities }} 
              onEnd={() => {
                set(ref(db, 'active_session'), null); // Correctly using set from firebase logic
                setActiveSession(null);
                setIdentities({});
                safeStorage.removeItem('umak_host_of');
                setView('HOME');
              }} 
            />
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#004A98] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Re-establishing Session...</p>
              </div>
            </div>
          );
        case 'STUDENT_POLL':
          if (!studentSession) return <Home setView={setView} onJoin={handleJoinSession} onEnterFaculty={handleEnterFacultyMode} />;
          return (
            <StudentPoll
              key={studentSession.id}
              session={studentSession}
              onRegister={handleRegisterIdentity}
              onSubmit={handleStudentSubmit}
              onFinished={() => {
                setStudentSession(null);
                setView('HOME');
              }}
            />
          );
        default:
          return <Home setView={setView} onJoin={handleJoinSession} onEnterFaculty={handleEnterFacultyMode} />;
      }
    } catch (e) {
      console.error("Critical Render Error:", e);
      return (
        <div className="p-12 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-6">The application encountered a rendering error.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-umak-blue text-white px-6 py-2 rounded-lg font-bold"
          >
            Reload Application
          </button>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header
          onHome={() => setView('HOME')}
          onDashboard={() => setView('FACULTY_DASHBOARD')}
        />
        <main className="flex-grow">
          {renderView()}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;
