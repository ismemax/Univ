
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
        <div className="w-24 h-24 bg-[#004A98] border-[3px] border-[#FACC15] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <span className="text-white font-bold text-4xl">U</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#004A98] mb-6 tracking-tight">Academic Questionnaire System</h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          An official platform designed for the UMak community to facilitate modern academic assessments and research surveys.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Faculty Portal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center border-b-4 border-b-[#004A98]">
          <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 border border-slate-100">
            <Icons.Book />
          </div>
          <h2 className="text-2xl font-black text-[#004A98] mb-4 uppercase tracking-tight">Faculty Portal</h2>
          <p className="text-slate-600 mb-10 text-sm leading-relaxed text-center font-semibold">
            Create and manage academic questionnaires, analyze student responses, and export detailed reports for your courses.
          </p>
          <button 
            onClick={() => setView('FACULTY_CREATE')}
            className="w-full bg-[#004A98] text-white font-black py-4 rounded-xl hover:bg-[#003875] transition-all uppercase text-sm tracking-widest mt-auto shadow-lg shadow-[#004A98]/20 active:scale-95"
          >
            Create Questionnaire
          </button>
        </div>

        {/* Student Portal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center border-b-4 border-b-[#FACC15]">
          <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 border border-slate-100">
            <Icons.IDBadge />
          </div>
          <h2 className="text-2xl font-black text-[#004A98] mb-4 uppercase tracking-tight">Student Portal</h2>
          <p className="text-slate-600 mb-10 text-sm leading-relaxed text-center font-semibold">
            Access assigned surveys, participate in classroom polls, and review your personal assessment history.
          </p>
          
          <div className="w-full mt-auto space-y-4">
            <input 
              type="text" 
              maxLength={4}
              placeholder="ENTER 4-DIGIT CODE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinClick()}
              className="w-full bg-white border-2 border-slate-300 py-4 px-4 rounded-xl text-center font-black text-2xl text-[#004A98] focus:outline-none focus:ring-4 focus:ring-[#004A98]/5 focus:border-[#004A98] transition-all placeholder:font-bold placeholder:text-slate-300 tracking-[0.5em]"
            />
            <button 
              onClick={handleJoinClick}
              className="w-full border-2 border-[#004A98] text-[#004A98] font-black py-4 rounded-xl hover:bg-[#004A98] hover:text-white transition-all uppercase text-sm tracking-widest active:scale-95"
            >
              Enter Access Code
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20 w-24 h-1.5 bg-[#FACC15] rounded-full opacity-60"></div>
    </div>
  );
};

export default Home;
