/**
 * Shared configuration and constants
 * Centralized management of magic strings, API endpoints, validation rules
 */

// API Endpoints
export const API_ENDPOINTS = {
  RESUME: {
    UPLOAD: '/api/ai/resume-process',
    PROCESS: '/api/ai/resume-process',
  },
  SESSION: {
    START: '/api/session/start-session',
    END: '/api/session/end-session',
  },
  AUTH: {
    LOGOUT: '/api/auth/logout',
  },
} as const;

// WebSocket Configuration
export const WS_CONFIG = {
  MESSAGE_TYPES: {
    USER_MESSAGE: 'user_message',
    AI_CHUNK: 'ai_chunk',
    END_INTERVIEW: 'end_interview',
    ERROR: 'error',
    CONNECTED: 'connected',
    INTERVIEW_ENDED: 'interview_ended',
  },
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  FILE: {
    ACCEPTED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_SIZE_MB: 10,
  },
  JOB_ROLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
} as const;

// UI Constants
export const UI = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#10b981',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    SUCCESS: '#10b981',
  },
  TOAST: {
    DURATION_MS: 3000,
  },
  ANIMATION: {
    TRANSITION_DURATION: 200,
  },
} as const;

// Supabase Tables
export const SUPABASE_TABLES = {
  SESSIONS: 'sessions',
  RESUMES: 'resumes',
  MESSAGES: 'messages',
  USERS: 'users',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_SESSION: 'Invalid session. Please start a new session.',
  RESUME_UPLOAD_FAILED: 'Failed to upload resume. Please try again.',
  SESSION_START_FAILED: 'Failed to start session. Please try again.',
  MICROPHONE_PERMISSION_DENIED: 'Microphone permission denied. Please enable microphone access in your browser settings.',
  WEBSOCKET_CONNECTION_FAILED: 'WebSocket connection failed. Please refresh the page.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  RESUME_UPLOADED: 'Resume uploaded successfully.',
  SESSION_STARTED: 'Interview session started successfully.',
  SESSION_ENDED: 'Interview session ended successfully.',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
} as const;
