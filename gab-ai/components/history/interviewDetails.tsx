'use client';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { InterviewHistory } from '@/app/history/page';
import DetailHeader from '@/components/history/DetailHeader';
import ScoreSection from '@/components/history/ScoreSection';
import FeedbackSection from './FeedbackSection';

interface InterviewDetailProps {
  interview: InterviewHistory;
  onBack: () => void;
}

export default function InterviewDetail({ interview, onBack }: InterviewDetailProps) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-4 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Sessions
      </button>

      <DetailHeader interview={interview} />
      <ScoreSection interview={interview} />
      <FeedbackSection interview={interview} />
    </div>
  );
}