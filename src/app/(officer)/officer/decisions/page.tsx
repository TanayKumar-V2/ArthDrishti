"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as echarts from "echarts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  History,
  ArrowLeft,
  Search,
  ChevronDown,
  SlidersHorizontal,
  Eye,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Timer,
  Sliders,
  TrendingUp,
  TrendingDown,
  User,
  Info,
  Scale,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import PageContainer from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet, Popover } from "@/components/ui/Overlays";
import { StatusBadge } from "@/components/ui/Badge";
import { ModelConfidence } from "@/components/ui/ValueDisplay";
import { Skeleton, EmptyState, ErrorState } from "@/components/ui/FeedbackState";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface DecisionHistoryItem {
  id: string;
  applicantId: string;
  name: string;
  avatar: string;
  age: number;
  loanAmount: number;
  purpose: string;
  loanType: string;
  financialHealth: number;
  defaultProb: number;
  fraudRisk: "Low" | "Medium" | "High";
  fraudScore: number;
  decision: "Approved" | "Rejected";
  officer: string;
  decisionDate: string;
  status: "Completed" | "Pending";
  aiRec: "Approve" | "Deny" | "Manual Review";
  confidence: number;
  notes: string;
  riskFactors: string[];
  protectiveFactors: string[];
  income: number;
  expenses: number;
  debt: number;
  savings: number;
  timeline: {
    submitted: string;
    aiAnalysis: string;
    fraudAnalysis: string;
    officerReview: string;
    decisionSaved: string;
    outcomeDate: string;
    customerNotified: string;
  };
}

