import React from 'react';
import { Header } from '@/components/dashboard/header';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { RecentSessions } from '@/components/dashboard/recent-sesion';
import { AverageScoreCard } from '@/components/dashboard/average-score';
import { MotivationalQuote } from '@/components/dashboard/motivational-quote';
import { ActivityChart } from '@/components/dashboard/activity-chart';

export default function Dashboard() {
  return (
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
