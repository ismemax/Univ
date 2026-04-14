import React, { createContext, useContext, useState, ReactNode } from 'react';
import Feedback, { FeedbackType } from './Feedback';

interface FeedbackContextType {
  showFeedback: (
    message: string, 
    type?: FeedbackType, 
    title?: string, 
    isModal?: boolean,
    onConfirm?: (inputValue: string) => void,
    confirmText?: string,
    cancelText?: string,
    showInput?: boolean,
    inputPlaceholder?: string,
    initialInputValue?: string
  ) => void;
  hideFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title?: string;
    message: string;
    isModal?: boolean;
    onConfirm?: (inputValue: string) => void;
    confirmText?: string;
    cancelText?: string;
    showInput?: boolean;
    inputValue: string;
    inputPlaceholder?: string;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
    inputValue: ''
  });

  const showFeedback = (
    message: string, 
    type: FeedbackType = 'info', 
    title?: string, 
    isModal: boolean = false,
    onConfirm?: (inputValue: string) => void,
    confirmText?: string,
    cancelText?: string,
    showInput: boolean = false,
    inputPlaceholder: string = 'Type here...',
    initialInputValue: string = ''
  ) => {
    setState({ 
      isOpen: true, type, title, message, isModal, onConfirm, confirmText, cancelText, 
      showInput, inputValue: initialInputValue, inputPlaceholder 
    });
  };

  const hideFeedback = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback }}>
      {children}
      <Feedback
        isOpen={state.isOpen}
        type={state.type}
        title={state.title}
        message={state.message}
        isModal={state.isModal}
        showInput={state.showInput}
        inputValue={state.inputValue}
        inputPlaceholder={state.inputPlaceholder}
        onInputChange={(val) => setState(prev => ({ ...prev, inputValue: val }))}
        onConfirm={state.onConfirm ? () => { state.onConfirm!(state.inputValue); hideFeedback(); } : undefined}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        onClose={hideFeedback}
      />
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
