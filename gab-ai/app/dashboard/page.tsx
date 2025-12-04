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
        
        <main className="flex-1 p-4 sm:p-8 overflow-hidden">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="opacity-0 animate-[fadeSlideIn_0.6s_ease_0.1s_forwards]">
                  <WelcomeBanner />
                </div>
                <div className="opacity-0 animate-[fadeSlideIn_0.6s_ease_0.3s_forwards]">
                  <RecentSessions />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="opacity-0 animate-[fadeSlideIn_0.6s_ease_0.5s_forwards]">
                  <AverageScoreCard />
                </div>
                <div className="opacity-0 animate-[fadeSlideIn_0.6s_ease_0.7s_forwards]">
                  <MotivationalQuote />
                </div>
                <div className="opacity-0 animate-[fadeSlideIn_0.6s_ease_0.9s_forwards]">
                  <ActivityChart />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
