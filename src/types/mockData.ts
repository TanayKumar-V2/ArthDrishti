// ArthDrishti Typed Mock Data Architecture

export type UserRole = "customer" | "officer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organization?: string;
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
}

export interface FinancialHealthFactor {
  id: string;
  name: string;
  score: number;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

export interface FinancialHealthScore {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  delta: number; // positive or negative percentage change
  factors: FinancialHealthFactor[];
}

export interface RiskFactor {
  id: string;
  category: "credit" | "market" | "liquidity" | "operational";
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number; // impact weight (0-100)
  description: string;
}

export interface RiskScore {
  creditScore: number;
  defaultProbability: number; // 0.00 to 1.00
  fraudScore: number; // 0 to 100
  riskRating: "Low" | "Medium" | "High" | "Critical";
  factors: RiskFactor[];
}

export interface FraudAlert {
  id: string;
  transactionId?: string;
  type: "velocity" | "geography" | "mismatch" | "high_value" | "structuring";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  confidence: number; // 0.00 to 1.00
  timestamp: string;
  status: "pending" | "investigating" | "dismissed" | "confirmed";
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  merchant: string;
  category: "income" | "housing" | "utilities" | "debt_repayment" | "business" | "leisure" | "other";
  date: string;
  type: "credit" | "debit";
  status: "completed" | "pending" | "failed";
  riskScore: number; // 0 to 100
}

export interface CashFlowForecast {
  month: string; // e.g. "Jul 2026"
  projectedInflow: number;
  projectedOutflow: number;
  confidenceLower: number;
  confidenceUpper: number;
}

export interface ForecastEvent {
  id: string;
  name: string;
  description: string;
  amount: number;
  probability: number; // 0.00 to 1.00
  type: "inflow" | "outflow";
  date: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number; // number of customers in segment
  percentage: number; // percentage of total portfolio
  riskProfile: "Low" | "Medium" | "High" | "Critical";
  averageScore: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: "risk" | "health" | "spending" | "forecast";
  impact: "high" | "medium" | "low";
  recommendationId?: string;
  shapValue?: number; // feature attribution value
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "optimization" | "mitigation" | "investment";
  priority: "high" | "medium" | "low";
  potentialSavings: number;
}

export interface Report {
  id: string;
  title: string;
  type: "health" | "credit" | "fraud" | "explainability";
  date: string;
  createdBy: string;
  format: "pdf" | "excel" | "json";
  downloadUrl: string;
}

export interface LoanApplicant {
  id: string;
  name: string;
  email: string;
  loanAmount: number;
  loanPurpose: string;
  creditScore: number;
  riskRating: "Low" | "Medium" | "High" | "Critical";
  defaultProbability: number;
  status: "submitted" | "under_review" | "approved" | "rejected";
  submittedAt: string;
}

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  status: "active" | "shadow" | "retired";
  type: "xgboost" | "lightgbm" | "neural_network" | "random_forest";
  lastTrained: string;
  featuresCount: number;
}

export interface ModelPerformance {
  modelId: string;
  accuracy: number; // 0.00 to 1.00
  rocAuc: number;
  f1Score: number;
  giniCoefficient: number;
  ksStatistic: number;
}

export interface DriftAlert {
  id: string;
  modelId: string;
  modelName: string;
  featureName: string;
  driftScore: number; // e.g. PSI (Population Stability Index)
  threshold: number;
  severity: "low" | "medium" | "high";
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success";
  read: boolean;
  timestamp: string;
}

// ==========================================
// CENTRALIZED MOCK DATASETS
// ==========================================

export const mockCurrentUser: User = {
  id: "u-9912",
  name: "Sarah Jenkins",
  email: "sarah.jenkins@finance.corp",
  role: "customer",
  avatarUrl: undefined,
  organization: "Jenkins Holdings Ltd"
};

export const mockLoanOfficer: User = {
  id: "u-8832",
  name: "Marcus Vance",
  email: "m.vance@arthdrishti.com",
  role: "officer",
  organization: "ArthDrishti Bank North"
};

export const mockAdminUser: User = {
  id: "u-0001",
  name: "Platform Administrator",
  email: "admin@arthdrishti.com",
  role: "admin"
};

export const mockFinancialSummary: FinancialSummary = {
  totalAssets: 12450000,
  totalLiabilities: 3820000,
  netWorth: 8630000,
  monthlyIncome: 450000,
  monthlyExpenses: 280000,
  netCashFlow: 170000
};

