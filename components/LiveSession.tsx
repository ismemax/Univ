
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

  const handlePrintPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // -- Header --
      doc.setFillColor(0, 74, 152); // UMAK blue
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSITY OF MAKATI', 15, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL ACADEMIC ASSESSMENT REPORT', 15, 25);
      doc.text(`SESSION ID: ${session.accessCode} | DATE: ${new Date().toLocaleDateString()}`, 15, 32);

      let currentY = 55;

      // -- Metadata --
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(16);
      doc.text(session.questions[0]?.text.substring(0, 60) + '...', 15, currentY);
      currentY += 10;

      doc.setFontSize(11);
      doc.text(`Total Participants: ${session.participantsCount}`, 15, currentY);
      currentY += 15;

      // -- Questions Loop --
      for (const [idx, q] of session.questions.entries()) {
        if (currentY > 250) { doc.addPage(); currentY = 20; }

        doc.setFillColor(245, 245, 245);
        doc.rect(10, currentY - 5, pageWidth - 20, 10, 'F');
        doc.setTextColor(0, 74, 152);
        doc.setFontSize(12);
        doc.text(`Question ${idx + 1}: ${q.text}`, 15, currentY + 2);
        currentY += 20;

        // Create a temporary chart container for canvas capture
        const chartDiv = document.createElement('div');
        chartDiv.style.position = 'absolute';
        chartDiv.style.left = '-9999px';
        chartDiv.style.width = '600px';
        chartDiv.style.background = 'white';
        chartDiv.style.padding = '20px';
        document.body.appendChild(chartDiv);

        const qResponses = (session.allResponses && session.allResponses[idx]) || {};

        // Render simple bars for PDF items
        const barArea = document.createElement('div');
        barArea.style.fontFamily = 'Helvetica, Arial, sans-serif';
        q.options.forEach((opt, optIdx) => {
          const count = qResponses[optIdx] || 0;
          const total = Object.values(qResponses).reduce((a: any, b: any) => typeof b === 'number' ? a + b : a, 0) as number;
          const pct = total > 0 ? (count / total) * 100 : 0;

          const row = document.createElement('div');
          row.style.marginBottom = '10px';
          row.innerHTML = `
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${opt} (${count})</div>
            <div style="width: 400px; height: 12px; background: #eee; border-radius: 6px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: #004A98;"></div>
            </div>
          `;
          barArea.appendChild(row);
        });
        chartDiv.appendChild(barArea);

        const canvas = await html2canvas(chartDiv);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 140;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (currentY + imgHeight > 270) { doc.addPage(); currentY = 20; }
        doc.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;

        document.body.removeChild(chartDiv);
      }

      doc.save(`UMAK_Report_${session.accessCode}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleEndSession = async () => {
    if (window.confirm("Are you sure you want to end this live assessment? Final results will be generated.")) {
      const sessionRef = ref(db, 'active_session');
      await update(sessionRef, { status: 'ended' });
    }
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

  const isSessionEnded = session.status === 'ended';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      {isSessionEnded && (
        <div className="mb-8 p-6 bg-[#004A98] rounded-3xl text-white flex items-center justify-between shadow-xl shadow-[#004A98]/20 animate-in fade-in slide-in-from-top-4">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Assessment Concluded</h3>
            <p className="text-blue-100 font-bold opacity-80">Official results are now ready for archiving.</p>
          </div>
          <button
            onClick={handlePrintPDF}
            className="bg-[#FACC15] text-[#004A98] px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate PDF Report
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        {/* Left Side: Stats & Session Info */}
        <div className="flex-1 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-[#004A98] uppercase tracking-widest block">
                    {isSessionEnded ? 'COMPLETED ASSESSMENT' : `Question ${currentIdx + 1} of ${session.questions.length}`}
                  </span>
                  {!isSessionEnded && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
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
                <span className="text-xs font-black text-slate-500 uppercase mb-2">Status</span>
                <span className={`text-4xl font-black uppercase tracking-tighter ${isSessionEnded ? 'text-red-500' : 'text-slate-900'}`}>
                  {isSessionEnded ? 'Ended' : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
                </span>
              </div>
              <div className="bg-white border-2 border-[#004A98]/10 rounded-xl p-6 flex flex-col items-center justify-center">
                <span className="text-xs font-black text-[#004A98]/70 uppercase mb-2">Total Participants</span>
                <span className="text-5xl font-black text-[#004A98]">{session.participantsCount}</span>
              </div>
            </div>

            {!isSessionEnded && (
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
                  onClick={handleEndSession}
                  className="flex-1 bg-white border-2 border-red-200 text-red-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-50 transition-colors"
                >
                  End Session
                </button>
              </div>
            )}

            {isSessionEnded && (
              <button onClick={onEnd} className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all">Close Control Panel</button>
            )}
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

          {isSessionEnded && (
            <div className="flex flex-col gap-4">
              <button
                onClick={handlePrintPDF}
                className="w-full bg-[#004A98] text-white py-4 rounded-xl font-black shadow-lg shadow-[#004A98]/20 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Official PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
