"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users,
  Building2,
  Cpu,
  LineChart,
  Activity,
  Network,
  Server,
  FileText,
  Settings,
  MoreHorizontal,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { AdminTopbar } from "@/components/shared/AdminTopbar";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { Sheet } from "@/components/ui/Overlays";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Sync sidebar expanded state from localStorage safely on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarExpanded(saved === "false");
    }
  }, []);

  const handleSetSidebarExpanded = (val: boolean) => {
    setSidebarExpanded(val);
    localStorage.setItem("admin-sidebar-collapsed", (!val).toString());
  };

  // Keyboard shortcut listener for CTRL+K / CMD+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleLogout = () => {
    toast.success("Successfully logged out (Mock)");
    setIsMoreMenuOpen(false);
  };

  // Mobile Bottom Navigation definition
  const bottomNavItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Models", href: "/admin/models", icon: Cpu },
    { label: "Health", href: "/admin/system-health", icon: Activity },
  ];

  // Mobile "More" Menu sheet navigation groups
  const moreMenuGroups = [
    {
      title: "Platform Administration",
      items: [
        { label: "Platform Overview", href: "/admin", icon: LayoutDashboard },
        { label: "Executive Analytics", href: "/admin/analytics", icon: LineChart },
        { label: "User Access Control", href: "/admin/users", icon: Users },
        { label: "Active Organizations", href: "/admin/organizations", icon: Building2 },
        { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
        { label: "Notifications Center", href: "/admin/notifications", icon: Bell }
      ]
    },
    {
      title: "Model Architecture",
      items: [
        { label: "AI Models Registry", href: "/admin/models", icon: Cpu },
        { label: "Model Metrics & Performance", href: "/admin/model-performance", icon: LineChart },
        { label: "Model Drift Monitoring", href: "/admin/model-drift", icon: ShieldAlert },
      ]
    },
    {
      title: "Infrastructure Telemetry",
      items: [
        { label: "API Rate limits & Gateway", href: "/admin/api-monitoring", icon: Network },
        { label: "Background Runner status", href: "/admin/jobs", icon: Server },
        { label: "System Diagnostics Logs", href: "/admin/system-health", icon: Activity },
      ]
    },
    {
      title: "Security & Audits",
      items: [
        { label: "Platform Action Logs", href: "/admin/audit-logs", icon: FileText },
        { label: "System Configuration", href: "/admin/settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 1. Desktop Collapsible Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block flex-shrink-0">
        <AdminSidebar 
          expanded={sidebarExpanded} 
          setExpanded={handleSetSidebarExpanded} 
        />
      </div>

      {/* 2. Main content viewport wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Command Bar */}
        <AdminTopbar 
          sidebarExpanded={sidebarExpanded} 
          setSidebarExpanded={handleSetSidebarExpanded} 
          onSearchClick={() => setIsCommandPaletteOpen(true)}
        />
        
        {/* Scrollable primary content region */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 focus:outline-none">
          <div className="w-full h-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* 3. Mobile Navigation Bar (Fixed bottom, hidden on Desktop) */}
        <nav 
          className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-surface flex md:hidden items-center justify-around px-2 z-35 shadow-lg select-none"
          aria-label="Mobile Navigation"
        >
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center w-14 py-1 rounded-sm transition-all outline-none focus-visible:outline-2",
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-foreground-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform active:scale-95", isActive ? "text-primary" : "")} />
                <span className="text-[10px] font-sans font-medium mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
          
          {/* Mobile "More" menu triggers side drawer sheet */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center w-14 py-1 rounded-sm transition-all outline-none focus-visible:outline-2",
              isMoreMenuOpen ? "text-primary" : "text-foreground-secondary hover:text-foreground"
            )}
            aria-label="More menu items"
            aria-expanded={isMoreMenuOpen}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-sans font-medium mt-1 tracking-tight">More</span>
          </button>
        </nav>
      </div>

      {/* 4. Global Search Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

      {/* 5. Mobile "More" Navigation Drawer (Slide-out menu sheet) */}
      <Sheet
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title="Admin workspace"
        className="w-full max-w-sm"
      >
        <div className="flex flex-col h-full justify-between pb-8">
          {/* Scrollable menu options */}
          <div className="space-y-6 overflow-y-auto pr-1">
            {/* User profile header card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-sm bg-surface-elevated border border-border/80">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm select-none">
                AD
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-foreground">
                  Platform Admin
                </span>
                <span className="text-[11px] text-foreground-secondary font-medium uppercase tracking-wider">
                  Root Administrator
                </span>
              </div>
            </div>

            {/* Categorized groups of links */}
            {moreMenuGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <h4 className="text-[10px] font-sans font-bold tracking-wider text-foreground-muted uppercase select-none">
                  {group.title}
                </h4>
                <div className="grid grid-cols-1 gap-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          router.push(item.href);
                          setIsMoreMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-sans font-medium transition-all text-left outline-none cursor-pointer",
                          isActive
                            ? "bg-surface-elevated text-primary border-l-[3px] border-primary pl-2.25 shadow-xs"
                            : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover border-l-[3px] border-transparent"
                        )}
                      >
                        <Icon className={cn("h-4.5 w-4.5 flex-shrink-0", isActive ? "text-primary" : "text-foreground-muted")} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Settings and Support footer section inside drawer */}
          <div className="space-y-3.5 pt-6 border-t border-border">
            <button
              onClick={() => {
                router.push("/admin/settings");
                setIsMoreMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-sans font-medium text-foreground-secondary hover:text-foreground rounded-sm hover:bg-surface-hover transition-colors text-left outline-none"
            >
              <Settings className="h-4.5 w-4.5 text-foreground-muted" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-semibold text-critical hover:bg-critical/10 rounded-sm transition-colors text-left outline-none"
            >
              <LogOut className="h-4.5 w-4.5 text-critical" />
              <span>Secure Logout</span>
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
