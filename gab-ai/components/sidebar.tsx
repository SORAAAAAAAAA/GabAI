'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSessionExitContext } from '@/context/SessionExitContext';


interface SidebarProps {
  onNavigationIntent?: (path: string) => void;
  isInSessionLayout?: boolean;
}

const Sidebar = ({ onNavigationIntent, isInSessionLayout = false }: SidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();
    
    // Only use context hook if in session layout
    const sessionExitContext = isInSessionLayout ? useSessionExitContext() : null;

    const handleNavigation = (path: string) => {
      if (onNavigationIntent) {
        onNavigationIntent(path);
      } else if (sessionExitContext) {
        sessionExitContext.handleNavigationIntent(path);
      } else {
        // Direct navigation if no session context
        router.push(path);
      }
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm overflow-hidden">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-100">
            <button 
              onClick={() => handleNavigation('/dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10">
                <Image src="/white_icon.png" alt="Logo" width={40} height={40} />
              </div>
              <span className="text-xl font-bold text-gray-900">GabAI</span>
            </button>
          </div>
          
          {/* Navigation Section */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {/* Dashboard Link */}
            <button 
              onClick={() => handleNavigation('/dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                pathname === '/dashboard' 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span>Dashboard</span>
            </button>
            
            {/* Session Link */}
            <button 
              onClick={() => handleNavigation('/session')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                pathname === '/session' 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Start Interview</span>
            </button>
            
            {/* History Link */}
            <button 
              onClick={() => handleNavigation('/history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                pathname === '/history' 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Interview History</span>
            </button>
          </nav>

          {/* Footer Section */}
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-900 text-center">
              <p className="font-semibold mb-1">Keep Practicing</p>
              <p className="text-xs text-blue-700">Consistency is the key to success</p>
            </div>
          </div>
        </div>
    );
}

export default Sidebar;