// Business Intelligence Telemetry Data Layer for Executive Analytics Cockpit

export interface AnalyticsKPI {
  title: string;
  value: string;
  trend: number;
  sparkline: number[];
  icon: string;
  status: "success" | "warning" | "destructive" | "info" | "default";
  description: string;
}

export interface OfficerPerformance {
  name: string;
  avatar: string;
  approvalRate: number;
  avgTime: string;
  cases: number;
  pending: number;
}

export interface GeoStateData {
  id: string;
  name: string;
  organizations: number;
  customers: number;
  loans: number;
  predictions: number;
  riskClass: "Low" | "Medium" | "High";
}

export interface InsightCard {
  title: string;
  priority: "High" | "Medium" | "Low";
  confidence: number; // percentage
  impact: string;
  recommendation: string;
}

export interface PlatformRisk {
  id: string;
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium";
  category: "Credit" | "Infrastructure" | "AI Model" | "Fraud" | "Security";
  timestamp: string;
}

export interface ExecutiveReportCard {
  id: string;
  title: string;
  description: string;
  published: string;
  size: string;
}

// 1. GLOBAL KPI STATS
export const ANALYTICS_KPIS: AnalyticsKPI[] = [
  { title: "Total Customers", value: "1,248,512", trend: 12.4, sparkline: [1120000, 1145000, 1180000, 1210000, 1232000, 1248512], icon: "Users", status: "info", description: "Acquisition rollup trends" },
  { title: "Total Organizations", value: "842", trend: 8.5, sparkline: [750, 770, 792, 810, 830, 842], icon: "Building2", status: "info", description: "B2B enterprise merchant networks" },
  { title: "Active Officers", value: "124", trend: 3.2, sparkline: [118, 120, 120, 122, 124, 124], icon: "UserCheck", status: "info", description: "Active loan underwriters" },
  { title: "Loans Processed", value: "₹4,821 Cr", trend: 15.6, sparkline: [4120, 4290, 4410, 4580, 4710, 4821], icon: "FileText", status: "success", description: "Processed volume metrics" },
  { title: "Prediction Accuracy", value: "94.8%", trend: 1.4, sparkline: [93.1, 93.4, 93.8, 94.2, 94.5, 94.8], icon: "Cpu", status: "success", description: "AI scoring validation score" },
  { title: "Fraud Prevented", value: "₹184.2 Cr", trend: 22.4, sparkline: [142, 150, 158, 168, 175, 184.2], icon: "ShieldAlert", status: "success", description: "Loss avoidance indexes" },
  { title: "Avg Financial Health", value: "78.2", trend: 2.5, sparkline: [75.1, 75.8, 76.4, 77.1, 77.8, 78.2], icon: "TrendingUp", status: "info", description: "Portfolio creditworthiness score" },
  { title: "Platform Availability", value: "99.98%", trend: 0.02, sparkline: [99.95, 99.96, 99.95, 99.98, 99.97, 99.98], icon: "Activity", status: "success", description: "Multi-cluster node availabilities" }
];

