"use client";

import React from "react";
import Link from "next/link";
import { Mail, HelpCircle } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { toast } from "sonner";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  const directories = [
    {
      title: "Platform",
      links: [
        { label: "Financial Health", href: "/financial-health" },
        { label: "Credit Risk Intelligence", href: "/credit-risk" },
        { label: "Fraud Intelligence", href: "/fraud" },
        { label: "Cash Flow Forecasting", href: "/cash-flow" },
        { label: "Explainable AI (SHAP)", href: "/explainable-ai" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Solutions", href: "/solutions" },
        { label: "Security & Trust", href: "/security" },
        { label: "Contact Advisory", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Platform Docs", href: "/platform" },
        { label: "API Configuration", href: "/admin/settings" },
        { label: "Compliance Reports", href: "/reports" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/security" },
        { label: "Terms of Service", href: "/security" },
      ],
    },
  ];

  return (
    <footer className="bg-sidebar border-t border-border/80 pt-16 pb-12 select-none">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12 border-b border-border/40">
          {/* Logo & Description Column */}
          <div className="lg:col-span-2 space-y-5">
            <AppLogo size="md" />
            <p className="text-sm text-foreground-secondary font-sans leading-relaxed max-w-sm">
              Transforming complex financial data into explainable risk intelligence, fraud detection, predictive cash forecasts, and actionable enterprise decisions.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#"
                className="h-8 w-8 rounded-sm bg-surface border border-border flex items-center justify-center text-foreground-secondary hover:text-foreground hover:border-border-strong hover:scale-105 transition-all shadow-xs"
                title="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-sm bg-surface border border-border flex items-center justify-center text-foreground-secondary hover:text-foreground hover:border-border-strong hover:scale-105 transition-all shadow-xs"
                title="Twitter"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-sm bg-surface border border-border flex items-center justify-center text-foreground-secondary hover:text-foreground hover:border-border-strong hover:scale-105 transition-all shadow-xs"
                title="GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@arthdrishti.com"
                className="h-8 w-8 rounded-sm bg-surface border border-border flex items-center justify-center text-foreground-secondary hover:text-foreground hover:border-border-strong hover:scale-105 transition-all shadow-xs"
                title="Email Support"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>

            {/* Newsletter Subscription Form */}
            <div className="pt-2 space-y-2.5">
              <span className="text-[10px] font-sans font-bold text-foreground uppercase tracking-widest block select-none">
                Subscribe to Intelligence
              </span>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const email = new FormData(target).get("email");
                  toast.success(`Subscribed successfully with ${email}!`);
                  target.reset();
                }}
                className="flex items-center gap-2 max-w-sm"
              >
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="name@company.com" 
                  className="h-9 px-3 flex-1 bg-surface border border-border focus:border-primary rounded-xs outline-none text-xs text-foreground font-sans transition-colors"
                />
                <button 
                  type="submit"
                  className="h-9 px-4 bg-primary text-white text-xs font-sans font-semibold rounded-xs hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Directory Links Columns */}
          {directories.map((dir) => (
            <div key={dir.title} className="space-y-3.5">
              <h4 className="text-xs font-sans font-bold text-foreground uppercase tracking-widest">
                {dir.title}
              </h4>
              <ul className="space-y-2.5">
                {dir.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-sans text-foreground-secondary hover:text-foreground transition-colors outline-none focus-visible:outline-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom Block */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-foreground-muted">
          <div className="flex items-center gap-1.5">
            <span>&copy; {currentYear} ArthDrishti Technologies Private Limited. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Back to Top</span>
              <span className="font-mono">&uarr;</span>
            </button>
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              <Link href="/design-system" className="hover:text-foreground transition-colors underline decoration-primary/40 underline-offset-2">
                Internal Design System Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
