'use client';
import React from 'react';
import { Bell } from 'lucide-react';

export default function PageHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center text-sm">
        <span className="text-gray-500">Dashboard</span>
        <span className="mx-2 text-gray-300">/</span>
        <span className="font-medium text-gray-900">Interview</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-900 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}