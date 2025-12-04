import React from 'react';

interface ActivityDay {
  label: string;
  height: string;
  active: boolean;
  value?: number;
}

export const ActivityChart: React.FC = () => {
  const days: ActivityDay[] = [
    { label: 'M', height: '45%', active: false },
    { label: 'T', height: '60%', active: false },
    { label: 'W', height: '85%', active: true, value: 85 },
    { label: 'T', height: '30%', active: false },
    { label: 'F', height: '45%', active: false },
    { label: 'S', height: '75%', active: true },
    { label: 'S', height: '40%', active: false }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-gray-900">Activity</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Last 7 Days</span>
      </div>
      
      <div className="h-40 flex items-end justify-between gap-2">
        {days.map((day, index) => (
          <div key={index} className="w-full flex flex-col items-center gap-2 group relative">
            {day.value && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {day.value}
              </div>
            )}
            <div
              className={`w-full rounded-sm ${
                day.active
                  ? 'bg-gray-900'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              } transition-colors`}
              style={{ height: day.height }}
            ></div>
            <span className="text-[10px] text-gray-400 font-medium">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};