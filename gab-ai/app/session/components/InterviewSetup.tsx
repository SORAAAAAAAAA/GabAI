import React, { useState } from 'react';
import { useSessionStart } from '../hooks/useSessionStart';
import SessionLoader from './SessionLoader';

interface InterviewSetupProps {
  resumeText: string;
}

export default function InterviewSetup({ resumeText }: InterviewSetupProps) {
  const [jobRole, setJobRole] = useState('');
  const { sessionStart, startInterview } = useSessionStart();

  const handleStart = async () => {
    try {
      await startInterview(jobRole, resumeText);
    } catch (error) {
      alert('Failed to start session');
      console.error('Start session error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm w-1/2 relative h-full">
      {sessionStart && <SessionLoader message="Starting your interview session..." />}
      
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Get Ready for Your Interview
      </h2>
      
      <div className="mb-6">
        <label className="block text-gray-900 text-sm font-medium mb-2">
          Desired Job Role
        </label>
        <input
          type="text"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="e.g. Software Engineer"
          className="w-full px-4 py-3 rounded-lg border text-gray-900"
        />
      </div>

      <button
        onClick={handleStart}
        disabled={sessionStart}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg"
      >
        Start Interview Session
      </button>
    </div>
  );
}