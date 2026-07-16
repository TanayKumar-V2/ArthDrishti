"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import * as echarts from "echarts";
import {
  Brain,
  ShieldAlert,
  Fingerprint,
  HeartPulse,
  TrendingUp,
  Info,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  Database,
  ArrowUpRight,
  Sliders,
  Play,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Overlays";
import { cn } from "@/lib/utils";

// ============================================================================
// DATA TYPES
// ============================================================================
interface ShapFeature {
  name: string;
  key: string;
  contribution: number; // positive or negative
  currentValue: string;
  healthyRange: string;
  rawNumValue: number; // for simulation
  simMin: number;
  simMax: number;
  simStep: number;
  unit: string;
  confidence: number;
  description: string;
  relatedMetric: string;
  actionText: string;
  impactType: "critical" | "high" | "medium" | "low";
}

interface ShapData {
  baseValue: number;
  finalValue: number;
  statusText: string;
  statusVariant: "critical" | "warning" | "positive";
  confidence: number;
  lastUpdated: string;
  summaryLabel: string;
  plainEnglishSummary: string;
  expandedExplanation: string;
  features: ShapFeature[];
}

interface ModelDetails {
  modelType: string;
  explanationMethod: string;
  categoriesUsed: string[];
  lastTrained: string;
  trainingSamples: string;
}

// ============================================================================
// DETAILED MOCK DATA
// ============================================================================
const MODEL_EXPLANATIONS: Record<string, ShapData> = {
  credit: {
    baseValue: 32,
    finalValue: 82,
    statusText: "HIGH RISK",
    statusVariant: "critical",
    confidence: 94.2,
    lastUpdated: "2 Minutes Ago",
    summaryLabel: "LOAN DEFAULT PROBABILITY",
    plainEnglishSummary: "Your default risk is primarily driven by high debt obligations relative to income (42% DTI) and recent late payments (1 in 12M). Your stable salary reduces the overall risk.",
    expandedExplanation: "The model runs a gradient boosted trees (XGBoost) algorithm calibrated against regional credit bureaus. The primary risk trigger is your debt-to-income ratio crossing the critical 35% threshold, compounded by a late utility payment registered 4 months ago. The model offsets these negative signals using your regular payroll credit record and credit age, but the net result places you in the High Risk category for new term credit approvals.",
    features: [
      {
        name: "Debt-to-Income Ratio",
        key: "dti",
        contribution: 24,
        currentValue: "42%",
        healthyRange: "< 30%",
        rawNumValue: 42,
        simMin: 15,
        simMax: 60,
        simStep: 1,
        unit: "%",
        confidence: 96.5,
        description: "Fixed monthly debt service payments divided by gross incoming cash flow. Current ratio is 42%, which significantly exceeds optimal parameters.",
        relatedMetric: "Monthly Fixed Debt: ₹50,400 / Income: ₹1,20,000",
        actionText: "Reduce debt obligations or consolidate high-interest retail loans to drop DTI below 30%.",
        impactType: "critical"
      },
      {
        name: "Late Payments (12M)",
        key: "late",
        contribution: 18,
        currentValue: "1 Late Payment",
        healthyRange: "0",
        rawNumValue: 1,
        simMin: 0,
        simMax: 4,
        simStep: 1,
        unit: "",
        confidence: 98.2,
        description: "Delayed payment occurrences registered in credit files in the last 12 months. You have 1 late payment registered 4 months ago.",
        relatedMetric: "EMI Settlement History (11/12 successful cycles)",
        actionText: "Enable automatic EMI deductions on all active loans to maintain a clean consecutive cycle record.",
        impactType: "high"
      },
      {
        name: "Credit Utilization",
        key: "utilization",
        contribution: 15,
        currentValue: "68%",
        healthyRange: "< 30%",
        rawNumValue: 68,
        simMin: 5,
        simMax: 100,
        simStep: 5,
        unit: "%",
        confidence: 94.0,
        description: "Revolving card statement balances divided by total credit limit limits. Current rate is 68%, creating risk flags.",
        relatedMetric: "Outstanding Revolving Balances: ₹1.36L / Limit: ₹2.0L",
        actionText: "Repay revolving balances to under ₹60,000 (30% utilization) to immediately drop credit risk metrics.",
        impactType: "high"
      },
      {
        name: "Low Savings Buffer",
        key: "savings",
        contribution: 12,
        currentValue: "2.1 Months",
        healthyRange: "> 6 Months",
        rawNumValue: 2.1,
        simMin: 0.5,
        simMax: 12,
        simStep: 0.5,
        unit: " Months",
        confidence: 91.8,
        description: "Number of months liquid reserves could cover fixed outgoings. Current buffer of 2.1 months is below the safe threshold of 6 months.",
        relatedMetric: "Available Liquid Funds: ₹2.4L / Monthly Outgoings: ₹1.14L",
        actionText: "Build emergency cash reserves through systematic monthly deposits into sweep fixed accounts.",
        impactType: "medium"
      },
      {
        name: "Credit History Length",
        key: "age",
        contribution: -11,
        currentValue: "7.2 Years",
        healthyRange: "> 5 Years",
        rawNumValue: 7.2,
        simMin: 1,
        simMax: 15,
        simStep: 0.5,
        unit: " Years",
        confidence: 89.4,
        description: "Length of time since your oldest credit line was established. 7.2 years provides a stable positive weight in risk calculations.",
        relatedMetric: "Oldest Account Active Since: March 2019",
        actionText: "Keep credit accounts open even if unused to protect oldest historical active date indicators.",
        impactType: "medium"
      },
      {
        name: "Stable Salary Credits",
        key: "salary",
        contribution: -8,
        currentValue: "₹1,20,000/mo",
        healthyRange: "> ₹50,000/mo",
        rawNumValue: 120000,
        simMin: 30000,
        simMax: 300000,
        simStep: 10000,
        unit: " INR",
        confidence: 95.1,
        description: "Regular incoming payroll credits verifying active stable employment. Consistent credits provide a negative risk offset.",
        relatedMetric: "12 Consecutive Payroll Deposits from TechCorp Ltd.",
        actionText: "Maintain steady payroll credit channels to verify consistent debt servicing capacity.",
        impactType: "low"
      }
    ]
  },
  fraud: {
    baseValue: 2,
    finalValue: 70,
    statusText: "SUSPICIOUS ALERT",
    statusVariant: "warning",
    confidence: 91.5,
    lastUpdated: "12 Minutes Ago",
    summaryLabel: "TRANSACTION ANOMALY SCORE",
    plainEnglishSummary: "This transaction is flagged as suspicious due to an extremely high velocity (5 transactions in under a minute) and an unusual amount (₹45,000, which is 4.5x your average). The location also differs from your typical login patterns. However, the transaction was executed from your primary trusted device, which lowers the absolute fraud probability.",
    expandedExplanation: "The isolation forest neural network model compares real-time checkout payloads against your established customer profile vector. The high transaction velocity trigger registers anomalous card sweeps in rapid succession, a hallmark of credential harvesting. Geolocation mismatch further spikes flags, though device fingerprint matches mitigate the danger score.",
    features: [
      {
        name: "Transaction Velocity",
        key: "velocity",
        contribution: 35,
        currentValue: "5 tx/min",
        healthyRange: "< 2 tx/min",
        rawNumValue: 5,
        simMin: 1,
        simMax: 10,
        simStep: 1,
        unit: " tx",
        confidence: 93.6,
        description: "Frequency of checkout requests processed under a single card token in a 60-second window. Current speed is 5 tx/min.",
        relatedMetric: "Last 5 Transactions: Within 58 seconds",
        actionText: "Verify current checkout queueing to ensure script loops or automated checkouts are disabled.",
        impactType: "critical"
      },
      {
        name: "Unusual Ticket Amount",
        key: "amount",
        contribution: 25,
        currentValue: "₹45,000",
        healthyRange: "< ₹10,000",
        rawNumValue: 45000,
        simMin: 1000,
        simMax: 200000,
        simStep: 5000,
        unit: " INR",
        confidence: 95.8,
        description: "Deviation from your historical median transaction amount. Current request is 4.5x larger than typical daily ticket values.",
        relatedMetric: "Current Ticket: ₹45,000 / Median Daily Ticket: ₹9,800",
        actionText: "Ensure pre-authorization thresholds are configured for high-value transactional flows.",
        impactType: "high"
      },
      {
        name: "IP Geolocation",
        key: "geo",
        contribution: 15,
        currentValue: "New Delhi",
        healthyRange: "Mumbai/Pune",
        rawNumValue: 980, // distance in km
        simMin: 10,
        simMax: 2000,
        simStep: 50,
        unit: " km",
        confidence: 88.7,
        description: "Distance in kilometers between the current checkout request IP origin and your primary residence hub.",
        relatedMetric: "IP Address: 103.45.191.12 (Delhi Telecom Hub)",
        actionText: "Disable active VPN tunnels routing traffic away from your physical checkout location.",
        impactType: "medium"
      },
      {
        name: "Off-Hours Checkout",
        key: "hours",
        contribution: 8,
        currentValue: "3:14 AM",
        healthyRange: "6 AM - 11 PM",
        rawNumValue: 3.25,
        simMin: 0,
        simMax: 24,
        simStep: 0.5,
        unit: " hrs",
        confidence: 91.2,
        description: "Time of day the transaction request was initiated. Late-night checkouts register higher anomalous risk weights.",
        relatedMetric: "Request Time: 03:14:12 IST",
        actionText: "Be aware that late-night checkouts are monitored with stricter fraud verification rules.",
        impactType: "low"
      },
      {
        name: "Trusted Device Match",
        key: "device",
        contribution: -15,
        currentValue: "Verified Device",
        healthyRange: "Matches",
        rawNumValue: 1, // binary match
        simMin: 0,
        simMax: 1,
        simStep: 1,
        unit: " match",
        confidence: 97.4,
        description: "Match coefficient of hardware, browser, and security cookie tokens against registered devices. Direct match lowers score.",
        relatedMetric: "Hardware Signature ID: #FD-9988X (Primary iPhone)",
        actionText: "Always authenticate through registered primary devices to clear transaction queues without delays.",
        impactType: "high"
      }
    ]
  },
  health: {
    baseValue: 50,
    finalValue: 76,
    statusText: "EXCELLENT HEALTH",
    statusVariant: "positive",
    confidence: 98.0,
    lastUpdated: "1 Hour Ago",
    summaryLabel: "FINANCIAL HEALTH SCORE",
    plainEnglishSummary: "Your financial health is graded as Excellent, boosted by your robust savings cushion (6.2 months of expenses) and keeping your revolving credit utilization low (14%). Your diverse investment portfolio also adds stability. The main areas holding your score back are your higher-than-ideal debt obligations (28% DTI) and a recent one-off large transaction of ₹85,000.",
    expandedExplanation: "The health rating represents a composite index derived from cash buffer coefficients, investment diversification scores, and credit burden levels. Maintaining active assets across multiple funds provides a solid defense, though reducing fixed debt overhead remains key to unlocking the highest grade bracket.",
    features: [
      {
        name: "Savings Cushion",
        key: "savings",
        contribution: 15,
        currentValue: "6.2 Months",
        healthyRange: "> 3 Months",
        rawNumValue: 6.2,
        simMin: 1,
        simMax: 12,
        simStep: 0.5,
        unit: " Months",
        confidence: 96.1,
        description: "Months of basic living expenses covered by liquid cash reserves. Current status provides strong baseline protection.",
        relatedMetric: "Reserves: ₹7,44,000 / Expenses: ₹1,20,000",
        actionText: "Continue allocating surplus cash to high-yield liquid mutual funds to maintain this cushion.",
        impactType: "high"
      },
      {
        name: "Revolving Debt Utilization",
        key: "debt",
        contribution: 12,
        currentValue: "14%",
        healthyRange: "< 30%",
        rawNumValue: 14,
        simMin: 5,
        simMax: 90,
        simStep: 5,
        unit: "%",
        confidence: 95.3,
        description: "Revolving balance draw compared to limits. Keeping utilization under 15% demonstrates excellent credit control.",
        relatedMetric: "Active Card Outstanding: ₹28,000 / Limit: ₹2,00,000",
        actionText: "Keep credit card utilization below 30% to maximize financial health scores.",
        impactType: "high"
      },
      {
        name: "Investment Diversity",
        key: "diversity",
        contribution: 8,
        currentValue: "Diverse Portfolio",
        healthyRange: "> 2 Assets",
        rawNumValue: 3, // count of asset classes
        simMin: 1,
        simMax: 5,
        simStep: 1,
        unit: " assets",
        confidence: 90.5,
        description: "Number of unique asset categories held. Your portfolio contains Mutual Funds, Gold ETFs, and Fixed Deposits.",
        relatedMetric: "Portfolio Holdings: 3 Distinct Asset Classes",
        actionText: "Consider adding sovereign gold bonds or index funds to broaden diversification weights.",
        impactType: "medium"
      },
      {
        name: "Monthly Savings Rate",
        key: "rate",
        contribution: 6,
        currentValue: "34%",
        healthyRange: "> 20%",
        rawNumValue: 34,
        simMin: 5,
        simMax: 60,
        simStep: 1,
        unit: "%",
        confidence: 93.0,
        description: "Percentage of regular monthly cash inflow directed to savings or long-term investments. Current rate is 34%.",
        relatedMetric: "Monthly Surplus Invested: ₹40,800 / Income: ₹1,20,000",
        actionText: "Automate surplus transfers on payday to keep savings targets consistent.",
        impactType: "medium"
      },
      {
        name: "One-Off Large Expense",
        key: "expense",
        contribution: -5,
        currentValue: "₹85,000",
        healthyRange: "< ₹30,000",
        rawNumValue: 85000,
        simMin: 5000,
        simMax: 200000,
        simStep: 5000,
        unit: " INR",
        confidence: 92.4,
        description: "Isolated high-value discretionary spend registered this billing cycle, creating a minor short-term impact.",
        relatedMetric: "Out-of-pattern Transaction: ₹85,000 (Consumer Electronics)",
        actionText: "Spread major discretionary purchases across monthly cycles using interest-free payment options.",
        impactType: "low"
      },
      {
        name: "Debt Obligation (DTI)",
        key: "dti",
        contribution: -10,
        currentValue: "28%",
        healthyRange: "< 20%",
        rawNumValue: 28,
        simMin: 5,
        simMax: 50,
        simStep: 1,
        unit: "%",
        confidence: 94.7,
        description: "Percentage of gross earnings consumed by active loan repayments. Current ratio is 28%.",
        relatedMetric: "EMI Payments: ₹33,600 / Monthly Income: ₹1,20,000",
        actionText: "Focus surplus cash on prepaying high-interest debt to reduce fixed overheads below 20%.",
        impactType: "medium"
      }
    ]
  },
  cashflow: {
    baseValue: 5,
    finalValue: 18,
    statusText: "LOW RISK",
    statusVariant: "positive",
    confidence: 92.4,
    lastUpdated: "5 Minutes Ago",
    summaryLabel: "30-DAY OUT-OF-FUNDS RISK",
    plainEnglishSummary: "Your liquidity risk for the next 30 days remains low at 18%. While a delayed vendor inflow (+20%) and upcoming annual software renewals create cash pressure, your active auto-sweep fixed deposit of ₹2.5 Lakhs and highly reliable salary credit on the 30th of the month ensure you maintain a safe liquid cushion.",
    expandedExplanation: "The liquidity assessment model predicts the probability of your primary checking account dropping below zero. Using recursive time series modeling, the system identifies upcoming cash stress indicators and balances them against linked secondary reserve channels.",
    features: [
      {
        name: "Expected Inflow Delay",
        key: "delay",
        contribution: 20,
        currentValue: "4 Days Late",
        healthyRange: "0 Days",
        rawNumValue: 4,
        simMin: 0,
        simMax: 14,
        simStep: 1,
        unit: " Days",
        confidence: 90.2,
        description: "Delayed business or vendor invoicing credits expected this week. Delay increases working capital risk indices.",
        relatedMetric: "Outstanding Invoice Credit: ₹48,000 (4 days overdue)",
        actionText: "Automate invoice follow-ups or establish short-term payment links to accelerate payments.",
        impactType: "high"
      },
      {
        name: "Subscription Renewals",
        key: "subscriptions",
        contribution: 8,
        currentValue: "₹4,800 Due",
        healthyRange: "< ₹5,000",
        rawNumValue: 4800,
        simMin: 1000,
        simMax: 20000,
        simStep: 1000,
        unit: " INR",
        confidence: 95.4,
        description: "Cumulative billing for automated services and SaaS platforms scheduled in the next 15 days.",
        relatedMetric: "Scheduled Renewals: 3 items totaling ₹4,800",
        actionText: "Audit active subscriptions and disable unused recurring checkouts to protect cash reserves.",
        impactType: "low"
      },
      {
        name: "Discretionary Overspending",
        key: "spending",
        contribution: 5,
        currentValue: "+15% vs budget",
        rawNumValue: 15,
        simMin: -20,
        simMax: 50,
        simStep: 5,
        unit: "%",
        healthyRange: "< 10%",
        confidence: 89.6,
        description: "Current month entertainment and dining spending compared to your baseline allowance budget.",
        relatedMetric: "Food & Entertainment Spending: ₹18,400 (₹2,400 over budget)",
        actionText: "Leverage category caps in your savings vault to lock discretionary spending budgets.",
        impactType: "low"
      },
      {
        name: "Auto-Sweep Reserve",
        key: "reserve",
        contribution: -12,
        currentValue: "₹2,50,000",
        healthyRange: "> ₹1L",
        rawNumValue: 250000,
        simMin: 0,
        simMax: 500000,
        simStep: 25000,
        unit: " INR",
        confidence: 94.1,
        description: "Auto-linked fixed deposit reserves designed to clear checking account debits when low. Acts as an automatic safety net.",
        relatedMetric: "Linked Savings Sweep: ₹2,50,000 balance",
        actionText: "Keep sweep-in limits active to prevent transactional checkouts from bouncing.",
        impactType: "high"
      },
      {
        name: "Stable Salary Deposit",
        key: "salary",
        contribution: -8,
        currentValue: "₹1,20,000 on 30th",
        healthyRange: "Regular",
        rawNumValue: 120000,
        simMin: 30000,
        simMax: 300000,
        simStep: 10000,
        unit: " INR",
        confidence: 96.8,
        description: "Highly stable monthly income credit scheduled on the last business day of the cycle, reducing risk.",
        relatedMetric: "Scheduled Salary Credit: July 30, 2026",
        actionText: "Maintain stable wage records to provide steady baseline liquid inflows.",
        impactType: "medium"
      }
    ]
  }
};

const GLOBAL_FEATURE_IMPORTANCE: Record<string, { name: string; globalImportance: number; localImportance: number }[]> = {
  credit: [
    { name: "Debt-to-Income Ratio", globalImportance: 28, localImportance: 24 },
    { name: "Late Payments (12M)", globalImportance: 22, localImportance: 18 },
    { name: "Credit Utilization", globalImportance: 18, localImportance: 15 },
    { name: "Savings Buffer", globalImportance: 14, localImportance: 12 },
    { name: "Credit History Length", globalImportance: 10, localImportance: 11 },
    { name: "Stable Salary Credits", globalImportance: 8, localImportance: 8 }
  ],
  fraud: [
    { name: "Transaction Velocity", globalImportance: 30, localImportance: 35 },
    { name: "Unusual Ticket Amount", globalImportance: 25, localImportance: 25 },
    { name: "IP Geolocation", globalImportance: 20, localImportance: 15 },
    { name: "Trusted Device Match", globalImportance: 15, localImportance: 15 },
    { name: "Off-Hours Checkout", globalImportance: 10, localImportance: 8 }
  ],
  health: [
    { name: "Savings Cushion", globalImportance: 25, localImportance: 15 },
    { name: "Revolving Debt Utilization", globalImportance: 22, localImportance: 12 },
    { name: "Debt Obligation (DTI)", globalImportance: 18, localImportance: 10 },
    { name: "Monthly Savings Rate", globalImportance: 15, localImportance: 6 },
    { name: "Investment Diversity", globalImportance: 12, localImportance: 8 },
    { name: "One-Off Large Expense", globalImportance: 8, localImportance: 5 }
  ],
  cashflow: [
    { name: "Expected Inflow Delay", globalImportance: 26, localImportance: 20 },
    { name: "Auto-Sweep Reserve", globalImportance: 22, localImportance: 12 },
    { name: "Stable Salary Deposit", globalImportance: 18, localImportance: 8 },
    { name: "Subscription Renewals", globalImportance: 14, localImportance: 8 },
    { name: "Discretionary Overspending", globalImportance: 10, localImportance: 5 }
  ]
};

const TRANSPARENCY_INFO: Record<string, ModelDetails> = {
  credit: {
    modelType: "XGBoost Classifier (Extreme Gradient Boosting v2.1.0)",
    explanationMethod: "TreeSHAP (Cooperative game theory attribution)",
    categoriesUsed: ["Credit Card Statements", "EMI Payment Logs", "Bureau Score History", "Verified Income Credits"],
    lastTrained: "July 1, 2026",
    trainingSamples: "480k Customer Records"
  },
  fraud: {
    modelType: "Isolation Forest + Autoencoder Neural Network (PyTorch)",
    explanationMethod: "KernelSHAP (Perturbation-based local explanation)",
    categoriesUsed: ["Transaction Location IP", "Merchant Category Codes", "Device Fingerprints", "Historical Ticket Median"],
    lastTrained: "Daily Automated (Last: July 8, 2026)",
    trainingSamples: "12.8M Transaction Logs"
  },
  health: {
    modelType: "LightGBM Regressor (v3.5.2)",
    explanationMethod: "TreeSHAP (Optimized tree-explainer algorithm)",
    categoriesUsed: ["Fixed Assets Ledger", "Revolving Card Draws", "Emergency Reserve Sweep accounts", "Net Monthly Surplus"],
    lastTrained: "July 5, 2026",
    trainingSamples: "250k Premium Accounts"
  },
  cashflow: {
    modelType: "Temporal Fusion Transformer (TFT) LSTM Network",
    explanationMethod: "DeepSHAP (Deep Learning Integrated Gradients)",
    categoriesUsed: ["Invoice Clearing Cycles", "Subscription Invoices", "Checking Account Balances", "Day-of-Week Inflows"],
    lastTrained: "July 7, 2026",
    trainingSamples: "80k Business/Customer Cash Registers"
  }
};

export default function ExplainableAIPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Tab State
  const [activeTab, setActiveTab] = useState<string>("credit");

  // Selection state for Feature Drawer / Simulation
  const [selectedFeature, setSelectedFeature] = useState<ShapFeature | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Simulation states initialized with credit risk values
  const [simulatedValues, setSimulatedValues] = useState<Record<string, number>>(() => {
    const initialSimValues: Record<string, number> = {};
    MODEL_EXPLANATIONS.credit.features.forEach((f) => {
      initialSimValues[f.key] = f.rawNumValue;
    });
    return initialSimValues;
  });
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // Tab change handler to update tab and reset parameters
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setSelectedFeature(null);
    const newData = MODEL_EXPLANATIONS[tabId];
    const initialSimValues: Record<string, number> = {};
    newData.features.forEach((f) => {
      initialSimValues[f.key] = f.rawNumValue;
    });
    setSimulatedValues(initialSimValues);
  }, []);

  // Expandable Plain-English Explanation Accordion state
  const [isExplanationExpanded, setIsExplanationExpanded] = useState<boolean>(false);

  // Feature Importance toggle state (Global vs My Prediction)
  const [importanceMode, setImportanceMode] = useState<"global" | "local">("local");

  // ECharts refs
  const importanceChartRef = useRef<HTMLDivElement>(null);
  const sparklineChartRef = useRef<HTMLDivElement>(null);

  const importanceChartInstance = useRef<echarts.ECharts | null>(null);
  const sparklineInstance = useRef<echarts.ECharts | null>(null);

  // Active Explanations Data helper
  const activeData = useMemo<ShapData>(() => MODEL_EXPLANATIONS[activeTab], [activeTab]);

  // Handle Simulation values slider change
  const handleSimulationValueChange = useCallback((key: string, value: number) => {
    setSimulatedValues((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Recalculate dynamic prediction score based on simulation inputs
  const simulatedFinalScore = useMemo(() => {
    let deltaSum = 0;
    activeData.features.forEach((f) => {
      const initialVal = f.rawNumValue;
      const currentVal = simulatedValues[f.key] ?? initialVal;

      // feature multiplier effect on risk
      let weight = f.contribution;
      if (f.key === "dti" || f.key === "utilization" || f.key === "late" || f.key === "velocity" || f.key === "amount" || f.key === "geo" || f.key === "hours" || f.key === "delay" || f.key === "subscriptions" || f.key === "spending" || f.key === "expense") {
        weight = f.contribution * (currentVal / initialVal);
      } else {
        weight = f.contribution * (currentVal / initialVal);
      }
      
      deltaSum += weight;
    });

    const calculated = activeData.baseValue + deltaSum;
    return Math.min(Math.max(Math.round(calculated), 0), 100);
  }, [simulatedValues, activeData]);

  // Format active simulator display
  const simulatedStatus = useMemo(() => {
    const score = simulatedFinalScore;
    if (activeTab === "health") {
      if (score >= 80) return { label: "EXCELLENT HEALTH", variant: "positive" };
      if (score >= 60) return { label: "GOOD HEALTH", variant: "warning" };
      return { label: "RISK PROFILE WARNING", variant: "critical" };
    } else {
      if (score >= 70) return { label: "HIGH RISK / SUSPICIOUS", variant: "critical" };
      if (score >= 35) return { label: "MODERATE RISK", variant: "warning" };
      return { label: "LOW RISK / SAFE", variant: "positive" };
    }
  }, [simulatedFinalScore, activeTab]);

  // Setup Global vs Local Importance Chart
  useEffect(() => {
    if (!importanceChartRef.current) return;
    
    // Dispose previous instance if exists
    if (importanceChartInstance.current) {
      importanceChartInstance.current.dispose();
    }

    const chart = echarts.init(importanceChartRef.current);
    importanceChartInstance.current = chart;

    const data = GLOBAL_FEATURE_IMPORTANCE[activeTab];
    const categoryNames = data.map((d) => d.name);
    
    // Decide values based on mode toggle
    const seriesValues = data.map((d) => 
      importanceMode === "global" ? d.globalImportance : d.localImportance
    );

    const textColor = isDark ? "#94A3B8" : "#64748B"; // var(--foreground-secondary)
    const gridLineColor = isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(226, 232, 240, 0.6)";
    const barColor = activeTab === "health" ? "#22c55e" : activeTab === "fraud" ? "#f97316" : "#4F7CFF";

    const option: echarts.EChartsOption = {
      grid: {
        top: 15,
        right: 20,
        bottom: 25,
        left: 140
      },
      xAxis: {
        type: "value",
        splitLine: { lineStyle: { color: gridLineColor } },
        axisLabel: { color: textColor, fontSize: 9 },
        max: 40
      },
      yAxis: {
        type: "category",
        data: [...categoryNames].reverse(), // copy and reverse to show top down
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, fontSize: 9, width: 130, overflow: "break" }
      },
      series: [
        {
          name: importanceMode === "global" ? "Global Importance" : "Your Contribution",
          type: "bar",
          data: [...seriesValues].reverse(),
          barWidth: "45%",
          itemStyle: {
            color: barColor,
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: "right",
            formatter: "{c}%",
            fontSize: 9,
            color: isDark ? "#F8FAFC" : "#0F172A",
            fontFamily: "var(--font-mono)"
          }
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      importanceChartInstance.current = null;
    };
  }, [activeTab, importanceMode, isDark]);

  // Setup Drawer Mini Sparkline Trend Chart
  useEffect(() => {
    if (!isDrawerOpen || !selectedFeature || !sparklineChartRef.current) return;

    if (sparklineInstance.current) {
      sparklineInstance.current.dispose();
    }

    const chart = echarts.init(sparklineChartRef.current);
    sparklineInstance.current = chart;

    // Generate mock historical sequence over 6 periods
    const baseVal = selectedFeature.rawNumValue;
    const historyData = [
      Math.round(baseVal * 1.15),
      Math.round(baseVal * 1.05),
      Math.round(baseVal * 0.95),
      Math.round(baseVal * 1.08),
      Math.round(baseVal * 1.02),
      Math.round(baseVal)
    ];

    const timeline = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    const isDarkTheme = isDark;
    const primaryColor = activeTab === "health" ? "#22c55e" : "#4F7CFF";

    const option: echarts.EChartsOption = {
      grid: {
        top: 20,
        right: 15,
        bottom: 25,
        left: 45
      },
      xAxis: {
        type: "category",
        data: timeline,
        axisLine: { lineStyle: { color: isDarkTheme ? "#334155" : "#CBD5E1" } },
        axisLabel: { color: isDarkTheme ? "#94A3B8" : "#64748B", fontSize: 9 }
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: isDarkTheme ? "rgba(51, 65, 85, 0.4)" : "rgba(226, 232, 240, 0.6)" } },
        axisLabel: { color: isDarkTheme ? "#94A3B8" : "#64748B", fontSize: 9 }
      },
      series: [
        {
          data: historyData,
          type: "line",
          smooth: true,
          symbolSize: 6,
          itemStyle: { color: primaryColor },
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: primaryColor + "33" },
              { offset: 1, color: primaryColor + "00" }
            ])
          }
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      sparklineInstance.current = null;
    };
  }, [isDrawerOpen, selectedFeature, isDark, activeTab]);

  // Open factor drawer
  const openFactorDetail = useCallback((feature: ShapFeature) => {
    setSelectedFeature(feature);
    setIsDrawerOpen(true);
  }, []);

  // Reset simulated settings back to defaults
  const handleResetSimulation = useCallback(() => {
    const initialSimValues: Record<string, number> = {};
    activeData.features.forEach((f) => {
      initialSimValues[f.key] = f.rawNumValue;
    });
    setSimulatedValues(initialSimValues);
    toast.success("Simulation parameters reset to actual model values.");
  }, [activeData]);

  // Waterfall Chart Layout Math
  const waterfallChain = useMemo(() => {
    const items = [];
    let currentAccum = activeData.baseValue;

    // Item 1: Base Value
    items.push({
      name: "Base Value / Expected Model Baseline",
      key: "base",
      start: 0,
      end: activeData.baseValue,
      contribution: activeData.baseValue,
      isBaseOrFinal: true,
      currentValue: `${activeData.baseValue}%`,
      description: "Initial raw risk baseline computed from regional historical models."
    });

    // Features
    activeData.features.forEach((f) => {
      const nextAccum = currentAccum + f.contribution;
      items.push({
        name: f.name,
        key: f.key,
        start: currentAccum,
        end: nextAccum,
        contribution: f.contribution,
        isBaseOrFinal: false,
        currentValue: f.currentValue,
        description: f.description
      });
      currentAccum = nextAccum;
    });

    // Item 3: Final Value
    items.push({
      name: "Final Prediction Score",
      key: "final",
      start: 0,
      end: activeData.finalValue,
      contribution: activeData.finalValue,
      isBaseOrFinal: true,
      currentValue: `${activeData.finalValue}%`,
      description: "Net simulated risk index compiled from all feature vectors."
    });

    const allVals = items.flatMap(x => [x.start, x.end]);
    const maxVal = Math.max(...allVals, 100);
    const minVal = Math.min(...allVals, 0);

    return {
      items,
      min: minVal,
      max: maxVal
    };
  }, [activeData]);

  // Utility to scale value to layout percentage
  const getScalePercent = useCallback((val: number, min: number, max: number) => {
    if (max === min) return 0;
    return ((val - min) / (max - min)) * 100;
  }, []);

  const transparency = useMemo(() => TRANSPARENCY_INFO[activeTab], [activeTab]);

  return (
    <PageContainer className="pb-24">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-border/60 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <Brain className="h-6.5 w-6.5 text-primary" /> EXPLAINABLE AI
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Every prediction should have a reason. ArthDrishti explains not only <span className="font-semibold text-primary">WHAT</span> the model predicted, but <span className="font-semibold text-primary">WHY</span>.
          </p>
        </div>

        {/* Prediction Selector Tab Row */}
        <div className="flex flex-wrap gap-1 bg-surface-elevated border border-border p-1 rounded-sm">
          {[
            { id: "credit", label: "Credit Risk", icon: ShieldAlert },
            { id: "fraud", label: "Fraud Anomaly", icon: Fingerprint },
            { id: "health", label: "Financial Health", icon: HeartPulse },
            { id: "cashflow", label: "Cash Flow Forecast", icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-[10.5px] uppercase font-sans font-bold transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground-secondary hover:text-foreground hover:bg-surface"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* PREDICTION SUMMARY CARD (LEFT COL - 4 COLS) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-start">
          <Card className="border border-border/80 bg-surface p-5 select-none relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-1 border-b border-border/40 pb-4 mb-4">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-foreground-muted">
                {activeData.summaryLabel}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-foreground tracking-tight">
                  {activeTab === "health" ? `${activeData.finalValue}/100` : `${activeData.finalValue}%`}
                </span>
                <span className={cn(
                  "text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border",
                  activeData.statusVariant === "critical"
                    ? "text-critical bg-critical/10 border-critical/20 animate-pulse"
                    : activeData.statusVariant === "warning"
                    ? "text-warning bg-warning/10 border-warning/20"
                    : "text-positive bg-positive/10 border-positive/20"
                )}>
                  {activeData.statusText}
                </span>
              </div>
            </div>

            {/* Radial Gauge / Visual Indicator Ring */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Outer Track Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="var(--border)"
                    strokeWidth="8"
                    className="opacity-50"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={
                      activeData.statusVariant === "critical"
                        ? "#EF4444"
                        : activeData.statusVariant === "warning"
                        ? "#F97316"
                        : "#22C55E"
                    }
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * activeData.finalValue) / 100 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </svg>
                {/* Inside details */}
                <div className="absolute flex flex-col items-center justify-center font-sans">
                  <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                    {activeData.finalValue}%
                  </span>
                  <span className="text-[9px] text-foreground-muted uppercase tracking-wider font-semibold">
                    Risk Ratio
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4 mt-2">
              <div className="space-y-0.5">
                <span className="text-[9px] text-foreground-muted block font-sans font-bold uppercase tracking-wider">Model Confidence</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {activeData.confidence}%
                </span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[9px] text-foreground-muted block font-sans font-bold uppercase tracking-wider">Last Prediction</span>
                <span className="text-xs font-semibold text-foreground-secondary flex items-center justify-end gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive inline-block" />
                  {activeData.lastUpdated}
                </span>
              </div>
            </div>
          </Card>

          {/* SIMULATION SUMMARY PREVIEW CARD */}
          <AnimatePresence>
            {Object.values(simulatedValues).some((v, idx) => v !== activeData.features[idx]?.rawNumValue) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-primary bg-primary/5 p-5 select-none relative overflow-hidden space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase font-sans">
                      <Sliders className="h-4 w-4" /> Live Simulation Preview
                    </span>
                    <button
                      onClick={handleResetSimulation}
                      className="text-[9px] font-sans font-bold hover:underline uppercase text-foreground-secondary flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                    <div>
                      <span className="text-[10px] text-foreground-muted uppercase font-sans font-semibold">Simulated Probability</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold font-mono text-foreground">
                          {simulatedFinalScore}%
                        </span>
                        <span className="text-[11px] font-bold text-foreground-muted">
                          (vs {activeData.finalValue}%)
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border",
                      simulatedStatus.variant === "critical"
                        ? "text-critical bg-critical/10 border-critical/20"
                        : simulatedStatus.variant === "warning"
                        ? "text-warning bg-warning/10 border-warning/20"
                        : "text-positive bg-positive/10 border-positive/20"
                    )}>
                      {simulatedStatus.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-foreground-secondary font-sans leading-relaxed">
                    {simulatedFinalScore < activeData.finalValue ? (
                      <span className="text-positive font-semibold flex items-center gap-1">
                        ✦ Risk reduced by {activeData.finalValue - simulatedFinalScore}% under simulated adjustments.
                      </span>
                    ) : simulatedFinalScore > activeData.finalValue ? (
                      <span className="text-critical font-semibold flex items-center gap-1">
                        ▲ Warning: Risk expanded by {simulatedFinalScore - activeData.finalValue}% under simulated metrics.
                      </span>
                    ) : (
                      "Simulation values match active model prediction vectors."
                    )}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SHAP WATERFALL EXPLORER CARD (RIGHT COL - 8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-border/80 bg-surface p-5 md:p-6 flex flex-col justify-between min-h-[460px] relative overflow-visible">
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 select-none">
              <div className="space-y-1">
                <h3 className="text-xs uppercase tracking-widest text-foreground-muted font-bold flex items-center gap-1.5">
                  SHAP Waterfall Explorer <Sparkles className="h-3.5 w-3.5 text-primary" />
                </h3>
                <p className="text-[11px] text-foreground-secondary font-sans">
                  Feature attribution mapping. Hover over feature items to inspect localized weights, impact values, and confidence scores.
                </p>
              </div>
            </div>

            {/* WATERFALL CHART GRID AREA */}
            <div className="flex-1 py-8 relative flex flex-col justify-between font-sans">
              
              {/* Background vertical grid tracks */}
              <div className="absolute inset-0 flex justify-between px-[140px] pointer-events-none select-none">
                {[0, 20, 40, 60, 80, 100].map((val, idx) => (
                  <div
                    key={idx}
                    className="h-full border-l border-border/40 relative flex justify-center"
                    style={{
                      left: `${getScalePercent(val, waterfallChain.min, waterfallChain.max)}%`
                    }}
                  >
                    <span className="absolute bottom-[-16px] text-[8px] font-mono text-foreground-muted tracking-tight">
                      {val}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Waterfall rows list */}
              <div className="space-y-4 relative z-10">
                {waterfallChain.items.map((item, idx) => {
                  const isPositive = item.contribution >= 0;
                  const leftPos = isPositive
                    ? getScalePercent(item.start, waterfallChain.min, waterfallChain.max)
                    : getScalePercent(item.end, waterfallChain.min, waterfallChain.max);
                  const barWidth = Math.abs(
                    getScalePercent(item.end, waterfallChain.min, waterfallChain.max) -
                    getScalePercent(item.start, waterfallChain.min, waterfallChain.max)
                  );

                  const isHovered = hoveredFeature === item.key;
                  const hasActiveHover = hoveredFeature !== null;
                  
                  let barColorClass = "bg-primary/80 border-primary";
                  if (item.key === "base" || item.key === "final") {
                    barColorClass = isDark ? "bg-slate-700/80 border-slate-600" : "bg-slate-400/80 border-slate-500";
                  } else {
                    barColorClass = isPositive
                      ? "bg-critical/80 border-critical shadow-sm shadow-critical/10"
                      : "bg-positive/80 border-positive shadow-sm shadow-positive/10";
                  }

                  return (
                    <div
                      key={item.key}
                      onMouseEnter={() => setHoveredFeature(item.key)}
                      onMouseLeave={() => setHoveredFeature(null)}
                      onClick={() => {
                        const originalFeatureObj = activeData.features.find((f) => f.key === item.key);
                        if (originalFeatureObj) {
                          openFactorDetail(originalFeatureObj);
                        }
                      }}
                      className={cn(
                        "grid grid-cols-12 items-center relative py-1 px-2 rounded-sm transition-all duration-200 cursor-pointer border border-transparent select-none",
                        isHovered && "bg-surface-elevated border-border/80 shadow-md scale-[1.01]",
                        hasActiveHover && !isHovered && "opacity-45 scale-[0.995]"
                      )}
                    >
                      {/* Name label */}
                      <div className="col-span-4 pr-3 text-[11px] font-semibold text-foreground truncate flex items-center gap-1.5">
                        {item.key === "base" || item.key === "final" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        ) : (
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isPositive ? "bg-critical" : "bg-positive"
                          )} />
                        )}
                        {item.name}
                      </div>

                      {/* Bar Plot viewport */}
                      <div className="col-span-6 h-4.5 relative">
                        {/* Connecting dotted guide line to show step progression */}
                        {idx > 0 && (
                          <div
                            className="absolute border-r border-dashed border-foreground-muted/65 pointer-events-none"
                            style={{
                              left: `${getScalePercent(item.start, waterfallChain.min, waterfallChain.max)}%`,
                              height: "26px",
                              top: "-18px"
                            }}
                          />
                        )}

                        {/* Feature Bar */}
                        <motion.div
                          initial={{ scaleX: 0, originX: isPositive ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.5, delay: idx * 0.08 }}
                          className={cn(
                            "h-full rounded-xs border absolute transition-all duration-300",
                            barColorClass
                          )}
                          style={{
                            left: `${leftPos}%`,
                            width: `${Math.max(barWidth, 1.2)}%`
                          }}
                        />
                      </div>

                      {/* Value label */}
                      <div className="col-span-2 text-right pl-2 font-mono text-[10px] font-bold">
                        {item.key === "base" || item.key === "final" ? (
                          <span className="text-foreground">{item.currentValue}</span>
                        ) : (
                          <span className={isPositive ? "text-critical" : "text-positive"}>
                            {isPositive ? "+" : ""}{item.contribution}%
                          </span>
                        )}
                      </div>

                      {/* Tooltip Popup on Hover */}
                      <AnimatePresence>
                        {isHovered && item.key !== "base" && item.key !== "final" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-[34%] top-[-100px] z-50 bg-surface-elevated border border-border p-3 rounded-sm shadow-xl text-xs space-y-1.5 w-72 text-left pointer-events-none select-none"
                          >
                            <div className="flex justify-between items-center border-b border-border/60 pb-1.5">
                              <span className="font-bold text-foreground truncate max-w-[150px]">{item.name}</span>
                              <span className={cn(
                                "text-[9px] font-bold uppercase px-1.5 py-0.25 rounded-xs",
                                isPositive ? "text-critical bg-critical/10" : "text-positive bg-positive/10"
                              )}>
                                {isPositive ? "Increases Risk" : "Reduces Risk"}
                              </span>
                            </div>
                            <div className="space-y-0.5 text-[10.5px]">
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">Current Value:</span>
                                <span className="font-semibold text-foreground font-mono">{item.currentValue}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">Impact Weight:</span>
                                <span className={cn("font-bold font-mono", isPositive ? "text-critical" : "text-positive")}>
                                  {isPositive ? "+" : ""}{item.contribution}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-foreground-secondary">Feature Confidence:</span>
                                <span className="font-semibold text-foreground font-mono">
                                  {(activeData.features.find(f => f.key === item.key)?.confidence ?? 95).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Accessibility text fallback alternative */}
            <div className="sr-only">
              SHAP contribution table:
              {waterfallChain.items.map((x) => `${x.name}: ${x.contribution}%`).join(", ")}
            </div>
          </Card>
        </div>

      </div>

      {/* FEATURE IMPORTANCE & PLAIN-ENGLISH ACCORDION CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8 select-none">
        
        {/* Global vs Local Chart (6 columns) */}
        <div className="col-span-12 md:col-span-6 space-y-4">
          <Card className="border border-border/80 bg-surface p-5 flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-center border-b border-border/60 pb-3 mb-3">
              <div className="space-y-0.5">
                <h4 className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                  Feature Importance Weightings
                </h4>
                <p className="text-[10px] text-foreground-secondary">
                  Compare global model priorities against your specific account factors.
                </p>
              </div>

              {/* Toggle controls */}
              <div className="flex bg-surface-elevated border border-border p-0.5 rounded-sm">
                <button
                  onClick={() => setImportanceMode("local")}
                  className={cn(
                    "px-2.5 py-1 rounded-xs text-[9.5px] uppercase font-bold cursor-pointer transition-all",
                    importanceMode === "local" ? "bg-surface text-foreground shadow-xs" : "text-foreground-secondary"
                  )}
                >
                  My Prediction
                </button>
                <button
                  onClick={() => setImportanceMode("global")}
                  className={cn(
                    "px-2.5 py-1 rounded-xs text-[9.5px] uppercase font-bold cursor-pointer transition-all",
                    importanceMode === "global" ? "bg-surface text-foreground shadow-xs" : "text-foreground-secondary"
                  )}
                >
                  Global Model
                </button>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[200px] flex items-end">
              <div ref={importanceChartRef} className="w-full h-full min-h-[200px]" />
            </div>

            <div className="text-[9.5px] text-foreground-muted border-t border-border/40 pt-3 mt-3 leading-relaxed">
              {importanceMode === "local" ? (
                <span><strong>My Prediction</strong> shows the exact factor weights that drove your current {activeData.summaryLabel.toLowerCase()}.</span>
              ) : (
                <span><strong>Global Model</strong> illustrates the average importance weights calculated across the entire customer base during training.</span>
              )}
            </div>
          </Card>
        </div>

        {/* Plain-English Explainability Accordion (6 columns) */}
        <div className="col-span-12 md:col-span-6 space-y-4">
          <Card className="border border-border/80 bg-surface p-5 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-1 border-b border-border/60 pb-3 mb-4">
              <h4 className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
                Plain-English Explanation
              </h4>
              <h3 className="text-sm font-semibold text-foreground">
                Why did the model decide this?
              </h3>
            </div>

            <div className="flex-1 flex flex-col justify-start space-y-4">
              <p className="text-xs text-foreground-secondary leading-relaxed font-sans border-l-2 border-primary pl-3 bg-surface-elevated py-2 rounded-r-xs">
                {activeData.plainEnglishSummary}
              </p>

              {/* Progressive disclosure accordion */}
              <div className="border border-border/65 rounded-sm">
                <button
                  onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
                  className="w-full flex justify-between items-center px-3 py-2 text-[10.5px] font-sans font-bold uppercase text-foreground-secondary hover:text-foreground hover:bg-surface-elevated transition-all cursor-pointer"
                >
                  <span>Technical Model Narrative</span>
                  <ChevronDown className={cn("h-4 w-4 transition-all duration-300", isExplanationExpanded && "transform rotate-180")} />
                </button>
                <AnimatePresence>
                  {isExplanationExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border/60"
                    >
                      <div className="p-3 text-[11px] text-foreground-secondary leading-relaxed font-sans bg-surface-elevated">
                        {activeData.expandedExplanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-[10px] text-foreground-muted border-t border-border/40 pt-3 mt-4 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" />
              <span>Attribution weights computed using Cooperative Game Theory vectors (SHAP Values).</span>
            </div>
          </Card>
        </div>

      </div>

      {/* RISK FACTOR EXPLORER GRID */}
      <div className="mt-8 select-none">
        <div className="space-y-1 pb-3 border-b border-border/60 mb-6">
          <h3 className="text-xs uppercase tracking-widest text-foreground-muted font-bold">
            Risk Factor Explorer
          </h3>
          <p className="text-[11px] text-foreground-secondary">
            Select any risk factor to simulate changes, inspect historical benchmarks, and review automated AI recovery actions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeData.features.map((feature) => {
            const isPos = feature.contribution >= 0;
            return (
              <Card
                key={feature.key}
                onClick={() => openFactorDetail(feature)}
                className="border border-border/80 bg-surface hover:border-primary/80 transition-all p-4.5 hover:shadow-lg cursor-pointer flex flex-col justify-between min-h-[145px]"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-foreground">
                      {feature.name}
                    </h4>
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-1.5 py-0.25 rounded-xs font-mono",
                      isPos ? "text-critical bg-critical/5 border border-critical/15" : "text-positive bg-positive/5 border border-positive/15"
                    )}>
                      {isPos ? "+" : ""}{feature.contribution}% Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground-secondary line-clamp-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-border/40 pt-3.5 mt-3 text-[10px] font-mono">
                  <div>
                    <span className="text-[9px] text-foreground-muted block font-sans">Current Value</span>
                    <span className="font-semibold text-foreground">{feature.currentValue}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-foreground-muted block font-sans">Confidence</span>
                    <span className="font-semibold text-foreground-secondary">{feature.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* MODEL TRANSPARENCY BLOCK (PROGRESSIVE DISCLOSURE) */}
      <div className="mt-8 border-t border-border/85 pt-6 select-none">
        <Card className="border border-border/70 bg-surface-elevated/45 p-5">
          <details className="group">
            <summary className="w-full flex justify-between items-center list-none cursor-pointer">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-foreground-secondary" />
                <div className="text-left font-sans">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground-muted">Model Integrity & Transparency</h4>
                  <p className="text-[11px] text-foreground-secondary">Audit configuration metadata, validation parameters, and underlying training sets.</p>
                </div>
              </div>
              <ChevronDown className="h-4.5 w-4.5 text-foreground-secondary group-open:rotate-180 transition-all duration-300" />
            </summary>

            <div className="mt-5 border-t border-border/60 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
              <div className="space-y-1">
                <span className="text-[9px] text-foreground-muted font-bold uppercase tracking-wider block">Classifier Engine</span>
                <span className="text-xs text-foreground font-semibold block">{transparency.modelType}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-foreground-muted font-bold uppercase tracking-wider block">Attribution Algorithm</span>
                <span className="text-xs text-foreground font-semibold block">{transparency.explanationMethod}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-foreground-muted font-bold uppercase tracking-wider block">Last Model Update</span>
                <span className="text-xs text-foreground font-semibold block">{transparency.lastTrained} ({transparency.trainingSamples})</span>
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
                <span className="text-[9px] text-foreground-muted font-bold uppercase tracking-wider block">Evaluated Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {transparency.categoriesUsed.map((c, i) => (
                    <span key={i} className="text-[10px] bg-surface text-foreground-secondary border border-border px-2.5 py-1 rounded-sm font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </Card>
      </div>

      {/* INTERACTIVE DETAIL SIDE DRAWER (SHEET) */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedFeature?.name ?? "Factor Breakdown"}
        className="w-full max-w-lg select-none font-sans"
      >
        {selectedFeature && (
          <div className="space-y-6 py-4">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-semibold uppercase text-foreground-muted">Model Attribution Overview</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm font-mono border",
                  selectedFeature.contribution >= 0 ? "text-critical bg-critical/10 border-critical/20" : "text-positive bg-positive/10 border-positive/20"
                )}>
                  {selectedFeature.contribution >= 0 ? "Positive Impact Weight" : "Negative Offset Weight"}
                </span>
              </div>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {selectedFeature.description}
              </p>
            </div>

            {/* Metrics parameters grid */}
            <div className="grid grid-cols-2 gap-4 bg-surface-elevated border border-border p-4.5 rounded-sm text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[9px] font-sans text-foreground-muted block uppercase">Current Value</span>
                <span className="text-sm font-bold text-foreground">{selectedFeature.currentValue}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-sans text-foreground-muted block uppercase">Optimal Benchmark</span>
                <span className="text-sm font-bold text-positive">{selectedFeature.healthyRange}</span>
              </div>
              <div className="space-y-1 border-t border-border/40 pt-3">
                <span className="text-[9px] font-sans text-foreground-muted block uppercase">SHAP Attribution</span>
                <span className={cn("text-sm font-extrabold", selectedFeature.contribution >= 0 ? "text-critical" : "text-positive")}>
                  {selectedFeature.contribution >= 0 ? "+" : ""}{selectedFeature.contribution}%
                </span>
              </div>
              <div className="space-y-1 border-t border-border/40 pt-3">
                <span className="text-[9px] font-sans text-foreground-muted block uppercase">Attribution Confidence</span>
                <span className="text-sm font-bold text-foreground-secondary">{selectedFeature.confidence}%</span>
              </div>
            </div>

            {/* Sparkline historical trend */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-foreground-muted font-semibold block">6-Month Trend Timeline</span>
              <div className="h-36 w-full border border-border/60 rounded-sm bg-surface overflow-hidden">
                <div ref={sparklineChartRef} className="w-full h-full" />
              </div>
            </div>

            {/* Interactive Simulation slider */}
            <div className="space-y-4 bg-surface-elevated/45 border border-border/60 p-4.5 rounded-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-foreground-muted flex items-center gap-1">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Simulate Impact
                </span>
                <span className="text-[10px] font-mono font-bold text-foreground bg-surface border border-border px-2 py-0.5 rounded-xs">
                  {simulatedValues[selectedFeature.key] ?? selectedFeature.rawNumValue}
                  {selectedFeature.unit}
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min={selectedFeature.simMin}
                  max={selectedFeature.simMax}
                  step={selectedFeature.simStep}
                  value={simulatedValues[selectedFeature.key] ?? selectedFeature.rawNumValue}
                  onChange={(e) => handleSimulationValueChange(selectedFeature.key, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[9px] font-mono text-foreground-muted">
                  <span>Min: {selectedFeature.simMin}{selectedFeature.unit}</span>
                  <span>Max: {selectedFeature.simMax}{selectedFeature.unit}</span>
                </div>
              </div>

              <p className="text-[10px] text-foreground-secondary font-sans leading-relaxed">
                Move the slider to recalculate the dynamic SHAP weight. Notice how simulated parameter shifts dynamically alter the baseline.
              </p>
            </div>

            {/* Action options */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="bg-surface-elevated border border-border/80 p-3.5 rounded-sm flex items-start gap-2.5">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-foreground block">System Recovery Suggestion</span>
                  <p className="text-[11px] text-foreground-secondary mt-0.5 leading-relaxed">
                    {selectedFeature.actionText}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => {
                    toast.success(`Action registered: Simulation change applied permanently.`);
                    setIsDrawerOpen(false);
                  }}
                  className="w-full text-xs font-semibold cursor-pointer py-2 flex items-center justify-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" /> Apply Change
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info(`Navigating to transactions matching category: ${selectedFeature.name}`);
                    setIsDrawerOpen(false);
                  }}
                  className="w-full text-xs font-semibold cursor-pointer py-2 border-border/60 hover:bg-surface-elevated flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 text-foreground-muted" /> Transactions
                </Button>
              </div>
            </div>

          </div>
        )}
      </Sheet>

    </PageContainer>
  );
}
