'use client';

import React, { createContext, useContext, useState } from 'react';
import { EvaluationData } from '@/types/evaluation';

interface InterviewData {
  job: string;
  resume: string;
  userName: string;
  sessionId: string;
}


interface InterviewDataContextType {
  interviewData: InterviewData | null;
  setInterviewData: (data: InterviewData | null) => void;

  latestEvaluation: EvaluationData | null;
  setLatestEvaluation: (data: EvaluationData | null) => void;
}

const InterviewDataContext = createContext<InterviewDataContextType | undefined>(undefined);

export function InterviewDataProvider({ children }: { children: React.ReactNode }) {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [latestEvaluation, setLatestEvaluation] = useState<EvaluationData | null>(null);

  return (
    <InterviewDataContext.Provider value={{ interviewData, setInterviewData, latestEvaluation, setLatestEvaluation }}>
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
