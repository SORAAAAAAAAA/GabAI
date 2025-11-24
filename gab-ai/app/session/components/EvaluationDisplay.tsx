import React from 'react';
import { EvaluationDisplayProps } from '@/types/evaluation';

export default function EvaluationDisplay({ data }: EvaluationDisplayProps) {
    if (!data || !data.scores || !data.feedback) return null;

    const { scores, feedback } = data;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getProgressBarColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 text-sm">Feedback Analysis</h3>
                <span className="text-xs text-gray-500">AI Evaluated</span>
            </div>

            <div className="p-4 space-y-4">
                {/* Scores */}
                <div className="grid grid-cols-3 gap-4">
                    <ScoreItem
                        label="Confidence"
                        score={scores.confidence_score}
                        colorClass={getScoreColor(scores.confidence_score)}
                        barColorClass={getProgressBarColor(scores.confidence_score)}
                    />
                    <ScoreItem
                        label="Clarity"
                        score={scores.clarity_score}
                        colorClass={getScoreColor(scores.clarity_score)}
                        barColorClass={getProgressBarColor(scores.clarity_score)}
                    />
                    <ScoreItem
                        label="Relevance"
                        score={scores.relevance_score}
                        colorClass={getScoreColor(scores.relevance_score)}
                        barColorClass={getProgressBarColor(scores.relevance_score)}
                    />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Feedback */}
                <div className="space-y-3">
                    {feedback.strengths && feedback.strengths.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Strengths</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {feedback.strengths.map((strength, idx) => (
                                    <li key={idx}>{strength}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {feedback.improvement_tip && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tip for Improvement</h4>
                            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 flex gap-2 items-start">
                                <svg className="w-5 h-5 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{feedback.improvement_tip}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ScoreItem({ label, score, colorClass, barColorClass }: { label: string, score: number, colorClass: string, barColorClass: string }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className={`text-xl font-bold ${colorClass.split(' ')[0]}`}>
                {score}
            </div>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className={`h-1.5 rounded-full ${barColorClass}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }}></div>
            </div>
        </div>
    );
}
