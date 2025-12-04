import React from 'react';
import { Code2, MessageSquare, Braces } from 'lucide-react';
import { SessionRow } from '@/components/dashboard/session-row';
import Link from 'next/link';

export const RecentSessions: React.FC = () => {
  const sessions = [
    {
      icon: <Code2 className="w-4 h-4" />,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      iconColor: 'text-indigo-600',
      title: 'System Design',
      subtitle: 'Day 5 Session',
      date: 'Oct 24, 2023',
      score: '75%',
      scoreStyle: 'bg-green-50 text-green-700 border-green-100'
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      iconColor: 'text-orange-600',
      title: 'Behavioral Check',
      subtitle: 'Day 4 Session',
      date: 'Oct 22, 2023',
      score: '65%',
      scoreStyle: 'bg-yellow-50 text-yellow-700 border-yellow-100'
    },
    {
      icon: <Braces className="w-4 h-4" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600',
      title: 'Algorithm Basics',
      subtitle: 'Day 3 Session',
      date: 'Oct 18, 2023',
      score: '45%',
      scoreStyle: 'bg-gray-100 text-gray-700 border-gray-200'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col h-auto">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">Recent Sessions</h3>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
            History
          </span>
        </div>
        <Link href="/history">
          <button className="text-sm text-gray-500 hover:text-gray-900 font-medium cursor-pointer">View All</button>
        </Link>
        
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-1/3">Topic</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 cursor-pointer">
            {sessions.map((session, index) => (
              <SessionRow key={index} {...session} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};