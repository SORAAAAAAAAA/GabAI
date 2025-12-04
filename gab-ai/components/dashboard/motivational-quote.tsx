"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const quotes = [
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    initials: "WC",
  },
  {
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt",
    initials: "FR",
  },
  {
    text: "Whether you think you can or think you can’t, you’re right.",
    author: "Henry Ford",
    initials: "HF",
  },
  {
    text: "Do not wait to strike till the iron is hot; but make it hot by striking.",
    author: "William Butler Yeats",
    initials: "WY",
  },
  {
    text: "The harder you work for something, the greater you’ll feel when you achieve it.",
    author: "Unknown",
    initials: "U",
  },
  {
    text: "Don’t watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    initials: "SL",
  },
  {
    text: "Great things never come from comfort zones.",
    author: "Unknown",
    initials: "U",
  },
  {
    text: "Believe you can and you’re halfway there.",
    author: "Theodore Roosevelt",
    initials: "TR",
  },
  {
    text: "Your limitation—it’s only your imagination.",
    author: "Unknown",
    initials: "U",
  },
  {
    text: "Push yourself, because no one else is going to do it for you.",
    author: "Unknown",
    initials: "U",
  },
];

export const MotivationalQuote: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true); // start slide + fade out

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
        setIsAnimating(false); // slide + fade in
      }, 350); // matches animation duration
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = quotes[index];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Daily Inspiration
        </span>
      </div>

      {/* Animated Quote */}
      <div
        className={`transition-all duration-500 ${
          isAnimating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
        }`}
      >
        <blockquote className="mb-3">
          <p className="text-sm text-gray-800 italic leading-relaxed font-medium">
            &quot;{current.text}&quot;
          </p>
        </blockquote>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
            {current.initials}
          </div>
          <span className="text-xs text-gray-500">— {current.author}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
        <div
          key={index}
          className="h-full bg-black rounded-full animate-[fill_5s_linear]"
        ></div>
      </div>

      {/* Tailwind keyframes */}
      <style jsx>{`
        @keyframes fill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
