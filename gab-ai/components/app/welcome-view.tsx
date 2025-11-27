'use client';
import React from 'react';
import InterviewSetup from '@/app/session/components/InterviewSetup';
import ResumeUpload from '@/app/session/components//ResumeUpload';
import Logout from '../logout';


interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="flex flex-col h-screen w-full bg-white">
      <header className="flex flex-row justify-between items-center p-6 bg-white flex-shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900">Your journey to landing your dream job starts here.</h1>
        <Logout />
      </header>
      <div className='flex space-x-8 py-3 px-5 flex-1 overflow-auto justify-center'>
        <InterviewSetup onStartInterview={onStartCall} />
        <ResumeUpload />
      </div>
    </div>
  );
};
