'use client';
import { Command, BrainCircuit, Mail, Eye, EyeOff, ArrowRight, Rocket } from "lucide-react";
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!agreedToTerms) {
      setSignupError("Please agree to the Terms of Service and Privacy Policy");
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
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Section: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:flex-none lg:w-[45%] xl:w-[40%] border-r border-zinc-100 relative z-10 bg-white">
        <div className="w-full max-w-md mx-auto flex flex-col h-full justify-between">
          
          {/* Brand / Logo Area */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="text-lg font-medium tracking-tight">GabAi</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Create an account</h1>
              <p className="mt-2 text-base text-zinc-500">
                Start your interview preparation journey today.
              </p>
            </div>

            {/* Success Message */}
            {signupSuccess && (
              <div className="mb-6 p-4 rounded-lg text-sm bg-green-50 border border-green-200 text-green-700">
                Check your email for a confirmation link to complete your registration.
              </div>
            )}

            {/* Error Message */}
            {signupError && (
              <div className="mb-6 p-4 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                {signupError}
              </div>
            )} 

            <div className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700">Full Name</label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={signupData.name}
                    onChange={(e) => handleSignupInputChange('name', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                    className={`block w-full px-4 py-2.5 text-base text-zinc-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-zinc-400 ${
                      signupFieldErrors.name 
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                        : 'border-zinc-200 focus:ring-zinc-900 focus:border-transparent'
                    }`}
                    placeholder="John Doe"
                    disabled={signupLoading}
                  />
                </div>
                {signupFieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{signupFieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email address</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={signupData.email}
                    onChange={(e) => handleSignupInputChange('email', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                    className={`block w-full px-4 py-2.5 text-base text-zinc-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-zinc-400 ${
                      signupFieldErrors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                        : 'border-zinc-200 focus:ring-zinc-900 focus:border-transparent'
                    }`}
                    placeholder="name@company.com"
                    disabled={signupLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                {signupFieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{signupFieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700">Password</label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={signupData.password}
                    onChange={(e) => handleSignupInputChange('password', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                    className={`block w-full px-4 py-2.5 text-base text-zinc-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-zinc-400 ${
                      signupFieldErrors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                        : 'border-zinc-200 focus:ring-zinc-900 focus:border-transparent'
                    }`}
                    placeholder="Create a password"
                    disabled={signupLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500">Must be at least 6 characters.</p>
                {signupFieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{signupFieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700">Confirm Password</label>
                <div className="relative group">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={signupData.confirmPassword}
                    onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                    className={`block w-full px-4 py-2.5 text-base text-zinc-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-zinc-400 ${
                      signupFieldErrors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                        : 'border-zinc-200 focus:ring-zinc-900 focus:border-transparent'
                    }`}
                    placeholder="Confirm your password"
                    disabled={signupLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupFieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{signupFieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-1">
                <label className="flex items-center cursor-pointer relative group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all group-hover:border-zinc-400 ${
                    agreedToTerms ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white'
                  }`}>
                    {agreedToTerms && (
                      <svg className="w-3 h-3 text-white pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <span className="ml-3 text-sm text-zinc-600">
                    I agree to the <a href="#" className="text-zinc-900 font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-zinc-900 font-medium hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSignup}
                disabled={signupLoading || !signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword || !agreedToTerms}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-all shadow-sm hover:shadow-md mt-2 disabled:bg-zinc-300 disabled:cursor-not-allowed"
              >
                {signupLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <p className="text-center text-sm text-zinc-500">
              Already have an account? 
              <button 
                onClick={onSwitchToLogin}
                className="hover:underline underline-offset-4 decoration-zinc-900/20 hover:decoration-zinc-900 font-medium text-zinc-900 ml-1"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Visual/Art (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-zinc-950 items-center justify-center">
        {/* Abstract Geometric Background Pattern */}
        <div className="absolute inset-0 w-full h-full bg-gradient-radial from-zinc-800 via-zinc-950 to-black opacity-80"></div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '60px 60px'}}></div>
        
        {/* Rotating circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-zinc-800 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-zinc-700/50 rounded-full opacity-30"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-lg text-center px-8">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl mb-8 shadow-2xl">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          
          <h2 className="text-4xl font-semibold text-white tracking-tight mb-6 leading-tight">
            Join thousands of candidates getting hired.
          </h2>
          
          <p className="text-lg text-zinc-400 font-light mb-8">
            Gain personalized learning paths, and advanced AI mock interviews.
          </p>
        </div>
      </div>
    </div>
  );
}