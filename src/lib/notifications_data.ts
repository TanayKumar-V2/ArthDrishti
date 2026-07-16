// Merged Notifications Data (Shared between Admin Hub and Loan Officer Portal)

// ============================================================================
// 1. SHARED DEFINITIONS FOR OFFICER PORTAL (Do NOT delete - required by officer pages)
// ============================================================================

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  loginTime: string;
  status: "Current Session" | "Active" | "Expired";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "fraud" | "applications" | "approvals" | "assignments" | "reports" | "system";
  priority: "Critical" | "High" | "Medium" | "Low";
  readStatus: boolean;
  pinned: boolean;
  timestamp: string;
  relativeTime?: string;
  aiSummary?: string;
  relatedApplicantId?: string;
  assignedOfficer?: string;
  muted?: boolean;
  timeline?: Array<{ status: string; time: string; note: string }>;
}

export const DEFAULT_PREFERENCES = {
  loanApplications: { email: true, sms: false, push: true, desktop: true, frequency: "realtime" as const },
  highRiskAlerts: { email: true, sms: true, push: true, desktop: true, frequency: "realtime" as const },
  fraudAlerts: { email: true, sms: true, push: true, desktop: true, frequency: "realtime" as const },
  portfolioAlerts: { email: true, sms: false, push: true, desktop: true, frequency: "daily" as const },
  assignmentAlerts: { email: true, sms: false, push: true, desktop: true, frequency: "realtime" as const },
  approvalAlerts: { email: true, sms: false, push: false, desktop: true, frequency: "daily" as const },
  customerMessages: { email: false, sms: true, push: true, desktop: false, frequency: "realtime" as const },
  reportGeneration: { email: true, sms: false, push: false, desktop: true, frequency: "weekly" as const },
  weeklySummary: { email: true, sms: false, push: false, desktop: false, frequency: "weekly" as const },
  dailySummary: { email: true, sms: false, push: false, desktop: false, frequency: "daily" as const }
};

export const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: "sess-1",
    device: "Corporate Laptop (MacBook Pro)",
    browser: "Chrome v124.0",
    os: "macOS Sonoma",
    ip: "103.45.192.12",
    location: "Mumbai, Maharashtra (HQ Office)",
    loginTime: "14 Jul 2026, 09:30 AM",
    status: "Current Session"
  },
  {
    id: "sess-2",
    device: "Mobile Application Terminal (iPhone 15)",
    browser: "Safari Mobile v17.4",
    os: "iOS 17.4.1",
    ip: "49.36.81.104",
    location: "Kolkata, West Bengal (Field Branch)",
    loginTime: "13 Jul 2026, 02:45 PM",
    status: "Active"
  },
  {
    id: "sess-3",
    device: "Windows Desktop Station",
    browser: "Firefox Dev Edition",
    os: "Windows 11 Enterprise",
    ip: "192.168.1.42",
    location: "Delhi, NCT (Security Operations)",
    loginTime: "10 Jul 2026, 11:15 AM",
    status: "Expired"
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "High Risk Fraud Alert",
    description: "Applicant Rahul Chahar has been flagged with an anomalous debt-to-income ratio and suspicious credit bureau log changes.",
    type: "fraud",
    priority: "Critical",
    readStatus: false,
    pinned: true,
    timestamp: "2026-07-14T20:10:00.000Z",
    relativeTime: "10m ago",
    aiSummary: "The applicant exhibits extreme debt leverage ratios and recent defaults history. Immediate underwriting check is highly recommended.",
    relatedApplicantId: "APPL-101",
    assignedOfficer: "Rahul Chahar",
    timeline: [
      { status: "Fraud Flagged", time: "20:10", note: "Risk engine detected credit score variance threshold anomaly." }
    ]
  },
  {
    id: "notif-2",
    title: "New Underwriting Case Assigned",
    description: "Zenith Retail Corp commercial credit line case (₹2.4 Cr) has been assigned to your workspace.",
    type: "assignments",
    priority: "High",
    readStatus: false,
    pinned: false,
    timestamp: "2026-07-14T18:30:00.000Z",
    relativeTime: "2h ago",
    relatedApplicantId: "APPL-102",
    timeline: [
      { status: "Case Assigned", time: "18:30", note: "Automatic load balancer directed case to senior underwriter." }
    ]
  },
  {
    id: "notif-3",
    title: "Prediction Analysis Generated",
    description: "AI underwriting models successfully generated risk matrices for Indo-FinCorp portfolio split.",
    type: "reports",
    priority: "Medium",
    readStatus: true,
    pinned: false,
    timestamp: "2026-07-13T14:15:00.000Z",
    relativeTime: "Yesterday",
    timeline: []
  },
  {
    id: "notif-4",
    title: "AI Threshold Re-sync Success",
    description: "Retail scorecards recommendations engine successfully calibrated. Decision templates updated.",
    type: "system",
    priority: "Low",
    readStatus: true,
    pinned: false,
    timestamp: "2026-07-12T09:00:00.000Z",
    relativeTime: "2 days ago",
    timeline: []
  }
];


