import React from 'react';

interface SessionLoaderProps {
    message?: string;
}

export default function SessionLoader({ message = "Loading..." }: SessionLoaderProps) {
    return (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-6">
                {/* Animated Spinner */}
                <div className="relative">
                    {/* Background circle */}
                    <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                    {/* Animated spinner */}
                    <div className="w-20 h-20 border-4 border-black rounded-full border-t-transparent border-r-black animate-spin absolute top-0 left-0"></div>
                </div>
                
                {/* Loading Text */}
                <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-gray-900">{message}</p>
                    <div className="flex gap-1 justify-center">
                        <span className="text-sm text-gray-500">Please wait</span>
                        <span className="inline-block animate-bounce text-gray-500" style={{ animationDelay: '0s' }}>.</span>
                        <span className="inline-block animate-bounce text-gray-500" style={{ animationDelay: '0.2s' }}>.</span>
                        <span className="inline-block animate-bounce text-gray-500" style={{ animationDelay: '0.4s' }}>.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}