
import React, { useState } from 'react';
import { ViewState } from '../types';
import { Icons } from '../constants';

interface HomeProps {
  setView: (v: ViewState) => void;
  onJoin: (code: string) => void;
  onEnterFaculty: () => void;
}

const Home: React.FC<HomeProps> = ({ setView, onJoin, onEnterFaculty }) => {
  const [code, setCode] = useState('');

  const handleJoinClick = () => {
    if (code.length === 4) {
      onJoin(code);
    } else {
      alert('Please enter a valid 4-digit code');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center text-center">
      {/* Hero Section */}
      <div className="mb-16">
        <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8 animate-fade-in bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <img
            src="/umak-logo.png"
            alt="UMak Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-umak-navy mb-6 tracking-tight">Academic Discussion Board</h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed font-semibold">
          Scan the QR or enter the access code provided by your instructor to join the live session.
        </p>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-lg bg-white border-2 border-slate-100 rounded-[40px] p-10 shadow-2xl relative">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active System</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-umak-yellow/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-8">
            <Icons.IDBadge />
          </div>

          <h2 className="text-2xl font-serif font-bold text-umak-navy mb-8 uppercase tracking-widest">Join Session</h2>

          <div className="w-full space-y-6">
            <div className="relative">
              <input
                type="text"
                maxLength={4}
                placeholder="PROCTOR CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinClick()}
                className="w-full bg-slate-50 border-2 border-slate-100 py-6 px-4 rounded-[32px] text-center font-black text-4xl text-umak-blue focus:outline-none focus:ring-8 focus:ring-umak-blue/5 focus:border-umak-blue transition-all placeholder:font-black placeholder:text-slate-200 tracking-[0.4em]"
              />
            </div>

            <button
              onClick={handleJoinClick}
              className="w-full bg-umak-blue text-white font-black py-6 rounded-[32px] hover:bg-umak-navy transition-all uppercase text-sm tracking-[0.2em] shadow-xl shadow-umak-blue/30 active:scale-95"
            >
              Enter Discussion
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Faculty Link */}
      <div className="mt-12 flex flex-col items-center gap-6">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Technology Division</p>
        <button
          onClick={onEnterFaculty}
          className="text-slate-300 hover:text-umak-blue text-[10px] font-black uppercase tracking-widest transition-colors py-2 px-4 border border-transparent hover:border-slate-100 rounded-full"
        >
          Teacher / Administrator Access
        </button>
      </div>

      <div className="mt-16 w-16 h-1.5 bg-umak-yellow rounded-full opacity-30"></div>
    </div>
  );
};

export default Home;
