'use client';
import React from 'react';
import Logout from '@/components/logout';
import InterviewSetup from '@/app/session/components/InterviewSetup';
import ResumeUpload from '@/app/session/components//ResumeUpload';

export default function SessionPage() {

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Your journey to landing your dream job starts here.
        </h1>
        <Logout />
      </div>

      <div className="flex space-x-8 flex-1 min-h-0">
        <InterviewSetup  />
        <ResumeUpload  />
      </div>
    </div>
  );
}