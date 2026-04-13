
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  RATING_SCALE = 'RATING_SCALE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  RANKING = 'RANKING'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  timeLimit: number;
}

export interface Assessment {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
  isDraft?: boolean;
  creatorId?: string;
  preventMultipleResponses?: boolean;
  hasLobby?: boolean;
}

export interface Session {
  id: string;
  accessCode: string;
  questions: Question[];
  currentQuestionIndex: number;
  status: 'active' | 'paused' | 'ended' | 'waiting';
  participantsCount: number;
  // Responses will now be grouped by question index
  allResponses: Record<number, Record<string, any>>;
  startTime: number;
  pausedAt?: number;
  isStarted: boolean;
  preventMultipleResponses?: boolean;
}

export type UserRole = 'FACULTY' | 'STUDENT' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type ViewState = 'HOME' | 'LOGIN' | 'FACULTY_DASHBOARD' | 'FACULTY_CREATE' | 'FACULTY_EDIT' | 'FACULTY_LIVE' | 'STUDENT_JOIN' | 'STUDENT_POLL';
