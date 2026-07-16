// API Operations Center Monitoring Mock Dataset & Types

export type APIStatus = "Healthy" | "Warning" | "Degraded" | "Maintenance" | "Offline";

export interface APIDirectoryItem {
  id: string;
  name: string;
  category: "Security" | "Customer" | "Officer" | "Admin" | "AI Inference" | "Platform";
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  version: string;
  status: APIStatus;
  latency: number; // in ms
  availability: number; // in %
  requests: number;
  errors: number;
  owner: string;
  lastUpdated: string;
  description: string;
  environment: "Production" | "Staging" | "Sandbox";
  authentication: "OAuth2 / JWT" | "API Key" | "None" | "mTLS";
  peakTraffic: number; // requests/sec
}

export const API_DIRECTORY_DATA: APIDirectoryItem[] = [
  {
    id: "api-auth",
    name: "Authentication API",
    category: "Security",
    method: "POST",
    endpoint: "/api/v1/auth/login",
    version: "v2.0.4",
    status: "Healthy",
    latency: 18,
    availability: 100.00,
    requests: 284300,
    errors: 42,
    owner: "Security Ops",
    lastUpdated: "2026-07-14 19:45",
    description: "Handles JWT generation, session validations, and multi-factor logins.",
    environment: "Production",
    authentication: "None",
    peakTraffic: 154
  },
  {
    id: "api-customer",
    name: "Customer API",
    category: "Customer",
    method: "GET",
    endpoint: "/api/v1/customer/profile",
    version: "v1.8.0",
    status: "Healthy",
    latency: 24,
    availability: 99.98,
    requests: 412000,
    errors: 184,
    owner: "Retail Banking team",
    lastUpdated: "2026-07-14 18:30",
    description: "Serves client demographics, account details, and balance summaries.",
    environment: "Production",
    authentication: "OAuth2 / JWT",
    peakTraffic: 240
  },
  {
    id: "api-officer",
    name: "Officer API",
    category: "Officer",
    method: "POST",
    endpoint: "/api/v1/officer/decision",
    version: "v3.1.2",
    status: "Warning",
    latency: 84,
    availability: 99.85,
    requests: 98000,
    errors: 320,
    owner: "Underwriting systems",
    lastUpdated: "2026-07-14 19:58",
    description: "Processes loan application decisions, officer notes, and overrides.",
    environment: "Production",
    authentication: "OAuth2 / JWT",
    peakTraffic: 82
  },
  {
    id: "api-admin",
    name: "Admin API",
    category: "Admin",
    method: "PUT",
    endpoint: "/api/v1/admin/settings",
    version: "v1.2.0",
    status: "Healthy",
    latency: 15,
    availability: 100.00,
    requests: 12400,
    errors: 12,
    owner: "Internal Tools Team",
    lastUpdated: "2026-07-14 14:20",
    description: "Manages system settings, feature flags, and org configurations.",
    environment: "Production",
    authentication: "mTLS",
    peakTraffic: 14
  },
  {
    id: "api-prediction",
    name: "Prediction API",
    category: "AI Inference",
    method: "POST",
    endpoint: "/api/v1/predict/credit",
    version: "v2.5.0",
    status: "Degraded",
    latency: 245,
    availability: 99.42,
    requests: 312000,
    errors: 1840,
    owner: "ML Platform Devs",
    lastUpdated: "2026-07-14 20:02",
    description: "Evaluates credit score values using underwriting ensemble model weights.",
    environment: "Production",
    authentication: "API Key",
    peakTraffic: 310
  },
  {
    id: "api-fraud",
    name: "Fraud API",
    category: "AI Inference",
    method: "POST",
    endpoint: "/api/v1/predict/fraud",
    version: "v4.1.0",
    status: "Healthy",
    latency: 12,
    availability: 99.99,
    requests: 520000,
    errors: 95,
    owner: "Risk Dev Group",
    lastUpdated: "2026-07-14 20:00",
    description: "Evaluates real-time transaction streams for card-testing or velocity fraud.",
    environment: "Production",
    authentication: "API Key",
    peakTraffic: 480
  },
  {
    id: "api-credit",
    name: "Credit API",
    category: "Platform",
    method: "GET",
    endpoint: "/api/v1/credit/portfolio",
    version: "v1.4.1",
    status: "Healthy",
    latency: 32,
    availability: 99.95,
    requests: 145000,
    errors: 88,
    owner: "Commercial Credit",
    lastUpdated: "2026-07-14 17:15",
    description: "Exposes corporate portfolio aggregation tables and risk summaries.",
    environment: "Production",
    authentication: "OAuth2 / JWT",
    peakTraffic: 94
  },
  {
    id: "api-reports",
    name: "Reports API",
    category: "Platform",
    method: "POST",
    endpoint: "/api/v1/reports/generate",
    version: "v2.1.0",
    status: "Maintenance",
    latency: 480,
    availability: 95.00,
    requests: 14500,
    errors: 650,
    owner: "Business Intelligence",
    lastUpdated: "2026-07-14 12:00",
    description: "Compiles large treasury CSV summaries and regulatory PDF folders.",
    environment: "Production",
    authentication: "OAuth2 / JWT",
    peakTraffic: 15
  },
  {
    id: "api-notification",
    name: "Notification API",
    category: "Platform",
    method: "POST",
    endpoint: "/api/v1/notify/send",
    version: "v1.0.5",
    status: "Healthy",
    latency: 22,
    availability: 99.97,
    requests: 840000,
    errors: 210,
    owner: "Communication Hub",
    lastUpdated: "2026-07-14 20:05",
    description: "Dispatches SMS, Slack notifications, email updates, and push packets.",
    environment: "Production",
    authentication: "API Key",
    peakTraffic: 620
  },
  {
    id: "api-document",
    name: "Document API",
    category: "Platform",
    method: "POST",
    endpoint: "/api/v1/document/upload",
    version: "v2.2.0",
    status: "Offline",
    latency: 0,
    availability: 0.00,
    requests: 45000,
    errors: 45000,
    owner: "Storage Infra Group",
    lastUpdated: "2026-07-14 19:12",
    description: "Handles S3 file ingestion, PDF parsing, OCR scanners, and KYC archives.",
    environment: "Production",
    authentication: "OAuth2 / JWT",
    peakTraffic: 42
  }
];

