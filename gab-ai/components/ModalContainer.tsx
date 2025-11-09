'use client';
import React from 'react';
import Sidebar from './sidebar';

interface ModalContainerProps {
  children: React.ReactNode;
}

export default function ModalContainer({ children }: ModalContainerProps) {
  return (
    <div
      className="h-screen w-full flex p-6 overflow-hidden"
      style={{ backgroundColor: '#3171C6' }}
    >
      <div className="w-[7%] flex justify-center">
        <Sidebar />
      </div>

      <div 
        className="bg-white rounded-3xl shadow-2xl w-[93%] h-full overflow-y-auto flex flex-col"
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