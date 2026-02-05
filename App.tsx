
import React, { useState, useEffect } from 'react';
import { ViewState, Session, Question, User } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import FacultyDashboard from './components/FacultyDashboard';
import QuestionnaireCreator from './components/QuestionnaireCreator';
import LiveSession from './components/LiveSession';
import StudentPoll from './components/StudentPoll';

import { Icons, STORAGE_KEYS } from './constants';

const SESSION_KEY = STORAGE_KEYS.SESSION;
const USER_KEY = STORAGE_KEYS.USER;
const DB_KEY = STORAGE_KEYS.QUESTIONS;

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [studentSession, setStudentSession] = useState<Session | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Sync across tabs and initial load
  useEffect(() => {
    const loadSession = () => {
      const saved = localStorage.getItem(SESSION_KEY);
      let session: Session | null = null;
      try {
        session = saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.error("Failed to parse session", e);
      }

      setActiveSession(session);

      // Restore view if we are faculty and have an active session
      // This ensures that refreshing the page doesn't kick the faculty out of the live view
      if (session && session.status === 'active' && !studentSession) {
        const savedUser = localStorage.getItem(USER_KEY);
        const user = savedUser ? JSON.parse(savedUser) : null;
        if (user && user.role === 'FACULTY' && view === 'HOME') {
          setView('FACULTY_LIVE');
        }
      }

      // Update student session if they are currently viewing a poll
      setStudentSession(current => {
        if (!current) return null;
        if (!session || session.id !== current.id) {
          return null; // Session closed or replaced
        }
        return { ...current, ...session };
      });
    };

    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    loadSession();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_KEY || e.key === USER_KEY) {
        loadSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [view]); // Re-run when view changes to allow redirect logic to trigger

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setView(user.role === 'FACULTY' ? 'FACULTY_DASHBOARD' : 'HOME');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
    setView('HOME');
  };

  const saveToDatabase = (question: Question) => {
    const db = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const existingIdx = db.findIndex((q: Question) => q.id === question.id);

    if (existingIdx > -1) {
      db[existingIdx] = { ...question, creatorId: currentUser?.id };
    } else {
      db.push({ ...question, creatorId: currentUser?.id });
    }

    localStorage.setItem(DB_KEY, JSON.stringify(db));
  };

  const handleSaveDraft = (question: Question) => {
    saveToDatabase({ ...question, isDraft: true });
    setView('FACULTY_DASHBOARD');
  };

  const handleCreateSession = (question: Question) => {
    saveToDatabase({ ...question, isDraft: false });

    const newSession: Session = {
      id: Math.random().toString(36).substring(7),
      accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
      question,
      status: 'active',
      participantsCount: 0,
      responses: {},
      startTime: Date.now(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setActiveSession(newSession);
    setView('FACULTY_LIVE');

    // Trigger storage event for same tab if needed (optional, setActiveSession already does it)
  };

  const handleEditDraft = (question: Question) => {
    setEditingQuestion(question);
    setView('FACULTY_EDIT');
  };

  const handleJoinSession = (code: string) => {
    // Always refresh from storage to get latest
    const saved = localStorage.getItem(SESSION_KEY);
    const normalizedCode = code.trim().toUpperCase();

    if (saved) {
      try {
        const session: Session = JSON.parse(saved);
        // Robust comparison: normalize both sides to strings and trim
        if (String(session.accessCode).trim().toUpperCase() === normalizedCode) {
          if (session.status === 'ended') {
            alert('Session Ended: This session has already concluded. Please contact your instructor for a new session code.');
          } else {
            console.log("Success: Joining session", session.id);
            setStudentSession(session);
            setView('STUDENT_POLL');
          }
        } else {
          alert(`Access Denied: The code "${normalizedCode}" does not match any active sessions. Please verify the code and try again.`);
        }
      } catch (e) {
        console.error("Join error:", e);
        alert('Data Error: The active session data is corrupted. Please ask the instructor to restart the session.');
      }
    } else {
      alert('Entry Failed: There are no active academic sessions detected. Note: Sessions are shared only within the same browser origin.');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'HOME':
        return <Home setView={setView} onJoin={handleJoinSession} />;
      case 'LOGIN':
        return <Login onLogin={handleLogin} onCancel={() => setView('HOME')} />;
      case 'FACULTY_DASHBOARD':
        return currentUser?.role === 'FACULTY' ? (
          <FacultyDashboard
            user={currentUser}
            onCreateNew={() => { setEditingQuestion(null); setView('FACULTY_CREATE'); }}
            onStartSession={handleCreateSession}
            onEditDraft={handleEditDraft}
          />
        ) : <Home setView={setView} onJoin={handleJoinSession} />;
      case 'FACULTY_CREATE':
      case 'FACULTY_EDIT':
        return <QuestionnaireCreator
          initialData={editingQuestion || undefined}
          onCreate={handleCreateSession}
          onSaveDraft={handleSaveDraft}
          onCancel={() => setView('FACULTY_DASHBOARD')}
        />;
      case 'FACULTY_LIVE':
        return activeSession ? (
          <LiveSession session={activeSession} onEnd={() => {
            localStorage.removeItem(SESSION_KEY);
            setActiveSession(null);
            setView('FACULTY_DASHBOARD');
          }} />
        ) : <Home setView={setView} onJoin={handleJoinSession} />;
      case 'STUDENT_POLL':
        return studentSession ? (
          <StudentPoll session={studentSession} onFinished={() => {
            setStudentSession(null);
            setView('HOME');
          }} />
        ) : <Home setView={setView} onJoin={handleJoinSession} />;
      default:
        return <Home setView={setView} onJoin={handleJoinSession} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        currentUser={currentUser}
        onHome={() => setView('HOME')}
        onLogin={() => setView('LOGIN')}
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
