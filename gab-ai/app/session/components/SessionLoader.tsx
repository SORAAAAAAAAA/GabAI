
import React from 'react';

interface SessionLoaderProps {
    message?: string;
}

export default function SessionLoader({ message = "Loading..." }: SessionLoaderProps) {
    return (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center space-y-4">
                {/* Spinner */}
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
                
                {/* Message */}
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-900">{message}</p>
                    <p className="text-sm text-gray-500 mt-1">Please wait...</p>
                </div>
            </div>
        </div>
    );
}