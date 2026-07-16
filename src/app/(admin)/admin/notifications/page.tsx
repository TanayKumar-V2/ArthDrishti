"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell,
  Activity,
  TrendingUp,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  SlidersHorizontal,
  Search,
  X,
  ChevronRight,
  Cpu,
  FileSpreadsheet,
  FileDown,
  CheckCircle,
  Info,
  Calendar,
  Server,
  Clock,
  ArrowRight,
  Database,
  Lock,
  Settings,
  Key,
  ChevronLeft,
  Eye,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Play,
  Pause,
  Save,
  Trash,
  UserCheck,
  Check,
  VolumeX,
  Pin,
  PinOff,
  Archive,
  FileText
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge, TrendIndicator } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, Tooltip, Dropdown, Sheet, Tabs } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import {
  NOTIFICATIONS_REGISTRY,
  NOTIFICATION_KPIS,
  NOTIFICATIONS_BY_TYPE_DATA,
  PRIORITY_DISTRIBUTION_DATA,
  ALERTS_TREND_WEEKLY,
  ALERTS_TREND_DAILY,
  NOTIFICATION_RULES,
  ADMIN_LIST,
  AdminNotification,
  NotificationCategory,
  PriorityLevel,
  DeliveryChannel,
  NotificationRuleCard
} from "@/lib/notifications_data";

// Custom theme colors
const COLORS = {
  primary: "#4F7CFF",
  ai: "#8B5CF6",
  forecast: "#06B6D4",
  positive: "#10B981",
  warning: "#F59E0B",
  critical: "#EF4444",
  secondary: "#64748B",
  muted: "#94A3B8"
};

