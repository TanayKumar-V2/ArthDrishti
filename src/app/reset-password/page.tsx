"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { ShieldAlert, Check, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Requirements checklist checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const matchesConfirm = password !== "" && password === confirmPassword;

  // Strength score
  let strengthScore = 0;
  if (hasMinLength) strengthScore += 1;
  if (hasUppercase && hasNumber) strengthScore += 1;
  if (hasSpecialChar) strengthScore += 1;

  const strengthLabels = ["Weak", "Fair", "Strong"];
  const strengthColors = ["bg-critical", "bg-warning", "bg-positive"];
  const currentStrength = strengthLabels[Math.max(0, strengthScore - 1)] || "Weak";
  const currentStrengthColor = strengthColors[Math.max(0, strengthScore - 1)] || "bg-critical";

  // Form validity
  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && matchesConfirm;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    // Simulate reset database pipeline
    setTimeout(() => {
      toast.success("Password successfully reset! Sign in with your new credentials.");
      setSuccess(true);
      setLoading(false);
    }, 1800);
  };

  const checklistItems = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "At least 1 uppercase letter", met: hasUppercase },
    { label: "At least 1 digit (0-9)", met: hasNumber },
    { label: "At least 1 special character", met: hasSpecialChar },
    { label: "Passwords match", met: matchesConfirm },
  ];

  return (
    <AuthLayout backLink={{ href: "/login", label: "Back to Login" }}>
      <div className="space-y-6">
        
        {/* State 1: Reset Form */}
        {!success ? (
          <>
            {/* Header Titles */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-3 select-none">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
                  Reset Password
                </h1>
                <p className="text-sm text-foreground-secondary font-sans leading-relaxed">
                  Establish a secure password for your intelligence workspace.
                </p>
              </div>
            </div>

            {/* Input fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reset-new" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                  New Password
                </label>
                <input 
                  id="reset-new"
                  name="new-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters" 
                  className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reset-confirm" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                  Confirm Password
                </label>
                <input 
                  id="reset-confirm"
                  name="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password" 
                  className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
                />
              </div>

              {/* Password strength indicator visualizer */}
              {password && (
                <div className="space-y-1.5 select-none animate-fade-in pt-1">
                  <div className="flex items-center justify-between text-[10px] font-sans font-bold text-foreground-secondary">
                    <span>PASSWORD STRENGTH</span>
                    <span className={cn(
                      "uppercase tracking-widest",
                      strengthScore === 1 ? "text-critical" : strengthScore === 2 ? "text-warning" : "text-positive"
                    )}>
                      {currentStrength}
                    </span>
                  </div>
                  
                  {/* Strength Bar */}
                  <div className="flex gap-1.5 h-1 w-full bg-border/40 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", currentStrengthColor)} 
                      style={{ width: `${strengthScore * 33.3}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements Checklist visual indicators */}
              <div className="space-y-1.5 pt-2 text-[11px] font-sans text-foreground-secondary select-none">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className={cn(
                      "h-4 w-4 rounded-full flex items-center justify-center border transition-all duration-300",
                      item.met ? "bg-positive/10 border-positive text-positive" : "border-border"
                    )}>
                      {item.met && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className={cn(item.met ? "text-foreground font-medium" : "text-foreground-secondary")}>
                      {item.label}
                    </span>
                  </div>
                ))}
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
                  Update Password
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* State 2: Reset Success Prompt */
          <div className="space-y-6 text-center select-none animate-fade-in">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-positive/10 border border-positive/20 flex items-center justify-center text-positive">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            {/* Titles */}
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
                Password updated
              </h2>
              <p className="text-xs text-foreground-secondary font-sans leading-normal max-w-xs mx-auto">
                Your password has been successfully modified. Access credentials are now updated across all corporate systems.
              </p>
            </div>

            <div className="pt-4 border-t border-border/20 max-w-xs mx-auto">
              <Button variant="primary" size="md" asChild className="w-full">
                <Link href="/login" className="gap-1.5 justify-center">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

      </div>
    </AuthLayout>
  );
}
