'use client';
import React, { useState, useEffect } from 'react';
import InterviewList from '@/components/history/InterviewList';
import InterviewDetail from '@/components/history/interviewDetails';
import PageHeader from '@/components/history/Header';
import {
  formatSessionDate,
  parseEvaluation,
  type EvaluationData,
} from '@/utils/formatSessions';

export interface InterviewHistory {
  id: number;
  jobTitle: string; 
  date: string;
  score: number;
  status: 'completed' | 'in-progress' | 'cancelled';
  duration: string;
  type: 'technical' | 'behavioral' | 'mixed';
  feedback?: EvaluationData | null;
  durationFeedback?: string;
}

interface DBSession {
  id: number;
  job_title: string;
  started_at: string;
  status: string;
  overall_feedback?: unknown;
}

export default function HistoryPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewHistory | null>(null);
  const [interviews, setInterviews] = useState<InterviewHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/history');
        const dbSessions = await response.json();
        
        if (dbSessions && Array.isArray(dbSessions)) {
          const transformedInterviews: InterviewHistory[] = dbSessions.map((session: DBSession) => {
            console.log('Processing session:', session);
            const evaluationData = parseEvaluation(session.overall_feedback);
            console.log('Parsed evaluation data:', evaluationData);
            
            return {
              id: session.id,
              jobTitle: session.job_title,
              date: formatSessionDate(session.started_at),
              score: evaluationData.score,
              status: session.status === 'Ended' ? 'completed' : 'in-progress',
              duration: '45 min',
              type: 'technical' as const,
              feedback: evaluationData.data,
              durationFeedback: evaluationData.feedback
            };
          });
          
          console.log('Transformed interviews:', transformedInterviews);
          setInterviews(transformedInterviews);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setInterviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading interview history...</p>
            </div>
          ) : !showDetails ? (
            <InterviewList 
              interviews={interviews} 
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