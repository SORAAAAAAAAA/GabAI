'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { SpinnerIcon } from '@phosphor-icons/react/dist/ssr';

interface EndSessionLoaderProps {
  isVisible?: boolean;
}

export const EndSessionLoader: React.FC<EndSessionLoaderProps> = ({
  isVisible = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Analyzing your interview performance';
  const [dotCount, setDotCount] = useState(0);

  // Typing effect for main text
  useEffect(() => {
    if (!isVisible) return;

    const charIndex = displayedText.length;
    if (charIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, charIndex + 1));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [displayedText, isVisible, fullText]);

  // Animate dots
  useEffect(() => {
    if (!isVisible) return;

    const dotTimer = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(dotTimer);
  }, [isVisible]);

  if (!isVisible) return null;

  const dots = '.'.repeat(dotCount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAFA]"
    >
      {/* Content Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02)] text-center">
          {/* Spinner Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <SpinnerIcon size={56} weight="bold" className="text-gray-900" />
          </motion.div>

          {/* Main Text with Typing Effect */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 min-h-[3rem] flex items-center justify-center">
            {displayedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity }}
              className="text-gray-900"
            >
              {dots}
            </motion.span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 mb-6">
            Generating personalized feedback based on your responses
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-8">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-full bg-gray-900 w-full"
            />
          </div>

          {/* Loading Steps */}
          <div className="space-y-3 text-left mb-6">
            {[
              { label: 'Analyzing responses', delay: 0 },
              { label: 'Evaluating communication skills', delay: 0.1 },
              { label: 'Generating insights', delay: 0.2 },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay + 0.3 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{ scale: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: step.delay,
                    ease: 'easeInOut',
                  }}
                  className="w-1.5 h-1.5 bg-gray-900 rounded-full flex-shrink-0"
                />
                <span className="text-sm text-gray-600">{step.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Info section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 bg-gray-50 rounded-lg border border-gray-100"
          >
            <p className="text-xs text-gray-600">
              Your detailed feedback will include strengths, areas for improvement, and actionable recommendations.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EndSessionLoader;
