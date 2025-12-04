'use client';
import React from 'react';
import { Sparkles, Check, ArrowUpRight } from 'lucide-react';

export default function FeedbackSection() {
  const strengths = [
    'Excellent breakdown of the system architecture question. You effectively separated database scaling from application logic scaling.',
    'Maintained strong eye contact simulation and clear vocal projection throughout the behavioral section.'
  ];

  const improvements = [
    'When discussing conflict resolution, the answer was slightly lengthy. Try to condense the "Action" part of your STAR response.',
    'Technical depth on React Hooks could be deeper; review `useMemo` specifically for high-performance scenarios.'
  ];

  const timeline = [
    { id: 1, title: 'Introduction', time: '00:00 - 03:20', badge: 'Perfect', badgeColor: 'bg-gray-200 text-gray-800' },
    { id: 2, title: 'System Design', time: '03:21 - 15:45', badge: 'Good', badgeColor: 'bg-gray-200 text-gray-800' },
    { id: 3, title: 'Algorithm', time: '15:46 - 32:00', badge: 'Excellent', badgeColor: 'bg-gray-900 text-white' }
  ];

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
          </div>
        </div>
      </div>

      {/* Timeline Column */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Question Timeline</h3>
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 relative">
          {/* Timeline Line */}
          <div className="absolute left-[19px] top-2 bottom-0 w-px bg-gray-200"></div>

          {timeline.map((item) => (
            <div key={item.id} className="relative flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
                <span className="text-xs font-semibold text-gray-900">
                  {item.id.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${item.badgeColor}`}>
                  {item.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}