export const mockFinancialHealth: FinancialHealthScore = {
  score: 84,
  grade: "A",
  delta: 3.5,
  factors: [
    {
      id: "fh-1",
      name: "Debt-to-Income Ratio",
      score: 92,
      impact: "positive",
      description: "DTI of 24.3% is well within safe thresholds (under 35%)."
    },
    {
      id: "fh-2",
      name: "Cash Buffer Liquidity",
      score: 88,
      impact: "positive",
      description: "Available cash reserves cover 5.8 months of operational expenses."
    },
    {
      id: "fh-3",
      name: "Revenue Concentration",
      score: 55,
      impact: "negative",
      description: "Top 2 customers generate 45% of total income, creating operational vulnerability."
    },
    {
      id: "fh-4",
      name: "Savings Rate Trend",
      score: 76,
      impact: "neutral",
      description: "Stable monthly savings rate at 18.2% showing low volatility."
    }
  ]
};

export const mockRiskScore: RiskScore = {
  creditScore: 785,
  defaultProbability: 0.0185, // 1.85%
  fraudScore: 8, // Very low fraud likelihood
  riskRating: "Low",
  factors: [
    {
      id: "rf-1",
      category: "credit",
      name: "Repayment History",
      impact: "positive",
      weight: 40,
      description: "Zero missed payments in the last 48 months."
    },
    {
      id: "rf-2",
      category: "liquidity",
      name: "Quick Ratio",
      impact: "positive",
      weight: 20,
      description: "Quick ratio is 1.62, representing a solid near-term cash runway."
    },
    {
      id: "rf-3",
      category: "operational",
      name: "Sector Volatility",
      impact: "negative",
      weight: 25,
      description: "Operating in software tech segment currently witnessing moderate global correction."
    }
  ]
};

export const mockFraudAlerts: FraudAlert[] = [
  {
    id: "fr-1",
    transactionId: "tx-4512",
    type: "velocity",
    severity: "medium",
    description: "Multiple cross-border transactions detected within a 10-minute window.",
    confidence: 0.78,
    timestamp: "2026-07-06T18:42:00Z",
    status: "investigating"
  },
  {
    id: "fr-2",
    transactionId: "tx-4991",
    type: "high_value",
    severity: "critical",
    description: "Out-of-pattern wire transfer of $120,000 to unverified account.",
    confidence: 0.94,
    timestamp: "2026-07-06T15:20:00Z",
    status: "pending"
  },
  {
    id: "fr-3",
    transactionId: "tx-3288",
    type: "geography",
    severity: "low",
    description: "Transaction initiated from Singapore VPN while card remains active in Chicago.",
    confidence: 0.62,
    timestamp: "2026-07-05T09:12:00Z",
    status: "dismissed"
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: "tx-4512",
    amount: 1450.00,
    currency: "USD",
    merchant: "ServerStack Cloud Hosting",
    category: "utilities",
    date: "2026-07-06T18:40:00Z",
    type: "debit",
    status: "completed",
    riskScore: 78
  },
  {
    id: "tx-4991",
    amount: 120000.00,
    currency: "USD",
    merchant: "Global Asset Escrow Corp",
    category: "business",
    date: "2026-07-06T15:20:00Z",
    type: "debit",
    status: "pending",
    riskScore: 94
  },
  {
    id: "tx-3341",
    amount: 45000.00,
    currency: "USD",
    merchant: "Nexa SaaS Solutions Inc",
    category: "income",
    date: "2026-07-05T23:00:00Z",
    type: "credit",
    status: "completed",
    riskScore: 2
  },
  {
    id: "tx-3312",
    amount: 3200.00,
    currency: "USD",
    merchant: "Downtown HQ Rent",
    category: "housing",
    date: "2026-07-01T08:00:00Z",
    type: "debit",
    status: "completed",
    riskScore: 5
  },
  {
    id: "tx-2995",
    amount: 1200.00,
    currency: "USD",
    merchant: "Executive Travel Agency",
    category: "leisure",
    date: "2026-06-28T14:30:00Z",
    type: "debit",
    status: "completed",
    riskScore: 12
  }
];

