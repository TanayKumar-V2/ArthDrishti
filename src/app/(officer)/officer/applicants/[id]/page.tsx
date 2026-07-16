"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import * as echarts from "echarts";
import {
  User,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  FileText,
  Clock,
  History,
  TrendingUp,
  Brain,
  DollarSign,
  Fingerprint,
  Download,
  Share2,
  RefreshCw,
  Info,
  Building,
  ShieldAlert,
  ShieldCheck,
  Search,
  Check,
  CreditCard,
  Layers,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet, Modal } from "@/components/ui/Overlays";
import { StatusBadge, RiskBadge, TrendIndicator } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { OFFICER_APPLICANTS, ApplicantDetail } from "@/lib/officer_data";

// Simple Sparkline chart using SVG
function MiniSparkline({ values, stroke = "#3b82f6" }: { values: number[]; stroke?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const height = 24;
  const width = 80;
  const points = values
    .map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="w-20 h-6 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" points={points} />
    </svg>
  );
}

interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  riskScore: number;
  fraudIndicator: string;
  paymentMethod: string;
  location: string;
  status: string;
  desc: string;
}

interface DocumentFile {
  id: string;
  name: string;
  status: "Verified" | "Pending" | "Error";
  date: string;
  type: string;
  check: string;
}

export default function ApplicantIntelligenceProfilePage() {
  const params = useParams();
  const router = useRouter();
  const applicantId = params?.id as string;

  // Retrieve applicant detail from registry
  const applicant = useMemo<ApplicantDetail | undefined>(() => {
    return OFFICER_APPLICANTS.find((a) => a.id === applicantId);
  }, [applicantId]);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<
    "overview" | "financial" | "credit" | "fraud" | "transactions" | "docs" | "insights" | "timeline"
  >("overview");

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState("");

  // Simulated details drawer for transactions
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isTxDrawerOpen, setIsTxDrawerOpen] = useState(false);

  // Document modal preview
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Officer Comments State
  const [commentText, setCommentText] = useState("");

  // Set initial last analysis timestamp on load
  useEffect(() => {
    const now = new Date();
    const timer = setTimeout(() => {
      setLastAnalysisTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Enrich applicant record with high-fidelity attributes
  const detailedApplicant = useMemo(() => {
    if (!applicant) return null;

    const netSavings = applicant.income - applicant.expenses;
    const isApp1 = applicant.id === "app1";
    const isApp2 = applicant.id === "app2";
    const isApp3 = applicant.id === "app3";

    return {
      ...applicant,
      occupation: isApp1 ? "Senior Software Engineer" : isApp2 ? "Lead Product Designer" : isApp3 ? "Supermarket Owner" : "Financial Analyst",
      employer: isApp1 ? "Tata Consultancy Services" : isApp2 ? "Razorpay India" : isApp3 ? "Sen Enterprises Ltd." : "HDFC Bank Ltd.",
      city: isApp1 ? "Kolkata, WB" : isApp2 ? "Bangalore, KA" : isApp3 ? "Delhi NCR" : "Mumbai, MH",
      customerSince: isApp1 ? "2018-04-12" : isApp2 ? "2020-11-05" : isApp3 ? "2016-08-22" : "2021-03-14",
      creditScore: isApp1 ? 712 : isApp2 ? 840 : isApp3 ? 589 : 765,
      quickSummary: isApp1
        ? "AI model predicts a default probability of 42%, triggering a manual review routing. Risk exposure is primarily driven by high credit card utilization (64%) and debt-to-income limits. These factors are balanced by consistent payroll checks and a 4-month liquid savings safety buffer."
        : isApp2
        ? "AI-approved profile with low default probability (18%) and high confidence. Exhibits excellent financial health (84/100) with zero outstanding debt and a liquid savings buffer covering the entire requested amount."
        : isApp3
        ? "AI recommends Deny. High credit leverage (₹18L outstanding debt) and low savings margins relative to monthly income create severe debt service stress. Experian bureau score stands at 589 with multiple recent inquiries."
        : "Underwriter review flagged due to document telemetry warnings. Financial indices are positive (DTI at 22%), but security coordinates mismatch alerts require manual signature checks.",

      // Snapshots data for KPI cards
      snapshots: [
        { id: "income", title: "Monthly Income", value: `₹${applicant.income.toLocaleString("en-IN")}`, trend: 8.5, context: "Compared to average", values: [110000, 112000, 115000, 118000, 120000, applicant.income], isCurrency: true },
        { id: "expenses", title: "Monthly Expenses", value: `₹${applicant.expenses.toLocaleString("en-IN")}`, trend: -2.1, context: "Down from last month", values: [82000, 81000, 79000, 80000, 78500, applicant.expenses], isCurrency: true },
        { id: "savings", title: "Net Monthly Savings", value: `₹${netSavings.toLocaleString("en-IN")}`, trend: 15.4, context: "Surplus cash reserve", values: [28000, 31000, 36000, 38000, 41500, netSavings], isCurrency: true },
        { id: "debt", title: "Existing Loan Amount", value: `₹${applicant.debt.toLocaleString("en-IN")}`, trend: -4.8, context: "Principal outstanding", values: [480000, 475000, 470000, 462000, 456000, applicant.debt], isCurrency: true },
        { id: "dti", title: "Debt-to-Income Ratio", value: `${Math.round((applicant.expenses / applicant.income) * 100)}%`, trend: -1.8, context: "Healthy under 40%", values: [45, 44, 43, 42, 42, Math.round((applicant.expenses / applicant.income) * 100)], isCurrency: false },
        { id: "utilization", title: "Credit Utilization", value: isApp1 ? "64%" : "12%", trend: 1.5, context: "Card balance ratio", values: [60, 61, 63, 62, 63, isApp1 ? 64 : 12], isCurrency: false },
        { id: "emergency", title: "Emergency Fund", value: `₹${applicant.savings.toLocaleString("en-IN")}`, trend: 5.2, context: "Covers 4mo expenses", values: [300000, 305000, 310000, 312000, 315000, applicant.savings], isCurrency: true },
        { id: "investment", title: "Investment Value", value: `₹${(applicant.savings * 1.5).toLocaleString("en-IN")}`, trend: 12.4, context: "Mutual funds & equities", values: [420000, 435000, 442000, 450000, 465000, applicant.savings * 1.5], isCurrency: true }
      ],

      // Overview specific assets & liabilities
      assets: [
        { name: "Liquid Savings Account", value: applicant.savings, icon: CreditCard, category: "Cash & Cash Equiv." },
        { name: "Investment Portfolio", value: applicant.savings * 1.5, icon: Layers, category: "Mutual Funds" },
        { name: "Real Estate (Residential)", value: applicant.amount * 2, icon: Building, category: "Property Asset" }
      ],
      liabilities: [
        { name: "Outstanding Vehicle Borrowing", value: isApp1 ? 350000 : applicant.debt, icon: Sliders, type: "Automobile Loan" },
        { name: "Active Unsecured Personal Line", value: isApp1 ? 100000 : 0, icon: AlertCircle, type: "Personal Borrowing" },
        { name: "Revolving Card Outstandings", value: isApp1 ? 65000 : 15000, icon: CreditCard, type: "Card Balance" }
      ],
      strengths: [
        "No historical payment defaults on record",
        "Liquid assets exceed requested principal size by 1.2x",
        "Stable employment (6+ years in corporate services)"
      ],
      weaknesses: [
        "Higher credit card utilization (64%) compared to recommended 30%",
        "Recent payment delay of 12 days on vehicle EMI",
        "Multiple hard inquiries on bureau file in last 6 months"
      ],
      recentChanges: [
        { metric: "Monthly Net Savings", change: "+12.4%", status: "positive", date: "Last 30 Days" },
        { metric: "Hard Bureau Inquiries", change: "+2 inquiries", status: "warning", date: "Last 60 Days" },
        { metric: "Outstanding Debt Principal", change: "-₹44,000", status: "positive", date: "Last 90 Days" }
      ],

      // Fraud anomalies list
      fraudAnomalies: [
        { timestamp: "2026-07-01 10:32 AM", description: "IP address geographic coordinate cell mismatch", risk: "Medium" as const },
        { timestamp: "2026-06-28 11:15 PM", description: "Aadhaar e-sign registry validation latency", risk: "Low" as const },
        { timestamp: "2026-06-25 04:22 PM", description: "Biometric face verification failure threshold retry", risk: "Medium" as const }
      ],

      // Document list
      documentFiles: [
        { id: "doc1", name: "Bank Statement (Last 6 Months)", status: "Verified" as const, date: "2026-07-01", type: "PDF/CSV", check: "Integrity matched with system cashflows" },
        { id: "doc2", name: "Salary Slip (June 2026)", status: "Verified" as const, date: "2026-07-01", type: "PDF", check: "Payroll matches verified employer records" },
        { id: "doc3", name: "PAN Card", status: "Verified" as const, date: "2026-06-30", type: "Image/PDF", check: "Tax ID status check passed" },
        { id: "doc4", name: "Aadhaar Card", status: "Verified" as const, date: "2026-06-30", type: "PDF", check: "Biometric KYC e-verification success" },
        { id: "doc5", name: "Income Tax Return (ITR-V FY25)", status: "Verified" as const, date: "2026-07-02", type: "PDF", check: "Total declared earnings matched" },
        { id: "doc6", name: "Employment Verification Letter", status: "Verified" as const, date: "2026-07-01", type: "PDF", check: "HR verification contact successful" },
        { id: "doc7", name: "Draft Loan Agreement", status: "Pending" as const, date: "2026-07-03", type: "PDF", check: "Awaiting final underwriting execution" }
      ],

      // AI Insights priorities
      aiInsightsList: [
        { priority: "High" as const, confidence: 94, title: "Consistent Payroll Direct-Deposits", reason: "Direct payroll deposit credit records match the verified employer profile for 12 consecutive cycles.", impact: "Significantly lowers income instability risk factor.", suggestedAction: "Proceed with verified income routing." },
        { priority: "Medium" as const, confidence: 85, title: "Elevated Revolving Credit Balances", reason: "Active credit card utilization stands at 64%, surpassing the ideal benchmark limit of 30%.", impact: "Triggers minor credit rating downward velocity.", suggestedAction: "Advise card balance reduction prior to underwriting clearance." },
        { priority: "High" as const, confidence: 91, title: "Debt-to-Income Margin Alert", reason: "Active monthly liabilities consume 42% of incoming salary cash, close to the maximum safety bounds.", impact: "High vulnerability to sudden cash flow disruptions.", suggestedAction: "Apply a lower interest rate coupon to decrease the monthly debt service contribution." },
        { priority: "Low" as const, confidence: 78, title: "Substantial Liquid Emergency Buffers", reason: "Liquid savings balances are sufficient to service up to 4 complete monthly debt payments.", impact: "Mitigates short-term default risk exposures.", suggestedAction: "Ensure balances are dynamic and not locked in long deposits." }
      ],

      // Transactions
      transactions: [
        { id: "tx1", date: "2026-07-05", merchant: "Paytm/RentPayment", category: "Housing", amount: -25000, riskScore: 8, fraudIndicator: "No", paymentMethod: "UPI", location: "Kolkata, WB", status: "Settled", desc: "Monthly apartment rental billing auto-debit." },
        { id: "tx2", date: "2026-07-04", merchant: "TCS Payroll Direct", category: "Inflow", amount: 120000, riskScore: 2, fraudIndicator: "No", paymentMethod: "IMPS", location: "Kolkata, WB", status: "Settled", desc: "Corporate monthly payroll credit." },
        { id: "tx3", date: "2026-07-03", merchant: "Amazon India Retailer", category: "Shopping", amount: -4500, riskScore: 12, fraudIndicator: "No", paymentMethod: "Credit Card", location: "Mumbai (Server)", status: "Settled", desc: "Electronics purchase on Amazon marketplace." },
        { id: "tx4", date: "2026-07-02", merchant: "SBI Auto Loan EMI", category: "Debt Service", amount: -12000, riskScore: 5, fraudIndicator: "No", paymentMethod: "ACH Auto", location: "Mumbai, MH", status: "Settled", desc: "Monthly vehicle loan amortization debit." },
        { id: "tx5", date: "2026-07-01", merchant: "HDFC Card Payment", category: "Credit Payment", amount: -15000, riskScore: 10, fraudIndicator: "No", paymentMethod: "NetBanking", location: "Kolkata, WB", status: "Settled", desc: "Credit card monthly statement billing settlement." },
        { id: "tx6", date: "2026-06-28", merchant: "Uber India Rides", category: "Travel", amount: -850, riskScore: 15, fraudIndicator: "No", paymentMethod: "UPI Wallet", location: "Kolkata, WB", status: "Settled", desc: "Ride sharing booking fees." },
        { id: "tx7", date: "2026-06-27", merchant: "Crypto Exchange India", category: "Investment", amount: -20000, riskScore: 68, fraudIndicator: "Yes", paymentMethod: "UPI Wallet", location: "Chennai (Server)", status: "Settled", desc: "Cryptocurrency asset purchase transaction." },
        { id: "tx8", date: "2026-06-26", merchant: "Spencer Supermarket", category: "Groceries", amount: -5800, riskScore: 4, fraudIndicator: "No", paymentMethod: "Debit Card", location: "Kolkata, WB", status: "Settled", desc: "Weekly groceries and household supply billing." },
        { id: "tx9", date: "2026-06-25", merchant: "Croma Digital Electronics", category: "Shopping", amount: -18000, riskScore: 22, fraudIndicator: "No", paymentMethod: "Credit Card", location: "Kolkata, WB", status: "Settled", desc: "Home kitchen appliance purchase." },
        { id: "tx10", date: "2026-06-24", merchant: "Starbucks Coffee", category: "Dining", amount: -420, riskScore: 8, fraudIndicator: "No", paymentMethod: "UPI Wallet", location: "Kolkata, WB", status: "Settled", desc: "Beverages and snacking billing." }
      ]
    };
  }, [applicant]);

  // Timeline events state tracking
  interface TimelineEvent {
    date: string;
    action: string;
    user: string;
    notes: string;
  }

  const [addedEvents, setAddedEvents] = useState<TimelineEvent[]>([]);

  const timelineEvents = useMemo(() => {
    if (!detailedApplicant) return [];
    const baseHistory = [
      ...detailedApplicant.auditHistory,
      { date: "2026-07-01 10:45 AM", action: "Documents Uploaded", user: "Applicant", notes: "Aadhaar, PAN, ITR and Bank Statement uploaded successfully." },
      { date: "2026-07-01 11:00 AM", action: "Fraud Analysis Verification", user: "AI Engine", notes: "Fraud score evaluated at Low. Device fingerprint matched. Geographical logins verified." },
      { date: "2026-07-02 10:15 AM", action: "Credit Risk Profile Analysis", user: "Bureau System", notes: "Experian Credit Score parsed: 712. Active DTI: 42%." },
      { date: "2026-07-02 03:00 PM", action: "AI Insights Generated", user: "Ensemble Models", notes: "Identified high payroll consistency and moderate revolving card usage." }
    ];
    const combined = [...addedEvents, ...baseHistory];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [detailedApplicant, addedEvents]);

  // Transaction filter states
  const [txSearch, setTxSearch] = useState("");
  const [txCategoryFilter, setTxCategoryFilter] = useState("All");
  const [txRiskFilter, setTxRiskFilter] = useState("All");
  const [txSortField, setTxSortField] = useState("date");
  const [txSortOrder, setTxSortOrder] = useState<"asc" | "desc">("desc");

  const filteredTransactions = useMemo(() => {
    if (!detailedApplicant) return [];
    let list = [...detailedApplicant.transactions];

    if (txSearch) {
      const q = txSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }

    if (txCategoryFilter !== "All") {
      list = list.filter((t) => t.category === txCategoryFilter);
    }

    if (txRiskFilter !== "All") {
      if (txRiskFilter === "High") {
        list = list.filter((t) => t.riskScore >= 50);
      } else if (txRiskFilter === "Medium") {
        list = list.filter((t) => t.riskScore >= 20 && t.riskScore < 50);
      } else {
        list = list.filter((t) => t.riskScore < 20);
      }
    }

    list.sort((a: Transaction, b: Transaction) => {
      let valA = a[txSortField as keyof Transaction];
      let valB = b[txSortField as keyof Transaction];

      if (typeof valA === "string" && typeof valB === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return txSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return txSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [detailedApplicant, txSearch, txCategoryFilter, txRiskFilter, txSortField, txSortOrder]);

  const toggleSort = (field: string) => {
    if (txSortField === field) {
      setTxSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setTxSortField(field);
      setTxSortOrder("desc");
    }
  };

  // ECharts refs
  const cashFlowChartRef = useRef<HTMLDivElement>(null);
  const netWorthChartRef = useRef<HTMLDivElement>(null);
  const categoryChartRef = useRef<HTMLDivElement>(null);
  const forecastChartRef = useRef<HTMLDivElement>(null);
  const fraudTimelineChartRef = useRef<HTMLDivElement>(null);
  const healthGaugeRef = useRef<HTMLDivElement>(null);
  const defaultGaugeRef = useRef<HTMLDivElement>(null);

  // Initialize ECharts with Theme listeners
  useEffect(() => {
    if (!detailedApplicant || isLoading) return;

    const chartInstances: echarts.ECharts[] = [];
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#E2E8F0" : "#0F172A";
    const labelColor = isDark ? "#94A3B8" : "#64748B";
    const gridLineColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

    const initChart = (ref: React.RefObject<HTMLDivElement | null>, option: echarts.EChartsOption) => {
      if (!ref.current) return;
      const chart = echarts.init(ref.current);
      chart.setOption(option);
      chartInstances.push(chart);
    };

    if (activeTab === "financial") {
      // 1. Cash Flow & Savings Trend
      initChart(cashFlowChartRef, {
        tooltip: { trigger: "axis" },
        legend: { data: ["Income", "Expenses", "Net Savings"], textStyle: { color: labelColor, fontSize: 9 } },
        grid: { top: 35, bottom: 25, left: 50, right: 15 },
        xAxis: { type: "category", data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], axisLabel: { color: labelColor, fontSize: 9 } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 9 } },
        series: [
          { name: "Income", type: "line", smooth: true, data: [110000, 112000, 115000, 118000, 120000, detailedApplicant.income], itemStyle: { color: "#3b82f6" } },
          { name: "Expenses", type: "line", smooth: true, data: [82000, 81000, 79000, 80000, 78500, detailedApplicant.expenses], itemStyle: { color: "#ef4444" } },
          { name: "Net Savings", type: "bar", data: [28000, 31000, 36000, 38000, 41500, detailedApplicant.income - detailedApplicant.expenses], itemStyle: { color: "#22c55e" } }
        ]
      });

      // 2. Net Worth Growth
      initChart(netWorthChartRef, {
        tooltip: { trigger: "axis" },
        grid: { top: 20, bottom: 25, left: 60, right: 15 },
        xAxis: { type: "category", data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], axisLabel: { color: labelColor, fontSize: 9 } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 9 } },
        series: [
          {
            name: "Net Worth",
            type: "line",
            smooth: true,
            data: [1500000, 1550000, 1610000, 1680000, 1720000, (detailedApplicant.savings * 1.5) + (detailedApplicant.amount * 2) - detailedApplicant.debt],
            itemStyle: { color: "#a855f7" },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(168, 85, 247, 0.3)" }, { offset: 1, color: "rgba(168, 85, 247, 0.0)" }]) }
          }
        ]
      });

      // 3. Category Breakdown Pie
      initChart(categoryChartRef, {
        tooltip: { trigger: "item", formatter: "{b}: ₹{c} ({d}%)" },
        legend: { orient: "vertical", right: 0, top: "center", textStyle: { color: labelColor, fontSize: 9 } },
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            center: ["40%", "50%"],
            avoidLabelOverlap: false,
            label: { show: false },
            data: [
              { value: 25000, name: "Rent/Housing", itemStyle: { color: "#3b82f6" } },
              { value: 12000, name: "Debt Service", itemStyle: { color: "#ef4444" } },
              { value: 5800, name: "Groceries", itemStyle: { color: "#eab308" } },
              { value: 4500, name: "Shopping", itemStyle: { color: "#ec4899" } },
              { value: 20000, name: "Investments", itemStyle: { color: "#10b981" } },
              { value: detailedApplicant.expenses - 67300 > 0 ? detailedApplicant.expenses - 67300 : 8000, name: "Others", itemStyle: { color: "#64748b" } }
            ]
          }
        ]
      });

      // 4. Forecast Summary
      initChart(forecastChartRef, {
        tooltip: { trigger: "axis" },
        legend: { data: ["Projected Income", "EMI Obligations"], textStyle: { color: labelColor, fontSize: 9 } },
        grid: { top: 35, bottom: 25, left: 50, right: 15 },
        xAxis: { type: "category", data: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], axisLabel: { color: labelColor, fontSize: 9 } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 9 } },
        series: [
          { name: "Projected Income", type: "bar", data: [detailedApplicant.income, detailedApplicant.income, detailedApplicant.income * 1.02, detailedApplicant.income * 1.02, detailedApplicant.income * 1.02, detailedApplicant.income * 1.05], itemStyle: { color: "#14b8a6" } },
          { name: "EMI Obligations", type: "bar", data: [16500, 16500, 16500, 16500, 16500, 16500], itemStyle: { color: "#f43f5e" } }
        ]
      });
    }

    if (activeTab === "fraud") {
      initChart(fraudTimelineChartRef, {
        tooltip: { trigger: "axis" },
        grid: { top: 25, bottom: 25, left: 45, right: 15 },
        xAxis: { type: "category", data: ["Jun 15", "Jun 18", "Jun 22", "Jun 25", "Jun 28", "Jul 01"], axisLabel: { color: labelColor, fontSize: 9 } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 9 } },
        series: [
          {
            name: "Anomalous Signatures Score",
            type: "line",
            smooth: true,
            data: [12, 10, 15, 45, 14, detailedApplicant.id === "app4" ? 78 : detailedApplicant.id === "app3" ? 48 : 22],
            itemStyle: { color: "#ef4444" },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(239, 68, 68, 0.2)" }, { offset: 1, color: "rgba(239, 68, 68, 0)" }]) }
          }
        ]
      });
    }

    // Sidebar gauges
    initChart(healthGaugeRef, {
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "85%"],
          axisLine: { lineStyle: { width: 5, color: [[0.4, "#ef4444"], [0.7, "#f59e0b"], [1, "#22c55e"]] } },
          pointer: { width: 2.5, length: "60%", itemStyle: { color: textColor } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { show: false },
          data: [{ value: detailedApplicant.healthScore }]
        }
      ]
    });

    initChart(defaultGaugeRef, {
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "85%"],
          axisLine: { lineStyle: { width: 5, color: [[0.3, "#22c55e"], [0.6, "#f59e0b"], [1, "#ef4444"]] } },
          pointer: { width: 2.5, length: "60%", itemStyle: { color: textColor } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { show: false },
          data: [{ value: detailedApplicant.defaultProb }]
        }
      ]
    });

    const handleResize = () => chartInstances.forEach((c) => c.resize());
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstances.forEach((c) => c.dispose());
    };
  }, [activeTab, isLoading, detailedApplicant]);

  // Action Panel triggers
  const handleRefreshAnalysis = () => {
    setIsLoading(true);
    toast.loading("Analyzing financial ledger files...");
    setTimeout(() => {
      setIsLoading(false);
      const now = new Date();
      setLastAnalysisTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      toast.dismiss();
      toast.success("AI and Credit Bureau diagnostics refreshed successfully.");
    }, 1000);
  };

  const handleDownloadPDF = () => {
    toast.success("Downloading applicant dossier report in PDF format.");
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Applicant Profile link copied to clipboard.");
    }
  };

  const handleSaveNotes = () => {
    if (!commentText.trim()) {
      toast.error("Please enter officer notes first.");
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
      2,
      "0"
    )} ${now.getHours() >= 12 ? "PM" : "AM"}`;

    const newEvent = {
      date: formattedDate,
      action: "Officer Notes Updated",
      user: "Officer Rahul",
      notes: commentText.trim()
    };

    setAddedEvents((prev) => [newEvent, ...prev]);
    setCommentText("");
    toast.success("Officer comments saved and logged to audit timeline.");
    setActiveTab("timeline");
  };

  if (!detailedApplicant) {
    return (
      <PageContainer className="pb-24">
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-border border-dashed p-8 rounded bg-surface select-none">
          <User className="h-10 w-10 text-foreground-muted mb-3" />
          <h3 className="text-sm font-bold text-foreground">Applicant Dossier Not Found</h3>
          <p className="text-xs text-foreground-secondary mt-1 mb-4 font-sans text-center max-w-xs">
            The requested customer profile reference does not exist in databases.
          </p>
          <Button
            onClick={() => router.push("/officer/applications")}
            size="sm"
            className="text-[10px] uppercase font-sans font-bold cursor-pointer"
          >
            Back to applications
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-24 text-xs font-sans">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-border/70 select-none">
        <div className="space-y-1.5">
          <button
            onClick={() => router.push("/officer/applications")}
            className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 cursor-pointer mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Console
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold font-sans tracking-tight text-foreground">
              Applicant Intelligence
            </h1>
            <span className="text-[9px] font-mono text-foreground-muted border border-border px-2 py-0.5 rounded bg-surface-elevated font-bold uppercase">
              ID: {detailedApplicant.id}
            </span>
          </div>

          <p className="text-[10.5px] text-foreground-secondary font-sans leading-relaxed max-w-2xl">
            Review the applicant&apos;s complete financial profile, AI-generated intelligence, behavioral insights, risk analysis, and supporting financial documents before making a lending decision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metadata indicators */}
          <div className="flex flex-wrap items-center gap-3 mr-3 text-[10px] border-r border-border/50 pr-4">
            <div className="text-right">
              <span className="text-[8px] text-foreground-muted uppercase block font-bold">Analysis Time</span>
              <span className="font-mono font-bold text-foreground flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3 text-primary" /> {lastAnalysisTime}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-foreground-muted uppercase block font-bold">Confidence</span>
              <span className="font-mono font-bold text-foreground">{detailedApplicant.confidence}%</span>
            </div>
          </div>

          <Button
            onClick={() => router.push(`/officer/underwriting/${detailedApplicant.id}`)}
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <Sliders className="h-3 w-3" /> Underwriting
          </Button>

          <Button
            onClick={handleRefreshAnalysis}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} /> Refresh
          </Button>

          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <Download className="h-3 w-3" /> PDF
          </Button>

          <Button
            onClick={handleShareProfile}
            variant="outline"
            size="sm"
            className="text-[9.5px] uppercase font-bold gap-1 cursor-pointer"
          >
            <Share2 className="h-3 w-3" /> Share
          </Button>
        </div>
      </div>

      {isLoading ? (
        // 2. TIMEOUT LOADING SKELETON STATES
        <div className="space-y-6 mt-6 select-none animate-pulse">
          <div className="h-28 bg-surface-elevated border border-border rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface-elevated border border-border rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 bg-surface-elevated border border-border rounded" />
              <div className="h-96 bg-surface-elevated border border-border rounded" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-surface-elevated border border-border rounded" />
              <div className="h-44 bg-surface-elevated border border-border rounded" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 3. PROFILE SUMMARY HERO CARD */}
          <div className="mt-6">
            <Card className="border border-border/80 bg-surface relative overflow-hidden select-none">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl font-bold font-sans uppercase shrink-0 shadow-sm">
                      {detailedApplicant.avatar}
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h2 className="text-lg font-bold text-foreground">{detailedApplicant.name}</h2>
                        <StatusBadge status={detailedApplicant.status === "Pending" ? "pending" : "under_review"} />
                        <RiskBadge rating={detailedApplicant.id === "app1" ? "High" : detailedApplicant.id === "app3" ? "Critical" : "Low"} />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-1 text-[11px] text-foreground-secondary">
                        <div>Occupation: <span className="font-semibold text-foreground">{detailedApplicant.occupation}</span></div>
                        <div>Employer: <span className="font-semibold text-foreground">{detailedApplicant.employer}</span></div>
                        <div>City: <span className="font-semibold text-foreground">{detailedApplicant.city}</span></div>
                        <div>Customer Since: <span className="font-semibold text-foreground font-mono">{detailedApplicant.customerSince}</span></div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/40 max-w-lg mt-2.5">
                        <div>
                          <span className="text-[9px] text-foreground-muted block uppercase font-bold">Credit Index</span>
                          <span className="text-sm font-extrabold text-foreground font-mono">{detailedApplicant.creditScore}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-foreground-muted block uppercase font-bold">Health Score</span>
                          <span className="text-sm font-extrabold text-primary font-mono">{detailedApplicant.healthScore} <span className="text-[9px] text-foreground-muted">/100</span></span>
                        </div>
                        <div>
                          <span className="text-[9px] text-foreground-muted block uppercase font-bold">Loan Class</span>
                          <span className="text-sm font-extrabold text-foreground">{detailedApplicant.loanType}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 p-4 rounded max-w-sm shrink-0 flex gap-3 items-start relative">
                    <Brain className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-sans font-bold text-primary uppercase tracking-wider block">AI Generated Intelligence</span>
                      <p className="text-[10px] text-foreground-secondary leading-relaxed font-sans">
                        {detailedApplicant.quickSummary}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. FINANCIAL SNAPSHOTS (8 KPI CARDS) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5 mt-6 select-none">
            {detailedApplicant.snapshots.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-surface border border-border p-3 rounded hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between h-24 relative group cursor-pointer"
              >
                <div>
                  <span className="text-[8px] font-sans font-bold text-foreground-muted block uppercase tracking-wider">
                    {kpi.title}
                  </span>
                  <span className="text-xs font-extrabold text-foreground font-mono block mt-0.5">
                    {kpi.value}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/30">
                  <TrendIndicator value={kpi.trend} className="text-[9px]" />
                  <MiniSparkline values={kpi.values} stroke={kpi.trend > 0 ? "#22c55e" : "#ef4444"} />
                </div>
              </div>
            ))}
          </div>

          {/* 5. MAIN CONTENT DIVISION: LEFT TABS (70%) vs RIGHT SIDEBAR (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-start">
            
            {/* LEFT COLUMN: TABS AND PANELS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* HORIZONTAL SCROLLABLE TABS HEADER */}
              <div className="flex overflow-x-auto scrollbar-none border-b border-border bg-surface rounded-t border-t border-l border-r select-none">
                {[
                  { id: "overview" as const, label: "Overview", icon: User },
                  { id: "financial" as const, label: "Financial Analysis", icon: DollarSign },
                  { id: "credit" as const, label: "Credit Profile", icon: TrendingUp },
                  { id: "fraud" as const, label: "Fraud Intelligence", icon: Fingerprint },
                  { id: "transactions" as const, label: "Transactions Ledger", icon: Layers },
                  { id: "docs" as const, label: "Documents", icon: FileText },
                  { id: "insights" as const, label: "AI Insights", icon: Info },
                  { id: "timeline" as const, label: "Timeline", icon: History }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "px-4 py-3 border-b-2 text-[10.5px] font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer",
                        isActive
                          ? "border-primary text-primary font-extrabold bg-primary/5"
                          : "border-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TABS CONTAINER */}
              <Card className="border border-border/85 bg-surface rounded-t-none">
                <CardContent className="p-6 md:p-8">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "overview" && (
                    <div className="space-y-6 select-none font-sans">
                      <div className="border-b border-border/40 pb-3">
                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Financial Profile Summary</h3>
                        <p className="text-[10.5px] text-foreground-secondary mt-0.5">Asset distributions, outstanding obligations, and general risk velocity flags.</p>
                      </div>

                      {/* Assets vs Liabilities Tables */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Assets panel */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-positive" /> Realized Assets Ledger
                          </span>
                          <div className="border border-border rounded-sm overflow-hidden">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-surface-elevated text-[9px] font-bold text-foreground-secondary uppercase border-b border-border">
                                  <th className="py-2 px-3">Asset Classification</th>
                                  <th className="py-2 px-3">Category</th>
                                  <th className="py-2 px-3 text-right">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailedApplicant.assets.map((item, idx) => (
                                  <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-surface-hover/30">
                                    <td className="py-2.5 px-3 font-semibold text-foreground">{item.name}</td>
                                    <td className="py-2.5 px-3 text-foreground-secondary font-mono">{item.category}</td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">₹{item.value.toLocaleString("en-IN")}</td>
                                  </tr>
                                ))}
                                <tr className="bg-surface-elevated/45 font-bold border-t border-border">
                                  <td className="py-2.5 px-3 uppercase text-foreground">Total Assets</td>
                                  <td />
                                  <td className="py-2.5 px-3 text-right font-mono text-foreground">
                                    ₹{detailedApplicant.assets.reduce((sum, item) => sum + item.value, 0).toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Liabilities panel */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4 text-critical animate-pulse" /> Active Debt Liabilities
                          </span>
                          <div className="border border-border rounded-sm overflow-hidden">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-surface-elevated text-[9px] font-bold text-foreground-secondary uppercase border-b border-border">
                                  <th className="py-2 px-3">Borrowing Instrument</th>
                                  <th className="py-2 px-3">Type</th>
                                  <th className="py-2 px-3 text-right">Outstanding</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailedApplicant.liabilities.map((item, idx) => (
                                  <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-surface-hover/30">
                                    <td className="py-2.5 px-3 font-semibold text-foreground">{item.name}</td>
                                    <td className="py-2.5 px-3 text-foreground-secondary font-mono">{item.type}</td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground-secondary">
                                      {item.value > 0 ? `₹${item.value.toLocaleString("en-IN")}` : "Nil"}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-surface-elevated/45 font-bold border-t border-border">
                                  <td className="py-2.5 px-3 uppercase text-foreground">Total Borrowings</td>
                                  <td />
                                  <td className="py-2.5 px-3 text-right font-mono text-foreground-secondary">
                                    ₹{detailedApplicant.liabilities.reduce((sum, item) => sum + item.value, 0).toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                      {/* Strengths vs Weaknesses list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                        <div className="space-y-2">
                          <span className="text-[9.5px] font-bold text-positive uppercase tracking-wider block">Bureau Underwriting Strengths</span>
                          <div className="space-y-2">
                            {detailedApplicant.strengths.map((s, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 bg-positive/5 border border-positive/10 p-2.5 rounded text-xs font-sans">
                                <CheckCircle2 className="h-4 w-4 text-positive shrink-0 mt-0.5" />
                                <span className="text-foreground-secondary leading-relaxed">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9.5px] font-bold text-critical uppercase tracking-wider block">Bureau Underwriting Weaknesses</span>
                          <div className="space-y-2">
                            {detailedApplicant.weaknesses.map((w, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 bg-critical/5 border border-critical/10 p-2.5 rounded text-xs font-sans">
                                <AlertTriangle className="h-4 w-4 text-critical shrink-0 mt-0.5" />
                                <span className="text-foreground-secondary leading-relaxed">{w}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recent Financial Changes */}
                      <div className="pt-4 border-t border-border/40 space-y-3">
                        <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block">Recent Cashflow Velocity Shifts</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {detailedApplicant.recentChanges.map((item, idx) => (
                            <div key={idx} className="border border-border p-3.5 rounded bg-surface-elevated/20 flex flex-col justify-between">
                              <span className="text-[9px] text-foreground-muted uppercase block font-bold">{item.metric}</span>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className={cn("text-sm font-extrabold font-mono", item.status === "positive" ? "text-positive" : "text-warning")}>
                                  {item.change}
                                </span>
                                <span className="text-[8px] text-foreground-muted font-sans font-medium">{item.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: FINANCIAL ANALYSIS (ADVANCED CHARTS) */}
                  {activeTab === "financial" && (
                    <div className="space-y-6 font-sans">
                      <div className="border-b border-border/40 pb-3">
                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Cash Flow & Ledger Analytics</h3>
                        <p className="text-[10.5px] text-foreground-secondary mt-0.5">Historical monthly surplus flows, net worth velocity curves, and expenditure classification diagnostics.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Line Chart: Income/Expense */}
                        <div className="border border-border rounded p-4 bg-surface-elevated/10">
                          <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block mb-3.5">
                            Cash Flow & Savings Trend (Last 6 Months)
                          </span>
                          <div ref={cashFlowChartRef} className="w-full h-56" />
                        </div>

                        {/* Area Chart: Net Worth */}
                        <div className="border border-border rounded p-4 bg-surface-elevated/10">
                          <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block mb-3.5">
                            Net Worth Progression (Historical Assets - Debt)
                          </span>
                          <div ref={netWorthChartRef} className="w-full h-56" />
                        </div>

                        {/* Pie Chart: Expenses Categories */}
                        <div className="border border-border rounded p-4 bg-surface-elevated/10">
                          <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block mb-3.5">
                            Monthly Expense Ingestion Classification
                          </span>
                          <div ref={categoryChartRef} className="w-full h-56" />
                        </div>

                        {/* Bar Chart: Income vs Debt Service Forecast */}
                        <div className="border border-border rounded p-4 bg-surface-elevated/10">
                          <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block mb-3.5">
                            Projected Cash Inflow vs Monthly EMI Burden
                          </span>
                          <div ref={forecastChartRef} className="w-full h-56" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CREDIT PROFILE */}
                  {activeTab === "credit" && (
                    <div className="space-y-6 font-sans select-none">
                      <div className="border-b border-border/40 pb-3">
                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Credit Bureau Ledger</h3>
                        <p className="text-[10.5px] text-foreground-secondary mt-0.5">Repayment performance indices, leverage limits, and existing borrow structures.</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border border-border p-3.5 rounded bg-surface-elevated/10 text-center">
                          <span className="text-[9px] text-foreground-muted block uppercase font-bold">Experian Score</span>
                          <span className="text-xl font-extrabold text-foreground font-mono block mt-1">{detailedApplicant.creditScore}</span>
                          <span className="text-[8px] text-positive uppercase font-bold mt-1 block">Good Tier</span>
                        </div>
                        <div className="border border-border p-3.5 rounded bg-surface-elevated/10 text-center">
                          <span className="text-[9px] text-foreground-muted block uppercase font-bold">On-Time Payments</span>
                          <span className="text-xl font-extrabold text-positive font-mono block mt-1">98.4%</span>
                          <span className="text-[8px] text-foreground-secondary uppercase font-bold mt-1 block">2 Late Payments</span>
                        </div>
                        <div className="border border-border p-3.5 rounded bg-surface-elevated/10 text-center">
                          <span className="text-[9px] text-foreground-muted block uppercase font-bold">Active Loan Lines</span>
                          <span className="text-xl font-extrabold text-foreground font-mono block mt-1">
                            {detailedApplicant.existingLoans.length}
                          </span>
                          <span className="text-[8px] text-foreground-secondary uppercase font-bold mt-1 block">
                            ₹{detailedApplicant.debt.toLocaleString("en-IN")} Debt
                          </span>
                        </div>
                        <div className="border border-border p-3.5 rounded bg-surface-elevated/10 text-center">
                          <span className="text-[9px] text-foreground-muted block uppercase font-bold">Closed Loan Lines</span>
                          <span className="text-xl font-extrabold text-foreground-secondary font-mono block mt-1">4</span>
                          <span className="text-[8px] text-positive uppercase font-bold mt-1 block">Clean settlement</span>
                        </div>
                      </div>

                      {/* Repayment Timeline */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block">Bureau Inquiry and Account History Timeline</span>
                        <div className="border border-border rounded overflow-hidden">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-surface-elevated text-[9px] font-bold text-foreground-secondary uppercase border-b border-border">
                                <th className="py-2 px-3">Lending Entity</th>
                                <th className="py-2 px-3">Product</th>
                                <th className="py-2 px-3 text-right">Principal</th>
                                <th className="py-2 px-3 text-right">Monthly EMI</th>
                                <th className="py-2 px-3">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailedApplicant.existingLoans.map((loan, idx) => (
                                <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-surface-hover/30">
                                  <td className="py-2.5 px-3 font-semibold text-foreground">{loan.bank}</td>
                                  <td className="py-2.5 px-3 text-foreground-secondary">{loan.type}</td>
                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">₹{loan.amount.toLocaleString("en-IN")}</td>
                                  <td className="py-2.5 px-3 text-right font-mono text-foreground-secondary">₹{loan.emi.toLocaleString("en-IN")}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="text-[8px] font-bold px-1.5 py-0.25 rounded uppercase text-positive bg-positive/10 border border-positive/20">
                                      Active
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {/* Add some closed loans to make the bureau timeline look premium */}
                              <tr className="border-b border-border/30 hover:bg-surface-hover/30">
                                <td className="py-2.5 px-3 font-semibold text-foreground">ICICI Bank</td>
                                <td className="py-2.5 px-3 text-foreground-secondary">Personal Loan</td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground-muted">₹1,50,000</td>
                                <td className="py-2.5 px-3 text-right font-mono text-foreground-muted">₹5,200</td>
                                <td className="py-2.5 px-3">
                                  <span className="text-[8px] font-bold px-1.5 py-0.25 rounded uppercase text-foreground-secondary bg-surface-elevated border border-border">
                                    Closed (Settled)
                                  </span>
                                </td>
                              </tr>
                              <tr className="hover:bg-surface-hover/30">
                                <td className="py-2.5 px-3 font-semibold text-foreground">HDFC Bank</td>
                                <td className="py-2.5 px-3 text-foreground-secondary">Consumer Durable EMI</td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground-muted">₹45,000</td>
                                <td className="py-2.5 px-3 text-right font-mono text-foreground-muted">₹3,750</td>
                                <td className="py-2.5 px-3">
                                  <span className="text-[8px] font-bold px-1.5 py-0.25 rounded uppercase text-foreground-secondary bg-surface-elevated border border-border">
                                    Closed (Settled)
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 4: FRAUD INTELLIGENCE */}
                  {activeTab === "fraud" && (
                    <div className="space-y-6 font-sans">
                      <div className="border-b border-border/40 pb-3">
                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Device & Identity Telemetry</h3>
                        <p className="text-[10.5px] text-foreground-secondary mt-0.5">Validation scores, device browser coordinate fingerprint logs, and transaction velocity diagnostics.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* Score Card */}
                        <div className="border border-border p-4.5 rounded bg-surface-elevated/10 flex flex-col justify-between select-none">
                          <div>
                            <span className="text-[9px] text-foreground-muted uppercase font-bold block">Fraud Risk Index</span>
                            <span className={cn("text-2xl font-extrabold font-mono block mt-1.5", detailedApplicant.fraudRisk === "High" ? "text-critical" : "text-positive")}>
                              {detailedApplicant.id === "app4" ? "88" : "12"} <span className="text-xs text-foreground-secondary">/100</span>
                            </span>
                          </div>
                          <span className="text-[8.5px] text-foreground-secondary font-sans mt-3.5 block leading-relaxed">
                            Flags: {detailedApplicant.id === "app4" ? "Multi-device IP coordinates anomaly detected." : "All device fingerprint logs passed validations."}
                          </span>
                        </div>

                        {/* Chart: Activity Score */}
                        <div className="md:col-span-2 border border-border p-4 rounded bg-surface-elevated/10">
                          <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wider block mb-2.5">
                            Recent Telemetric Activity Index Timeline
                          </span>
                          <div ref={fraudTimelineChartRef} className="w-full h-44" />
                        </div>

                      </div>

                      {/* Suspicious Anomalies Logs */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block">Identity Telemetry Anomalies Log</span>
                        <div className="space-y-2">
                          {detailedApplicant.fraudAnomalies.map((anom, idx) => (
                            <div key={idx} className="border border-border p-3.5 rounded bg-surface-elevated/20 flex items-center justify-between gap-4 text-xs font-sans">
                              <div className="space-y-0.5">
                                <span className="font-bold text-foreground block">{anom.description}</span>
                                <span className="text-[9px] text-foreground-muted font-mono block">{anom.timestamp}</span>
                              </div>
                              <span className={cn("text-[8px] font-sans font-bold px-2 py-0.5 rounded uppercase border shrink-0", 
                                anom.risk === "Medium" ? "text-warning bg-warning/10 border-warning/20" : "text-positive bg-positive/10 border-positive/20"
                              )}>
                                {anom.risk} Risk
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 5: TRANSACTIONS TABLE */}
                  {activeTab === "transactions" && (
                    <div className="space-y-5 font-sans">
                      <div className="border-b border-border/40 pb-3 select-none">
                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Enterprise Transaction Ledger</h3>
                        <p className="text-[10.5px] text-foreground-secondary mt-0.5">Complete audit log of recent payroll inflows, savings withdrawals, and revolving card debits.</p>
                      </div>

                      {/* Search and Filters console */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-elevated/20 border border-border p-3 rounded select-none">
                        
                        {/* Search */}
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-foreground-muted" />
                          <input
                            type="text"
                            placeholder="Search merchant, location, category..."
                            value={txSearch}
                            onChange={(e) => setTxSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded border border-border bg-surface text-foreground font-sans text-xs focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Dropdowns */}
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={txCategoryFilter}
                            onChange={(e) => setTxCategoryFilter(e.target.value)}
                            className="px-2.5 py-1.5 rounded border border-border bg-surface text-foreground text-xs font-sans focus:outline-none"
                          >
                            <option value="All">All Categories</option>
                            <option value="Inflow">Payroll/Inflow</option>
                            <option value="Housing">Rent/Housing</option>
                            <option value="Debt Service">Debt Service</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Credit Payment">Credit Cards</option>
                            <option value="Groceries">Groceries</option>
                          </select>

                          <select
                            value={txRiskFilter}
                            onChange={(e) => setTxRiskFilter(e.target.value)}
                            className="px-2.5 py-1.5 rounded border border-border bg-surface text-foreground text-xs font-sans focus:outline-none"
                          >
                            <option value="All">All Risks</option>
                            <option value="Low">Low Risk (&lt;20)</option>
                            <option value="Medium">Medium Risk (20-50)</option>
                            <option value="High">High Risk (&gt;50)</option>
                          </select>
                        </div>

                      </div>

                      {/* Transactions Table grid */}
                      <div className="border border-border rounded overflow-hidden select-none">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-surface-elevated text-[9px] font-bold text-foreground-secondary uppercase border-b border-border select-none">
                              <th className="py-2.5 px-3 cursor-pointer hover:bg-surface-hover/60" onClick={() => toggleSort("date")}>Date</th>
                              <th className="py-2.5 px-3 cursor-pointer hover:bg-surface-hover/60" onClick={() => toggleSort("merchant")}>Merchant</th>
                              <th className="py-2.5 px-3 cursor-pointer hover:bg-surface-hover/60" onClick={() => toggleSort("category")}>Category</th>
                              <th className="py-2.5 px-3 text-right cursor-pointer hover:bg-surface-hover/60" onClick={() => toggleSort("amount")}>Amount</th>
                              <th className="py-2.5 px-3 cursor-pointer hover:bg-surface-hover/60" onClick={() => toggleSort("paymentMethod")}>Payment</th>
                              <th className="py-2.5 px-3 cursor-pointer hover:bg-surface-hover/60" onClick={() => toggleSort("location")}>Location</th>
                              <th className="py-2.5 px-3 text-center cursor-pointer hover:bg-surface-hover/60" onClick={() => toggleSort("riskScore")}>Risk Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-foreground-secondary font-sans">
                                  No transactions found matching active filter parameters.
                                </td>
                              </tr>
                            ) : (
                              filteredTransactions.map((tx) => (
                                <tr
                                  key={tx.id}
                                  onClick={() => {
                                    setSelectedTx(tx);
                                    setIsTxDrawerOpen(true);
                                  }}
                                  className="border-b border-border/30 last:border-0 hover:bg-surface-hover/30 cursor-pointer transition-colors"
                                >
                                  <td className="py-2.5 px-3 font-mono text-foreground-secondary">{tx.date}</td>
                                  <td className="py-2.5 px-3 font-bold text-foreground flex items-center gap-1.5">
                                    {tx.merchant}
                                    {tx.fraudIndicator === "Yes" && (
                                      <span className="text-[7px] bg-critical/10 text-critical border border-critical/30 rounded px-1.5 py-0.25 font-sans font-bold uppercase animate-pulse">
                                        Fraud Alert
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-foreground-secondary">{tx.category}</td>
                                  <td className={cn("py-2.5 px-3 text-right font-mono font-bold", tx.amount > 0 ? "text-positive" : "text-foreground")}>
                                    {tx.amount > 0 ? `+₹${tx.amount.toLocaleString("en-IN")}` : `-₹${Math.abs(tx.amount).toLocaleString("en-IN")}`}
                                  </td>
                                  <td className="py-2.5 px-3 text-foreground-secondary">{tx.paymentMethod}</td>
                                  <td className="py-2.5 px-3 text-foreground-secondary font-sans">{tx.location}</td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={cn("px-2 py-0.5 rounded font-mono font-bold text-[9px]",
                                      tx.riskScore >= 50 ? "bg-critical/10 text-critical" : tx.riskScore >= 20 ? "bg-warning/10 text-warning" : "bg-positive/10 text-positive"
                                    )}>
                                      {tx.riskScore}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

                  {/* TAB 6: DOCUMENTS */}
                  {activeTab === "docs" && (
                    <div className="space-y-6 font-sans">
                      <div className="border-b border-border/40 pb-3 select-none">
                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Submitted Document Ledgers</h3>
                        <p className="text-[10.5px] text-foreground-secondary mt-0.5">Check validation states, upload logs, and extract contents metadata summaries.</p>
                      </div>

                      {/* Documents Cards grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {detailedApplicant.documentFiles.map((doc) => (
                          <div
                            key={doc.id}
                            className="border border-border p-4.5 rounded bg-surface hover:border-primary/30 transition-all flex flex-col justify-between group"
                          >
                            <div className="flex gap-3.5 items-start">
                              <div className="w-10 h-10 rounded bg-surface-elevated border border-border flex items-center justify-center text-foreground-secondary shrink-0 select-none">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div className="space-y-1 select-none">
                                <span className="font-bold text-foreground block leading-tight">{doc.name}</span>
                                <span className="text-[9px] text-foreground-muted block">Uploaded: {doc.date} • Format: {doc.type}</span>
                                <span className="text-[9.5px] text-foreground-secondary block leading-relaxed">{doc.check}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 mt-4 border-t border-border/30 select-none">
                              <span className="text-[8px] font-sans font-bold px-2 py-0.5 rounded uppercase border bg-positive/5 text-positive border-positive/20 flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" /> Verified
                              </span>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setIsDocModalOpen(true);
                                  }}
                                  className="text-[9.5px] font-bold text-primary hover:underline uppercase cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => toast.success(`Downloading file "${doc.name}"...`)}
                                  className="text-[9.5px] font-bold text-foreground-secondary hover:underline uppercase cursor-pointer"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* TAB 7: AI INSIGHTS */}
                  {activeTab === "insights" && (
                    <div className="space-y-6 font-sans select-none">
                      <div className="border-b border-border/40 pb-3">
                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">AI Predictive Insight Indicators</h3>
                        <p className="text-[10.5px] text-foreground-secondary mt-0.5">Automated cashflow patterns classification, bureau flags, and action guidelines.</p>
                      </div>

                      <div className="space-y-4">
                        {detailedApplicant.aiInsightsList.map((ins, idx) => (
                          <div
                            key={idx}
                            className={cn("border-l-4 p-5 rounded-r bg-surface-elevated/20 border-y border-r border-border/60 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:bg-surface-elevated/35",
                              ins.priority === "High" ? "border-l-critical" : ins.priority === "Medium" ? "border-l-warning" : "border-l-positive"
                            )}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={cn("text-[8px] font-bold px-1.5 py-0.25 rounded uppercase border",
                                  ins.priority === "High" ? "text-critical border-critical/30 bg-critical/5 animate-pulse" : ins.priority === "Medium" ? "text-warning border-warning/30 bg-warning/5" : "text-positive border-positive/30 bg-positive/5"
                                )}>
                                  {ins.priority} Priority
                                </span>
                                <span className="text-[9.5px] font-mono text-foreground-muted font-bold">Confidence: {ins.confidence}%</span>
                              </div>

                              <span className="text-xs font-bold text-foreground block leading-tight">{ins.title}</span>
                              <p className="text-[10.5px] text-foreground-secondary leading-relaxed font-sans">{ins.reason}</p>
                              <p className="text-[10.5px] text-foreground-muted font-sans font-medium">Impact: <span className="text-foreground-secondary font-normal">{ins.impact}</span></p>
                            </div>

                            <div className="bg-surface border border-border p-3.5 rounded max-w-xs shrink-0 font-sans space-y-1.5">
                              <span className="text-[9px] font-bold text-primary uppercase block tracking-wider">Suggested Underwriter Action</span>
                              <p className="text-[10px] text-foreground-secondary leading-relaxed">{ins.suggestedAction}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {/* TAB 8: TIMELINE */}
                  {activeTab === "timeline" && (
                    <div className="space-y-6 font-sans">
                      <div className="border-b border-border/40 pb-3 select-none">
                        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Chronological Operations Trail</h3>
                        <p className="text-[10.5px] text-foreground-secondary mt-0.5">Comprehensive audit trail of manual inputs and automated bureau verification steps.</p>
                      </div>

                      <div className="relative pl-6 border-l border-border space-y-6 ml-3">
                        {timelineEvents.map((event, idx) => (
                          <div key={idx} className="relative">
                            {/* Timeline bullet dot */}
                            <div className="absolute -left-[30px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface shadow-xs" />

                            <div className="space-y-1 font-sans">
                              <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono text-foreground-muted select-none">
                                <Clock className="h-3 w-3" />
                                <span>{event.date}</span>
                                <span>•</span>
                                <span className="font-bold text-foreground-secondary">{event.user}</span>
                              </div>
                              <span className="font-bold text-foreground block text-xs select-none">{event.action}</span>
                              <p className="text-foreground-secondary leading-relaxed text-[11px]">{event.notes}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </CardContent>
              </Card>

            </div>

            {/* RIGHT SIDEBAR: STICKY INTELLIGENCE & RECOMMENDATION PANEL */}
            <div className="space-y-6 lg:sticky lg:top-6 select-none">
              
              {/* 1. STICKY INTELLIGENCE PANEL (RISK GAUGE METERS) */}
              <Card className="border border-border/80 bg-surface">
                <CardContent className="p-5 space-y-5">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block pb-2 border-b border-border/40">
                    Decision Dial Diagnostics
                  </span>

                  {/* Dual Gauges */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                        Financial Health
                      </span>
                      <div ref={healthGaugeRef} className="w-24 h-16" />
                      <span className="text-xs font-mono font-extrabold text-foreground mt-1">
                        {detailedApplicant.healthScore} <span className="text-[9px] text-foreground-muted">/100</span>
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">
                        Default Prob.
                      </span>
                      <div ref={defaultGaugeRef} className="w-24 h-16" />
                      <span className={cn("text-xs font-mono font-extrabold mt-1",
                        detailedApplicant.defaultProb >= 50 ? "text-critical" : detailedApplicant.defaultProb >= 25 ? "text-warning" : "text-positive"
                      )}>
                        {detailedApplicant.defaultProb}%
                      </span>
                    </div>
                  </div>

                  {/* Metrics details */}
                  <div className="border-t border-border/40 pt-4 space-y-2 text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Fraud Rating:</span>
                      <span className={cn("font-bold uppercase",
                        detailedApplicant.fraudRisk === "High" ? "text-critical" : "text-positive"
                      )}>{detailedApplicant.fraudRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Cash Flow surplus:</span>
                      <span className="font-bold text-foreground font-mono">
                        ₹{(detailedApplicant.income - detailedApplicant.expenses).toLocaleString("en-IN")}/mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Model Verification:</span>
                      <span className="font-bold text-foreground">Experian Bureau Match</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. AI RECOMMENDATION LARGE PREMIUM CARD */}
              <Card className="border border-border/80 bg-surface">
                <CardContent className="p-5 space-y-4">
                  <span className="text-[9.5px] font-bold text-foreground-muted uppercase tracking-widest block pb-2 border-b border-border/40">
                    Decision Recommendation
                  </span>

                  {/* Approve / Reject large badge */}
                  <div className={cn("border p-4.5 rounded text-center relative overflow-hidden",
                    detailedApplicant.aiRec === "Approve" ? "bg-positive/5 border-positive/20 text-positive" : 
                    detailedApplicant.aiRec === "Deny" ? "bg-critical/5 border-critical/20 text-critical" : "bg-warning/5 border-warning/20 text-warning"
                  )}>
                    <Sparkles className="absolute -right-2 -bottom-2 h-14 w-14 opacity-15 rotate-12" />
                    
                    <span className="text-[8px] font-bold uppercase tracking-wider block">Ensemble Model Proposal</span>
                    <span className="text-lg font-extrabold uppercase tracking-widest block mt-1.5">
                      {detailedApplicant.aiRec === "Approve" ? "APPROVE" : detailedApplicant.aiRec === "Deny" ? "REJECT" : "MANUAL REVIEW"}
                    </span>
                    <span className="text-[10px] block mt-1 opacity-90 font-mono">
                      Model Confidence: {detailedApplicant.confidence}%
                    </span>
                  </div>

                  {/* Summary lists */}
                  <div className="space-y-2">
                    <span className="text-[9.5px] font-bold text-foreground uppercase block">Key Drivers Summary</span>
                    <div className="space-y-1.5 text-[10.5px] text-foreground-secondary leading-relaxed">
                      {detailedApplicant.id === "app1" ? (
                        <>
                          <div className="flex gap-1.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-critical shrink-0 mt-1.5" />
                            <span>DTI Ratio at 42% exceeds target.</span>
                          </div>
                          <div className="flex gap-1.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-critical shrink-0 mt-1.5" />
                            <span>High revolving card usage (64%).</span>
                          </div>
                          <div className="flex gap-1.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-positive shrink-0 mt-1.5" />
                            <span>Compensated by verified payroll cashflows.</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-1.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-positive shrink-0 mt-1.5" />
                            <span>Liquid savings buffer covers 1.2x requested principal.</span>
                          </div>
                          <div className="flex gap-1.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-positive shrink-0 mt-1.5" />
                            <span>Zero active debt liability balance.</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-surface-elevated/40 border border-border p-3 rounded space-y-1">
                    <span className="text-[9px] font-bold text-foreground-muted block uppercase">Projected Default Outcome</span>
                    <p className="text-[10.5px] text-foreground-secondary leading-relaxed">
                      Estimated default loss parameters sit at less than {detailedApplicant.defaultProb < 25 ? "1.5%" : "6.2%"} across similar loan portfolios.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 3. ACTION PANEL & MANUAL NOTES */}
              <Card className="border border-border/80 bg-surface">
                <CardContent className="p-5 space-y-4">
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest block pb-2 border-b border-border/40">
                    Officer Action Center
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={() => router.push(`/officer/underwriting/${detailedApplicant.id}`)}
                      className="w-full text-[9.5px] uppercase font-bold justify-center cursor-pointer"
                    >
                      Open Underwriting Desk
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => toast.success("Requesting updated bank verification ledger...")}
                        variant="outline"
                        className="text-[9.5px] uppercase font-bold justify-center cursor-pointer"
                      >
                        Request Documents
                      </Button>
                      <Button
                        onClick={() => toast.info("Opening secure email dialogue channel...")}
                        variant="outline"
                        className="text-[9.5px] uppercase font-bold justify-center cursor-pointer"
                      >
                        Contact Client
                      </Button>
                    </div>
                    <Button
                      onClick={() => toast.success("Applicant case reassigned to Senior Credit Manager.")}
                      variant="outline"
                      className="w-full text-[9.5px] uppercase font-bold justify-center cursor-pointer"
                    >
                      Assign Case Officer
                    </Button>
                  </div>

                  {/* Manual notes input */}
                  <div className="pt-3 border-t border-border/40 space-y-2">
                    <span className="text-[9.5px] font-bold text-foreground-secondary uppercase block">Add Manual Underwriter Notes</span>
                    <textarea
                      placeholder="Type comments to append directly to the audit logs..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full border border-border bg-surface-elevated/40 rounded p-2.5 font-sans text-xs min-h-[70px] text-foreground focus:outline-none focus:border-primary resize-none"
                    />
                    <Button
                      onClick={handleSaveNotes}
                      className="w-full text-[9.5px] uppercase font-bold justify-center bg-primary text-white cursor-pointer"
                    >
                      Save and Log Notes
                    </Button>
                  </div>

                </CardContent>
              </Card>

            </div>

          </div>
        </>
      )}

      {/* ==========================================
          OVERLAY SHIFTING PANELS & MODALS
         ========================================== */}

      {/* 1. TRANSACTION DETAILS DRAWER */}
      <Sheet
        isOpen={isTxDrawerOpen}
        onClose={() => setIsTxDrawerOpen(false)}
        title="Transaction Diagnostics"
      >
        {selectedTx && (
          <div className="space-y-5 font-sans select-none">
            
            {/* Amount details */}
            <div className="bg-surface-elevated/40 border border-border p-4 rounded text-center">
              <span className="text-[10px] text-foreground-muted block uppercase">Billing Amount</span>
              <span className={cn("text-2xl font-extrabold font-mono block mt-1", selectedTx.amount > 0 ? "text-positive" : "text-foreground")}>
                {selectedTx.amount > 0 ? `+₹${selectedTx.amount.toLocaleString("en-IN")}` : `-₹${Math.abs(selectedTx.amount).toLocaleString("en-IN")}`}
              </span>
              <span className="text-[9px] bg-surface border border-border text-foreground-secondary rounded px-2.5 py-0.5 mt-2.5 inline-block uppercase font-bold">
                {selectedTx.merchant}
              </span>
            </div>

            {/* Data matrix */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Telemetry Parameters</span>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Date Posted</span>
                  <span className="font-mono text-foreground font-semibold">{selectedTx.date}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Category</span>
                  <span className="text-foreground font-semibold">{selectedTx.category}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Settlement Location</span>
                  <span className="text-foreground font-semibold">{selectedTx.location}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Payment Method</span>
                  <span className="text-foreground font-semibold">{selectedTx.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Risk Factor Rating</span>
                  <span className={cn("font-bold font-mono", selectedTx.riskScore >= 50 ? "text-critical" : "text-positive")}>
                    {selectedTx.riskScore} / 100
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground-muted block uppercase">Anomaly Flag</span>
                  <span className="text-foreground font-semibold">{selectedTx.fraudIndicator}</span>
                </div>
              </div>
            </div>

            {/* AI Explanation block */}
            <div className="bg-primary/5 border border-primary/10 p-4 rounded space-y-2">
              <span className="text-[10px] font-bold text-primary block uppercase">AI Model Diagnostics</span>
              <p className="text-[10.5px] text-foreground-secondary leading-relaxed font-sans">
                {selectedTx.desc} Anomaly verification model scanned this billing node against historical velocity parameters. Transaction is verified under normal geographic parameters.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  toast.success(`Transaction ID "${selectedTx.id}" marked as manually verified.`);
                  setIsTxDrawerOpen(false);
                }}
                className="flex-1 text-[9.5px] uppercase font-bold justify-center cursor-pointer"
              >
                Verify Transaction
              </Button>
              <Button
                onClick={() => setIsTxDrawerOpen(false)}
                variant="outline"
                className="text-[9.5px] uppercase font-bold justify-center cursor-pointer"
              >
                Close Drawer
              </Button>
            </div>

          </div>
        )}
      </Sheet>

      {/* 2. DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Document Ledger Check"
      >
        {selectedDoc && (
          <div className="space-y-5 font-sans select-none text-center">
            
            {/* Visual preview simulator */}
            <div className="w-full h-44 border border-border border-dashed rounded bg-surface-elevated/40 flex flex-col items-center justify-center text-foreground-secondary">
              <FileText className="h-10 w-10 text-foreground-muted mb-2" />
              <span className="text-xs font-bold text-foreground">{selectedDoc.name}</span>
              <span className="text-[9px] text-foreground-muted mt-1 font-mono">Format: {selectedDoc.type} • Status: {selectedDoc.status}</span>
            </div>

            <div className="text-left space-y-2">
              <span className="text-[10.5px] font-bold text-foreground uppercase tracking-wider block">Integrity Scan Summary</span>
              <p className="text-xs text-foreground-secondary leading-relaxed bg-surface border border-border p-3.5 rounded">
                This document file has passed all automated PDF signature check verification audits. Checked parameters:
                <br />
                <span className="font-mono text-[10px] text-foreground-muted block mt-1.5">
                  - File metadata tags integrity check: Passed
                  <br />
                  - Digitized e-KYC signature match: Passed
                  <br />
                  - Ingest timestamps sequence check: Passed
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  toast.success(`Verified document file status logged.`);
                  setIsDocModalOpen(false);
                }}
                className="flex-1 text-[9.5px] uppercase font-bold justify-center cursor-pointer font-sans"
              >
                Approve Verification
              </Button>
              <Button
                onClick={() => setIsDocModalOpen(false)}
                variant="outline"
                className="text-[9.5px] uppercase font-bold justify-center cursor-pointer font-sans"
              >
                Dismiss Modal
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </PageContainer>
  );
}
