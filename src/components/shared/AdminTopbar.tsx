"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, User, LogOut, Activity, Search, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ui/InputControls";
import { IconButton } from "@/components/ui/IconButton";
import { Dropdown } from "@/components/ui/Overlays";
import { toast } from "sonner";
import Link from "next/link";
import { AppLogo } from "@/components/ui/AppLogo";

interface TopbarProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (val: boolean) => void;
  onSearchClick?: () => void;
}

export function AdminTopbar({ sidebarExpanded, setSidebarExpanded, onSearchClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const profileDropdownItems = [
    {
      id: "profile",
      label: "Admin Profile",
      icon: User,
      onClick: () => toast.info("Admin profile settings requested")
    },
    {
      id: "customer-dashboard",
      label: "Customer Portal",
      icon: Activity,
      onClick: () => router.push("/dashboard")
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
      "/admin": ["Platform", "Overview"],
      "/admin/users": ["Platform", "Users"],
      "/admin/organizations": ["Platform", "Organizations"],
      "/admin/models": ["AI System", "Models"],
      "/admin/model-performance": ["AI System", "Model Performance"],
      "/admin/model-drift": ["AI System", "Drift Monitoring"],
      "/admin/api-monitoring": ["Infrastructure", "API Monitoring"],
      "/admin/jobs": ["Infrastructure", "Jobs"],
      "/admin/system-health": ["Infrastructure", "System Health"],
      "/admin/audit-logs": ["Security", "Audit Logs"],
      "/admin/settings": ["Settings", "System Settings"],
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
          <Link href="/admin">
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
            <span className="font-sans font-medium text-foreground-muted">Search configurations, logs, users...</span>
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

        {/* Admin control indicator (Desktop only) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-1 rounded-xs border border-primary/20 select-none">
          <Shield className="h-3 w-3 text-primary" />
          ADMIN SYSTEM
        </div>

        {/* Notifications alert icon */}
        <IconButton
          variant="outline"
          size="sm"
          onClick={() => {
            router.push("/admin/notifications");
            toast.info("Opening system notifications hub");
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
              aria-label="Admin account controls"
            >
              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm select-none group-hover:bg-primary/20 transition-colors">
                AD
              </div>
              <div className="hidden lg:flex flex-col text-sm leading-tight">
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  System Admin
                </span>
                <span className="text-[10px] text-foreground-secondary font-medium uppercase tracking-wider">
                  Root Administrator
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
export default AdminTopbar;
