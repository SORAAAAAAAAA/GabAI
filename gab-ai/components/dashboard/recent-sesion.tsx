import React from 'react';
import Link from 'next/link';
import SessionRow from '@/components/dashboard/SessionRow';
import { Session } from '@/types';
import { getRecentSessions } from '@/utils/api/api.getrecentSessions';
import { parseOverallFeedback, getScoreColor } from '@/utils/formatSessions';


export async function RecentSessions() {
  const dbSessions = await getRecentSessions();

  console.log('Recent Sessions:', dbSessions);
  
  // Transform database sessions to Session format
  const sessions: Session[] = dbSessions && dbSessions.length > 0 
    ? (dbSessions as Array<{
        id: number;
        job_title: string;
        started_at: string;
        overall_feedback?: unknown;
      }>).map((dbSession) => {
        const { score, feedback } = parseOverallFeedback(dbSession.overall_feedback);
        return {
          id: String(dbSession.id),
          job_title: dbSession.job_title,
          subtitle: feedback,
          started_at: dbSession.started_at,
          score,
          overall_feedback: dbSession.overall_feedback,
          iconBorder: 'border-blue-100',
          scoreColor: getScoreColor(score),
        };
      })
    : [] ;

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
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-1/3">Job Title</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))
            ) : (
              <tr className="group hover:bg-gray-50/50 transition-colors">
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No recent sessions found. Start a new session to see it here!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};