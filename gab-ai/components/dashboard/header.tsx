import React from 'react';
import { Bell, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center text-sm">
        <span className="text-gray-500">Dashboard</span>
        <span className="mx-2 text-gray-300">/</span>
        <span className="font-medium text-gray-900">Overview</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="md:hidden text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
