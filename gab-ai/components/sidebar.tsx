'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';


const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className=" w-20 flex flex-col items-center py-8 space-y-8">
        {/* Logo */}
        <div className="w-16 h-16">
          <button onClick={() => router.push('/dashboard')}>
            <Image src="/white_icon.png" alt="Logo" width={64} height={64} />
          </button>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex flex-col space-y-6">
          {/* Dashboard Icon */}
          <button 
            onClick={() => router.push('/dashboard')}
            className={`w-16 h-16 flex items-center justify-center rounded-xl cursor-pointer transition-colors ${
              pathname === '/dashboard' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </button>
          
          {/* Session Icon */}
          <button 
            onClick={() => router.push('/session')}
            className={`w-16 h-16 flex items-center justify-center rounded-xl cursor-pointer transition-colors ${
              pathname === '/session' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {/* Info/Settings Icon */}
          <button 
            onClick={() => router.push('/history')}
            className={`w-16 h-16 flex items-center justify-center rounded-xl cursor-pointer transition-colors ${
              pathname === '/history' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
}

export default Sidebar;