// AI Recommendations Mock Database

export interface RecommendationStep {
  text: string;
  completed: boolean;
}

export interface RecommendationCard {
  id: string;
  title: string;
  category: "Credit Risk" | "Savings" | "Spending" | "Debt" | "Cash Flow";
  priority: "Urgent" | "High-Impact" | "Active" | "Completed";
  currentValue: string;
  targetValue: string;
  whyText: string;
  impactDefaultRisk?: string;
  impactFinancialHealth?: string;
  impactSavingsScore?: string;
  impactCashFlow?: string;
  timeframe: string;
  difficulty: "Easy" | "Medium" | "Hard";
  steps: RecommendationStep[];
  relatedMetrics: string;
  dueDate: string;
  progressPercent: number;
}

export const INITIAL_RECOMMENDATIONS: RecommendationCard[] = [
  {
    id: "rec1",
    title: "Reduce Credit Card Utilization",
    category: "Credit Risk",
    priority: "Urgent",
    currentValue: "68%",
    targetValue: "Below 30%",
    whyText: "High credit utilization is driving up your credit risk probability indices and default scores.",
    impactDefaultRisk: "-14%",
    impactFinancialHealth: "+8 Points",
    timeframe: "3 Months",
    difficulty: "Medium",
    steps: [
      { text: "Pay down outstanding credit cards below ₹60,000", completed: false },
      { text: "Set up weekly autopay reminders on major statements", completed: false },
      { text: "Request credit card limit increases on active accounts", completed: false }
    ],
    relatedMetrics: "Credit Utilization index, DTI score",
    dueDate: "October 15, 2026",
    progressPercent: 0
  },
  {
    id: "rec2",
    title: "Establish Liquidity Reserve Sweep",
    category: "Savings",
    priority: "Urgent",
    currentValue: "2.1 Months",
    targetValue: "6.0 Months",
    whyText: "Your current emergency reserves cover only 2 months of fixed expenses, exposing you to liquidity shocks.",
    impactFinancialHealth: "+15 Points",
    impactSavingsScore: "+12 Points",
    timeframe: "6 Months",
    difficulty: "Easy",
    steps: [
      { text: "Link emergency reserve savings account to primary checking account", completed: false },
      { text: "Configure auto-sweep triggers for balances above ₹50,000", completed: false },
      { text: "Allocate 15% of monthly salary credits directly to sweeps on day of deposit", completed: false }
    ],
    relatedMetrics: "Reserves coverage index, Savings rate",
    dueDate: "December 30, 2026",
    progressPercent: 0
  },
  {
    id: "rec3",
    title: "Enforce Food & Entertainment Budget Caps",
    category: "Spending",
    priority: "Urgent",
    currentValue: "₹18,500/mo",
    targetValue: "₹12,000/mo",
    whyText: "Discretionary food & leisure sweeps exceed your category allowance buffers by 15%.",
    impactCashFlow: "Risk Lowered",
    impactFinancialHealth: "+6 Points",
    timeframe: "1 Month",
    difficulty: "Easy",
    steps: [
      { text: "Activate real-time food-category spend limit alerts on phone", completed: false },
      { text: "Unlink saved credit card credentials from food delivery applications", completed: false },
      { text: "Pre-plan discretionary food checkouts on weekly margins", completed: false }
    ],
    relatedMetrics: "Entertainment overruns tracker",
    dueDate: "August 1, 2026",
    progressPercent: 0
  },
  {
    id: "rec4",
    title: "Prepay High-Interest Card Balances",
    category: "Debt",
    priority: "High-Impact",
    currentValue: "₹5,40,000 outstanding",
    targetValue: "₹3,50,000 outstanding",
    whyText: "Consolidating or paying off active high-interest card accounts will reduce outstanding interest payments.",
    impactCashFlow: "EMI Reduced ₹5K",
    impactDefaultRisk: "-8%",
    timeframe: "4 Months",
    difficulty: "Hard",
    steps: [
      { text: "List card balances from highest APR to lowest", completed: false },
      { text: "Pay minimums on all, and funnel excess surplus to highest APR account", completed: false },
      { text: "Inquire about debt-consolidation loans with single low interest indices", completed: false }
    ],
    relatedMetrics: "Outstanding debt index, APR rating",
    dueDate: "November 10, 2026",
    progressPercent: 0
  },
  {
    id: "rec5",
    title: "Align Invoice Clearing Cycles",
    category: "Cash Flow",
    priority: "High-Impact",
    currentValue: "Average 45 Days",
    targetValue: "Average 30 Days",
    whyText: "Extended invoice clearing cycles cause short-term cash flow gaps and increase cash flow risk.",
    impactCashFlow: "Risk Lowered",
    impactSavingsScore: "+6 Points",
    timeframe: "2 Months",
    difficulty: "Medium",
    steps: [
      { text: "Set up auto-reminders for pending invoices 7 days prior to due dates", completed: false },
      { text: "Implement early payment discounts (e.g. 1.5% off for net 15 clearings)", completed: false },
      { text: "Configure automatic late fee triggers on pending invoices", completed: false }
    ],
    relatedMetrics: "Days Outstanding (DSO) counter",
    dueDate: "September 15, 2026",
    progressPercent: 0
  },
  {
    id: "rec6",
    title: "Initiate Automated Sweep Deposits",
    category: "Savings",
    priority: "Completed",
    currentValue: "Enabled",
    targetValue: "Enabled",
    whyText: "Automatic transfers of monthly balance surpluses ensure capital utilization.",
    impactSavingsScore: "+10 Points",
    impactFinancialHealth: "+5 Points",
    timeframe: "Completed",
    difficulty: "Easy",
    steps: [
      { text: "Select active bank auto-sweep account", completed: true },
      { text: "Configure ₹10,000 monthly sweep transfer date on salary deposit days", completed: true }
    ],
    relatedMetrics: "Automated sweep ledger",
    dueDate: "Completed June 20, 2026",
    progressPercent: 100
  }
];
