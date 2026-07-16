"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  UserCheck,
  ShieldCheck,
  Cpu,
  ClipboardList,
  Sparkles,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Network,
  Database,
  Server,
  FileText,
  Settings,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  MoreVertical,
  RefreshCw,
  Download,
  UserPlus,
  Folder,
  Terminal,
  Lock,
  Plus,
  Search,
  X,
  ChevronsRight,
  Clock,
  Calendar,
  Smartphone,
  Key,
  Check,
  Eye,
  EyeOff,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Laptop
} from "lucide-react";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState
} from "@tanstack/react-table";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet, Modal, Tooltip, Dropdown } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

// HSL Color Maps from globals.css
export const COLORS = {
  primary: "#4F7CFF",
  ai: "#8B5CF6",
  forecast: "#06B6D4",
  positive: "#10B981",
  warning: "#F59E0B",
  critical: "#EF4444",
  secondary: "#64748B",
  muted: "#94A3B8"
};

// ==================================================
// DATA INTERFACES
// ==================================================

export interface UserInfo {
  id: string;
  fullName: string;
  avatar: string;
  employeeId: string;
  email: string;
  phone: string;
  organization: string;
  department: string;
  branch: string;
  role: "Customer" | "Loan Officer" | "Risk Analyst" | "Manager" | "Administrator" | "Super Administrator";
  status: "Active" | "Inactive" | "Suspended" | "Locked" | "Pending Invitation";
  lastLogin: string;
  mfaEnabled: boolean;
  createdDate: string;
  mfaType: string;
  failedLogins: number;
  trustedDevicesCount: number;
  permissions: string[];
  loginHistory: LoginHistoryItem[];
  activities: ActivityItem[];
  assignedReports: string[];
  assignedCases: string[];
  assignedDevices: string[];
}

export interface LoginHistoryItem {
  date: string;
  time: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
  status: "Success" | "Failed" | "Blocked";
}

export interface ActivityItem {
  event: string;
  timestamp: string;
  detail: string;
}

// ==================================================
// SEED INITIAL MOCK DATA
// ==================================================

