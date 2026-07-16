"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { MailCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract target email
  const emailTarget = searchParams.get("email") || "your corporate email";

  // OTP Code states (6 blocks)
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // States
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<"invalid" | "expired" | null>(null);
  
  // Resend Timer states
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const triggerVerification = (fullCode: string) => {
    setLoading(true);
    setErrorState(null);

    setTimeout(() => {
      if (fullCode === "123456") {
        toast.success("Email verified successfully! Workspace unlocked.");
        router.push("/dashboard");
      } else if (fullCode === "000000") {
        setErrorState("expired");
        setLoading(false);
      } else {
        setErrorState("invalid");
        setLoading(false);
      }
    }, 1500);
  };

  // Handle single character inputs
  const handleInputChange = (value: string, idx: number) => {
    if (!/^\d*$/.test(value)) return; // numeric only

    const newCode = [...code];
    newCode[idx] = value.slice(-1);
    setCode(newCode);
    setErrorState(null);

    // auto focus next input
    if (value !== "" && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto submit if complete
    const updatedString = newCode.join("");
    if (updatedString.length === 6 && newCode.every((d) => d !== "")) {
      triggerVerification(updatedString);
    }
  };

  // Handle backspaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      const newCode = [...code];
      if (code[idx] === "" && idx > 0) {
        newCode[idx - 1] = "";
        setCode(newCode);
        inputRefs.current[idx - 1]?.focus();
      } else {
        newCode[idx] = "";
        setCode(newCode);
      }
      setErrorState(null);
    }
  };

  // Handle pastes
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Please paste a valid 6-digit number.");
      return;
    }

    const digits = pastedData.split("");
    setCode(digits);
    setErrorState(null);
    
    // Focus last input box
    inputRefs.current[5]?.focus();

    triggerVerification(pastedData);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      triggerVerification(fullCode);
    }
  };

  // Resend OTP action
  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setCode(Array(6).fill(""));
    setErrorState(null);
    inputRefs.current[0]?.focus();
    toast.success("Verification code re-sent! Check your inbox.");
  };

  const isOtpComplete = code.every((digit) => digit !== "");

  return (
    <AuthLayout>
      <div className="space-y-6">
        
        {/* Verification Icon & Titles */}
        <div className="flex flex-col items-center text-center space-y-3 select-none">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <MailCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
              Verify your email
            </h1>
            <p className="text-xs text-foreground-secondary font-sans leading-normal max-w-xs">
              We sent a 6-digit verification code to <span className="font-bold text-foreground">{emailTarget}</span>.
            </p>
          </div>
        </div>

        {/* Warning Alerts */}
        {errorState === "invalid" && (
          <div className="p-3 bg-critical/10 border border-critical/20 rounded-xs flex items-start gap-2.5 text-xs text-critical font-sans animate-fade-in">
            <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <span>Invalid verification code. Please check and try again.</span>
          </div>
        )}
        
        {errorState === "expired" && (
          <div className="p-3 bg-critical/10 border border-critical/20 rounded-xs flex items-start gap-2.5 text-xs text-critical font-sans animate-fade-in">
            <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <span>The verification code has expired. Please request a new OTP.</span>
          </div>
        )}

        {/* OTP Input Form Grid */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between items-center gap-2 max-w-sm mx-auto">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  if (el) inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                pattern="[0-9]*"
                required
                value={digit}
                onChange={(e) => handleInputChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className={cn(
                  "w-11 h-12 text-center text-lg font-mono font-bold bg-surface border rounded-xs focus:border-primary outline-none transition-colors",
                  errorState ? "border-critical/60 focus:border-critical" : "border-border"
                )}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <Button 
              variant="primary" 
              type="submit" 
              className="w-full cursor-pointer h-10 text-sm font-semibold"
              disabled={!isOtpComplete || loading}
              loading={loading}
            >
              Verify Code
            </Button>
          </div>
        </form>

        {/* Resend and change email links */}
        <div className="flex flex-col items-center gap-4 pt-2 text-xs font-sans select-none">
          <div>
            {resendTimer > 0 ? (
              <span className="text-foreground-secondary">
                Resend code in <span className="font-mono font-bold text-foreground">{resendTimer}s</span>
              </span>
            ) : (
              <button 
                onClick={handleResend}
                className="text-primary hover:underline font-bold cursor-pointer"
              >
                Resend OTP
              </button>
            )}
          </div>
          
          <Link 
            href="/register"
            className="text-foreground-secondary hover:text-foreground underline decoration-border hover:decoration-foreground transition-all"
          >
            Change email address
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground select-none">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
