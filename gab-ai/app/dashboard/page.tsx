import React from 'react';
import Header from '@/components/dashboard/header';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import RecentSessions from '@/components/dashboard/RecentSession';
import AverageScoreCard from '@/components/dashboard/AveScoreCard';
import MotivationalQuote from '@/components/dashboard/MotivationalQuote';
import ActivityChart from '@/components/dashboard/ActivityChart';

// This is the main page component
// Location: src/pages/Dashboard.tsx

export default function Dashboard() {
  return (
    <div className="bg-[#FAFAFA] text-gray-900 antialiased h-screen flex flex-col lg:flex-row overflow-hidden">
      
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Left Column */}
              <div className="md:col-span-2 lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
                <WelcomeBanner />
                <RecentSessions />
              </div>

              {/* Right Column */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
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