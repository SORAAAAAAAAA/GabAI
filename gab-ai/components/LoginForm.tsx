'use client';
import { Mail, Eye, EyeOff, ArrowRight, BrainCircuit } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Section: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:flex-none lg:w-[45%] xl:w-[40%] border-r border-zinc-100 relative z-10 bg-white">
        <div className="w-full max-w-md mx-auto flex flex-col h-full justify-between">
          
          {/* Brand / Logo Area */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="text-lg font-medium tracking-tight">GabAi</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
              <p className="mt-3 text-lg text-zinc-500">
                Enter your credentials to access your interview preparation dashboard.
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-6 p-4 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                {loginError}
              </div>
            )}


            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email address</label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={loginData.email}
                    onChange={(e) => handleLoginInputChange('email', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className={`block w-full px-4 py-3 text-base text-zinc-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-zinc-400 ${
                      loginFieldErrors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                        : 'border-zinc-200 focus:ring-zinc-900 focus:border-transparent'
                    }`}
                    placeholder="name@company.com"
                    disabled={loginLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>
                {loginFieldErrors.email && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{loginFieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-700">Password</label>
                  <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Forgot password?</a>
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={(e) => handleLoginInputChange('password', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className={`block w-full px-4 py-3 text-base text-zinc-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder-zinc-400 ${
                      loginFieldErrors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                        : 'border-zinc-200 focus:ring-zinc-900 focus:border-transparent'
                    }`}
                    placeholder="••••••••"
                    disabled={loginLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginFieldErrors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{loginFieldErrors.password}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={loginLoading || !loginData.email || !loginData.password}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-all shadow-sm hover:shadow-md disabled:bg-zinc-300 disabled:cursor-not-allowed"
              >
                {loginLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10">
            <p className="text-center text-sm text-zinc-500">
              Don&apos;t have an account? 
              <button 
                onClick={onSwitchToSignup}
                className="hover:underline underline-offset-4 decoration-zinc-900/20 hover:decoration-zinc-900 font-medium text-zinc-900 ml-1"
              >
                Sign up here
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
        
        {/* Concentric Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-zinc-800 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-zinc-800 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-zinc-800 rounded-full opacity-30"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-lg text-center px-8">
          
          <h2 className="text-4xl font-semibold text-white tracking-tight mb-8 leading-tight">
            Master your next interview with AI-driven insights.
          </h2>
          
          {/* Feature Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-2 rounded-full border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-md">
              <span className="text-sm font-medium text-zinc-300">Speech Analysis</span>
            </div>
            <div className="px-4 py-2 rounded-full border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-md">
              <span className="text-sm font-medium text-zinc-300">Mock Sessions</span>
            </div>
            <div className="px-4 py-2 rounded-full border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-md">
              <span className="text-sm font-medium text-zinc-300">Real-time Feedback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}