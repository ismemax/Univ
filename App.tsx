
import React, { useState, useEffect } from 'react';
import { ViewState, Session, Question, User, Assessment } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import FacultyDashboard from './components/FacultyDashboard';
import QuestionnaireCreator from './components/QuestionnaireCreator';
import LiveSession from './components/LiveSession';
import StudentPoll from './components/StudentPoll';

import { Icons, STORAGE_KEYS } from './constants';
import { db, ref, onValue, set, update, get } from './firebase';
import { secureLog, handleGenericError, sanitizeInput } from './utils/securityUtils';

const SESSION_KEY = STORAGE_KEYS.SESSION;
const USER_KEY = STORAGE_KEYS.USER;
const DB_KEY = STORAGE_KEYS.QUESTIONS;

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [studentSession, setStudentSession] = useState<Session | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  // Deep Linking for Student QR Code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('access');
    if (code && !studentSession && view === 'HOME') {
      secureLog(`Deep Link detected: Attempting auto-join for code ${code}`);
      handleJoinSession(code);
    }
  }, [activeSession, db]); // Check on load once db is ready

  // Sync across devices via Firebase and initial load
  useEffect(() => {
    // 1. Static User Data (Local Only)
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        handleGenericError(e, "Session expired. Please log in again.");
      }
    }

    // 2. Real-time Session Sync via Firebase
    if (!db) {
      secureLog("Firebase database not initialized. Sync skipped.");
      return;
    }

    const sessionRef = ref(db, 'active_session');

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      const session: Session | null = data || null;

      setActiveSession(session);

      // Restore view if we are faculty and have an active session
      if (session && session.status === 'active' && !studentSession) {
        let user = null;
        try {
          user = savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
          secureLog("Failed to parse saved user during sync", e);
        }

        if (user && user.role === 'FACULTY' && view === 'HOME') {
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
    const facultyUser: User = {
      id: 'faculty_admin',
      email: 'admin@umak.edu.ph',
      name: 'Faculty Administrator',
      role: 'FACULTY'
    };
    setCurrentUser(facultyUser);
    localStorage.setItem(USER_KEY, JSON.stringify(facultyUser));
    setView('FACULTY_DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
    setView('HOME');
  };

  const saveToDatabase = (assessment: Assessment) => {
    const db = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const existingIdx = db.findIndex((a: Assessment) => a.id === assessment.id);

    if (existingIdx > -1) {
      db[existingIdx] = { ...assessment, creatorId: currentUser?.id };
    } else {
      db.push({ ...assessment, creatorId: currentUser?.id });
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
      };

      // Ensure we clear any old active session reference first
      await set(ref(db, 'active_session'), null);

      // Push the new session
      await set(ref(db, 'active_session'), newSession);

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

  const handleStudentSubmit = async (responseIndex: any) => {
    const sessionRef = ref(db, 'active_session');

    try {
      const snapshot = await get(sessionRef);
      const session: Session = snapshot.val();
      if (!session || session.status !== 'active') return;

      const qIdx = session.currentQuestionIndex || 0;

      // 1. Session Integrity Check (Defensive)
      const { validateSessionIntegrity, sanitizeInput } = await import('./utils/securityUtils');
      if (!validateSessionIntegrity(session.id)) {
        throw new Error("Security Violation: Session fingerprint mismatch.");
      }

      const { increment } = await import('./firebase');
      const updates: any = {};
      updates['participantsCount'] = increment(1);

      if (typeof responseIndex === 'number') {
        updates[`allResponses/${qIdx}/${responseIndex}`] = increment(1);
      } else if (Array.isArray(responseIndex)) {
        const currentRankings = (session.allResponses && session.allResponses[qIdx] && session.allResponses[qIdx].rankings) || [];
        updates[`allResponses/${qIdx}/rankings`] = [...currentRankings, responseIndex];
      } else {
        const currentTexts = (session.allResponses && session.allResponses[qIdx] && session.allResponses[qIdx].text) || [];
        const sanitizedResponse = sanitizeInput(responseIndex);
        updates[`allResponses/${qIdx}/text`] = [...currentTexts, sanitizedResponse];
      }

      await update(sessionRef, updates);
    } catch (e) {
      handleGenericError(e, "Failed to submit your response. Please check your connection.");
    }
  };

  const handleJoinSession = async (code: string, honeypotValue = '') => {
    const normalizedCode = code.trim().toUpperCase();

    // Antigravity Honeypot Check
    if (honeypotValue) {
      secureLog("Bot detected via honeymoon field.");
      return;
    }

    try {
      const snapshot = await get(ref(db, 'active_session'));
      const session: Session | null = snapshot.val();

      if (session) {
        if (String(session.accessCode).trim().toUpperCase() === normalizedCode) {
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
          alert(`Access Denied: The code "${normalizedCode}" does not match.`);
        }
      } else {
        alert('Entry Failed: There are no active academic sessions detected.');
      }
    } catch (e) {
      handleGenericError(e, "An error occurred while joining the session.");
    }
  };

  const renderView = () => {
    switch (view) {
      case 'HOME':
        return <Home setView={setView} onJoin={handleJoinSession} onEnterFaculty={handleEnterFacultyMode} />;
      case 'FACULTY_DASHBOARD':
        return currentUser?.role === 'FACULTY' ? (
          <FacultyDashboard
            user={currentUser}
            onCreateNew={() => { setEditingAssessment(null); setView('FACULTY_CREATE'); }}
            onStartSession={handleCreateSession}
            onEditDraft={(q: any) => { setEditingAssessment(q); setView('FACULTY_EDIT'); }}
          />
        ) : <Home setView={setView} onJoin={handleJoinSession} />;
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
            set(ref(db, 'active_session'), null);
            setActiveSession(null);
            setView('FACULTY_DASHBOARD');
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
        if (!studentSession) return <Home setView={setView} onJoin={handleJoinSession} />;
        return (
          <StudentPoll
            key={studentSession.id}
            session={studentSession}
            onSubmit={handleStudentSubmit}
            onFinished={() => {
              setStudentSession(null);
              setView('HOME');
            }}
          />
        );
      default:
        return <Home setView={setView} onJoin={handleJoinSession} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        currentUser={currentUser}
        onHome={() => setView('HOME')}
        onEnterFaculty={handleEnterFacultyMode}
        onDashboard={() => setView('FACULTY_DASHBOARD')}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
