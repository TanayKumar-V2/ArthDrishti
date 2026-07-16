"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/InputControls";
import { AnimatePresence, motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

interface NavbarProps {
  onRequestDemo?: () => void;
}

export function Navbar({ onRequestDemo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform", href: "#platform" },
    { name: "Solutions", href: "#solutions" },
    { name: "Intelligence", href: "#intelligence" },
    { name: "Security", href: "#security" },
    { name: "Process", href: "#process" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 h-20 z-40 transition-all duration-300 select-none flex items-center",
          scrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border/80 shadow-md shadow-black/5" 
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="outline-none">
            <AppLogo size="md" />
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-sans font-medium text-foreground-secondary hover:text-foreground hover:underline hover:underline-offset-4 transition-all focus-visible:outline-2"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-sans font-medium text-foreground-secondary hover:text-foreground transition-colors px-3 py-2 outline-none focus-visible:outline-2"
            >
              Sign In
            </Link>
            <Button variant="primary" size="sm" className="cursor-pointer gap-1.5" onClick={onRequestDemo}>
              Request Demo
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Mobile Actions Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            {/* Compact CTA on mobile if space allows */}
            <button
              onClick={onRequestDemo}
              className="text-xs font-sans font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-sm hover:bg-primary/20 transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Demo</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground-secondary hover:text-foreground p-1.5 rounded-sm hover:bg-surface-hover transition-colors outline-none focus-visible:outline-2 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            {/* Backdrop */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/90 backdrop-blur-md"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ x: "100%", transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="fixed top-20 bottom-0 right-0 w-full max-w-sm bg-surface border-l border-border flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex flex-col gap-6 mt-4">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-sans font-medium text-foreground-secondary py-2 border-b border-border/30"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                <div className="flex flex-col gap-4 pt-6 mt-auto">
                  <Link
                    href="/design-system"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-sans font-medium text-foreground-secondary hover:text-foreground py-2"
                  >
                    <Activity className="h-4 w-4 text-primary" />
                    <span>Design System Showcase</span>
                  </Link>

                  <Button variant="secondary" size="md" asChild onClick={() => setMobileMenuOpen(false)}>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button variant="primary" size="md" onClick={() => { setMobileMenuOpen(false); onRequestDemo?.(); }}>
                    <span className="flex items-center gap-2 justify-center">
                      Request Demo
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
export default Navbar;
