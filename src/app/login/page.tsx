"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function SecureGatewayLoginPage() {
  const router = useRouter();
  
  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation checks
  const isEmailValid = email.includes("@") && email.includes(".");
  const isFormValid = isEmailValid && password.length >= 6;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setErrorMsg(null);

    // Simulate authentication pipeline
    setTimeout(() => {
      if (email === "error@arthdrishti.com") {
        setErrorMsg("Authentication failed. Invalid corporate credentials or suspended account.");
        toast.error("Sign-in failed. Please verify your credentials.");
        setLoading(false);
      } else {
        toast.success("Successfully authenticated. Directing to workspace...");
        router.push("/dashboard");
      }
    }, 1800);
  };

  return (
    <AuthLayout backLink={{ href: "/", label: "Back to Home" }}>
      <div className="space-y-6">
        
        {/* Form Titles */}
        <div className="space-y-1 text-center lg:text-left select-none">
          <h1 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-foreground-secondary font-sans leading-relaxed">
            Access your financial intelligence workspace.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-critical/10 border border-critical/20 rounded-xs flex items-start gap-2.5 text-xs text-critical font-sans animate-fade-in">
            <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
              Corporate Email
            </label>
            <input 
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com" 
              className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                Password
              </label>
              <Link 
                href="/forgot-password"
                className="text-xs font-sans text-primary hover:underline outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                Forgot Password?
              </Link>
            </div>
            
            <div className="relative">
              <input 
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full h-10 pl-3 pr-10 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors focus-visible:ring-1 focus-visible:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground p-0.5 outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember me control */}
          <div className="flex items-center gap-2 pt-1 select-none">
            <input 
              id="login-remember"
              name="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary focus:ring-offset-background"
            />
            <label htmlFor="login-remember" className="text-xs font-sans text-foreground-secondary cursor-pointer">
              Remember my device
            </label>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <Button 
              variant="primary" 
              type="submit" 
              className="w-full cursor-pointer h-10 text-sm font-semibold"
              disabled={!isFormValid || loading}
              loading={loading}
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Separator Section */}
        <div className="relative flex py-2 items-center select-none">
          <div className="flex-grow border-t border-border/40"></div>
          <span className="flex-shrink mx-4 text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-widest">
            OR CONTINUE WITH
          </span>
          <div className="flex-grow border-t border-border/40"></div>
        </div>

        {/* OAuth Social Buttons */}
        <div className="grid grid-cols-2 gap-3 select-none">
          <button 
            type="button"
            onClick={() => toast.info("Google Authentication is simulated for sandbox demo.")}
            className="flex h-10 items-center justify-center gap-2 border border-border hover:border-border-strong hover:bg-surface-hover/50 rounded-xs transition-all font-sans text-xs font-medium text-foreground cursor-pointer"
          >
            {/* Google SVG Icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>
          
          <button 
            type="button"
            onClick={() => toast.info("GitHub Authentication is simulated for sandbox demo.")}
            className="flex h-10 items-center justify-center gap-2 border border-border hover:border-border-strong hover:bg-surface-hover/50 rounded-xs transition-all font-sans text-xs font-medium text-foreground cursor-pointer"
          >
            {/* GitHub SVG Icon */}
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="pt-2 text-center select-none">
          <span className="text-xs font-sans text-foreground-secondary">
            New to ArthDrishti?{" "}
            <Link 
              href="/register" 
              className="text-primary hover:underline font-bold"
            >
              Create Account
            </Link>
          </span>
        </div>

      </div>
    </AuthLayout>
  );
}
