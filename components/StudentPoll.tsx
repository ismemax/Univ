
import React, { useState, useEffect } from 'react';
import { Session, QuestionType } from '../types';
import { sanitizeInput } from '../utils/securityUtils';

interface StudentPollProps {
  session: Session;
  onSubmit: (response: any) => void;
  onFinished: () => void;
}

const StudentPoll: React.FC<StudentPollProps> = ({ session, onSubmit, onFinished }) => {
  const currentIdx = session.currentQuestionIndex || 0;
  const activeQ = session.questions[currentIdx];

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

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
    const submissionKey = `umak_submitted_${session.id}_q${currentIdx}`;
    if (activeQ?.preventMultipleResponses && localStorage.getItem(submissionKey)) {
      setAlreadyVoted(true);
      setHasSubmitted(true);
    }
  }, [currentIdx, session.id]);

  useEffect(() => {
    if (!session || !activeQ) return;

    if (session.status !== 'active' || !session.startTime) {
      if (session.status === 'waiting') setTimeLeft(activeQ.timeLimit);
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
  }, [session.status, session.startTime, session.id, currentIdx]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (selectedOption === null || (typeof selectedOption === 'string' && !selectedOption.trim())) {
      return alert('Please provide a response.');
    }

    if (activeQ.preventMultipleResponses) {
      localStorage.setItem(`umak_submitted_${session.id}_q${currentIdx}`, 'true');
    }

    const secureResponse = typeof selectedOption === 'string' ? sanitizeInput(selectedOption) : selectedOption;
    onSubmit(secureResponse);
    setHasSubmitted(true);
  };

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
                  ? 'border-[#004A98] bg-[#004A98]/10 text-[#004A98]'
                  : 'border-slate-200 hover:border-[#004A98]/40 text-slate-700 bg-white'
                  }`}
              >
                <span>{opt}</span>
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
            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 text-xl font-black text-slate-900 focus:outline-none focus:border-[#004A98] focus:ring-4 focus:ring-[#004A98]/5 transition-all placeholder:text-slate-300"
            onChange={(e) => setSelectedOption(e.target.value)}
          />
        );
      case QuestionType.ESSAY:
        return (
          <textarea
            placeholder="Type your comprehensive response here..."
            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-6 h-60 text-xl font-black text-slate-900 focus:outline-none focus:border-[#004A98] focus:ring-4 focus:ring-[#004A98]/5 transition-all placeholder:text-slate-300"
            onChange={(e) => setSelectedOption(e.target.value)}
          />
        );
      case QuestionType.RANKING: {
        const ranking = Array.isArray(selectedOption) ? selectedOption : [];
        const handleRankClick = (idx: number) => {
          if (ranking.includes(idx)) {
            setSelectedOption(ranking.filter(r => r !== idx));
          } else {
            setSelectedOption([...ranking, idx]);
          }
        };

        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4 px-2">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Tap items in your preferred order</p>
              {ranking.length > 0 && (
                <button
                  onClick={() => setSelectedOption([])}
                  className="text-[10px] text-red-500 uppercase font-black tracking-widest hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {activeQ.options.map((opt, i) => {
              const rankPos = ranking.indexOf(i);
              const isSelected = rankPos > -1;
              return (
                <button
                  key={i}
                  onClick={() => handleRankClick(i)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-black flex items-center justify-between text-lg shadow-sm ${isSelected
                    ? 'border-[#004A98] bg-[#004A98]/5 text-[#004A98]'
                    : 'border-slate-200 hover:border-[#004A98]/40 text-slate-700 bg-white'
                    }`}
                >
                  <span className={isSelected ? 'text-[#004A98]' : 'text-slate-800'}>{opt}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isSelected
                    ? 'bg-[#004A98] text-white rotate-6'
                    : 'bg-slate-100 text-slate-400'}`}>
                    {isSelected ? rankPos + 1 : '-'}
                  </div>
                </button>
              );
            })}
            {ranking.length > 0 && ranking.length < activeQ.options.length && (
              <p className="text-center text-[10px] text-slate-400 font-bold italic mt-4 animate-pulse">
                Rank {activeQ.options.length - ranking.length} more item(s)...
              </p>
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
        <div className="animate-pulse font-black text-[#004A98] uppercase tracking-widest text-xs">Authenticating Session...</div>
      </div>
    );
  }

  if (session.status === 'waiting') {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <div className="bg-[#004A98] h-full w-1/3 animate-[loading_2s_infinite]"></div>
          </div>
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#004A98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Connected</h2>
          <p className="text-slate-600 font-bold mb-10 text-lg">You have successfully joined the session. Please wait for the instructor to start the assessment.</p>
        </div>
      </div>
    );
  }

  if (timeLeft === 0 && !hasSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-10 shadow-2xl">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Time Expired</h2>
          <p className="text-slate-600 font-bold mb-10 text-lg">The response window for this question has ended. Please wait for the next question.</p>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waiting for next phase...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="bg-white border-2 border-slate-200 rounded-[40px] shadow-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="bg-[#FACC15] h-full transition-all duration-1000 ease-linear shadow-sm" style={{ width: `${(timeLeft / activeQ.timeLimit) * 100}%` }}></div>
        </div>

        <div className="flex justify-between items-center mb-12 mt-4">
          <span className="text-xs font-black text-[#004A98] uppercase tracking-[0.2em] bg-[#004A98]/5 px-3 py-1 rounded-md">
            QUESTION {currentIdx + 1} OF {session.questions.length}
          </span>
          <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl text-sm font-black flex items-center gap-2 border border-red-100">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-600/50"></span>
            {formatTime(timeLeft)}
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-12 leading-tight tracking-tight">{activeQ.text}</h2>

        {!hasSubmitted ? (
          <div className="space-y-8">
            {renderInput()}
            <button
              onClick={handleSubmit}
              className="w-full bg-[#004A98] text-white py-5 rounded-2xl font-black mt-8 shadow-xl shadow-[#004A98]/30 transition-all active:scale-[0.98] uppercase tracking-widest text-lg"
            >
              Submit Response
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
            <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">
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