// ============================================================================
// 2. DEFINITIONS & DATA FOR ENTERPRISE ADMIN NOTIFICATION HUB
// ============================================================================

export type NotificationCategory =
  | "Platform Alert"
  | "AI Notification"
  | "Infrastructure Event"
  | "Security Incident"
  | "Operational Update";

export type PriorityLevel = "Information" | "Success" | "Warning" | "High" | "Critical";
export type DeliveryChannel = "In-App" | "Email" | "SMS" | "Push" | "Webhook";

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  priority: PriorityLevel;
  module: string;
  timestamp: string;
  timeLabel: "Today" | "Yesterday" | "This Week" | "Earlier";
  relatedResource: string;
  relatedUser: string;
  relatedOrg: string;
  relatedModel: string;
  status: "Read" | "Unread";
  pinned: boolean;
  archived: boolean;
  assignedAdmin: string | null;
  timeline: string[];
  recommendedAction: string;
}

export interface NotificationRuleCard {
  id: string;
  title: string;
  enabled: boolean;
  priority: PriorityLevel;
  channels: DeliveryChannel[];
}

export interface KPIStatsItem {
  title: string;
  value: string | number;
  trend: number;
  sparkline: number[];
  icon: string;
  status: "success" | "warning" | "destructive" | "info" | "default";
  description: string;
}

export interface TypeDistributionPoint {
  name: string;
  value: number;
}

export interface PriorityDistributionPoint {
  name: string;
  value: number;
  fill: string;
}

export interface AlertsTrendPoint {
  time: string;
  count: number;
  resolved: number;
}

export const ADMIN_LIST = [
  "Unassigned",
  "Marcus Vance (SecOps)",
  "Sarah Jenkins (Platform)",
  "Auditor Roy (Compliance)",
  "System Daemon"
];

export const NOTIFICATION_RULES: NotificationRuleCard[] = [
  { id: "rule-ai", title: "AI Alerts", enabled: true, priority: "High", channels: ["In-App", "Webhook"] },
  { id: "rule-sec", title: "Security Alerts", enabled: true, priority: "Critical", channels: ["In-App", "Email", "SMS", "Webhook"] },
  { id: "rule-infra", title: "Infrastructure Alerts", enabled: true, priority: "High", channels: ["In-App", "Webhook"] },
  { id: "rule-api", title: "API Alerts", enabled: true, priority: "Warning", channels: ["In-App", "Email"] },
  { id: "rule-user", title: "User Alerts", enabled: true, priority: "Information", channels: ["In-App"] },
  { id: "rule-org", title: "Organization Alerts", enabled: true, priority: "Success", channels: ["In-App", "Email"] },
  { id: "rule-audit", title: "Audit Alerts", enabled: false, priority: "Information", channels: ["Webhook"] },
  { id: "rule-job", title: "Background Job Alerts", enabled: true, priority: "Warning", channels: ["In-App"] }
];

