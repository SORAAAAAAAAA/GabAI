import React from 'react';
import { ArrowRight, Briefcase } from 'lucide-react';
import { SessionRowProps } from '@/types';
import { formatSessionDate } from '@/utils/formatSessions';

export default function SessionRow({ session }: SessionRowProps) {
  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${session.iconBg || 'bg-gray-50'} border ${session.iconBorder || 'border-gray-200'} flex items-center justify-center text-gray-600`}>
            {session.icon || <Briefcase className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{session.job_title}</p>
            <p className="text-xs text-gray-500">{session.subtitle}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {formatSessionDate(session.started_at)}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.scoreColor} border`}>
          {session.score}%
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-gray-300 group-hover:text-gray-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
