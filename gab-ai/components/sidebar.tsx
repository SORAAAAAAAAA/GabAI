'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BrainCircuit, 
  LayoutDashboard, 
  PlayCircle, 
  History, 
  Settings 
} from 'lucide-react';
import NavItem from '@/components/NavbarItems';
import UserProfile from '@/components/UserProfile';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex shrink-0 z-20">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white shadow-sm">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">GabAI</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 mb-2">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Platform</span>
            </div>
            <NavItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Overview" 
              href="/" 
              active={pathname === '/'} 
            />
            <NavItem 
              icon={<PlayCircle className="w-4 h-4" />} 
              label="Interview" 
              href="/session" 
              active={pathname === '/session'} 
            />
            <NavItem 
              icon={<History className="w-4 h-4" />} 
              label="Sessions" 
              href="/history" 
              active={pathname === '/history'} 
            />
          </div>

          <div className="space-y-1">
            <div className="px-3 mb-2">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Preferences</span>
            </div>
            <NavItem 
              icon={<Settings className="w-4 h-4" />} 
              label="Settings" 
              href="/settings" 
              active={pathname === '/settings'} 
            />
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-100 bg-white">
          <UserProfile />
        </div>
      </div>
    </aside>
  );
}