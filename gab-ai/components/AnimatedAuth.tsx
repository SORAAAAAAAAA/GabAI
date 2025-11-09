'use client';
import Image from "next/image";
import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

type AuthMode = 'login' | 'signup';

export default function AnimatedAuth({ initialMode = 'login' }: { initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const switchToLogin = () => setMode('login');
  const switchToSignup = () => setMode('signup');

  return (
    <div className="flex w-full h-screen bg-white relative overflow-hidden">
        
        {/* Background Panel that slides and covers inactive form */}
        <div 
          className={`absolute top-0 w-1/2 h-full z-30 transition-all duration-700 ease-out ${
            mode === 'login' ? 'left-1/2' : 'left-0'
          }`}
        >
          {mode === 'login' ? (
            /* When login is active, show signup-related content on right */
            <div className="w-full h-full flex items-center justify-center p-10 bg-gradient-to-br from-blue-600 to-blue-800">
              <div className="absolute inset-0">
                <Image
                  src="/blueBG.png"
                  alt="Background"
                  fill
                  className="object-cover opacity-60"
                  sizes="50vw"
                  priority
                />
              </div>
              <div className="relative z-10 max-w-md text-center">
                <h1 className="text-4xl font-bold mb-4 text-white">
                  Welcome Back to GabAI
                </h1>
                <p className="text-sm leading-relaxed text-white">
                  Continue your journey to interview success. Practice with AI-powered sessions and track your progress.
                </p>
              </div>
            </div>
          ) : (
            /* When signup is active, show login-related content on left */
            <div className="w-full h-full flex items-center justify-center p-10 bg-gradient-to-br from-green-600 to-green-800">
              <div className="absolute inset-0">
                <Image
                  src="/blueBG.png"
                  alt="Background"
                  fill
                  className="object-cover opacity-60"
                  sizes="50vw"
                  priority
                />
              </div>
              <div className="relative z-10 max-w-md text-center">
                <h1 className="text-4xl font-bold mb-4 text-white">
                  Get Interview-Ready with GabAI
                </h1>
                <p className="text-sm leading-relaxed text-white">
                   Join students and job seekers who are building confidence, improving communication skills, and landing opportunities through AI-powered interview practice.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Login Form - Fixed on Left */}
        <div className="w-1/2 flex items-center justify-center p-8 relative z-20">
          <div className="w-full max-w-md">
            <LoginForm onSwitchToSignup={switchToSignup} />
          </div>
        </div>

        {/* Signup Form - Fixed on Right */}
        <div className="w-1/2 flex items-center justify-center p-8 relative z-20">
          <div className="w-full max-w-md">
            <SignupForm onSwitchToLogin={switchToLogin} />
          </div>
        </div>

    </div>
  );
}