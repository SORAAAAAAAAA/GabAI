import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SessionRowProps {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  title: string;
  subtitle: string;
  date: string;
  score: string;
  scoreStyle: string;
}

export const SessionRow: React.FC<SessionRowProps> = ({ 
  icon, 
  bgColor, 
  borderColor, 
  iconColor, 
  title, 
  subtitle, 
  date, 
  score, 
  scoreStyle 
}) => {
  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${bgColor} border ${borderColor} flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{date}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${scoreStyle}`}>
          {score}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-gray-300 group-hover:text-gray-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};