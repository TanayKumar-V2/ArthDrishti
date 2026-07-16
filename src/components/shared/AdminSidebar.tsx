"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  ShieldCheck,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/ui/AppLogo";
import { Tooltip } from "@/components/ui/Overlays";
import { toast } from "sonner";

interface SidebarProps {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export function AdminSidebar({ expanded, setExpanded }: SidebarProps) {
  const pathname = usePathname();

  const navigationGroups: SidebarGroup[] = [
    {
      title: "Platform",
      items: [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Executive Analytics", href: "/admin/analytics", icon: LineChart },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Organizations", href: "/admin/organizations", icon: Building2 },
        { name: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
        { name: "Notifications", href: "/admin/notifications", icon: Bell }
      ]
    },
    {
      title: "AI System",
      items: [
        { name: "Models", href: "/admin/models", icon: Cpu },
        { name: "Model Performance", href: "/admin/model-performance", icon: LineChart },
        { name: "Drift Monitoring", href: "/admin/model-drift", icon: Activity }
      ]
    },
    {
      title: "Infrastructure",
      items: [
        { name: "API Monitoring", href: "/admin/api-monitoring", icon: Network },
        { name: "Jobs", href: "/admin/jobs", icon: Server },
        { name: "System Health", href: "/admin/system-health", icon: Activity }
      ]
    },
    {
      title: "Security",
      items: [
        { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText }
      ]
    }
  ];

  const bottomItems: SidebarItem[] = [
    { name: "System Settings", href: "/admin/settings", icon: Settings }
  ];

  const handleLogout = () => {
    toast.success("Successfully logged out (Mock)");
  };

  const renderLink = (item: SidebarItem) => {
    // Exact match for overview, prefix match for other admin sub-routes
    const isActive = item.href === "/admin" 
      ? pathname === "/admin" 
      : pathname === item.href || pathname?.startsWith(item.href + "/");
    
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center rounded-sm text-sm font-sans font-medium transition-all group outline-none",
          expanded 
            ? "w-full gap-3.5 py-2.5 px-3.5" 
            : "w-10 h-10 justify-center",
          isActive
            ? "bg-surface-elevated text-foreground border-l-[3px] border-primary shadow-xs pl-3"
            : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover border-l-[3px] border-transparent"
        )}
      >
        <Icon 
          className={cn(
            "h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200", 
            isActive ? "text-primary" : "text-foreground-secondary group-hover:translate-x-[2px] group-hover:text-foreground"
          )} 
        />
        {expanded && (
          <span className="truncate transition-opacity duration-200">{item.name}</span>
        )}
      </Link>
    );

    if (!expanded) {
      return (
        <Tooltip content={item.name} key={item.href} className="z-40">
          {linkContent}
        </Tooltip>
      );
    }

    return <div key={item.href}>{linkContent}</div>;
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-sidebar border-r border-border flex flex-col transition-all duration-300 z-30 select-none",
        expanded ? "w-[248px]" : "w-[72px]"
      )}
      aria-label="Admin Sidebar Navigation"
    >
      {/* Sidebar Header */}
      <div className={cn("h-[72px] flex items-center border-b border-border/60 px-5", expanded ? "justify-between" : "justify-center")}>
        <Link href="/admin" className="outline-none flex items-center gap-2">
          <AppLogo size="sm" showWordmark={expanded} />
          {expanded && (
            <span className="text-[10px] font-sans font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-xs select-none">
              ADMIN
            </span>
          )}
        </Link>
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="text-foreground-secondary hover:text-foreground hover:bg-surface-hover p-1 rounded-sm transition-colors cursor-pointer focus-visible:outline-2"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Main Navigation Scroll Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-none">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {expanded ? (
              <span className="text-[10px] font-sans font-bold tracking-wider text-foreground-muted uppercase px-3.5 select-none block">
                {group.title}
              </span>
            ) : (
              <div className="h-px bg-border/40 mx-2" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => renderLink(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Bottom Actions */}
      <div className="p-3 border-t border-border/60 space-y-1.5">
        {/* Toggle Expand for collapsed mode */}
        {!expanded && (
          <div className="flex justify-center py-1">
            <button
              onClick={() => setExpanded(true)}
              className="w-10 h-10 flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-surface-hover rounded-sm transition-colors cursor-pointer focus-visible:outline-2"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Bottom items (Settings) */}
        <div className="space-y-1">
          {bottomItems.map((item) => renderLink(item))}
        </div>

        {/* User Profile Card */}
        <div className="pt-2 border-t border-border/40">
          {expanded ? (
            <div className="flex items-center justify-between p-1.5 rounded-sm bg-surface-elevated/50 border border-border/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm flex-shrink-0 select-none">
                  AD
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-semibold text-foreground truncate">
                    Platform Admin
                  </span>
                  <span className="text-[10px] text-foreground-secondary font-medium uppercase tracking-wider">
                    Administrator
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-foreground-secondary hover:text-critical p-1 rounded-sm hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2"
                title="Secure Logout"
                aria-label="Secure Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Tooltip content="Platform Admin" className="z-40">
              <button
                onClick={handleLogout}
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-heading font-bold text-sm cursor-pointer hover:bg-primary/20 transition-colors focus-visible:outline-2"
                aria-label="Admin Profile"
              >
                AD
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </aside>
  );
}
