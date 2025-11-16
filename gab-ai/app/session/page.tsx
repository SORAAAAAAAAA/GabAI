'use client';
import React, { useState } from 'react';
import Logout from '@/components/logout';
import InterviewSetup from '@/app/session/components/InterviewSetup';
import ResumeUpload from '@/app/session/components//ResumeUpload';

export default function SessionPage() {
  const [parsedResume, setParsedResume] = useState('');

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your journey to landing your dream job starts here.
          </h1>
          <Logout />
        </div>

        <div className="flex space-x-8 h-full max-h-[calc(100vh-200px)]">
          <InterviewSetup resumeText={parsedResume} />
          <ResumeUpload onFileUploaded={setParsedResume} />
        </div>
      </div>
    </div>
  );
}