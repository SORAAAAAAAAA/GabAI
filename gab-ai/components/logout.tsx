import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/infra/supabase/supabaseClient';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}
  
export default function Logout() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/');
      }
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  
  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 text-blue-900 px-4 py-2 rounded-3xl hover:border-blue-300 hover:shadow-md transition duration-200"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold shadow-sm">
          {userInitial}
        </div>
        <span className="hidden sm:inline text-sm font-medium">{userName}</span>
        <svg className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-blue-100">{user?.email}</p>
          </div>
          
          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                router.push('/dashboard');
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition duration-150"
            >
              Dashboard
            </button>
            
            <button
              onClick={() => {
                router.push('/history');
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition duration-150"
            >
              Interview History
            </button>
          </div>
          
          <div className="border-t border-gray-100" />
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition duration-150"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}