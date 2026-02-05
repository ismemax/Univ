
import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';

interface QuestionnaireCreatorProps {
  initialData?: Question;
  onCreate: (q: Question) => void;
  onSaveDraft: (q: Question) => void;
  onCancel: () => void;
}

const QuestionnaireCreator: React.FC<QuestionnaireCreatorProps> = ({ initialData, onCreate, onSaveDraft, onCancel }) => {
  const [type, setType] = useState<QuestionType>(initialData?.type || QuestionType.MULTIPLE_CHOICE);
  const [text, setText] = useState(initialData?.text || '');
  const [options, setOptions] = useState<string[]>(initialData?.options || ['', '']);
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 60);
  const [preventMultiple, setPreventMultiple] = useState(initialData?.preventMultipleResponses || true);
  const [hasLobby, setHasLobby] = useState(initialData?.hasLobby || false);

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  const handleOptionChange = (index: number, val: string) => {
    const newOpts = [...options];
    newOpts[index] = val;
    setOptions(newOpts);
  };

  const getFinalQuestion = (isDraft: boolean): Question => ({
    id: initialData?.id || Math.random().toString(36).substring(7),
    text,
    type,
    options: type === QuestionType.TRUE_FALSE ? ['True', 'False'] :
      type === QuestionType.RATING_SCALE ? ['1', '2', '3', '4', '5'] :
        (type === QuestionType.SHORT_ANSWER || type === QuestionType.ESSAY) ? [] : options,
    timeLimit,
    createdAt: initialData?.createdAt || Date.now(),
    isDraft,
    preventMultipleResponses: preventMultiple,
    hasLobby
  });

  const validate = () => {
    if (!text.trim()) { alert('Please enter a question.'); return false; }
    if ((type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.RANKING) && options.some(o => !o.trim())) {
      alert('All options must be filled.');
      return false;
    }
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={onCancel} className="text-slate-400 hover:text-[#004A98] transition-colors p-2 -ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-3xl font-black text-[#004A98] uppercase tracking-tight">
            {initialData ? 'Edit Assessment' : 'New Assessment'}
          </h2>
        </div>

        <div className="space-y-10">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3 ml-1">Academic Prompt / Question</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Define the role of University of Makati in community development."
              className="w-full bg-white border-2 border-slate-200 rounded-xl p-6 h-40 focus:outline-none focus:ring-4 focus:ring-[#004A98]/10 focus:border-[#004A98] transition-all text-xl font-black text-slate-900 placeholder:font-bold placeholder:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-4 ml-1">Assessment Modality</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(Object.keys(QuestionType) as Array<keyof typeof QuestionType>).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(QuestionType[t])}
                  className={`py-4 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all shadow-sm ${type === QuestionType[t]
                    ? 'bg-[#004A98] text-white border-[#004A98] shadow-lg shadow-[#004A98]/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#004A98]/40'
                    }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {(type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.RANKING) && (
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                {type === QuestionType.RANKING ? 'Items to Rank' : 'Response Options'}
              </label>
              <div className="grid gap-4">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2">
                    <div className="w-12 h-12 bg-[#FACC15] rounded-xl flex items-center justify-center text-[#004A98] font-black flex-shrink-0 text-lg shadow-sm">
                      {type === QuestionType.RANKING ? i + 1 : String.fromCharCode(65 + i)}
                    </div>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder={`Choice ${i + 1}`}
                      className="flex-grow bg-white border-2 border-slate-200 rounded-xl px-5 py-2 focus:outline-none focus:border-[#004A98] font-black text-slate-900 placeholder:text-slate-300"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(i)}
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
                onClick={handleAddOption}
                className="flex items-center gap-2 text-[#004A98] text-[10px] font-black uppercase tracking-widest hover:bg-[#004A98]/10 px-4 py-3 rounded-xl transition-all ml-1 mt-4 border-2 border-dashed border-[#004A98]/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Option Item
              </button>
            </div>
          )}

          {type === QuestionType.SHORT_ANSWER && (
            <div className="p-10 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center">
              <p className="text-slate-700 text-sm font-black uppercase tracking-wide">Single-line Open Response Mode</p>
              <p className="text-slate-500 text-xs mt-2 font-bold italic">Students will respond via a standard text input.</p>
            </div>
          )}

          {type === QuestionType.ESSAY && (
            <div className="p-10 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center">
              <p className="text-slate-700 text-sm font-black uppercase tracking-wide">Long-form Reflection Mode</p>
              <p className="text-slate-500 text-xs mt-2 font-bold italic">Students will respond via a large multi-line text area.</p>
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
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="flex-grow h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004A98]"
              />
              <span className="w-20 text-center font-black text-2xl text-[#004A98] bg-white border-2 border-[#004A98]/20 py-2 rounded-xl shadow-sm">{timeLimit}s</span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">One Response Per Student</h4>
              <p className="text-xs text-slate-500 font-bold mt-1">Prevents tampering by blocking multiple submissions from the same device.</p>
            </div>
            <button
              onClick={() => setPreventMultiple(!preventMultiple)}
              className={`w-14 h-8 rounded-full relative transition-all duration-300 ${preventMultiple ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${preventMultiple ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Pre-Assessment Lobby</h4>
              <p className="text-xs text-slate-500 font-bold mt-1">Wait for all students to join before starting the countdown.</p>
            </div>
            <button
              onClick={() => setHasLobby(!hasLobby)}
              className={`w-14 h-8 rounded-full relative transition-all duration-300 ${hasLobby ? 'bg-[#004A98]' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${hasLobby ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 pt-12">
            <button
              onClick={() => { if (validate()) onSaveDraft(getFinalQuestion(true)); }}
              className="flex-1 py-5 border-2 border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest shadow-sm"
            >
              Save to Drafts
            </button>
            <button
              onClick={() => { if (validate()) onCreate(getFinalQuestion(false)); }}
              className="flex-2 bg-[#004A98] text-white font-black py-5 px-14 rounded-2xl hover:bg-[#003875] transition-all shadow-xl shadow-[#004A98]/30 uppercase text-xs tracking-widest"
            >
              Confirm & Launch Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireCreator;
