// Compliance Audit Logs Operations Center Mock Telemetry & Schemas

export type AuditActionType =
  | "Login"
  | "Logout"
  | "Create"
  | "Update"
  | "Delete"
  | "Approve"
  | "Reject"
  | "Export"
  | "Import"
  | "Deploy"
  | "Rollback"
  | "Configuration Change"
  | "Security Event";

export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";
export type AuditStatus = "Success" | "Failed" | "Suspended";

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  organization: string;
  action: AuditActionType;
  module: string;
  entity: string;
  ip: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  severity: SeverityLevel;
  status: AuditStatus;
  duration: number; // in ms
  requestId: string;
  correlationId: string;
  previousValue: string | null;
  newValue: string | null;
  details: string;
  complianceChecked: boolean;
  payload: Record<string, unknown>;
  relatedEvents: string[];
}

export interface SecurityEventCard {
  title: string;
  count: number;
  trend: number;
  status: "success" | "warning" | "destructive" | "info";
  description: string;
}

export interface ComplianceScoreCard {
  title: string;
  value: string | number;
  status: "success" | "warning" | "destructive" | "info" | "default";
  description: string;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  timestamp: string;
  type: "Info" | "Success" | "Warning" | "Critical";
  message: string;
}

export interface AuditKPICard {
  title: string;
  value: string | number;
  trend: number;
  sparkline: number[];
  icon: string;
  status: "success" | "warning" | "destructive" | "info" | "default";
  description: string;
}

export interface AuditTelemetryDB {
  kpis: AuditKPICard[];
  securityCards: SecurityEventCard[];
  complianceCards: ComplianceScoreCard[];
  timeline: TimelineMilestone[];
  retentionPolicies: { label: string; duration: string; status: string }[];
}

