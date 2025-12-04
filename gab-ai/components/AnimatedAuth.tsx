'use client';
import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

type AuthMode = 'login' | 'signup';

export default function AnimatedAuth({ initialMode = 'login' }: { initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const switchToLogin = () => setMode('login');
  const switchToSignup = () => setMode('signup');

  return (
    <div className="flex w-full min-h-screen bg-white">
      {mode === 'login' ? (
        <LoginForm onSwitchToSignup={switchToSignup} />
      ) : (
        <SignupForm onSwitchToLogin={switchToLogin} />
      )}
    </div>
  );
}