export const INITIAL_USERS: UserInfo[] = [
  {
    id: "usr-1",
    fullName: "Super Admin (Rahul Chahar)",
    avatar: "RC",
    employeeId: "EMP-2026-0001",
    email: "rahul.chahar@arthdrishti.in",
    phone: "+91 98765 43210",
    organization: "ArthDrishti Bank",
    department: "Platform Operations",
    branch: "Delhi Corporate Office",
    role: "Super Administrator",
    status: "Active",
    lastLogin: "Just Now",
    mfaEnabled: true,
    createdDate: "2023-03-12",
    mfaType: "Authenticator App",
    failedLogins: 0,
    trustedDevicesCount: 2,
    permissions: ["users:read", "users:write", "orgs:read", "orgs:write", "models:read", "models:write", "models:retrain", "system:diagnostics", "audit:read"],
    loginHistory: [
      { date: "2026-07-13", time: "14:57:02", ip: "10.22.45.18", device: "Office Workstation", browser: "Google Chrome", location: "Delhi, IN", status: "Success" },
      { date: "2026-07-12", time: "09:30:15", ip: "103.45.12.89", device: "Personal Laptop", browser: "Apple Safari", location: "Mumbai, IN", status: "Success" }
    ],
    activities: [
      { event: "Login", timestamp: "Today, 14:57", detail: "Authenticated successfully via MFA." },
      { event: "Role Updated", timestamp: "Yesterday, 10:00", detail: "Role elevated to Super Administrator." }
    ],
    assignedReports: ["Q2 Segment Concentration Audit", "Quarterly Hardware Utilization Peak"],
    assignedCases: [],
    assignedDevices: ["Office Workstation", "Personal Laptop"]
  },
  {
    id: "usr-2",
    fullName: "Officer Priya",
    avatar: "OP",
    employeeId: "EMP-2026-0104",
    email: "priya.sharma@arthdrishti.in",
    phone: "+91 98765 43211",
    organization: "ArthDrishti Bank",
    department: "Retail Lending Underwriting",
    branch: "Delhi Corporate Office",
    role: "Loan Officer",
    status: "Active",
    lastLogin: "10 mins ago",
    mfaEnabled: true,
    createdDate: "2024-05-15",
    mfaType: "Authenticator App",
    failedLogins: 0,
    trustedDevicesCount: 1,
    permissions: ["users:read", "models:read", "cases:read", "cases:write", "reports:read"],
    loginHistory: [
      { date: "2026-07-13", time: "15:37:12", ip: "10.22.45.22", device: "Workstation LT-2", browser: "Google Chrome", location: "Delhi, IN", status: "Success" }
    ],
    activities: [
      { event: "Login", timestamp: "Today, 15:37", detail: "Officer workspace sync complete." }
    ],
    assignedReports: ["Retail Performance Index"],
    assignedCases: ["app2", "app5", "app8"],
    assignedDevices: ["Workstation LT-2"]
  },
  {
    id: "usr-3",
    fullName: "Risk Analyst Anand",
    avatar: "RA",
    employeeId: "EMP-2026-0309",
    email: "anand.sinha@arthdrishti.in",
    phone: "+91 98765 43212",
    organization: "ArthDrishti Bank",
    department: "Risk Intelligence Unit",
    branch: "Mumbai Zonal Office",
    role: "Risk Analyst",
    status: "Active",
    lastLogin: "2 hours ago",
    mfaEnabled: true,
    createdDate: "2024-09-01",
    mfaType: "SMS OTP",
    failedLogins: 1,
    trustedDevicesCount: 1,
    permissions: ["models:read", "models:write", "models:retrain", "reports:read", "reports:write"],
    loginHistory: [
      { date: "2026-07-13", time: "13:12:44", ip: "10.24.89.5", device: "Analytical PC", browser: "Firefox", location: "Mumbai, IN", status: "Success" },
      { date: "2026-07-13", time: "13:10:02", ip: "10.24.89.5", device: "Analytical PC", browser: "Firefox", location: "Mumbai, IN", status: "Failed" }
    ],
    activities: [
      { event: "Login", timestamp: "Today, 13:12", detail: "Authenticated after 1 failed attempt." },
      { event: "Organization Changed", timestamp: "July 05, 11:30", detail: "Transferred from Delhi Branch." }
    ],
    assignedReports: ["Canary Accuracy Degradation Log"],
    assignedCases: [],
    assignedDevices: ["Analytical PC"]
  },
  {
    id: "usr-4",
    fullName: "Manager Siddharth",
    avatar: "MS",
    employeeId: "EMP-2026-0012",
    email: "siddharth.mehta@arthdrishti.in",
    phone: "+91 98765 43213",
    organization: "ArthDrishti Bank",
    department: "Risk Operations Control",
    branch: "Mumbai Zonal Office",
    role: "Manager",
    status: "Active",
    lastLogin: "Yesterday, 04:30 PM",
    mfaEnabled: true,
    createdDate: "2023-04-10",
    mfaType: "Authenticator App",
    failedLogins: 0,
    trustedDevicesCount: 2,
    permissions: ["users:read", "orgs:read", "models:read", "cases:assign", "cases:approve", "reports:read"],
    loginHistory: [
      { date: "2026-07-12", time: "16:30:00", ip: "10.24.89.1", device: "Workstation M1", browser: "Google Chrome", location: "Mumbai, IN", status: "Success" }
    ],
    activities: [
      { event: "Login", timestamp: "Yesterday, 16:30", detail: "MFA challenge successfully verified." }
    ],
    assignedReports: ["Q2 Segment Concentration Audit"],
    assignedCases: ["app3", "app6"],
    assignedDevices: ["Workstation M1"]
  },
  {
    id: "usr-5",
    fullName: "Officer Rahul",
    avatar: "OR",
    employeeId: "EMP-2026-0112",
    email: "rahul.ro@arthdrishti.in",
    phone: "+91 98765 43214",
    organization: "ArthDrishti Bank",
    department: "Commercial Lending Desk",
    branch: "Delhi Corporate Office",
    role: "Loan Officer",
    status: "Active",
    lastLogin: "Today, 08:42 AM",
    mfaEnabled: true,
    createdDate: "2024-01-20",
    mfaType: "Authenticator App",
    failedLogins: 2,
    trustedDevicesCount: 1,
    permissions: ["users:read", "models:read", "cases:read", "cases:write", "reports:read"],
    loginHistory: [
      { date: "2026-07-13", time: "08:42:18", ip: "10.22.45.18", device: "Office Workstation", browser: "Google Chrome", location: "Delhi, IN", status: "Success" }
    ],
    activities: [
      { event: "Login", timestamp: "Today, 08:42", detail: "MFA challenge completed." }
    ],
    assignedReports: ["Commercial Portfolio Risk Profile"],
    assignedCases: ["app1", "app4", "app7", "app10"],
    assignedDevices: ["Office Workstation"]
  },
  {
    id: "usr-6",
    fullName: "Audit Officer Meera",
    avatar: "AM",
    employeeId: "EMP-2026-0045",
    email: "meera.compliance@arthdrishti.in",
    phone: "+91 98765 43215",
    organization: "ArthDrishti Bank",
    department: "Compliance & Auditing",
    branch: "Kolkata Regional Branch",
    role: "Administrator",
    status: "Active",
    lastLogin: "2 days ago",
    mfaEnabled: true,
    createdDate: "2023-11-12",
    mfaType: "Authenticator App",
    failedLogins: 0,
    trustedDevicesCount: 1,
    permissions: ["users:read", "users:write", "orgs:read", "orgs:write", "models:read", "audit:read"],
    loginHistory: [
      { date: "2026-07-11", time: "10:15:22", ip: "10.45.22.8", device: "Zonal Term-3", browser: "Google Chrome", location: "Kolkata, IN", status: "Success" }
    ],
    activities: [
      { event: "Password Changed", timestamp: "July 01, 14:22", detail: "Credentials updated by policy constraint." }
    ],
    assignedReports: ["MFA Enrollment Coverage Logs"],
    assignedCases: [],
    assignedDevices: ["Zonal Term-3"]
  },
  {
    id: "usr-7",
    fullName: "Kunal Shah",
    avatar: "KS",
    employeeId: "CST-2026-0922",
    email: "kunal@enterprises.com",
    phone: "+91 98765 43216",
    organization: "Kunal Enterprises Ltd",
    department: "Executive Board",
    branch: "External Corporate Client",
    role: "Customer",
    status: "Active",
    lastLogin: "3 hours ago",
    mfaEnabled: false,
    createdDate: "2025-06-20",
    mfaType: "None",
    failedLogins: 0,
    trustedDevicesCount: 1,
    permissions: ["portal:read", "portal:apply", "reports:read"],
    loginHistory: [
      { date: "2026-07-13", time: "12:50:33", ip: "184.22.89.1", device: "Admin Laptop", browser: "Google Chrome", location: "Surat, IN", status: "Success" }
    ],
    activities: [
      { event: "Login", timestamp: "Today, 12:50", detail: "Onboarded via business API portal." }
    ],
    assignedReports: [],
    assignedCases: [],
    assignedDevices: ["Admin Laptop"]
  },
  {
    id: "usr-8",
    fullName: "Finserv Admin Marcus",
    avatar: "FM",
    employeeId: "ORG-2026-0002",
    email: "marcus.v@finserv.com",
    phone: "+91 98765 43217",
    organization: "Finserv Global Corp",
    department: "Risk Infrastructure Management",
    branch: "External Corporate Client",
    role: "Administrator",
    status: "Active",
    lastLogin: "Today, 11:20 AM",
    mfaEnabled: true,
    createdDate: "2025-02-14",
    mfaType: "Authenticator App",
    failedLogins: 1,
    trustedDevicesCount: 2,
    permissions: ["users:read", "users:write", "orgs:read", "orgs:write", "models:read", "audit:read"],
    loginHistory: [
      { date: "2026-07-13", time: "11:20:15", ip: "192.168.12.82", device: "Remote Station", browser: "Google Chrome", location: "Mumbai, IN", status: "Success" }
    ],
    activities: [
      { event: "Login", timestamp: "Today, 11:20", detail: "Remote access login completed." }
    ],
    assignedReports: ["Third-party Experian Gateway Downlog"],
    assignedCases: [],
    assignedDevices: ["Remote Station"]
  },
  {
    id: "usr-9",
    fullName: "Rahul Sen",
    avatar: "RS",
    employeeId: "CST-2026-0810",
    email: "rahulsen@wholesale.in",
    phone: "+91 98765 43218",
    organization: "Rahul Sen Wholesale",
    department: "Sole Proprietorship",
    branch: "External Small Business Client",
    role: "Customer",
    status: "Active",
    lastLogin: "1 day ago",
    mfaEnabled: false,
    createdDate: "2026-07-01",
    mfaType: "None",
    failedLogins: 0,
    trustedDevicesCount: 1,
    permissions: ["portal:read", "portal:apply", "reports:read"],
    loginHistory: [
      { date: "2026-07-12", time: "10:30:11", ip: "103.22.45.109", device: "Personal Phone", browser: "Google Chrome Mobile", location: "Kolkata, IN", status: "Success" }
    ],
    activities: [
      { event: "Account Created", timestamp: "July 01, 10:30", detail: "Created via loan routing gateway." }
    ],
    assignedReports: [],
    assignedCases: [],
    assignedDevices: ["Personal Phone"]
  },
  {
    id: "usr-10",
    fullName: "Priyanka Roy",
    avatar: "PR",
    employeeId: "CST-2026-0811",
    email: "priyanka.roy@outlook.com",
    phone: "+91 98765 43219",
    organization: "Individual Retail",
    department: "Retail Accounts",
    branch: "External Retail Client",
    role: "Customer",
    status: "Active",
    lastLogin: "3 days ago",
    mfaEnabled: false,
    createdDate: "2026-07-03",
    mfaType: "None",
    failedLogins: 0,
    trustedDevicesCount: 1,
    permissions: ["portal:read", "portal:apply", "reports:read"],
    loginHistory: [
      { date: "2026-07-10", time: "09:12:44", ip: "122.45.82.11", device: "Personal Laptop", browser: "Apple Safari", location: "Kolkata, IN", status: "Success" }
    ],
    activities: [
      { event: "Account Created", timestamp: "July 03, 09:12", detail: "Registered on retail lending app." }
    ],
    assignedReports: [],
    assignedCases: [],
    assignedDevices: ["Personal Laptop"]
  },
  {
    id: "usr-11",
    fullName: "Amit Sharma",
    avatar: "AS",
    employeeId: "CST-2026-0812",
    email: "amit.sharma@sharmasteel.com",
    phone: "+91 98765 43220",
    organization: "Sharma Steel Industry",
    department: "Executive Management",
    branch: "External SME Client",
    role: "Customer",
    status: "Locked",
    lastLogin: "Yesterday, 09:10 AM",
    mfaEnabled: true,
    createdDate: "2026-06-28",
    mfaType: "SMS OTP",
    failedLogins: 5,
    trustedDevicesCount: 0,
    permissions: ["portal:read", "portal:apply", "reports:read"],
    loginHistory: [
      { date: "2026-07-12", time: "09:10:02", ip: "103.88.92.5", device: "SME Workstation", browser: "Firefox", location: "Indore, IN", status: "Failed" },
      { date: "2026-07-12", time: "09:08:44", ip: "103.88.92.5", device: "SME Workstation", browser: "Firefox", location: "Indore, IN", status: "Failed" }
    ],
    activities: [
      { event: "Logout", timestamp: "June 28, 17:00", detail: "Explicit log off registered." }
    ],
    assignedReports: [],
    assignedCases: [],
    assignedDevices: []
  },
  {
    id: "usr-12",
    fullName: "Vikram Malhotra",
    avatar: "VM",
    employeeId: "CST-2026-0813",
    email: "vikram@malhotratech.in",
    phone: "+91 98765 43221",
    organization: "Malhotra Tech Solutions",
    department: "Founder Desk",
    branch: "External SME Client",
    role: "Customer",
    status: "Suspended",
    lastLogin: "Today, 02:15 PM",
    mfaEnabled: true,
    createdDate: "2026-06-29",
    mfaType: "Authenticator App",
    failedLogins: 1,
    trustedDevicesCount: 1,
    permissions: ["portal:read", "portal:apply", "reports:read"],
    loginHistory: [
      { date: "2026-07-13", time: "14:15:00", ip: "194.22.45.109", device: "Work laptop", browser: "Google Chrome", location: "Mumbai, IN", status: "Success" }
    ],
    activities: [
      { event: "Profile Updated", timestamp: "July 10, 11:30", detail: "Primary phone number updated." }
    ],
    assignedReports: [],
    assignedCases: [],
    assignedDevices: ["Work laptop"]
  },
  {
    id: "usr-13",
    fullName: "Inactive Analyst Sanjay",
    avatar: "IA",
    employeeId: "EMP-2026-0310",
    email: "sanjay.inactive@arthdrishti.in",
    phone: "+91 98765 43222",
    organization: "ArthDrishti Bank",
    department: "Risk Intelligence Unit",
    branch: "Chennai Regional Branch",
    role: "Risk Analyst",
    status: "Inactive",
    lastLogin: "Over 30 days ago",
    mfaEnabled: true,
    createdDate: "2025-01-10",
    mfaType: "SMS OTP",
    failedLogins: 0,
    trustedDevicesCount: 1,
    permissions: ["models:read", "reports:read"],
    loginHistory: [
      { date: "2026-06-10", time: "11:30:15", ip: "10.33.12.8", device: "Chennai Terminal 1", browser: "Firefox", location: "Chennai, IN", status: "Success" }
    ],
    activities: [
      { event: "Logout", timestamp: "June 10, 12:45", detail: "Session timed out naturally." }
    ],
    assignedReports: [],
    assignedCases: [],
    assignedDevices: ["Chennai Terminal 1"]
  },
  {
    id: "usr-14",
    fullName: "Pending Analyst Neha",
    avatar: "PA",
    employeeId: "EMP-2026-0311",
    email: "neha.kapoor@arthdrishti.in",
    phone: "+91 98765 43223",
    organization: "ArthDrishti Bank",
    department: "Risk Intelligence Unit",
    branch: "Delhi Corporate Office",
    role: "Risk Analyst",
    status: "Pending Invitation",
    lastLogin: "Never",
    mfaEnabled: false,
    createdDate: "Pending Invite",
    mfaType: "None",
    failedLogins: 0,
    trustedDevicesCount: 0,
    permissions: ["models:read", "reports:read"],
    loginHistory: [],
    activities: [
      { event: "Account Created", timestamp: "Today, 14:00", detail: "IAM activation invitation dispatched." }
    ],
    assignedReports: [],
    assignedCases: [],
    assignedDevices: []
  },
  {
    id: "usr-15",
    fullName: "Pending Officer Alok",
    avatar: "PO",
    employeeId: "EMP-2026-0113",
    email: "alok.pandey@arthdrishti.in",
    phone: "+91 98765 43224",
    organization: "ArthDrishti Bank",
    department: "Commercial Lending Desk",
    branch: "Kolkata Regional Branch",
    role: "Loan Officer",
    status: "Pending Invitation",
    lastLogin: "Never",
    mfaEnabled: false,
    createdDate: "Pending Invite",
    mfaType: "None",
    failedLogins: 0,
    trustedDevicesCount: 0,
    permissions: ["users:read", "models:read", "cases:read", "reports:read"],
    loginHistory: [],
    activities: [
      { event: "Account Created", timestamp: "Today, 14:15", detail: "IAM activation invitation dispatched." }
    ],
    assignedReports: [],
    assignedCases: [],
    assignedDevices: []
  }
];