export const NOTIFICATIONS_REGISTRY: AdminNotification[] = [
  {
    id: "NTF-901",
    title: "Model Drift Detected",
    description: "Credit Risk scoring ensemble F1-score has drifted below 0.85 threshold margins (PSI: 0.245).",
    category: "AI Notification",
    priority: "Critical",
    module: "Model Drift",
    timestamp: "2026-07-14 20:30:15",
    timeLabel: "Today",
    relatedResource: "Model: mod-ensemble-risk",
    relatedUser: "Underwriting System",
    relatedOrg: "ArthDrishti Core Platforms",
    relatedModel: "mod-ensemble-risk v2.4",
    status: "Unread",
    pinned: true,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[20:30:15] Drift detector PSI trigger matched.",
      "[20:30:16] Webhook alert dispatches completed."
    ],
    recommendedAction: "Initialize retraining pipeline manually using July transaction datasets."
  },
  {
    id: "NTF-902",
    title: "Critical Security Alert",
    description: "Rate limit threshold exceeded (84 consecutive rejected login credentials tokens). Threat blocked.",
    category: "Security Incident",
    priority: "Critical",
    module: "Security Gateway",
    timestamp: "2026-07-14 19:42:10",
    timeLabel: "Today",
    relatedResource: "IP: 198.51.100.42",
    relatedUser: "Anonymous Client",
    relatedOrg: "Unverified Entity (Proxy)",
    relatedModel: "N/A",
    status: "Unread",
    pinned: false,
    archived: false,
    assignedAdmin: "Marcus Vance (SecOps)",
    timeline: [
      "[19:40:00] First threshold failure flagged.",
      "[19:42:10] IP 198.51.100.42 blacklisted for 24 hours."
    ],
    recommendedAction: "Review proxy ranges and update active whitelist routing block rules."
  },
  {
    id: "NTF-903",
    title: "Failed Login Threshold Reached",
    description: "IP address 192.168.1.104 blocked following 5 consecutive MFA code failures.",
    category: "Security Incident",
    priority: "High",
    module: "Authentication Service",
    timestamp: "2026-07-14 19:25:00",
    timeLabel: "Today",
    relatedResource: "User: officer-vance",
    relatedUser: "Marcus Vance",
    relatedOrg: "SecOps Mumbai",
    relatedModel: "N/A",
    status: "Unread",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[19:20:00] User MFA challenges initiated.",
      "[19:25:00] Account lock active. Session expired."
    ],
    recommendedAction: "Contact Marcus Vance to re-verify credentials and execute warm lock flush."
  },
  {
    id: "NTF-904",
    title: "High API Latency",
    description: "Reports API p95 response time rose to 4.8s (exceeded warning limit threshold 2.0s).",
    category: "Platform Alert",
    priority: "Warning",
    module: "API Operations",
    timestamp: "2026-07-14 18:12:05",
    timeLabel: "Today",
    relatedResource: "Route: /reports/generate",
    relatedUser: "Reports Service Daemon",
    relatedOrg: "Internal Analytics Group",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: "Sarah Jenkins (Platform)",
    timeline: [
      "[18:10:00] Latency peak logs detected.",
      "[18:12:05] Diagnostic ticket generated."
    ],
    recommendedAction: "Check active postgres queries logs index and clear heap buffers."
  },
  {
    id: "NTF-905",
    title: "New Organization Registered",
    description: "Indo-FinCorp Solutions successfully validated. Merchant portal active.",
    category: "Operational Update",
    priority: "Success",
    module: "Orgs Onboarding",
    timestamp: "2026-07-14 15:30:12",
    timeLabel: "Today",
    relatedResource: "ID: org-indofin-2026",
    relatedUser: "Director Rohit Sen",
    relatedOrg: "Indo-FinCorp Solutions",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[15:10:00] KYB document checklist uploaded.",
      "[15:30:12] Approval generated by Internal Compliance."
    ],
    recommendedAction: "Review initial sandbox transaction quota configuration parameters."
  },
  {
    id: "NTF-906",
    title: "Database Backup Completed",
    description: "Daily automated database snapshot snapshot_base_v24 complete (14.2 GB compiled).",
    category: "Infrastructure Event",
    priority: "Success",
    module: "System Telemetry",
    timestamp: "2026-07-14 00:00:15",
    timeLabel: "Today",
    relatedResource: "Bucket: arthdrishti-backups",
    relatedUser: "System Cron Service",
    relatedOrg: "System Operations",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: true,
    assignedAdmin: null,
    timeline: [
      "[00:00:00] Postgres pg_dump command initiated.",
      "[00:00:15] Upload confirmation returned by AWS S3."
    ],
    recommendedAction: "Validate checksum logs parity to confirm snapshot index integrity."
  },
  {
    id: "NTF-907",
    title: "New User Invitation Accepted",
    description: "Invitation for Compliance Auditor Roy accepted. Role: Loan Officer.",
    category: "Operational Update",
    priority: "Information",
    module: "User Management",
    timestamp: "2026-07-13 16:45:00",
    timeLabel: "Yesterday",
    relatedResource: "User: usr-auditor-roy",
    relatedUser: "Auditor Roy",
    relatedOrg: "ArthDrishti Commercial Audit",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[16:40:00] Email credentials link accepted.",
      "[16:45:00] Key rings active. Session initialized."
    ],
    recommendedAction: "Assign audit logs inspection checklists to user workspace."
  },
  {
    id: "NTF-908",
    title: "Prediction Engine Restarted",
    description: "Docker service 'ai-prediction-worker' restarted following memory spike warning alerts.",
    category: "Infrastructure Event",
    priority: "Warning",
    module: "Queue Management",
    timestamp: "2026-07-13 14:20:00",
    timeLabel: "Yesterday",
    relatedResource: "Host: worker-node-5",
    relatedUser: "System Orchestrator Daemon",
    relatedOrg: "Infrastructure Ops",
    relatedModel: "mod-ensemble-risk",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: "Sarah Jenkins (Platform)",
    timeline: [
      "[14:19:00] Out of memory (OOM) alarm flagged.",
      "[14:20:00] Node reboot complete. Thread pools listening."
    ],
    recommendedAction: "Optimize models weights garbage collectors to avoid memory accumulation."
  },
  {
    id: "NTF-909",
    title: "Storage Warning",
    description: "onboarding storage disk capacity has crossed 88% limits (S3 bucket capacity: 5TB).",
    category: "Infrastructure Event",
    priority: "Warning",
    module: "Storage Infra",
    timestamp: "2026-07-12 11:30:00",
    timeLabel: "This Week",
    relatedResource: "Bucket: onboard-kyc-files",
    relatedUser: "Infra Daemon",
    relatedOrg: "System Operations",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[11:30:00] Warning alarm triggered by S3 bucket metrics."
    ],
    recommendedAction: "Clear old temporary logs folders and verify active storage lifecycle policies."
  },
  {
    id: "NTF-910",
    title: "Queue Length Increased",
    description: "AI Prediction Queue backlogged with 8 pending jobs (avg wait time: 154s).",
    category: "Infrastructure Event",
    priority: "Warning",
    module: "Runner Queue",
    timestamp: "2026-07-12 10:12:00",
    timeLabel: "This Week",
    relatedResource: "Queue: ai-predict-queue",
    relatedUser: "Cron Daemon",
    relatedOrg: "ML Operations",
    relatedModel: "mod-ensemble-risk",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[10:10:00] Queue backlogs limit exceeded."
    ],
    recommendedAction: "Spin up secondary docker thread workers: ml-worker-4."
  },
  {
    id: "NTF-911",
    title: "Model Successfully Deployed",
    description: "Credit scoring model canary mod-2 promoted to production active splits (canary split: 10%).",
    category: "AI Notification",
    priority: "Success",
    module: "AI Deployer",
    timestamp: "2026-07-11 14:10:00",
    timeLabel: "This Week",
    relatedResource: "Model: mod-scoring-canary",
    relatedUser: "ML Platform Devs",
    relatedOrg: "ML Ops Core Team",
    relatedModel: "mod-scoring-canary v1.2",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[14:00:00] Compilation check success.",
      "[14:10:00] Deploy complete. Traffic split active."
    ],
    recommendedAction: "Monitor error spikes on edge prediction routes during next 12 hours."
  },
  {
    id: "NTF-912",
    title: "Canary System Maintenance Scheduled",
    description: "Core PostgreSQL master clusters scheduled for indexing operations on July 16, 02:00 IST.",
    category: "Platform Alert",
    priority: "Information",
    module: "Platform Config",
    timestamp: "2026-07-10 16:45:00",
    timeLabel: "Earlier",
    relatedResource: "Database: pg-master-cluster",
    relatedUser: "System Architect",
    relatedOrg: "System Operations",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[16:40:00] Maintenance ticket authorized."
    ],
    recommendedAction: "Notify partners regarding 10-minute read-only window during index updates."
  },
  {
    id: "NTF-913",
    title: "Subscription Expiring",
    description: "Sandbox credit scoring SMS gateway subscription will expire in 3 days.",
    category: "Operational Update",
    priority: "High",
    module: "API Subscriptions",
    timestamp: "2026-07-09 11:22:15",
    timeLabel: "Earlier",
    relatedResource: "Provider: Twilio Gateway",
    relatedUser: "Finance Auditor",
    relatedOrg: "Treasury Operations",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[11:20:00] Subscription limits alarm flagged."
    ],
    recommendedAction: "Re-authorize transaction card details to activate subscription rollover."
  },
  {
    id: "NTF-914",
    title: "Background Job Failed",
    description: "KYC Documents processing job JOB-403 aborted (DNS resolution failed to storage node).",
    category: "Infrastructure Event",
    priority: "High",
    module: "Background Runner",
    timestamp: "2026-07-08 19:12:05",
    timeLabel: "Earlier",
    relatedResource: "Job: JOB-403-kyc",
    relatedUser: "Onboarding App Client",
    relatedOrg: "Onboarding Retail Group",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: null,
    timeline: [
      "[19:12:00] Ingest initiated.",
      "[19:12:05] FATAL: Storage endpoint connection refused."
    ],
    recommendedAction: "Verify storage server gateway DNS resolving configs and restart worker threads."
  },
  {
    id: "NTF-915",
    title: "Audit Export Completed",
    description: "Signed regulatory audit CSV report compiled. Ready for download (1.4M records).",
    category: "Operational Update",
    priority: "Success",
    module: "Audit Exporter",
    timestamp: "2026-07-07 15:30:00",
    timeLabel: "Earlier",
    relatedResource: "Report: compliance-q2-ledger",
    relatedUser: "Auditor Roy",
    relatedOrg: "ArthDrishti Commercial Audit",
    relatedModel: "N/A",
    status: "Read",
    pinned: false,
    archived: false,
    assignedAdmin: "Auditor Roy (Compliance)",
    timeline: [
      "[15:00:00] Cryptographic build started.",
      "[15:30:00] Export output finalized."
    ],
    recommendedAction: "Download and transmit file to RBI regulatory deposit portal via mTLS."
  }
];

