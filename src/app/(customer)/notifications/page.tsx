"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  TrendingUp,
  FileText,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "Fraud Alert" | "Risk Change" | "Forecast Warning" | "Model Alert" | "Report Ready" | "Recommendation" | "System";
  title: string;
  description: string;
  timestamp: string;
  priority: "High" | "Medium" | "Low";
  read: boolean;
  actionLabel: string;
  actionHref: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "Fraud Alert",
    title: "Suspicious Location Mismatch",
    description: "Revolving card swipe recorded from New Delhi IP while cell-tower telemetry is in Mumbai. Review immediately.",
    timestamp: "10 mins ago",
    priority: "High",
    read: false,
    actionLabel: "Verify Alert",
    actionHref: "/ai-advisor"
  },
  {
    id: "n2",
    type: "Risk Change",
    title: "Credit Risk Rating Upgraded to 82%",
    description: "Ensemble risk models detected credit utilization crossing 68% and Debt-to-Income ratio climbing to 42%.",
    timestamp: "2 hours ago",
    priority: "High",
    read: false,
    actionLabel: "View Explanations",
    actionHref: "/explainable-ai"
  },
  {
    id: "n3",
    type: "Recommendation",
    title: "High Impact Optimization Available",
    description: "Clear card balances below ₹60,000 to drop default risk indexes by 14% and gain 8 financial health points.",
    timestamp: "Yesterday",
    priority: "Medium",
    read: false,
    actionLabel: "Open Action Plan",
    actionHref: "/recommendations"
  },
  {
    id: "n4",
    type: "Forecast Warning",
    title: "Liquidity Reserve Floor Alert",
    description: "Receivables payment delays extend to 45 days. Net checking balance buffers projected to dip below ₹40K in August.",
    timestamp: "3 days ago",
    priority: "Medium",
    read: true,
    actionLabel: "View Cash Flow",
    actionHref: "/cash-flow"
  },
  {
    id: "n5",
    type: "Report Ready",
    title: "Q2 Intelligence Audit Compiled",
    description: "Your Complete Financial Intelligence Report is generated and ready for deep-dive analytical inspections.",
    timestamp: "July 5, 2026",
    priority: "Low",
    read: true,
    actionLabel: "View Report",
    actionHref: "/reports/complete-intelligence"
  }
];

export default function NotificationsPage() {
  const router = useRouter();

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  
  // Filtering states
  const [activeFilter, setActiveFilter] = useState<"All" | "Unread" | "High Priority">("All");

  // Mark single as read
  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Notification marked as read.");
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  }, []);

  // Delete notification
  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted.");
  }, []);

  // Filter application
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "Unread") return !n.read;
      if (activeFilter === "High Priority") return n.priority === "High";
      return true;
    });
  }, [notifications, activeFilter]);

  // Count unread helper
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Icon selector helper based on notification type
  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "Fraud Alert":
        return <ShieldAlert className="h-5 w-5 text-critical shrink-0" />;
      case "Risk Change":
        return <TrendingUp className="h-5 w-5 text-critical shrink-0" />;
      case "Forecast Warning":
        return <AlertTriangle className="h-5 w-5 text-warning shrink-0" />;
      case "Recommendation":
        return <Sparkles className="h-5 w-5 text-primary shrink-0" />;
      case "Report Ready":
        return <FileText className="h-5 w-5 text-primary shrink-0" />;
      default:
        return <Bell className="h-5 w-5 text-foreground-secondary shrink-0" />;
    }
  };

  return (
    <PageContainer className="pb-24">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-border/60 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="h-6.5 w-6.5 text-primary" /> NOTIFICATIONS CENTER
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Review real-time anomaly alerts, model updates, reports compiled, and credit score shift warnings.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            className="text-[10px] uppercase font-sans font-bold gap-1.5 cursor-pointer select-none border-border/80 hover:bg-surface-elevated"
          >
            <CheckCircle2 className="h-4 w-4 text-positive" /> Mark All Read
          </Button>
        )}
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="mt-6 flex gap-1.5 bg-surface-elevated/40 border border-border p-2 rounded-sm select-none">
        {(["All", "Unread", "High Priority"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-3 py-1.5 rounded-xs text-[10.5px] uppercase font-sans font-bold transition-all cursor-pointer",
              activeFilter === filter
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
            )}
          >
            {filter === "All" ? "All Alerts" : filter}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS LOG */}
      {filteredNotifications.length === 0 ? (
        <div className="mt-8 select-none text-center border border-border border-dashed p-12 rounded-sm bg-surface">
          <Bell className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">No alerts match filter</h3>
          <p className="text-xs text-foreground-secondary mt-1 max-w-sm mx-auto font-sans">
            You are fully caught up with all credit indices alerts and transactional anomaly sweeps.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4 select-none">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={cn(
                "border p-4 md:p-5 rounded-sm flex gap-4 transition-all duration-300 relative overflow-hidden",
                notif.read ? "border-border/80 bg-surface text-foreground-secondary" : "border-primary/30 bg-primary/5 text-foreground"
              )}
            >
              {/* Unread indicators pill */}
              {!notif.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}

              {/* Icon */}
              {getNotificationIcon(notif.type)}

              {/* Text detail */}
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-1 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-foreground-muted block">
                      {notif.type}
                    </span>
                    <h4 className={cn("font-bold text-foreground", !notif.read && "font-extrabold")}>
                      {notif.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-foreground-muted pt-0.5">
                    <span className={cn(
                      "font-sans font-bold text-[8.5px] px-1.5 py-0.25 rounded-xs uppercase tracking-wider border",
                      notif.priority === "High"
                        ? "text-critical bg-critical/10 border-critical/15"
                        : "text-foreground-secondary bg-surface-elevated border-border"
                    )}>
                      {notif.priority} Priority
                    </span>
                    <span>{notif.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-foreground-secondary leading-relaxed font-sans mt-1">
                  {notif.description}
                </p>

                {/* Actions row */}
                <div className="pt-4 border-t border-border/40 mt-3 flex items-center justify-between">
                  <Button
                    onClick={() => {
                      toast.info(`Redirecting target dashboard page...`);
                      router.push(notif.actionHref);
                    }}
                    size="sm"
                    className="text-[9.5px] uppercase font-sans font-extrabold py-2 px-3.5 gap-1 cursor-pointer"
                  >
                    {notif.actionLabel} <ArrowRight className="h-3 w-3" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[9.5px] font-sans font-bold hover:underline uppercase text-foreground-muted px-2 py-1 cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="text-[9.5px] font-sans font-bold hover:text-critical uppercase text-foreground-muted px-2 py-1 cursor-pointer flex items-center gap-0.5"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>

              </div>

            </Card>
          ))}
        </div>
      )}

    </PageContainer>
  );
}
