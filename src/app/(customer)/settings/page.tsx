"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  User,
  Shield,
  Database,
  Bell,
  Monitor,
  Key,
  CheckCircle2,
  AlertTriangle,
  Laptop
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ============================================================================
// DATA SOURCES INTERFACE
// ============================================================================
interface DataSource {
  id: string;
  name: string;
  type: string;
  status: "Synced" | "Delayed" | "Disconnected";
  lastSync: string;
}

const INITIAL_SOURCES: DataSource[] = [
  { id: "ds1", name: "ICICI Business checking account", type: "Bank Ledger", status: "Synced", lastSync: "10 mins ago" },
  { id: "ds2", name: "HDFC Platinum credit card", type: "Credit Statement", status: "Delayed", lastSync: "Yesterday" },
  { id: "ds3", name: "Razorpay Merchant gateway", type: "API Feed", status: "Synced", lastSync: "1 hour ago" }
];

export default function CustomerSettingsPage() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "data" | "notifications" | "appearance" | "api">("profile");

  // Profile forms baseline
  const BASELINE_PROFILE = useMemo(() => ({
    name: "Rahul Chahar",
    email: "rahul.chahar@corporation.com",
    organization: "ArthDrishti Labs",
    avatar: "RC"
  }), []);

  // Profile form local state
  const [profile, setProfile] = useState(BASELINE_PROFILE);

  // Security Password local state
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Active sessions mock list
  const [sessions, setSessions] = useState([
    { id: "s1", device: "Chrome 126 (Windows 11)", location: "Mumbai, MH", ip: "192.168.1.45", current: true },
    { id: "s2", device: "Firefox Mobile (Android 14)", location: "New Delhi, DL", ip: "103.45.12.89", current: false }
  ]);

  // Connected data sources state
  const [sources, setSources] = useState<DataSource[]>(INITIAL_SOURCES);

  // Notifications toggles state
  const [notifConfig, setNotifConfig] = useState({
    fraud: true,
    risk: true,
    forecast: true,
    reports: false,
    recommendations: true,
    updates: false
  });

  // Appearance toggles state
  const [appearance, setAppearance] = useState({
    theme: "system",
    reducedMotion: false,
    compactDensity: false
  });

  // API access tokens mock list
  const [apiTokens, setApiTokens] = useState<string[]>([]);

  // Check if profile form is changed from baseline
  const isProfileChanged = useMemo(() => {
    return JSON.stringify(profile) !== JSON.stringify(BASELINE_PROFILE);
  }, [profile, BASELINE_PROFILE]);

  // Check if password form is changed from empty baseline
  const isPasswordChanged = useMemo(() => {
    return password.current !== "" || password.new !== "" || password.confirm !== "";
  }, [password]);

  // Check if notifications settings are changed
  const [baselineNotifConfig] = useState({ ...notifConfig });
  const isNotifChanged = useMemo(() => {
    return JSON.stringify(notifConfig) !== JSON.stringify(baselineNotifConfig);
  }, [notifConfig, baselineNotifConfig]);

  // Check if appearance settings are changed
  const [baselineAppearance] = useState({ ...appearance });
  const isAppearanceChanged = useMemo(() => {
    return JSON.stringify(appearance) !== JSON.stringify(baselineAppearance);
  }, [appearance, baselineAppearance]);

  // Overall unsaved changes tracking
  const hasUnsavedChanges = useMemo(() => {
    return isProfileChanged || isPasswordChanged || isNotifChanged || isAppearanceChanged;
  }, [isProfileChanged, isPasswordChanged, isNotifChanged, isAppearanceChanged]);

  // Save actions
  const handleSaveChanges = useCallback(() => {
    toast.success("Settings parameters updated successfully!");
    // Set baseline checks to current state by resetting the diff indicators
    setPassword({ current: "", new: "", confirm: "" });
  }, []);

  // Discard changes
  const handleDiscardChanges = useCallback(() => {
    setProfile(BASELINE_PROFILE);
    setPassword({ current: "", new: "", confirm: "" });
    setNotifConfig(baselineNotifConfig);
    setAppearance(baselineAppearance);
    toast.info("Unsaved modifications discarded.");
  }, [BASELINE_PROFILE, baselineNotifConfig, baselineAppearance]);

  // Security actions
  const handleSignOutOthers = useCallback(() => {
    setSessions((prev) => prev.filter((s) => s.current));
    toast.success("Successfully logged out from all other active device sessions.");
  }, []);

  // Data source actions
  const handleReconnectSource = useCallback((id: string, name: string) => {
    toast.info(`Attempting sync handshake with "${name}"...`);
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "Synced", lastSync: "Just Now" } : s))
      );
      toast.success(`Successfully connected: "${name}"`);
    }, 600);
  }, []);

  const handleRemoveSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    toast.success("Disconnected data ledger source.");
  }, []);

  // API Token generators
  const handleGenerateToken = useCallback(() => {
    const token = `arth_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    setApiTokens((prev) => [...prev, token]);
    toast.success("API Integration token generated.");
  }, []);

  return (
    <PageContainer className="pb-28">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-border/60 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <User className="h-6.5 w-6.5 text-primary" /> ACCOUNT SETTINGS
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Manage your personal credentials, active telemetry directories, notifications targets, and layout variables.
          </p>
        </div>
      </div>

      {/* CORE WORKSPACE SETTINGS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* LEFT COLUMN: TABS NAVIGATION (DESKTOP - 3 COLS) */}
        <div className="lg:col-span-3 space-y-1.5 select-none bg-surface border border-border/80 rounded-sm p-4 h-fit">
          {[
            { id: "profile" as const, label: "User Profile", icon: User },
            { id: "security" as const, label: "Security & Access", icon: Shield },
            { id: "data" as const, label: "Connected Data", icon: Database },
            { id: "notifications" as const, label: "Notification Alert Rules", icon: Bell },
            { id: "appearance" as const, label: "Dashboard Appearance", icon: Monitor },
            { id: "api" as const, label: "API Integrations", icon: Key }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-xs transition-colors flex items-center gap-2.5 text-xs font-semibold cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated/45"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: ACTIVE TAB WORKSPACE (9 COLS) */}
        <div className="lg:col-span-9">
          <Card className="border border-border/80 bg-surface p-6 md:p-8 select-none min-h-[420px]">
            
            {/* 1. PROFILE SECTION PANEL */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">User Profile Parameters</h3>
                  <p className="text-[10.5px] text-foreground-secondary mt-0.5">Edit credentials associated with your ArthDrishti model audits.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-bold"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-bold"
                    />
                  </div>

                  {/* Organization field */}
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider">Organization / Firm</label>
                    <input
                      type="text"
                      value={profile.organization}
                      onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-bold"
                    />
                  </div>

                  {/* Organization field readonly */}
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider block">Profile Avatar</label>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/25 rounded-full flex items-center justify-center font-extrabold text-sm">
                        {profile.avatar}
                      </div>
                      <span className="text-[10.5px] text-foreground-secondary">RC Client Key Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SECURITY SECTION PANEL */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Security & Access Controls</h3>
                  <p className="text-[10.5px] text-foreground-secondary mt-0.5">Manage authentication passwords, device sessions, and protection layers.</p>
                </div>

                {/* Password form */}
                <div className="space-y-4 max-w-md">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block">Change Account Password</span>
                  <div className="grid grid-cols-1 gap-4.5 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password.current}
                        onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        placeholder="New password (min 8 chars)"
                        value={password.new}
                        onChange={(e) => setPassword((p) => ({ ...p, new: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Verify new password"
                        value={password.confirm}
                        onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Sessions list */}
                <div className="space-y-3.5 pt-4 border-t border-border/40">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block">
                      Active device sessions
                    </span>
                    {sessions.length > 1 && (
                      <button
                        onClick={handleSignOutOthers}
                        className="text-[9.5px] font-sans font-bold hover:underline uppercase text-critical cursor-pointer"
                      >
                        Sign Out Other Sessions
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="bg-surface-elevated/45 border border-border p-3 rounded-xs flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Laptop className="h-4.5 w-4.5 text-foreground-secondary shrink-0" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              {sess.device}
                              {sess.current && (
                                <span className="text-[8px] bg-positive/10 text-positive px-1.5 py-0.25 rounded-xs border border-positive/15 font-sans font-bold uppercase">
                                  Current
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] text-foreground-muted block">{sess.location} • IP: {sess.ip}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. CONNECTED DATA SECTION PANEL */}
            {activeTab === "data" && (
              <div className="space-y-6">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Connected Data Ledger Feeds</h3>
                  <p className="text-[10.5px] text-foreground-secondary mt-0.5">Synchronize and disconnect active bank APIs and merchant gateway feeds.</p>
                </div>

                {sources.length === 0 ? (
                  <div className="text-center border border-border border-dashed p-8 rounded-sm bg-surface">
                    <Database className="h-10 w-10 text-foreground-muted mx-auto mb-2" />
                    <h3 className="text-xs font-bold text-foreground">No active data feeds</h3>
                    <p className="text-[10px] text-foreground-secondary mt-1">Upload a statements ledger or hook banking APIs to feed metrics.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 text-xs">
                    {sources.map((src) => (
                      <div
                        key={src.id}
                        className="bg-surface-elevated/35 border border-border p-4 rounded-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-sans font-bold text-foreground-muted uppercase tracking-wider block">
                            {src.type}
                          </span>
                          <h4 className="font-bold text-foreground">
                            {src.name}
                          </h4>
                          <span className="text-[9.5px] font-mono text-foreground-muted block">
                            Last synced: {src.lastSync}
                          </span>
                        </div>

                        <div className="flex gap-2.5 items-center">
                          <span className={cn(
                            "text-[8px] font-sans font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider border",
                            src.status === "Synced"
                              ? "text-positive bg-positive/10 border-positive/15"
                              : "text-warning bg-warning/10 border-warning/15"
                          )}>
                            {src.status}
                          </span>

                          <Button
                            variant="outline"
                            onClick={() => handleReconnectSource(src.id, src.name)}
                            size="sm"
                            className="text-[9.5px] uppercase font-sans font-bold py-1.5 px-3 border-border/80 cursor-pointer"
                          >
                            Sync Handshake
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRemoveSource(src.id)}
                            size="sm"
                            className="text-[9.5px] uppercase font-sans font-bold py-1.5 px-3 hover:bg-critical/5 hover:text-critical border-border/80 cursor-pointer"
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. NOTIFICATIONS RULES PANEL */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Alert Notification Settings</h3>
                  <p className="text-[10.5px] text-foreground-secondary mt-0.5">Toggle alert channels and priority rules for real-time evaluations.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: "fraud" as const, label: "Real-time Fraud Alerts", desc: "Trigger immediate notifications on suspicious checkout swiping coordinates." },
                    { key: "risk" as const, label: "Credit Risk score Shifts", desc: "Flag updates when default probability percentages shift." },
                    { key: "forecast" as const, label: "Forecast warnings", desc: "Warn when cash flow buffers dip below safety buffers." },
                    { key: "reports" as const, label: "Intelligence Reports", desc: "Notify when monthly audits and deep-dive summaries compile." },
                    { key: "recommendations" as const, label: "Optimization Recommendations", desc: "Trigger recommendations when optimization opportunities are calculated." },
                    { key: "updates" as const, label: "Product & model updates", desc: "Receive notifications about banking model changes." }
                  ].map((rule) => (
                    <div
                      key={rule.key}
                      onClick={() => setNotifConfig((prev) => ({ ...prev, [rule.key]: !prev[rule.key] }))}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xs border transition-all cursor-pointer",
                        notifConfig[rule.key]
                          ? "bg-primary/5 border-primary/25"
                          : "bg-surface-elevated/35 border-border hover:bg-surface-elevated"
                      )}
                    >
                      <button
                        type="button"
                        className={cn(
                          "h-5 w-5 rounded-xs border flex items-center justify-center shrink-0 transition-all mt-0.5 cursor-pointer",
                          notifConfig[rule.key]
                            ? "bg-primary border-primary text-white"
                            : "border-border bg-surface"
                        )}
                      >
                        {notifConfig[rule.key] && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                      </button>

                      <div className="space-y-0.5 text-xs">
                        <span className="font-bold text-foreground block">{rule.label}</span>
                        <p className="text-foreground-secondary leading-relaxed font-sans">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. APPEARANCE SETTINGS PANEL */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Appearance & Render Settings</h3>
                  <p className="text-[10.5px] text-foreground-secondary mt-0.5">Toggle themes, animations rendering density and data layout scales.</p>
                </div>

                <div className="space-y-5 text-xs font-sans">
                  
                  {/* Theme toggles */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Theme Mode</label>
                    <div className="flex gap-3">
                      {["light", "dark", "system"].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setAppearance((a) => ({ ...a, theme }))}
                          className={cn(
                            "px-4 py-2 border rounded-sm text-xs font-bold uppercase transition-all cursor-pointer",
                            appearance.theme === theme
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border bg-surface text-foreground-secondary hover:bg-surface-elevated"
                          )}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reduced motion toggle */}
                  <div
                    onClick={() => setAppearance((a) => ({ ...a, reducedMotion: !a.reducedMotion }))}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xs border transition-all cursor-pointer",
                      appearance.reducedMotion ? "bg-primary/5 border-primary/25" : "bg-surface-elevated/35 border-border hover:bg-surface-elevated"
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "h-5 w-5 rounded-xs border flex items-center justify-center shrink-0 transition-all mt-0.5 cursor-pointer",
                        appearance.reducedMotion ? "bg-primary border-primary text-white" : "border-border bg-surface"
                      )}
                    >
                      {appearance.reducedMotion && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-foreground block">Reduced Motion rendering</span>
                      <p className="text-foreground-secondary leading-relaxed">
                        Disable intensive transitions and dashboard animations to save battery on low-performance devices.
                      </p>
                    </div>
                  </div>

                  {/* Compact density toggle */}
                  <div
                    onClick={() => setAppearance((a) => ({ ...a, compactDensity: !a.compactDensity }))}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xs border transition-all cursor-pointer",
                      appearance.compactDensity ? "bg-primary/5 border-primary/25" : "bg-surface-elevated/35 border-border hover:bg-surface-elevated"
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "h-5 w-5 rounded-xs border flex items-center justify-center shrink-0 transition-all mt-0.5 cursor-pointer",
                        appearance.compactDensity ? "bg-primary border-primary text-white" : "border-border bg-surface"
                      )}
                    >
                      {appearance.compactDensity && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-foreground block">Compact Data Density grid layout</span>
                      <p className="text-foreground-secondary leading-relaxed">
                        Reduces margins padding and table spacing layout heights to fit more analytical telemetry on one screen viewport.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 6. API ACCESS TOKENS PANEL */}
            {activeTab === "api" && (
              <div className="space-y-6">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Developer API Access</h3>
                  <p className="text-[10.5px] text-foreground-secondary mt-0.5">Generate access keys to feed diagnostic metrics models directly into your custom pipelines.</p>
                </div>

                <div className="space-y-5 text-xs font-sans">
                  
                  <div className="bg-primary/5 border border-primary/20 p-4.5 rounded-sm space-y-2 max-w-xl">
                    <span className="text-[10px] font-bold text-foreground block uppercase tracking-wide">Developer Sandbox Credentials</span>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      API access tokens are held in mock development states. Live connections require enterprise registration clearance.
                    </p>
                  </div>

                  <Button
                    onClick={handleGenerateToken}
                    size="sm"
                    className="text-[10px] uppercase font-sans font-bold gap-1.5 cursor-pointer"
                  >
                    <Key className="h-4 w-4" /> Generate New API Token
                  </Button>

                  {apiTokens.length > 0 && (
                    <div className="space-y-2.5 max-w-xl">
                      <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block">Active Sandbox Keys</span>
                      {apiTokens.map((tok, idx) => (
                        <div
                          key={idx}
                          className="bg-surface-elevated/45 border border-border p-3.5 rounded-xs flex justify-between items-center text-xs font-mono select-all"
                        >
                          <span className="text-foreground font-bold truncate max-w-[320px]">{tok}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(tok);
                              toast.success("Copied API token key to clipboard.");
                            }}
                            className="text-[9.5px] font-sans font-bold hover:underline uppercase text-primary cursor-pointer select-none"
                          >
                            Copy key
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}

          </Card>
        </div>

      </div>

      {/* STICKY UNSAVED CHANGES WARNING BAR */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-6 right-6 lg:left-80 z-40 bg-surface border border-primary/30 p-4 rounded-sm shadow-xl flex items-center justify-between select-none animate-slide-up max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
            <div className="space-y-0.5 text-xs">
              <span className="font-extrabold text-foreground block">You have unsaved changes!</span>
              <p className="text-foreground-secondary font-sans">Settings adjustments will be discarded if you navigate away.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
              className="text-[9.5px] uppercase font-sans font-bold py-2 px-3 border-border/80 hover:bg-surface-elevated cursor-pointer"
            >
              Discard Changes
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              className="text-[9.5px] uppercase font-sans font-bold py-2 px-3.5 cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}

    </PageContainer>
  );
}
