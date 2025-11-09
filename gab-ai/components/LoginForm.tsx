'use client';
import AuthCard from "./authCard";
import { createClient } from "@/lib/supabase/supabaseClient";
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
      footer={
        <>
          <span className="text-gray-600">Don&apos;t have an account?{" "}</span>
          <button 
            onClick={onSwitchToSignup}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Sign up here
          </button>
        </>
      }
    >
      {loginError && (
        <div className="mb-4 p-3 border rounded-lg text-sm bg-red-100 border-red-400 text-red-700">
          {loginError}
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}>
        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            value={loginData.email}
            onChange={(e) => handleLoginInputChange('email', e.target.value)}
            placeholder="Email"
            className={`w-full px-4 py-2 rounded-lg text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 transition-colors ${
              loginFieldErrors.email 
                ? 'border-2 border-red-500 focus:ring-red-500' 
                : 'focus:ring-blue-500'
            }`}
            disabled={loginLoading}
          />
          {loginFieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{loginFieldErrors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <input
            type="password"
            value={loginData.password}
            onChange={(e) => handleLoginInputChange('password', e.target.value)}
            placeholder="Password"
            className={`w-full px-4 py-2 rounded-lg text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 transition-colors ${
              loginFieldErrors.password 
                ? 'border-2 border-red-500 focus:ring-red-500' 
                : 'focus:ring-blue-500'
            }`}
            disabled={loginLoading}
          />
          {loginFieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{loginFieldErrors.password}</p>
          )}
        </div>

        {/* Login Button */}
        <button 
          type="submit" 
          disabled={loginLoading || !loginData.email || !loginData.password}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loginLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </AuthCard>
  );
}