import React, { useEffect } from 'react';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackProps {
  isOpen: boolean;
  type: FeedbackType;
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isModal?: boolean;
  autoClose?: number;
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (val: string) => void;
  inputPlaceholder?: string;
}

const Feedback: React.FC<FeedbackProps> = ({ 
  isOpen, 
  type, 
  title, 
  message, 
  onClose,
  onConfirm,
  confirmText = 'CONTINUE',
  cancelText = 'CANCEL',
  isModal = false,
  autoClose = 5000,
  showInput = false,
  inputValue = '',
  onInputChange,
  inputPlaceholder = 'Type here...'
}) => {
  useEffect(() => {
    if (isOpen && !isModal && autoClose && !onConfirm && !showInput) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isModal, autoClose, onClose, onConfirm, showInput]);

  if (!isOpen) return null;

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const accentColors = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    info: 'text-blue-500',
    warning: 'text-amber-500',
  };

  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  };

  if (!isModal) {
    return (
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in px-4 w-full max-w-md pointer-events-none">
        <div className={`pointer-events-auto flex items-start p-4 rounded-2xl border-2 shadow-2xl glass-panel ${bgColors[type]}`}>
          <div className={`flex-shrink-0 ${accentColors[type]}`}>
            {icons[type]}
          </div>
          <div className="ml-3 flex-grow">
            {title && <h3 className="text-sm font-black uppercase tracking-wider mb-0.5">{title}</h3>}
            <div className="text-sm font-medium leading-tight">{message}</div>
          </div>
          <button 
            onClick={onClose} 
            className="ml-3 p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <svg className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 transform scale-100 transition-transform">
        <div className={`h-2.5 ${type === 'error' ? 'bg-rose-500' : type === 'warning' ? 'bg-amber-500' : 'bg-[#004A98]'}`} />
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center ${type === 'error' ? 'bg-rose-50 text-rose-500' : type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-[#004A98]'}`}>
              {icons[type]}
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              {title || (type === 'error' ? 'Academic Alert' : 'Notification')}
            </h3>
          </div>
          
          <p className="text-slate-600 text-center font-medium leading-relaxed mb-6 px-2">
            {message}
          </p>

          {showInput && (
            <div className="mb-8">
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                placeholder={inputPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onConfirm) onConfirm();
                }}
                className="w-full bg-slate-50 border-2 border-slate-100 py-4 px-6 rounded-2xl text-slate-900 font-black text-center focus:border-[#004A98] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            {onConfirm && (
               <button 
                 onClick={onConfirm}
                 className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all hover:brightness-110 active:scale-[0.98] ${type === 'error' ? 'bg-rose-500 shadow-rose-200' : type === 'warning' ? 'bg-amber-500 shadow-amber-200' : 'bg-[#004A98] shadow-blue-200'}`}
               >
                 {confirmText}
               </button>
            )}
            
            <button 
              onClick={onClose}
              className={`w-full py-4 rounded-2xl font-black transition-all active:scale-[0.98] ${onConfirm ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : type === 'error' ? 'bg-rose-500 text-white shadow-rose-200 shadow-xl' : 'bg-[#004A98] text-white shadow-blue-200 shadow-xl'}`}
            >
              {(onConfirm || showInput) ? cancelText : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