export interface KPICardData {
  title: string;
  value: string | number;
  trend: number;
  sparkline: number[];
  icon: string;
  status: "success" | "warning" | "destructive" | "info" | "default";
  description: string;
}

export interface APIOverviewPoint {
  time: string;
  requests: number;
  latency: number;
  availability: number;
  errorRate: number;
}

export interface MetricEndpoint {
  path: string;
  value: string | number;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  detail: string;
}

export interface ErrorBreakdown {
  name: string;
  count: number;
  fill: string;
}

export interface RealTimeRequest {
  timestamp: string;
  api: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  status: number;
  latency: number;
  client: string;
}

export interface StickyAlert {
  id: string;
  title: string;
  severity: "Critical" | "Warning" | "Info";
  timestamp: string;
  message: string;
}

export interface DependencyLink {
  source: string;
  target: string;
  type: "async" | "sync" | "event";
  status: "operational" | "slow" | "broken";
}

export interface APIMonitoringData {
  kpis: KPICardData[];
  overview: Record<string, APIOverviewPoint[]>; // keys: Today, 7 Days, 30 Days, 90 Days, 1 Year
  slowestEndpoints: MetricEndpoint[];
  highestErrorEndpoints: MetricEndpoint[];
  mostCalledEndpoints: MetricEndpoint[];
  leastUsedEndpoints: MetricEndpoint[];
  requestsByMethod: { name: string; value: number }[];
  errorsBreakdown: ErrorBreakdown[];
  rateLimiting: {
    currentLimit: number;
    peakUsage: number;
    blockedRequests: number;
    quotaRemaining: number;
  };
  realTimeFeed: RealTimeRequest[];
  alerts: StickyAlert[];
  dependencies: DependencyLink[];
}

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