// ============================================================================
// MOCK HIGH-FIDELITY BANKING DECISIONS DATA
// ============================================================================
const INITIAL_DECISIONS: DecisionHistoryItem[] = [
  {
    id: "DEC-2026-001",
    applicantId: "app1",
    name: "Suresh Gupta",
    avatar: "SG",
    age: 45,
    loanAmount: 500000,
    purpose: "Business Expansion",
    loanType: "Business Loan",
    financialHealth: 78,
    defaultProb: 15,
    fraudRisk: "Low",
    fraudScore: 8,
    decision: "Approved",
    officer: "Officer Rahul",
    decisionDate: "2026-07-12",
    status: "Completed",
    aiRec: "Approve",
    confidence: 95.8,
    notes: "Consistent payroll record covers DTI liability margin safely.",
    riskFactors: ["Relatively short CIBIL history (3 Years)"],
    protectiveFactors: ["Low DTI ratio (22%)", "Stable income velocity (₹1.8L/mo)"],
    income: 180000,
    expenses: 40000,
    debt: 120000,
    savings: 600000,
    timeline: {
      submitted: "2026-07-11 10:15 AM",
      aiAnalysis: "2026-07-11 10:20 AM",
      fraudAnalysis: "2026-07-11 10:22 AM",
      officerReview: "2026-07-12 09:30 AM",
      decisionSaved: "2026-07-12 10:00 AM",
      outcomeDate: "2026-07-12 10:00 AM",
      customerNotified: "2026-07-12 10:15 AM"
    }
  },
  {
    id: "DEC-2026-002",
    applicantId: "app2",
    name: "Ananya Misra",
    avatar: "AM",
    age: 31,
    loanAmount: 1500000,
    purpose: "Home Purchase",
    loanType: "Home Loan",
    financialHealth: 54,
    defaultProb: 58,
    fraudRisk: "Medium",
    fraudScore: 32,
    decision: "Rejected",
    officer: "Officer Rahul",
    decisionDate: "2026-07-11",
    status: "Completed",
    aiRec: "Deny",
    confidence: 93.4,
    notes: "Bureau utilization rate is critical at 82%. Denied due to cash outflow limitations.",
    riskFactors: ["Bureau utilization is at 82%", "Recent late payment of 32 days flagged"],
    protectiveFactors: ["Adequate collateral validation report exists"],
    income: 120000,
    expenses: 90000,
    debt: 1400000,
    savings: 95005,
    timeline: {
      submitted: "2026-07-10 03:00 PM",
      aiAnalysis: "2026-07-10 03:05 PM",
      fraudAnalysis: "2026-07-10 03:10 PM",
      officerReview: "2026-07-11 11:00 AM",
      decisionSaved: "2026-07-11 11:30 AM",
      outcomeDate: "2026-07-11 11:30 AM",
      customerNotified: "2026-07-11 11:45 AM"
    }
  },
  {
    id: "DEC-2026-003",
    applicantId: "app3",
    name: "Karan Johar",
    avatar: "KJ",
    age: 38,
    loanAmount: 350000,
    purpose: "Personal Use",
    loanType: "Personal Loan",
    financialHealth: 88,
    defaultProb: 9,
    fraudRisk: "Low",
    fraudScore: 5,
    decision: "Approved",
    officer: "Officer Rahul",
    decisionDate: "2026-07-10",
    status: "Completed",
    aiRec: "Approve",
    confidence: 91.2,
    notes: "Applicant savings cushion covers outstanding liabilities metrics.",
    riskFactors: ["No substantial issues identified"],
    protectiveFactors: ["Savings balance covers full loan request", "Low leverage profile"],
    income: 150000,
    expenses: 30000,
    debt: 50000,
    savings: 700000,
    timeline: {
      submitted: "2026-07-09 11:00 AM",
      aiAnalysis: "2026-07-09 11:05 AM",
      fraudAnalysis: "2026-07-09 11:08 AM",
      officerReview: "2026-07-10 02:00 PM",
      decisionSaved: "2026-07-10 02:15 PM",
      outcomeDate: "2026-07-10 02:15 PM",
      customerNotified: "2026-07-10 02:30 PM"
    }
  },
  {
    id: "DEC-2026-004",
    applicantId: "app4",
    name: "Divya Teja",
    avatar: "DT",
    age: 29,
    loanAmount: 800000,
    purpose: "Education Abroad",
    loanType: "Education Loan",
    financialHealth: 71,
    defaultProb: 22,
    fraudRisk: "Low",
    fraudScore: 14,
    decision: "Approved",
    officer: "Officer Priya",
    decisionDate: "2026-07-09",
    status: "Completed",
    aiRec: "Manual Review",
    confidence: 89.5,
    notes: "Income statement validation reports require recent bank verification uploads. Checked manually, salary credits validated.",
    riskFactors: ["Short employment duration at current firm (6 months)"],
    protectiveFactors: ["High GPA academic records", "Strong parent co-guarantor balance sheet"],
    income: 80000,
    expenses: 35000,
    debt: 0,
    savings: 150000,
    timeline: {
      submitted: "2026-07-08 09:00 AM",
      aiAnalysis: "2026-07-08 09:10 AM",
      fraudAnalysis: "2026-07-08 09:15 AM",
      officerReview: "2026-07-09 10:00 AM",
      decisionSaved: "2026-07-09 10:30 AM",
      outcomeDate: "2026-07-09 10:30 AM",
      customerNotified: "2026-07-09 10:45 AM"
    }
  },
  {
    id: "DEC-2026-005",
    applicantId: "app5",
    name: "Amit Sharma",
    avatar: "AS",
    age: 42,
    loanAmount: 1200000,
    purpose: "Commercial Equipment",
    loanType: "Commercial Loan",
    financialHealth: 45,
    defaultProb: 72,
    fraudRisk: "High",
    fraudScore: 78,
    decision: "Rejected",
    officer: "Officer Rahul",
    decisionDate: "2026-07-08",
    status: "Completed",
    aiRec: "Deny",
    confidence: 91.8,
    notes: "Extremely high existing leverage (₹18L Debt) and low savings floor (₹45K). Fraud risk flagged due to mismatched device location credentials.",
    riskFactors: ["Leverage ratio exceeds 15x monthly income", "Mismatch in IP address country registry"],
    protectiveFactors: ["Operational commercial asset backing"],
    income: 95000,
    expenses: 82000,
    debt: 1800000,
    savings: 45000,
    timeline: {
      submitted: "2026-07-07 04:00 PM",
      aiAnalysis: "2026-07-07 04:15 PM",
      fraudAnalysis: "2026-07-07 04:20 PM",
      officerReview: "2026-07-08 02:00 PM",
      decisionSaved: "2026-07-08 02:30 PM",
      outcomeDate: "2026-07-08 02:30 PM",
      customerNotified: "2026-07-08 02:45 PM"
    }
  },
  {
    id: "DEC-2026-006",
    applicantId: "app6",
    name: "Priyanka Roy",
    avatar: "PR",
    age: 33,
    loanAmount: 820000,
    purpose: "Home Renovation",
    loanType: "Home Loan",
    financialHealth: 84,
    defaultProb: 18,
    fraudRisk: "Low",
    fraudScore: 4,
    decision: "Approved",
    officer: "Officer Priya",
    decisionDate: "2026-07-07",
    status: "Completed",
    aiRec: "Approve",
    confidence: 96.5,
    notes: "Excellent financial health score (84) and clean repayment history.",
    riskFactors: ["None significant"],
    protectiveFactors: ["Clean repayment records", "High savings buffer"],
    income: 185000,
    expenses: 65000,
    debt: 120000,
    savings: 950000,
    timeline: {
      submitted: "2026-07-06 11:30 AM",
      aiAnalysis: "2026-07-06 11:40 AM",
      fraudAnalysis: "2026-07-06 11:42 AM",
      officerReview: "2026-07-07 09:45 AM",
      decisionSaved: "2026-07-07 10:00 AM",
      outcomeDate: "2026-07-07 10:00 AM",
      customerNotified: "2026-07-07 10:10 AM"
    }
  },
  {
    id: "DEC-2026-007",
    applicantId: "app7",
    name: "Vikram Malhotra",
    avatar: "VM",
    age: 38,
    loanAmount: 450000,
    purpose: "Debt Consolidation",
    loanType: "Personal Loan",
    financialHealth: 75,
    defaultProb: 28,
    fraudRisk: "Medium",
    fraudScore: 45,
    decision: "Approved",
    officer: "Officer Priya",
    decisionDate: "2026-07-06",
    status: "Completed",
    aiRec: "Manual Review",
    confidence: 89.4,
    notes: "Consolidating 4 credit lines into a single lower-interest loan. Approved as debt-servicing capability is improved.",
    riskFactors: ["High number of credit queries (5 in last 90 days)"],
    protectiveFactors: ["Secured guarantor details submitted", "Debt restructuring improves cash flow margin"],
    income: 110000,
    expenses: 60000,
    debt: 450000,
    savings: 220000,
    timeline: {
      submitted: "2026-07-05 02:15 PM",
      aiAnalysis: "2026-07-05 02:25 PM",
      fraudAnalysis: "2026-07-05 02:30 PM",
      officerReview: "2026-07-06 11:15 AM",
      decisionSaved: "2026-07-06 11:45 AM",
      outcomeDate: "2026-07-06 11:45 AM",
      customerNotified: "2026-07-06 12:00 PM"
    }
  },
  {
    id: "DEC-2026-008",
    applicantId: "app8",
    name: "Neha Gupta",
    avatar: "NG",
    age: 41,
    loanAmount: 2000000,
    purpose: "Business Capital",
    loanType: "Business Loan",
    financialHealth: 38,
    defaultProb: 79,
    fraudRisk: "High",
    fraudScore: 82,
    decision: "Rejected",
    officer: "Officer Sanjay",
    decisionDate: "2026-07-05",
    status: "Completed",
    aiRec: "Deny",
    confidence: 95.1,
    notes: "Rejected due to high debt level (₹22L) relative to savings (₹60K) and suspicious credit activity profile.",
    riskFactors: ["Leverage exceeds 20x annual earnings", "High frequency of bank ledger anomalies"],
    protectiveFactors: ["Corporate guarantees exist but fail to satisfy threshold constraints"],
    income: 90000,
    expenses: 75000,
    debt: 2200000,
    savings: 60000,
    timeline: {
      submitted: "2026-07-04 10:00 AM",
      aiAnalysis: "2026-07-04 10:15 AM",
      fraudAnalysis: "2026-07-04 10:20 AM",
      officerReview: "2026-07-05 03:00 PM",
      decisionSaved: "2026-07-05 03:30 PM",
      outcomeDate: "2026-07-05 03:30 PM",
      customerNotified: "2026-07-05 03:45 PM"
    }
  },
  {
    id: "DEC-2026-009",
    applicantId: "app9",
    name: "Rahul Sen",
    avatar: "RS",
    age: 34,
    loanAmount: 650000,
    purpose: "Business Expansion",
    loanType: "Business Loan",
    financialHealth: 68,
    defaultProb: 42,
    fraudRisk: "Low",
    fraudScore: 18,
    decision: "Approved",
    officer: "Officer Rahul",
    decisionDate: "2026-07-04",
    status: "Completed",
    aiRec: "Manual Review",
    confidence: 94.2,
    notes: "Savings buffer covers 4 months of EMI liabilities. Clear merchant payment logs.",
    riskFactors: ["Debt-to-Income ratio (42%) is close to threshold"],
    protectiveFactors: ["Consistent payroll history", "Emergency savings reserve of ₹3.2L"],
    income: 120000,
    expenses: 78000,
    debt: 450000,
    savings: 320000,
    timeline: {
      submitted: "2026-07-03 09:30 AM",
      aiAnalysis: "2026-07-03 09:45 AM",
      fraudAnalysis: "2026-07-03 09:50 AM",
      officerReview: "2026-07-04 10:30 AM",
      decisionSaved: "2026-07-04 11:00 AM",
      outcomeDate: "2026-07-04 11:00 AM",
      customerNotified: "2026-07-04 11:15 AM"
    }
  },
  {
    id: "DEC-2026-010",
    applicantId: "app10",
    name: "Pooja Patel",
    avatar: "PP",
    age: 36,
    loanAmount: 950000,
    purpose: "Car Purchase",
    loanType: "Car Loan",
    financialHealth: 81,
    defaultProb: 14,
    fraudRisk: "Low",
    fraudScore: 9,
    decision: "Approved",
    officer: "Officer Sanjay",
    decisionDate: "2026-07-03",
    status: "Completed",
    aiRec: "Approve",
    confidence: 97.2,
    notes: "Approved. High credit score, stable government employment, low debt ratio.",
    riskFactors: ["None"],
    protectiveFactors: ["Government employee job security", "Debt-to-Income is extremely low (15%)"],
    income: 140000,
    expenses: 45000,
    debt: 100000,
    savings: 820000,
    timeline: {
      submitted: "2026-07-02 01:00 PM",
      aiAnalysis: "2026-07-02 01:10 PM",
      fraudAnalysis: "2026-07-02 01:12 PM",
      officerReview: "2026-07-03 02:00 PM",
      decisionSaved: "2026-07-03 02:20 PM",
      outcomeDate: "2026-07-03 02:20 PM",
      customerNotified: "2026-07-03 02:30 PM"
    }
  },
  {
    id: "DEC-2026-011",
    applicantId: "app11",
    name: "Rajesh Kumar",
    avatar: "RK",
    age: 52,
    loanAmount: 150000,
    purpose: "Micro Enterprise",
    loanType: "Business Loan",
    financialHealth: 79,
    defaultProb: 16,
    fraudRisk: "Low",
    fraudScore: 6,
    decision: "Approved",
    officer: "Officer Priya",
    decisionDate: "2026-07-02",
    status: "Completed",
    aiRec: "Approve",
    confidence: 92.5,
    notes: "Micro Business cash flows verified manually. Loan amount is well within repayment limits.",
    riskFactors: ["Age of applicant exceeds 50 years"],
    protectiveFactors: ["Established business for 15+ years", "Excellent credit history record"],
    income: 90000,
    expenses: 30000,
    debt: 30000,
    savings: 400000,
    timeline: {
      submitted: "2026-07-01 11:30 AM",
      aiAnalysis: "2026-07-01 11:45 AM",
      fraudAnalysis: "2026-07-01 11:48 AM",
      officerReview: "2026-07-02 10:15 AM",
      decisionSaved: "2026-07-02 10:30 AM",
      outcomeDate: "2026-07-02 10:30 AM",
      customerNotified: "2026-07-02 10:45 AM"
    }
  },
  {
    id: "DEC-2026-012",
    applicantId: "app12",
    name: "Sandy D'Souza",
    avatar: "SD",
    age: 27,
    loanAmount: 1100000,
    purpose: "Commercial Vehicle",
    loanType: "Car Loan",
    financialHealth: 48,
    defaultProb: 65,
    fraudRisk: "Medium",
    fraudScore: 52,
    decision: "Rejected",
    officer: "Officer Rahul",
    decisionDate: "2026-07-01",
    status: "Completed",
    aiRec: "Deny",
    confidence: 90.8,
    notes: "Rejected due to multiple loan inquiries and recent default logs. Cash flow coverage index fails guidelines.",
    riskFactors: ["2 missed credit card payments", "Debt-to-Income at 55%"],
    protectiveFactors: ["Co-guarantor profile stands healthy"],
    income: 110000,
    expenses: 85000,
    debt: 1800000,
    savings: 60000,
    timeline: {
      submitted: "2026-06-30 02:00 PM",
      aiAnalysis: "2026-06-30 02:15 PM",
      fraudAnalysis: "2026-06-30 02:22 PM",
      officerReview: "2026-07-01 11:00 AM",
      decisionSaved: "2026-07-01 11:30 AM",
      outcomeDate: "2026-07-01 11:30 AM",
      customerNotified: "2026-07-01 11:50 AM"
    }
  },
  {
    id: "DEC-2026-013",
    applicantId: "app13",
    name: "Kavita Reddy",
    avatar: "KR",
    age: 39,
    loanAmount: 700000,
    purpose: "Agriculture Equipment",
    loanType: "Commercial Loan",
    financialHealth: 83,
    defaultProb: 12,
    fraudRisk: "Low",
    fraudScore: 7,
    decision: "Approved",
    officer: "Officer Sanjay",
    decisionDate: "2026-06-30",
    status: "Completed",
    aiRec: "Approve",
    confidence: 94.7,
    notes: "Strong agricultural receipts and government subsidies verified.",
    riskFactors: ["Income is seasonally volatile"],
    protectiveFactors: ["Low leverage", "Government subsidy program matching"],
    income: 150000,
    expenses: 40000,
    debt: 0,
    savings: 500000,
    timeline: {
      submitted: "2026-06-29 09:15 AM",
      aiAnalysis: "2026-06-29 09:30 AM",
      fraudAnalysis: "2026-06-29 09:35 AM",
      officerReview: "2026-06-30 03:00 PM",
      decisionSaved: "2026-06-30 03:15 PM",
      outcomeDate: "2026-06-30 03:15 PM",
      customerNotified: "2026-06-30 03:30 PM"
    }
  },
  {
    id: "DEC-2026-014",
    applicantId: "app14",
    name: "Vishal Singh",
    avatar: "VS",
    age: 44,
    loanAmount: 1800000,
    purpose: "Property Expansion",
    loanType: "Home Loan",
    financialHealth: 41,
    defaultProb: 69,
    fraudRisk: "High",
    fraudScore: 71,
    decision: "Rejected",
    officer: "Officer Sanjay",
    decisionDate: "2026-06-29",
    status: "Completed",
    aiRec: "Deny",
    confidence: 92.1,
    notes: "Rejected due to document anomalies and lack of verifiable primary source income streams.",
    riskFactors: ["Income verification documents failed validation check", "High default risk rating (69%)"],
    protectiveFactors: ["Substantial real estate collateral value"],
    income: 130000,
    expenses: 95000,
    debt: 2000000,
    savings: 120000,
    timeline: {
      submitted: "2026-06-28 10:30 AM",
      aiAnalysis: "2026-06-28 10:45 AM",
      fraudAnalysis: "2026-06-28 10:50 AM",
      officerReview: "2026-06-29 02:00 PM",
      decisionSaved: "2026-06-29 02:30 PM",
      outcomeDate: "2026-06-29 02:30 PM",
      customerNotified: "2026-06-29 02:45 PM"
    }
  },
  {
    id: "DEC-2026-015",
    applicantId: "app15",
    name: "Manisha Mehta",
    avatar: "MM",
    age: 32,
    loanAmount: 500000,
    purpose: "Medical Expense",
    loanType: "Personal Loan",
    financialHealth: 76,
    defaultProb: 24,
    fraudRisk: "Low",
    fraudScore: 12,
    decision: "Approved",
    officer: "Officer Rahul",
    decisionDate: "2026-06-28",
    status: "Completed",
    aiRec: "Approve",
    confidence: 93.9,
    notes: "Approved under health policy emergency exception rules. Co-signer added.",
    riskFactors: ["Relatively high medical emergency expenses"],
    protectiveFactors: ["Co-signer with excellent credit registry scores", "Stable corporate employment"],
    income: 95000,
    expenses: 50000,
    debt: 100000,
    savings: 300000,
    timeline: {
      submitted: "2026-06-27 08:30 AM",
      aiAnalysis: "2026-06-27 08:45 AM",
      fraudAnalysis: "2026-06-27 08:50 AM",
      officerReview: "2026-06-28 09:15 AM",
      decisionSaved: "2026-06-28 09:30 AM",
      outcomeDate: "2026-06-28 09:30 AM",
      customerNotified: "2026-06-28 10:00 AM"
    }
  },
  {
    id: "DEC-2026-016",
    applicantId: "app16",
    name: "Siddharth Rao",
    avatar: "SR",
    age: 35,
    loanAmount: 1250000,
    purpose: "Business Restructuring",
    loanType: "Business Loan",
    financialHealth: 73,
    defaultProb: 31,
    fraudRisk: "Low",
    fraudScore: 16,
    decision: "Approved",
    officer: "Officer Priya",
    decisionDate: "2026-07-12",
    status: "Pending",
    aiRec: "Manual Review",
    confidence: 88.6,
    notes: "Awaiting final director signature verification. Initial officer audit complete and approved.",
    riskFactors: ["Pending registration document verification"],
    protectiveFactors: ["Solid cash flows in corporate accounts", "Consistent GST filings"],
    income: 250000,
    expenses: 120000,
    debt: 800000,
    savings: 1200000,
    timeline: {
      submitted: "2026-07-11 11:30 AM",
      aiAnalysis: "2026-07-11 11:45 AM",
      fraudAnalysis: "2026-07-11 11:50 AM",
      officerReview: "2026-07-12 11:00 AM",
      decisionSaved: "2026-07-12 11:30 AM",
      outcomeDate: "2026-07-12 11:30 AM",
      customerNotified: "Awaiting signature verification"
    }
  },
  {
    id: "DEC-2026-017",
    applicantId: "app17",
    name: "Ritu Sharma",
    avatar: "RS",
    age: 33,
    loanAmount: 350000,
    purpose: "Retail Stock Purchase",
    loanType: "Business Loan",
    financialHealth: 83,
    defaultProb: 16,
    fraudRisk: "Low",
    fraudScore: 5,
    decision: "Approved",
    officer: "Officer Priya",
    decisionDate: "2026-06-25",
    status: "Completed",
    aiRec: "Approve",
    confidence: 95.4,
    notes: "Disbursal complete. Low leverage profile and clean repayment history.",
    riskFactors: ["Short operating history of retail shop"],
    protectiveFactors: ["High sales velocity in merchant gateway statement", "Low expenses"],
    income: 130000,
    expenses: 40000,
    debt: 50000,
    savings: 380000,
    timeline: {
      submitted: "2026-06-24 02:00 PM",
      aiAnalysis: "2026-06-24 02:10 PM",
      fraudAnalysis: "2026-06-24 02:15 PM",
      officerReview: "2026-06-25 09:30 AM",
      decisionSaved: "2026-06-25 10:00 AM",
      outcomeDate: "2026-06-25 10:00 AM",
      customerNotified: "2026-06-25 10:15 AM"
    }
  },
  {
    id: "DEC-2026-018",
    applicantId: "app18",
    name: "Gaurav Verma",
    avatar: "GV",
    age: 46,
    loanAmount: 850000,
    purpose: "Education Loan",
    loanType: "Education Loan",
    financialHealth: 50,
    defaultProb: 55,
    fraudRisk: "Medium",
    fraudScore: 40,
    decision: "Rejected",
    officer: "Officer Priya",
    decisionDate: "2026-06-25",
    status: "Completed",
    aiRec: "Deny",
    confidence: 87.2,
    notes: "High revolving card debt (₹8.5L) combined with high default probability index. Denied due to cash outflow limitations.",
    riskFactors: ["Revolving card utilization exceeds 85%", "CIBIL report flags multiple recent queries"],
    protectiveFactors: ["Stable salaried income stream"],
    income: 110000,
    expenses: 80000,
    debt: 850000,
    savings: 90000,
    timeline: {
      submitted: "2026-06-24 10:30 AM",
      aiAnalysis: "2026-06-24 10:45 AM",
      fraudAnalysis: "2026-06-24 10:50 AM",
      officerReview: "2026-06-25 02:30 PM",
      decisionSaved: "2026-06-25 03:00 PM",
      outcomeDate: "2026-06-25 03:00 PM",
      customerNotified: "2026-06-25 03:15 PM"
    }
  },
  {
    id: "DEC-2026-019",
    applicantId: "app19",
    name: "Anjali Kapoor",
    avatar: "AK",
    age: 28,
    loanAmount: 600000,
    purpose: "Home Refurbishment",
    loanType: "Home Loan",
    financialHealth: 80,
    defaultProb: 14,
    fraudRisk: "Low",
    fraudScore: 8,
    decision: "Approved",
    officer: "Officer Sanjay",
    decisionDate: "2026-06-24",
    status: "Completed",
    aiRec: "Approve",
    confidence: 96.0,
    notes: "Approved. Stable employment at MNC and low DTI ratio.",
    riskFactors: ["None"],
    protectiveFactors: ["Low debt-to-income (18%)", "High credit score 765"],
    income: 125000,
    expenses: 40000,
    debt: 50000,
    savings: 450000,
    timeline: {
      submitted: "2026-06-23 03:00 PM",
      aiAnalysis: "2026-06-23 03:15 PM",
      fraudAnalysis: "2026-06-23 03:20 PM",
      officerReview: "2026-06-24 11:30 AM",
      decisionSaved: "2026-06-24 12:00 PM",
      outcomeDate: "2026-06-24 12:00 PM",
      customerNotified: "2026-06-24 12:15 PM"
    }
  },
  {
    id: "DEC-2026-020",
    applicantId: "app20",
    name: "Rahul Chahar",
    avatar: "RC",
    age: 35,
    loanAmount: 2200000,
    purpose: "Commercial Purchase",
    loanType: "Commercial Loan",
    financialHealth: 90,
    defaultProb: 8,
    fraudRisk: "Low",
    fraudScore: 3,
    decision: "Approved",
    officer: "Officer Rahul",
    decisionDate: "2026-07-12",
    status: "Pending",
    aiRec: "Approve",
    confidence: 98.4,
    notes: "Highly qualified profile. Substantial cash flows and prime credit grading score. Awaiting final credit board counter-signing.",
    riskFactors: ["Extremely high loan amount request"],
    protectiveFactors: ["Prime credit rating (CIBIL 812)", "Exceptional savings capacity of ₹15L"],
    income: 300000,
    expenses: 80000,
    debt: 200000,
    savings: 1500000,
    timeline: {
      submitted: "2026-07-11 04:30 PM",
      aiAnalysis: "2026-07-11 04:45 PM",
      fraudAnalysis: "2026-07-11 04:50 PM",
      officerReview: "2026-07-12 02:00 PM",
      decisionSaved: "2026-07-12 02:30 PM",
      outcomeDate: "2026-07-12 02:30 PM",
      customerNotified: "Awaiting board counter-sign"
    }
  }
];

