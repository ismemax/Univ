
import React, { useState, useEffect } from 'react';
import { User, Assessment, QuestionType } from '../types';
import { STORAGE_KEYS } from '../constants';

interface FacultyDashboardProps {
  user: User;
  onCreateNew: () => void;
  onStartSession: (a: Assessment) => void;
  onEditDraft: (a: Assessment) => void;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user, onCreateNew, onStartSession, onEditDraft }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    setAssessments([...db].reverse());
  }, []);

  const deleteAssessment = (id: string) => {
    const updated = assessments.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
    setAssessments(updated);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-serif font-bold text-umak-navy">Faculty Dashboard</h1>
          <p className="text-slate-600 font-extrabold uppercase text-[10px] tracking-widest mt-1">Academic Assessment Management</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-umak-blue text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-umak-blue/20 hover:bg-umak-navy transition-all flex items-center gap-2 w-fit uppercase text-xs tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Assessment Bundle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.length === 0 ? (
          <div className="col-span-full py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-slate-500 font-black uppercase tracking-widest text-sm">No assessments found</h3>
            <p className="text-slate-500 text-xs mt-1 font-medium">Ready to create your first academic questionnaire?</p>
          </div>
        ) : (
          assessments.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-blue-50 text-umak-blue">
                    {a.questions.length} Question{a.questions.length > 1 ? 's' : ''}
                  </span>
                  {a.isDraft && (
                    <span className="bg-umak-yellow text-umak-navy px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">
                      Draft
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-black text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>

              <h4 className="text-lg font-black text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem] leading-tight">{a.title}</h4>
              <p className="text-xs text-slate-400 font-bold mb-6 italic truncate">{a.questions[0]?.text}</p>

              <div className="flex items-center gap-3 mt-auto">
                {a.isDraft ? (
                  <button
                    onClick={() => onEditDraft(a)}
                    className="flex-1 bg-white border border-umak-blue text-umak-blue hover:bg-umak-blue hover:text-white font-black py-2.5 rounded-lg text-[10px] transition-all uppercase tracking-wider"
                  >
                    Edit Draft
                  </button>
                ) : (
                  <button
                    onClick={() => onStartSession(a)}
                    className="flex-1 bg-umak-blue text-white font-black py-2.5 rounded-lg text-[10px] transition-all uppercase tracking-wider shadow-sm hover:shadow-md"
                  >
                    Launch Live
                  </button>
                )}
                <button
                  onClick={() => deleteAssessment(a.id)}
                  className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
