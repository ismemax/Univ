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

import { Icons, STORAGE_KEYS } from './constants';
import { db, ref, onValue, set, update, get } from './firebase';
import { secureLog, handleGenericError, sanitizeInput } from './utils/securityUtils';

const SESSION_KEY = STORAGE_KEYS.SESSION;
const USER_KEY = STORAGE_KEYS.USER;
const DB_KEY = STORAGE_KEYS.QUESTIONS;

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [studentSession, setStudentSession] = useState<Session | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [joinAttempts, setJoinAttempts] = useState(0);
  const [joinCooldown, setJoinCooldown] = useState<number | null>(null);

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

      setActiveSession(session);

      // Restore view only if this specific device is the host of the active session (All non-terminal states)
      if (session && (session.status === 'active' || session.status === 'paused' || session.status === 'waiting') && !studentSession) {
        const hostOfId = localStorage.getItem('umak_host_of');
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
    });

    return () => unsubscribe();
  }, [view, studentSession?.id]);

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
      };

      // Ensure we clear any old active session reference first
      await set(ref(db, 'active_session'), null);

      // Push the new session
      await set(ref(db, 'active_session'), newSession);

      // Mark THIS device as the official host for auto-resume logic
      localStorage.setItem('umak_host_of', newSession.id);

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
        updates['participantsCount'] = (session.participantsCount || 0) + 1;
        markUserJoined(session.id);
      }

      // Store named response if available (Part of question analytics)
      if (studentName) {
        const namedResponses = (session.allResponses && session.allResponses[qIdx] && session.allResponses[qIdx].namedResponses) || [];
        const secureName = sanitizeInput(studentName);
        updates[`allResponses/${qIdx}/namedResponses`] = [...namedResponses, { name: secureName, answer: responseIndex }];
      }

      if (typeof responseIndex === 'number') {
        const currentCount = (session.allResponses && session.allResponses[qIdx] && session.allResponses[qIdx][responseIndex]) || 0;
        updates[`allResponses/${qIdx}/${responseIndex}`] = currentCount + 1;
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

  const handleRegisterIdentity = async (name: string) => {
    try {
      const { sanitizeInput } = await import('./utils/securityUtils');
      const secureName = sanitizeInput(name);
      if (!secureName) return;

      // RTDB keys cannot contain: . $ # [ ] /
      const nameKey = secureName.replace(/[.$#[\]/]/g, '_');

      await update(ref(db, `active_session/identities`), {
        [nameKey]: true
      });
    } catch (e) {
      secureLog("Failed to register identity", e);
    }
  };

  const handleJoinSession = async (code: string, honeypotValue = '') => {
    // 1. Cooldown Check (Brute-force protection)
    if (joinCooldown && Date.now() < joinCooldown) {
      const remainingSeconds = Math.ceil((joinCooldown - Date.now()) / 1000);
      alert(`Security Lockout: Too many failed attempts. Please wait ${remainingSeconds} seconds.`);
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
            alert('Session Ended: This session has already concluded.');
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
            alert('Security Lockout: 5 failed attempts reached. You are locked out for 30 seconds.');
          } else {
            alert(`Access Denied: The code "${normalizedCode}" does not match. (${5 - newAttempts} attempts remaining)`);
          }
        }
      } else {
        alert('Entry Failed: There are no active academic sessions detected.');
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
            <LiveSession session={activeSession} onEnd={() => {
              set(ref(db, 'active_session'), null); // Correctly using set from firebase logic
              setActiveSession(null);
              localStorage.removeItem('umak_host_of');
              setView('HOME');
            }} />
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
