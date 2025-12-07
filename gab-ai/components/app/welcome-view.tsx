'use client';
import React from 'react';
import InterviewSetup from '@/app/session/components/InterviewSetup';
import ResumeUpload from '@/app/session/components//ResumeUpload';
import Header from '@/app/session/components/Header';
import type { InterviewData } from '@/hooks/useConnection';


interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: (data: InterviewData) => void;
}

export const WelcomeView = ({
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="flex flex-col h-screen w-full bg-white">
      <Header />
      <div className='flex flex-col sm:flex-row gap-4 sm:gap-8 py-3 px-4 sm:px-5 flex-1 overflow-auto justify-center'>
        <InterviewSetup onStartInterview={onStartCall} />
        <ResumeUpload />
      </div>
    </div>
  );
};