// 2. TIMEFRAME BASED EXECUTIVE OVERVIEWS
export const EXECUTIVE_TIMEFRAME_DATA = {
  "Today": [
    { name: "00:00", growth: 120, customers: 3000, orgs: 830, volume: 140, revenue: 1.2, approvals: 80 },
    { name: "06:00", growth: 130, customers: 3100, orgs: 832, volume: 180, revenue: 1.4, approvals: 110 },
    { name: "12:00", growth: 180, customers: 3400, orgs: 838, volume: 290, revenue: 2.8, approvals: 210 },
    { name: "18:00", growth: 220, customers: 3800, orgs: 840, volume: 340, revenue: 3.5, approvals: 240 },
    { name: "24:00", growth: 242, customers: 4120, orgs: 842, volume: 410, revenue: 4.2, approvals: 290 }
  ],
  "7 Days": [
    { name: "Mon", growth: 1400, customers: 24200, orgs: 810, volume: 2100, revenue: 22.4, approvals: 1510 },
    { name: "Tue", growth: 1560, customers: 24800, orgs: 815, volume: 2300, revenue: 24.1, approvals: 1680 },
    { name: "Wed", growth: 1200, customers: 25100, orgs: 820, volume: 1800, revenue: 19.8, approvals: 1320 },
    { name: "Thu", growth: 1890, customers: 25900, orgs: 826, volume: 2700, revenue: 28.5, approvals: 1980 },
    { name: "Fri", growth: 2410, customers: 27100, orgs: 832, volume: 3200, revenue: 34.2, approvals: 2310 },
    { name: "Sat", growth: 800, customers: 27500, orgs: 838, volume: 1100, revenue: 12.0, approvals: 750 },
    { name: "Sun", growth: 950, customers: 28100, orgs: 842, volume: 1300, revenue: 14.5, approvals: 910 }
  ],
  "30 Days": [
    { name: "W1", growth: 8400, customers: 114000, orgs: 770, volume: 11200, revenue: 115.4, approvals: 8120 },
    { name: "W2", growth: 9200, customers: 116500, orgs: 792, volume: 12400, revenue: 128.1, approvals: 9040 },
    { name: "W3", growth: 10400, customers: 121000, orgs: 815, volume: 13800, revenue: 142.5, approvals: 10120 },
    { name: "W4", growth: 12480, customers: 124850, orgs: 842, volume: 15400, revenue: 156.8, approvals: 11450 }
  ],
  "Quarter": [
    { name: "Apr", growth: 32000, customers: 845000, orgs: 720, volume: 42000, revenue: 440.2, approvals: 31000 },
    { name: "May", growth: 38000, customers: 980000, orgs: 780, volume: 49000, revenue: 512.4, approvals: 37400 },
    { name: "Jun", growth: 44500, customers: 1248512, orgs: 842, volume: 58000, revenue: 615.6, approvals: 44821 }
  ],
  "Year": [
    { name: "Q1", growth: 120000, customers: 680000, orgs: 580, volume: 154000, revenue: 1480, approvals: 112000 },
    { name: "Q2", growth: 150000, customers: 880000, orgs: 690, volume: 182000, revenue: 1850, approvals: 138000 },
    { name: "Q3", growth: 180000, customers: 1050000, orgs: 760, volume: 215000, revenue: 2210, approvals: 164000 },
    { name: "Q4", growth: 224000, customers: 1248512, orgs: 842, volume: 254000, revenue: 2680, approvals: 198000 }
  ]
};

// 3. CUSTOMER ANALYTICS
export const CUSTOMER_SEGMENTS_DATA = [
  { name: "Corporate FinTech", value: 38 },
  { name: "SME Lending", value: 32 },
  { name: "Retail Banking", value: 20 },
  { name: "Microfinance", value: 10 }
];

export const CREDIT_RISK_DISTRIBUTION = [
  { name: "A (Low Risk)", value: 45 },
  { name: "B (Moderate)", value: 30 },
  { name: "C (Warning)", value: 15 },
  { name: "D (High Risk)", value: 7 },
  { name: "E (Critical Default)", value: 3 }
];

// 4. LOAN UNDERWRITING PERFORMANCE
export const LOAN_CATEGORIES_DATA = [
  { name: "SME Cash Credit", value: 42 },
  { name: "Term Loans", value: 28 },
  { name: "Supply Chain", value: 18 },
  { name: "Unsecured Retail", value: 12 }
];

export const APPLICATIONS_METRICS_DATA = [
  { name: "Received", count: 8420 },
  { name: "Approved", count: 5910 },
  { name: "Rejected", count: 1840 },
  { name: "Manual Reviews", count: 670 }
];

// 5. UNDERWRITING OFFICERS LEADERBOARD
export const TOP_OFFICERS_LEADERBOARD: OfficerPerformance[] = [
  { name: "Siddharth Mehta", avatar: "SM", approvalRate: 94.5, avgTime: "18 mins", cases: 284, pending: 8 },
  { name: "Rahul Chahar", avatar: "RC", approvalRate: 88.2, avgTime: "24 mins", cases: 242, pending: 15 },
  { name: "Sarah Jenkins", avatar: "SJ", approvalRate: 91.0, avgTime: "21 mins", cases: 221, pending: 4 },
  { name: "Marcus Vance", avatar: "MV", approvalRate: 85.6, avgTime: "29 mins", cases: 194, pending: 18 },
  { name: "Auditor Roy", avatar: "AR", approvalRate: 97.4, avgTime: "15 mins", cases: 145, pending: 2 }
];

// 6. GEOGRAPHICAL DISPERSION (India map mock points matching clicking filters)
export const GEOGRAPHICAL_STATE_DATA: GeoStateData[] = [
  { id: "MH", name: "Maharashtra (West)", organizations: 284, customers: 412000, loans: 1850, predictions: 45000, riskClass: "Low" },
  { id: "KA", name: "Karnataka (South)", organizations: 194, customers: 310000, loans: 1240, predictions: 32000, riskClass: "Low" },
  { id: "DL", name: "Delhi NCR (North)", organizations: 154, customers: 242000, loans: 980, predictions: 24000, riskClass: "Medium" },
  { id: "TN", name: "Tamil Nadu (South)", organizations: 124, customers: 168000, loans: 750, predictions: 18000, riskClass: "Low" },
  { id: "WB", name: "West Bengal (East)", organizations: 86, customers: 116000, loans: 520, predictions: 11000, riskClass: "High" }
];

