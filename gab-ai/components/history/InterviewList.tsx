'use client';
import React from 'react';
import { InterviewHistory } from '@/app/history/page';
import StatsCards from '@/components/history/StatsCards';
import FilterTabs from '@/components/history/FilterTabs';
import InterviewListItem from '@/components/history/InterviewListItem';

interface InterviewListProps {
  interviews: InterviewHistory[];
  onInterviewClick: (interview: InterviewHistory) => void;
}

export default function InterviewList({ interviews, onInterviewClick }: InterviewListProps) {
  // Calculate stats
  const totalInterviews = interviews.length;
  const avgScore = Math.round(interviews.reduce((acc, item) => acc + item.score, 0) / interviews.length);
  const bestScore = Math.max(...interviews.map(item => item.score));
  const thisMonth = 3; // You can calculate this dynamically

  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Interview History</h1>
        <p className="text-gray-500 text-sm">Track your progress and review past sessions.</p>
      </div>

      <StatsCards 
        total={totalInterviews}
        avgScore={avgScore}
        bestScore={bestScore}
        thisMonth={thisMonth}
      />

      <FilterTabs />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
        {interviews.map((interview) => (
          <InterviewListItem
            key={interview.id}
            interview={interview}
            onClick={() => onInterviewClick(interview)}
          />
        ))}
      </div>
    </div>
  );
}