export const MOCK_PERMISSIONS: Record<string, string[]> = {
  "Customer": ["portal:read", "portal:apply", "reports:read"],
  "Loan Officer": ["users:read", "models:read", "cases:read", "cases:write", "reports:read"],
  "Risk Analyst": ["models:read", "models:write", "models:retrain", "reports:read", "reports:write"],
  "Manager": ["users:read", "orgs:read", "models:read", "cases:assign", "cases:approve", "reports:read"],
  "Administrator": ["users:read", "users:write", "orgs:read", "orgs:write", "models:read", "audit:read"],
  "Super Administrator": ["users:read", "users:write", "orgs:read", "orgs:write", "models:read", "models:write", "models:retrain", "system:diagnostics", "audit:read"]
};

export const MOCK_DEPARTMENTS = ["Platform Operations", "Retail Lending Underwriting", "Risk Intelligence Unit", "Risk Operations Control", "Commercial Lending Desk", "Compliance & Auditing", "Executive Board", "Founder Desk", "Retail Accounts"];
export const MOCK_ORGANIZATIONS = ["ArthDrishti Bank", "Kunal Enterprises Ltd", "Finserv Global Corp", "Rahul Sen Wholesale", "Individual Retail", "Sharma Steel Industry", "Malhotra Tech Solutions"];
export const MOCK_BRANCHES = ["Delhi Corporate Office", "Mumbai Zonal Office", "Kolkata Regional Branch", "Chennai Regional Branch", "External Corporate Client", "External Small Business Client", "External Retail Client", "External SME Client"];
