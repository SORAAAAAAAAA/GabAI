import React, { useState } from 'react';
import { useSessionStart } from '../hooks/useSessionStart';
import SessionLoader from './SessionLoader';
import type { InterviewData } from '@/hooks/useConnection';

interface InterviewSetupProps {
  onStartInterview: (data: InterviewData) => void;
}

export default function InterviewSetup({ onStartInterview }: InterviewSetupProps) {
  const [jobRole, setJobRole] = useState('');
  const { sessionStart, startInterview } = useSessionStart();

  const handleStart = async () => {
    try {
      const interviewData = await startInterview(jobRole);
      onStartInterview(interviewData);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
      console.error('Start session error:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex-1 flex flex-col relative">

      {sessionStart && <SessionLoader message="Starting your interview session..." />}

      <div className="flex flex-col h-full">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-4">Your journey to landing your dream job starts here.</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Get Ready for Your Interview
        </h2>

        {/* Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desired Job Role
          </label>

          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g. Software Engineer"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 
                       text-gray-900 placeholder-gray-400 
                       focus:ring-2 focus:ring-black/10 focus:border-black
                       transition"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleStart}
          disabled={sessionStart}
          className="
            w-full py-3 px-6 rounded-lg font-medium text-white 
            bg-black hover:bg-gray-900 
            disabled:opacity-50 disabled:cursor-not-allowed 
            transition
          "
        >
          Start Interview Session
        </button>
      </div>
    </div>
  );
}
