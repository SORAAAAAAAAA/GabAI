'use client';
import AuthCard from "@/components/authCard"
import { createClient } from "@/infra/supabase/supabaseClient";
import { useState } from "react";
import { useRouter } from 'next/navigation';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [signupData, setSignupData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupFieldErrors, setSignupFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const router = useRouter();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // Signup handlers
  const handleSignupInputChange = (field: keyof SignupFormData, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    setSignupFieldErrors(prev => ({ ...prev, [field]: "" }));
    setSignupError("");
  };

  const handleSignup = async () => {
    setSignupError("");
    setSignupFieldErrors({ name: "", email: "", password: "", confirmPassword: "" });

    let hasErrors = false;
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };

    if (!signupData.name.trim()) {
      newErrors.name = "Full name is required";
      hasErrors = true;
    }

    if (!signupData.email) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!validateEmail(signupData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    if (!signupData.password) {
      newErrors.password = "Password is required";
      hasErrors = true;
    } else if (!validatePassword(signupData.password)) {
      newErrors.password = "Password must be at least 6 characters long";
      hasErrors = true;
    }

    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      hasErrors = true;
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    if (hasErrors) {
      setSignupFieldErrors(newErrors);
      return;
    }

    setSignupLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.name.trim(),
            display_name: signupData.name.trim()
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setSignupError("An account with this email already exists. Please use a different email or try logging in instead.");
        } else if (error.message.includes("Password should be")) {
          setSignupError("Password does not meet requirements. Please choose a stronger password.");
        } else if (error.message.includes("rate limit")) {
          setSignupError("Too many signup attempts. Please wait a moment before trying again.");
        } else {
          setSignupError(error.message);
        }
        return;
      }

      if (data.user && !data.session) {
        setSignupSuccess(true);
        setTimeout(() => {
          onSwitchToLogin();
        }, 3000);
      } else if (data.session) {
        await fetch("/api/set-session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ access_token: data.session.access_token }),
        });
        router.push("/dashboard");
      }

    } catch (error) {
      console.error('Signup error:', error);
      setSignupError('An unexpected error occurred. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Join thousands of students mastering interviews"
      footer={
        <>
          <span className="text-gray-600">Already have an account?{" "}</span>
          <button 
            onClick={onSwitchToLogin}
            className="text-blue-600 font-semibold hover:text-blue-700 focus:outline-none transition-colors"
          >
            Sign in here
          </button>
        </>
      }
    >
      {signupSuccess && (
        <div className="p-4 rounded-xl text-sm bg-green-50 border-l-4 border-green-500 text-green-700">
          <div>Check your email for a confirmation link to complete your registration.</div>
        </div>
      )}

      {signupError && (
        <div className="p-4 rounded-xl text-sm bg-red-50 border-l-4 border-red-500 text-red-700">
          <div>{signupError}</div>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSignup();
      }} className="space-y-5">
        {/* Full Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={signupData.name}
            onChange={(e) => handleSignupInputChange('name', e.target.value)}
            placeholder="John Doe"
            className={`w-full px-4 py-3 rounded-xl text-gray-900 border-2 transition-all duration-200 ${
              signupFieldErrors.name 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white'
            } focus:outline-none focus:ring-2`}
            disabled={signupLoading}
          />
          {signupFieldErrors.name && (
            <p className="mt-2 text-sm text-red-600 font-medium">{signupFieldErrors.name}</p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={signupData.email}
            onChange={(e) => handleSignupInputChange('email', e.target.value)}
            placeholder="you@university.edu"
            className={`w-full px-4 py-3 rounded-xl text-gray-900 border-2 transition-all duration-200 ${
              signupFieldErrors.email 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white'
            } focus:outline-none focus:ring-2`}
            disabled={signupLoading}
          />
          {signupFieldErrors.email && (
            <p className="mt-2 text-sm text-red-600 font-medium">{signupFieldErrors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={signupData.password}
            onChange={(e) => handleSignupInputChange('password', e.target.value)}
            placeholder="••••••••"
            className={`w-full px-4 py-3 rounded-xl text-gray-900 border-2 transition-all duration-200 ${
              signupFieldErrors.password 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white'
            } focus:outline-none focus:ring-2`}
            disabled={signupLoading}
          />
          <p className="mt-2 text-xs text-gray-500">Minimum 6 characters</p>
          {signupFieldErrors.password && (
            <p className="mt-1 text-sm text-red-600 font-medium">{signupFieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            value={signupData.confirmPassword}
            onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
            placeholder="••••••••"
            className={`w-full px-4 py-3 rounded-xl text-gray-900 border-2 transition-all duration-200 ${
              signupFieldErrors.confirmPassword 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white'
            } focus:outline-none focus:ring-2`}
            disabled={signupLoading}
          />
          {signupFieldErrors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600 font-medium">{signupFieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Signup Button */}
        <button 
          type="submit" 
          disabled={signupLoading || !signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {signupLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Creating account...</span>
            </>
          ) : (
            <span>Get Started</span>
          )}
        </button>
      </form>
    </AuthCard>
  );
}