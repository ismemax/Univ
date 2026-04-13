
import React, { useState, useEffect } from 'react';
import { Session, QuestionType } from '../types';
import { sanitizeInput, hasUserResponded, markUserResponded } from '../utils/securityUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StudentPollProps {
  session: Session;
  onRegister: (name: string) => void;
  onSubmit: (response: any, studentName?: string) => void;
  onFinished: () => void;
}

const StudentPoll: React.FC<StudentPollProps> = ({ session, onSubmit, onFinished }) => {
  const currentIdx = session.currentQuestionIndex || 0;
  const activeQ = session.questions[currentIdx];

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [studentName, setStudentName] = useState(() => localStorage.getItem(`umak_name_${session.id}`) || '');
  const [isNameSet, setIsNameSet] = useState(() => {
    if (!session.requireStudentName) return true;
    return !!localStorage.getItem(`umak_name_${session.id}`);
  });

  // Initialize timeLeft
  const getInitialTime = () => {
    if (!session.startTime || session.status === 'waiting' || !activeQ) return activeQ?.timeLimit || 60;
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    return Math.max(0, activeQ.timeLimit - elapsed);
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime());

  // Reset local state when question changes
  useEffect(() => {
    setHasSubmitted(false);
    setAlreadyVoted(false);
    setSelectedOption(null);
    setTimeLeft(activeQ.timeLimit);

    // Check for previous submission for THIS specific question
    if (session.preventMultipleResponses && hasUserResponded(session.id, currentIdx)) {
      setAlreadyVoted(true);
      setHasSubmitted(true);
    }
  }, [currentIdx, session.id]);

  useEffect(() => {
    if (!session || !activeQ) return;

    if (session.status !== 'active' && session.status !== 'paused') {
      if (session.status === 'waiting') setTimeLeft(activeQ.timeLimit);
      return;
    }

    if (session.status === 'paused') {
      // Don't start interval if paused, but also don't reset time
      return;
    }

    const syncTime = () => {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      const remaining = Math.max(0, activeQ.timeLimit - elapsed);
      setTimeLeft(remaining);
      return remaining;
    };

    syncTime();
    const timer = setInterval(() => {
      const remaining = syncTime();
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [session.status, session.startTime, session.id, currentIdx, activeQ.timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (selectedOption === null || (typeof selectedOption === 'string' && !selectedOption.trim())) {
      return alert('Please provide a response.');
    }

    if (session.preventMultipleResponses) {
      markUserResponded(session.id, currentIdx);
    }

    const secureResponse = typeof selectedOption === 'string' ? sanitizeInput(selectedOption) : selectedOption;
    onSubmit(secureResponse, session.requireStudentName ? studentName : undefined);
    setHasSubmitted(true);
  };

  const chartData = React.useMemo(() => {
    if (!activeQ || !activeQ.options || activeQ.options.length === 0) return [];
    const responses = (session.allResponses && session.allResponses[currentIdx]) || {};

    return activeQ.options.map((opt, i) => {
      let val = 0;
      if (activeQ.type === 'RANKING') {
        const rankings = responses.rankings || [];
        val = rankings.reduce((acc: number, r: number[]) => {
          const pos = r.indexOf(i);
          return pos === -1 ? acc : acc + (activeQ.options.length - pos);
        }, 0);
      } else {
        val = responses[i] || 0;
      }
      return { name: opt, value: val };
    });
  }, [session.allResponses, currentIdx, activeQ]);

  const COLORS_PALETTE = ['#004A98', '#FDB813', '#47528A', '#28336B', '#060E33'];
  const hasData = chartData.some(d => d.value > 0);

  const renderResults = () => (
    <div className="py-6 flex flex-col items-center">
      <div className="w-full h-64 mb-8">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationDuration={800}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontWeight: '900', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend
                wrapperStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '9px' }}
                layout="horizontal" verticalAlign="bottom" align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            <p className="text-xs font-black uppercase tracking-widest">No Responses Captured</p>
          </div>
        )}
      </div>
      <div className="space-y-4 w-full px-4 text-left">
        {activeQ.options && chartData.map((data, i) => {
          const total = chartData.reduce((acc, d) => acc + d.value, 0);
          const pct = total > 0 ? Math.round((data.value / total) * 100) : 0;
          return (
            <div key={i}>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                <span className="text-slate-500 pr-4">{data.name}</span>
                <span className="text-umak-blue">{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-umak-blue transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderInput = () => {
    switch (activeQ.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
      case QuestionType.RATING_SCALE:
        return (
          <div className="space-y-4">
            {(activeQ.options || []).map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedOption(i)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-black flex items-center justify-between text-lg shadow-sm ${selectedOption === i
                  ? 'border-umak-blue bg-umak-blue/10 text-umak-blue'
                  : 'border-slate-200 hover:border-umak-blue/40 text-slate-700 bg-white'
                  }`}
              >
                <span className="break-words mr-4">{opt}</span>
                {selectedOption === i && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        );
      case QuestionType.SHORT_ANSWER:
        return (
          <input
            type="text"
            placeholder="Type your response here..."
            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 text-xl font-black text-slate-900 focus:outline-none focus:border-umak-blue focus:ring-4 focus:ring-umak-blue/5 transition-all placeholder:text-slate-300"
            onChange={(e) => setSelectedOption(e.target.value)}
          />
        );
      case QuestionType.ESSAY:
        return (
          <textarea
            placeholder="Type your comprehensive response here..."
            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-6 h-60 text-xl font-black text-slate-900 focus:outline-none focus:border-umak-blue focus:ring-4 focus:ring-umak-blue/5 transition-all placeholder:text-slate-300"
            onChange={(e) => setSelectedOption(e.target.value)}
          />
        );
      case QuestionType.RANKING: {
        const ranking = Array.isArray(selectedOption) ? selectedOption : [];
        const unrankedIndices = (activeQ.options || []).map((_, i) => i).filter(i => !ranking.includes(i));

        const handleAdd = (idx: number) => {
          setSelectedOption([...ranking, idx]);
        };

        const handleRemove = (idx: number) => {
          setSelectedOption(ranking.filter(r => r !== idx));
        };

        return (
          <div className="space-y-8">
            {/* Stage 1: Current Ranking */}
            {ranking.length > 0 && (
              <div className="bg-umak-blue/5 border-2 border-dashed border-umak-blue/20 rounded-[32px] p-6 animate-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h4 className="text-[10px] font-black text-umak-blue uppercase tracking-widest">Your Priority Order</h4>
                  <button onClick={() => setSelectedOption([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Reset All</button>
                </div>
                <div className="space-y-3">
                  {ranking.map((optIdx, rank) => (
                    <div key={`ranked-${optIdx}`} className="bg-white border-2 border-umak-blue p-4 rounded-2xl flex items-center gap-4 shadow-sm animate-in fade-in zoom-in-95">
                      <div className="w-8 h-8 bg-umak-blue text-white rounded-lg flex items-center justify-center font-black text-sm">
                        {rank + 1}
                      </div>
                      <span className="flex-grow font-black text-slate-800 text-sm break-words">{activeQ.options[optIdx]}</span>
                      <button onClick={() => handleRemove(optIdx)} className="text-slate-300 hover:text-red-500 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 2: Available Choices */}
            <div className="space-y-4">
              <div className="px-2">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-relaxed">
                  {ranking.length === 0 ? 'Start by selecting your top choice' : `Select item for Rank #${ranking.length + 1}`}
                </p>
              </div>
              <div className="grid gap-3">
                {unrankedIndices.map((idx) => (
                  <button
                    key={`available-${idx}`}
                    onClick={() => handleAdd(idx)}
                    className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-umak-blue/40 hover:bg-slate-50 transition-all font-black flex items-center justify-between text-lg group shadow-sm"
                  >
                    <span className="text-slate-700 group-hover:text-umak-blue">{activeQ.options[idx]}</span>
                    <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-umak-blue/10 group-hover:border-umak-blue/20 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-200 group-hover:text-umak-blue" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {ranking.length > 0 && ranking.length < activeQ.options.length && (
              <div className="pt-4 flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {[...Array(activeQ.options.length)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i < ranking.length ? 'bg-umak-blue w-4' : 'bg-slate-200'}`}></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (!session || !activeQ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-black text-umak-blue uppercase tracking-widest text-xs">Authenticating Session...</div>
      </div>
    );
  }

  if (!isNameSet && session.requireStudentName) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20">
        <div className="bg-white border-2 border-slate-200 rounded-[40px] shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-umak-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-umak-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-umak-navy mb-4 uppercase tracking-tight">Student Identity</h2>
          <p className="text-slate-600 font-bold mb-10 text-sm leading-relaxed uppercase tracking-widest">The instructor has requested participant identification for this academic session.</p>
          
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
              <input
                type="text"
                placeholder="Last Name, First Name M.I."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 py-4 px-6 rounded-2xl text-slate-900 font-bold focus:border-umak-blue focus:ring-4 focus:ring-umak-blue/5 transition-all outline-none text-center"
                autoFocus
              />
            </div>
            
            <button
              onClick={() => {
                if (studentName.trim().length < 3) return alert('Please enter your full name (minimum 3 characters)');
                localStorage.setItem(`umak_name_${session.id}`, studentName);
                onRegister(studentName);
                setIsNameSet(true);
              }}
              className="w-full bg-umak-blue text-white font-black py-5 rounded-2xl hover:bg-umak-navy transition-all shadow-xl shadow-umak-blue/20 uppercase text-xs tracking-[0.2em]"
            >
              Continue to Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session.status === 'waiting') {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <div className="bg-umak-blue h-full w-1/3 animate-[loading_2s_infinite]"></div>
          </div>
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-umak-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-umak-navy mb-4 uppercase tracking-tight">Connected</h2>
          <p className="text-slate-600 font-bold mb-2 text-lg">You have successfully joined the session.</p>
          <p className="text-umak-blue/60 font-black text-[10px] uppercase tracking-widest mb-10 italic">Logged in as: {studentName || 'Anonymous Participant'}</p>
        </div>
      </div>
    );
  }

  if (timeLeft === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white border-2 border-slate-200 rounded-[40px] shadow-2xl p-10 text-center">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black text-umak-blue uppercase tracking-widest bg-umak-blue/5 px-3 py-1 rounded-md">
              Discussion Results
            </span>
            <div className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
              Time Expired
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-umak-navy mb-2 break-words">{activeQ.text}</h2>
          <p className="text-slate-400 text-xs font-bold mb-8 italic uppercase tracking-wider">The response window has closed.</p>

          {renderResults()}

          <div className="mt-10 pt-8 border-t border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
              {currentIdx < session.questions.length - 1 ? 'Prepare for Next Question...' : 'Assessment Finalized'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="bg-white border-2 border-slate-200 rounded-[40px] shadow-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="bg-umak-yellow h-full transition-all duration-1000 ease-linear shadow-sm" style={{ width: `${(timeLeft / activeQ.timeLimit) * 100}%` }}></div>
        </div>

        <div className="flex justify-between items-center mb-12 mt-4">
          <span className="text-xs font-black text-umak-blue uppercase tracking-[0.2em] bg-umak-blue/5 px-3 py-1 rounded-md">
            {session.status === 'waiting' ? 'LOBBY' : `QUESTION ${currentIdx + 1} OF ${session.questions.length}`}
          </span>
          <div className={`${session.status === 'paused' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'} px-4 py-1.5 rounded-xl text-sm font-black flex items-center gap-2 border transition-colors`}>
            <span className={`w-2.5 h-2.5 ${session.status === 'paused' ? 'bg-amber-600' : 'bg-red-600 animate-pulse'} rounded-full shadow-sm`}></span>
            {session.status === 'waiting' ? '--:--' : session.status === 'paused' ? 'PAUSED' : formatTime(timeLeft)}
          </div>
        </div>

        <h2 className="text-3xl font-serif font-bold text-umak-navy mb-12 leading-tight tracking-tight break-words">
          {session.status === 'waiting' ? (
            <span className="text-slate-300 italic flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Assessment Question Locked
            </span>
          ) : activeQ.text}
        </h2>

        {!hasSubmitted ? (
          <div className="space-y-8">
            {renderInput()}
            <button
              onClick={handleSubmit}
              disabled={session.status === 'paused'}
              className={`w-full py-5 rounded-2xl font-black mt-8 shadow-xl transition-all uppercase tracking-widest text-lg ${session.status === 'paused'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-umak-blue text-white shadow-umak-blue/30 active:scale-[0.98]'
                }`}
            >
              {session.status === 'paused' ? 'Submission Paused' : 'Submit Response'}
            </button>
          </div>
        ) : (
          <div className="py-14 flex flex-col items-center text-center">
            <div className={`w-24 h-24 ${alreadyVoted ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'} rounded-3xl flex items-center justify-center mb-8 shadow-sm`}>
              {alreadyVoted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <h3 className="text-3xl font-serif font-bold text-umak-navy mb-4 uppercase tracking-tight">
              {alreadyVoted ? 'Access Restricted' : 'Response Confirmed'}
            </h3>
            <p className="text-slate-600 font-bold mb-12 text-lg leading-relaxed">
              {alreadyVoted
                ? 'Multiple entries are disabled. You have already submitted for this question.'
                : 'Your response for this question is locked in. Please wait for the instructor to advance.'}
            </p>
            {currentIdx === session.questions.length - 1 && session.status === 'ended' && (
              <button onClick={onFinished} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">Back to Home</button>
            )}
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {currentIdx < session.questions.length - 1 ? 'Waiting for Next Question...' : 'Assessment Complete'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPoll;
