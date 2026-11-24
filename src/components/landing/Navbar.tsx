"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/InputControls";

interface NavbarProps {
  onRequestDemo?: () => void;
}

const navLinks = [
  { name: "Platform", href: "#platform" },
  { name: "Solutions", href: "#solutions" },
  { name: "Intelligence", href: "#intelligence" },
  { name: "Security", href: "#security" },
  { name: "Process", href: "#process" },
];

export function Navbar({ onRequestDemo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-5 sm:px-8 xl:px-10">
        <Link href="/" aria-label="ArthDrishti home" className="shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <AppLogo size="md" />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-[13px] font-medium text-foreground-secondary transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <ThemeToggle className="h-11 w-11 lg:h-10 lg:w-10" />
          <Link href="/login" className="px-2 py-2 text-[13px] font-medium text-foreground-secondary transition-colors hover:text-foreground">Sign in</Link>
          <Button variant="primary" size="sm" onClick={onRequestDemo} className="h-10 rounded-full px-5 active:scale-[0.98]">
            Request demo <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle className="h-11 w-11" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="grid h-11 w-11 place-items-center rounded-full border border-border/80 text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-[72px] z-30 bg-foreground/20 lg:hidden"
            />
            <motion.nav
              aria-label="Mobile navigation"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
              className="absolute inset-x-0 top-[72px] z-40 max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-b border-border bg-background px-5 pb-6 pt-3 shadow-lg sm:px-8 lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="border-b border-border/70 py-3.5 text-[15px] font-medium text-foreground-secondary hover:text-foreground">
                    {link.name}
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-3 pt-5">
                  <Button variant="outline" size="md" asChild className="rounded-full">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                  </Button>
                  <Button variant="primary" size="md" onClick={() => { setMobileMenuOpen(false); onRequestDemo?.(); }} className="rounded-full">
                    Request demo
                  </Button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
