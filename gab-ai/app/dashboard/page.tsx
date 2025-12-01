<<<<<<< Updated upstream
'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/infra/supabase/supabaseClient';
import Logout from '@/components/logout';
=======
import React from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/dashboard/header';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import RecentSessions from '@/components/dashboard/RecentSession';
import AverageScoreCard from '@/components/dashboard/AveScoreCard';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import ActivityChart from '@/components/dashboard/ActivityChart';

// This is the main page component
// Location: src/pages/Dashboard.tsx
>>>>>>> Stashed changes

export default function Dashboard() {
  return (
<<<<<<< Updated upstream
    <div className="flex h-full bg-gray-50">

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hey, {userName}!
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Ready for your next interview? Let&apos;s sharpen your skills.
              </p>
            </div>
            
            {/* Account Dropdown */}
            <Logout />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Quick Action Button */}
          <div className="mb-8">
            <button 
              onClick={() => router.push('/session')} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <span>Start New Interview</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Last Interview Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Interview</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">09/29</p>
                  <p className="text-xs text-gray-500 mt-1">2 weeks ago</p>
                </div>
=======
    <div className="bg-[#FAFAFA] text-gray-900 antialiased h-screen flex overflow-hidden">
      
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <WelcomeBanner />
                <RecentSessions />
>>>>>>> Stashed changes
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <AverageScoreCard />
                <MotivationalQuote />
                <ActivityChart />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}