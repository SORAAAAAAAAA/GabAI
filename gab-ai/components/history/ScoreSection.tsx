'use client';
import React from 'react';
import { CheckCircle2, Mic, Music2, AlignLeft, Target } from 'lucide-react';
import { InterviewHistory } from '@/app/history/page';

interface ScoreSectionProps {
  interview: InterviewHistory;
}

export default function ScoreSection({ interview }: ScoreSectionProps) {
  // Mock detailed scores - in production, these would come from the interview data
  const detailedScores = {
    confidence: 92,
    tone: 88,
    clarity: 95,
    relevance: 85
  };

  const getHireabilityStatus = (score: number) => {
    if (score >= 85) return { text: 'Highly Hirable', description: 'Strong technical foundation shown. Candidate demonstrated excellent problem-solving skills appropriate for a Senior role.' };
    if (score >= 70) return { text: 'Hirable', description: 'Good overall performance with room for improvement in specific areas.' };
    return { text: 'Needs Improvement', description: 'Further practice recommended in key areas before interviewing.' };
  };

  const status = getHireabilityStatus(interview.score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Overall Score Card */}
      <div className="bg-black text-white p-6 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Overall Result</h3>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-5xl font-semibold tracking-tighter">{interview.score}</span>
            <span className="text-xl text-gray-500 font-light">/100</span>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="font-medium text-lg">{status.text}</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {status.description}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Confidence */}
        <MetricCard 
          icon={<Mic className="w-4 h-4 text-gray-900" />}
          title="Confidence"
          score={detailedScores.confidence}
          description="Steady pacing, minimal filler words."
          color="black"
        />

        {/* Tone */}
        <MetricCard 
          icon={<Music2 className="w-4 h-4 text-gray-900" />}
          title="Tone"
          score={detailedScores.tone}
          description="Professional yet conversational."
          color="gray-800"
        />

        {/* Clarity */}
        <MetricCard 
          icon={<AlignLeft className="w-4 h-4 text-gray-900" />}
          title="Clarity"
          score={detailedScores.clarity}
          description="Structured answers (STAR method)."
          color="black"
        />

        {/* Relevance */}
        <MetricCard 
          icon={<Target className="w-4 h-4 text-gray-900" />}
          title="Relevance"
          score={detailedScores.relevance}
          description="Directly addressed core requirements."
          color="gray-600"
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  score: number;
  description: string;
  color: string;
}

function MetricCard({ icon, title, score, description, color }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-xl hover:border-gray-300 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-md border border-gray-100">
          {icon}
        </div>
        <span className="text-lg font-semibold tracking-tight">{score}%</span>
      </div>
      <h4 className="font-medium text-sm text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
        <div 
          className={`bg-${color} h-full rounded-full`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}