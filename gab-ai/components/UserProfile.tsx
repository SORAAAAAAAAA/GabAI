'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronsUpDown, LogOut, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/infra/supabase/supabaseClient';

export default function UserProfile() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('');
  const [initials, setInitials] = useState<string>('U');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const fullName = 
          user.user_metadata?.name || 
          user.user_metadata?.full_name || 
          user.user_metadata?.display_name ||
          user.email?.split('@')[0] || 
          'User';
        
        setUserName(fullName);
        setUserEmail(user.email || '');
        
        const nameParts = fullName.trim().split(' ');
        const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || 'U';
        const lastInitial = nameParts.length > 1 
          ? nameParts[nameParts.length - 1]?.charAt(0).toUpperCase() 
          : '';
        setInitials(firstInitial + lastInitial);
      }
    };
    
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors text-left group"
      >
        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs border border-gray-200 shrink-0">
          {initials}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        </div>
        <ChevronsUpDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* User Info Header */}
          <div className="p-3 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 font-semibold border border-gray-200">
                {initials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                router.push('/profile');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-gray-500" />
              <span>View Profile</span>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                router.push('/settings');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Settings</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}