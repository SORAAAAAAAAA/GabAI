'use client';
import React from 'react';
import { InterviewHistory } from '@/app/history/page';

interface DetailHeaderProps {
  interview: InterviewHistory;
}

export default function DetailHeader({ interview }: DetailHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTypeBadge = () => {
    const badges = {
      technical: 'Technical',
      behavioral: 'Behavioral',
      mixed: 'Mixed'
    };
    return badges[interview.type];
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {interview.jobTitle}
        </h1>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
            {getTypeBadge()}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(interview.date)} • {interview.duration}
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Export PDF
        </button>
        <button className="px-3 py-1.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
          Share
        </button>
      </div>
    </div>
  );
}