export const NOTIFICATION_KPIS: KPIStatsItem[] = [
  { title: "Total Notifications", value: "24,842", trend: 8.5, sparkline: [22100, 22400, 23100, 23800, 24200, 24842], icon: "Layers", status: "info", description: "All recorded ledger entries" },
  { title: "Unread Notifications", value: "3", trend: -50.0, sparkline: [6, 5, 4, 4, 3, 3], icon: "Bell", status: "warning", description: "Requires administrator attention" },
  { title: "Critical Alerts", value: "2", trend: 100.0, sparkline: [1, 1, 1, 1, 2, 2], icon: "ShieldAlert", status: "destructive", description: "Critical security/drift issues" },
  { title: "Warnings", value: "4", trend: 33.3, sparkline: [3, 3, 4, 3, 3, 4], icon: "AlertTriangle", status: "warning", description: "Warning status alarms" },
  { title: "Resolved Alerts", value: "154", trend: 12.4, sparkline: [135, 140, 142, 148, 150, 154], icon: "CheckCircle2", status: "success", description: "Alarms marked resolved" },
  { title: "Today's Notifications", value: "6", trend: 20.0, sparkline: [5, 5, 4, 6, 5, 6], icon: "TrendingUp", status: "info", description: "Captured on July 14" },
  { title: "High Priority", value: "3", trend: 0.0, sparkline: [3, 3, 3, 3, 3, 3], icon: "ShieldAlert", status: "destructive", description: "High severity operations logs" },
  { title: "System Messages", value: "1,450", trend: 5.2, sparkline: [1380, 1390, 1400, 1420, 1440, 1450], icon: "Server", status: "info", description: "Platform maintenance messages" }
];

