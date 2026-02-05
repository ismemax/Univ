
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

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [studentSession, setStudentSession] = useState<Session | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('umak_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const checkSession = () => {
      const saved = localStorage.getItem('umak_active_session');
      if (saved) setActiveSession(JSON.parse(saved));
    };
    checkSession();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('umak_user', JSON.stringify(user));
    setView(user.role === 'FACULTY' ? 'FACULTY_DASHBOARD' : 'HOME');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('umak_user');
    setView('HOME');
  };

  const saveToDatabase = (question: Question) => {
    const db = JSON.parse(localStorage.getItem('umak_db_questions') || '[]');
    const existingIdx = db.findIndex((q: Question) => q.id === question.id);
    
    if (existingIdx > -1) {
      db[existingIdx] = { ...question, creatorId: currentUser?.id };
    } else {
      db.push({ ...question, creatorId: currentUser?.id });
    }
    
    localStorage.setItem('umak_db_questions', JSON.stringify(db));
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
    localStorage.setItem('umak_active_session', JSON.stringify(newSession));
    setActiveSession(newSession);
    setView('FACULTY_LIVE');
  };

  const handleEditDraft = (question: Question) => {
    setEditingQuestion(question);
    setView('FACULTY_EDIT');
  };

  const handleJoinSession = (code: string) => {
    const saved = localStorage.getItem('umak_active_session');
    if (saved) {
      const session: Session = JSON.parse(saved);
      if (session.accessCode === code && session.status !== 'ended') {
        setStudentSession(session);
        setView('STUDENT_POLL');
      } else {
        alert('Invalid or expired session code.');
      }
    } else {
      alert('No active session found.');
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
            localStorage.removeItem('umak_active_session');
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
