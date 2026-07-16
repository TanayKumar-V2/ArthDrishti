"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegistrationPage() {
  const router = useRouter();
  
  // Step indicator
  const [step, setStep] = useState(1);

  // Form values
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [accountType, setAccountType] = useState<"customer" | "officer">("customer");
  const [organization, setOrganization] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Loading/submission states
  const [loading, setLoading] = useState(false);

  // Step 1 Validation
  const isEmailValid = email.includes("@") && email.includes(".");
  const passwordsMatch = password === confirmPassword;
  const isPasswordStrong = password.length >= 8;
  const isStep1Valid = fullName.trim().length > 0 && isEmailValid && isPasswordStrong && passwordsMatch;

  // Step 2 Validation
  const isStep2Valid = agreedToTerms && (accountType === "customer" || organization.trim().length > 0);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStep1Valid) {
      setStep(2);
    } else {
      toast.error("Please complete all Step 1 requirements accurately.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid) return;

    setLoading(true);

    // Simulate database registration call
    setTimeout(() => {
      toast.success("Account successfully created! Verification OTP dispatched.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }, 1800);
  };

  return (
    <AuthLayout backLink={{ href: "/login", label: "Back to Login" }}>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="space-y-1 text-center lg:text-left select-none">
          <h1 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
            Create account
          </h1>
          <p className="text-sm text-foreground-secondary font-sans leading-relaxed">
            {step === 1 
              ? "Provide your corporate contact details."
              : "Specify your institutional role and terms."}
          </p>
        </div>

        {/* Wizard Step Progress bar */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex-1 h-1 rounded-full bg-border/40 relative overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-foreground-muted whitespace-nowrap">
            Step {step} of 2
          </span>
        </div>

        {/* Step 1: Personal Credentials */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                Full Name
              </label>
              <input 
                id="reg-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Chahar" 
                className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                Corporate Email
              </label>
              <input 
                id="reg-email"
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

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                Password
              </label>
              <input 
                id="reg-password"
                name="password"
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
              <label htmlFor="reg-confirm" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                Confirm Password
              </label>
              <input 
                id="reg-confirm"
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

            {/* Live feedback indicators */}
            <div className="space-y-1.5 pt-1 text-[11px] font-sans text-foreground-secondary select-none">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "h-4 w-4 rounded-full flex items-center justify-center border",
                  isPasswordStrong ? "bg-positive/10 border-positive text-positive" : "border-border"
                )}>
                  {isPasswordStrong && <Check className="h-2.5 w-2.5" />}
                </span>
                <span>At least 8 characters length</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "h-4 w-4 rounded-full flex items-center justify-center border",
                  confirmPassword && passwordsMatch ? "bg-positive/10 border-positive text-positive" : "border-border"
                )}>
                  {confirmPassword && passwordsMatch && <Check className="h-2.5 w-2.5" />}
                </span>
                <span>Passwords match</span>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="primary" 
                type="submit" 
                className="w-full cursor-pointer h-10 text-sm font-semibold gap-1.5"
                disabled={!isStep1Valid}
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Role Details */}
        {step === 2 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Account Type selectors */}
            <div className="space-y-2 select-none">
              <span className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                Account Type
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("customer")}
                  className={cn(
                    "p-3 rounded-xs border text-left flex flex-col gap-1 transition-all outline-none cursor-pointer",
                    accountType === "customer"
                      ? "bg-primary/5 border-primary shadow-xs"
                      : "bg-surface border-border hover:border-border-strong"
                  )}
                >
                  <span className="text-xs font-bold text-foreground">Customer</span>
                  <span className="text-[10px] text-foreground-secondary leading-normal">Access financial advisor and runway forecasts.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("officer")}
                  className={cn(
                    "p-3 rounded-xs border text-left flex flex-col gap-1 transition-all outline-none cursor-pointer",
                    accountType === "officer"
                      ? "bg-primary/5 border-primary shadow-xs"
                      : "bg-surface border-border hover:border-border-strong"
                  )}
                >
                  <span className="text-xs font-bold text-foreground">Loan Officer</span>
                  <span className="text-[10px] text-foreground-secondary leading-normal">Review applications and check default risks.</span>
                </button>
              </div>
            </div>

            {/* Conditional Organization Field */}
            {accountType === "officer" && (
              <div className="space-y-1.5 animate-fade-in">
                <label htmlFor="reg-org" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
                  Organization / Institution Name
                </label>
                <input 
                  id="reg-org"
                  name="organization"
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Apex Lending Corp" 
                  className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
                />
              </div>
            )}

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-2 select-none">
              <input 
                id="reg-terms"
                name="terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary focus:ring-offset-background mt-0.5"
              />
              <label htmlFor="reg-terms" className="text-xs font-sans text-foreground-secondary leading-normal cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>.
              </label>
            </div>

            {/* Actions triggers */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-10 items-center justify-center gap-1.5 border border-border hover:border-border-strong hover:bg-surface-hover/50 px-4 rounded-xs transition-all font-sans text-xs font-medium text-foreground cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <Button 
                variant="primary" 
                type="submit" 
                className="flex-1 cursor-pointer h-10 text-sm font-semibold"
                disabled={!isStep2Valid || loading}
                loading={loading}
              >
                Create Account
              </Button>
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-2 text-center select-none">
          <span className="text-xs font-sans text-foreground-secondary">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="text-primary hover:underline font-bold"
            >
              Sign In
            </Link>
          </span>
        </div>

      </div>
    </AuthLayout>
  );
}
