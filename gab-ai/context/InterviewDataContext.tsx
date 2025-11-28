'use client';

import React, { createContext, useContext, useState } from 'react';

interface InterviewData {
  job: string;
  resume: string;
  userName: string;
}

interface InterviewDataContextType {
  interviewData: InterviewData | null;
  setInterviewData: (data: InterviewData | null) => void;
}

const InterviewDataContext = createContext<InterviewDataContextType | undefined>(undefined);

export function InterviewDataProvider({ children }: { children: React.ReactNode }) {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);

  return (
    <InterviewDataContext.Provider value={{ interviewData, setInterviewData }}>
      {children}
    </InterviewDataContext.Provider>
  );
}

export function useInterviewData() {
  const context = useContext(InterviewDataContext);
  if (!context) {
    throw new Error('useInterviewData must be used within an InterviewDataProvider');
  }
  return context;
}
