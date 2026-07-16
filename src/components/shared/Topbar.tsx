"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, User, LogOut, Activity, Search, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/InputControls";
import { IconButton } from "@/components/ui/IconButton";
import { Dropdown } from "@/components/ui/Overlays";
import { mockCurrentUser } from "@/types/mockData";
import { toast } from "sonner";
import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";

interface TopbarProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (val: boolean) => void;
  onSearchClick?: () => void;
}

export function Topbar({ sidebarExpanded, setSidebarExpanded, onSearchClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const profileDropdownItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      onClick: () => toast.info("Profile settings requested")
    },
    {
      id: "design-system",
      label: "Design System",
      icon: Activity,
      onClick: () => router.push("/design-system")
    },
    {
      id: "logout",
      label: "Secure Logout",
      icon: LogOut,
      destructive: true,
      onClick: () => toast.success("Successfully logged out (Mock)")
    }
  ];

  // Map route pathnames to standard categories & readable page names for breadcrumbs
  const getBreadcrumbs = () => {
    const routeBreadcrumbs: Record<string, string[]> = {
      "/dashboard": ["Overview", "Command Center"],
      "/financial-health": ["Intelligence", "Financial Health"],
      "/credit-risk": ["Intelligence", "Credit Risk"],
      "/fraud": ["Intelligence", "Fraud Intelligence"],
      "/spending": ["Intelligence", "Spending"],
      "/cash-flow": ["Intelligence", "Cash Flow"],
      "/segments": ["Intelligence", "Segments"],
      "/explainable-ai": ["AI Tools", "Explainable AI"],
      "/simulator": ["AI Tools", "What-if Simulator"],
      "/ai-advisor": ["AI Tools", "AI Advisor"],
      "/recommendations": ["AI Tools", "Recommendations"],
      "/transactions": ["Data", "Transactions"],
      "/data-sources": ["Data", "Data Sources"],
      "/reports": ["Reports", "Report Center"],
      "/settings": ["Settings"],
      "/help": ["Help"],
    };

    const matched = routeBreadcrumbs[pathname || ""];
    if (matched) return matched;

    // Fallback logic for dynamic subroutes
    const parts = (pathname || "").split("/").filter(Boolean);
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-[72px] border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 select-none">
      
      {/* Left section: Breadcrumbs & Mobile Logo Toggle */}
      <div className="flex items-center gap-3">
        {/* On desktop, show expand button if collapsed. On mobile, we hide it */}
        {!sidebarExpanded && (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => setSidebarExpanded(true)}
            className="text-foreground-secondary hover:text-foreground cursor-pointer hidden md:inline-flex"
            title="Expand Navigation"
            aria-label="Expand Navigation"
          >
            <Menu className="h-5 w-5" />
          </IconButton>
        )}

        {/* Mobile-only logo */}
        <div className="md:hidden flex items-center pr-2 border-r border-border/60">
          <Link href="/dashboard">
            <AppLogo size="sm" showWordmark={false} />
          </Link>
        </div>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb}>
                {idx > 0 && <span className="text-foreground-muted text-[10px] sm:text-xs">/</span>}
                {isLast ? (
                  <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[120px] sm:max-w-none">
                    {crumb}
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-medium text-foreground-secondary truncate max-w-[80px] sm:max-w-none">
                    {crumb}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Keyboard-Accessible Global Search (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-sm bg-surface-elevated hover:bg-surface-hover border border-border hover:border-border-strong text-foreground-secondary hover:text-foreground text-xs font-sans transition-all text-left outline-none cursor-pointer focus-visible:outline-2"
          aria-label="Global search palette"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-foreground-muted" />
            <span className="font-sans font-medium text-foreground-muted">Search transactions, reports, insights...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-sans font-bold text-foreground-muted bg-background border border-border px-1.5 py-0.5 rounded-sm select-none">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions, status badges, notifications, theme, user */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button (Triggers palette) */}
        <IconButton
          variant="outline"
          size="sm"
          onClick={onSearchClick}
          className="text-foreground-secondary hover:text-foreground md:hidden cursor-pointer"
          title="Search"
          aria-label="Search"
        >
          <Search className="h-4.5 w-4.5" />
        </IconButton>

        {/* SYSTEM LIVE status indicator (Desktop only) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-positive/10 text-positive text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-1 rounded-xs border border-positive/20 select-none">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-positive"></span>
          </span>
          SYSTEM LIVE
        </div>

        {/* AI Model Status indicator (Desktop only) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-ai/10 text-ai text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-1 rounded-xs border border-ai/20 select-none">
          <Sparkles className="h-3 w-3 text-ai" />
          AI OPTIMIZED
        </div>

        {/* Notifications alert icon */}
        <IconButton
          variant="outline"
          size="sm"
          onClick={() => {
            router.push("/fraud");
            toast.info("Opening alert details in Fraud Diagnostics Portal");
          }}
          className="text-foreground-secondary hover:text-foreground relative cursor-pointer"
          title="System notifications"
          aria-label="System notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-critical rounded-full border border-surface" />
        </IconButton>

        <div className="h-5 w-px bg-border/80 mx-0.5 sm:mx-1" />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Account controls dropdown */}
        <Dropdown
          trigger={
            <button 
              className="flex items-center gap-2 text-left cursor-pointer outline-none group focus-visible:outline-2 rounded-sm"
              aria-label="User account controls"
            >
              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm select-none group-hover:bg-primary/20 transition-colors">
                R
              </div>
              <div className="hidden lg:flex flex-col text-sm leading-tight">
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {mockCurrentUser.name}
                </span>
                <span className="text-[10px] text-foreground-secondary font-medium uppercase tracking-wider">
                  {mockCurrentUser.role}
                </span>
              </div>
            </button>
          }
          items={profileDropdownItems}
          align="right"
        />
      </div>
    </header>
  );
}
export default Topbar;
