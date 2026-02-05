
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Icons } from '../constants';

interface HomeProps {
  setView: (v: ViewState) => void;
  onJoin: (code: string) => void;
}

const Home: React.FC<HomeProps> = ({ setView, onJoin }) => {
  const [code, setCode] = useState('');

  const handleJoinClick = () => {
    if (code.length === 4) {
      onJoin(code);
    } else {
      alert('Please enter a valid 4-digit code');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
      {/* Hero Section */}
      <div className="mb-16">
        <div className="w-28 h-28 bg-umak-blue/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-umak-yellow/20">
          <div className="w-24 h-24 bg-umak-navy rounded-full flex items-center justify-center shadow-lg border-2 border-umak-yellow">
            <span className="text-umak-yellow font-serif font-bold text-5xl pt-1">U</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-umak-navy mb-6 tracking-tight">Academic Questionnaire System</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          An official platform designed for the UMak community to facilitate modern academic assessments and research surveys.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">

        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all flex flex-col items-center hover:border-umak-blue/20 group">
          <div className="bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 transition-colors">
            <Icons.Book className="w-8 h-8 text-umak-blue" />
          </div>
          <h2 className="text-xl font-bold text-umak-navy mb-4">Faculty Portal</h2>
          <p className="text-slate-500 mb-10 text-sm leading-relaxed text-center max-w-xs">
            Create and manage academic questionnaires, analyze student responses, and export detailed reports for your courses.
          </p>
          <button
            onClick={() => setView('FACULTY_CREATE')}
            className="w-full bg-umak-navy text-white font-bold py-4 rounded-lg hover:bg-umak-blue transition-all uppercase text-xs tracking-widest shadow-lg shadow-umak-navy/20"
          >
            Create Questionnaire
          </button>
        </div>

        {/* Student Portal */}
        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all flex flex-col items-center hover:border-umak-yellow/20 group">
          <div className="bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-yellow-50 transition-colors">
            <Icons.IDBadge className="w-8 h-8 text-umak-blue" />
          </div>
          <h2 className="text-xl font-bold text-umak-navy mb-4">Student Portal</h2>
          <p className="text-slate-500 mb-10 text-sm leading-relaxed text-center max-w-xs">
            Access assigned surveys, participate in classroom polls, and review your personal assessment history.
          </p>

          <button
            onClick={() => {
              const code = prompt("Please enter your 4-digit access code:");
              if (code) onJoin(code);
            }}
            className="w-full bg-white border border-umak-navy text-umak-navy font-bold py-4 rounded-lg hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
          >
            Enter Access Code
          </button>
        </div>
      </div >

      <div className="mt-20 w-24 h-1.5 bg-umak-yellow rounded-full opacity-60"></div>
    </div >
  );
};

export default Home;
