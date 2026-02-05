
import React, { useState, useEffect, useMemo } from 'react';
import { Session } from '../types';
import { Icons, STORAGE_KEYS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { db, ref, update } from '../firebase';

interface Notification {
  id: string;
  message: string;
  timestamp: number;
}

interface LiveSessionProps {
  session: Session;
  onEnd: () => void;
}

const LiveSession: React.FC<LiveSessionProps> = ({ session: initialSession, onEnd }) => {
  const [session, setSession] = useState<Session>(initialSession);
  const currentIdx = session.currentQuestionIndex || 0;
  const activeQ = session.questions[currentIdx];

  const [timeLeft, setTimeLeft] = useState(activeQ.timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sync state when initialSession changes
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  // Timer Effect
  useEffect(() => {
    if (session.status === 'ended' || isPaused || session.status === 'waiting' || !session.startTime) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      const remainingTime = Math.max(0, activeQ.timeLimit - elapsed);

      setTimeLeft(remainingTime);

      // When timer reaches 0, we don't end entire session automatically if more questions exist
      // But for simple consistency, we'll mark this specific question phase as "ended-looking" or just stop timer
      if (remainingTime === 0 && session.status !== 'ended') {
        // We can just leave it at 0. The teacher manually goes to next.
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session.status, isPaused, session.startTime, activeQ.timeLimit]);

  const chartData = useMemo(() => {
    if (!activeQ || !activeQ.options) return [];
    const responses = (session.allResponses && session.allResponses[currentIdx]) || {};
    return activeQ.options.map((opt, i) => ({
      name: opt,
      value: responses[i] || 0
    }));
  }, [session, currentIdx, activeQ]);

  const COLORS_PALETTE = ['#004A98', '#FACC15', '#64748b', '#94a3b8', '#cbd5e1'];

  const handleStartSession = async () => {
    const sessionRef = ref(db, 'active_session');
    await update(sessionRef, {
      status: 'active',
      isStarted: true,
      startTime: Date.now()
    });
  };

  const handleNextQuestion = async () => {
    if (currentIdx >= session.questions.length - 1) return;

    const sessionRef = ref(db, 'active_session');
    await update(sessionRef, {
      currentQuestionIndex: currentIdx + 1,
      startTime: Date.now(), // Reset timer for next question
      status: 'active'
    });
    setTimeLeft(session.questions[currentIdx + 1].timeLimit);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `umak_session_${session.accessCode}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!session || !activeQ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Stats & Session Info */}
        <div className="flex-1 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-[#004A98] uppercase tracking-widest block">
                    Question {currentIdx + 1} of {session.questions.length}
                  </span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">{activeQ.text}</h2>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-500 block">Access Code</span>
                <div className="text-4xl font-black text-[#004A98] tracking-widest">{session.accessCode}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center border-2 border-slate-100">
                <span className="text-xs font-black text-slate-500 uppercase mb-2">Time Remaining</span>
                <span className={`text-5xl font-black ${timeLeft < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="bg-white border-2 border-[#004A98]/10 rounded-xl p-6 flex flex-col items-center justify-center">
                <span className="text-xs font-black text-[#004A98]/70 uppercase mb-2">Total Participants</span>
                <span className="text-5xl font-black text-[#004A98]">{session.participantsCount}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              {session.status === 'waiting' ? (
                <button
                  onClick={handleStartSession}
                  className="flex-1 bg-[#004A98] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#004A98]/20 hover:bg-[#003875] transition-all"
                >
                  Start Assessment Now
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`flex-1 py-4 rounded-xl font-black uppercase text-xs tracking-widest border-2 transition-all ${isPaused
                      ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  {currentIdx < session.questions.length - 1 && (
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 bg-[#FACC15] text-[#004A98] py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-yellow-400 transition-all border-2 border-yellow-300"
                    >
                      Next Question
                    </button>
                  )}
                </>
              )}
              <button
                onClick={onEnd}
                className="flex-1 bg-white border-2 border-red-200 text-red-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-50 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-wide">Question Breakdown</h3>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Active Live Metrics</div>
            </div>
            <div className="space-y-6">
              {(activeQ.options || []).map((opt: string, i: number) => {
                const qResponses = (session.allResponses && session.allResponses[currentIdx]) || {};

                let count = 0;
                let pct = 0;
                let label = "Responded";

                if (activeQ.type === 'RANKING') {
                  const rankings = qResponses.rankings || [];
                  // Calculate weighted score: sum of (Total Options - Rank Position)
                  const totalRanks = rankings.length;
                  const scoreSum = rankings.reduce((acc: number, r: number[]) => {
                    const pos = r.indexOf(i);
                    if (pos === -1) return acc;
                    return acc + (activeQ.options.length - pos);
                  }, 0);

                  const maxPossibleScore = totalRanks * activeQ.options.length;
                  pct = maxPossibleScore > 0 ? Math.round((scoreSum / maxPossibleScore) * 100) : 0;
                  label = "Priority Score";
                  count = scoreSum;
                } else {
                  count = qResponses[i] || 0;
                  const total = Object.values(qResponses).reduce((a: any, b: any) => {
                    if (typeof b === 'number') return a + b;
                    return a + (Array.isArray(b) ? b.length : 0);
                  }, 0) as number;
                  pct = total > 0 ? Math.round((count / total) * 100) : 0;
                }

                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-black text-slate-800">{opt}</span>
                      <span className="font-black text-[#004A98]">{count} {label} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-[#004A98] h-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {(activeQ.type === 'SHORT_ANSWER' || activeQ.type === 'ESSAY') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-wide">Open Responses (Q{currentIdx + 1})</h3>
                <div className="text-[10px] font-black text-[#004A98] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {(session.allResponses && session.allResponses[currentIdx]?.text?.length) || 0} Submissions
                </div>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {session.allResponses && session.allResponses[currentIdx]?.text?.length > 0 ? (
                  session.allResponses[currentIdx].text.slice().reverse().map((txt: string, i: number) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-slate-800 font-bold text-sm leading-relaxed">{txt}</p>
                      <span className="text-[9px] font-black text-slate-400 uppercase mt-2 block tracking-widest">Received recently</span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 font-bold text-sm italic">Waiting for students to type...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Visuals & Actions */}
        <div className="lg:w-[400px] space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
            <div className="p-6 bg-white rounded-2xl mb-4 border-2 border-slate-100 shadow-inner">
              <Icons.QR />
            </div>
            <h3 className="font-black text-[#004A98] mb-1 text-lg uppercase tracking-tight">Access QR Code</h3>
            <p className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Scan to participate</p>
            <div className="bg-slate-900 py-3 px-6 rounded-lg text-sm font-black text-[#FACC15] mb-8 w-full shadow-lg">
              umak.edu.ph/poll/{session.accessCode}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-[360px] flex flex-col">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-wide">Live Trend Chart</h3>
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontWeight: '900', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend
                    wrapperStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                    layout="horizontal" verticalAlign="bottom" align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleExport}
              className="w-full bg-white border-2 border-slate-200 py-4 rounded-xl font-black text-slate-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#004A98]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
