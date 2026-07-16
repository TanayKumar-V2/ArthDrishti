"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { KeyRound, MailCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isEmailValid = email.includes("@") && email.includes(".");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setLoading(true);

    // Simulate OTP recovery dispatch
    setTimeout(() => {
      toast.success("Recovery instructions dispatched! Check your inbox.");
      setSubmitted(true);
      setLoading(false);
    }, 1800);
  };

  const handleResend = () => {
    toast.success("Recovery email re-sent!");
  };

  return (
    <AuthLayout backLink={{ href: "/login", label: "Back to Login" }}>
      <div className="space-y-6">
        
        {/* State 1: Recovery Form */}
        {!submitted ? (
          <>
            {/* Header Titles */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-3 select-none">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <KeyRound className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
                  Forgot Password?
                </h1>
                <p className="text-sm text-foreground-secondary font-sans leading-relaxed">
                  No worries. Enter your corporate email and we will dispatch recovery instructions.
                </p>
              </div>
            </div>

            {/* Email input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="recovery-email" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                  Corporate Email
                </label>
                <input 
                  id="recovery-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
                />
              </div>

              <div className="pt-2">
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-full cursor-pointer h-10 text-sm font-semibold"
                  disabled={!isEmailValid || loading}
                  loading={loading}
                >
                  Send Recovery Link
                </Button>
              </div>
            </form>

            {/* Back link */}
            <div className="pt-2 text-center lg:text-left select-none">
              <Link 
                href="/login" 
                className="text-xs font-sans font-semibold text-foreground-secondary hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          /* State 2: Success Prompt */
          <div className="space-y-6 text-center select-none animate-fade-in">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-positive/10 border border-positive/20 flex items-center justify-center text-positive">
                <MailCheck className="h-6 w-6" />
              </div>
            </div>

            {/* Titles */}
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
                Check your inbox
              </h2>
              <p className="text-xs text-foreground-secondary font-sans leading-normal max-w-xs mx-auto">
                We have dispatched a temporary password reset code to <span className="font-bold text-foreground">{email}</span>.
              </p>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <span className="text-foreground-secondary block">
                Did not receive the recovery email?
              </span>
              <button 
                onClick={handleResend}
                className="text-primary hover:underline font-bold cursor-pointer"
              >
                Click to resend
              </button>
            </div>

            <div className="pt-4 border-t border-border/20 max-w-xs mx-auto">
              <Button variant="secondary" size="md" asChild className="w-full">
                <Link href="/login" className="gap-1.5 justify-center">
                  <ArrowLeft className="h-4 w-4" />
                  Return to Login
                </Link>
              </Button>
            </div>
          </div>
        )}

      </div>
    </AuthLayout>
  );
}