// 7. EXECUTIVE INSIGHTS CARDS
export const EXECUTIVE_INSIGHTS: InsightCard[] = [
  {
    title: "Customer Growth Acceleration",
    priority: "High",
    confidence: 95,
    impact: "Customer acquisition grew by 12.4% this quarter, driven by SMECash onboarding rollouts.",
    recommendation: "Increase server heap buffers allocations on retail API gateways to maintain performance."
  },
  {
    title: "Loss Avoidance Optimization",
    priority: "High",
    confidence: 91,
    impact: "AI fraud scoring prevented ₹184.2 Cr in default exposure. False positive index dropped to 1.8%.",
    recommendation: "Retrain credit risk models canary splits using the newly parsed RBI dataset matrices."
  },
  {
    title: "SLA Underwriting Performance",
    priority: "Medium",
    confidence: 88,
    impact: "Average manual underwriting processing time improved from 28 to 22 minutes (21.4% change).",
    recommendation: "Assign extra training files to officers currently averaging above 26 minutes averages."
  },
  {
    title: "Portfolio Creditworthiness improving",
    priority: "Medium",
    confidence: 90,
    impact: "Average portfolio credit score reached 78.2. Default exposures dropped by 4.2% globally.",
    recommendation: "Re-adjust credit limits rules thresholds in platform configurations settings panels."
  }
];

// 8. CRITICAL PLATFORM RISKS
export const CRITICAL_PLATFORM_RISKS: PlatformRisk[] = [
  { id: "RSK-801", title: "Model Drift Warning", description: "Credit score ensemble F1 score dropped below 0.85 canary splits limits.", severity: "High", category: "AI Model", timestamp: "Today, 20:30" },
  { id: "RSK-802", title: "Failed Login Threshold Spike", description: "Rate limit triggered on security proxy blocks. IP 198.51.100.42 blacklisted.", severity: "Critical", category: "Security", timestamp: "Today, 19:42" },
  { id: "RSK-803", title: "AWS S3 Storage warning", description: "Onboarding documents bucket exceeded 88% capacity limits.", severity: "Medium", category: "Infrastructure", timestamp: "Yesterday, 11:30" }
];

// 9. RECHARTS COMPATIBLE CHARTS DATA
export const REVENUE_COST_SAVINGS_WEEKLY = [
  { name: "Mon", revenue: 2.2, cost: 0.8, savings: 1.5 },
  { name: "Tue", revenue: 2.8, cost: 0.9, savings: 1.9 },
  { name: "Wed", revenue: 2.4, cost: 0.8, savings: 1.6 },
  { name: "Thu", revenue: 3.1, cost: 0.9, savings: 2.2 },
  { name: "Fri", revenue: 3.8, cost: 1.1, savings: 2.8 },
  { name: "Sat", revenue: 1.2, cost: 0.5, savings: 0.8 },
  { name: "Sun", revenue: 1.5, cost: 0.5, savings: 1.1 }
];

export const SYSTEM_CPU_MEM_QUEUES = [
  { name: "00:00", cpu: 32, memory: 48, queue: 1 },
  { name: "04:00", cpu: 28, memory: 46, queue: 0 },
  { name: "08:00", cpu: 45, memory: 52, queue: 2 },
  { name: "12:00", cpu: 78, memory: 68, queue: 5 },
  { name: "16:00", cpu: 82, memory: 74, queue: 8 },
  { name: "20:00", cpu: 65, memory: 62, queue: 3 }
];

// 10. EXECUTIVE REPORT DOCUMENT METADATA
export const EXECUTIVE_REPORTS_LIST: ExecutiveReportCard[] = [
  { id: "REP-Q2-COMP", title: "Q2 Executive Business Intelligence Summary", description: "Platform revenue, SLA metrics, loss mitigation, and model analytics.", published: "14 Jul 2026", size: "4.8 MB" },
  { id: "REP-Q2-RISK", title: "Quarterly Credit & Fraud Risk Exposure Report", description: "Default metrics, fraud rings blocked, and underwriting audit logs.", published: "13 Jul 2026", size: "6.2 MB" },
  { id: "REP-Q2-AI", title: "AI Decision Models Performance Audit", description: "Retraining matrices, canary logs, feature explainability reports.", published: "10 Jul 2026", size: "3.5 MB" }
];
