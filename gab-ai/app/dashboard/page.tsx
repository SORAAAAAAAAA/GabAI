'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/supabaseClient';
import Logout from '@/components/logout';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Extract name from various possible sources
        const fullName = 
          user.user_metadata?.name || 
          user.user_metadata?.full_name || 
          user.user_metadata?.display_name ||
          user.email?.split('@')[0] || 
          'User';
        
        // Get only the first word (first name)
        const firstName = fullName.trim().split(' ')[0];
        setUserName(firstName);
      } else {
        router.push('/');
      }
    };
    getUser();
  }, [router]);


  // Sample data for charts
  const lineChartData = [
    { day: 'Day 1', score: 45 },
    { day: 'Day 2', score: 55 },
    { day: 'Day 3', score: 70 },
    { day: 'Day 4', score: 75 },
    { day: 'Day 5', score: 65 },
    { day: 'Day 6', score: 40 },
  ];

  const progressData = [
    { day: 'Day 1', score: 80 },
    { day: 'Day 2', score: 90 },
    { day: 'Day 3', score: 70 },
    { day: 'Day 4', score: 85 },
    { day: 'Day 5', score: 95 },
    { day: 'Day 6', score: 60 },
  ];

  return (
    <div className="flex h-full">

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Hi {userName}, ready for your next interview session?
            </h1>
            <button onClick={() => router.push('/session')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Start Session
            </button>
          </div>
          
          {/* Account Dropdown */}
          <Logout />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interview History */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Interview History</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-900">Last Interview</div>
                <div className="text-sm text-gray-500">09/29/2025</div>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="lg:col-span-2 bg-blue-600 rounded-lg p-6 text-white">
            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span>100</span>
              </div>
            </div>
            <div className="relative h-32 mb-4">
              <svg className="w-full h-full" viewBox="0 0 300 120">
                <polyline
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  points="20,80 70,60 120,40 170,35 220,50 270,90"
                />
                {/* Data points */}
                {lineChartData.map((point, index) => (
                  <circle
                    key={index}
                    cx={20 + index * 50}
                    cy={120 - point.score}
                    r="3"
                    fill="white"
                  />
                ))}
              </svg>
            </div>
            <div className="flex justify-between text-xs">
              {lineChartData.map((point) => (
                <span key={point.day}>{point.day}</span>
              ))}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="lg:col-span-3 bg-blue-600 rounded-lg p-6 text-white">
            <h2 className="text-lg font-medium mb-4">Progress</h2>
            <div className="flex justify-between items-end h-32 space-x-4">
              {progressData.map((item) => (
                <div key={item.day} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-white/30 rounded-t mb-2 flex flex-col justify-end" style={{ height: '100px' }}>
                    <div 
                      className="w-full bg-white rounded-t transition-all duration-500"
                      style={{ height: `${item.score}%` }}
                    ></div>
                  </div>
                  <span className="text-xs">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}