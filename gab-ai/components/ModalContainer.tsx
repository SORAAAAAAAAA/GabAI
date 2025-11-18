'use client';
import React from 'react';

interface ModalContainerProps {
  children: React.ReactNode;
  hideBackground?: boolean;
}

export default function ModalContainer({ children, hideBackground = false }: ModalContainerProps) {
  if (hideBackground) {
    // For session pages, don't wrap with background
    return <>{children}</>;
  }

  return (
    <div
      className="h-screen w-full flex overflow-hidden"
      style={{ backgroundColor: '#3171C6' }}
    >
      <div 
        className="bg-white shadow-2xl flex-1 h-full overflow-y-auto flex flex-col"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#93C5FD #F3F4F6'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
          }
          
          div::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 10px;
          }
          
          div::-webkit-scrollbar-thumb {
            background: #93c5fd;
            border-radius: 10px;
            transition: background 0.2s ease;
          }
          
          div::-webkit-scrollbar-thumb:hover {
            background: #60a5fa;
          }
          
          div::-webkit-scrollbar-thumb:active {
            background: #3b82f6;
          }
        `}</style>
        {children}
      </div>
    </div>
  );
}