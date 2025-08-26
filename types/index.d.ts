// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  uid: string;
}

export interface Interview {
  id: string;
  userId: string;
  role: string;
  type: 'Technical' | 'Behavioral' | 'Mixed';
  techstack: string[];
  level: 'Junior' | 'Mid-level' | 'Senior';
  questions: string[];
  finalized: boolean;
  coverImage?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

export interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}