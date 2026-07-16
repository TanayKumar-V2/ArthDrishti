// AI Financial Advisor Rich Responses Mock Database

export interface RichResponse {
  text: string;
  metrics?: { label: string; value: string; wasValue?: string; status?: "critical" | "warning" | "positive" }[];
  riskFactors?: { name: string; current: string; target: string; impact: string; isRisk: boolean }[];
  transactions?: { name: string; date: string; amount: number; category: string }[];
  recommendations?: string[];
  chartType?: "bar" | "line" | "gauge" | "none";
  chartData?: unknown;
  ctaText?: string;
  ctaHref?: string;
}

export const MOCK_RESPONSES: Record<string, RichResponse> = {
  risk: {
    text: "Your credit risk probability currently sits at 82% (High Risk). This is primarily driven by your Debt-to-Income (DTI) ratio crossing the critical 35% threshold to 42%, combined with revolving credit card utilization at 68%. These factors trigger high risk attribution in our models.",
    metrics: [
      { label: "DEFAULT PROBABILITY", value: "82%", wasValue: "32%", status: "critical" },
      { label: "MODEL CONFIDENCE", value: "94.2%", status: "positive" }
    ],
    riskFactors: [
      { name: "Debt-to-Income Ratio", current: "42%", target: "< 30%", impact: "+24% Risk", isRisk: true },
      { name: "Credit Utilization", current: "68%", target: "< 30%", impact: "+15% Risk", isRisk: true },
      { name: "Stable Salary credits", current: "₹1.2L/mo", target: "> ₹50K", impact: "-8% Risk", isRisk: false }
    ],
    chartType: "bar",
    chartData: {
      categories: ["DTI Ratio", "Utilization", "Low Savings", "Credit Age", "Stable Salary"],
      values: [24, 15, 12, -11, -8]
    },
    ctaText: "Open Risk Simulator",
    ctaHref: "/simulator"
  },
  spending: {
    text: "My analysis indicates that you are currently overspending in the Dining & Entertainment category, which exceeds your monthly baseline allowance budget by 15% (₹2,400 surplus). Furthermore, a one-off ticket checkout of ₹85,000 for Consumer Electronics was recorded.",
    transactions: [
      { name: "Apple Retail Store Store #90", date: "July 7, 2026", amount: 85000, category: "Electronics" },
      { name: "The Royal Dining & Grill Lounge", date: "July 5, 2026", amount: 4800, category: "Dining" },
      { name: "Netflix Premium Subscription", date: "July 2, 2026", amount: 649, category: "Subscription" }
    ],
    recommendations: [
      "Avoid large pattern-breaking purchases on revolving credit cards.",
      "Configure category caps in your savings vault to lock discretionary budgets.",
      "Consider spreading electronic purchases across 3 monthly interest-free EMIs."
    ],
    ctaText: "View Transactions",
    ctaHref: "/transactions"
  },
  loan: {
    text: "Based on your current cash reserves (₹2,40,000 checking balance) and existing debt commitments (42% DTI, ₹15,000 EMI), adding a new loan is not recommended. Your current monthly free cash flow surplus is ₹23,000. A new ₹10,000 EMI would drop your surplus cash flow to unsafe levels.",
    metrics: [
      { label: "CURRENT EMI", value: "₹15,000/mo", status: "warning" },
      { label: "SIMULATED NEW EMI", value: "₹25,000/mo", status: "critical" },
      { label: "NET FREE CASH", value: "₹13,000/mo", wasValue: "₹23,000", status: "critical" }
    ],
    recommendations: [
      "Lower your DTI ratio below 30% before applying for new credit accounts.",
      "Prepay existing outstanding debts (such as revolving card dues) to increase margin capacity."
    ],
    ctaText: "Simulate Loan EMI",
    ctaHref: "/simulator"
  },
  health: {
    text: "To elevate your Financial Health Score from 82 to 90+, our models suggest prioritizing cash buffer expansion and revolving debt clearance. Specifically, building liquid savings to cover 6 months of expenses and maintaining utilization below 15% will push your profile into the Elite bracket.",
    metrics: [
      { label: "CURRENT HEALTH", value: "82/100", status: "positive" },
      { label: "TARGET SCORE", value: "92/100", status: "positive" }
    ],
    chartType: "gauge",
    chartData: { score: 92 },
    recommendations: [
      "Establish automated recurring deposits into sweep accounts (+15 Health points).",
      "Pay credit card statements in full before interest-accrual cycles (+12 Health points).",
      "Diversify assets into low-risk mutual funds (+8 Health points)."
    ],
    ctaText: "Open Health Diagnostics",
    ctaHref: "/explainable-ai"
  },
  fraud: {
    text: "You have 2 active anomaly alerts on your cards. Both checkouts were flagged due to high card sweeps velocity (5 checkouts in under 60 seconds) and location mismatch (Delhi telecom IP vs your usual Mumbai log). They are held for verification.",
    metrics: [
      { label: "FRAUD SCORE", value: "87%", status: "critical" },
      { label: "VERIFIED DEVICE MATCH", value: "SUCCESS", status: "positive" }
    ],
    riskFactors: [
      { name: "Velocity anomaly", current: "5 tx/min", target: "< 2 tx/min", impact: "High Suspicion", isRisk: true },
      { name: "IP Geolocation", current: "New Delhi", target: "Mumbai", impact: "Medium Suspicion", isRisk: true }
    ],
    recommendations: [
      "Log into your dashboard from your registered smartphone to approve the transaction.",
      "Disable active VPN tunnels routing traffic away from your local ISP city."
    ],
    ctaText: "Verify Fraud Alerts",
    ctaHref: "/dashboard"
  },
  forecast: {
    text: "Our time-series cash flow models project your liquid checking account balance to grow to ₹3,15,000 in 6 months, assuming your income remains stable at ₹1,20,000/mo and expenses do not exceed ₹82,000/mo. If pending vendor credits are delayed, the expected floor is ₹2,40,000.",
    chartType: "line",
    chartData: {
      timeline: ["July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      values: [120000, 160000, 195000, 235000, 270000, 315000]
    },
    metrics: [
      { label: "PROJECTED BALANCE", value: "₹3,15,000", wasValue: "₹1,20,000", status: "positive" },
      { label: "LIQUID CUSHION", value: "3.2 Months", status: "positive" }
    ],
    ctaText: "Open Forecast Dashboard",
    ctaHref: "/cash-flow"
  }
};
