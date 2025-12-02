'use client';
import AuthCard from "./authCard";
import { createClient } from "@/infra/supabase/supabaseClient";
import { useState } from "react";
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginFieldErrors, setLoginFieldErrors] = useState({
    email: "",
    password: ""
  });

  const router = useRouter();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Login handlers
  const handleLoginInputChange = (field: 'email' | 'password', value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setLoginFieldErrors(prev => ({ ...prev, [field]: "" }));
    setLoginError("");
  };

  const handleLogin = async () => {
    setLoginError("");
    setLoginFieldErrors({ email: "", password: "" });

    let hasErrors = false;
    const newErrors = { email: "", password: "" };

    if (!loginData.email) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setLoginFieldErrors(newErrors);
      return;
    }

    setLoginLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setLoginError("Please confirm your email address before signing in.");
        } else {
          setLoginError(error.message);
        }
        return;
      }

      if (data.session) {
        console.log("Login successful:", data);
        console.log("Session user ID:", data.session.user.id);
        
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          router.push("/dashboard");
        }, 500);
        // Increased to 1 second
      } else {
        console.log("No session returned from login");
        setLoginError("Login failed: No session created");
      }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('An unexpected error occurred. Please try again.');
      } finally {
        setLoginLoading(false);
      }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue your interview prep journey"
      footer={
        <>
          <span className="text-gray-600">Don&apos;t have an account?{" "}</span>
          <button 
            onClick={onSwitchToSignup}
            className="text-blue-600 font-semibold hover:text-blue-700 focus:outline-none transition-colors"
          >
            Sign up here
          </button>
        </>
      }
    >
      {loginError && (
        <div className="p-4 rounded-xl text-sm bg-red-50 border-l-4 border-red-500 text-red-700">
          <div>{loginError}</div>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }} className="space-y-5">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={loginData.email}
            onChange={(e) => handleLoginInputChange('email', e.target.value)}
            placeholder="you@university.edu"
            className={`w-full px-4 py-3 rounded-xl text-gray-900 border-2 transition-all duration-200 ${
              loginFieldErrors.email 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white'
            } focus:outline-none focus:ring-2`}
            disabled={loginLoading}
          />
          {loginFieldErrors.email && (
            <p className="mt-2 text-sm text-red-600 font-medium">{loginFieldErrors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={loginData.password}
            onChange={(e) => handleLoginInputChange('password', e.target.value)}
            placeholder="••••••••"
            className={`w-full px-4 py-3 rounded-xl text-gray-900 border-2 transition-all duration-200 ${
              loginFieldErrors.password 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white'
            } focus:outline-none focus:ring-2`}
            disabled={loginLoading}
          />
          {loginFieldErrors.password && (
            <p className="mt-2 text-sm text-red-600 font-medium">{loginFieldErrors.password}</p>
          )}
        </div>

        {/* Login Button */}
        <button 
          type="submit" 
          disabled={loginLoading || !loginData.email || !loginData.password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {loginLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>
    </AuthCard>
  );
}