export const API_MONITORING_DB: APIMonitoringData = {
  kpis: [
    { title: "Total APIs", value: 10, trend: 11.1, sparkline: [9, 9, 9, 9, 9, 10], icon: "Layers", status: "info", description: "Configured route endpoints" },
    { title: "Healthy APIs", value: 7, trend: 0.0, sparkline: [8, 8, 7, 7, 7, 7], icon: "CheckCircle", status: "success", description: "Uptime > 99.9% currently" },
    { title: "Failed APIs", value: 2, trend: 100.0, sparkline: [1, 1, 1, 1, 2, 2], icon: "AlertTriangle", status: "destructive", description: "Degraded or offline endpoints" },
    { title: "Avg Response Time", value: "98ms", trend: 14.2, sparkline: [82, 85, 91, 102, 94, 98], icon: "Activity", status: "warning", description: "Average latency across registry" },
    { title: "Availability", value: "97.82%", trend: -1.4, sparkline: [99.5, 99.2, 99.0, 98.4, 98.1, 97.82], icon: "Sliders", status: "warning", description: "Global service uptime index" },
    { title: "Requests Today", value: "2.71M", trend: 8.5, sparkline: [2.3, 2.4, 2.5, 2.6, 2.65, 2.71], icon: "TrendingUp", status: "info", description: "API transactions compiled" },
    { title: "Error Rate", value: "1.92%", trend: 150.0, sparkline: [0.65, 0.72, 0.98, 1.45, 1.84, 1.92], icon: "ShieldAlert", status: "destructive", description: "HTTP 4xx & 5xx error percentage" },
    { title: "Success Rate", value: "98.08%", trend: -1.8, sparkline: [99.35, 99.28, 99.02, 98.55, 98.16, 98.08], icon: "CheckCircle2", status: "success", description: "HTTP 2xx & 3xx status codes" }
  ],
  overview: {
    "Today": [
      { time: "00:00", requests: 84000, latency: 68, availability: 99.98, errorRate: 0.22 },
      { time: "04:00", requests: 75000, latency: 62, availability: 99.97, errorRate: 0.18 },
      { time: "08:00", requests: 125000, latency: 98, availability: 99.85, errorRate: 0.75 },
      { time: "12:00", requests: 245000, latency: 145, availability: 99.12, errorRate: 1.42 },
      { time: "16:00", requests: 284000, latency: 154, availability: 97.84, errorRate: 2.15 },
      { time: "20:00", requests: 198000, latency: 98, availability: 97.82, errorRate: 1.92 }
    ],
    "7 Days": [
      { time: "Jul 08", requests: 2200000, latency: 74, availability: 99.85, errorRate: 0.65 },
      { time: "Jul 09", requests: 2300000, latency: 78, availability: 99.80, errorRate: 0.72 },
      { time: "Jul 10", requests: 2500000, latency: 84, availability: 99.55, errorRate: 0.98 },
      { time: "Jul 11", requests: 2400000, latency: 104, availability: 98.92, errorRate: 1.45 },
      { time: "Jul 12", requests: 2100000, latency: 96, availability: 98.88, errorRate: 1.22 },
      { time: "Jul 13", requests: 2600000, latency: 102, availability: 98.15, errorRate: 1.84 },
      { time: "Jul 14", requests: 2710000, latency: 98, availability: 97.82, errorRate: 1.92 }
    ],
    "30 Days": [
      { time: "Wk 1", requests: 14500000, latency: 72, availability: 99.92, errorRate: 0.58 },
      { time: "Wk 2", requests: 15200000, latency: 76, availability: 99.84, errorRate: 0.68 },
      { time: "Wk 3", requests: 16400000, latency: 88, availability: 99.40, errorRate: 1.12 },
      { time: "Wk 4", requests: 17800000, latency: 98, availability: 97.82, errorRate: 1.92 }
    ],
    "90 Days": [
      { time: "May", requests: 52400000, latency: 68, availability: 99.94, errorRate: 0.48 },
      { time: "Jun", requests: 58100000, latency: 74, availability: 99.82, errorRate: 0.72 },
      { time: "Jul", requests: 62800000, latency: 98, availability: 97.82, errorRate: 1.92 }
    ],
    "1 Year": [
      { time: "Q3 2025", requests: 145000000, latency: 54, availability: 99.98, errorRate: 0.32 },
      { time: "Q4 2025", requests: 184000000, latency: 62, availability: 99.95, errorRate: 0.44 },
      { time: "Q1 2026", requests: 210000000, latency: 70, availability: 99.88, errorRate: 0.68 },
      { time: "Q2 2026", requests: 242000000, latency: 98, availability: 97.82, errorRate: 1.92 }
    ]
  },
  slowestEndpoints: [
    { path: "/api/v1/reports/generate", method: "POST", value: 480, detail: "Reports compiling payload" },
    { path: "/api/v1/predict/credit", method: "POST", value: 245, detail: "AI model compute latency" },
    { path: "/api/v1/officer/decision", method: "POST", value: 84, detail: "Underwriting audit database write" },
    { path: "/api/v1/customer/profile", method: "GET", value: 24, detail: "Demographics search lookup" }
  ],
  highestErrorEndpoints: [
    { path: "/api/v1/document/upload", method: "POST", value: "100.0%", detail: "Offline endpoint connection refuse" },
    { path: "/api/v1/reports/generate", method: "POST", value: "4.48%", detail: "Timeout breaches under load" },
    { path: "/api/v1/predict/credit", method: "POST", value: "0.58%", detail: "Model service degraded status" },
    { path: "/api/v1/officer/decision", method: "POST", value: "0.32%", detail: "Role settings validation fail" }
  ],
  mostCalledEndpoints: [
    { path: "/api/v1/notify/send", method: "POST", value: "840K", detail: "Alert notifications dispatch" },
    { path: "/api/v1/predict/fraud", method: "POST", value: "520K", detail: "Real-time card audit checks" },
    { path: "/api/v1/customer/profile", method: "GET", value: "412K", detail: "Accounts balance fetches" },
    { path: "/api/v1/auth/login", method: "POST", value: "284K", detail: "JWT login sessions generation" }
  ],
  leastUsedEndpoints: [
    { path: "/api/v1/admin/settings", method: "PUT", value: "12.4K", detail: "Org configuration changes" },
    { path: "/api/v1/reports/generate", method: "POST", value: "14.5K", detail: "Regulatory audit exports" },
    { path: "/api/v1/document/upload", method: "POST", value: "45.0K", detail: "Storage backend write requests" },
    { path: "/api/v1/officer/decision", method: "POST", value: "98.0K", detail: "Underwriters decision logging" }
  ],
  requestsByMethod: [
    { name: "GET Requests", value: 557000 },
    { name: "POST Requests", value: 1783500 },
    { name: "PUT Requests", value: 12400 },
    { name: "DELETE Requests", value: 200 },
    { name: "PATCH Requests", value: 800 }
  ],
  errorsBreakdown: [
    { name: "4xx Client Errors", count: 4200, fill: COLORS.warning },
    { name: "5xx Server Errors", count: 45650, fill: COLORS.critical },
    { name: "Gateway Timeouts", count: 820, fill: COLORS.ai },
    { name: "Auth Failures", count: 3200, fill: COLORS.primary },
    { name: "Rate Limit Exceeded", count: 1840, fill: COLORS.forecast }
  ],
  rateLimiting: {
    currentLimit: 10000, // req/min
    peakUsage: 6420, // req/min
    blockedRequests: 1840,
    quotaRemaining: 35.8 // in %
  },
  realTimeFeed: [
    { timestamp: "20:10:48", api: "Fraud API", method: "POST", status: 200, latency: 12, client: "Edge_Gateway" },
    { timestamp: "20:10:45", api: "Prediction API", method: "POST", status: 504, latency: 3000, client: "Zephyr_Treasury" },
    { timestamp: "20:10:42", api: "Customer API", method: "GET", status: 200, latency: 24, client: "Mobile_iOS" },
    { timestamp: "20:10:39", api: "Notification API", method: "POST", status: 200, latency: 22, client: "Mailer_Srv" },
    { timestamp: "20:10:35", api: "Document API", method: "POST", status: 503, latency: 0, client: "Partner_Sandbox" }
  ],
  alerts: [
    { id: "AL-201", title: "API Service Down", severity: "Critical", timestamp: "2026-07-14 19:12:00", message: "Document API is offline. Connections to S3 storage bucket refused." },
    { id: "AL-202", title: "High Latency Breached", severity: "Warning", timestamp: "2026-07-14 20:02:15", message: "Prediction API p95 response time rose to 245ms (limit: 150ms)." },
    { id: "AL-203", title: "Authentication Failures Spike", severity: "Info", timestamp: "2026-07-14 20:05:00", message: "JWT login endpoints returned 84 consecutive 401 Unauthorized codes." }
  ],
  dependencies: [
    { source: "Authentication", target: "Customer", type: "sync", status: "operational" },
    { source: "Customer", target: "Reports", type: "async", status: "operational" },
    { source: "Reports", target: "Notifications", type: "event", status: "operational" },
    { source: "Prediction", target: "Notifications", type: "event", status: "operational" },
    { source: "Prediction", target: "Fraud", type: "sync", status: "operational" },
    { source: "Customer", target: "Prediction", type: "sync", status: "slow" },
    { source: "Customer", target: "Documents", type: "sync", status: "broken" }
  ]
};
