"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Palette,
  Shield,
  Lock,
  Building2,
  Users,
  Cpu,
  Bell,
  Mail,
  Network,
  Database,
  Cloud,
  FileText,
  Globe,
  Construction,
  SlidersHorizontal,
  Save,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Info,
  CheckCircle,
  AlertTriangle,
  Play,
  X,
  Plus,
  Eye,
  Key,
  HardDrive,
  Clock,
  Menu,
  ChevronDown,
  ChevronUp,
  Server,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, Tooltip, Dropdown } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

import {
  DEFAULT_PLATFORM_SETTINGS,
  INITIAL_INTEGRATIONS,
  INITIAL_BACKUPS,
  IntegrationCard,
  BackupHistoryItem
} from "@/lib/settings_data";

export default function PlatformSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Core settings states
  const [originalSettings, setOriginalSettings] = useState({ ...DEFAULT_PLATFORM_SETTINGS });
  const [settings, setSettings] = useState({ ...DEFAULT_PLATFORM_SETTINGS });
  const [integrations, setIntegrations] = useState<IntegrationCard[]>(INITIAL_INTEGRATIONS);
  const [backups, setBackups] = useState<BackupHistoryItem[]>(INITIAL_BACKUPS);

  // Layout states
  const [activeSection, setActiveSection] = useState<string>("general");
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    general: true
  });

  // Modal / Confirm overlay states
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");

  // Key Visibility states
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Define Category configuration options
  const SETTINGS_SECTIONS = [
    { id: "general", label: "General Parameters", icon: Settings, desc: "Platform naming and workspace details." },
    { id: "branding", label: "Branding Assets", icon: Palette, desc: "Color palettes, logo files, and footer text." },
    { id: "auth", label: "Authentication Rules", icon: Key, desc: "SSO configurations and password complexity rules." },
    { id: "security", label: "Security & Firewall", icon: Shield, desc: "Two-factor settings, whitelisted IP/domain blocks." },
    { id: "orgs", label: "Organizations Quota", icon: Building2, desc: "New merchant domains whitelist policies." },
    { id: "users", label: "Users Directories", icon: Users, desc: "Access session concurrency and join rules." },
    { id: "ai", label: "AI & Decision Models", icon: Cpu, desc: "Confidence score limits and retraining schedules." },
    { id: "notifications", label: "Notification Channels", icon: Bell, desc: "Routing alerts to Slack, webhooks, or emails." },
    { id: "email", label: "Email SMTP settings", icon: Mail, desc: "Gateway setups and credentials." },
    { id: "api", label: "API Rate Limits", icon: Network, desc: "Base URLs, key counts, and JWT expiries." },
    { id: "storage", label: "Storage Buckets", icon: HardDrive, desc: "Amazon S3 paths and file size thresholds." },
    { id: "backup", label: "Backup & Restoration", icon: Database, desc: "Schedules, recovery points, and logs." },
    { id: "logs", label: "Log Retention Policies", icon: FileText, desc: "Audit trail hot/cold storage lengths." },
    { id: "integrations", label: "Third-party Integrations", icon: Cloud, desc: "Firebase, Stripe, AWS, Twilio, SendGrid status." },
    { id: "localization", label: "Localization Parameters", icon: Globe, desc: "Language selection, default currency, and country." },
    { id: "maintenance", label: "Maintenance Scheduler", icon: Construction, desc: "Toggle portal lockdown windows." },
    { id: "advanced", label: "Advanced Configurations", icon: SlidersHorizontal, desc: "SME underwriting feature flags." }
  ];

  // Helper update settings values
  const updateSetting = (key: keyof typeof DEFAULT_PLATFORM_SETTINGS, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Compare active settings to original settings to identify modifications
  const changedSettings = useMemo(() => {
    const changes: Array<{ label: string; field: string; oldVal: any; newVal: any }> = [];
    
    // Naming map to provide elegant logs
    const fieldNames: Record<string, string> = {
      platformName: "Platform Name",
      platformDescription: "Platform Description",
      supportEmail: "Support Email",
      supportPhone: "Support Phone",
      timezone: "Timezone",
      autoRetraining: "Auto Retraining Pipeline",
      aiConfidenceThreshold: "AI Confidence Threshold",
      maintenanceEnabled: "Maintenance Mode",
      tfaRequired: "Two-Factor Auth Requirement",
      primaryColor: "Primary Theme Color",
      smtpHost: "SMTP Server Host",
      smtpPort: "SMTP Server Port",
      apiRateLimit: "API Rate Limits Rate",
      devModeEnabled: "Platform Developer Mode",
      featureFlagSmeUnderwrite: "SME Underwriting Feature Flag"
    };

    (Object.keys(settings) as Array<keyof typeof DEFAULT_PLATFORM_SETTINGS>).forEach(k => {
      if (settings[k] !== originalSettings[k]) {
        changes.push({
          label: fieldNames[k] || String(k),
          field: String(k),
          oldVal: originalSettings[k],
          newVal: settings[k]
        });
      }
    });
    return changes;
  }, [settings, originalSettings]);

  const hasChanges = changedSettings.length > 0;

  // Discard changes
  const handleDiscardChanges = () => {
    setSettings({ ...originalSettings });
    toast.info("Configuration modifications discarded.");
  };

  // Save changes
  const handleSaveChangesConfirm = () => {
    setOriginalSettings({ ...settings });
    setIsSaveModalOpen(false);
    toast.success("Platform master configurations applied successfully.", {
      description: `Synchronized ${changedSettings.length} database properties.`
    });
  };

  // Export JSON configs
  const handleExportConfig = () => {
    toast.loading("Compiling platform parameters schema...");
    setTimeout(() => {
      try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
        const dlAnchorElem = document.createElement("a");
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `arthdrishti_config_${new Date().toISOString().split("T")[0]}.json`);
        dlAnchorElem.click();
        toast.success("Successfully exported platform configuration JSON.");
      } catch (err) {
        toast.error("Failed to compile settings files.");
      }
    }, 900);
  };

  // Import JSON configs
  const handleImportConfig = () => {
    try {
      const parsed = JSON.parse(importText);
      const updatedSettings = { ...settings, ...parsed };
      setSettings(updatedSettings);
      setIsImportModalOpen(false);
      setImportText("");
      toast.success("Successfully loaded custom configuration parameters.", {
        description: "Review and click 'Save Changes' to commit updates."
      });
    } catch (e) {
      toast.error("Failed to parse configurations JSON. Check syntax.");
    }
  };

  // SMTP connection test
  const handleTestSMTP = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Sending TOTP secure check envelope via SMTP to ${settings.senderEmail}...`,
        success: "SMTP connection established. SendGrid accepted transmission.",
        error: "SMTP check timed out."
      }
    );
  };

  // Trigger manual postgres backup
  const handleCreateBackup = () => {
    toast.loading("Compiling pg_dump postgres active transaction snapshots...");
    setTimeout(() => {
      const freshBackup: BackupHistoryItem = {
        id: `BKP-${Math.floor(Math.random() * 100) + 915}`,
        filename: `arthdrishti_manual_${new Date().toISOString().split("T")[0]}_${Math.floor(Math.random() * 9000 + 1000)}.sql`,
        size: "14.3 GB",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        status: "Success",
        type: "Manual"
      };
      setBackups(prev => [freshBackup, ...prev]);
      toast.success("Database snapshot generated and uploaded to AWS Glacier bucket.");
    }, 2200);
  };

  const handleRestoreBackup = (filename: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: `Restoring tables mapping configurations from ${filename}...`,
        success: "Database schema restoration completed. Platform rebooted successfully.",
        error: "Restoration failed."
      }
    );
  };

  // Connect/Disconnect integrations
  const handleToggleIntegration = (id: string, currentStatus: string) => {
    setIntegrations(prev => 
      prev.map(i => {
        if (i.id === id) {
          const nextStatus = currentStatus === "Connected" ? "Disconnected" : "Connected";
          toast.success(`${i.name} has been ${nextStatus.toLowerCase()}.`);
          return { ...i, status: nextStatus };
        }
        return i;
      })
    );
  };

  // Toggle mobile accordion items
  const toggleAccordion = (sectionId: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (!mounted) return null;

  return (
    <PageContainer>
      {/* 1. Page Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/60 pb-5 mb-6 select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground tracking-tight">
              Platform Settings
            </h1>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" title="Systems gateway checking indices" />
          </div>
          <p className="font-sans text-sm text-foreground-secondary mt-1.5 leading-relaxed max-w-[800px]">
            Configure platform-wide preferences, branding, authentication, AI behavior, notifications, integrations, security and system policies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Import system options JSON schema"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            <span>Import JSON</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportConfig}
            className="h-9 px-3.5 focus-visible:outline-2"
            aria-label="Export active configurations JSON settings"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>Export JSON</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasChanges}
            onClick={handleDiscardChanges}
            className="h-9 px-3.5 focus-visible:outline-2 text-foreground-secondary border-border disabled:opacity-50"
            aria-label="Discard modified config properties"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5 text-foreground-muted" />
            <span>Discard</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={!hasChanges}
            onClick={() => setIsSaveModalOpen(true)}
            className="h-9 px-4 font-semibold text-xs bg-primary text-white disabled:opacity-50 focus-visible:outline-2"
            aria-label="Commit configurations updates"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Changed indicators highlight banner */}
      {hasChanges && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-sm mb-6 flex items-center justify-between gap-4 select-none animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Info className="h-4.5 w-4.5 text-primary shrink-0" />
            <span className="text-xs text-foreground-secondary font-medium">
              You have <span className="font-bold text-foreground">{changedSettings.length}</span> unsaved configuration properties modified.
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDiscardChanges} className="text-xs text-foreground-secondary hover:underline outline-none cursor-pointer">Discard</button>
            <button onClick={() => setIsSaveModalOpen(true)} className="text-xs text-primary font-bold hover:underline outline-none cursor-pointer">Review changes</button>
          </div>
        </div>
      )}

      {/* 2. Responsive Configurations Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* DESKTOP/TABLET STICKY NAVIGATION (Hidden on mobile) */}
        <div className={cn(
          "hidden md:flex flex-col bg-surface border border-border rounded-sm p-1.5 gap-1 select-none sticky top-6 max-h-[85vh] overflow-y-auto scrollbar-none transition-all duration-300",
          isNavCollapsed ? "w-16" : "w-full"
        )}>
          
          {/* Collapse/Expand Toggle Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2 px-1">
            {!isNavCollapsed && (
              <span className="text-[9px] uppercase font-bold text-foreground-muted tracking-wider">Settings Group</span>
            )}
            <button
              onClick={() => setIsNavCollapsed(prev => !prev)}
              className="p-1 rounded-xs hover:bg-surface-elevated text-foreground-secondary outline-none focus-visible:outline-2 cursor-pointer ml-auto"
              aria-label={isNavCollapsed ? "Expand settings categories sidebar" : "Collapse settings categories sidebar"}
            >
              {isNavCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          </div>

          {SETTINGS_SECTIONS.map((sec) => {
            const active = activeSection === sec.id;
            const CategoryIcon = sec.icon;

            return (
              <Tooltip key={sec.id} content={isNavCollapsed ? sec.label : ""}>
                <button
                  onClick={() => setActiveSection(sec.id)}
                  className={cn(
                    "w-full px-3 py-2.5 text-xs text-left font-semibold rounded-xs transition-colors flex items-center gap-3 outline-none focus-visible:outline-2 cursor-pointer",
                    active
                      ? "bg-primary text-white"
                      : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
                  )}
                  aria-label={`Show ${sec.label} configurations`}
                >
                  <CategoryIcon className="h-4.5 w-4.5 shrink-0" />
                  {!isNavCollapsed && (
                    <span className="truncate">{sec.label}</span>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* MOBILE ACCORDIONS / DESKTOP PANEL CONTENT AREA */}
        <div className="col-span-1 md:col-span-3 space-y-4">
          
          {SETTINGS_SECTIONS.map((sec) => {
            const isAccordionOpen = openAccordions[sec.id] || false;
            const active = activeSection === sec.id;
            const CategoryIcon = sec.icon;

            // Renders panel only if selected on desktop, OR always visible (as accordion heads) on mobile
            return (
              <div
                key={sec.id}
                className={cn(
                  "border border-border bg-surface rounded-sm overflow-hidden transition-all shadow-xs",
                  // Hide on desktop if not active
                  !active && "md:hidden",
                  active && "border-primary/20 shadow-xs animate-fadeIn"
                )}
              >
                {/* Mobile Accordion Toggle Header (Hidden on Desktop) */}
                <div
                  onClick={() => toggleAccordion(sec.id)}
                  className="md:hidden flex items-center justify-between p-4 bg-surface-elevated/40 border-b border-border/40 cursor-pointer select-none"
                  role="button"
                  aria-expanded={isAccordionOpen}
                  aria-label={`Toggle ${sec.label} options accordion`}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="h-4.5 w-4.5 text-primary" />
                    <span className="text-sm font-bold text-foreground">{sec.label}</span>
                  </div>
                  {isAccordionOpen ? <ChevronUp className="h-4 w-4 text-foreground-secondary" /> : <ChevronDown className="h-4 w-4 text-foreground-secondary" />}
                </div>

                {/* Main Settings Category Panel Body */}
                <div className={cn(
                  "p-5 space-y-6 font-sans text-xs",
                  // Control accordion display for mobile
                  !isAccordionOpen && "hidden md:block"
                )}>
                  
                  {/* Desktop header information blocks */}
                  <div className="hidden md:block border-b border-border/40 pb-3 mb-4 select-none">
                    <h3 className="text-sm font-bold text-foreground font-heading">{sec.label}</h3>
                    <p className="text-xs text-foreground-secondary mt-0.5">{sec.desc}</p>
                  </div>

                  {/* Dynamic Category fields routing */}
                  
                  {/* GENERAL */}
                  {sec.id === "general" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-foreground-secondary font-semibold block">Platform Name</label>
                        <input
                          value={settings.platformName}
                          onChange={(e) => updateSetting("platformName", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary text-xs"
                          aria-label="Platform Name"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-foreground-secondary font-semibold block">Platform Description</label>
                        <textarea
                          rows={3}
                          value={settings.platformDescription}
                          onChange={(e) => updateSetting("platformDescription", e.target.value)}
                          className="w-full p-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary text-xs resize-none"
                          aria-label="Platform Description"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-foreground-secondary font-semibold block">Support Desk Email</label>
                        <input
                          type="email"
                          value={settings.supportEmail}
                          onChange={(e) => updateSetting("supportEmail", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary text-xs"
                          aria-label="Support Desk Email"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-foreground-secondary font-semibold block">Support Phone Hotline</label>
                        <input
                          value={settings.supportPhone}
                          onChange={(e) => updateSetting("supportPhone", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary text-xs"
                          aria-label="Support Phone Hotline"
                        />
                      </div>
                    </div>
                  )}

                  {/* BRANDING */}
                  {sec.id === "branding" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      <div className="space-y-4 p-4 border border-border/80 bg-surface-elevated/40 rounded-sm">
                        <span className="block font-bold text-foreground select-none">Assets Management</span>
                        
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" className="h-9">
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            <span>Upload Main Logo</span>
                          </Button>
                          <span className="text-[10px] text-foreground-muted truncate">{settings.logoUrl}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" className="h-9">
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            <span>Upload Favicon</span>
                          </Button>
                          <span className="text-[10px] text-foreground-muted truncate">{settings.faviconUrl}</span>
                        </div>
                      </div>

                      {/* Theme preview hex blocks */}
                      <div className="space-y-4 p-4 border border-border/80 bg-surface-elevated/40 rounded-sm">
                        <span className="block font-bold text-foreground select-none">Color Scheme Palette</span>
                        
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                          <div className="space-y-1">
                            <span className="block text-foreground-secondary font-semibold">Primary</span>
                            <div className="h-8 rounded-sm" style={{ backgroundColor: settings.primaryColor }} />
                            <input
                              value={settings.primaryColor}
                              onChange={(e) => updateSetting("primaryColor", e.target.value)}
                              className="w-full h-7 px-1 text-center bg-surface border border-border text-[9px] rounded-xs text-foreground focus:border-primary"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="block text-foreground-secondary font-semibold">Secondary</span>
                            <div className="h-8 rounded-sm" style={{ backgroundColor: settings.secondaryColor }} />
                            <input
                              value={settings.secondaryColor}
                              onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                              className="w-full h-7 px-1 text-center bg-surface border border-border text-[9px] rounded-xs text-foreground focus:border-primary"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="block text-foreground-secondary font-semibold">Accent</span>
                            <div className="h-8 rounded-sm" style={{ backgroundColor: settings.accentColor }} />
                            <input
                              value={settings.accentColor}
                              onChange={(e) => updateSetting("accentColor", e.target.value)}
                              className="w-full h-7 px-1 text-center bg-surface border border-border text-[9px] rounded-xs text-foreground focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-foreground-secondary font-semibold block">Branding Footer Text</label>
                        <input
                          value={settings.footerText}
                          onChange={(e) => updateSetting("footerText", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary text-xs"
                          aria-label="Footer Text"
                        />
                      </div>

                    </div>
                  )}

                  {/* AUTHENTICATION */}
                  {sec.id === "auth" && (
                    <div className="space-y-5">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Auth toggles */}
                        <div className="space-y-3.5 p-4 border border-border/80 bg-surface-elevated/40 rounded-sm">
                          <span className="block font-bold text-foreground mb-1 select-none">Supported Logins Settings</span>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary">Email and Password log</span>
                            <input
                              type="checkbox"
                              checked={settings.emailLogin}
                              onChange={(e) => updateSetting("emailLogin", e.target.checked)}
                              className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary">Google Workspace SSO Auth</span>
                            <input
                              type="checkbox"
                              checked={settings.googleLogin}
                              onChange={(e) => updateSetting("googleLogin", e.target.checked)}
                              className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary">Microsoft Azure Active Directory SSO</span>
                            <input
                              type="checkbox"
                              checked={settings.microsoftLogin}
                              onChange={(e) => updateSetting("microsoftLogin", e.target.checked)}
                              className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer h-4 w-4"
                            />
                          </div>
                        </div>

                        {/* Password security configurations */}
                        <div className="space-y-4 p-4 border border-border/80 bg-surface-elevated/40 rounded-sm">
                          <span className="block font-bold text-foreground mb-1 select-none">Access Expiry parameters</span>
                          
                          <div className="space-y-1.5 text-xs text-foreground-secondary">
                            <label className="text-[10px] uppercase font-bold text-foreground-muted block">Session Timeout Limit (Minutes)</label>
                            <input
                              type="number"
                              value={settings.sessionTimeout}
                              onChange={(e) => updateSetting("sessionTimeout", Number(e.target.value))}
                              className="w-full h-10 px-3 bg-surface border border-border text-foreground rounded-xs focus:border-primary outline-none text-xs"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs text-foreground-secondary">
                            <label className="text-[10px] uppercase font-bold text-foreground-muted block">Remember Me cookie duration (Days)</label>
                            <input
                              type="number"
                              value={settings.rememberMeDuration}
                              onChange={(e) => updateSetting("rememberMeDuration", Number(e.target.value))}
                              className="w-full h-10 px-3 bg-surface border border-border text-foreground rounded-xs focus:border-primary outline-none text-xs"
                            />
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* SECURITY */}
                  {sec.id === "security" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 p-4 border border-border bg-surface-elevated/40 rounded-sm sm:col-span-2 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="block font-bold text-foreground">Enforce Two-Factor Authentication (2FA)</span>
                          <span className="block text-foreground-secondary text-[11px]">Require all admins and loan officers profiles to authenticate via TOTP authenticators app.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.tfaRequired}
                          onChange={(e) => updateSetting("tfaRequired", e.target.checked)}
                          className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer h-4.5 w-4.5"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Minimum Password Length</label>
                        <input
                          type="number"
                          value={settings.minPasswordLength}
                          onChange={(e) => updateSetting("minPasswordLength", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Max Login Failures lockout limits</label>
                        <input
                          type="number"
                          value={settings.failedLoginLimit}
                          onChange={(e) => updateSetting("failedLoginLimit", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-foreground-secondary font-semibold block">Client IP Whitelists (Comma Separated)</label>
                        <textarea
                          rows={2}
                          value={settings.ipWhitelist}
                          onChange={(e) => updateSetting("ipWhitelist", e.target.value)}
                          className="w-full p-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary font-mono text-xs resize-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Database Encryption Vault Status</label>
                        <div className="h-10 border border-border/80 px-3.5 bg-surface-elevated/40 rounded-xs flex items-center font-mono text-foreground font-semibold">
                          {settings.encryptionStatus}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Security key rollover expiry (Minutes)</label>
                        <input
                          type="number"
                          value={settings.sessionExpiryDuration}
                          onChange={(e) => updateSetting("sessionExpiryDuration", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                    </div>
                  )}

                  {/* ORGANIZATIONS */}
                  {sec.id === "orgs" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">Default Organization Quota Limit</label>
                        <input
                          type="number"
                          value={settings.defaultOrgQuota}
                          onChange={(e) => updateSetting("defaultOrgQuota", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">Default Signup Role Assigned</label>
                        <input
                          value={settings.defaultOrgRole}
                          onChange={(e) => updateSetting("defaultOrgRole", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2 p-4 border border-border bg-surface-elevated/40 rounded-sm flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="block font-bold text-foreground">Require KYC / KYB Compliance Signoff</span>
                          <span className="block text-foreground-secondary text-[11px]">New organization merchant signups are routed to admin verification lists for approval.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.orgSignupApproval}
                          onChange={(e) => updateSetting("orgSignupApproval", e.target.checked)}
                          className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer h-4.5 w-4.5"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-foreground-secondary font-semibold block">Blocked Email Domains list</label>
                        <input
                          value={settings.blockedOrgDomains}
                          onChange={(e) => updateSetting("blockedOrgDomains", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary font-mono text-xs"
                        />
                      </div>

                    </div>
                  )}

                  {/* USERS */}
                  {sec.id === "users" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Max Users allowed per Organization</label>
                        <input
                          type="number"
                          value={settings.maxUsersPerOrg}
                          onChange={(e) => updateSetting("maxUsersPerOrg", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Session Concurrency Limit per profile</label>
                        <input
                          type="number"
                          value={settings.sessionConcurrencyLimit}
                          onChange={(e) => updateSetting("sessionConcurrencyLimit", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2 p-4 border border-border bg-surface-elevated/40 rounded-sm flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="block font-bold text-foreground">Require User Registration Approvals</span>
                          <span className="block text-foreground-secondary text-[11px]">Individual officer profiles invitations require active compliance signoff before activation.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.userSignupApproval}
                          onChange={(e) => updateSetting("userSignupApproval", e.target.checked)}
                          className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer h-4.5 w-4.5"
                        />
                      </div>

                    </div>
                  )}

                  {/* AI CONFIGURATION */}
                  {sec.id === "ai" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      <div className="space-y-2.5 p-4 border border-border bg-surface-elevated/45 rounded-sm sm:col-span-2">
                        <span className="block font-bold text-foreground mb-1 select-none">AI Confidence Score Thresholds</span>
                        
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="50"
                            max="99"
                            value={settings.aiConfidenceThreshold}
                            onChange={(e) => updateSetting("aiConfidenceThreshold", Number(e.target.value))}
                            className="flex-1 accent-primary cursor-pointer h-2 bg-border rounded-lg"
                          />
                          <span className="font-mono font-bold text-sm text-primary w-12 text-right">{settings.aiConfidenceThreshold}%</span>
                        </div>
                        <span className="block text-foreground-muted text-[10px]">Decisions scoring matching above this threshold will resolve into auto-underwrite approvals.</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">Prediction Pipeline Timeout (Seconds)</label>
                        <input
                          type="number"
                          value={settings.predictionTimeout}
                          onChange={(e) => updateSetting("predictionTimeout", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">AI Explainability matrices level</label>
                        <select
                          value={settings.explainabilityLevel}
                          onChange={(e) => updateSetting("explainabilityLevel", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="High (SHAP & LIME Matrices)">High (SHAP & LIME Matrices)</option>
                          <option value="Medium (Feature Importance)">Medium (Feature Importance)</option>
                          <option value="Low (Blackbox predictions)">Low (Blackbox predictions)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 p-4 border border-border bg-surface-elevated/40 rounded-sm sm:col-span-2 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="block font-bold text-foreground">Activate Automated Model Retraining</span>
                          <span className="block text-foreground-secondary text-[11px]">Enables retraining workflows automatically when model drift drops below 0.85 F1 thresholds.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.autoRetraining}
                          onChange={(e) => updateSetting("autoRetraining", e.target.checked)}
                          className="rounded-xs border-border text-primary focus:ring-0 cursor-pointer h-4.5 w-4.5"
                        />
                      </div>

                      {/* Risk thresholds sliders */}
                      <div className="space-y-2.5 p-4 border border-border bg-surface-elevated/35 rounded-sm sm:col-span-2">
                        <span className="block font-bold text-foreground select-none">Risk Segment Limits Configuration</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono mt-2">
                          <div className="space-y-1.5">
                            <span className="text-foreground-secondary font-semibold">Credit Risk limit: {settings.riskThreshold}%</span>
                            <input
                              type="range"
                              min="10"
                              max="90"
                              value={settings.riskThreshold}
                              onChange={(e) => updateSetting("riskThreshold", Number(e.target.value))}
                              className="w-full accent-primary cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-foreground-secondary font-semibold">Fraud Risk limit: {settings.fraudThreshold}%</span>
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={settings.fraudThreshold}
                              onChange={(e) => updateSetting("fraudThreshold", Number(e.target.value))}
                              className="w-full accent-primary cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-foreground-secondary font-semibold">Financial health baseline: {settings.financialHealthThreshold}%</span>
                            <input
                              type="range"
                              min="40"
                              max="90"
                              value={settings.financialHealthThreshold}
                              onChange={(e) => updateSetting("financialHealthThreshold", Number(e.target.value))}
                              className="w-full accent-primary cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* NOTIFICATION SETTINGS */}
                  {sec.id === "notifications" && (
                    <div className="space-y-4">
                      
                      <div className="p-4 border border-border bg-surface-elevated/45 rounded-sm space-y-3.5">
                        <span className="block font-bold text-foreground select-none">Active Alert Delivery Toggles</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-foreground-secondary">
                          <div className="flex items-center justify-between">
                            <span>In-App Dashboard Alerts</span>
                            <input
                              type="checkbox"
                              checked={settings.pushAlerts}
                              onChange={(e) => updateSetting("pushAlerts", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Transactional Email Dispatch</span>
                            <input
                              type="checkbox"
                              checked={settings.emailAlerts}
                              onChange={(e) => updateSetting("emailAlerts", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Twilio SMS Alerts Integration</span>
                            <input
                              type="checkbox"
                              checked={settings.smsAlerts}
                              onChange={(e) => updateSetting("smsAlerts", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Generic Webhooks Payload Delivery</span>
                            <input
                              type="checkbox"
                              checked={settings.webhookAlerts}
                              onChange={(e) => updateSetting("webhookAlerts", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* EMAIL SETTINGS */}
                  {sec.id === "email" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1.5 sm:col-span-2 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">SMTP Host Address</label>
                        <input
                          value={settings.smtpHost}
                          onChange={(e) => updateSetting("smtpHost", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">SMTP Port</label>
                        <input
                          type="number"
                          value={settings.smtpPort}
                          onChange={(e) => updateSetting("smtpPort", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Sender Profile Display Name</label>
                        <input
                          value={settings.senderName}
                          onChange={(e) => updateSetting("senderName", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Sender Email Address</label>
                        <input
                          type="email"
                          value={settings.senderEmail}
                          onChange={(e) => updateSetting("senderEmail", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3 flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTestSMTP}
                          className="h-10 px-4 focus-visible:outline-2"
                        >
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-foreground-secondary" />
                          <span>Send Test Email</span>
                        </Button>
                      </div>

                    </div>
                  )}

                  {/* API SETTINGS */}
                  {sec.id === "api" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 sm:col-span-2 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">Gateway API Base Endpoint URL</label>
                        <input
                          value={settings.apiBaseUrl}
                          onChange={(e) => updateSetting("apiBaseUrl", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">Active API keys registered</label>
                        <div className="h-10 border border-border/80 px-3.5 bg-surface-elevated/40 rounded-xs flex items-center font-mono text-foreground font-semibold select-none">
                          {settings.apiKeyCount} Keys Enabled
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">Webhook secret key hash</label>
                        <div className="relative">
                          <input
                            type={showWebhookSecret ? "text" : "password"}
                            value={settings.webhookSecret}
                            readOnly
                            className="w-full h-10 pl-3 pr-10 bg-surface-elevated/40 border border-border text-foreground rounded-xs font-mono outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWebhookSecret(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground outline-none cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">Max API Rate limits (Req/Min/Key)</label>
                        <input
                          type="number"
                          value={settings.apiRateLimit}
                          onChange={(e) => updateSetting("apiRateLimit", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">JWT Access tokens validity (Minutes)</label>
                        <input
                          type="number"
                          value={settings.jwtExpiry}
                          onChange={(e) => updateSetting("jwtExpiry", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none font-mono"
                        />
                      </div>

                    </div>
                  )}

                  {/* STORAGE */}
                  {sec.id === "storage" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block select-none">AWS Storage capacity used</label>
                        <div className="h-10 border border-border/80 px-3.5 bg-surface-elevated/40 rounded-xs flex items-center font-mono text-foreground font-semibold select-none">
                          {settings.storageUsed} / {settings.storageLimit}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block select-none">S3 Glacier Archival Vault Path</label>
                        <input
                          value={settings.backupLocation}
                          onChange={(e) => updateSetting("backupLocation", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block select-none">Max upload file size limit (MB)</label>
                        <input
                          type="number"
                          value={settings.fileSizeLimit}
                          onChange={(e) => updateSetting("fileSizeLimit", Number(e.target.value))}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block select-none">Allowed attachments extension types</label>
                        <input
                          value={settings.allowedFileTypes}
                          onChange={(e) => updateSetting("allowedFileTypes", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none font-mono"
                        />
                      </div>

                    </div>
                  )}

                  {/* BACKUP & RECOVERY */}
                  {sec.id === "backup" && (
                    <div className="space-y-5">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="space-y-1.5 text-xs text-foreground-secondary">
                          <label className="text-[10px] uppercase font-bold text-foreground-muted block">Database automated backup frequency</label>
                          <input
                            value={settings.backupFrequency}
                            onChange={(e) => updateSetting("backupFrequency", e.target.value)}
                            className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                          />
                        </div>

                        <div className="space-y-1.5 text-xs text-foreground-secondary">
                          <label className="text-[10px] uppercase font-bold text-foreground-muted block font-mono">Cold Storage snapshots retention policy</label>
                          <input
                            value={settings.backupRetentionPolicy}
                            onChange={(e) => updateSetting("backupRetentionPolicy", e.target.value)}
                            className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs focus:border-primary outline-none"
                          />
                        </div>

                      </div>

                      <div className="flex justify-between items-center select-none pt-2 border-b border-border/40 pb-2">
                        <span className="font-bold text-foreground">Database backup recovery points</span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleCreateBackup}
                          className="bg-primary text-white h-9 px-4 font-semibold focus-visible:outline-2"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          <span>Generate Backup Snapshot</span>
                        </Button>
                      </div>

                      {/* Backups list table */}
                      <div className="overflow-x-auto border border-border rounded-sm">
                        <table className="w-full text-left border-collapse text-[11px] font-mono">
                          <thead>
                            <tr className="border-b border-border bg-surface-elevated text-foreground-secondary font-bold text-[9px] uppercase tracking-wider font-sans select-none">
                              <th className="p-2.5 pl-4">Filename</th>
                              <th className="p-2.5">Snapshot Size</th>
                              <th className="p-2.5">Created Date</th>
                              <th className="p-2.5">Status</th>
                              <th className="p-2.5 pr-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 text-foreground-secondary">
                            {backups.map((bk) => (
                              <tr key={bk.id} className="hover:bg-surface-elevated/40 transition-colors">
                                <td className="p-2.5 pl-4 font-semibold text-foreground truncate max-w-[200px]" title={bk.filename}>{bk.filename}</td>
                                <td className="p-2.5">{bk.size}</td>
                                <td className="p-2.5 font-sans">{bk.timestamp}</td>
                                <td className="p-2.5">
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded-xs text-[8px] font-bold font-sans",
                                    bk.status === "Success" ? "text-positive bg-positive/10" : "text-critical bg-critical/10"
                                  )}>
                                    {bk.status}
                                  </span>
                                </td>
                                <td className="p-2.5 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  {bk.status === "Success" ? (
                                    <button
                                      onClick={() => handleRestoreBackup(bk.filename)}
                                      className="text-xs text-primary font-bold hover:underline outline-none cursor-pointer"
                                      aria-label={`Restore backup ${bk.filename}`}
                                    >
                                      Restore
                                    </button>
                                  ) : (
                                    <span className="text-foreground-muted">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

                  {/* LOG RETENTION */}
                  {sec.id === "logs" && (
                    <div className="space-y-5">
                      
                      <div className="p-4 border border-border bg-surface-elevated/45 rounded-sm space-y-4">
                        <span className="block font-bold text-foreground mb-1 select-none">Log Expiry thresholds (Days)</span>
                        
                        {[
                          { label: "RBI Securities Compliance Audit Logs", key: "auditLogsRetention" as const },
                          { label: "Microservices Application Errors Logs", key: "appLogsRetention" as const },
                          { label: "Canary AI Prediction Trails Logs", key: "predictionLogsRetention" as const },
                          { label: "Notification Channels Gateway Logs", key: "notificationLogsRetention" as const },
                          { label: "Docker Systems Diagnostic Logs", key: "systemLogsRetention" as const }
                        ].map((log) => (
                          <div key={log.key} className="space-y-1.5">
                            <div className="flex justify-between font-medium">
                              <span className="text-foreground-secondary">{log.label}</span>
                              <span className="font-mono text-primary font-bold">{settings[log.key]} Days</span>
                            </div>
                            <input
                              type="range"
                              min="14"
                              max="730"
                              value={settings[log.key]}
                              onChange={(e) => updateSetting(log.key, Number(e.target.value))}
                              className="w-full accent-primary cursor-pointer h-1.5 bg-border rounded-lg"
                            />
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* INTEGRATIONS */}
                  {sec.id === "integrations" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                      {integrations.map((card) => (
                        <Card key={card.id} className="bg-surface border border-border p-4.5 flex flex-col justify-between gap-4 shadow-xs">
                          <div className="flex items-center justify-between select-none">
                            <span className="font-bold text-foreground truncate">{card.name}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-xs text-[8px] font-bold border",
                              card.status === "Connected" ? "text-positive bg-positive/10 border-positive/20" : card.status === "Pending" ? "text-warning bg-warning/10 border-warning/20" : "text-foreground-secondary bg-surface-elevated border-border"
                            )}>
                              {card.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-foreground-secondary leading-relaxed h-10 overflow-hidden">
                            {card.description}
                          </p>
                          <div className="flex justify-end pt-1 border-t border-border/40 select-none">
                            <button
                              onClick={() => handleToggleIntegration(card.id, card.status)}
                              className={cn(
                                "text-[10px] font-bold uppercase transition-colors outline-none cursor-pointer",
                                card.status === "Connected" ? "text-critical hover:underline" : "text-primary hover:underline"
                              )}
                            >
                              {card.status === "Connected" ? "Disconnect" : "Connect"}
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* LOCALIZATION */}
                  {sec.id === "localization" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Default Display Language</label>
                        <select
                          value={settings.language}
                          onChange={(e) => updateSetting("language", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="en-US">English (United States)</option>
                          <option value="hi-IN">Hindi (हिन्दी)</option>
                          <option value="es-ES">Spanish (Español)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-xs text-foreground-secondary">
                        <label className="text-[10px] uppercase font-bold text-foreground-muted block">Preferred Country Standard</label>
                        <select
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="IN">India (GMT+5:30)</option>
                          <option value="US">United States (EST/PST)</option>
                          <option value="GB">United Kingdom (GMT)</option>
                        </select>
                      </div>

                    </div>
                  )}

                  {/* MAINTENANCE MODE */}
                  {sec.id === "maintenance" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 p-4 border border-border bg-surface-elevated/45 rounded-sm sm:col-span-2 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="block font-bold text-foreground">Lock platform (Maintenance Mode)</span>
                          <span className="block text-foreground-secondary text-[11px]">Lock down the retail/commercial portals routes for estimated completion updates. Only authorized IPs can sign in.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.maintenanceEnabled}
                          onChange={(e) => updateSetting("maintenanceEnabled", e.target.checked)}
                          className="rounded-xs border-border text-primary cursor-pointer h-4.5 w-4.5"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-foreground-secondary font-semibold block">Maintenance message displayed to customers</label>
                        <textarea
                          rows={2}
                          value={settings.maintenanceMessage}
                          onChange={(e) => updateSetting("maintenanceMessage", e.target.value)}
                          className="w-full p-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary text-xs resize-none"
                          aria-label="Maintenance Message"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-foreground-secondary font-semibold block">Allowed Maintenance Users Whitelist</label>
                        <input
                          value={settings.allowedMaintenanceUsers}
                          onChange={(e) => updateSetting("allowedMaintenanceUsers", e.target.value)}
                          className="w-full h-10 px-3 bg-surface-elevated border border-border text-foreground rounded-xs outline-none focus:border-primary font-mono text-xs"
                          aria-label="Allowed Maintenance Users"
                        />
                      </div>

                    </div>
                  )}

                  {/* ADVANCED */}
                  {sec.id === "advanced" && (
                    <div className="space-y-5">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="space-y-3.5 p-4 border border-border bg-surface-elevated/40 rounded-sm">
                          <span className="block font-bold text-foreground mb-1 select-none">Developer Modes</span>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary font-medium">Platform Debug Logs Engine</span>
                            <input
                              type="checkbox"
                              checked={settings.debugLogsEnabled}
                              onChange={(e) => updateSetting("debugLogsEnabled", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary font-medium">Gateway Performance Mode</span>
                            <input
                              type="checkbox"
                              checked={settings.performanceModeEnabled}
                              onChange={(e) => updateSetting("performanceModeEnabled", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary font-medium">Developer console keys</span>
                            <input
                              type="checkbox"
                              checked={settings.devModeEnabled}
                              onChange={(e) => updateSetting("devModeEnabled", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>
                        </div>

                        <div className="space-y-3.5 p-4 border border-border bg-surface-elevated/40 rounded-sm">
                          <span className="block font-bold text-foreground mb-1 select-none">AI Feature Flags</span>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary font-medium">SME Underwriting matrices flow</span>
                            <input
                              type="checkbox"
                              checked={settings.featureFlagSmeUnderwrite}
                              onChange={(e) => updateSetting("featureFlagSmeUnderwrite", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary font-medium">Explainable AI analytics graphs</span>
                            <input
                              type="checkbox"
                              checked={settings.featureFlagEaiGraphs}
                              onChange={(e) => updateSetting("featureFlagEaiGraphs", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-foreground-secondary font-medium">Canary prerender limits checks</span>
                            <input
                              type="checkbox"
                              checked={settings.experimentalTurboPrerender}
                              onChange={(e) => updateSetting("experimentalTurboPrerender", e.target.checked)}
                              className="rounded-xs border-border text-primary cursor-pointer h-4 w-4"
                            />
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* 3. Save Changes Confirmation Modal Dialog */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Review & Confirm Settings Changes"
        className="max-w-md select-none font-sans"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 p-3.5 bg-warning/10 border border-warning/30 rounded-sm">
            <AlertTriangle className="h-4.5 w-4.5 text-warning shrink-0 mt-0.5" />
            <div className="text-xs text-foreground-secondary leading-normal">
              Review carefully. Saving these configurations updates the active platform parameters in real-time. System caches will clear.
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground block">Modified Settings ({changedSettings.length})</span>
            <div className="max-h-[180px] overflow-y-auto border border-border rounded-sm divide-y divide-border/60 text-xs pr-1">
              {changedSettings.map((ch) => (
                <div key={ch.field} className="p-3 flex flex-col gap-1 hover:bg-surface-elevated/40 transition-colors">
                  <span className="font-bold text-foreground leading-none">{ch.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-1 text-[10px] font-mono leading-none">
                    <span className="text-foreground-muted line-through truncate max-w-[160px]">{String(ch.oldVal)}</span>
                    <ArrowRight className="h-3 w-3 text-foreground-muted" />
                    <span className="text-emerald-500 font-bold truncate max-w-[160px]">{String(ch.newVal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/40 pt-4 flex justify-end gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveModalOpen(false)}
              className="h-9 px-4 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveChangesConfirm}
              className="h-9 px-4 text-xs bg-primary text-white"
            >
              Confirm & Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Import Configurations JSON Modal Dialog */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Custom Platform Configurations"
        className="max-w-md select-none font-sans"
      >
        <div className="space-y-4">
          <p className="text-xs text-foreground-secondary leading-normal">
            Paste valid settings JSON syntax block below to overwrite platform configurations variables. Click import, then verify changes.
          </p>

          <textarea
            rows={8}
            placeholder='e.g. { "platformName": "ArthDrishti Enterprise" }'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full p-3 border border-border bg-surface-elevated text-foreground font-mono text-[10px] rounded-sm focus:border-primary outline-none resize-none"
            aria-label="Paste settings JSON configurations"
          />

          <div className="border-t border-border/40 pt-4 flex justify-end gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportText("");
              }}
              className="h-9 px-4 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleImportConfig}
              className="h-9 px-4 text-xs bg-primary text-white"
            >
              Import JSON
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
