"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  HeartPulse, 
  ShieldAlert, 
  SlidersHorizontal, 
  MoreHorizontal,
  Fingerprint,
  PieChart,
  TrendingUp,
  Activity,
  Brain,
  Bot,
  Sparkles,
  History,
  Database,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  UserCheck,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomerSidebar } from "@/components/shared/CustomerSidebar";
import { Topbar } from "@/components/shared/Topbar";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { Sheet } from "@/components/ui/Overlays";
import { toast } from "sonner";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Sync sidebar expanded state from localStorage safely on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarExpanded(saved === "false");
    }
  }, []);

  const handleSetSidebarExpanded = (val: boolean) => {
    setSidebarExpanded(val);
    localStorage.setItem("sidebar-collapsed", (!val).toString());
  };

  // Keyboard shortcut listener for CTRL+K / CMD+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Allow Ctrl+K or Cmd+K
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
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Health", href: "/financial-health", icon: HeartPulse },
    { label: "Risk", href: "/credit-risk", icon: ShieldAlert },
    { label: "AI", href: "/simulator", icon: SlidersHorizontal },
  ];

  // Mobile "More" Menu sheet navigation groups
  const moreMenuGroups = [
    {
      title: "Intelligence Tools",
      items: [
        { label: "Fraud Intelligence", href: "/fraud", icon: Fingerprint },
        { label: "Spending Vectors", href: "/spending", icon: PieChart },
        { label: "Cash Flow Projection", href: "/cash-flow", icon: TrendingUp },
        { label: "Customer Segments", href: "/segments", icon: Activity },
      ]
    },
    {
      title: "AI Tools",
      items: [
        { label: "Explainable AI (SHAP)", href: "/explainable-ai", icon: Brain },
        { label: "AI Financial Advisor", href: "/ai-advisor", icon: Bot },
        { label: "Recommendations", href: "/recommendations", icon: Sparkles },
      ]
    },
    {
      title: "Ledger Data & Reports",
      items: [
        { label: "Transactions History", href: "/transactions", icon: History },
        { label: "Data Pipelines", href: "/data-sources", icon: Database },
        { label: "Report Center", href: "/reports", icon: FileText },
      ]
    },
    {
      title: "System Portals",
      items: [
        { label: "Loan Officer Portal", href: "/officer", icon: UserCheck },
        { label: "System Administration", href: "/admin", icon: Shield },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 1. Desktop Collapsible Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block flex-shrink-0">
        <CustomerSidebar 
          expanded={sidebarExpanded} 
          setExpanded={handleSetSidebarExpanded} 
        />
      </div>

      {/* 2. Main content viewport wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Command Bar */}
        <Topbar 
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
        title="Application workspace"
        className="w-full max-w-sm"
      >
        <div className="flex flex-col h-full justify-between pb-8">
          {/* Scrollable menu options */}
          <div className="space-y-6 overflow-y-auto pr-1">
            {/* User profile header card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-sm bg-surface-elevated border border-border/80">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm select-none">
                R
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-foreground">
                  Rahul
                </span>
                <span className="text-[11px] text-foreground-secondary font-medium uppercase tracking-wider">
                  Customer Profile
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
                router.push("/settings");
                setIsMoreMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-sans font-medium text-foreground-secondary hover:text-foreground rounded-sm hover:bg-surface-hover transition-colors text-left outline-none"
            >
              <Settings className="h-4.5 w-4.5 text-foreground-muted" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                router.push("/help");
                setIsMoreMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-sans font-medium text-foreground-secondary hover:text-foreground rounded-sm hover:bg-surface-hover transition-colors text-left outline-none"
            >
              <HelpCircle className="h-4.5 w-4.5 text-foreground-muted" />
              <span>Help & Support</span>
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