export const AUDIT_LOGS_REGISTRY: AuditLogRecord[] = [
  {
    id: "AUD-801",
    timestamp: "2026-07-14 20:15:30",
    actor: "Marcus Vance",
    role: "Loan Officer",
    organization: "ArthDrishti Retail India",
    action: "Approve",
    module: "Underwriting",
    entity: "Applicant ap-812",
    ip: "192.168.12.82",
    device: "Workstation (Windows)",
    browser: "Chrome v124.0.0",
    os: "Windows 11 Enterprise",
    location: "Mumbai, MH, India",
    severity: "High",
    status: "Success",
    duration: 184,
    requestId: "req-auth-92384-xyz",
    correlationId: "corr-underwriting-812",
    previousValue: '{"status": "PENDING_AUDIT", "score": 680}',
    newValue: '{"status": "APPROVED", "bypass_flags": ["HIGH_LIQUIDITY_BUFFER"]}',
    details: "Approved loan application ap-812 manually overriding default algorithmic warnings.",
    complianceChecked: true,
    payload: {
      approved_amount: 2500000,
      risk_score_baseline: 680,
      override_reason: "High corporate liquidity deposits verified on secondary cash books."
    },
    relatedEvents: ["AUD-795", "AUD-798"]
  },
  {
    id: "AUD-802",
    timestamp: "2026-07-14 20:00:12",
    actor: "System Scheduler",
    role: "System Scheduler",
    organization: "ArthDrishti Core Platform",
    action: "Deploy",
    module: "AI Model Registry",
    entity: "Ensemble predictor mod-1",
    ip: "127.0.0.1",
    device: "Docker Worker Node 3",
    browser: "ArthDrishti-Daemon/v1.0",
    os: "Linux Kernel 6.1.0-amd64",
    location: "AWS ap-south-1a",
    severity: "Medium",
    status: "Success",
    duration: 1450,
    requestId: "req-cron-40293-ml",
    correlationId: "corr-model-deploy-ensemble",
    previousValue: '{"active_model": "mod-0-baseline"}',
    newValue: '{"active_model": "mod-1-ensemble", "psi_index": 0.08}',
    details: "Automated model retraining scheduler executed. Promoted ensemble weights to active routing.",
    complianceChecked: true,
    payload: {
      epochs: 50,
      val_loss: 0.042,
      accuracy: 0.958,
      psi_metric: 0.08
    },
    relatedEvents: ["AUD-784"]
  },
  {
    id: "AUD-803",
    timestamp: "2026-07-14 19:12:05",
    actor: "Platform Admin",
    role: "Administrator",
    organization: "ArthDrishti Security Ops",
    action: "Configuration Change",
    module: "API Gateway",
    entity: "S3 Documents Bucket",
    ip: "10.0.4.15",
    device: "Admin Console Macbook",
    browser: "Safari v17.4.1",
    os: "macOS Sonoma 14.4",
    location: "Bengaluru, KA, India",
    severity: "Critical",
    status: "Failed",
    duration: 85,
    requestId: "req-config-19283-cf",
    correlationId: "corr-s3-connectivity-fail",
    previousValue: '{"s3_endpoint": "s3.ap-south-1.amazonaws.com"}',
    newValue: '{"s3_endpoint": "s3.internal.gateway.arthdrishti.co"}',
    details: "Attempted to adjust file upload paths to S3 storage bucket. Connections refused.",
    complianceChecked: false,
    payload: {
      target_endpoint: "s3.internal.gateway.arthdrishti.co",
      tls_enforcement: "mTLS",
      error_code: "DNS_RESOLUTION_TIMEOUT"
    },
    relatedEvents: ["AUD-800"]
  },
  {
    id: "AUD-804",
    timestamp: "2026-07-14 19:05:00",
    actor: "Intruder Scan API",
    role: "Customer",
    organization: "Unknown (VPN Access)",
    action: "Security Event",
    module: "Security",
    entity: "Database pg-master-db",
    ip: "198.51.100.42",
    device: "Unidentified Linux Client",
    browser: "cURL v7.81.0",
    os: "Linux Alpine v3.15",
    location: "Frankfurt, DE, Germany (Proxy)",
    severity: "Critical",
    status: "Suspended",
    duration: 8,
    requestId: "req-auth-99201-sec",
    correlationId: "corr-unauthorized-db-access",
    previousValue: null,
    newValue: null,
    details: "Rejected token validation. Invalid cryptographic key signatures.",
    complianceChecked: false,
    payload: {
      auth_mechanism: "Bearer JWT",
      error_code: "JWT_SIGNATURE_EXPIRED",
      access_route: "/api/v1/admin/settings"
    },
    relatedEvents: []
  },
  {
    id: "AUD-805",
    timestamp: "2026-07-14 18:22:15",
    actor: "Sarah Jenkins",
    role: "Customer",
    organization: "Corporate Accounts Retail",
    action: "Login",
    module: "Authentication",
    entity: "User Session sarah-j",
    ip: "184.22.45.10",
    device: "Office PC (Windows)",
    browser: "Edge v123.0.0",
    os: "Windows 10 Pro",
    location: "Delhi, DL, India",
    severity: "Low",
    status: "Success",
    duration: 42,
    requestId: "req-session-30219-lk",
    correlationId: "corr-login-sarah-jenkins",
    previousValue: '{"session": "inactive"}',
    newValue: '{"session": "active_24h"}',
    details: "User authenticated successfully. MFA validated via hardware token key.",
    complianceChecked: true,
    payload: {
      mfa_method: "FIDO2_WEBAUTHN",
      session_ttl: 86400
    },
    relatedEvents: []
  },
  {
    id: "AUD-806",
    timestamp: "2026-07-14 17:45:00",
    actor: "Platform Admin",
    role: "Administrator",
    organization: "ArthDrishti Security Ops",
    action: "Configuration Change",
    module: "Security Settings",
    entity: "Global Rate Limit Rules",
    ip: "10.0.4.15",
    device: "Admin Console Macbook",
    browser: "Safari v17.4.1",
    os: "macOS Sonoma 14.4",
    location: "Bengaluru, KA, India",
    severity: "High",
    status: "Success",
    duration: 124,
    requestId: "req-security-40291-rt",
    correlationId: "corr-ratelimit-adjust",
    previousValue: '{"rate_limit": 100}',
    newValue: '{"rate_limit": 250}',
    details: "Adjusted global edge gateway limits threshold from 100 req/sec to 250 req/sec.",
    complianceChecked: true,
    payload: {
      previous_rate_limit: 100,
      new_rate_limit: 250,
      enforcement_strategy: "redis_token_bucket"
    },
    relatedEvents: []
  },
  {
    id: "AUD-807",
    timestamp: "2026-07-14 16:12:41",
    actor: "Loan Auditor",
    role: "Loan Officer",
    organization: "ArthDrishti Commercial Audit",
    action: "Export",
    module: "Reports BI",
    entity: "Treasury Balance Sheets",
    ip: "192.168.12.98",
    device: "Workstation (Windows)",
    browser: "Chrome v124.0.0",
    os: "Windows 11 Enterprise",
    location: "Mumbai, MH, India",
    severity: "High",
    status: "Success",
    duration: 4800,
    requestId: "req-reports-90184-xp",
    correlationId: "corr-audit-balance-sheets",
    previousValue: null,
    newValue: null,
    details: "Generated signed treasury transaction files report.",
    complianceChecked: true,
    payload: {
      file_format: "XLSX",
      records_exported: 14500,
      regulatory_flag: "RBI_COMPLIANCE_2026"
    },
    relatedEvents: []
  },
  {
    id: "AUD-808",
    timestamp: "2026-07-14 15:30:12",
    actor: "Platform Admin",
    role: "Administrator",
    organization: "ArthDrishti Security Ops",
    action: "Delete",
    module: "User Management",
    entity: "User Account test-officer-3",
    ip: "10.0.4.15",
    device: "Admin Console Macbook",
    browser: "Safari v17.4.1",
    os: "macOS Sonoma 14.4",
    location: "Bengaluru, KA, India",
    severity: "Medium",
    status: "Success",
    duration: 54,
    requestId: "req-user-30291-dl",
    correlationId: "corr-delete-test-account",
    previousValue: '{"username": "test-officer-3", "status": "ACTIVE"}',
    newValue: null,
    details: "Deleted temporary testing credentials account.",
    complianceChecked: true,
    payload: {
      target_account_id: "usr-928",
      triggered_by: "platform_cleanup_job"
    },
    relatedEvents: []
  },
  {
    id: "AUD-809",
    timestamp: "2026-07-14 14:15:00",
    actor: "Sarah Jenkins",
    role: "Customer",
    organization: "Corporate Accounts Retail",
    action: "Logout",
    module: "Authentication",
    entity: "User Session sarah-j",
    ip: "184.22.45.10",
    device: "Office PC (Windows)",
    browser: "Edge v123.0.0",
    os: "Windows 10 Pro",
    location: "Delhi, DL, India",
    severity: "Low",
    status: "Success",
    duration: 12,
    requestId: "req-session-30245-lo",
    correlationId: "corr-logout-sarah-jenkins",
    previousValue: '{"session": "active"}',
    newValue: '{"session": "destroyed"}',
    details: "User logged out successfully. Active token revoked in Redis cache.",
    complianceChecked: true,
    payload: {
      revocation_reason: "user_triggered"
    },
    relatedEvents: []
  },
  {
    id: "AUD-810",
    timestamp: "2026-07-14 13:00:00",
    actor: "Intruder Scan API",
    role: "Customer",
    organization: "Unknown (VPN Access)",
    action: "Security Event",
    module: "Security",
    entity: "API Endpoint /api/v1/admin/settings",
    ip: "198.51.100.42",
    device: "Unidentified Linux Client",
    browser: "cURL v7.81.0",
    os: "Linux Alpine v3.15",
    location: "Frankfurt, DE, Germany (Proxy)",
    severity: "Critical",
    status: "Failed",
    duration: 5,
    requestId: "req-auth-99182-sec",
    correlationId: "corr-unauthorized-db-access",
    previousValue: null,
    newValue: null,
    details: "MFA challenge failed. Session access parameters rejected.",
    complianceChecked: false,
    payload: {
      auth_error: "MFA_CODE_INVALID",
      failure_count: 3
    },
    relatedEvents: ["AUD-804"]
  }
];

