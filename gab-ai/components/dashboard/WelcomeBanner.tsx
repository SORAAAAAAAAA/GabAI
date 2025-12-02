'use client';
import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { useUserName } from '@/hooks/getUserName';

export default function WelcomeBanner() {
  const userName = useUserName();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden group">
      <div className="relative z-10 max-w-lg">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">Hey, {userName}!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Ready for your next interview? Users who practice consistently improve their score by 40%. Let&apos;s sharpen your skills.
        </p>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/session"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            Start New Interview
          </Link>
          <Link 
            href="/guide"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            View Guide
          </Link>
        </div>
      </div>
    </div>
  );
}