// ============================================================================
// SVG MINI SPARKLINE HELPER
// ============================================================================
function MiniSparkline({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const width = 60;
  const height = 20;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible select-none shrink-0 opacity-80" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Format number in Indian currency style
const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DecisionsHistoryPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  // Core loading/error toggles
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Time & Advanced filter states
  const [timeFilter, setTimeFilter] = useState<"7 Days" | "30 Days" | "6 Months" | "1 Year">("30 Days");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Advanced Inputs
  const [searchTerm, setSearchTerm] = useState("");
  const [appIdFilter, setAppIdFilter] = useState("");
  const [applicantFilter, setApplicantFilter] = useState("");
  const [officerFilter, setOfficerFilter] = useState("All");
  const [decisionFilter, setDecisionFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [fraudFilter, setFraudFilter] = useState("All");
  const [healthFilter, setHealthFilter] = useState("All");
  const [amountFilter, setAmountFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Table view customizations
  const [sorting, setSorting] = useState<SortingState>([{ id: "decisionDate", desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [density, setDensity] = useState<"default" | "compact">("default");

  // Selection state for detail drawer
  const [selectedDecision, setSelectedDecision] = useState<DecisionHistoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ECharts canvas refs
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);
  const chart4Ref = useRef<HTMLDivElement>(null);
  const chart5Ref = useRef<HTMLDivElement>(null);
  const chart6Ref = useRef<HTMLDivElement>(null);

  // ============================================================================
  // TIMEFRAME FILTERING LOGIC
  // ============================================================================
  const timeFilteredDecisions = useMemo(() => {
    // Current simulated system date is 2026-07-12
    const cutoffDate = new Date("2026-07-12");
    if (timeFilter === "7 Days") {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    } else if (timeFilter === "30 Days") {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
    } else if (timeFilter === "6 Months") {
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
    } else if (timeFilter === "1 Year") {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    }

    return INITIAL_DECISIONS.filter((d) => {
      const dDate = new Date(d.decisionDate);
      return dDate >= cutoffDate;
    });
  }, [timeFilter]);

  // ============================================================================
  // ADVANCED FILTERING CHAIN
  // ============================================================================
  const tableFilteredDecisions = useMemo(() => {
    return timeFilteredDecisions.filter((d) => {
      // 1. General search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          d.id.toLowerCase().includes(term) ||
          d.name.toLowerCase().includes(term) ||
          d.officer.toLowerCase().includes(term) ||
          d.purpose.toLowerCase().includes(term) ||
          d.notes.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // 2. Application ID
      if (appIdFilter && !d.id.toLowerCase().includes(appIdFilter.toLowerCase())) {
        return false;
      }

      // 3. Applicant Name
      if (applicantFilter && !d.name.toLowerCase().includes(applicantFilter.toLowerCase())) {
        return false;
      }

      // 4. Underwriter Officer
      if (officerFilter !== "All" && d.officer !== officerFilter) {
        return false;
      }

      // 5. Decision
      if (decisionFilter !== "All" && d.decision !== decisionFilter) {
        return false;
      }

      // 6. Risk Level
      if (riskFilter !== "All") {
        let rLevel = "Low";
        if (d.defaultProb >= 75) rLevel = "Critical";
        else if (d.defaultProb >= 50) rLevel = "High";
        else if (d.defaultProb >= 25) rLevel = "Medium";

        if (rLevel !== riskFilter) return false;
      }

      // 7. Fraud Score range
      if (fraudFilter !== "All") {
        const score = d.fraudScore;
        if (fraudFilter === "<10%" && score >= 10) return false;
        if (fraudFilter === "10-30%" && (score < 10 || score > 30)) return false;
        if (fraudFilter === "30-50%" && (score < 30 || score > 50)) return false;
        if (fraudFilter === ">50%" && score <= 50) return false;
      }

      // 8. Financial Health score
      if (healthFilter !== "All") {
        const score = d.financialHealth;
        if (healthFilter === "<50" && score >= 50) return false;
        if (healthFilter === "50-70" && (score < 50 || score > 70)) return false;
        if (healthFilter === "70-85" && (score < 70 || score > 85)) return false;
        if (healthFilter === "85-100" && score < 85) return false;
      }

      // 9. Loan Amount range
      if (amountFilter !== "All") {
        const amt = d.loanAmount;
        if (amountFilter === "<₹5L" && amt >= 500000) return false;
        if (amountFilter === "₹5L-10L" && (amt < 500000 || amt > 1000000)) return false;
        if (amountFilter === "₹10L-15L" && (amt < 1000000 || amt > 1500000)) return false;
        if (amountFilter === ">₹15L" && amt <= 1500000) return false;
      }

      // 10. Completed/Pending Status
      if (statusFilter !== "All" && d.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [
    timeFilteredDecisions,
    searchTerm,
    appIdFilter,
    applicantFilter,
    officerFilter,
    decisionFilter,
    riskFilter,
    fraudFilter,
    healthFilter,
    amountFilter,
    statusFilter,
  ]);

  // ============================================================================
  // SUMMARY STATS CALCULATION
  // ============================================================================
  const stats = useMemo(() => {
    const total = timeFilteredDecisions.length;
    const approved = timeFilteredDecisions.filter((d) => d.decision === "Approved").length;
    const rejected = timeFilteredDecisions.filter((d) => d.decision === "Rejected").length;
    const manualReviews = timeFilteredDecisions.filter((d) => d.aiRec === "Manual Review").length;
    const pending = timeFilteredDecisions.filter((d) => d.status === "Pending").length;

    // Simulated average review time logic
    let avgTime = 4.2;
    if (timeFilter === "7 Days") avgTime = 3.8;
    else if (timeFilter === "6 Months") avgTime = 4.6;
    else if (timeFilter === "1 Year") avgTime = 5.9;

    return { total, approved, rejected, manualReviews, pending, avgTime };
  }, [timeFilteredDecisions, timeFilter]);

  // Reset Filters logic
  const handleResetFilters = () => {
    setSearchTerm("");
    setAppIdFilter("");
    setApplicantFilter("");
    setOfficerFilter("All");
    setDecisionFilter("All");
    setRiskFilter("All");
    setFraudFilter("All");
    setHealthFilter("All");
    setAmountFilter("All");
    setStatusFilter("All");
    toast.success("Filters reset successfully.");
  };

  // Simulated CSV Export
  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Compiling decision history report (CSV)...",
        success: "Success! Export files transferred to download spooler.",
        error: "Failed to generate export file."
      }
    );
  };

  // Simulated Audit Report PDF Generation
  const handleGenerateReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1800)),
      {
        loading: "Running risk intelligence PDF builder...",
        success: "Decision Report: ARTH-DECISION-TRAIL.pdf is ready.",
        error: "Error generating compliance report."
      }
    );
  };

  // Simulating sync refresh action
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Decision records synchronized with ledger repository.");
    }, 700);
  };

  // Simulating view save
  const handleSaveFilterView = () => {
    toast.success("Current filter parameters saved as default compliance view.");
  };

  // ============================================================================
  // TANSTACK TABLE COLUMNS SETUP
  // ============================================================================
  const columns = useMemo<ColumnDef<DecisionHistoryItem>[]>(() => [
    {
      accessorKey: "id",
      header: "Decision ID",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground block tracking-wider">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Applicant",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-[10px] shrink-0">
            {row.original.avatar}
          </div>
          <div>
            <span className="font-bold text-foreground block">{row.original.name}</span>
            <span className="text-[9px] text-foreground-secondary font-mono block leading-none mt-0.5">{row.original.loanType}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "loanAmount",
      header: "Loan Amount",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground block">
          {formatINR(row.original.loanAmount)}
        </span>
      ),
    },
    {
      accessorKey: "financialHealth",
      header: "Financial Health",
      cell: ({ row }) => {
        const score = row.original.financialHealth;
        let color = "text-positive bg-positive/10 border-positive/25";
        if (score < 50) color = "text-critical bg-critical/10 border-critical/25";
        else if (score < 70) color = "text-warning bg-warning/10 border-warning/25";

        return (
          <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm border inline-block", color)}>
            {score}/100
          </span>
        );
      },
    },
    {
      accessorKey: "defaultProb",
      header: "Default Prob",
      cell: ({ row }) => {
        const score = row.original.defaultProb;
        let color = "text-positive";
        if (score >= 50) color = "text-critical";
        else if (score >= 25) color = "text-warning";

        return (
          <span className={cn("font-mono font-extrabold text-xs block", color)}>
            {score}%
          </span>
        );
      },
    },
    {
      accessorKey: "fraudRisk",
      header: "Fraud Risk",
      cell: ({ row }) => {
        const risk = row.original.fraudRisk;
        const score = row.original.fraudScore;
        let style = "text-positive bg-positive/10 border-positive/20";
        if (risk === "High") style = "text-critical bg-critical/10 border-critical/20";
        else if (risk === "Medium") style = "text-warning bg-warning/10 border-warning/20";

        return (
          <div className="flex items-center gap-1">
            <span className={cn("text-[8px] font-sans font-bold px-1.5 py-0.25 rounded-xs uppercase border block", style)}>
              {risk}
            </span>
            <span className="font-mono text-[10px] text-foreground-secondary">({score}%)</span>
          </div>
        );
      },
    },
    {
      accessorKey: "decision",
      header: "Decision",
      cell: ({ row }) => {
        const dec = row.original.decision;
        return (
          <span className={cn(
            "text-[9px] font-sans font-bold px-2 py-0.5 rounded-xs uppercase border block text-center max-w-[80px]",
            dec === "Approved"
              ? "text-positive bg-positive/10 border-positive/25"
              : "text-critical bg-critical/10 border-critical/25"
          )}>
            {dec}
          </span>
        );
      },
    },
    {
      accessorKey: "officer",
      header: "Officer",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground-secondary block">
          {row.original.officer}
        </span>
      ),
    },
    {
      accessorKey: "decisionDate",
      header: "Decision Date",
      cell: ({ row }) => (
        <span className="font-mono text-foreground-muted text-[10px] block">
          {row.original.decisionDate}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status.toLowerCase() as "completed" | "pending";
        return <StatusBadge status={status} />;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 cursor-pointer flex items-center justify-center border-border hover:border-border-strong hover:bg-surface-hover"
          onClick={() => {
            setSelectedDecision(row.original);
            setDrawerOpen(true);
          }}
          title="Open detail drawer"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ], []);

  const table = useReactTable({
    data: tableFilteredDecisions,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Keyboard navigation on table rows helper
  const handleKeyDownRow = (e: React.KeyboardEvent, record: DecisionHistoryItem) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedDecision(record);
      setDrawerOpen(true);
    }
  };

  // ============================================================================
  // ECHARTS CODE BLOCK (RESPONSIVE & REACTIVE)
  // ============================================================================
  useEffect(() => {
    if (isLoading || isError || tableFilteredDecisions.length === 0) return;

    const chartInstances: echarts.ECharts[] = [];
    const isDark = document.documentElement.classList.contains("dark");
    const labelColor = isDark ? "#94A3B8" : "#64748B";
    const gridLineColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

    const initChart = (ref: React.RefObject<HTMLDivElement | null>, option: echarts.EChartsOption) => {
      if (!ref.current) return null;
      // Clear old canvas if any
      const existing = echarts.getInstanceByDom(ref.current);
      if (existing) {
        existing.dispose();
      }
      const chart = echarts.init(ref.current);
      chart.setOption(option);
      chartInstances.push(chart);
      return chart;
    };

    // Compiling Timeframe chart parameters
    let timelineLabels: string[] = [];
    let approvalTrend: number[] = [];
    let rejectionTrend: number[] = [];
    let avgHoursTrend: number[] = [];
    let monthlyLabels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    let monthlyCount = [45, 60, 85, 110, 130, tableFilteredDecisions.length];

    if (timeFilter === "7 Days") {
      timelineLabels = ["Jul 06", "Jul 07", "Jul 08", "Jul 09", "Jul 10", "Jul 11", "Jul 12"];
      approvalTrend = [8, 12, 10, 15, 11, 14, 18];
      rejectionTrend = [2, 3, 4, 1, 2, 5, 3];
      avgHoursTrend = [4.8, 4.5, 4.9, 4.1, 4.3, 4.0, 3.8];
    } else if (timeFilter === "30 Days") {
      timelineLabels = ["Jun 15", "Jun 20", "Jun 25", "Jun 30", "Jul 05", "Jul 10", "Jul 12"];
      approvalTrend = [42, 38, 45, 52, 48, 55, 60];
      rejectionTrend = [12, 15, 10, 18, 14, 11, 13];
      avgHoursTrend = [5.5, 5.2, 5.0, 4.8, 4.5, 4.2, 3.9];
    } else if (timeFilter === "6 Months") {
      timelineLabels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
      approvalTrend = [180, 210, 245, 290, 320, 350];
      rejectionTrend = [55, 62, 70, 85, 90, 95];
      avgHoursTrend = [6.2, 5.9, 5.5, 5.0, 4.6, 4.2];
    } else { // 1 Year
      timelineLabels = ["Q3 25", "Q4 25", "Q1 26", "Q2 26", "Jul 26"];
      approvalTrend = [480, 520, 610, 780, 962];
      rejectionTrend = [140, 165, 190, 240, 348];
      avgHoursTrend = [7.5, 6.8, 5.9, 4.8, 4.2];
      monthlyLabels = ["Aug25", "Oct25", "Dec25", "Feb26", "Apr26", "Jun26", "Jul26"];
      monthlyCount = [120, 145, 160, 185, 210, 240, tableFilteredDecisions.length];
    }

    // Pie score tallies
    const approvedTotal = tableFilteredDecisions.filter(d => d.decision === "Approved").length;
    const rejectedTotal = tableFilteredDecisions.filter(d => d.decision === "Rejected").length;
    const pendingTotal = tableFilteredDecisions.filter(d => d.status === "Pending").length;

    // Risk levels tallies
    const riskLow = tableFilteredDecisions.filter(d => d.defaultProb < 25).length;
    const riskMed = tableFilteredDecisions.filter(d => d.defaultProb >= 25 && d.defaultProb < 50).length;
    const riskHigh = tableFilteredDecisions.filter(d => d.defaultProb >= 50 && d.defaultProb < 75).length;
    const riskCrit = tableFilteredDecisions.filter(d => d.defaultProb >= 75).length;

    // Health Score range tallies
    const healthUnder50 = tableFilteredDecisions.filter(d => d.financialHealth < 50).length;
    const health50to70 = tableFilteredDecisions.filter(d => d.financialHealth >= 50 && d.financialHealth < 70).length;
    const health70to85 = tableFilteredDecisions.filter(d => d.financialHealth >= 70 && d.financialHealth < 85).length;
    const health85to100 = tableFilteredDecisions.filter(d => d.financialHealth >= 85).length;

    // Chart 1: Approval vs Rejection Trend
    initChart(chart1Ref, {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      legend: { textStyle: { color: labelColor, fontSize: 8.5 }, top: 0, right: 10 },
      grid: { top: 30, bottom: 25, left: 35, right: 15 },
      xAxis: { type: "category", data: timelineLabels, axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          name: "Approved",
          type: "line",
          smooth: true,
          data: approvalTrend,
          itemStyle: { color: "#10B981" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(16, 185, 129, 0.15)" },
              { offset: 1, color: "rgba(16, 185, 129, 0)" }
            ])
          }
        },
        {
          name: "Rejected",
          type: "line",
          smooth: true,
          data: rejectionTrend,
          itemStyle: { color: "#EF4444" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(239, 68, 68, 0.15)" },
              { offset: 1, color: "rgba(239, 68, 68, 0)" }
            ])
          }
        }
      ]
    });

    // Chart 2: Monthly Decisions
    initChart(chart2Ref, {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      grid: { top: 20, bottom: 25, left: 35, right: 15 },
      xAxis: { type: "category", data: monthlyLabels, axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          type: "bar",
          data: monthlyCount,
          itemStyle: {
            color: "#4F7CFF",
            borderRadius: [2, 2, 0, 0]
          }
        }
      ]
    });

    // Chart 3: Decision Distribution
    initChart(chart3Ref, {
      tooltip: {
        trigger: "item",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      series: [
        {
          type: "pie",
          radius: ["45%", "75%"],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 3, borderColor: isDark ? "#0E1421" : "#FFFFFF", borderWidth: 1.5 },
          label: { show: false },
          emphasis: { label: { show: false } },
          data: [
            { value: approvedTotal, name: "Approved", itemStyle: { color: "#10B981" } },
            { value: rejectedTotal, name: "Rejected", itemStyle: { color: "#EF4444" } },
            { value: pendingTotal, name: "Pending", itemStyle: { color: "#F59E0B" } }
          ]
        }
      ]
    });

    // Chart 4: Processing Time Trend
    initChart(chart4Ref, {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      grid: { top: 20, bottom: 25, left: 35, right: 15 },
      xAxis: { type: "category", data: timelineLabels, axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: {
        type: "value",
        axisLabel: { formatter: "{value}h", color: labelColor, fontSize: 8.5 },
        splitLine: { lineStyle: { color: gridLineColor } }
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: avgHoursTrend,
          itemStyle: { color: "#8B5CF6" },
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(139, 92, 246, 0.12)" },
              { offset: 1, color: "rgba(139, 92, 246, 0)" }
            ])
          }
        }
      ]
    });

    // Chart 5: Risk Distribution
    initChart(chart5Ref, {
      tooltip: {
        trigger: "item",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      series: [
        {
          type: "pie",
          radius: "75%",
          data: [
            { value: riskLow, name: "Low Risk", itemStyle: { color: "#10B981" } },
            { value: riskMed, name: "Medium Risk", itemStyle: { color: "#F59E0B" } },
            { value: riskHigh, name: "High Risk", itemStyle: { color: "#EF4444" } },
            { value: riskCrit, name: "Critical Risk", itemStyle: { color: "#b91c1c" } }
          ],
          label: { show: false },
          itemStyle: { borderRadius: 2, borderColor: isDark ? "#0E1421" : "#FFFFFF", borderWidth: 1.5 }
        }
      ]
    });

    // Chart 6: Financial Health Distribution
    initChart(chart6Ref, {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#0E1421" : "#FFFFFF",
        borderColor: isDark ? "#1E293B" : "#E2E8F0",
        textStyle: { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 9 }
      },
      grid: { top: 20, bottom: 25, left: 35, right: 15 },
      xAxis: { type: "category", data: ["<50", "50-70", "70-85", "85-100"], axisLabel: { color: labelColor, fontSize: 8.5 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: gridLineColor } }, axisLabel: { color: labelColor, fontSize: 8.5 } },
      series: [
        {
          type: "bar",
          data: [healthUnder50, health50to70, health70to85, health85to100],
          itemStyle: {
            color: "#06B6D4",
            borderRadius: [2, 2, 0, 0]
          }
        }
      ]
    });

    // Responsiveness handler
    const handleResize = () => {
      chartInstances.forEach((chart) => chart.resize());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstances.forEach((chart) => chart.dispose());
    };
  }, [isLoading, isError, tableFilteredDecisions, resolvedTheme, timeFilter]);

  return (
    <PageContainer className="pb-24">
      
      {/* ==========================================
          HEADER ACTION SECTION
          ========================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-border select-none">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/officer")}
            className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1 cursor-pointer mb-1 focus-visible:outline-none"
            aria-label="Back to Command Center"
          >
            <ArrowLeft className="h-3 w-3" /> Command Center
          </button>
          
          <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2.5">
            <History className="h-6.5 w-6.5 text-primary" /> Credit Decision History
          </h1>
          <p className="text-xs text-foreground-secondary font-sans">
            Review every loan decision, monitor approval patterns, audit previous actions, and analyze officer performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            className="text-xs font-semibold gap-1.5 border-border hover:bg-surface-hover hover:text-foreground cursor-pointer"
            aria-label="Generate Decision Report PDF"
          >
            <Download className="h-3.5 w-3.5" />
            Generate Decision Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs font-semibold gap-1.5 border-border hover:bg-surface-hover hover:text-foreground cursor-pointer"
            aria-label="Export Decisions CSV"
          >
            <Sliders className="h-3.5 w-3.5" />
            Export Decisions
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
            aria-label="Refresh decisions data logs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ERROR STATE RETRY BLOCK */}
        {isError ? (
          <motion.div
            key="error-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ErrorState
              title="Audit Sync Mismatch"
              description="Our compliance logging nodes encountered a synchronization delay with the master database. Please clear cache or retry."
              onRetry={() => {
                setIsError(false);
                handleRefresh();
              }}
              retryLabel="Force Audit Re-Sync"
            />
          </motion.div>
        ) : isLoading ? (
          /* ==========================================
              LOADING SKELETONS STATED
              ========================================== */
          <motion.div
            key="loading-skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* KPI skeleton cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border border-border/80 bg-surface p-4 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-7 w-24" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Analytics loading skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border border-border/80 bg-surface">
                  <div className="p-4 border-b border-border/40 flex justify-between items-center">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4.5 w-4.5 rounded-full" />
                  </div>
                  <CardContent className="h-48 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-foreground-muted animate-spin" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table skeleton loader */}
            <Card className="border border-border/80 bg-surface p-5">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="space-y-3.5">
                <Skeleton className="h-9 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </Card>
          </motion.div>
        ) : (
          /* ==========================================
              MAIN RENDER CONTENT BLOCK
              ========================================== */
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            
            {/* ==========================================
                SUMMARY KPI CARDS
                ========================================== */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              {/* Card 1: Total Decisions */}
              <Card className="border border-border/80 bg-surface hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 select-none cursor-pointer">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Total Decisions</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-foreground block">{stats.total}</span>
                    <ClipboardList className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +12.4%
                    </span>
                    <MiniSparkline data={[115, 120, 118, 122, 128, stats.total]} color="var(--primary)" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Approved Decisions */}
              <Card className="border border-border/80 bg-surface hover:border-positive/40 hover:-translate-y-0.5 transition-all duration-200 select-none cursor-pointer">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Approved</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-positive block">{stats.approved}</span>
                    <CheckCircle2 className="h-4 w-4 text-positive" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +10.2%
                    </span>
                    <MiniSparkline data={[78, 80, 85, 82, 90, stats.approved]} color="var(--positive)" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Rejected Decisions */}
              <Card className="border border-border/80 bg-surface hover:border-critical/40 hover:-translate-y-0.5 transition-all duration-200 select-none cursor-pointer">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Rejected</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-critical block">{stats.rejected}</span>
                    <XCircle className="h-4 w-4 text-critical" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +5.1%
                    </span>
                    <MiniSparkline data={[28, 30, 27, 33, 31, stats.rejected]} color="var(--critical)" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Manual Reviews */}
              <Card className="border border-border/80 bg-surface hover:border-warning/40 hover:-translate-y-0.5 transition-all duration-200 select-none cursor-pointer">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Manual Reviews</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-warning block">{stats.manualReviews}</span>
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-critical font-bold flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3" /> -2.4%
                    </span>
                    <MiniSparkline data={[12, 14, 11, 15, 10, stats.manualReviews]} color="var(--warning)" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 5: Pending Decisions */}
              <Card className="border border-border/80 bg-surface hover:border-forecast/40 hover:-translate-y-0.5 transition-all duration-200 select-none cursor-pointer">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Pending Decisions</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-foreground-secondary block">{stats.pending}</span>
                    <Clock className="h-4 w-4 text-foreground-muted" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> -15.8%
                    </span>
                    <MiniSparkline data={[8, 7, 9, 6, 5, stats.pending]} color="var(--forecast)" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 6: Average Processing Time */}
              <Card className="border border-border/80 bg-surface hover:border-ai/40 hover:-translate-y-0.5 transition-all duration-200 select-none cursor-pointer">
                <CardContent className="p-4 space-y-1 relative">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Avg Process Time</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold font-mono text-ai block">{stats.avgTime}h</span>
                    <Timer className="h-4 w-4 text-ai animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20">
                    <span className="text-[8.5px] text-positive font-bold flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3" /> -8.3%
                    </span>
                    <MiniSparkline data={[5.2, 5.0, 4.8, 4.4, 4.3, stats.avgTime]} color="var(--ai)" />
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* ==========================================
                DECISION ANALYTICS SECTION
                ========================================== */}
            <Card className="border border-border/80 bg-surface">
              <div className="p-4 border-b border-border/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between select-none">
                <div>
                  <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-primary" /> Interactive Analytics Workspace
                  </h3>
                  <p className="text-[10px] text-foreground-secondary">Timeframe filters dynamically restyle all charts and KPIs.</p>
                </div>
                
                {/* Timeframe selector toolbar */}
                <div className="flex items-center bg-surface-elevated border border-border p-0.5 rounded-sm self-start">
                  {(["7 Days", "30 Days", "6 Months", "1 Year"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={cn(
                        "px-3 py-1 text-[10px] font-semibold font-sans rounded-xs transition-all cursor-pointer",
                        timeFilter === filter
                          ? "bg-primary text-white shadow-xs font-bold"
                          : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6-column charts grid layout */}
              <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Chart 1: Approval vs Rejection Trend */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Approval vs Rejection Trend</span>
                  <div ref={chart1Ref} className="h-48 w-full" />
                </div>

                {/* Chart 2: Monthly Decisions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Monthly Decisions</span>
                  <div ref={chart2Ref} className="h-48 w-full" />
                </div>

                {/* Chart 3: Decision Distribution */}
                <div className="space-y-1.5 flex flex-col">
                  <span className="text-[10px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Decision Distribution</span>
                  <div className="flex-1 flex items-center gap-3">
                    <div ref={chart3Ref} className="h-40 w-40 shrink-0" />
                    <div className="text-[10px] space-y-2 select-none">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-positive" />
                        <span className="text-foreground-secondary">Approved: <strong className="text-foreground font-mono">{tableFilteredDecisions.filter(d => d.decision === "Approved").length}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-critical" />
                        <span className="text-foreground-secondary">Rejected: <strong className="text-foreground font-mono">{tableFilteredDecisions.filter(d => d.decision === "Rejected").length}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-warning" />
                        <span className="text-foreground-secondary">Pending: <strong className="text-foreground font-mono">{tableFilteredDecisions.filter(d => d.status === "Pending").length}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 4: Processing Time Trend */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Processing Time Trend (Hours)</span>
                  <div ref={chart4Ref} className="h-48 w-full" />
                </div>

                {/* Chart 5: Risk Distribution */}
                <div className="space-y-1.5 flex flex-col">
                  <span className="text-[10px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Default Risk Distribution</span>
                  <div className="flex-1 flex items-center gap-3">
                    <div ref={chart5Ref} className="h-40 w-40 shrink-0" />
                    <div className="text-[10px] space-y-1.5 select-none">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-positive" />
                        <span className="text-foreground-secondary font-medium">Low (&lt;25%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-warning" />
                        <span className="text-foreground-secondary font-medium">Medium (25-50%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-critical" />
                        <span className="text-foreground-secondary font-medium">High (50-75%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-700" />
                        <span className="text-foreground-secondary font-medium">Critical (&gt;75%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 6: Financial Health Distribution */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-foreground-muted block uppercase font-bold tracking-wider select-none">Financial Health Distribution</span>
                  <div ref={chart6Ref} className="h-48 w-full" />
                </div>

              </CardContent>
            </Card>

            {/* ==========================================
                ADVANCED FILTER BAR
                ========================================== */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-96 flex items-center">
                  <span className="absolute left-3 text-foreground-muted">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search applicant name, officer, decision justification notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface border border-border rounded-sm py-1.5 pl-9 pr-3 text-[11px] font-semibold text-foreground placeholder-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
                    aria-label="Search decision audit logs"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3.5 text-foreground-muted hover:text-foreground cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Advanced settings toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className={cn(
                      "text-xs gap-1.5 cursor-pointer font-semibold border-border hover:bg-surface-hover",
                      isAdvancedOpen && "bg-surface-hover border-border-strong"
                    )}
                    aria-expanded={isAdvancedOpen}
                    aria-label="Toggle Advanced Filters"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Advanced Filters
                    <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isAdvancedOpen && "rotate-180")} />
                  </Button>

                  {/* Density toggle buttons */}
                  <div className="flex items-center bg-surface-elevated border border-border p-0.5 rounded-sm">
                    <button
                      onClick={() => setDensity("default")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-semibold rounded-xs transition-colors cursor-pointer",
                        density === "default"
                          ? "bg-surface text-foreground shadow-xs font-bold"
                          : "text-foreground-secondary hover:text-foreground"
                      )}
                    >
                      Comfortable
                    </button>
                    <button
                      onClick={() => setDensity("compact")}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-semibold rounded-xs transition-colors cursor-pointer",
                        density === "compact"
                          ? "bg-surface text-foreground shadow-xs font-bold"
                          : "text-foreground-secondary hover:text-foreground"
                      )}
                    >
                      Compact
                    </button>
                  </div>

                  {/* Column Visibility popup */}
                  <Popover
                    trigger={
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold border-border cursor-pointer hover:bg-surface-hover">
                        <Sliders className="h-3.5 w-3.5" />
                        Columns
                      </Button>
                    }
                  >
                    <div className="space-y-2 select-none">
                      <p className="font-heading font-semibold text-xs text-foreground mb-2 border-b border-border/40 pb-1 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-primary" /> Visibility
                      </p>
                      {table.getAllLeafColumns().map((column) => {
                        if (column.id === "actions") return null;
                        return (
                          <label
                            key={column.id}
                            className="flex items-center gap-2 cursor-pointer text-xs text-foreground-secondary hover:text-foreground font-semibold"
                          >
                            <input
                              type="checkbox"
                              checked={column.getIsVisible()}
                              onChange={column.getToggleVisibilityHandler()}
                              className="rounded-xs border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span>{column.columnDef.header as string}</span>
                          </label>
                        );
                      })}
                    </div>
                  </Popover>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs hover:text-critical font-bold text-foreground-secondary cursor-pointer"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Expandable Advanced Filters Drawer Panel */}
              <AnimatePresence>
                {isAdvancedOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="bg-surface border border-border p-4 rounded-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 text-[11px] select-none shadow-xs">
                      
                      {/* Application ID Input */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Application ID</label>
                        <input
                          type="text"
                          placeholder="e.g. DEC-2026-001"
                          value={appIdFilter}
                          onChange={(e) => setAppIdFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2.5 font-mono text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      {/* Applicant name Input */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Applicant</label>
                        <input
                          type="text"
                          placeholder="e.g. Suresh"
                          value={applicantFilter}
                          onChange={(e) => setApplicantFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2.5 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      {/* Officer selection */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Underwriter</label>
                        <select
                          value={officerFilter}
                          onChange={(e) => setOfficerFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Officers</option>
                          <option value="Officer Rahul">Officer Rahul</option>
                          <option value="Officer Priya">Officer Priya</option>
                          <option value="Officer Sanjay">Officer Sanjay</option>
                        </select>
                      </div>

                      {/* Decision Filter selection */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Decision</label>
                        <select
                          value={decisionFilter}
                          onChange={(e) => setDecisionFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Outcomes</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Risk filter */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Risk Band</label>
                        <select
                          value={riskFilter}
                          onChange={(e) => setRiskFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Risk Bands</option>
                          <option value="Low">Low Risk (&lt;25%)</option>
                          <option value="Medium">Medium Risk (25-50%)</option>
                          <option value="High">High Risk (50-75%)</option>
                          <option value="Critical">Critical Risk (&gt;75%)</option>
                        </select>
                      </div>

                      {/* Fraud score filter */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Fraud Score</label>
                        <select
                          value={fraudFilter}
                          onChange={(e) => setFraudFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Scores</option>
                          <option value="<10%">&lt; 10% Risk</option>
                          <option value="10-30%">10% - 30% Risk</option>
                          <option value="30-50%">30% - 50% Risk</option>
                          <option value=">50%">&gt; 50% critical</option>
                        </select>
                      </div>

                      {/* Financial health filter */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Financial Health</label>
                        <select
                          value={healthFilter}
                          onChange={(e) => setHealthFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Scores</option>
                          <option value="<50">&lt; 50 (Poor)</option>
                          <option value="50-70">50 - 70 (Fair)</option>
                          <option value="70-85">70 - 85 (Strong)</option>
                          <option value="85-100">85 - 100 (Prime)</option>
                        </select>
                      </div>

                      {/* Loan amount filter */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Loan Amount</label>
                        <select
                          value={amountFilter}
                          onChange={(e) => setAmountFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Amounts</option>
                          <option value="<₹5L">&lt; ₹5,00,000</option>
                          <option value="₹5L-10L">₹5,00,000 - ₹10,00,000</option>
                          <option value="₹10L-15L">₹10,00,000 - ₹15,00,000</option>
                          <option value=">₹15L">&gt; ₹15,00,000</option>
                        </select>
                      </div>

                      {/* Processing status */}
                      <div className="space-y-1">
                        <label className="text-foreground-secondary font-bold uppercase tracking-wider block">Process Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full bg-surface border border-border rounded-sm py-1 px-2 font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>

                      {/* Reset & Save Toolbar */}
                      <div className="flex items-end gap-2 lg:col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveFilterView}
                          className="w-full text-xs font-semibold py-1 h-7 text-foreground border-border hover:bg-surface-hover cursor-pointer"
                        >
                          Save View
                        </Button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ==========================================
                TABLE AUDIT LOG VIEW (DESKTOP / TABLET)
                ========================================== */}
            <Card className="border border-border/80 bg-surface shadow-xs">
              {tableFilteredDecisions.length === 0 ? (
                /* Empty state inside card */
                <EmptyState
                  title="No Decisions Found"
                  description="Adjust or reset your filters above to view historical underwriting clearance logs."
                  icon={History}
                  actionLabel="Clear Filters"
                  onAction={handleResetFilters}
                />
              ) : (
                <>
                  {/* Tablet/Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse relative">
                      <thead>
                        {table.getHeaderGroups().map((group) => (
                          <tr
                            key={group.id}
                            className="bg-surface-elevated/80 text-[9px] font-bold text-foreground-muted uppercase tracking-wider border-b border-border sticky top-0 z-10 select-none"
                          >
                            {group.headers.map((header) => (
                              <th
                                key={header.id}
                                className={cn(
                                  "py-3 px-4 font-sans font-extrabold transition-colors",
                                  header.column.getCanSort() && "cursor-pointer hover:bg-surface-hover hover:text-foreground",
                                  density === "compact" && "py-2 px-3"
                                )}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <div className="flex items-center gap-1">
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getCanSort() && (
                                    <ChevronDown className={cn(
                                      "h-3 w-3 text-foreground-muted transition-transform",
                                      header.column.getIsSorted() === "asc" && "rotate-180 text-primary",
                                      header.column.getIsSorted() === "desc" && "text-primary"
                                    )} />
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDownRow(e, row.original)}
                            className={cn(
                              "border-b border-border/30 last:border-b-0 hover:bg-surface-hover/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary",
                              row.original.status === "Pending" && "bg-warning/2 hover:bg-warning/5"
                            )}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                onClick={() => {
                                  // Skip trigger drawer when clicking the actions button itself
                                  if (cell.column.id !== "actions") {
                                    setSelectedDecision(row.original);
                                    setDrawerOpen(true);
                                  }
                                }}
                                className={cn(
                                  "py-3 px-4 text-foreground-secondary font-sans align-middle",
                                  density === "compact" && "py-1.5 px-3"
                                )}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE COLLAPSIBLE CARDS LIST VIEW */}
                  <div className="md:hidden p-4 space-y-3">
                    <span className="text-[10px] text-foreground-muted font-bold block uppercase tracking-wide select-none">Mobile Decision Logs</span>
                    {table.getRowModel().rows.map((row) => {
                      const item = row.original;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "border border-border/60 rounded-md p-4 bg-surface-elevated/45 space-y-3",
                            item.status === "Pending" && "border-warning/30 bg-warning/2"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-extrabold text-foreground tracking-wider text-xs">{item.id}</span>
                            <span className={cn(
                              "text-[8px] font-sans font-bold px-2 py-0.5 rounded-xs uppercase border",
                              item.decision === "Approved"
                                ? "text-positive bg-positive/10 border-positive/20"
                                : "text-critical bg-critical/10 border-critical/20"
                            )}>
                              {item.decision}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {item.avatar}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block text-xs">{item.name}</span>
                              <span className="text-[9px] text-foreground-secondary">{item.purpose}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-border/10 select-none">
                            <div>
                              <span className="text-foreground-muted block uppercase tracking-wider text-[8px]">Loan Amount</span>
                              <span className="font-mono font-extrabold text-foreground">{formatINR(item.loanAmount)}</span>
                            </div>
                            <div>
                              <span className="text-foreground-muted block uppercase tracking-wider text-[8px]">Health Index</span>
                              <span className="font-mono font-bold text-foreground">{item.financialHealth}/100</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-foreground-muted block uppercase tracking-wider text-[8px]">Underwriter</span>
                              <span className="font-semibold text-foreground-secondary">{item.officer}</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-foreground-muted block uppercase tracking-wider text-[8px]">Decision Date</span>
                              <span className="font-mono text-foreground-muted">{item.decisionDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/10">
                            <StatusBadge status={item.status.toLowerCase() as "completed" | "pending"} />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDecision(item);
                                setDrawerOpen(true);
                              }}
                              className="h-7 px-3.5 text-xs font-semibold gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View Audit
                            </Button>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* PAGINATION TOOLBAR */}
                  <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] select-none text-foreground-secondary">
                    <div className="flex items-center gap-1.5">
                      <span>Showing</span>
                      <strong className="text-foreground font-mono">{pageIndex * pageSize + 1}</strong>
                      <span>to</span>
                      <strong className="text-foreground font-mono">
                        {Math.min((pageIndex + 1) * pageSize, tableFilteredDecisions.length)}
                      </strong>
                      <span>of</span>
                      <strong className="text-foreground font-mono">{tableFilteredDecisions.length}</strong>
                      <span>decisions</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Items per page Selector */}
                      <div className="flex items-center gap-1.5">
                        <span>Show</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageIndex(0);
                          }}
                          className="bg-surface border border-border rounded-sm py-1 pl-1.5 pr-6 text-foreground font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                        >
                          {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                              {size} entries
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Prev/Next buttons */}
                      <div className="flex items-center gap-1 bg-surface border border-border p-0.5 rounded-sm">
                        <button
                          onClick={() => setPageIndex(p => Math.max(p - 1, 0))}
                          disabled={!table.getCanPreviousPage()}
                          className="p-1 hover:bg-surface-hover rounded-xs text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-none"
                          aria-label="Previous Page"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2 font-mono font-bold text-foreground">
                          {pageIndex + 1} / {table.getPageCount() || 1}
                        </span>
                        <button
                          onClick={() => setPageIndex(p => Math.min(p + 1, table.getPageCount() - 1))}
                          disabled={!table.getCanNextPage()}
                          className="p-1 hover:bg-surface-hover rounded-xs text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-none"
                          aria-label="Next Page"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* ==========================================
                OFFICER PERFORMANCE SECTION
                ========================================== */}
            <div className="space-y-3.5">
              <h3 className="font-heading font-semibold text-sm text-foreground tracking-wide flex items-center gap-1.5 select-none">
                <Sliders className="h-4 w-4 text-ai" /> Officer Performance Audit
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* 1. Approval Rate */}
                <Card className="border border-border/80 bg-surface select-none">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                      <span>Approval Rate</span>
                      <TrendingUp className="h-3.5 w-3.5 text-positive animate-bounce" />
                    </div>
                    <div>
                      <span className="text-xl font-mono font-extrabold text-foreground">65.2%</span>
                      <span className="text-[9px] text-foreground-muted block">Stable within primary risk boundary</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-positive rounded-full" style={{ width: "65.2%" }} />
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Manual Review % */}
                <Card className="border border-border/80 bg-surface select-none">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                      <span>Manual Review %</span>
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    </div>
                    <div>
                      <span className="text-xl font-mono font-extrabold text-foreground">11.5%</span>
                      <span className="text-[9px] text-foreground-muted block">-1.2% lower routing from auto-pipeline</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full" style={{ width: "11.5%" }} />
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Average Review Time */}
                <Card className="border border-border/80 bg-surface select-none">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                      <span>Avg Review Time</span>
                      <Clock className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xl font-mono font-extrabold text-foreground">4.2 Hours</span>
                      <span className="text-[9px] text-foreground-muted block">Surpasses SLA target threshold (8h)</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "85%" }} />
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Portfolio Quality */}
                <Card className="border border-border/80 bg-surface select-none">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                      <span>Portfolio Quality</span>
                      <ShieldCheck className="h-3.5 w-3.5 text-positive" />
                    </div>
                    <div>
                      <span className="text-xl font-mono font-extrabold text-foreground">94.8%</span>
                      <span className="text-[9px] text-foreground-muted block">Prime ratings (Grade A & B debt)</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-positive rounded-full" style={{ width: "94.8%" }} />
                    </div>
                  </CardContent>
                </Card>

                {/* 5. Decision Accuracy */}
                <Card className="border border-border/80 bg-surface select-none">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                      <span>Decision Accuracy</span>
                      <TrendingUp className="h-3.5 w-3.5 text-ai" />
                    </div>
                    <div>
                      <span className="text-xl font-mono font-extrabold text-foreground">98.7%</span>
                      <span className="text-[9px] text-foreground-muted block">Corresponds with AI ensemble predictions</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-ai rounded-full" style={{ width: "98.7%" }} />
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          AUDIT LOG SLIDEOUT DRAWER DETAILS PANEL
          ========================================== */}
      <Sheet
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedDecision ? `Audit Log: ${selectedDecision.id}` : "Audit Log details"}
        className="max-w-lg select-none"
      >
        {selectedDecision && (
          <div className="space-y-6 text-foreground pb-8">
            
            {/* Applicant brief summary banner */}
            <div className="bg-surface-elevated/45 p-4 rounded-sm border border-border flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-sm shrink-0">
                {selectedDecision.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-heading font-extrabold text-foreground block text-sm">{selectedDecision.name}</span>
                <span className="text-[10px] text-foreground-secondary block truncate mt-0.5">
                  Age {selectedDecision.age} • {selectedDecision.loanType} • {selectedDecision.purpose}
                </span>
              </div>
              <span className={cn(
                "text-[9px] font-sans font-bold px-2 py-0.5 rounded-xs uppercase border block text-center shrink-0",
                selectedDecision.decision === "Approved"
                  ? "text-positive bg-positive/10 border-positive/25"
                  : "text-critical bg-critical/10 border-critical/25"
              )}>
                {selectedDecision.decision}
              </span>
            </div>

            {/* Section 1: Financial & Loan particulars */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="bg-surface border border-border/60 p-3 rounded-xs space-y-1">
                <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Requested Loan</span>
                <span className="text-sm font-mono font-extrabold text-foreground">{formatINR(selectedDecision.loanAmount)}</span>
                <span className="text-[9px] text-foreground-secondary block truncate mt-0.5">{selectedDecision.loanType}</span>
              </div>
              <div className="bg-surface border border-border/60 p-3 rounded-xs space-y-1">
                <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Financial Health Index</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mono font-extrabold text-foreground">{selectedDecision.financialHealth}/100</span>
                  <span className={cn(
                    "text-[8px] font-bold px-1.5 py-0.25 rounded-xs border",
                    selectedDecision.financialHealth >= 70
                      ? "text-positive bg-positive/10 border-positive/20"
                      : selectedDecision.financialHealth >= 50
                      ? "text-warning bg-warning/10 border-warning/20"
                      : "text-critical bg-critical/10 border-critical/20"
                  )}>
                    {selectedDecision.financialHealth >= 70 ? "Prime" : selectedDecision.financialHealth >= 50 ? "Fair" : "Poor"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: AI recommendations & Confidence */}
            <Card className="border border-border bg-surface p-4 space-y-3.5">
              <div className="flex justify-between items-center text-[10px] text-foreground-secondary font-bold uppercase tracking-wider border-b border-border/20 pb-1.5">
                <span>AI Prediction Pipeline</span>
                <span className={cn(
                  "text-[8px] font-sans font-bold px-1.5 py-0.25 rounded-xs border uppercase",
                  selectedDecision.aiRec === "Approve"
                    ? "text-positive bg-positive/10 border-positive/20"
                    : selectedDecision.aiRec === "Deny"
                    ? "text-critical bg-critical/10 border-critical/20"
                    : "text-warning bg-warning/10 border-warning/20"
                )}>
                  Rec: {selectedDecision.aiRec}
                </span>
              </div>
              <ModelConfidence value={selectedDecision.confidence} />
            </Card>

            {/* Section 3: Officer Notes */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-foreground-secondary font-bold uppercase tracking-wider block">Decision Justification Notes</span>
              <div className="bg-surface border border-border p-3.5 rounded-sm text-xs font-sans leading-relaxed text-foreground-secondary italic">
                &ldquo;{selectedDecision.notes}&rdquo;
              </div>
            </div>

            {/* Section 4: Risk / Protective Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-critical font-bold uppercase tracking-wider block">Primary Risk Factors</span>
                <ul className="space-y-1 text-[11px] text-foreground-secondary list-disc pl-4 leading-normal">
                  {selectedDecision.riskFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-positive font-bold uppercase tracking-wider block">Protective Factors</span>
                <ul className="space-y-1 text-[11px] text-foreground-secondary list-disc pl-4 leading-normal">
                  {selectedDecision.protectiveFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 5: Fraud Analysis Details */}
            <div className="space-y-2 pt-1 border-t border-border/30">
              <span className="text-[10px] text-foreground-secondary font-bold uppercase tracking-wider block">Security & Fraud Audit</span>
              <div className="bg-surface border border-border p-3 rounded-xs flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Device & IP Fraud score</span>
                  <span className="font-mono font-extrabold text-foreground">{selectedDecision.fraudScore}% / 100</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-foreground-muted block uppercase font-bold tracking-wider">Audited Rating</span>
                  <span className={cn(
                    "text-[9px] font-sans font-bold px-2 py-0.5 rounded-xs border block",
                    selectedDecision.fraudRisk === "High"
                      ? "text-critical bg-critical/10 border-critical/20"
                      : selectedDecision.fraudRisk === "Medium"
                      ? "text-warning bg-warning/10 border-warning/20"
                      : "text-positive bg-positive/10 border-positive/20"
                  )}>
                    {selectedDecision.fraudRisk} RISK
                  </span>
                </div>
              </div>
            </div>

            {/* Section 6: Visual timeline audit logs */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] text-foreground-secondary font-bold uppercase tracking-wider block">Transaction Audit Timeline</span>
              
              <div className="relative border-l border-border pl-6 ml-3.5 space-y-5.5 py-1 text-[11px] leading-none">
                
                {/* 1. Application Submitted */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-primary bg-surface">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">Application Submitted</span>
                    <span className="font-mono text-[9px] text-foreground-muted block mt-0.5">{selectedDecision.timeline.submitted}</span>
                  </div>
                </div>

                {/* 2. AI Analysis Completed */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-ai bg-surface">
                    <span className="h-1.5 w-1.5 rounded-full bg-ai" />
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">AI Risk Pipeline Executed</span>
                    <span className="font-mono text-[9px] text-foreground-muted block mt-0.5">{selectedDecision.timeline.aiAnalysis}</span>
                  </div>
                </div>

                {/* 3. Fraud Analysis */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-warning bg-surface">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">Fraud Indicators Checked</span>
                    <span className="font-mono text-[9px] text-foreground-muted block mt-0.5">{selectedDecision.timeline.fraudAnalysis}</span>
                  </div>
                </div>

                {/* 4. Officer Review */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-primary bg-surface">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">Officer Review Complete</span>
                    <span className="font-mono text-[9px] text-foreground-muted block mt-0.5">{selectedDecision.timeline.officerReview}</span>
                  </div>
                </div>

                {/* 5. Decision Saved */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-foreground bg-surface">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">Decision Saved & Sealed</span>
                    <span className="font-mono text-[9px] text-foreground-muted block mt-0.5">{selectedDecision.timeline.decisionSaved}</span>
                  </div>
                </div>

                {/* 6. Outcome Date */}
                <div className="relative">
                  <span className={cn(
                    "absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full border bg-surface",
                    selectedDecision.decision === "Approved" ? "border-positive" : "border-critical"
                  )}>
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      selectedDecision.decision === "Approved" ? "bg-positive" : "bg-critical"
                    )} />
                  </span>
                  <div>
                    <span className={cn("font-bold block", selectedDecision.decision === "Approved" ? "text-positive" : "text-critical")}>
                      Outcome: {selectedDecision.decision}
                    </span>
                    <span className="font-mono text-[9px] text-foreground-muted block mt-0.5">{selectedDecision.timeline.outcomeDate}</span>
                  </div>
                </div>

                {/* 7. Customer Notified */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border-strong bg-surface">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted" />
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">Customer Notification Dispatched</span>
                    <span className="font-mono text-[9px] text-foreground-muted block mt-0.5">{selectedDecision.timeline.customerNotified}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions Toolbar footer */}
            <div className="flex gap-2.5 pt-4 border-t border-border/40 select-none">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setDrawerOpen(false);
                  toast.info(`Redirecting to Applicant Profile (${selectedDecision.applicantId})...`);
                  router.push(`/officer/applicants/${selectedDecision.applicantId}`);
                }}
                className="flex-1 text-xs gap-1.5 cursor-pointer font-bold"
              >
                <User className="h-4 w-4" />
                Open Applicant
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDrawerOpen(false);
                  toast.info("Entering credit underwriting workspace console...");
                  router.push(`/officer/underwriting/${selectedDecision.applicantId}`);
                }}
                className="flex-1 text-xs gap-1.5 border-border hover:bg-surface-hover hover:text-foreground cursor-pointer font-semibold"
              >
                <Sliders className="h-4 w-4" />
                Open Underwriting
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 1500)),
                    {
                      loading: "Synthesizing individual audit record report...",
                      success: `Audit dossier ${selectedDecision.id}.pdf exported.`,
                      error: "Error exporting individual report."
                    }
                  );
                }}
                className="text-xs p-2.5 h-10 border border-border flex items-center justify-center hover:bg-surface-hover cursor-pointer"
                title="Generate audit report"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

          </div>
        )}
      </Sheet>

    </PageContainer>
  );
}
