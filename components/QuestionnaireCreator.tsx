
import React, { useState, useEffect } from 'react';
import { Question, QuestionType, Assessment } from '../types';
import { sanitizeInput } from '../utils/securityUtils';

interface QuestionnaireCreatorProps {
  initialData?: Assessment;
  onCreate: (a: Assessment) => void;
  onSaveDraft: (a: Assessment) => void;
  onCancel: () => void;
}

const QuestionnaireCreator: React.FC<QuestionnaireCreatorProps> = ({ initialData, onCreate, onSaveDraft, onCancel }) => {
  const [assessmentTitle, setAssessmentTitle] = useState(initialData?.title || 'Academic Assessment Bundle');
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || [{
    id: Math.random().toString(36).substring(7),
    text: '',
    type: QuestionType.MULTIPLE_CHOICE,
    options: ['', ''],
    timeLimit: 60
  }]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [preventMultiple, setPreventMultiple] = useState(initialData?.preventMultipleResponses || true);
  const [hasLobby, setHasLobby] = useState(initialData?.hasLobby || false);

  const activeQ = questions[activeIndex];

  const updateActiveQuestion = (updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[activeIndex] = { ...activeQ, ...updates };
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: Math.random().toString(36).substring(7),
      text: '',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['', ''],
      timeLimit: 60
    };
    setQuestions([...questions, newQ]);
    setActiveIndex(questions.length);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    const newQuestions = questions.filter((_, i) => i !== idx);
    setQuestions(newQuestions);
    setActiveIndex(Math.max(0, activeIndex - 1));
  };

  const getFinalAssessment = (isDraft: boolean): Assessment => ({
    id: initialData?.id || Math.random().toString(36).substring(7),
    title: sanitizeInput(assessmentTitle),
    questions: questions.map(q => ({
      ...q,
      text: sanitizeInput(q.text),
      options: (q.type === QuestionType.TRUE_FALSE) ? ['True', 'False'] :
        (q.type === QuestionType.RATING_SCALE) ? ['1', '2', '3', '4', '5'] :
          (q.type === QuestionType.SHORT_ANSWER || q.type === QuestionType.ESSAY) ? [] :
            q.options.map(o => sanitizeInput(o))
    })),
    createdAt: initialData?.createdAt || Date.now(),
    isDraft,
    preventMultipleResponses: preventMultiple,
    hasLobby
  });

  const validate = () => {
    if (!assessmentTitle.trim()) { alert('Please enter an assessment title.'); return false; }
    for (const q of questions) {
      if (!q.text.trim()) { alert('All questions must have text.'); return false; }
      if ((q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.RANKING) && q.options.some(o => !o.trim())) {
        alert('All options for Multiple Choice and Ranking must be filled.');
        return false;
      }
    }
    return true;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar for Questions */}
      <div className="md:w-64 flex-shrink-0 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Assessment Flow</h3>
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={q.id} className="group relative">
                <button
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-black transition-all flex items-center gap-3 ${activeIndex === idx ? 'bg-umak-blue text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${activeIndex === idx ? 'bg-white/20' : 'bg-slate-200'}`}>
                    {idx + 1}
                  </span>
                  <span className="truncate">{q.text || `Question ${idx + 1}`}</span>
                </button>
                {questions.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(idx); }}
                    className="absolute -right-2 -top-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] shadow-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddQuestion}
            className="w-full mt-4 p-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-umak-blue hover:text-umak-blue transition-all"
          >
            + Add Question
          </button>
        </div>

        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
          <h4 className="text-[10px] font-black text-umak-blue uppercase tracking-widest mb-2">Global Settings</h4>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={preventMultiple} onChange={() => setPreventMultiple(!preventMultiple)} className="accent-umak-blue w-4 h-4" />
              <span className="text-[10px] font-extrabold text-slate-600 uppercase">One Response Limit</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={hasLobby} onChange={() => setHasLobby(!hasLobby)} className="accent-umak-blue w-4 h-4" />
              <span className="text-[10px] font-extrabold text-slate-600 uppercase">Join Lobby</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-grow bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button onClick={onCancel} className="text-slate-400 hover:text-umak-blue transition-colors p-2 -ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <span className="text-[10px] font-extrabold text-umak-blue uppercase tracking-widest mb-1 block">UMAK ACADEMIC PORTAL</span>
              <h2 className="text-3xl font-serif font-bold text-umak-navy uppercase tracking-tight">
                {initialData ? 'Edit Assessment' : 'New Assessment'}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {activeIndex + 1} of {questions.length}</span>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3 ml-1">Academic Prompt</label>
            <textarea
              value={activeQ.text}
              onChange={(e) => updateActiveQuestion({ text: e.target.value })}
              placeholder="e.g., Define the role of University of Makati in community development."
              className="w-full bg-white border-2 border-slate-100 rounded-xl p-6 h-32 focus:outline-none focus:ring-4 focus:ring-umak-blue/10 focus:border-umak-blue transition-all text-xl font-bold text-slate-900 placeholder:font-bold placeholder:text-slate-300 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-4 ml-1">Assessment Modality</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(Object.keys(QuestionType) as Array<keyof typeof QuestionType>).map((t) => (
                <button
                  key={t}
                  onClick={() => updateActiveQuestion({ type: QuestionType[t] })}
                  className={`py-4 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all shadow-sm ${activeQ.type === QuestionType[t]
                    ? 'bg-umak-blue text-white border-umak-blue shadow-lg shadow-umak-blue/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-umak-blue/40'
                    }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {(activeQ.type === QuestionType.MULTIPLE_CHOICE || activeQ.type === QuestionType.RANKING) && (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2 ml-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">
                  {activeQ.type === QuestionType.RANKING ? 'Items to Rank' : 'Response Options'}
                </label>
                {activeQ.type === QuestionType.RANKING && (
                  <div className="bg-blue-50 text-[#004A98] px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-blue-100 italic">
                    Students will prioritize these items sequentially
                  </div>
                )}
              </div>

              {activeQ.type === QuestionType.RANKING && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    How Ranking Works
                  </p>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                    Final results will use <span className="text-umak-blue">Weighted Priority Scoring</span>. Items ranked 1st by students receive maximum weight, while lower-ranked items get progressively fewer points. The "Priority Score" tracks collegiate consensus.
                  </p>
                </div>
              )}

              <div className="grid gap-4">
                {activeQ.options.map((opt, i) => (
                  <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2">
                    <div className="w-12 h-12 bg-umak-yellow rounded-xl flex items-center justify-center text-umak-navy font-black flex-shrink-0 text-lg shadow-sm border border-umak-yellow/20">
                      {activeQ.type === QuestionType.RANKING ? i + 1 : String.fromCharCode(65 + i)}
                    </div>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...activeQ.options];
                        newOpts[i] = e.target.value;
                        updateActiveQuestion({ options: newOpts });
                      }}
                      placeholder={`Choice ${i + 1}`}
                      className="flex-grow bg-white border-2 border-slate-200 rounded-xl px-5 py-2 focus:outline-none focus:border-[#004A98] font-black text-slate-900 placeholder:text-slate-300"
                    />
                    {activeQ.options.length > 2 && (
                      <button
                        onClick={() => {
                          const newOpts = activeQ.options.filter((_, idx) => idx !== i);
                          updateActiveQuestion({ options: newOpts });
                        }}
                        className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => updateActiveQuestion({ options: [...activeQ.options, ''] })}
                className="flex items-center gap-2 text-umak-blue text-[10px] font-black uppercase tracking-widest hover:bg-umak-blue/10 px-4 py-3 rounded-xl transition-all ml-1 mt-4 border-2 border-dashed border-umak-blue/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Option Item
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-4 ml-1">Polling Duration (Seconds)</label>
            <div className="flex items-center gap-6 bg-white p-6 rounded-2xl border-2 border-slate-100">
              <input
                type="range"
                min="30"
                max="600"
                step="30"
                value={activeQ.timeLimit}
                onChange={(e) => updateActiveQuestion({ timeLimit: Number(e.target.value) })}
                className="flex-grow h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-umak-blue"
              />
              <span className="w-20 text-center font-black text-2xl text-umak-blue bg-white border-2 border-umak-blue/20 py-2 rounded-xl shadow-sm">{activeQ.timeLimit}s</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 pt-12">
            <button
              onClick={() => { if (validate()) onSaveDraft(getFinalAssessment(true)); }}
              className="flex-1 py-5 border-2 border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest shadow-sm"
            >
              Save to Drafts
            </button>
            <button
              onClick={() => { if (validate()) onCreate(getFinalAssessment(false)); }}
              className="flex-2 bg-umak-blue text-white font-black py-5 px-14 rounded-2xl hover:bg-umak-navy transition-all shadow-xl shadow-umak-blue/30 uppercase text-xs tracking-widest"
            >
              Launch Academic Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireCreator;
