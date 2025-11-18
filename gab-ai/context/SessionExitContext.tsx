'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface SessionExitContextType {
  isConfirmationOpen: boolean;
  isExiting: boolean;
  handleNavigationIntent: (path: string) => void;
  handleContinueInterview: () => void;
  handleExitSession: () => void;
}

const SessionExitContext = createContext<SessionExitContextType | undefined>(undefined);

export function useSessionExitContext() {
  const context = useContext(SessionExitContext);
  if (!context) {
    throw new Error('useSessionExitContext must be used within SessionExitProvider');
  }
  return context;
}

interface SessionExitProviderProps {
  children: ReactNode;
  value: SessionExitContextType;
}

export function SessionExitProvider({ children, value }: SessionExitProviderProps) {
  return (
    <SessionExitContext.Provider value={value}>
      {children}
    </SessionExitContext.Provider>
  );
}
