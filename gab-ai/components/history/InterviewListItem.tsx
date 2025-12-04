'use client';
import React from 'react';
import { Code2, Table2, MessageSquare, ChevronRight } from 'lucide-react';
import { InterviewHistory } from '@/app/history/page';

interface InterviewListItemProps {
  interview: InterviewHistory;
  onClick: () => void;
}

export default function InterviewListItem({ interview, onClick }: InterviewListItemProps) {
  const getIcon = () => {
    switch (interview.type) {
      case 'technical':
        return <Code2 className="w-5 h-5" />;
      case 'mixed':
        return <Table2 className="w-5 h-5" />;
      case 'behavioral':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Code2 className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      onClick={onClick} 
      className="p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-900">
          {getIcon()}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:underline decoration-gray-400 underline-offset-4">
            {interview.jobTitle}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span>{formatDate(interview.date)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{interview.duration}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <span className="block text-xs text-gray-400">Score</span>
          <span className="font-mono font-medium text-gray-900">{interview.score}/100</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600" />
      </div>
    </div>
  );
}