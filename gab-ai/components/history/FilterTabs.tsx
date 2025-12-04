'use client';
import React, { useState } from 'react';

export default function FilterTabs() {
  const [activeTab, setActiveTab] = useState<'all'>('all');

  return (
    <div className="flex border-b border-gray-200">
      <button 
        onClick={() => setActiveTab('all')}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === 'all'
            ? 'text-gray-900 border-b-2 border-black -mb-px'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        All Interviews
      </button>
    </div>
  );
}