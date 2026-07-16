"use client";

import React from "react";
import Link from "next/link";
import { Shield, Key, Eye, CheckCircle2, ChevronLeft } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { ThemeToggle } from "@/components/ui/InputControls";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
}

export function AuthLayout({ children, backLink }: AuthLayoutProps) {
  // Trust list configuration
  const trustBadges = [
    { icon: Shield, title: "Encrypted Data", desc: "AES-256 ledger encryption in transit and at rest." },
    { icon: Key, title: "Explainable Predictions", desc: "SHAP attribution models auditing every decision." },
    { icon: Eye, title: "Privacy-Aware Analysis", desc: "Local context masking flags sensitive credentials." },
  ];

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground select-none relative font-sans overflow-hidden">
      
      {/* Back navigation floating link (Desktop only) */}
      {backLink && (
        <Link 
          href={backLink.href}
          className="absolute top-6 left-6 z-50 items-center gap-1.5 text-xs font-semibold text-foreground-secondary hover:text-foreground hidden lg:flex group transition-colors outline-none focus-visible:outline-2"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {backLink.label}
        </Link>
      )}

      {/* Floating Theme Toggle (Right side top) */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
      </div>

      {/* ==========================================
          LEFT SPLIT PANEL - VISUAL STORYTELLING (45%)
          ========================================== */}
      <div className="w-[45%] hidden lg:flex flex-col bg-sidebar border-r border-border/60 relative p-12 justify-between overflow-hidden">
        {/* Spotlight top-left gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.06)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Brand Logo Header */}
        <div className="relative z-10">
          <Link href="/" className="outline-none inline-block">
            <AppLogo size="md" />
          </Link>
        </div>

        {/* Center Animated Pipeline Visualization */}
        <div className="my-auto space-y-12 relative z-10 flex flex-col items-center">
          
          {/* Header titles */}
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase block">
              Secure Financial Intelligence
            </span>
            <h2 className="text-xl font-heading font-extrabold text-foreground leading-tight max-w-xs mx-auto">
              “Your financial data becomes understandable intelligence.”
            </h2>
          </div>

          {/* SVG Animated Flow Network */}
          <div className="relative h-28 w-80 flex items-center justify-center">
            <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 320 120">
              {/* Connection curves */}
              <path 
                d="M 50,60 C 100,20 120,100 160,60" 
                fill="none" 
                stroke="var(--border)" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                opacity={0.5} 
              />
              <path 
                d="M 160,60 C 200,20 220,100 270,60" 
                fill="none" 
                stroke="var(--border)" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                opacity={0.5} 
              />

              {/* Animating Data Particles (Framer Motion along SVG paths) */}
              <motion.circle 
                r="3" 
                fill="var(--primary)" 
                animate={{
                  cx: [50, 80, 110, 130, 160],
                  cy: [60, 42, 45, 75, 60],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.circle 
                r="3" 
                fill="var(--ai)" 
                animate={{
                  cx: [160, 185, 210, 240, 270],
                  cy: [60, 42, 45, 75, 60],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.4
                }}
              />

              {/* Node 1: Secure Data */}
              <circle cx="50" cy="60" r="16" fill="var(--surface-elevated)" stroke="var(--border-strong)" strokeWidth="1.5" />
              <g transform="translate(42, 52) scale(0.65)">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--foreground-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
              <text x="50" y="90" textAnchor="middle" fill="var(--foreground-secondary)" fontSize="9" fontWeight="700" fontFamily="var(--font-manrope)">DATA</text>

              {/* Node 2: Intelligence Engine */}
              <circle cx="160" cy="60" r="18" fill="var(--surface-elevated)" stroke="var(--primary)" strokeWidth="2" className="animate-pulse" />
              <g transform="translate(151, 51) scale(0.75)">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="var(--primary)" strokeWidth="2" fill="none" />
                <path d="M12 6v6l4 2" stroke="var(--primary)" strokeWidth="2" fill="none" />
              </g>
              <text x="160" y="92" textAnchor="middle" fill="var(--primary)" fontSize="9" fontWeight="700" fontFamily="var(--font-manrope)">INTELLIGENCE</text>

              {/* Node 3: Explainable Decisions */}
              <circle cx="270" cy="60" r="16" fill="var(--surface-elevated)" stroke="var(--border-strong)" strokeWidth="1.5" />
              <g transform="translate(262, 52) scale(0.65)">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="var(--positive)" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M22 4L12 14.01l-3-3" stroke="var(--positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
              <text x="270" y="90" textAnchor="middle" fill="var(--foreground-secondary)" fontSize="9" fontWeight="700" fontFamily="var(--font-manrope)">DECISIONS</text>
            </svg>
          </div>

        </div>

        {/* Security Assurances Grid */}
        <div className="grid grid-cols-1 gap-4 border-t border-border/30 pt-6 z-10 relative">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex gap-3 items-start select-none">
                <div className="h-7 w-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-sans font-bold text-foreground block">{badge.title}</span>
                  <span className="text-[10px] text-foreground-secondary leading-normal block">{badge.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ==========================================
          RIGHT SPLIT PANEL - AUTH WORKSPACE (55%)
          ========================================== */}
      <div className="w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto">
        
        {/* Mobile-only Branding Header */}
        <div className="flex lg:hidden items-center justify-between border-b border-border/30 pb-4 mb-4 select-none">
          <Link href="/" className="outline-none">
            <AppLogo size="sm" />
          </Link>
          {backLink && (
            <Link 
              href={backLink.href}
              className="text-xs font-sans font-bold text-foreground-secondary hover:text-foreground flex items-center gap-0.5 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          )}
        </div>

        {/* Form Workspace Body Container */}
        <div className="my-auto w-full max-w-sm mx-auto py-8">
          {children}
        </div>

        {/* Bottom Security Footer */}
        <div className="mt-auto pt-6 flex items-center justify-center gap-4 text-[10px] font-sans text-foreground-muted select-none border-t border-border/15 max-w-sm mx-auto w-full">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-positive" />
            Secure Session
          </span>
          <span className="h-3 w-px bg-border/40" />
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Encrypted Connection
          </span>
        </div>

      </div>

    </div>
  );
}
