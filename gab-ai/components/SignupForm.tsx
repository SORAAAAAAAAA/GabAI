'use client';
import AuthCard from "@/components/authCard"
import { createClient } from "@/lib/supabase/supabaseClient";
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
      title="Create Your Account"
      footer={
        <>
          <span className="text-gray-600">Already have an account?{" "}</span>
          <button 
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Sign in here
          </button>
        </>
      }
    >
      {signupSuccess && (
        <div className="mb-4 p-3 border rounded-lg text-sm bg-green-100 border-green-400 text-green-700">
          Check your email for a confirmation link to complete your registration.
        </div>
      )}

      {signupError && (
        <div className="mb-4 p-3 border rounded-lg text-sm bg-red-100 border-red-400 text-red-700">
          {signupError}
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSignup();
      }}>
        {/* Full Name Input */}
        <div className="mb-4">
          <input
            type="text"
            value={signupData.name}
            onChange={(e) => handleSignupInputChange('name', e.target.value)}
            placeholder="Full Name"
            className={`w-full px-4 py-2 rounded-lg text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 transition-colors ${
              signupFieldErrors.name 
                ? 'border-2 border-red-500 focus:ring-red-500' 
                : 'focus:ring-blue-500'
            }`}
            disabled={signupLoading}
          />
          {signupFieldErrors.name && (
            <p className="mt-1 text-sm text-red-600">{signupFieldErrors.name}</p>
          )}
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            value={signupData.email}
            onChange={(e) => handleSignupInputChange('email', e.target.value)}
            placeholder="Email"
            className={`w-full px-4 py-2 rounded-lg text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 transition-colors ${
              signupFieldErrors.email 
                ? 'border-2 border-red-500 focus:ring-red-500' 
                : 'focus:ring-blue-500'
            }`}
            disabled={signupLoading}
          />
          {signupFieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{signupFieldErrors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <input
            type="password"
            value={signupData.password}
            onChange={(e) => handleSignupInputChange('password', e.target.value)}
            placeholder="Password"
            className={`w-full px-4 py-2 rounded-lg text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 transition-colors ${
              signupFieldErrors.password 
                ? 'border-2 border-red-500 focus:ring-red-500' 
                : 'focus:ring-blue-500'
            }`}
            disabled={signupLoading}
          />
          {signupFieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{signupFieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="mb-4">
          <input
            type="password"
            value={signupData.confirmPassword}
            onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm Password"
            className={`w-full px-4 py-2 rounded-lg text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 transition-colors ${
              signupFieldErrors.confirmPassword 
                ? 'border-2 border-red-500 focus:ring-red-500' 
                : 'focus:ring-blue-500'
            }`}
            disabled={signupLoading}
          />
          {signupFieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{signupFieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Signup Button */}
        <button 
          type="submit" 
          disabled={signupLoading || !signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {signupLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Account...
            </div>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>
    </AuthCard>
  );
}