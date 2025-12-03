'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircleIcon,
  WarningCircleIcon,
  LightbulbIcon,
  TrendUpIcon,
} from '@phosphor-icons/react/dist/ssr';
import { ArrowRight } from 'lucide-react';

interface OverallFeedbackData {
  session_summary: {
    overall_performance_score: number;
    duration_feedback: string;
    total_turns: number;
  };
  metrics: {
    average_clarity: number;
    average_confidence: number;
    average_relevance: number;
    professionalism_score: number;
    pacing_score: number;
  };
  score_trend: Array<{
    turn: number;
    clarity: number;
    confidence: number;
    relevance: number;
  }>;
  qualitative_analysis: {
    key_strengths: string[];
    primary_weaknesses: string[];
    critical_flags: string[];
    actionable_next_steps: string[];
  };
  sentiment_report: {
    dominant_tone: string;
    emotional_progression: string;
  };
}

interface OverallFeedbackProps {
  feedbackData: OverallFeedbackData | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

const ScoreCircle = ({ score, label }: { score: number; label: string }) => {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`rounded-lg border p-4 ${getColor(score)} flex flex-col items-center`}
    >
      <div className="text-3xl font-semibold mb-2">{score}</div>
      <div className="w-16 h-1 rounded-full bg-gray-100 mb-3 overflow-hidden">
        <div className={`h-full ${getBarColor(score)}`} style={{ width: `${score}%` }}></div>
      </div>
      <p className="text-xs font-medium text-center">{label}</p>
    </motion.div>
  );
};

export const OverallFeedback: React.FC<OverallFeedbackProps> = ({
  feedbackData,
  isLoading = false,
  onRetry,
}) => {
  const [displayData, setDisplayData] = useState<OverallFeedbackData | null>(null);

  useEffect(() => {
    if (feedbackData) {
      setDisplayData(feedbackData);
    }
  }, [feedbackData]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full" />
          </div>
          <p className="text-sm text-gray-500">Processing your feedback...</p>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#FAFAFA] gap-4">
        <p className="text-gray-600">No feedback data available</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const { session_summary, metrics, qualitative_analysis, sentiment_report } = displayData;

  return (
    <div className="w-full h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 z-10">
        <div className="flex items-center text-sm">
          <span className="text-gray-500">Interview</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="font-medium text-gray-900">Feedback</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Overall Score Section */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6"
            >
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Overall Performance</h2>
                <div className="text-5xl font-semibold text-gray-900 mb-2">
                  {session_summary.overall_performance_score}
                  <span className="text-2xl text-gray-400 font-light ml-1">/100</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">{session_summary.duration_feedback}</p>
                <p className="text-xs text-gray-400 mt-2">Total responses analyzed: {session_summary.total_turns}</p>
              </div>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
            >
              <ScoreCircle score={metrics.average_clarity} label="Clarity" />
              <ScoreCircle score={metrics.average_confidence} label="Confidence" />
              <ScoreCircle score={metrics.average_relevance} label="Relevance" />
              <ScoreCircle score={metrics.professionalism_score} label="Professionalism" />
              <ScoreCircle score={metrics.pacing_score} label="Pacing" />
            </motion.div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Key Strengths */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon size={20} className="text-emerald-600" weight="fill" />
                  <h3 className="font-semibold text-gray-900">Key Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {qualitative_analysis.key_strengths.slice(0, 3).map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -5, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-emerald-600 font-semibold mt-0.5">✓</span>
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Areas for Improvement */}
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <WarningCircleIcon size={20} className="text-yellow-600" weight="fill" />
                  <h3 className="font-semibold text-gray-900">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {qualitative_analysis.primary_weaknesses.slice(0, 3).map((weakness, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: 5, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-yellow-600 font-semibold mt-0.5">!</span>
                      <span>{weakness}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Critical Flags */}
            {qualitative_analysis.critical_flags.length > 0 && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendUpIcon size={20} className="text-orange-600" weight="fill" />
                  <h3 className="font-semibold text-gray-900">Important Notes</h3>
                </div>
                <ul className="space-y-2">
                  {qualitative_analysis.critical_flags.slice(0, 2).map((flag, index) => (
                    <motion.li
                      key={index}
                      initial={{ y: -3, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-orange-600 font-semibold mt-0.5">⚠</span>
                      <span>{flag}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Actionable Next Steps */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <LightbulbIcon size={20} className="text-blue-600" weight="fill" />
                <h3 className="font-semibold text-gray-900">Actionable Next Steps</h3>
              </div>
              <ul className="space-y-2">
                {qualitative_analysis.actionable_next_steps.slice(0, 3).map((step, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-blue-600 font-semibold mt-0.5 text-xs">{index + 1}.</span>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Sentiment Report */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Tone & Engagement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Dominant Tone</label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    {sentiment_report.dominant_tone}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Emotional Progression</label>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    {sentiment_report.emotional_progression}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA Footer */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 justify-center pb-4"
            >
              <button
                onClick={() => window.location.href = '/session'}
                className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-lg text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Start Another Interview
              </button>
              <button
                onClick={() => window.location.href = '/history'}
                className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg text-sm border border-gray-200 transition-colors"
              >
                View History
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverallFeedback;