export const NOTIFICATIONS_BY_TYPE_DATA: TypeDistributionPoint[] = [
  { name: "Platform Alert", value: 3 },
  { name: "AI Notification", value: 3 },
  { name: "Infrastructure Event", value: 4 },
  { name: "Security Incident", value: 2 },
  { name: "Operational Update", value: 3 }
];

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

export const PRIORITY_DISTRIBUTION_DATA: PriorityDistributionPoint[] = [
  { name: "Critical", value: 2, fill: COLORS.critical },
  { name: "High", value: 3, fill: COLORS.warning },
  { name: "Warning", value: 4, fill: COLORS.warning },
  { name: "Success", value: 5, fill: COLORS.positive },
  { name: "Information", value: 1, fill: COLORS.primary }
];

export const ALERTS_TREND_WEEKLY: AlertsTrendPoint[] = [
  { time: "Mon", count: 12, resolved: 10 },
  { time: "Tue", count: 15, resolved: 14 },
  { time: "Wed", count: 8, resolved: 8 },
  { time: "Thu", count: 18, resolved: 15 },
  { time: "Fri", count: 24, resolved: 20 },
  { time: "Sat", count: 5, resolved: 5 },
  { time: "Sun", count: 6, resolved: 6 }
];
export const ALERTS_TREND_DAILY: AlertsTrendPoint[] = [
  { time: "00:00", count: 1, resolved: 1 },
  { time: "04:00", count: 0, resolved: 0 },
  { time: "08:00", count: 2, resolved: 2 },
  { time: "12:00", count: 5, resolved: 4 },
  { time: "16:00", count: 8, resolved: 6 },
  { time: "20:00", count: 6, resolved: 3 }
];