export const mockCashFlowForecast: CashFlowForecast[] = [
  { month: "Jan 2026", projectedInflow: 410000, projectedOutflow: 320000, confidenceLower: 390000, confidenceUpper: 430000 },
  { month: "Feb 2026", projectedInflow: 430000, projectedOutflow: 290000, confidenceLower: 410000, confidenceUpper: 450000 },
  { month: "Mar 2026", projectedInflow: 400000, projectedOutflow: 310000, confidenceLower: 380000, confidenceUpper: 420000 },
  { month: "Apr 2026", projectedInflow: 450000, projectedOutflow: 280000, confidenceLower: 420000, confidenceUpper: 480000 },
  { month: "May 2026", projectedInflow: 470000, projectedOutflow: 300000, confidenceLower: 440000, confidenceUpper: 500000 },
  { month: "Jun 2026", projectedInflow: 490000, projectedOutflow: 330000, confidenceLower: 450000, confidenceUpper: 520000 },
  { month: "Jul 2026", projectedInflow: 520000, projectedOutflow: 310000, confidenceLower: 480000, confidenceUpper: 560000 },
  { month: "Aug 2026", projectedInflow: 540000, projectedOutflow: 320000, confidenceLower: 490000, confidenceUpper: 590000 },
  { month: "Sep 2026", projectedInflow: 560000, projectedOutflow: 340000, confidenceLower: 510000, confidenceUpper: 610000 }
];

export const mockForecastEvents: ForecastEvent[] = [
  {
    id: "fe-1",
    name: "SaaS Enterprise Contract Renewal",
    description: "Annual billing cycles for tier-1 government clients.",
    amount: 145000,
    probability: 0.92,
    type: "inflow",
    date: "2026-08-15"
  },
  {
    id: "fe-2",
    name: "Office Workspace Rent Renewal",
    description: "Lease contract renegotiation with dynamic adjustments.",
    amount: 24000,
    probability: 0.98,
    type: "outflow",
    date: "2026-08-01"
  },
  {
    id: "fe-3",
    name: "Pending M&A Capital Influx",
    description: "Angel round extension from primary capital networks.",
    amount: 250000,
    probability: 0.65,
    type: "inflow",
    date: "2026-09-10"
  }
];

export const mockCustomerSegments: CustomerSegment[] = [
  { id: "seg-1", name: "Institutional Blue Chip", description: "Established enterprises with high credit scores and low default records.", size: 1420, percentage: 32.5, riskProfile: "Low", averageScore: 88 },
  { id: "seg-2", name: "Mid-Market Growth", description: "Fast-growing companies showing healthy spending but higher sector volatility.", size: 2110, percentage: 48.3, riskProfile: "Medium", averageScore: 74 },
  { id: "seg-3", name: "High-Beta Emerging", description: "Early stage ventures showing intensive spending and higher default risk.", size: 840, percentage: 19.2, riskProfile: "High", averageScore: 61 }
];

export const mockAIInsights: AIInsight[] = [
  {
    id: "ai-1",
    title: "Vulnerability to Interest Rate Shocks",
    description: "Your debt load is 42% sensitive to central base lending rate adjustments scheduled for next month.",
    category: "risk",
    impact: "high",
    shapValue: 0.32
  },
  {
    id: "ai-2",
    title: "Optimized Cloud Operating Costs",
    description: "Spike of 23.4% in Server Hosting charges could be offset by prepaid commitments, saving up to $18,400.",
    category: "spending",
    impact: "medium",
    recommendationId: "rec-1",
    shapValue: -0.15
  },
  {
    id: "ai-3",
    title: "Robust Cash Cushion Forecasted",
    description: "Model predicts liquid cash will remain positive for 18 consecutive months even under severe stress tests.",
    category: "forecast",
    impact: "low",
    shapValue: 0.12
  }
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Switch to Server Hosting Multi-Year Commitments",
    description: "Purchase AWS/Azure reserved instances for base workloads to slice recurring bills.",
    type: "optimization",
    priority: "medium",
    potentialSavings: 18400
  },
  {
    id: "rec-2",
    title: "Hedge Variable Interest Rate Notes",
    description: "Establish floating-to-fixed interest swaps for the upcoming notes maturing 2028.",
    type: "mitigation",
    priority: "high",
    potentialSavings: 45000
  }
];