export const AUDIT_TELEMETRY_DB: AuditTelemetryDB = {
  kpis: [
    { title: "Total Audit Events", value: "24,842", trend: 8.5, sparkline: [22100, 22400, 23100, 23800, 24200, 24842], icon: "Layers", status: "info", description: "Archived ledger entries" },
    { title: "Today's Events", value: "1,450", trend: 12.2, sparkline: [1200, 1250, 1340, 1400, 1420, 1450], icon: "TrendingUp", status: "info", description: "Audit items captured today" },
    { title: "Security Events", value: "24", trend: -20.0, sparkline: [32, 30, 28, 26, 25, 24], icon: "ShieldAlert", status: "destructive", description: "Threat logs generated" },
    { title: "Administrative Actions", value: "482", trend: 1.5, sparkline: [468, 470, 475, 478, 480, 482], icon: "Settings", status: "info", description: "Configs changes compiled" },
    { title: "System Events", value: "12,482", trend: 4.8, sparkline: [11800, 12000, 12150, 12300, 12400, 12482], icon: "Server", status: "info", description: "Docker logs synced" },
    { title: "AI Model Events", value: "184", trend: 11.2, sparkline: [162, 168, 172, 175, 180, 184], icon: "Cpu", status: "info", description: "MLOps retraining dispatches" },
    { title: "Failed Actions", value: "142", trend: -12.5, sparkline: [168, 160, 154, 150, 145, 142], icon: "AlertTriangle", status: "warning", description: "Unsuccessful operations logs" },
    { title: "Critical Events", value: "12", trend: 0.0, sparkline: [12, 12, 12, 12, 12, 12], icon: "ShieldAlert", status: "destructive", description: "Incidents requiring audits" }
  ],
  securityCards: [
    { title: "Failed Login Attempts", count: 82, trend: 12.4, status: "warning", description: "Mismatched session attempts logged on login gateways." },
    { title: "Unauthorized Access", count: 14, trend: -30.0, status: "destructive", description: "Blocked requests targeting internal admin directories." },
    { title: "Permission Violations", count: 8, trend: 0.0, status: "warning", description: "Users attempting access scopes above active role credentials." },
    { title: "MFA Failures", count: 32, trend: 18.5, status: "warning", description: "Hardware keys/auth codes rejected during logins." },
    { title: "Suspicious Activity", count: 4, trend: -50.0, status: "destructive", description: "API rate spikes originating from blacklisted VPN proxies." }
  ],
  complianceCards: [
    { title: "Audit Coverage", value: "100.0%", status: "success", description: "All active gateway routes mapped to audit registers." },
    { title: "Retention Policy", value: "180 Days", status: "info", description: "Configured logs lifetime prior to cold bucket archivers." },
    { title: "Export Status", value: "Idle", status: "default", description: "No active compliance download streams currently." },
    { title: "Archived Logs", value: "48.2 GB", status: "info", description: "Cumulative size of compressed log history." },
    { title: "Integrity Status", value: "Verified", status: "success", description: "Database SHA-256 block hash checks verified." },
    { title: "Compliance Score", value: "99.85%", status: "success", description: "Overall regulatory governance compliance grade." }
  ],
  timeline: [
    { id: "TL-01", title: "Login Session", timestamp: "20:22:15", type: "Success", message: "Platform Administrator logged in from verified location." },
    { id: "TL-02", title: "Permission Updated", timestamp: "18:45:00", type: "Info", message: "Role 'Loan Officer' updated to include overrides." },
    { id: "TL-03", title: "User Created", timestamp: "17:30:12", type: "Success", message: "Account generated for customer Jenkins." },
    { id: "TL-04", title: "Role Assigned", timestamp: "15:00:00", type: "Info", message: "Underwriting validation role assigned to Marcus Vance." },
    { id: "TL-05", title: "Model Deployed", timestamp: "14:15:30", type: "Success", message: "ML Ensemble v2.5.0 promoted to staging registry." },
    { id: "TL-06", title: "API Failure", timestamp: "11:12:05", type: "Critical", message: "Document Upload API S3 connection timeout logged." },
    { id: "TL-07", title: "Configuration Updated", timestamp: "09:42:00", type: "Warning", message: "Global rate limits threshold increased to 250 req/sec." },
    { id: "TL-08", title: "Backup Completed", timestamp: "00:00:15", type: "Success", message: "Postgres database snapshots archived successfully." }
  ],
  retentionPolicies: [
    { label: "Standard Hot Storage", duration: "30 Days", status: "Active" },
    { label: "Compliance Intermediate Cache", duration: "90 Days", status: "Active" },
    { label: "Governance Primary Storage", duration: "180 Days", status: "Active" },
    { label: "Archive Cold Bucket Storage", duration: "1 Year", status: "Active" }
  ]
};
