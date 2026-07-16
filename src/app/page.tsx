"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LiveIntelligenceStrip } from "@/components/landing/IntelligenceStrip";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { XaiShowcase } from "@/components/landing/XaiShowcase";
import { ForecastShowcase } from "@/components/landing/ForecastShowcase";
import { SecurityTrust } from "@/components/landing/SecurityTrust";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Modal } from "@/components/ui/Overlays";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

export default function LandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const handleDemoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    toast.success(`Institutional demo request received for ${email}. We will contact you shortly.`);
    setDemoModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* 80px Sticky navbar */}
      <Navbar onRequestDemo={() => setDemoModalOpen(true)} />
      
      {/* Page layout flows */}
      <main className="flex-1 flex flex-col">
        {/* Hero Banner with custom network SVGs */}
        <Hero 
          onViewDemo={() => setVideoModalOpen(true)}
        />

        {/* Live Intelligence strip counters */}
        <LiveIntelligenceStrip />

        {/* Bento Grid layout */}
        <BentoGrid />

        {/* 5-step process walkthrough */}
        <HowItWorks />

        {/* SHAP Factors attribution card */}
        <XaiShowcase />

        {/* Recharts Cash forecast projections */}
        <ForecastShowcase />

        {/* Security andRBAC credentials mapping */}
        <SecurityTrust />

        {/* Bottom CTA block */}
        <FinalCTA onRequestDemo={() => setDemoModalOpen(true)} />
      </main>

      {/* Enterprise links layout */}
      <Footer />

      {/* ==========================================
          REQUEST DEMO MODAL
          ========================================== */}
      <Modal 
        isOpen={demoModalOpen} 
        onClose={() => setDemoModalOpen(false)}
        title="Request Institutional Demo"
        className="max-w-md border-primary/25 shadow-2xl"
      >
        <form onSubmit={handleDemoSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="demo-name" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
              Full Name
            </label>
            <input 
              id="demo-name"
              name="name"
              type="text" 
              required
              placeholder="e.g. Rahul Chahar" 
              className="w-full h-10 px-3 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
            />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="demo-email" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
              Work Email
            </label>
            <input 
              id="demo-email"
              name="email"
              type="email" 
              required
              placeholder="name@institution.com" 
              className="w-full h-10 px-3 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="demo-company" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
              Organization Name
            </label>
            <input 
              id="demo-company"
              name="company"
              type="text" 
              required
              placeholder="e.g. ArthDrishti Capital" 
              className="w-full h-10 px-3 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="demo-size" className="text-xs font-sans font-bold text-foreground-secondary uppercase tracking-widest block">
              Loan Book Size / Assets
            </label>
            <select 
              id="demo-size"
              name="size"
              className="w-full h-10 px-3 bg-surface-elevated border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm font-sans transition-colors"
            >
              <option>Under ₹100 Crores</option>
              <option>₹100 - ₹500 Crores</option>
              <option>₹500 - ₹2,000 Crores</option>
              <option>Over ₹2,000 Crores</option>
            </select>
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" className="w-full h-10 cursor-pointer text-sm">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==========================================
          LIVE DEMO VIDEO MODAL
          ========================================== */}
      <Modal 
        isOpen={videoModalOpen} 
        onClose={() => setVideoModalOpen(false)}
        title="ArthDrishti Platform Walkthrough"
        className="max-w-2xl border-ai/25 shadow-2xl"
      >
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-video bg-black rounded-xs border border-border/40 overflow-hidden group flex items-center justify-center">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_60%)] flex flex-col justify-around p-8 select-none">
              <div className="flex justify-between border-b border-border/10 pb-4">
                <div className="h-6 w-32 bg-border/20 rounded-xs animate-pulse" />
                <div className="h-6 w-16 bg-border/20 rounded-xs animate-pulse" />
              </div>
              <div className="h-24 w-full border border-border/10 rounded-sm relative bg-background/20 p-4">
                <div className="h-2 w-full bg-ai/10 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-ai w-2/3 rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-border/20 rounded-xs animate-pulse" />
                  <div className="h-4 bg-border/20 rounded-xs animate-pulse" />
                  <div className="h-4 bg-border/20 rounded-xs animate-pulse" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="z-10 h-16 w-16 rounded-full bg-ai/90 hover:bg-ai text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg cursor-pointer"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current ml-1" />}
            </button>

            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-4 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-ai transition-colors cursor-pointer">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <span className="text-[10px] font-mono text-white/80">01:24 / 03:45</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-ai transition-colors cursor-pointer">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button className="text-white hover:text-ai transition-colors cursor-pointer">
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-12 left-0 right-0 h-1 bg-border/20 z-20">
              <div className="h-full bg-ai" style={{ width: "37%" }} />
            </div>
          </div>

          <div className="text-xs text-foreground-secondary leading-relaxed font-sans">
            <span className="font-bold text-foreground block mb-1">Key Insights in this Demo:</span>
            In this 3-minute overview, watch how the GenAI Advisor audits cash projections, flags payment velocities, and triggers predictive SHAP attribution factors dynamically.
          </div>
        </div>
      </Modal>
    </div>
  );
}
