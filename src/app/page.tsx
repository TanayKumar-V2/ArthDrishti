"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
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

export default function LandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleDemoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    toast.success(`Demo request received for ${email}. Our team will be in touch.`);
    setDemoModalOpen(false);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground selection:bg-primary/20">
      <Navbar onRequestDemo={() => setDemoModalOpen(true)} />
      <main className="flex-1">
        <Hero />
        <LiveIntelligenceStrip />
        <BentoGrid />
        <HowItWorks />
        <XaiShowcase />
        <ForecastShowcase />
        <SecurityTrust />
        <FinalCTA />
      </main>
      <Footer />

      <Modal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        title="Request a product demo"
        className="max-w-lg border-border shadow-xl"
      >
        <form onSubmit={handleDemoSubmit} className="space-y-5 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="demo-name" className="flex flex-col gap-2 text-[12px] font-medium text-foreground-secondary">
              Full name
              <input id="demo-name" name="name" type="text" required autoComplete="name" placeholder="Priya Sharma" className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-foreground-secondary focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
            <label htmlFor="demo-email" className="flex flex-col gap-2 text-[12px] font-medium text-foreground-secondary">
              Work email
              <input id="demo-email" name="email" type="email" required autoComplete="email" placeholder="name@company.com" className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-foreground-secondary focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="demo-company" className="flex flex-col gap-2 text-[12px] font-medium text-foreground-secondary">
              Organization
              <input id="demo-company" name="company" type="text" required autoComplete="organization" placeholder="Company name" className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-foreground-secondary focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
            <label htmlFor="demo-size" className="flex flex-col gap-2 text-[12px] font-medium text-foreground-secondary">
              Loan book size
              <select id="demo-size" name="size" className="h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-[14px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                <option>Under ₹100 crore</option>
                <option>₹100-500 crore</option>
                <option>₹500-2,000 crore</option>
                <option>Over ₹2,000 crore</option>
              </select>
            </label>
          </div>
          <Button variant="primary" type="submit" className="h-11 w-full rounded-full text-[13px] font-semibold active:scale-[0.98]">
            Send request
          </Button>
        </form>
      </Modal>
    </div>
  );
}
