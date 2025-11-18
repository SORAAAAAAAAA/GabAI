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
              <span className="text-xl">🎤</span>
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
              </div>
            </div>

            {/* Total Sessions Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                  <p className="text-xs text-green-600 mt-1">+2 this month</p>
                </div>
              </div>
            </div>

            {/* Average Score Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">78%</p>
                  <p className="text-xs text-blue-600 mt-1">↑ 5% from last week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
              <div className="space-y-4">
                {lineChartData.map((point, index) => (
                  <div key={point.day} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-12">{point.day}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                        style={{ width: `${point.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{point.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Snapshot</h3>
              <div className="flex justify-between items-end h-40 gap-2">
                {progressData.map((item, index) => (
                  <div key={item.day} className="flex flex-col items-center flex-1">
                    <div className="relative w-full flex flex-col justify-end mb-3" style={{ height: '120px' }}>
                      <div className="w-full bg-gray-100 rounded-lg"></div>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-lg absolute bottom-0 transition-all duration-500"
                        style={{ height: `${item.score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-4 px-1">
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
