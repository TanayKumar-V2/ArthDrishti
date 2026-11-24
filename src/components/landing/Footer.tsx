"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { toast } from "sonner";

const directories = [
  {
    title: "Platform",
    links: [
      { label: "Financial Health", href: "/financial-health" },
      { label: "Credit Risk", href: "/credit-risk" },
      { label: "Fraud Monitoring", href: "/fraud" },
      { label: "Cash Flow", href: "/cash-flow" },
      { label: "Explainable AI", href: "/explainable-ai" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Solutions", href: "/solutions" },
      { label: "Security", href: "/security" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Platform Overview", href: "/platform" },
      { label: "Reports", href: "/reports" },
      { label: "Sign in", href: "/login" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(`Subscribed successfully with ${email}.`);
    setEmail("");
  };

  return (
    <footer className="border-t border-border/70 bg-background pb-8 pt-14 sm:pt-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 xl:px-10">
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 border-b border-border/70 pb-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5 lg:gap-8">
          <div className="col-span-2 space-y-5 sm:col-span-3 lg:col-span-2">
            <AppLogo size="md" />
            <p className="max-w-sm text-[13px] leading-6 text-foreground-secondary">Financial risk intelligence for clearer, more accountable lending decisions.</p>
            <form onSubmit={subscribe} className="max-w-sm space-y-2.5 pt-1">
              <label htmlFor="newsletter-email" className="block text-[12px] font-medium text-foreground">Product updates</label>
              <div className="flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-[12px] text-foreground outline-none transition-colors placeholder:text-foreground-secondary focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <button type="submit" className="h-11 shrink-0 rounded-lg bg-primary px-4 text-[12px] font-semibold text-primary-foreground transition-transform active:scale-[0.98]">Subscribe</button>
              </div>
            </form>
          </div>

          {directories.map((directory) => (
            <div key={directory.title} className="space-y-4">
              <h2 className="text-[12px] font-semibold text-foreground">{directory.title}</h2>
              <ul className="space-y-3">
                {directory.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-11 items-center py-2 text-[12px] leading-5 text-foreground-secondary transition-colors hover:text-foreground">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[11px] text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {currentYear} ArthDrishti Technologies Private Limited. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link href="/security" className="inline-flex min-h-11 items-center py-2 transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/security" className="inline-flex min-h-11 items-center py-2 transition-colors hover:text-foreground">Terms</Link>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex min-h-11 items-center gap-1.5 py-2 font-medium text-foreground-secondary transition-colors hover:text-foreground">
              Back to top <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
