
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
  createdAt: number;
  isDraft?: boolean;
  creatorId?: string;
  preventMultipleResponses?: boolean;
  hasLobby?: boolean;
}

export interface Session {
  id: string;
  accessCode: string;
  question: Question;
  status: 'active' | 'paused' | 'ended' | 'waiting';
  participantsCount: number;
  responses: Record<string, any>;
  startTime: number;
  isStarted: boolean;
}

export type UserRole = 'FACULTY' | 'STUDENT' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type ViewState = 'HOME' | 'LOGIN' | 'FACULTY_DASHBOARD' | 'FACULTY_CREATE' | 'FACULTY_EDIT' | 'FACULTY_LIVE' | 'STUDENT_JOIN' | 'STUDENT_POLL';
