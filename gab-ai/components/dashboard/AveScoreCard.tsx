import React from 'react';

export default function AverageScoreCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full border border-emerald-100">
          +5% this week
        </span>
      </div>
      
      <div className="mt-6">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-5xl font-semibold tracking-tighter text-gray-900">78</span>
          <span className="text-xl text-gray-400 font-light">/100</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
          <div className="bg-gray-900 h-2 rounded-full w-[78%]"></div>
        </div>
        <p className="text-xs text-gray-400">Top 15% of candidates</p>
      </div>
    </div>
  );
}