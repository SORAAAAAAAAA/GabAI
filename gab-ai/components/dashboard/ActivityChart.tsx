import React from 'react';

export default function ActivityChart() {
  const days = [
    { label: 'M', height: 45 },
    { label: 'T', height: 60 },
    { label: 'W', height: 85, value: 85, active: true },
    { label: 'T', height: 30 },
    { label: 'F', height: 45 },
    { label: 'S', height: 75, active: true },
    { label: 'S', height: 40 }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-gray-900">Activity</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Last 7 Days</span>
      </div>
      
      <div className="h-40 flex items-end justify-between gap-2">
        {days.map((day, index) => (
          <div key={index} className="w-full flex flex-col items-center gap-2 group">
            {day.value && (
              <div className="absolute -mt-8 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {day.value}
              </div>
            )}
            <div
              className={`w-full rounded-sm transition-colors ${
                day.active
                  ? 'bg-gray-900'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}
              style={{ height: `${day.height}%` }}
            ></div>
            <span className="text-[10px] text-gray-400 font-medium">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
