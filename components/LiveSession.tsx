
import React, { useState, useEffect, useMemo } from 'react';
import { Session } from '../types';
import { Icons, STORAGE_KEYS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
  const [timeLeft, setTimeLeft] = useState(initialSession.question.timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sync state when initialSession changes (e.g., from another tab or restart)
  useEffect(() => {
    setSession(initialSession);
    setTimeLeft(initialSession.question.timeLimit);
  }, [initialSession]);

  // Timer Effect: Decrement timeLeft every second
  useEffect(() => {
    if (timeLeft <= 0 || session.status === 'ended' || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        // When timer reaches 0, end the session
        if (newTime === 0 && session.status !== 'ended') {
          setSession(current => {
            const endedSession = { ...current, status: 'ended' as const };
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(endedSession));
            return endedSession;
          });
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, session.status, isPaused]);

  // Automatically clear old notifications after 4 seconds
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      setNotifications(prev => prev.slice(0, prev.length - 1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [notifications]);

  const chartData = useMemo(() => {
    if (!session || !session.question || !session.question.options) return [];
    const responses = session.responses || {};
    return session.question.options.map((opt, i) => ({
      name: opt,
      value: responses[i] || 0
    }));
  }, [session]);

  const COLORS_PALETTE = ['#004A98', '#FACC15', '#64748b', '#94a3b8', '#cbd5e1'];

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `umak_session_${session.accessCode}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      {/* Toast Notifications */}
      <div className="fixed top-24 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-white border-l-4 border-[#004A98] shadow-xl px-6 py-4 rounded-r-xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 pointer-events-auto"
          >
            <div className="w-8 h-8 bg-[#004A98]/10 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-[#004A98] rounded-full animate-ping"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900">{n.message}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Just now</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Stats & Session Info */}
        <div className="flex-1 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-[#004A98] uppercase tracking-widest block">Live Session Active</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">{session.question.text}</h2>
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
                <span className="text-xs font-black text-[#004A98]/70 uppercase mb-2">Total Responses</span>
                <span className="text-5xl font-black text-[#004A98]">{session.participantsCount}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex-1 py-4 rounded-xl font-black uppercase text-xs tracking-widest border-2 transition-all ${isPaused
                  ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {isPaused ? 'Resume Session' : 'Pause Session'}
              </button>
              <button
                onClick={onEnd}
                className="flex-1 bg-white border-2 border-red-200 text-red-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-50 transition-colors"
              >
                Terminate Poll
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-wide">Real-time Breakdown</h3>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Updates automatically</div>
            </div>
            <div className="space-y-6">
              {session.question.options.map((opt, i) => {
                const responses = session.responses || {};
                const count = responses[i] || 0;
                const pct = session.participantsCount > 0 ? (count / session.participantsCount * 100).toFixed(0) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-black text-slate-800">{opt}</span>
                      <span className="font-black text-[#004A98]">{count} Responded ({pct}%)</span>
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
            <button className="text-xs font-black text-[#004A98] hover:underline uppercase tracking-widest opacity-60">Share Session Image</button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-[360px] flex flex-col">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-wide">Live Trends</h3>
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
              Export Results as JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LiveSession;
