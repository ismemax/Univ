
import React, { useState, useEffect } from 'react';
import { Session, QuestionType } from '../types';

interface StudentPollProps {
  session: Session;
  onSubmit: (response: any) => void;
  onFinished: () => void;
}

const StudentPoll: React.FC<StudentPollProps> = ({ session, onSubmit, onFinished }) => {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(session.question.timeLimit);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (selectedOption === null || (typeof selectedOption === 'string' && !selectedOption.trim())) {
      return alert('Please provide a response.');
    }
    onSubmit(selectedOption);
    setHasSubmitted(true);
  };

  const renderInput = () => {
    const q = session.question;
    switch (q.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
      case QuestionType.RATING_SCALE:
        return (
          <div className="space-y-4">
            {(q.options || []).map((opt, i) => (
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
      case QuestionType.RANKING:
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 uppercase font-black mb-4 tracking-widest bg-slate-50 p-4 rounded-xl text-center border border-slate-100">Touch items to set priority order</p>
            {q.options.map((opt, i) => (
              <button
                key={i}
                className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 bg-white shadow-sm flex items-center justify-between transition-transform active:scale-95"
              >
                <span className="text-slate-800 font-black text-lg">{opt}</span>
                <span className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-sm font-black text-slate-400">
                  -
                </span>
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (timeLeft === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-10 shadow-2xl">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Assessment Expired</h2>
          <p className="text-slate-600 font-bold mb-10 text-lg">The poll has been closed. Your input is valuable, but unfortunately, the response window has ended.</p>
          <button onClick={onFinished} className="w-full bg-[#004A98] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#004A98]/20 active:scale-95 transition-all">Return to Home Portal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="bg-white border-2 border-slate-200 rounded-[40px] shadow-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="bg-[#FACC15] h-full transition-all duration-1000 ease-linear shadow-sm" style={{ width: `${(timeLeft / session.question.timeLimit) * 100}%` }}></div>
        </div>

        <div className="flex justify-between items-center mb-12 mt-4">
          <span className="text-xs font-black text-[#004A98] uppercase tracking-[0.2em] bg-[#004A98]/5 px-3 py-1 rounded-md">Live Assessment • {session.question.type.replace('_', ' ')}</span>
          <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl text-sm font-black flex items-center gap-2 border border-red-100">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-600/50"></span>
            0:{String(timeLeft).padStart(2, '0')}
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-12 leading-tight tracking-tight">{session.question.text}</h2>

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
            <div className="w-24 h-24 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Response Confirmed</h3>
            <p className="text-slate-600 font-bold mb-12 text-lg leading-relaxed">Your data has been securely transmitted. You can now return to the main dashboard.</p>
            <button onClick={onFinished} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">Back to Home</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPoll;
