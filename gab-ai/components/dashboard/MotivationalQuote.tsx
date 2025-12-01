import React from 'react';
import { Sparkles } from 'lucide-react';

export default function MotivationalQuote() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Daily Inspiration</span>
      </div>
      <blockquote className="mb-3">
        <p className="text-sm text-gray-800 italic leading-relaxed font-medium">
          "Success is not final, failure is not fatal: it is the courage to continue that counts."
        </p>
      </blockquote>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
          WC
        </div>
        <span className="text-xs text-gray-500">— Winston Churchill</span>
      </div>
    </div>
  );
}