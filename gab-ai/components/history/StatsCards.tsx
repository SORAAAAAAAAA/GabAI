'use client';
import React from 'react';

interface StatsCardsProps {
  total: number;
  avgScore: number;
  bestScore: number;
  thisMonth: number;
}

export default function StatsCards({ total, avgScore, bestScore, thisMonth }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</p>
        <p className="text-2xl font-semibold mt-1 tracking-tight">{total}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Avg Score</p>
        <p className="text-2xl font-semibold mt-1 tracking-tight">{avgScore}%</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Best</p>
        <p className="text-2xl font-semibold mt-1 tracking-tight">{bestScore}%</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Month</p>
        <p className="text-2xl font-semibold mt-1 tracking-tight">{thisMonth}</p>
      </div>
    </div>
  );
}