"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldAlert,
  Sliders,
  Scale,
  FileText,
  History,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  UserCheck,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { INITIAL_NOTIFICATIONS } from "@/lib/notifications_data";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("officer-sidebar-collapsed");
      return saved !== "true";
    }
    return true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleSetExpanded = (val: boolean) => {
    setExpanded(val);
    localStorage.setItem("officer-sidebar-collapsed", (!val).toString());
  };

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const checkNotifications = () => {
      try {
        const saved = localStorage.getItem("arth-notifications");
        if (saved) {
          const list = JSON.parse(saved);
          const count = list.filter((n: any) => !n.readStatus && !n.muted).length;
          setUnreadCount(count);
        } else {
          setUnreadCount(INITIAL_NOTIFICATIONS.filter((n: any) => !n.readStatus && !n.muted).length);
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkNotifications();
    window.addEventListener("storage", checkNotifications);
    window.addEventListener("notifications-updated", checkNotifications);
    
    return () => {
      window.removeEventListener("storage", checkNotifications);
      window.removeEventListener("notifications-updated", checkNotifications);
    };
  }, []);

  const handleLogout = () => {
    toast.success("Successfully logged out from officer portal.");
  };

  const navigationGroups: SidebarGroup[] = [
    {
      title: "Navigation",
      items: [
        { name: "Command Center", href: "/officer", icon: LayoutDashboard },
        { name: "Applications", href: "/officer/applications", icon: ClipboardList },
        { name: "Customers", href: "/officer/customers", icon: Users },
        { name: "Risk Portfolio", href: "/officer/risk-portfolio", icon: ShieldAlert }
      ]
    },
    {
      title: "Decision Tools",
      items: [
        { name: "High-Risk Cases", href: "/officer/risk-portfolio?filter=high", icon: ShieldAlert },
        { name: "AI Underwriting", href: "/officer/underwriting/default", icon: Sliders },
        { name: "Compare Tools", href: "/officer/compare", icon: Scale }
      ]
    },
    {
      title: "History & Logs",
      items: [
        { name: "Reports Center", href: "/officer/reports", icon: FileText },
        { name: "Decision History", href: "/officer/decisions", icon: History },
        { name: "Audit History", href: "/officer/audit", icon: History }
      ]
    },
    {
      title: "Account & Control",
      items: [
        { name: "Notifications", href: "/officer/notifications", icon: Bell },
        { name: "Settings", href: "/officer/settings", icon: Settings }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans text-xs select-none">
      
      {/* 1. SIDEBAR SHELL (DESKTOP - HIDDEN ON MOBILE) */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-surface transition-all duration-300 select-none",
          expanded ? "w-64" : "w-16"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary shrink-0" />
            {expanded && (
              <span className="font-heading font-extrabold text-sm uppercase tracking-wider text-foreground">
                ARTH<span className="text-primary">OFFICER</span>
              </span>
            )}
          </div>
          {expanded && (
            <button
              onClick={() => handleSetExpanded(false)}
              className="p-1 rounded-sm hover:bg-surface-hover text-foreground-secondary hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-none">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {expanded && (
                <span className="px-3 text-[9px] font-bold text-foreground-muted uppercase tracking-widest block">
                  {group.title}
                </span>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        // If path doesn't compile (is placeholder), show alert
                        if (item.href.includes("default") || item.href.includes("audit") || item.href.includes("compare")) {
                          e.preventDefault();
                          toast.info(`"${item.name}" workspace placeholder loaded.`);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xs transition-colors font-semibold cursor-pointer relative",
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {expanded && <span className="truncate flex-1">{item.name}</span>}
                      {item.name === "Notifications" && unreadCount > 0 && (
                        <span className={cn(
                          "rounded-full bg-critical text-white text-[9px] font-mono font-bold flex items-center justify-center shrink-0",
                          expanded ? "px-1.5 py-0.25 min-w-4 h-4" : "absolute top-1 right-1.5 h-2.5 w-2.5"
                        )}>
                          {expanded ? unreadCount : ""}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border space-y-1">
          {!expanded && (
            <button
              onClick={() => handleSetExpanded(true)}
              className="w-full flex justify-center p-2 rounded-sm hover:bg-surface-hover text-foreground-secondary hover:text-foreground cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xs transition-colors text-foreground-secondary hover:text-critical hover:bg-critical/5 cursor-pointer font-semibold",
              !expanded && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {expanded && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER SHELL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOPBAR HEADER */}
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 md:px-6 select-none shrink-0 z-25">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-sm hover:bg-surface-hover text-foreground cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block w-64 md:w-80">
              <span className="absolute left-3 top-2.5 text-foreground-muted">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search applicants, profiles, loan hashes..."
                className="w-full bg-surface-elevated/40 border border-border rounded-sm py-1.5 pl-9 pr-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold placeholder-foreground-muted"
              />
            </div>
          </div>

          {/* Right Topbar actions */}
          <div className="flex items-center gap-4 text-xs font-sans">
            <Link
              href="/officer/notifications"
              className="p-2 rounded-full hover:bg-surface-hover text-foreground-secondary relative cursor-pointer"
              title="View Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-critical text-white text-[8px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/officer/settings"
              className="flex items-center gap-2.5 border-l border-border pl-4 hover:opacity-90 cursor-pointer text-left"
              title="Officer Profile Settings"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-extrabold text-xs">
                RO
              </div>
              <div className="hidden md:block">
                <span className="font-extrabold text-foreground block leading-tight">Officer Rahul</span>
                <span className="text-[9px] text-foreground-muted block leading-none">Senior Underwriter</span>
              </div>
            </Link>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto relative min-h-0">
          {children}
        </main>
      </div>

      {/* 3. MOBILE MENU SLIDEOUT PANEL */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          {/* Sidebar drawer content */}
          <aside className="relative flex flex-col w-64 bg-surface border-r border-border h-full p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <span className="font-heading font-extrabold text-sm uppercase tracking-wider text-foreground">
                ARTH<span className="text-primary">OFFICER</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-sm hover:bg-surface-hover text-foreground cursor-pointer"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4">
              {navigationGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="px-2 text-[9px] font-bold text-foreground-muted uppercase tracking-widest block">
                    {group.title}
                  </span>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={(e) => {
                            setMobileMenuOpen(false);
                            if (item.href.includes("default") || item.href.includes("audit") || item.href.includes("compare")) {
                              e.preventDefault();
                              toast.info(`"${item.name}" workspace placeholder loaded.`);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-xs transition-colors font-semibold relative",
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-xs"
                              : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.name}</span>
                          {item.name === "Notifications" && unreadCount > 0 && (
                            <span className="rounded-full bg-critical text-white text-[9px] font-mono font-bold flex items-center justify-center px-1.5 py-0.25 min-w-4 h-4 shrink-0">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/40 pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xs transition-colors text-foreground-secondary hover:text-critical hover:bg-critical/5 cursor-pointer font-semibold"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
