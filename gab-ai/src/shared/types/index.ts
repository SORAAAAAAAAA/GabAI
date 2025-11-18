/**
 * Shared type definitions following clean architecture principles
 * Centralized to avoid duplication and ensure consistency
 */

// Speech Recognition Types
export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Domain Models
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    display_name?: string;
  };
}

export interface Resume {
  id: string;
  user_id: string;
  resume_text: string;
  uploaded_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  job_title: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface InterviewHistory {
  id: number;
  jobTitle: string;
  date: string;
  score: number;
  status: 'completed' | 'in-progress' | 'cancelled';
  duration: string;
  type: 'technical' | 'behavioral' | 'mixed';
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'message' | 'error' | 'connected' | 'ai_chunk' | 'user_message';
  data?: unknown;
  error?: string;
}

export interface AIChunkData {
  text: string;
  audioBase64: string;
  isComplete: boolean;
}

// API Response Types
export interface UploadResumeResponse {
  summary: string;
}

export interface StartSessionResponse {
  message: string;
  sessionId: string;
  jobTitle: string;
  resume: string;
  wsUrl: string;
}

export interface FileUploadState {
  selectedFile: File | null;
  filePreview: string | null;
  parsedResume: string | null;
  loading: boolean;
}

export interface FieldErrors {
  [key: string]: string;
}
