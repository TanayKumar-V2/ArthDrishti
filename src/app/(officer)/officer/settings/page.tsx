"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  User,
  Shield,
  Bell,
  Palette,
  Lock,
  Monitor,
  Smartphone,
  Key,
  Download,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Globe,
  Clock,
  Calendar,
  Sparkles,
  Upload,
  X,
  ChevronRight,
  ShieldAlert,
  Save,
  Laptop
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { MOCK_SESSIONS, DEFAULT_PREFERENCES, ActiveSession } from "@/lib/notifications_data";

// Profile data structure
interface OfficerProfile {
  fullName: string;
  employeeId: string;
  department: string;
  branch: string;
  designation: string;
  email: string;
  phone: string;
  officeAddress: string;
  joiningDate: string;
  manager: string;
  photoUrl: string;
}

export default function OfficerSettingsPage() {
  const { theme, setTheme } = useTheme();

  // Active section tab
  const [activeSection, setActiveSection] = useState<
    "profile" | "security" | "notifications" | "appearance" | "privacy" | "sessions"
  >("profile");

  // Profile States
  const [profile, setProfile] = useState<OfficerProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("officer-profile");
      if (saved) return JSON.parse(saved);
    }
    return {
      fullName: "Officer Rahul",
      employeeId: "EMP-2026-9812",
      department: "Risk Management & Underwriting",
      branch: "Corporate Head Office, Delhi",
      designation: "Senior Credit Underwriter",
      email: "rahul.chahar@arthdrishti.in",
      phone: "+91 98765 43210",
      officeAddress: "7th Floor, Block C, Financial District, Delhi, 110001",
      joiningDate: "12th March 2023",
      manager: "Siddharth Mehta (VP Risk Operations)",
      photoUrl: "" // Empty represents the initial default avatar "RO"
    };
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<OfficerProfile>({ ...profile });

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [recoveryEmail, setRecoveryEmail] = useState("r****.c*****@recovery.com");
  const [recoveryPhone, setRecoveryPhone] = useState("+91 ••••• ••210");
  const [securityQuestion, setSecurityQuestion] = useState("first-pet");
  const [securityAnswer, setSecurityAnswer] = useState("••••••••");
  
  // Sessions State
  const [sessions, setSessions] = useState<ActiveSession[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("officer-sessions");
      if (saved) return JSON.parse(saved);
    }
    return MOCK_SESSIONS;
  });

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("officer-notif-prefs");
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_PREFERENCES;
  });

  // Appearance States
  const [appearance, setAppearance] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("officer-appearance");
      if (saved) return JSON.parse(saved);
    }
    return {
      language: "en-US",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "12h",
      timezone: "GMT+5:30",
      density: "comfortable",
      sidebarStyle: "expanded",
      animation: "enabled"
    };
  });

  // Password Validation Logic
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: "None", color: "bg-border" };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score, label: "Weak", color: "bg-critical" };
    if (score <= 3) return { score, label: "Medium", color: "bg-warning" };
    return { score, label: "Strong", color: "bg-positive" };
  };

  const passwordStrength = getPasswordStrength();

  // Sync to LocalStorage
  const saveProfile = (newProfile: OfficerProfile) => {
    setProfile(newProfile);
    localStorage.setItem("officer-profile", JSON.stringify(newProfile));
    // Trigger custom event to reload header
    window.dispatchEvent(new Event("profile-updated"));
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(editForm);
    setIsEditingProfile(false);
    toast.success("Profile updated successfully.");
  };

  const handleProfileCancel = () => {
    setEditForm({ ...profile });
    setIsEditingProfile(false);
  };

  const handlePhotoUpload = () => {
    // Simulate image uploading
    const randomAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256"
    ];
    const chosen = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
    const updated = { ...profile, photoUrl: chosen };
    saveProfile(updated);
    setEditForm(updated);
    toast.success("Profile photo uploaded successfully.");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    toast.success("Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleTogglePreference = (key: keyof typeof DEFAULT_PREFERENCES, channel: "email" | "sms" | "push" | "desktop") => {
    const updated = {
      ...notifPrefs,
      [key]: {
        ...notifPrefs[key],
        [channel]: !notifPrefs[key][channel]
      }
    };
    setNotifPrefs(updated);
    localStorage.setItem("officer-notif-prefs", JSON.stringify(updated));
    toast.success("Notification preferences updated.");
  };

  const handleFrequencyChange = (key: keyof typeof DEFAULT_PREFERENCES, freq: "realtime" | "daily" | "weekly") => {
    const updated = {
      ...notifPrefs,
      [key]: {
        ...notifPrefs[key],
        frequency: freq
      }
    };
    setNotifPrefs(updated);
    localStorage.setItem("officer-notif-prefs", JSON.stringify(updated));
    toast.success("Notification digest frequency updated.");
  };

  const handleAppearanceChange = (key: string, value: string) => {
    const updated = { ...appearance, [key]: value };
    setAppearance(updated);
    localStorage.setItem("officer-appearance", JSON.stringify(updated));
    
    if (key === "theme") {
      setTheme(value);
    }
    toast.success(`Appearance ${key} changed to ${value}.`);
  };

  const handleLogoutDevice = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (!target) return;

    if (target.status.includes("Current")) {
      toast.error("Cannot terminate the active session from this device directly. Use Logout instead.");
      return;
    }

    const updated = sessions.map((s) => (s.id === id ? { ...s, status: "Expired" as const } : s));
    setSessions(updated);
    localStorage.setItem("officer-sessions", JSON.stringify(updated));
    toast.success(`Session on "${target.device}" has been terminated.`);
  };

  const handleLogoutAllDevices = () => {
    const updated = sessions.map((s) =>
      s.status.includes("Current") ? s : { ...s, status: "Expired" as const }
    );
    setSessions(updated);
    localStorage.setItem("officer-sessions", JSON.stringify(updated));
    toast.success("All other active sessions have been terminated.");
  };

  // Privacy simulated actions
  const handleDownloadData = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Compiling user audit profile and metadata logs...",
        success: () => {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, appearance, preferences: notifPrefs }, null, 2));
          const dlAnchorElem = document.createElement("a");
          dlAnchorElem.setAttribute("href", dataStr);
          dlAnchorElem.setAttribute("download", `arthdrishti_profile_${profile.employeeId}.json`);
          dlAnchorElem.click();
          return "Audit profile download started.";
        },
        error: "Compilation failed."
      }
    );
  };

  const handleClearCache = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Clearing local client cache files...",
        success: "Local cache directory successfully cleared. 24.8 MB freed.",
        error: "Failed to clear cache."
      }
    );
  };

  // Left Section items
  const sections = [
    { id: "profile", label: "Profile", icon: User, desc: "Manage your contact info, address, and profile photo." },
    { id: "security", label: "Security", icon: Shield, desc: "Change passwords, set recovery metrics, and toggle 2FA." },
    { id: "notifications", label: "Notification Preferences", icon: Bell, desc: "Toggle alert thresholds across channels." },
    { id: "appearance", label: "Appearance", icon: Palette, desc: "Set visual theme, language, and table density." },
    { id: "privacy", label: "Privacy & Data", icon: Key, desc: "Export records, clean logs, and manage local data cache." },
    { id: "sessions", label: "Active Sessions", icon: Monitor, desc: "Monitor active login terminals and audit history." }
  ] as const;

  return (
    <PageContainer>
      <SectionHeader
        title="Account Settings"
        description="Configure your employee profile, security attributes, alert matrix, and session parameters."
      />

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left vertical tab menu */}
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-1 border-b lg:border-b-0 lg:border-r border-border/80 pr-0 lg:pr-4 scrollbar-none whitespace-nowrap lg:whitespace-normal">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  setIsEditingProfile(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-sm font-semibold transition-all cursor-pointer text-left",
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary lg:translate-x-[2px]"
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <div className="text-xs">
                  <span className="block font-bold leading-none">{sec.label}</span>
                  <span className="hidden lg:block text-[10px] text-foreground-muted font-normal mt-0.5 max-w-[200px] truncate">
                    {sec.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Panel */}
        <div className="lg:col-span-3 min-w-0">
          
          {/* PROFILE SECTION */}
          {activeSection === "profile" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>View and manage your core identity details within the ArthDrishti network.</CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 md:items-center border-b border-border pb-6 mb-6">
                  {/* Profile Photo Display */}
                  <div className="relative group shrink-0">
                    <div className="h-20 w-20 rounded-full border-2 border-border overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-heading font-extrabold text-2xl">
                      {profile.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.photoUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                      ) : (
                        profile.fullName.split(" ").map((n) => n[0]).join("")
                      )}
                    </div>
                    <button
                      onClick={handlePhotoUpload}
                      className="absolute inset-0 bg-background/80 backdrop-blur-xs rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-foreground-secondary border border-border"
                      title="Upload photo"
                    >
                      <Upload className="h-4.5 w-4.5" />
                      <span className="text-[8px] font-sans font-bold uppercase mt-1">Upload</span>
                    </button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                      {profile.fullName}
                      <Badge variant="primary">{profile.designation}</Badge>
                    </h3>
                    <p className="text-xs text-foreground-secondary font-sans">
                      {profile.department} &bull; {profile.branch}
                    </p>
                    <p className="text-[10px] text-foreground-muted font-mono uppercase tracking-wider">
                      Employee ID: {profile.employeeId}
                    </p>
                  </div>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSave} className="space-y-4 font-sans text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-foreground-secondary font-semibold">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-foreground-secondary font-semibold">Email Address</label>
                        <input
                          type="email"
                          required
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-foreground-secondary font-semibold">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-foreground-secondary font-semibold">Office Address</label>
                        <input
                          type="text"
                          required
                          value={editForm.officeAddress}
                          onChange={(e) => setEditForm({ ...editForm, officeAddress: e.target.value })}
                          className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-4 flex gap-3">
                      <Button variant="primary" type="submit" size="sm" className="cursor-pointer">
                        <Save className="h-4 w-4 shrink-0" />
                        Save Changes
                      </Button>
                      <Button variant="outline" type="button" size="sm" onClick={handleProfileCancel} className="cursor-pointer">
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 font-sans text-xs">
                    <div className="space-y-1">
                      <span className="text-foreground-muted block">Employee ID</span>
                      <span className="text-foreground font-semibold font-mono">{profile.employeeId}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-foreground-muted block">Designation</span>
                      <span className="text-foreground font-semibold">{profile.designation}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-foreground-muted block">Department</span>
                      <span className="text-foreground font-semibold">{profile.department}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-foreground-muted block">Office Branch</span>
                      <span className="text-foreground font-semibold">{profile.branch}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-foreground-muted block">Email Address</span>
                      <span className="text-foreground font-semibold font-mono">{profile.email}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-foreground-muted block">Phone Number</span>
                      <span className="text-foreground font-semibold font-mono">{profile.phone}</span>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-foreground-muted block">Office Address</span>
                      <span className="text-foreground font-semibold">{profile.officeAddress}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-foreground-muted block">Date of Joining</span>
                      <span className="text-foreground font-semibold flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-foreground-secondary" />
                        {profile.joiningDate}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-foreground-muted block">Direct Reporting Manager</span>
                      <span className="text-foreground font-semibold flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-foreground-secondary" />
                        {profile.manager}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SECURITY SECTION */}
          {activeSection === "security" && (
            <div className="space-y-6">
              {/* Change Password Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Ensure your account remains safe by updating your password credentials regularly.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4 font-sans text-xs max-w-lg">
                    {/* Current Pass */}
                    <div className="space-y-1.5 relative">
                      <label className="text-foreground-secondary font-semibold">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? "text" : "password"}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 pl-3 pr-10 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Pass */}
                    <div className="space-y-1.5 relative">
                      <label className="text-foreground-secondary font-semibold">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 pl-3 pr-10 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {newPassword && (
                        <div className="space-y-1 pt-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-foreground-muted">Password Strength:</span>
                            <span className={cn("font-bold", 
                              passwordStrength.label === "Weak" && "text-critical",
                              passwordStrength.label === "Medium" && "text-warning",
                              passwordStrength.label === "Strong" && "text-positive"
                            )}>{passwordStrength.label}</span>
                          </div>
                          <div className="h-1 bg-border rounded-full flex overflow-hidden">
                            <div className={cn("h-full transition-all duration-350", passwordStrength.color)} style={{ width: `${(passwordStrength.score / 4) * 100}%` }} />
                          </div>
                          <p className="text-[10px] text-foreground-muted">Must contain 8+ characters, 1 uppercase character, 1 number, and 1 special symbol.</p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Pass */}
                    <div className="space-y-1.5 relative">
                      <label className="text-foreground-secondary font-semibold">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 pl-3 pr-10 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground cursor-pointer"
                        >
                          {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="primary" type="submit" size="sm">
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                      <CardDescription>Add an extra layer of identity safety to secure your underwriting portal logs.</CardDescription>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tfaEnabled}
                        onChange={(e) => {
                          setTfaEnabled(e.target.checked);
                          toast.success(e.target.checked ? "2FA has been activated." : "2FA has been disabled.");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </CardHeader>
                <CardContent className="font-sans text-xs">
                  <div className="flex items-start gap-3 bg-surface-elevated p-3 border border-border/80 rounded-sm">
                    {tfaEnabled ? (
                      <>
                        <ShieldCheck className="h-5 w-5 text-positive shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="block font-bold text-foreground">Authenticator App Verification Active</span>
                          <span className="block text-foreground-secondary">
                            Your device is configured to use standard TOTP keys (Google Authenticator, Microsoft Authenticator) for sign-ins.
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="block font-bold text-foreground">Two-Factor Authentication is Disabled</span>
                          <span className="block text-foreground-secondary">
                            Your account is vulnerable to basic credentials cracking. We recommend enabling TOTP code generator configurations immediately.
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recovery Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recovery Email */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recovery Email Address</CardTitle>
                    <CardDescription className="text-xs">Used to reset keys when account credentials lock.</CardDescription>
                  </CardHeader>
                  <CardContent className="font-sans text-xs space-y-3">
                    <div className="font-mono bg-surface-elevated border border-border/80 px-3 py-2 rounded-xs text-foreground flex items-center justify-between">
                      <span>{recoveryEmail}</span>
                      <Check className="h-3.5 w-3.5 text-positive shrink-0" />
                    </div>
                    <button
                      onClick={() => {
                        const email = prompt("Enter new recovery email:", recoveryEmail);
                        if (email) {
                          setRecoveryEmail(email);
                          toast.success("Recovery email updated.");
                        }
                      }}
                      className="text-primary hover:underline font-semibold cursor-pointer text-left block"
                    >
                      Update Recovery Email
                    </button>
                  </CardContent>
                </Card>

                {/* Recovery Phone */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recovery Phone Number</CardTitle>
                    <CardDescription className="text-xs">Used for SMS based identity authorization triggers.</CardDescription>
                  </CardHeader>
                  <CardContent className="font-sans text-xs space-y-3">
                    <div className="font-mono bg-surface-elevated border border-border/80 px-3 py-2 rounded-xs text-foreground flex items-center justify-between">
                      <span>{recoveryPhone}</span>
                      <Check className="h-3.5 w-3.5 text-positive shrink-0" />
                    </div>
                    <button
                      onClick={() => {
                        const phone = prompt("Enter new recovery phone:", recoveryPhone);
                        if (phone) {
                          setRecoveryPhone(phone);
                          toast.success("Recovery phone updated.");
                        }
                      }}
                      className="text-primary hover:underline font-semibold cursor-pointer text-left block"
                    >
                      Update Recovery Phone
                    </button>
                  </CardContent>
                </Card>

                {/* Security Questions */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm">Account Security Questions</CardTitle>
                    <CardDescription className="text-xs">Fallback verification mechanism during credentials restoration procedures.</CardDescription>
                  </CardHeader>
                  <CardContent className="font-sans text-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-foreground-secondary font-semibold">Question</span>
                        <select
                          value={securityQuestion}
                          onChange={(e) => setSecurityQuestion(e.target.value)}
                          className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors cursor-pointer"
                        >
                          <option value="first-pet">What was the name of your first pet?</option>
                          <option value="mother-maiden">What is your mother's maiden name?</option>
                          <option value="first-school">What primary school did you attend?</option>
                          <option value="birth-city">In what city or town were you born?</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-foreground-secondary font-semibold">Answer (Protected)</span>
                        <input
                          type="password"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          placeholder="Type answer here"
                          className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm transition-colors"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success("Security verification questions configured successfully.");
                      }}
                    >
                      Save Question
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* NOTIFICATION PREFERENCES SECTION */}
          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Determine what risk triggers, portfolio events, and system notifications are routed to you.</CardDescription>
              </CardHeader>
              <CardContent className="font-sans text-xs">
                {/* Table representation for premium clean grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 text-foreground-secondary font-bold text-[10px] uppercase tracking-wider">
                        <th className="pb-3 pr-4">Notification Category</th>
                        <th className="pb-3 px-3 text-center">Email</th>
                        <th className="pb-3 px-3 text-center">SMS</th>
                        <th className="pb-3 px-3 text-center">Push</th>
                        <th className="pb-3 px-3 text-center">Desktop</th>
                        <th className="pb-3 pl-4">Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-foreground">
                      {(Object.keys(notifPrefs) as Array<keyof typeof DEFAULT_PREFERENCES>).map((key) => {
                        // Match visual names to keys
                        const titleMap: Record<string, string> = {
                          loanApplications: "Loan Applications Inflow",
                          highRiskAlerts: "High Risk Alerts",
                          fraudAlerts: "Fraud Anomaly Alerts",
                          portfolioAlerts: "Portfolio Limits Alerts",
                          assignmentAlerts: "Case Assignment Alerts",
                          approvalAlerts: "Approvals & Signoffs",
                          customerMessages: "Customer Messages",
                          reportGeneration: "Report Compilation Logs",
                          weeklySummary: "Weekly Analytics Summary",
                          dailySummary: "Daily Activity Summary"
                        };
                        const row = notifPrefs[key];
                        return (
                          <tr key={key} className="hover:bg-surface-elevated/40 transition-colors">
                            <td className="py-3.5 pr-4 font-bold max-w-[200px] break-words">{titleMap[key] || key}</td>
                            
                            {/* Email */}
                            <td className="py-3.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.email}
                                onChange={() => handleTogglePreference(key, "email")}
                                className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                            </td>
                            
                            {/* SMS */}
                            <td className="py-3.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.sms}
                                onChange={() => handleTogglePreference(key, "sms")}
                                className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                            </td>
                            
                            {/* Push */}
                            <td className="py-3.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.push}
                                onChange={() => handleTogglePreference(key, "push")}
                                className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                            </td>
                            
                            {/* Desktop */}
                            <td className="py-3.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.desktop}
                                onChange={() => handleTogglePreference(key, "desktop")}
                                className="h-4 w-4 rounded-xs border-border bg-surface text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                            </td>

                            {/* Frequency */}
                            <td className="py-3.5 pl-4">
                              <select
                                value={row.frequency}
                                onChange={(e) => handleFrequencyChange(key, e.target.value as any)}
                                className="bg-surface border border-border text-[11px] rounded-xs px-2 py-1 outline-none focus:border-primary font-medium cursor-pointer"
                              >
                                <option value="realtime">Real-time</option>
                                <option value="daily">Daily Digest</option>
                                <option value="weekly">Weekly Digest</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* APPEARANCE SECTION */}
          {activeSection === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Interface & Appearance</CardTitle>
                <CardDescription>Customize colors, layouts, language parameters, and content densities.</CardDescription>
              </CardHeader>
              <CardContent className="font-sans text-xs space-y-6">
                
                {/* Theme Selector */}
                <div className="space-y-2">
                  <span className="text-foreground-secondary font-semibold block">Application Palette Theme</span>
                  <div className="grid grid-cols-3 gap-3">
                    {["light", "dark", "system"].map((t) => {
                      const isActive = theme === t;
                      return (
                        <button
                          key={t}
                          onClick={() => handleAppearanceChange("theme", t)}
                          className={cn(
                            "py-3 border rounded-sm font-semibold capitalize transition-all cursor-pointer text-center",
                            isActive
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-surface border-border text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                          )}
                        >
                          {t} Theme
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-foreground-secondary font-semibold block">Primary Language</label>
                    <select
                      value={appearance.language}
                      onChange={(e) => handleAppearanceChange("language", e.target.value)}
                      className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="hi-IN">Hindi (हिन्दी)</option>
                      <option value="es-ES">Spanish (Español)</option>
                      <option value="fr-FR">French (Français)</option>
                    </select>
                  </div>

                  {/* Date Format */}
                  <div className="space-y-1.5">
                    <label className="text-foreground-secondary font-semibold block">Preferred Date Format</label>
                    <select
                      value={appearance.dateFormat}
                      onChange={(e) => handleAppearanceChange("dateFormat", e.target.value)}
                      className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                    >
                      <option value="DD/MM/YYYY">DD / MM / YYYY (e.g. 13/07/2026)</option>
                      <option value="MM/DD/YYYY">MM / DD / YYYY (e.g. 07/13/2026)</option>
                      <option value="YYYY-MM-DD">YYYY - MM - DD (e.g. 2026-07-13)</option>
                    </select>
                  </div>

                  {/* Time Format */}
                  <div className="space-y-1.5">
                    <label className="text-foreground-secondary font-semibold block">Preferred Time Format</label>
                    <select
                      value={appearance.timeFormat}
                      onChange={(e) => handleAppearanceChange("timeFormat", e.target.value)}
                      className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                    >
                      <option value="12h">12-Hour clock (e.g. 03:00 PM)</option>
                      <option value="24h">24-Hour clock (e.g. 15:00)</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <label className="text-foreground-secondary font-semibold block">Preferred Timezone</label>
                    <select
                      value={appearance.timezone}
                      onChange={(e) => handleAppearanceChange("timezone", e.target.value)}
                      className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                    >
                      <option value="GMT+5:30">GMT +5:30 (Kolkata, India Standard Time)</option>
                      <option value="GMT+0:00">GMT +0:00 (London, Coordinated Universal Time)</option>
                      <option value="GMT-5:00">GMT -5:00 (New York, Eastern Standard Time)</option>
                      <option value="GMT+8:00">GMT +8:00 (Singapore Standard Time)</option>
                    </select>
                  </div>

                  {/* Density */}
                  <div className="space-y-1.5">
                    <label className="text-foreground-secondary font-semibold block">Layout Padding Density</label>
                    <select
                      value={appearance.density}
                      onChange={(e) => handleAppearanceChange("density", e.target.value)}
                      className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                    >
                      <option value="compact">Compact (Tight grid lists)</option>
                      <option value="comfortable">Comfortable (Standard)</option>
                      <option value="loose">Loose (Spacious layouts)</option>
                    </select>
                  </div>

                  {/* Sidebar style */}
                  <div className="space-y-1.5">
                    <label className="text-foreground-secondary font-semibold block">Sidebar Layout Mode</label>
                    <select
                      value={appearance.sidebarStyle}
                      onChange={(e) => handleAppearanceChange("sidebarStyle", e.target.value)}
                      className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                    >
                      <option value="expanded">Expanded (Full titles)</option>
                      <option value="collapsed">Collapsed (Icon menu only)</option>
                    </select>
                  </div>

                  {/* Reduced Motion Toggle */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-foreground-secondary font-semibold block">Page Transition Effects</label>
                    <select
                      value={appearance.animation}
                      onChange={(e) => handleAppearanceChange("animation", e.target.value)}
                      className="w-full h-10 px-3 bg-surface border border-border focus:border-primary rounded-xs outline-none text-foreground text-sm cursor-pointer"
                    >
                      <option value="enabled">Standard (Smooth animations)</option>
                      <option value="reduced">Reduced Motion (Framer fade cuts)</option>
                      <option value="disabled">None (Instant rendering)</option>
                    </select>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {/* PRIVACY & DATA SECTION */}
          {activeSection === "privacy" && (
            <div className="space-y-6">
              {/* Activity History & Data Extraction */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Data Export</CardTitle>
                  <CardDescription>Extract a copy of your security actions log, profile states, and preferences in JSON format.</CardDescription>
                </CardHeader>
                <CardContent className="font-sans text-xs space-y-4">
                  <p className="text-foreground-secondary leading-relaxed max-w-2xl">
                    Under corporate banking compliance regulations, you can download a full archive containing all profile data, device logins registers, and alert routing configurations logged under your Employee ID.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={handleDownloadData}>
                      <Download className="h-4 w-4 shrink-0" />
                      Download Personal Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success("Preferences data JSON compiled. Downloading...");
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ notifPrefs }, null, 2));
                        const dlAnchorElem = document.createElement("a");
                        dlAnchorElem.setAttribute("href", dataStr);
                        dlAnchorElem.setAttribute("download", `preferences_${profile.employeeId}.json`);
                        dlAnchorElem.click();
                      }}
                    >
                      Export Preferences
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success("Officer audit action logs successfully extracted.");
                      }}
                    >
                      Activity History Log
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>System & Cache Diagnostics</CardTitle>
                  <CardDescription>Perform diagnostics, purge temp data pools, and delete local credentials logs.</CardDescription>
                </CardHeader>
                <CardContent className="font-sans text-xs space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Clear cache */}
                    <div className="p-4 border border-border/80 bg-surface-elevated/40 rounded-sm space-y-3">
                      <span className="block font-bold text-foreground">Clear Local Asset Cache</span>
                      <span className="block text-foreground-secondary leading-normal">
                        Purges cached underwriting worksheets, applicant documents, and temporary JSON metrics.
                      </span>
                      <Button variant="outline" size="sm" onClick={handleClearCache}>
                        Clear Cache
                      </Button>
                    </div>

                    {/* Delete Session Log */}
                    <div className="p-4 border border-border/80 bg-surface-elevated/40 rounded-sm space-y-3">
                      <span className="block font-bold text-foreground">Delete Session Logs</span>
                      <span className="block text-foreground-secondary leading-normal">
                        Remove local logs of expired credentials sessions and history telemetry.
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updated = sessions.filter((s) => s.status.includes("Current"));
                          setSessions(updated);
                          localStorage.setItem("officer-sessions", JSON.stringify(updated));
                          toast.success("Expired sessions history has been permanently deleted.");
                        }}
                      >
                        Delete Session History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SESSIONS SECTION */}
          {activeSection === "sessions" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>Monitor and manage active terminals logged into your officer portal credentials.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="text-critical border-critical/30 hover:bg-critical/5 cursor-pointer font-bold shrink-0" onClick={handleLogoutAllDevices}>
                    <LogOut className="h-4 w-4 shrink-0" />
                    Logout All Other Devices
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="font-sans text-xs">
                {/* Enterprise Sessions table */}
                <div className="overflow-x-auto border border-border rounded-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-surface-elevated text-foreground-secondary font-bold text-[10px] uppercase tracking-wider">
                        <th className="p-3">Device Terminal</th>
                        <th className="p-3">Browser</th>
                        <th className="p-3">OS</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Login Time</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground">
                      {sessions.map((sess) => {
                        const isExpired = sess.status === "Expired";
                        return (
                          <tr key={sess.id} className={cn("hover:bg-surface-elevated/40 transition-colors", isExpired && "opacity-60")}>
                            {/* Device icon and name */}
                            <td className="p-3 font-semibold flex items-center gap-2">
                              {sess.device.includes("Workstation") || sess.device.includes("Laptop") ? (
                                <Laptop className="h-4 w-4 text-foreground-secondary" />
                              ) : (
                                <Smartphone className="h-4 w-4 text-foreground-secondary" />
                              )}
                              <span>{sess.device}</span>
                            </td>
                            <td className="p-3">{sess.browser}</td>
                            <td className="p-3">{sess.os}</td>
                            <td className="p-3 font-mono text-[11px]">{sess.ip}</td>
                            <td className="p-3">{sess.location}</td>
                            <td className="p-3 text-foreground-secondary">{sess.loginTime}</td>
                            
                            {/* Status badge */}
                            <td className="p-3">
                              <Badge
                                variant={
                                  sess.status.includes("Current") 
                                    ? "success" 
                                    : sess.status === "Active" 
                                      ? "primary" 
                                      : "outline"
                                }
                              >
                                {sess.status}
                              </Badge>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              {!isExpired && !sess.status.includes("Current") ? (
                                <button
                                  onClick={() => handleLogoutDevice(sess.id)}
                                  className="text-critical hover:text-critical/80 font-bold hover:underline cursor-pointer"
                                  title="Force logout device"
                                >
                                  Logout
                                </button>
                              ) : (
                                <span className="text-foreground-muted">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </PageContainer>
  );
}
