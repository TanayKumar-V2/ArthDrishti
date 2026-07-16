"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  FileText,
  Settings,
  Sparkles,
  User,
  Trash2,
  Archive,
  Pin,
  RefreshCw,
  MoreVertical,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  VolumeX,
  Volume2
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sheet, Tooltip } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";
import { INITIAL_NOTIFICATIONS, NotificationItem } from "@/lib/notifications_data";
import { OFFICER_APPLICANTS } from "@/lib/officer_data";

export default function OfficerNotificationsPage() {
  const router = useRouter();

  // Primary Notifications Data State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Filters State
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All");

  // Selected Notification for Drawer
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Load from LocalStorage or seed initial data
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem("arth-notifications");
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          localStorage.setItem("arth-notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
          setNotifications(INITIAL_NOTIFICATIONS);
        }
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (e) {
        console.error("Failed to load notifications from local storage", e);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate small network delay for premium feel
    const timer = setTimeout(() => {
      loadNotifications();
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Save updates helper
  const saveNotifications = (updatedList: NotificationItem[]) => {
    setNotifications(updatedList);
    localStorage.setItem("arth-notifications", JSON.stringify(updatedList));
    // Trigger custom layout event to sync unread badge counts
    window.dispatchEvent(new Event("notifications-updated"));
  };

  // Sync state if localStorage changes elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("arth-notifications");
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Simulate refresh operation
  const handleRefresh = () => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      const saved = localStorage.getItem("arth-notifications");
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        localStorage.setItem("arth-notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
        setNotifications(INITIAL_NOTIFICATIONS);
      }
      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoading(false);
      toast.success("Notifications feed refreshed.");
    }, 700);
  };

  // Trigger Fake Error layout test
  const handleTriggerError = () => {
    setIsError(true);
    toast.error("Simulating bureau gateway database error...");
  };

  // Resolve Related Applicant metadata for Drawer
  const relatedApplicant = useMemo(() => {
    if (!selectedNotif?.relatedApplicantId) return null;
    return OFFICER_APPLICANTS.find((a) => a.id === selectedNotif.relatedApplicantId) || null;
  }, [selectedNotif]);

  // Priority styling map
  const priorityConfig = {
    Critical: { text: "Critical", badgeVariant: "destructive" as const },
    High: { text: "High Priority", badgeVariant: "warning" as const },
    Medium: { text: "Medium Priority", badgeVariant: "primary" as const },
    Low: { text: "Info", badgeVariant: "default" as const }
  };

  // Notification Icon builder
  const getNotificationIconDetails = (type: NotificationItem["type"], title: string) => {
    const isHighRisk = title.toLowerCase().includes("high risk");
    
    if (type === "fraud") {
      return { icon: ShieldAlert, colorClass: "text-critical bg-critical/10 border-critical/20" };
    }
    if (type === "applications") {
      return { icon: FileText, colorClass: "text-primary bg-primary/10 border-primary/20" };
    }
    if (type === "approvals") {
      return { icon: CheckCircle2, colorClass: "text-positive bg-positive/10 border-positive/20" };
    }
    if (type === "assignments") {
      return { icon: User, colorClass: "text-forecast bg-forecast/10 border-forecast/20" };
    }
    if (type === "reports") {
      return { icon: FileText, colorClass: "text-ai bg-ai/10 border-ai/20" };
    }
    if (type === "system") {
      if (title.toLowerCase().includes("recommendation") || title.toLowerCase().includes("ai")) {
        return { icon: Sparkles, colorClass: "text-ai bg-ai/10 border-ai/20" };
      }
      return { icon: Settings, colorClass: "text-foreground-secondary bg-surface-elevated border-border" };
    }
    return { icon: Bell, colorClass: "text-primary bg-primary/10 border-primary/20" };
  };

  // Actions
  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, readStatus: true }));
    saveNotifications(updated);
    toast.success("All notifications marked as read.");
  };

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, readStatus: !n.readStatus } : n
    );
    saveNotifications(updated);
    
    // Update active selected drawer if open
    if (selectedNotif && selectedNotif.id === id) {
      setSelectedNotif((prev) => prev ? { ...prev, readStatus: !prev.readStatus } : null);
    }
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    saveNotifications(updated);
    toast.success(
      notifications.find((n) => n.id === id)?.pinned
        ? "Notification unpinned."
        : "Notification pinned to top."
    );

    if (selectedNotif && selectedNotif.id === id) {
      setSelectedNotif((prev) => prev ? { ...prev, pinned: !prev.pinned } : null);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
    toast.success("Notification deleted.");
    if (selectedNotif && selectedNotif.id === id) {
      setIsDrawerOpen(false);
      setSelectedNotif(null);
    }
  };

  const handleArchive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // In local state, we'll mark it as archived by removing or flagging it. Let's delete for mock simplicity
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
    toast.success("Notification archived.");
    if (selectedNotif && selectedNotif.id === id) {
      setIsDrawerOpen(false);
      setSelectedNotif(null);
    }
  };

  const handleMuteType = (type: NotificationItem["type"], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isMuted = notifications.find((n) => n.type === type)?.muted;
    const updated = notifications.map((n) =>
      n.type === type ? { ...n, muted: !isMuted } : n
    );
    saveNotifications(updated);
    toast.success(
      isMuted
        ? `Alert category "${type}" unmuted.`
        : `Alert category "${type}" muted. You will not receive desktop badges for this type.`
    );
    if (selectedNotif && selectedNotif.type === type) {
      setSelectedNotif((prev) => prev ? { ...prev, muted: !isMuted } : null);
    }
  };

  // Filtered Notifications list calculations
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        // Search filter
        const matchSearch =
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Tab category filter
        let matchTab = true;
        if (activeTab === "Unread") matchTab = !n.readStatus;
        else if (activeTab !== "All") {
          // Tab maps to type
          matchTab = n.type === activeTab.toLowerCase();
        }

        // Priority filter
        const matchPriority = priorityFilter === "All" || n.priority === priorityFilter;

        // Date filter logic
        let matchDate = true;
        if (dateFilter !== "All") {
          const timestampDate = new Date(n.timestamp);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - timestampDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (dateFilter === "Today") {
            matchDate = diffDays <= 1 && timestampDate.getDate() === now.getDate();
          } else if (dateFilter === "Yesterday") {
            matchDate = diffDays <= 2 && timestampDate.getDate() !== now.getDate();
          } else if (dateFilter === "This Week") {
            matchDate = diffDays <= 7;
          } else if (dateFilter === "Earlier") {
            matchDate = diffDays > 7;
          }
        }

        return matchSearch && matchTab && matchPriority && matchDate;
      })
      .sort((a, b) => {
        // Pinned notifications always float to the top
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Then sort chronologically
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [notifications, activeTab, searchTerm, priorityFilter, dateFilter]);

  // Group filtered notifications by relative category groups
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: []
    };

    filteredNotifications.forEach((n) => {
      const date = new Date(n.timestamp);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1 && date.getDate() === now.getDate()) {
        groups.Today.push(n);
      } else if (diffDays <= 2 && date.getDate() !== now.getDate()) {
        groups.Yesterday.push(n);
      } else if (diffDays <= 7) {
        groups["This Week"].push(n);
      } else {
        groups.Earlier.push(n);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.readStatus && !n.muted).length;
  }, [notifications]);

  // Navigation callbacks
  const handleOpenUnderwriting = (applicantId: string) => {
    setIsDrawerOpen(false);
    toast.info(`Routing to underwriting desk for applicant: ${applicantId}`);
    router.push(`/officer/underwriting/${applicantId}`);
  };

  const handleOpenApplicant = (applicantId: string) => {
    setIsDrawerOpen(false);
    toast.info(`Routing to applicant document profile details: ${applicantId}`);
    router.push(`/officer/applications?id=${applicantId}`);
  };

  const handleItemClick = (notif: NotificationItem) => {
    setSelectedNotif(notif);
    setIsDrawerOpen(true);

    // Mark as read automatically when opened
    if (!notif.readStatus) {
      const updated = notifications.map((n) =>
        n.id === notif.id ? { ...n, readStatus: true } : n
      );
      saveNotifications(updated);
    }
  };

  // Tabs structure
  const tabs = ["All", "Unread", "Applications", "Fraud", "Approvals", "Assignments", "Reports", "System"] as const;

  return (
    <PageContainer>
      
      {/* Header bar */}
      <SectionHeader
        title="Notification Center"
        description="Receive smart analytics alerts, risk warnings, and system status updates."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* QA Simulate error button */}
            <Button variant="ghost" size="sm" className="text-[10px] opacity-40 hover:opacity-100 cursor-pointer" onClick={handleTriggerError}>
              Simulate Error
            </Button>
            
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 shrink-0", isLoading && "animate-spin")} />
              Refresh
            </Button>
            
            <Button variant="primary" size="sm" className="cursor-pointer" onClick={handleMarkAllRead} disabled={unreadCount === 0 || isLoading}>
              Mark All Read
            </Button>
          </div>
        }
      />

      {/* Main Container block */}
      {isError ? (
        /* ERROR STATE RETRY PANEL */
        <Card className="border-critical/30 bg-critical/5 shadow-xs">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-4">
            <AlertCircle className="h-12 w-12 text-critical" />
            <div className="space-y-1 max-w-md">
              <h2 className="font-heading font-semibold text-lg text-foreground">API Connection Failed</h2>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                ArthDrishti could not synchronize notifications with the risk database. Check your employee VPN gateway or network connection.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button variant="primary" onClick={handleRefresh}>
                Retry Connection
              </Button>
              <Button variant="outline" onClick={() => setIsError(false)}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          
          {/* Unread metrics ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border px-4 py-3 rounded-sm text-xs font-sans">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Bell className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>
                You have <span className="text-primary font-bold font-mono">{unreadCount}</span> unread alert flags in your inbox queue.
              </span>
            </div>
            {lastUpdated && (
              <span className="text-[10px] text-foreground-muted">
                Last checked: <span className="font-mono">{lastUpdated}</span>
              </span>
            )}
          </div>

          {/* Filters Bar card */}
          <Card className="z-10 relative">
            <CardContent className="p-4 flex flex-col gap-4 font-sans">
              
              {/* Category tabs */}
              <div className="flex border-b border-border/60 overflow-x-auto scrollbar-none pb-0">
                <div className="flex space-x-6 whitespace-nowrap">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    
                    // Dynamic counts for tabs
                    let tabCount: number | undefined;
                    if (tab === "All") tabCount = notifications.length;
                    else if (tab === "Unread") tabCount = notifications.filter(n => !n.readStatus).length;
                    else {
                      tabCount = notifications.filter(n => n.type === tab.toLowerCase()).length;
                    }

                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "relative pb-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5",
                          isActive ? "text-primary font-bold" : "text-foreground-secondary hover:text-foreground"
                        )}
                      >
                        <span>{tab}</span>
                        {tabCount !== undefined && (
                          <span className={cn(
                            "inline-flex items-center justify-center px-1.5 py-0.25 rounded-full text-[9px] font-mono leading-none border",
                            isActive 
                              ? "bg-primary text-white border-primary" 
                              : "bg-surface-elevated text-foreground-muted border-border/60"
                          )}>
                            {tabCount}
                          </span>
                        )}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filters dropdowns and inputs */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs, details, hashes..."
                    className="w-full h-10 pl-10 pr-9 bg-surface-elevated border border-border text-foreground rounded-xs text-sm font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-0.5 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Filters grid */}
                <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
                  
                  {/* Priority Select */}
                  <div className="flex items-center gap-2 h-10 px-3 bg-surface-elevated border border-border rounded-xs">
                    <Filter className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="bg-transparent text-xs text-foreground font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-1"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Critical">Critical Only</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Date Filter Select */}
                  <div className="flex items-center gap-2 h-10 px-3 bg-surface-elevated border border-border rounded-xs">
                    <Clock className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="bg-transparent text-xs text-foreground font-semibold border-none outline-none focus:ring-0 cursor-pointer pr-1"
                    >
                      <option value="All">All Dates</option>
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="This Week">This Week</option>
                      <option value="Earlier">Earlier</option>
                    </select>
                  </div>

                </div>

              </div>

            </CardContent>
          </Card>

          {/* NOTIFICATIONS LIST / TIMELINE */}
          {isLoading ? (
            /* SKELETON LOADING STATE */
            <div className="space-y-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="bg-surface border border-border p-5 rounded-sm flex items-start gap-4 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-border shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="h-4 bg-border rounded-md w-1/3" />
                    <div className="h-3 bg-border rounded-md w-3/4" />
                    <div className="h-2.5 bg-border rounded-md w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* EMPTY STATE */
            <Card className="border-dashed border-border/80">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-4">
                <div className="h-16 w-16 bg-surface-elevated rounded-full flex items-center justify-center text-foreground-muted border border-border border-dashed">
                  <Bell className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-semibold text-base text-foreground">No Notifications</h3>
                  <p className="text-xs text-foreground-secondary max-w-xs leading-normal">
                    There are no matching notifications in your workspace box right now. Click Refresh to check for newer items.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Refresh Feed
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* TIMELINE CHRONOLOGICAL SECTIONS */
            <div className="space-y-8 font-sans">
              {(Object.keys(groupedNotifications) as Array<keyof typeof groupedNotifications>).map((groupName) => {
                const groupList = groupedNotifications[groupName];
                if (groupList.length === 0) return null;

                return (
                  <div key={groupName} className="space-y-3">
                    {/* Timeline section header */}
                    <div className="flex items-center gap-3 select-none">
                      <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest bg-surface border border-border px-2 py-0.5 rounded-full">
                        {groupName}
                      </span>
                      <div className="h-px bg-border flex-1" />
                    </div>

                    {/* Timeline group items */}
                    <div className="space-y-2 relative pl-4 border-l border-border/60 ml-3.5">
                      {groupList.map((notif) => {
                        const { icon: Icon, colorClass } = getNotificationIconDetails(notif.type, notif.title);
                        const priority = priorityConfig[notif.priority] || priorityConfig.Low;
                        const isUnread = !notif.readStatus;

                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleItemClick(notif)}
                            className={cn(
                              "group relative bg-surface border hover:border-border-strong rounded-sm p-4 flex gap-4 items-start transition-all cursor-pointer select-none",
                              isUnread 
                                ? "border-primary/30 shadow-xs hover:shadow-md shadow-primary/5 bg-surface" 
                                : "border-border bg-surface-elevated/40 hover:bg-surface-elevated/80"
                            )}
                          >
                            {/* Unread indicator dot */}
                            {isUnread && (
                              <div className="absolute top-1/2 -translate-y-1/2 left-[-16px] h-2 w-2 rounded-full bg-primary" />
                            )}

                            {/* Icon Wrapper */}
                            <div className={cn("h-9.5 w-9.5 rounded-full flex items-center justify-center shrink-0 border", colorClass)}>
                              <Icon className="h-4.5 w-4.5 shrink-0" />
                            </div>

                            {/* Details text area */}
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                                <h3 className="font-heading font-bold text-xs sm:text-sm text-foreground flex items-center gap-2 truncate">
                                  {notif.pinned && <Pin className="h-3 w-3 text-warning fill-warning shrink-0" />}
                                  {notif.title}
                                </h3>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge variant={priority.badgeVariant}>{priority.text}</Badge>
                                  <span className="text-[10px] text-foreground-secondary font-mono">{notif.relativeTime}</span>
                                </div>
                              </div>
                              <p className="text-xs text-foreground-secondary leading-relaxed font-sans line-clamp-2 md:line-clamp-none pr-0 md:pr-16">
                                {notif.description}
                              </p>
                              {notif.muted && (
                                <div className="inline-flex items-center gap-1 text-[9px] text-foreground-muted pt-0.5">
                                  <VolumeX className="h-3 w-3" />
                                  <span>Alert category muted</span>
                                </div>
                              )}
                            </div>

                            {/* Hover Quick Actions */}
                            <div className="md:opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity shrink-0 bg-transparent py-1 self-center pl-2">
                              <Tooltip content={isUnread ? "Mark as Read" : "Mark as Unread"}>
                                <button
                                  onClick={(e) => handleToggleRead(notif.id, e)}
                                  className="h-8 w-8 rounded-sm hover:bg-surface-hover text-foreground-secondary hover:text-foreground flex items-center justify-center border border-transparent hover:border-border cursor-pointer transition-colors"
                                >
                                  {isUnread ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                              </Tooltip>

                              <Tooltip content={notif.pinned ? "Unpin Notification" : "Pin Notification"}>
                                <button
                                  onClick={(e) => handleTogglePin(notif.id, e)}
                                  className={cn(
                                    "h-8 w-8 rounded-sm hover:bg-surface-hover flex items-center justify-center border border-transparent hover:border-border cursor-pointer transition-colors",
                                    notif.pinned ? "text-warning" : "text-foreground-secondary hover:text-foreground"
                                  )}
                                >
                                  <Pin className="h-4 w-4" />
                                </button>
                              </Tooltip>

                              <Tooltip content="Archive Alert">
                                <button
                                  onClick={(e) => handleArchive(notif.id, e)}
                                  className="h-8 w-8 rounded-sm hover:bg-surface-hover text-foreground-secondary hover:text-foreground flex items-center justify-center border border-transparent hover:border-border cursor-pointer transition-colors"
                                >
                                  <Archive className="h-4 w-4" />
                                </button>
                              </Tooltip>

                              <Tooltip content="Delete Alert">
                                <button
                                  onClick={(e) => handleDelete(notif.id, e)}
                                  className="h-8 w-8 rounded-sm hover:bg-surface-hover text-foreground-secondary hover:text-critical flex items-center justify-center border border-transparent hover:border-border cursor-pointer transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </Tooltip>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* NOTIFICATION DETAILS DRAWER / SHEET */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Notification Details"
        className="w-full max-w-md md:max-w-lg"
      >
        {selectedNotif && (
          <div className="space-y-6 font-sans text-xs">
            
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={priorityConfig[selectedNotif.priority]?.badgeVariant || "default"}>
                  {selectedNotif.priority}
                </Badge>
                <span className="text-[10px] text-foreground-secondary font-mono">{selectedNotif.relativeTime}</span>
              </div>
              <h2 className="font-heading font-bold text-base text-foreground leading-tight">
                {selectedNotif.title}
              </h2>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {selectedNotif.description}
              </p>
            </div>

            {/* AI Summary Block */}
            {selectedNotif.aiSummary && (
              <div className="p-4 border border-ai/20 bg-ai/5 rounded-sm space-y-2 relative overflow-hidden">
                {/* AI Badge watermark */}
                <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none overflow-hidden">
                  <div className="absolute top-[-8px] right-[-24px] w-16 h-5 bg-ai/10 border border-ai/20 rotate-45 flex items-center justify-center text-[7px] text-ai font-bold uppercase select-none tracking-wider">
                    AI
                  </div>
                </div>
                <span className="font-heading font-bold text-xs text-ai flex items-center gap-1.5 select-none">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  Applicant Intelligence Summary
                </span>
                <p className="text-foreground leading-relaxed">
                  {selectedNotif.aiSummary}
                </p>
              </div>
            )}

            {/* Related Applicant Card */}
            {relatedApplicant && (
              <div className="border border-border rounded-sm bg-surface-elevated/40 p-4 space-y-3">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">
                  Related Applicant Context
                </span>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-border bg-primary/10 text-primary font-heading font-extrabold flex items-center justify-center">
                    {relatedApplicant.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-heading font-bold text-xs text-foreground truncate">
                      {relatedApplicant.name}
                    </span>
                    <span className="block text-[10px] text-foreground-secondary">
                      {relatedApplicant.loanType} &bull; Request amount: <span className="font-semibold text-foreground font-mono">₹{relatedApplicant.amount.toLocaleString()}</span>
                    </span>
                  </div>
                  <Badge variant={
                    relatedApplicant.status === "Manual Review" || relatedApplicant.status === "Under Review" 
                      ? "warning" 
                      : relatedApplicant.status === "AI Approved" || relatedApplicant.status === "Completed" 
                        ? "success" 
                        : "destructive"
                  }>
                    {relatedApplicant.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-surface p-2.5 rounded-xs border border-border/60">
                  <div>
                    <span className="text-[10px] text-foreground-muted block">Default Risk score</span>
                    <span className={cn("font-bold font-mono text-xs", 
                      relatedApplicant.defaultProb >= 50 ? "text-critical" : 
                      relatedApplicant.defaultProb >= 25 ? "text-warning" : "text-positive"
                    )}>
                      {relatedApplicant.defaultProb}% Default Prob
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-muted block">AI Recommendation</span>
                    <span className="font-bold text-xs text-ai">
                      {relatedApplicant.aiRec}
                    </span>
                  </div>
                </div>

                {/* Underwriting Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-[11px] font-bold h-9 cursor-pointer"
                    onClick={() => handleOpenUnderwriting(relatedApplicant.id)}
                  >
                    Open Underwriting Workspace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[11px] font-bold h-9 cursor-pointer"
                    onClick={() => handleOpenApplicant(relatedApplicant.id)}
                  >
                    Open Applicant Profile
                  </Button>
                </div>

              </div>
            )}

            {/* Timeline Events details */}
            {selectedNotif.timeline && selectedNotif.timeline.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">
                  Alert Lifecycle Log
                </span>
                
                <div className="space-y-4 pl-3 border-l border-border relative ml-1.5">
                  {selectedNotif.timeline.map((item, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className="absolute top-1 left-[-16.5px] h-2 w-2 rounded-full bg-border border border-surface shrink-0" />
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-foreground">{item.status}</span>
                        <span className="text-foreground-muted font-mono">{item.time}</span>
                      </div>
                      <p className="text-foreground-secondary text-[11px] leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions Footer Panel inside Drawer */}
            <div className="border-t border-border pt-4 flex flex-wrap gap-2">
              <Button
                variant={selectedNotif.readStatus ? "outline" : "primary"}
                size="sm"
                className="cursor-pointer text-[10px]"
                onClick={(e) => handleToggleRead(selectedNotif.id, e)}
              >
                {selectedNotif.readStatus ? "Mark Unread" : "Mark Read"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-[10px] gap-1"
                onClick={(e) => handleTogglePin(selectedNotif.id, e)}
              >
                <Pin className="h-3 w-3" />
                {selectedNotif.pinned ? "Unpin Alert" : "Pin Alert"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-[10px] gap-1"
                onClick={(e) => handleMuteType(selectedNotif.type, e)}
              >
                {selectedNotif.muted ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                {selectedNotif.muted ? "Unmute Category" : "Mute Category"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-[10px] text-critical hover:bg-critical/5 border-transparent"
                onClick={(e) => handleDelete(selectedNotif.id, e)}
              >
                Delete Alert
              </Button>
            </div>

          </div>
        )}
      </Sheet>
      
    </PageContainer>
  );
}
