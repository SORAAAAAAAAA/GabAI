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
            <div className="w-full h-full flex items-center justify-center p-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
              <div className="absolute inset-0">
                <Image
                  src="/blueBG.png"
                  alt="Background"
                  fill
                  className="object-cover opacity-40"
                  sizes="50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-transparent"></div>
              </div>
              <div className="relative z-10 max-w-md text-center space-y-6">
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Welcome Back
                </h1>
                <p className="text-base leading-relaxed text-blue-100">
                  Continue your journey to interview mastery. Refine your skills with our AI interviewer.
                </p>
                <div className="text-sm text-blue-200 font-medium">Pick up where you left off</div>
              </div>
            </div>
          ) : (
            /* When signup is active, show login-related content on left */
            <div className="w-full h-full flex items-center justify-center p-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900">
              <div className="absolute inset-0">
                <Image
                  src="/blueBG.png"
                  alt="Background"
                  fill
                  className="object-cover opacity-40"
                  sizes="50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 to-transparent"></div>
              </div>
              <div className="relative z-10 max-w-md text-center space-y-6">
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Get Interview-Ready
                </h1>
                <p className="text-base leading-relaxed text-emerald-100">
                  Join thousands of students practicing with AI. Build confidence, improve skills, land opportunities.
                </p>
                <div className="text-sm text-emerald-200 font-medium">Free interview practice starts here</div>
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