export default function NotificationsCenterPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Tabs selectors
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [feedCategoryTab, setFeedCategoryTab] = useState<string>("all");

  // Telemetry items arrays
  const [notifications, setNotifications] = useState<AdminNotification[]>(NOTIFICATIONS_REGISTRY);
  const [notificationRules, setNotificationRules] = useState<NotificationRuleCard[]>(NOTIFICATION_RULES);

  // Filters toolbar states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [selectedAdmin, setSelectedAdmin] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");

  // Selection & Details handles
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isSimulateEmptyState, setIsSimulateEmptyState] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigneeName, setAssigneeName] = useState("Unassigned");

  // Streaming log feed
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [liveLogCount, setLiveLogCount] = useState(0);

  // Sync state on load
  useEffect(() => {
    setMounted(true);
    setLastSyncTime(new Date().toLocaleTimeString());
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  // Simulate streaming log notifications
  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      // Pick random notification to clone and push as a fresh Today log
      const randomIndex = Math.floor(Math.random() * NOTIFICATIONS_REGISTRY.length);
      const chosen = NOTIFICATIONS_REGISTRY[randomIndex];
      const freshNtf: AdminNotification = {
        ...chosen,
        id: `NTF-${Math.floor(Math.random() * 900) + 920}`,
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        timeLabel: "Today",
        status: "Unread",
        pinned: false,
        archived: false,
        assignedAdmin: null
      };

      setNotifications(prev => [freshNtf, ...prev]);
      setLiveLogCount(prev => prev + 1);
      
      // Notify client
      toast.info(`New alert parsed: ${freshNtf.title}`, {
        description: freshNtf.description,
        action: {
          label: "View Trace",
          onClick: () => {
            setSelectedNotification(freshNtf);
            setIsDetailsDrawerOpen(true);
          }
        }
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Synchronize data manually
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      toast.success("Platform notifications registry re-synchronized.");
    }, 600);
  }, []);

  // Mark all notifications read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, status: "Read" })));
    toast.success("All platform notifications marked as read.");
  };

  // Notification action toggles
  const handleToggleReadStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => 
      prev.map(n => {
        if (n.id === id) {
          const newStatus = n.status === "Read" ? "Unread" : "Read";
          toast.success(`Notification marked as ${newStatus.toLowerCase()}.`);
          return { ...n, status: newStatus };
        }
        return n;
      })
    );
  };

  const handleTogglePinStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => 
      prev.map(n => {
        if (n.id === id) {
          const newPin = !n.pinned;
          toast.success(newPin ? "Notification pinned to top." : "Notification unpinned.");
          return { ...n, pinned: newPin };
        }
        return n;
      })
    );
  };

  const handleArchiveStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => 
      prev.map(n => {
        if (n.id === id) {
          toast.success("Notification compressed and sent to compliance archives.");
          return { ...n, archived: true };
        }
        return n;
      })
    );
    if (selectedNotification?.id === id) {
      setIsDetailsDrawerOpen(false);
    }
  };

  const handleDeleteNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted permanently from database.");
    if (selectedNotification?.id === id) {
      setIsDetailsDrawerOpen(false);
    }
  };

  const handleMuteCategory = (category: NotificationCategory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toast.warning(`Notifications muted for category: ${category}. Rules updated.`);
  };

  // Rule settings enable/disable toggles
  const handleToggleRule = (id: string) => {
    setNotificationRules(prev => 
      prev.map(r => {
        if (r.id === id) {
          const newStatus = !r.enabled;
          toast.success(`${r.title} alerts ${newStatus ? "enabled" : "disabled"} on routing gateway.`);
          return { ...r, enabled: newStatus };
        }
        return r;
      })
    );
  };

  const handleRuleChannelToggle = (ruleId: string, channel: DeliveryChannel) => {
    setNotificationRules(prev => 
      prev.map(r => {
        if (r.id === ruleId) {
          const hasChannel = r.channels.includes(channel);
          const newChannels = hasChannel 
            ? r.channels.filter(c => c !== channel) 
            : [...r.channels, channel];
          toast.success(`Updated channels configuration for ${r.title}.`);
          return { ...r, channels: newChannels };
        }
        return r;
      })
    );
  };

  const handleRulePriorityChange = (ruleId: string, prio: PriorityLevel) => {
    setNotificationRules(prev => 
      prev.map(r => r.id === ruleId ? { ...r, priority: prio } : r)
    );
    toast.success("Alert priority filter settings updated.");
  };

  // Assign modal handlers
  const handleOpenAssignModal = (ntf: AdminNotification, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNotification(ntf);
    setAssigneeName(ntf.assignedAdmin || "Unassigned");
    setIsAssignModalOpen(true);
  };

  const handleApplyAssignee = () => {
    if (selectedNotification) {
      setNotifications(prev => 
        prev.map(n => n.id === selectedNotification.id ? { ...n, assignedAdmin: assigneeName === "Unassigned" ? null : assigneeName } : n)
      );
      setIsAssignModalOpen(false);
      toast.success(`Alert assigned to administrator: ${assigneeName}`);
    }
  };

  const handleResolveAlert = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toast.success(`Critical alert ${id} marked as resolved. Resolution telemetry compiled.`);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotification?.id === id) {
      setIsDetailsDrawerOpen(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedPriority("all");
    setSelectedModule("all");
    setSelectedStatus("all");
    setSelectedOrg("all");
    setSelectedAdmin("all");
    setSelectedTimeframe("all");
    toast.info("Search filters reset to default.");
  };

  const handleSaveView = () => {
    toast.success("Saved filter configuration to your custom compliance bookmarks.");
  };

  // Exporters mock trigger
  const handleExport = (format: "PDF" | "CSV" | "Excel") => {
    const toastId = toast.loading(`Generating system operations ${format} report...`);
    setTimeout(() => {
      try {
        let content = "";
        let filename = `arthdrishti_notifications_${new Date().toISOString().split("T")[0]}`;
        
        if (format === "CSV") {
          content = "Notification ID,Timestamp,Category,Priority,Module,Title,Description,Status\n";
          notifications.forEach(n => {
            content += `${n.id},${n.timestamp},${n.category},${n.priority},${n.module},${n.title},${n.description},${n.status}\n`;
          });
          filename += ".csv";
        } else {
          content = `ARTHDRISHTI PLATFORM OPERATIONS ALERTS\n=====================================\n`;
          content += `Export Date: ${new Date().toLocaleString()}\n`;
          content += `Audit Range Status: Unread Count: ${notifications.filter(n => n.status === "Unread").length}\n\n`;
          notifications.forEach(n => {
            content += `[${n.timestamp}] [${n.priority}] ${n.title}: ${n.description} (Module: ${n.module})\n`;
          });
          filename += format === "Excel" ? ".xlsx" : ".pdf";
        }

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Successfully downloaded ${format} reports.`, { id: toastId });
      } catch (err) {
        toast.error(`Failed to generate ${format} reports.`, { id: toastId });
      }
    }, 1100);
  };

  // Priority styling map
  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case "Critical":
        return "text-critical bg-critical/10 border-critical/20 animate-pulse font-bold";
      case "High":
        return "text-critical bg-critical/5 border-critical/15 font-semibold";
      case "Warning":
        return "text-warning bg-warning/10 border-warning/20 font-semibold";
      case "Success":
        return "text-positive bg-positive/10 border-positive/20 font-semibold";
      case "Information":
      default:
        return "text-primary bg-primary/10 border-primary/20 font-medium";
    }
  };

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case "AI Notification":
        return Cpu;
      case "Infrastructure Event":
        return Server;
      case "Security Incident":
        return Lock;
      case "Platform Alert":
        return ShieldAlert;
      case "Operational Update":
      default:
        return Activity;
    }
  };

  // Selector unique lists
  const uniqueModules = useMemo(() => ["all", ...Array.from(new Set(notifications.map(n => n.module)))], [notifications]);
  const uniqueOrgs = useMemo(() => ["all", ...Array.from(new Set(notifications.map(n => n.relatedOrg)))], [notifications]);

  // Filters logic
  const filteredNotifications = useMemo(() => {
    if (isSimulateEmptyState) return [];
    
    return notifications.filter(n => {
      // Exclude archived logs
      if (n.archived) return false;

      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            n.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || n.category === selectedCategory;
      const matchesPriority = selectedPriority === "all" || n.priority === selectedPriority;
      const matchesModule = selectedModule === "all" || n.module === selectedModule;
      const matchesStatus = selectedStatus === "all" || n.status === selectedStatus;
      const matchesOrg = selectedOrg === "all" || n.relatedOrg === selectedOrg;
      
      const matchesAdmin = selectedAdmin === "all" || 
        (selectedAdmin === "unassigned" ? n.assignedAdmin === null : n.assignedAdmin === selectedAdmin);

      let matchesTime = true;
      if (selectedTimeframe === "24h") {
        matchesTime = n.timeLabel === "Today";
      }

      // Sidebar sub-category tabs
      let matchesTab = true;
      if (feedCategoryTab === "unread") matchesTab = n.status === "Unread";
      else if (feedCategoryTab === "critical") matchesTab = n.priority === "Critical";
      else if (feedCategoryTab === "warnings") matchesTab = n.priority === "Warning";
      else if (feedCategoryTab === "AI") matchesTab = n.category === "AI Notification";
      else if (feedCategoryTab === "security") matchesTab = n.category === "Security Incident";
      else if (feedCategoryTab === "infrastructure") matchesTab = n.category === "Infrastructure Event";
      else if (feedCategoryTab === "users") matchesTab = n.module === "User Management";
      else if (feedCategoryTab === "organizations") matchesTab = n.module === "Orgs Onboarding";
      else if (feedCategoryTab === "models") matchesTab = n.module === "AI Deployer" || n.module === "Model Drift";
      else if (feedCategoryTab === "system") matchesTab = n.category === "Platform Alert";

      return matchesSearch && matchesCategory && matchesPriority && matchesModule && matchesStatus && matchesOrg && matchesAdmin && matchesTime && matchesTab;
    });
  }, [notifications, searchTerm, selectedCategory, selectedPriority, selectedModule, selectedStatus, selectedOrg, selectedAdmin, selectedTimeframe, feedCategoryTab, isSimulateEmptyState]);

  // Group filtered records into chronological timeline bins
  const groupedTimeline = useMemo(() => {
    const bins: Record<string, AdminNotification[]> = {
      "Today": [],
      "Yesterday": [],
      "This Week": [],
      "Earlier": []
    };

    // Separate pinned logs from standard logs
    const pinnedList = filteredNotifications.filter(n => n.pinned);
    const unpinnedList = filteredNotifications.filter(n => !n.pinned);

    // Group remaining logs
    unpinnedList.forEach(n => {
      if (bins[n.timeLabel]) {
        bins[n.timeLabel].push(n);
      } else {
        bins["Earlier"].push(n);
      }
    });

    return {
      pinned: pinnedList,
      sections: Object.entries(bins).filter(([_, items]) => items.length > 0)
    };
  }, [filteredNotifications]);

  // Mini sparkline SVG renderer
  const renderSparkline = (points: number[], status: string) => {
    if (!points || points.length === 0) return null;
    const width = 80;
    const height = 24;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    
    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    let strokeColor = "stroke-primary";
    if (status === "success") strokeColor = "stroke-positive";
    if (status === "warning") strokeColor = "stroke-warning";
    if (status === "destructive") strokeColor = "stroke-critical";

    return (
      <svg width={width} height={height} className="overflow-visible select-none pointer-events-none">
        <polyline
          fill="none"
          strokeWidth="1.75"
          className={strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  const handleRowClick = (ntf: AdminNotification) => {
    setSelectedNotification(ntf);
    setIsDetailsDrawerOpen(true);
    // Mark as read immediately on click
    if (ntf.status === "Unread") {
      setNotifications(prev => prev.map(n => n.id === ntf.id ? { ...n, status: "Read" } : n));
    }
  };

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/60 pb-5 mb-6 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
              Notification Center
            </h1>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" title="System alerts parser listening" />
          </div>
          <p className="font-sans text-sm text-foreground-secondary mt-1.5 leading-relaxed max-w-[800px]">
            Monitor platform-wide alerts, AI notifications, infrastructure events, security incidents and operational updates from a single enterprise workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Refresh notifications registry telemetry"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Mark all unread notifications as read"
          >
            <Check className="h-3.5 w-3.5 mr-1.5 text-positive" />
            <span>Mark All Read</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("settings")}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Navigate to alert rules config tab"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            <span>Settings</span>
          </Button>

          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm" className="h-9 px-3.5 focus-visible:outline-2" aria-label="Export notifications records options">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                <span>Export Hub</span>
              </Button>
            }
            items={[
              { id: "PDF", label: "PDF Document", icon: FileText, onClick: () => handleExport("PDF") },
              { id: "CSV", label: "CSV Spreadsheet", icon: FileSpreadsheet, onClick: () => handleExport("CSV") },
              { id: "Excel", label: "Excel Sheet", icon: FileDown, onClick: () => handleExport("Excel") }
            ]}
          />
        </div>
      </div>

      {/* 2. Operations Center Tab Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3 mb-6 select-none">
        <Tabs
          tabs={[
            { id: "feed", label: "Notifications Feed Tracker", icon: Bell },
            { id: "charts", label: "Analytics Overview", icon: Activity },
            { id: "settings", label: "Alert Configuration Rules", icon: Settings }
          ]}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        <div className="flex items-center gap-2">
          {/* Simulate empty list filter state */}
          <Tooltip content="Toggle to simulate missing notifications records">
            <button
              onClick={() => setIsSimulateEmptyState(prev => !prev)}
              className={cn(
                "p-2 rounded-sm border transition-colors outline-none focus-visible:outline-2 cursor-pointer",
                isSimulateEmptyState
                  ? "bg-warning/15 text-warning border-warning/45"
                  : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
              )}
              aria-label="Simulate Empty Dashboard State"
            >
              <Info className="h-4.5 w-4.5" />
            </button>
          </Tooltip>

          {/* Simulate error network state */}
          <Tooltip content="Toggle to simulate network metrics failure">
            <button
              onClick={() => setIsError(prev => !prev)}
              className={cn(
                "p-2 rounded-sm border transition-colors outline-none focus-visible:outline-2 cursor-pointer",
                isError
                  ? "bg-critical/15 text-critical border-critical/45"
                  : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
              )}
              aria-label="Simulate Network Error State"
            >
              <ShieldAlert className="h-4.5 w-4.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ERROR PANEL SCREEN */}
      {isError ? (
        <Card className="border border-critical bg-critical/5 select-none my-8 p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-critical/10 flex items-center justify-center text-critical">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Notification Gateway Timeout
            </CardTitle>
            <CardDescription className="text-sm font-sans mt-2 max-w-lg mx-auto">
              Gateway alert streaming sockets timed out. The connection index has been rejected. Validate routing configurations.
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsError(false)}
              className="text-foreground border-border hover:bg-surface-hover"
            >
              Cancel Simulation
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRefresh}
              className="bg-critical text-white focus-visible:outline-2"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span>Retry Registry Fetch</span>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* TAB 1: NOTIFICATIONS TIMELINE FEED */}
          {activeTab === "feed" && (
            <div className="space-y-6">
              
              {/* 8 summary KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
                {NOTIFICATION_KPIS.map((kpi) => {
                  if (isLoading) {
                    return (
                      <Card key={kpi.title} className="bg-surface border border-border select-none animate-pulse">
                        <CardContent className="p-5 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="h-3.5 w-20 bg-border rounded-xs" />
                            <div className="h-3.5 w-8 bg-border rounded-xs" />
                          </div>
                          <div className="h-8 w-16 bg-border rounded-xs mt-1" />
                          <div className="h-6 w-full bg-border rounded-xs mt-2" />
                        </CardContent>
                      </Card>
                    );
                  }

                  const sparklineVal = kpi.title === "Unread Notifications" 
                    ? [5, 4, 3, 3, 3, notifications.filter(n => n.status === "Unread").length]
                    : kpi.sparkline;

                  const cardVal = kpi.title === "Unread Notifications"
                    ? notifications.filter(n => n.status === "Unread").length
                    : kpi.value;

                  return (
                    <Card
                      key={kpi.title}
                      className={cn(
                        "bg-surface border border-border/80 hover:border-primary/40 hover:scale-[1.01] transition-all duration-200 shadow-xs group",
                        kpi.status === "destructive" && "border-critical/30 bg-critical/0 hover:border-critical/50"
                      )}
                    >
                      <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-sans font-medium text-foreground-secondary group-hover:text-foreground transition-colors tracking-wide">
                            {kpi.title}
                          </span>
                          {kpi.trend !== 0 && (
                            <TrendIndicator value={kpi.trend} />
                          )}
                        </div>

                        <div className="flex items-baseline justify-between mt-3">
                          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                            {cardVal}
                          </span>
                          <div className="opacity-90">
                            {renderSparkline(sparklineVal, kpi.status)}
                          </div>
                        </div>

                        <p className="text-[10px] text-foreground-muted font-sans font-normal mt-2 truncate">
                          {kpi.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Filters toolbar card */}
              <Card className="bg-surface/50 border border-border/80 select-none shadow-xs">
                <CardContent className="py-4 px-6 flex flex-col gap-4">
                  
                  {/* Row 1: Search & Reset */}
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    
                    <div className="relative w-full flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search logs by ID, message title, description keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-8 bg-surface-elevated border border-border text-foreground rounded-sm text-xs font-sans placeholder-foreground-muted focus:border-primary focus:outline-none transition-all"
                        aria-label="Search notifications logs"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-0.5 rounded-full hover:bg-surface"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="h-10 px-4 text-xs font-semibold"
                      >
                        <X className="h-3.5 w-3.5 mr-1.5 text-foreground-muted" />
                        <span>Reset Filters</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveView}
                        className="h-10 px-4 text-xs font-semibold bg-primary text-white"
                      >
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        <span>Save View</span>
                      </Button>
                    </div>

                  </div>

                  {/* Row 2: Advanced Selectors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 border-t border-border/40 pt-4">
                    
                    {/* Category */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Type</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter by notification category type"
                      >
                        <option value="all">All Types</option>
                        <option value="Platform Alert">Platform Alert</option>
                        <option value="AI Notification">AI Notification</option>
                        <option value="Infrastructure Event">Infrastructure Event</option>
                        <option value="Security Incident">Security Incident</option>
                        <option value="Operational Update">Operational Update</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Priority</label>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter by priority level"
                      >
                        <option value="all">All Priorities</option>
                        <option value="Information">Information</option>
                        <option value="Success">Success</option>
                        <option value="Warning">Warning</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Module */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Module</label>
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter by source module"
                      >
                        {uniqueModules.map(m => (
                          <option key={m} value={m}>{m === "all" ? "All Modules" : m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter by read status"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Read">Read</option>
                        <option value="Unread">Unread</option>
                      </select>
                    </div>

                    {/* Organization */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Organization</label>
                      <select
                        value={selectedOrg}
                        onChange={(e) => setSelectedOrg(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter by organization"
                      >
                        {uniqueOrgs.map(o => (
                          <option key={o} value={o}>{o === "all" ? "All Orgs" : o}</option>
                        ))}
                      </select>
                    </div>

                    {/* Assigned Admin */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Assigned Admin</label>
                      <select
                        value={selectedAdmin}
                        onChange={(e) => setSelectedAdmin(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter by assigned admin"
                      >
                        <option value="all">All Admins</option>
                        <option value="unassigned">Unassigned</option>
                        <option value="Marcus Vance (SecOps)">Marcus Vance</option>
                        <option value="Sarah Jenkins (Platform)">Sarah Jenkins</option>
                        <option value="Auditor Roy (Compliance)">Auditor Roy</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-foreground-muted">Date Range</label>
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="text-xs bg-surface-elevated border border-border px-2.5 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                        aria-label="Filter by timeframe"
                      >
                        <option value="all">All Time</option>
                        <option value="24h">Today Only</option>
                      </select>
                    </div>

                  </div>

                </CardContent>
              </Card>

              {/* Layout splits (Sidebar categories filter + Main timeline stream) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Responsive categories sidebar filters tabs */}
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible border border-border bg-surface rounded-sm p-1.5 gap-1.5 select-none scrollbar-none whitespace-nowrap lg:whitespace-normal">
                  <span className="hidden lg:block text-[9px] uppercase font-bold text-foreground-muted px-3 py-1.5 tracking-wider">Categories</span>
                  {[
                    { id: "all", label: "All Notifications" },
                    { id: "unread", label: "Unread Messages" },
                    { id: "critical", label: "Critical Alerts" },
                    { id: "warnings", label: "Warnings" },
                    { id: "AI", label: "AI & Models" },
                    { id: "security", label: "Security Gateway" },
                    { id: "infrastructure", label: "Infrastructure" },
                    { id: "users", label: "User Access" },
                    { id: "organizations", label: "Organizations" },
                    { id: "models", label: "Model Registry" },
                    { id: "system", label: "Platform Alerts" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFeedCategoryTab(tab.id)}
                      className={cn(
                        "w-full px-3 py-2 text-xs text-left font-semibold rounded-sm transition-colors cursor-pointer outline-none focus-visible:outline-2",
                        feedCategoryTab === tab.id
                          ? "bg-primary text-white"
                          : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Main grouped timeline feed */}
                <div className="lg:col-span-3 space-y-6">
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse select-none">
                      {[1, 2, 3].map(idx => (
                        <div key={idx} className="h-16 bg-surface-elevated rounded-sm w-full" />
                      ))}
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-4 border border-border bg-surface rounded-sm select-none">
                      <div className="h-12 w-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground-muted animate-pulse">
                        <Bell className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">No Notifications Available</h4>
                        <p className="text-xs text-foreground-muted mt-1 max-w-xs mx-auto">
                          We couldn't find any operational alerts matching your parameters criteria.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleRefresh}
                        className="bg-primary text-white h-9 px-4 font-semibold text-xs"
                      >
                        Refresh Feed
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Pinned list section */}
                      {groupedTimeline.pinned.length > 0 && (
                        <div className="space-y-2 select-none animate-fadeIn">
                          <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider flex items-center gap-1">
                            <Pin className="h-3 w-3 text-primary rotate-45" />
                            <span>Pinned Notifications</span>
                          </span>
                          
                          {groupedTimeline.pinned.map((ntf) => (
                            <NotificationCard
                              key={ntf.id}
                              ntf={ntf}
                              onClick={() => handleRowClick(ntf)}
                              onToggleRead={(e) => handleToggleReadStatus(ntf.id, e)}
                              onTogglePin={(e) => handleTogglePinStatus(ntf.id, e)}
                              onArchive={(e) => handleArchiveStatus(ntf.id, e)}
                              onDelete={(e) => handleDeleteNotification(ntf.id, e)}
                              onMute={(e) => handleMuteCategory(ntf.category, e)}
                              onAssign={(e) => handleOpenAssignModal(ntf, e)}
                              onResolve={(e) => handleResolveAlert(ntf.id, e)}
                              getPriorityStyle={getPriorityStyle}
                              getCategoryIcon={getCategoryIcon}
                            />
                          ))}
                        </div>
                      )}

                      {/* Timeline sections */}
                      {groupedTimeline.sections.map(([section, items]) => (
                        <div key={section} className="space-y-2 select-none animate-fadeIn">
                          <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block border-b border-border/40 pb-1 mb-2 font-mono">
                            {section}
                          </span>
                          
                          {items.map((ntf) => (
                            <NotificationCard
                              key={ntf.id}
                              ntf={ntf}
                              onClick={() => handleRowClick(ntf)}
                              onToggleRead={(e) => handleToggleReadStatus(ntf.id, e)}
                              onTogglePin={(e) => handleTogglePinStatus(ntf.id, e)}
                              onArchive={(e) => handleArchiveStatus(ntf.id, e)}
                              onDelete={(e) => handleDeleteNotification(ntf.id, e)}
                              onMute={(e) => handleMuteCategory(ntf.category, e)}
                              onAssign={(e) => handleOpenAssignModal(ntf, e)}
                              onResolve={(e) => handleResolveAlert(ntf.id, e)}
                              getPriorityStyle={getPriorityStyle}
                              getCategoryIcon={getCategoryIcon}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ANALYTICS OVERVIEW */}
          {activeTab === "charts" && (
            <div className="space-y-6">
              
              {/* Pie Distribution & Priority Distribution Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
                
                {/* Pie Distribution by Category */}
                <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Notifications By Category
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Distribution of events compiled across platform operations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-60 w-full flex items-center justify-center">
                    {isLoading ? (
                      <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                          <Pie 
                            data={NOTIFICATIONS_BY_TYPE_DATA} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={50} 
                            outerRadius={80} 
                            paddingAngle={3}
                          >
                            {NOTIFICATIONS_BY_TYPE_DATA.map((entry, index) => {
                              const colorsList = [COLORS.primary, COLORS.ai, COLORS.forecast, COLORS.warning, COLORS.critical];
                              return <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} />;
                            })}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Priority distribution bar chart */}
                <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Priority Level Distribution
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Alarms breakdown categorized by critical severity metrics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-60 w-full">
                    {isLoading ? (
                      <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={PRIORITY_DISTRIBUTION_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                            {PRIORITY_DISTRIBUTION_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Live stream logs logger feed widget */}
                <Card className="bg-surface border border-border shadow-xs flex flex-col justify-between">
                  <CardHeader className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-heading flex items-center gap-2">
                        <span>Streaming Alarms</span>
                        {isLiveActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-positive animate-ping" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Streaming alarms counts: {liveLogCount} logs.
                      </CardDescription>
                    </div>

                    <button
                      onClick={() => setIsLiveActive(prev => !prev)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm border cursor-pointer focus-visible:outline-2 outline-none flex items-center gap-1.5",
                        isLiveActive 
                          ? "bg-positive/10 text-positive border-positive/30 hover:bg-positive hover:text-white" 
                          : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
                      )}
                      aria-label={isLiveActive ? "Pause active alerts streaming" : "Resume alerts streaming"}
                    >
                      {isLiveActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      <span>{isLiveActive ? "Pause" : "Resume"}</span>
                    </button>
                  </CardHeader>
                  <CardContent className="pt-4 overflow-y-auto max-h-[190px] pr-1 flex-1 flex flex-col gap-2 font-mono text-[9px] text-foreground-secondary">
                    {notifications.slice(0, 5).map((log) => (
                      <div key={log.id} className="p-2 bg-surface-elevated/45 border border-border/40 rounded-xs flex flex-col gap-1 hover:border-border transition-colors cursor-pointer" onClick={() => handleRowClick(log)}>
                        <div className="flex justify-between items-center text-foreground font-semibold">
                          <span className={cn("inline-flex items-center rounded-xs px-1 py-0.25 text-[8px] border font-sans", getPriorityStyle(log.priority))}>{log.priority}</span>
                          <span className="text-[8px] text-foreground-muted">{log.timestamp.split(" ")[1]}</span>
                        </div>
                        <span className="truncate mt-0.5 text-foreground leading-none">{log.title}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </div>

              {/* Weekly/Daily alerts trends charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
                
                {/* Daily Alerts bar chart */}
                <Card className="bg-surface border border-border shadow-xs">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Daily Alarm Volume Trend
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Hourly distribution tracking generated vs resolved alarms today.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-64 w-full">
                    {isLoading ? (
                      <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ALERTS_TREND_DAILY} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis dataKey="time" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Area name="Alarms Count" type="monotone" dataKey="count" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                          <Line name="Resolved Count" type="monotone" dataKey="resolved" stroke={COLORS.positive} strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Weekly Alerts Line chart */}
                <Card className="bg-surface border border-border shadow-xs">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base sm:text-lg font-heading">
                      Weekly Alarm Metrics Performance
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Compares daily alarms vs marked resolutions over the past 7 days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 h-64 w-full">
                    {isLoading ? (
                      <div className="h-full bg-surface-elevated/40 animate-pulse rounded-sm" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ALERTS_TREND_WEEKLY} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                          <XAxis dataKey="time" stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <YAxis stroke="var(--foreground-muted)" fontSize={10} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "4px", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Line name="Total Alarms" type="monotone" dataKey="count" stroke={COLORS.critical} strokeWidth={2.5} />
                          <Line name="Resolved Alarms" type="monotone" dataKey="resolved" stroke={COLORS.positive} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* TAB 3: ALERT CONFIG RULES */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              
              <div className="border-b border-border/40 pb-3 mb-4 select-none">
                <h2 className="text-base sm:text-lg font-heading font-semibold text-foreground">Alert Configuration Rules Settings</h2>
                <p className="text-xs text-foreground-secondary mt-0.5 font-sans">Set routing priorities and delivery channels parameters for alerts generated across modular sections.</p>
              </div>

              {/* List of rules settings cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none animate-fadeIn">
                {notificationRules.map((rule) => (
                  <Card key={rule.id} className="bg-surface border border-border p-5 flex flex-col justify-between gap-5 shadow-xs">
                    
                    {/* Header: title & toggle switch */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm font-bold text-foreground">{rule.title}</span>
                      </div>

                      {/* Enable/disable checkbox toggle switch */}
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm border cursor-pointer transition-colors focus-visible:outline-2 outline-none",
                          rule.enabled 
                            ? "bg-positive/10 text-positive border-positive/30 hover:bg-positive hover:text-white" 
                            : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
                        )}
                        aria-label={rule.enabled ? `Disable ${rule.title} alerts routing` : `Enable ${rule.title} alerts routing`}
                      >
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>

                    {/* Body: selectors Priority & delivery channels checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-4">
                      
                      {/* Priority selector */}
                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block">Routing Priority</label>
                        <select
                          value={rule.priority}
                          onChange={(e) => handleRulePriorityChange(rule.id, e.target.value as PriorityLevel)}
                          disabled={!rule.enabled}
                          className="w-full text-xs font-sans font-semibold bg-surface-elevated border border-border px-3 py-2 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer disabled:opacity-50"
                          aria-label={`Set priority limit for ${rule.title}`}
                        >
                          <option value="Information">Information</option>
                          <option value="Success">Success</option>
                          <option value="Warning">Warning</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      {/* Delivery channels checkboxes list */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block">Delivery Channels</label>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { name: "In-App", icon: Bell },
                            { name: "Email", icon: Mail },
                            { name: "SMS", icon: MessageSquare },
                            { name: "Push", icon: Smartphone },
                            { name: "Webhook", icon: Webhook }
                          ] as const).map((channel) => {
                            const active = rule.channels.includes(channel.name);
                            const ChannelIcon = channel.icon;

                            return (
                              <Tooltip key={channel.name} content={`${channel.name} channel`}>
                                <button
                                  onClick={() => handleRuleChannelToggle(rule.id, channel.name)}
                                  disabled={!rule.enabled}
                                  className={cn(
                                    "p-2 border rounded-sm transition-colors focus-visible:outline-2 outline-none cursor-pointer disabled:opacity-40",
                                    active 
                                      ? "bg-primary/15 text-primary border-primary/45" 
                                      : "bg-surface-elevated text-foreground-secondary border-border hover:bg-surface-hover"
                                  )}
                                  aria-label={`Toggle ${channel.name} channel for ${rule.title}`}
                                >
                                  <ChannelIcon className="h-4 w-4" />
                                </button>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </Card>
                ))}
              </div>

            </div>
          )}
        </>
      )}

      {/* 3. Assign to Administrator modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Alert to Administrator"
        className="max-w-sm select-none font-sans"
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div>
              <span className="text-sm font-bold text-foreground block">{selectedNotification.title}</span>
              <span className="text-xs text-foreground-secondary mt-1 block">{selectedNotification.description}</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Select Administrator</label>
              <select
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full text-xs font-sans font-semibold bg-surface-elevated border border-border px-3.5 py-2.5 focus:border-primary outline-none rounded-sm transition-colors text-foreground cursor-pointer"
                aria-label="Select assignee admin from registry"
              >
                {ADMIN_LIST.map(adm => (
                  <option key={adm} value={adm}>{adm}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-border/40 pt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAssignModalOpen(false)}
                className="h-9 px-4 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyAssignee}
                className="h-9 px-4 text-xs bg-primary text-white"
              >
                Apply Assignee
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. Detailed Notification Trace Drawer sheet */}
      <Sheet
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={selectedNotification ? `Alert Details: ${selectedNotification.id}` : "System Notification Trace"}
        side="right"
        className="w-full max-w-md sm:max-w-lg"
      >
        {selectedNotification && (
          <div className="flex flex-col h-full justify-between pb-8 select-none font-sans">
            <div className="space-y-6 overflow-y-auto pr-1">
              
              {/* Profile Card Summary */}
              <div>
                <span className="text-lg font-heading font-semibold text-foreground leading-snug">{selectedNotification.title}</span>
                <span className="text-xs text-foreground-secondary block font-mono mt-1">
                  ID: {selectedNotification.id} | Module: <span className="font-semibold text-foreground">{selectedNotification.module}</span>
                </span>
                <p className="text-xs text-foreground-secondary mt-2.5 leading-normal">
                  {selectedNotification.description}
                </p>
              </div>

              {/* Status and priority badges */}
              <div className="grid grid-cols-2 gap-3.5 border-t border-b border-border/40 py-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block font-mono">Routing Priority</span>
                  <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[9px] font-bold border mt-1.5", getPriorityStyle(selectedNotification.priority))}>
                    {selectedNotification.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block font-mono">Category type</span>
                  <span className="text-xs font-semibold text-foreground block mt-2">{selectedNotification.category}</span>
                </div>
              </div>

              {/* Related resources parameters checklist */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono">Related Trace Context</h4>
                
                {[
                  { label: "Target Resource Key", val: selectedNotification.relatedResource },
                  { label: "Related User Profile", val: selectedNotification.relatedUser },
                  { label: "Organization Entity", val: selectedNotification.relatedOrg },
                  { label: "AI Ensemble Model ID", val: selectedNotification.relatedModel },
                  { label: "Assigned Administrator", val: selectedNotification.assignedAdmin || "Unassigned" }
                ].map((met, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-border/40 pb-2">
                    <span className="text-foreground-secondary font-medium">{met.label}</span>
                    <span className="font-semibold text-foreground text-right">{met.val}</span>
                  </div>
                ))}
              </div>

              {/* Timeline milestone steps logs */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-foreground-muted" />
                  <span>Execution Milestone logs</span>
                </h4>
                <div className="bg-surface-elevated border border-border p-3 rounded-sm font-mono text-[10px] leading-relaxed text-foreground-secondary max-h-[140px] overflow-y-auto space-y-1.5">
                  {selectedNotification.timeline.map((line, idx) => (
                    <div key={idx} className="break-all">{line}</div>
                  ))}
                  <div className="text-foreground font-semibold pt-1 border-t border-border/40 mt-1">Recommended action: {selectedNotification.recommendedAction}</div>
                </div>
              </div>

            </div>

            <div className="border-t border-border/40 pt-6 mt-6 flex justify-end gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="h-10 px-4 text-xs text-foreground border border-border"
              >
                Close Drawer
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleToggleReadStatus(selectedNotification.id, e)}
                className="h-10 px-4 text-xs text-foreground border border-border"
              >
                Mark {selectedNotification.status === "Read" ? "Unread" : "Read"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleOpenAssignModal(selectedNotification, e)}
                className="h-10 px-4 text-xs text-foreground border border-border"
              >
                Assign
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleArchiveStatus(selectedNotification.id, e)}
                className="h-10 px-4 text-xs text-foreground border border-border"
              >
                Archive
              </Button>

              {selectedNotification.priority === "Critical" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => handleResolveAlert(selectedNotification.id, e)}
                  className="h-10 px-4 text-xs bg-positive hover:bg-positive/90 text-white"
                >
                  Resolve Alert
                </Button>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </PageContainer>
  );
}

// Notification Card Row Subcomponent
interface CardProps {
  ntf: AdminNotification;
  onClick: () => void;
  onToggleRead: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onArchive: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onMute: (e: React.MouseEvent) => void;
  onAssign: (e: React.MouseEvent) => void;
  onResolve: (e: React.MouseEvent) => void;
  getPriorityStyle: (prio: PriorityLevel) => string;
  getCategoryIcon: (cat: NotificationCategory) => React.ComponentType<{ className?: string }>;
}

function NotificationCard({
  ntf,
  onClick,
  onToggleRead,
  onTogglePin,
  onArchive,
  onDelete,
  onMute,
  onAssign,
  onResolve,
  getPriorityStyle,
  getCategoryIcon
}: CardProps) {
  const IconComponent = getCategoryIcon(ntf.category);

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-sm border bg-surface hover:bg-surface-elevated/40 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-4 group hover:scale-[1.002] shadow-xs outline-none focus-visible:outline-2",
        ntf.status === "Unread" ? "border-primary/30 shadow-xs" : "border-border/50",
        ntf.pinned && "bg-primary/5/5"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Notification ${ntf.id}: ${ntf.title}. Status: ${ntf.status}. Click to view details.`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Unread indicator dot */}
        <div className="flex-shrink-0 pt-1.5 relative">
          <div className="h-8 w-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground-secondary">
            {React.createElement(IconComponent, { className: "h-4 w-4" })}
          </div>
          {ntf.status === "Unread" && (
            <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-primary rounded-full border border-surface animate-pulse" />
          )}
        </div>

        <div className="flex flex-col text-left min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("inline-flex items-center rounded-xs px-2 py-0.25 text-[8px] font-bold border", getPriorityStyle(ntf.priority))}>
              {ntf.priority}
            </span>
            <span className="text-xs font-semibold text-foreground truncate">{ntf.title}</span>
            <span className="text-[9px] text-foreground-muted font-mono">{ntf.timestamp}</span>
          </div>
          <p className="text-[11px] text-foreground-secondary mt-1 leading-normal font-sans pr-4">
            {ntf.description}
          </p>
          <div className="flex items-center gap-3.5 mt-2 text-[9px] text-foreground-muted font-mono flex-wrap">
            <span>Module: <span className="text-foreground-secondary font-semibold">{ntf.module}</span></span>
            <span>Target: <span className="text-foreground-secondary font-semibold">{ntf.relatedResource}</span></span>
            {ntf.assignedAdmin && (
              <span className="text-primary font-bold">Assigned: {ntf.assignedAdmin.split(" ")[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Row quick actions menu controls */}
      <div className="flex items-center gap-1 flex-shrink-0 md:pt-1 opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        
        {/* Toggle read */}
        <Tooltip content={ntf.status === "Read" ? "Mark Unread" : "Mark Read"}>
          <button
            onClick={onToggleRead}
            className="p-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-sm cursor-pointer outline-none focus-visible:outline-2"
            aria-label={ntf.status === "Read" ? "Mark as unread" : "Mark as read"}
          >
            <Check className={cn("h-3.5 w-3.5", ntf.status === "Read" ? "text-positive" : "text-foreground-muted")} />
          </button>
        </Tooltip>

        {/* Toggle pin */}
        <Tooltip content={ntf.pinned ? "Unpin" : "Pin to Top"}>
          <button
            onClick={onTogglePin}
            className="p-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-sm cursor-pointer outline-none focus-visible:outline-2"
            aria-label={ntf.pinned ? "Unpin notification" : "Pin notification"}
          >
            <Pin className={cn("h-3.5 w-3.5 rotate-45", ntf.pinned ? "text-primary fill-primary" : "text-foreground-muted")} />
          </button>
        </Tooltip>

        {/* Assign admin */}
        <Tooltip content="Assign Admin">
          <button
            onClick={onAssign}
            className="p-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-sm cursor-pointer outline-none focus-visible:outline-2"
            aria-label="Assign alert to administrator"
          >
            <UserCheck className="h-3.5 w-3.5 text-foreground-muted" />
          </button>
        </Tooltip>

        {/* Resolve Alert */}
        {ntf.priority === "Critical" && (
          <Tooltip content="Mark Resolved">
            <button
              onClick={onResolve}
              className="p-1.5 text-positive hover:text-white hover:bg-positive/20 rounded-sm cursor-pointer outline-none focus-visible:outline-2"
              aria-label="Mark alert as resolved"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        )}

        {/* Archive */}
        <Tooltip content="Archive Log">
          <button
            onClick={onArchive}
            className="p-1.5 text-foreground-secondary hover:text-foreground hover:bg-surface-elevated rounded-sm cursor-pointer outline-none focus-visible:outline-2"
            aria-label="Archive notification log"
          >
            <Archive className="h-3.5 w-3.5 text-foreground-muted" />
          </button>
        </Tooltip>

        {/* Delete */}
        <Tooltip content="Delete Log">
          <button
            onClick={onDelete}
            className="p-1.5 text-critical hover:text-white hover:bg-critical/15 rounded-sm cursor-pointer outline-none focus-visible:outline-2"
            aria-label="Delete notification log"
          >
            <Trash className="h-3.5 w-3.5 text-critical" />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* View details */}
        <button
          onClick={onClick}
          className="text-xs text-primary font-bold px-2 py-1 hover:underline cursor-pointer focus-visible:outline-2"
          aria-label="Open detailed trace sheets panel"
        >
          Inspect
        </button>

      </div>
    </div>
  );
}
