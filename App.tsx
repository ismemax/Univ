
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

const SESSION_KEY = 'umak_active_session';
const USER_KEY = 'umak_user';
const DB_KEY = 'umak_db_questions';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [studentSession, setStudentSession] = useState<Session | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    // Initial Load
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const loadSession = () => {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        setActiveSession(JSON.parse(saved));
      } else {
        setActiveSession(null);
      }
    };

    loadSession();

    // Sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        loadSession();
      }
      if (e.key === USER_KEY) {
        const user = e.newValue ? JSON.parse(e.newValue) : null;
        setCurrentUser(user);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    const normalizedCode = code.trim();

    if (saved) {
      const session: Session = JSON.parse(saved);
      if (session.accessCode === normalizedCode && session.status !== 'ended') {
        setStudentSession(session);
        setView('STUDENT_POLL');
      } else {
        alert(`Access Denied: The code "${normalizedCode}" does not match any active sessions.`);
      }
    } else {
      alert('Entry Failed: There are no active academic sessions running at the moment.');
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
