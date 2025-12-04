'use client';
import React, { useState } from 'react';
import InterviewList from '@/components/history/InterviewList';
import InterviewDetail from '@/components/history/interviewDetails';
import PageHeader from '@/components/history/Header';

export interface InterviewHistory {
  id: number;
  jobTitle: string;
  date: string;
  score: number;
  status: 'completed' | 'in-progress' | 'cancelled';
  duration: string;
  type: 'technical' | 'behavioral' | 'mixed';
}

export default function HistoryPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewHistory | null>(null);

  // Mock data - replace with actual data from your backend
  const mockHistory: InterviewHistory[] = [
    {
      id: 1,
      jobTitle: 'Senior Software Engineer',
      date: '2025-10-03',
      score: 87,
      status: 'completed',
      duration: '45 min',
      type: 'technical'
    },
    {
      id: 2,
      jobTitle: 'Data Analyst',
      date: '2025-09-28',
      score: 92,
      status: 'completed',
      duration: '35 min',
      type: 'mixed'
    },
    {
      id: 3,
      jobTitle: 'Product Manager',
      date: '2025-09-25',
      score: 78,
      status: 'completed',
      duration: '50 min',
      type: 'behavioral'
    },
    {
      id: 4,
      jobTitle: 'AI Engineer',
      date: '2025-09-20',
      score: 85,
      status: 'completed',
      duration: '42 min',
      type: 'technical'
    },
    {
      id: 5,
      jobTitle: 'Protocol Engineer',
      date: '2025-09-15',
      score: 90,
      status: 'completed',
      duration: '38 min',
      type: 'mixed'
    }
  ];

  const handleInterviewClick = (interview: InterviewHistory) => {
    setSelectedInterview(interview);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedInterview(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFAFA]">
      <PageHeader />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide">
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        
        <div className="max-w-[1000px] mx-auto">
          {!showDetails ? (
            <InterviewList 
              interviews={mockHistory} 
              onInterviewClick={handleInterviewClick}
            />
          ) : (
            <InterviewDetail 
              interview={selectedInterview!}
              onBack={handleBackToList}
            />
          )}
        </div>
      </main>
    </div>
  );
}