export const mockReports: Report[] = [
  { id: "rep-1", title: "Q2 Financial Health Audit Summary", type: "health", date: "2026-06-30", createdBy: "AI Advisor Engine v4.2", format: "pdf", downloadUrl: "#" },
  { id: "rep-2", title: "Monthly Transaction & Fraud Analytics", type: "fraud", date: "2026-06-15", createdBy: "Securities Compliance Bot", format: "excel", downloadUrl: "#" },
  { id: "rep-3", title: "Explainable Risk Assessment Matrix (SHAP)", type: "explainability", date: "2026-05-12", createdBy: "MLOps Platform", format: "json", downloadUrl: "#" }
];

export const mockLoanApplicants: LoanApplicant[] = [
  { id: "ap-812", name: "Zephyr Energy Solutions", email: "treasury@zephyr.energy", loanAmount: 2500000, loanPurpose: "Capital equipment and green infrastructure layout.", creditScore: 810, riskRating: "Low", defaultProbability: 0.0092, status: "under_review", submittedAt: "2026-07-04T10:14:00Z" },
  { id: "ap-741", name: "Novus Logistics Corp", email: "finance@novus.log", loanAmount: 850000, loanPurpose: "Freight fleet acquisition and inventory expansion.", creditScore: 712, riskRating: "Medium", defaultProbability: 0.0450, status: "submitted", submittedAt: "2026-07-06T08:30:00Z" },
  { id: "ap-619", name: "Bespoke Apparel Labs", email: "accounting@bespoke.co", loanAmount: 450000, loanPurpose: "Operational runway during Q3 retail contraction.", creditScore: 615, riskRating: "High", defaultProbability: 0.1250, status: "rejected", submittedAt: "2026-06-28T16:45:00Z" }
];

export const mockModelsMetadata: ModelMetadata[] = [
  { id: "mod-1", name: "CreditDefaultPredictor", version: "v2.8-stable", status: "active", type: "xgboost", lastTrained: "2026-06-20", featuresCount: 42 },
  { id: "mod-2", name: "FraudAnomalizerNeuralNet", version: "v1.4.2-canary", status: "shadow", type: "neural_network", lastTrained: "2026-07-01", featuresCount: 128 },
  { id: "mod-3", name: "CashFlowForecastingArima", version: "v4.0-retired", status: "retired", type: "random_forest", lastTrained: "2026-03-12", featuresCount: 15 }
];

export const mockModelPerformance: ModelPerformance[] = [
  { modelId: "mod-1", accuracy: 0.948, rocAuc: 0.965, f1Score: 0.924, giniCoefficient: 0.93, ksStatistic: 0.725 },
  { modelId: "mod-2", accuracy: 0.982, rocAuc: 0.989, f1Score: 0.975, giniCoefficient: 0.978, ksStatistic: 0.812 }
];

export const mockDriftAlerts: DriftAlert[] = [
  { id: "dr-1", modelId: "mod-1", modelName: "CreditDefaultPredictor", featureName: "monthly_debt_repayment_ratio", driftScore: 0.245, threshold: 0.100, severity: "high", timestamp: "2026-07-06T02:00:00Z" },
  { id: "dr-2", modelId: "mod-1", modelName: "CreditDefaultPredictor", featureName: "quick_ratio_variance", driftScore: 0.124, threshold: 0.100, severity: "medium", timestamp: "2026-07-05T12:00:00Z" }
];

export const mockAuditLogs: AuditLog[] = [
  { id: "aud-1", userId: "u-8832", userName: "Marcus Vance", action: "Review Loan Application", details: "Reviewed application ap-812 for Zephyr Energy Solutions.", ipAddress: "192.168.12.82", timestamp: "2026-07-06T19:00:00Z" },
  { id: "aud-2", userId: "u-0001", userName: "Platform Administrator", action: "Deploy Model Canary", details: "Set model mod-2 status to shadow.", ipAddress: "10.0.4.15", timestamp: "2026-07-06T11:32:00Z" }
];

export const mockNotifications: Notification[] = [
  { id: "nt-1", title: "Critical Drift Warning", message: "Model CreditDefaultPredictor shows high drift (PSI: 0.245) in DTI feature.", type: "alert", read: false, timestamp: "2026-07-06T02:00:00Z" },
  { id: "nt-2", title: "New Loan Application Submitted", message: "Zephyr Energy Solutions has submitted a loan application for $2,500,000.", type: "info", read: false, timestamp: "2026-07-04T10:14:00Z" },
  { id: "nt-3", title: "Weekly Report Generation Complete", message: "Your customized Q2 Health summary is now ready for download.", type: "success", read: true, timestamp: "2026-07-01T00:00:00Z" }
];
