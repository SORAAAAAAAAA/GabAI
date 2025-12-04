'use client';
import React from 'react';
import { Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { InterviewHistory } from '@/app/history/page';

interface FeedbackSectionProps {
  interview: InterviewHistory;
}

export default function FeedbackSection({ interview }: FeedbackSectionProps) {
  const strengths = interview.feedback?.qualitative_analysis?.key_strengths ?? [];
  const improvements = interview.feedback?.qualitative_analysis?.primary_weaknesses ?? [];
  const nextSteps = interview.feedback?.qualitative_analysis?.actionable_next_steps ?? [];
  const scoreTrend = interview.feedback?.score_trend ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Main Feedback Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gray-900" />
            Personalized Feedback
          </h3>
          
          <div className="space-y-6">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Strengths</h4>
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 mt-0.5 text-gray-900 shrink-0" />
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="border-t border-gray-100 pt-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Areas for Improvement</h4>
              <ul className="space-y-3">
                {improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                    <ArrowUpRight className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                    <span className="leading-relaxed">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Next Steps */}
            {nextSteps.length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Actionable Next Steps</h4>
                <ol className="space-y-3">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Column */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Question Performance</h3>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {scoreTrend.length > 0 ? (
            scoreTrend.map((trend, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-900">Question {trend.turn}</p>
                  <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                    Avg: {((trend.clarity + trend.confidence + trend.relevance) / 3).toFixed(0)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Clarity</span>
                      <span className="font-semibold text-gray-900">{trend.clarity}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full" 
                        style={{ width: `${trend.clarity}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Confidence</span>
                      <span className="font-semibold text-gray-900">{trend.confidence}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full" 
                        style={{ width: `${trend.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Relevance</span>
                      <span className="font-semibold text-gray-900">{trend.relevance}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full" 
                        style={{ width: `${trend.relevance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No question performance data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}