export interface RadarDimensionData {
  subject: string;
  userValue: number;
  segmentAverage: number;
  fullMark: number;
}

export interface ScatterPointData {
  id: string;
  x: number; // Income in Lakhs INR
  y: number; // Savings Rate in %
  label: string;
  clusterId: "luxury" | "young_investor" | "borrower" | "family" | "student" | "retired";
  clusterName: string;
  isCurrentUser: boolean;
}

export interface SegmentProfile {
  id: string;
  name: string;
  typicalIncome: string;
  savingsRate: string;
  debtLevel: string;
  investmentActivity: string;
  riskProfile: "Low" | "Medium" | "High" | "Critical";
  spendingBehavior: string;
  description: string;
  whyBelongs: string;
  differentiators: string;
  futureMovement: string;
  recommendedActions: string[];
}

export const mockRadarData: RadarDimensionData[] = [
  { subject: "Savings Behavior", userValue: 85, segmentAverage: 78, fullMark: 100 },
  { subject: "Investment Activity", userValue: 90, segmentAverage: 82, fullMark: 100 },
  { subject: "Spending Velocity", userValue: 55, segmentAverage: 60, fullMark: 100 },
  { subject: "Debt Leverage", userValue: 24, segmentAverage: 30, fullMark: 100 },
  { subject: "Income Stability", userValue: 92, segmentAverage: 88, fullMark: 100 },
  { subject: "Risk Tolerance", userValue: 68, segmentAverage: 70, fullMark: 100 }
];

export const mockScatterPoints: ScatterPointData[] = [
  // Students
  { id: "p-st1", x: 2.0, y: 10, label: "Student #1", clusterId: "student", clusterName: "Students", isCurrentUser: false },
  { id: "p-st2", x: 1.5, y: 8, label: "Student #2", clusterId: "student", clusterName: "Students", isCurrentUser: false },
  { id: "p-st3", x: 2.8, y: 12, label: "Student #3", clusterId: "student", clusterName: "Students", isCurrentUser: false },
  { id: "p-st4", x: 3.2, y: 15, label: "Student #4", clusterId: "student", clusterName: "Students", isCurrentUser: false },
  { id: "p-st5", x: 2.5, y: 7, label: "Student #5", clusterId: "student", clusterName: "Students", isCurrentUser: false },
  { id: "p-st6", x: 1.8, y: 11, label: "Student #6", clusterId: "student", clusterName: "Students", isCurrentUser: false },

  // Retired Customers
  { id: "p-rt1", x: 5.2, y: 52, label: "Retired #1", clusterId: "retired", clusterName: "Retired Customers", isCurrentUser: false },
  { id: "p-rt2", x: 6.0, y: 58, label: "Retired #2", clusterId: "retired", clusterName: "Retired Customers", isCurrentUser: false },
  { id: "p-rt3", x: 4.8, y: 48, label: "Retired #3", clusterId: "retired", clusterName: "Retired Customers", isCurrentUser: false },
  { id: "p-rt4", x: 7.2, y: 62, label: "Retired #4", clusterId: "retired", clusterName: "Retired Customers", isCurrentUser: false },
  { id: "p-rt5", x: 6.5, y: 55, label: "Retired #5", clusterId: "retired", clusterName: "Retired Customers", isCurrentUser: false },
  { id: "p-rt6", x: 5.5, y: 50, label: "Retired #6", clusterId: "retired", clusterName: "Retired Customers", isCurrentUser: false },

  // Young Investors
  { id: "p-yi1", x: 12.0, y: 40, label: "Young Investor #1", clusterId: "young_investor", clusterName: "Young Investors", isCurrentUser: false },
  { id: "p-yi2", x: 10.5, y: 38, label: "Young Investor #2", clusterId: "young_investor", clusterName: "Young Investors", isCurrentUser: false },
  { id: "p-yi3", x: 15.5, y: 45, label: "Young Investor #3", clusterId: "young_investor", clusterName: "Young Investors", isCurrentUser: false },
  { id: "p-yi4", x: 13.2, y: 42, label: "Young Investor #4", clusterId: "young_investor", clusterName: "Young Investors", isCurrentUser: false },
  { id: "p-yi5", x: 16.0, y: 48, label: "Young Investor #5", clusterId: "young_investor", clusterName: "Young Investors", isCurrentUser: false },
  { id: "p-yi6", x: 11.0, y: 39, label: "Young Investor #6", clusterId: "young_investor", clusterName: "Young Investors", isCurrentUser: false },
  { id: "p-user", x: 14.0, y: 42, label: "You (Rahul)", clusterId: "young_investor", clusterName: "Young Investors", isCurrentUser: true },

  // Luxury Spenders
  { id: "p-lx1", x: 22.0, y: 18, label: "Luxury Spender #1", clusterId: "luxury", clusterName: "Luxury Spenders", isCurrentUser: false },
  { id: "p-lx2", x: 25.5, y: 15, label: "Luxury Spender #2", clusterId: "luxury", clusterName: "Luxury Spenders", isCurrentUser: false },
  { id: "p-lx3", x: 18.0, y: 20, label: "Luxury Spender #3", clusterId: "luxury", clusterName: "Luxury Spenders", isCurrentUser: false },
  { id: "p-lx4", x: 32.0, y: 12, label: "Luxury Spender #4", clusterId: "luxury", clusterName: "Luxury Spenders", isCurrentUser: false },
  { id: "p-lx5", x: 28.0, y: 16, label: "Luxury Spender #5", clusterId: "luxury", clusterName: "Luxury Spenders", isCurrentUser: false },
  { id: "p-lx6", x: 20.5, y: 22, label: "Luxury Spender #6", clusterId: "luxury", clusterName: "Luxury Spenders", isCurrentUser: false },

  // Budget Families
  { id: "p-fm1", x: 8.5, y: 28, label: "Budget Family #1", clusterId: "family", clusterName: "Budget Families", isCurrentUser: false },
  { id: "p-fm2", x: 9.0, y: 32, label: "Budget Family #2", clusterId: "family", clusterName: "Budget Families", isCurrentUser: false },
  { id: "p-fm3", x: 7.8, y: 25, label: "Budget Family #3", clusterId: "family", clusterName: "Budget Families", isCurrentUser: false },
  { id: "p-fm4", x: 11.2, y: 34, label: "Budget Family #4", clusterId: "family", clusterName: "Budget Families", isCurrentUser: false },
  { id: "p-fm5", x: 10.0, y: 30, label: "Budget Family #5", clusterId: "family", clusterName: "Budget Families", isCurrentUser: false },
  { id: "p-fm6", x: 8.0, y: 27, label: "Budget Family #6", clusterId: "family", clusterName: "Budget Families", isCurrentUser: false },

  // High-Risk Borrowers
  { id: "p-bw1", x: 4.0, y: 5, label: "Borrower #1", clusterId: "borrower", clusterName: "High-Risk Borrowers", isCurrentUser: false },
  { id: "p-bw2", x: 5.5, y: 8, label: "Borrower #2", clusterId: "borrower", clusterName: "High-Risk Borrowers", isCurrentUser: false },
  { id: "p-bw3", x: 3.8, y: 3, label: "Borrower #3", clusterId: "borrower", clusterName: "High-Risk Borrowers", isCurrentUser: false },
  { id: "p-bw4", x: 6.2, y: 9, label: "Borrower #4", clusterId: "borrower", clusterName: "High-Risk Borrowers", isCurrentUser: false },
  { id: "p-bw5", x: 5.0, y: 6, label: "Borrower #5", clusterId: "borrower", clusterName: "High-Risk Borrowers", isCurrentUser: false },
  { id: "p-bw6", x: 4.5, y: 4, label: "Borrower #6", clusterId: "borrower", clusterName: "High-Risk Borrowers", isCurrentUser: false }
];

export const mockSegmentProfiles: Record<string, SegmentProfile> = {
  young_investor: {
    id: "young_investor",
    name: "Young Investors",
    typicalIncome: "₹8,00,000 - ₹18,00,000 / year",
    savingsRate: "35% - 50%",
    debtLevel: "Low to Moderate",
    investmentActivity: "High (Equity, Systematic Plans)",
    riskProfile: "Medium",
    spendingBehavior: "Optimizing / Balanced",
    description: "Young professionals focused on growing assets early, maintaining stable income streams, and optimizing recurring subscription outflows.",
    whyBelongs: "Your systemic investment sweeps (₹5,000/mo) and equity holdings represent a high investment index of 90, aligning directly with the Young Investor profile parameters.",
    differentiators: "Your debt leverage index stands at 24%, which is lower than the segment benchmark average of 30%, signaling high structural repayment resilience.",
    futureMovement: "With continued salary increments and equity gains, models project a 72% likelihood of transitioning to 'High Net Worth Spenders' within 5 years.",
    recommendedActions: [
      "Allocate 15% of idle cash buffer into liquid or debt mutual funds",
      "Automate tax-saving Equity Linked Schemes (ELSS)",
      "Maintain credit utilization thresholds strictly under 30%"
    ]
  },
  luxury: {
    id: "luxury",
    name: "Luxury Spenders",
    typicalIncome: "₹18,00,000 - ₹40,00,000 / year",
    savingsRate: "10% - 25%",
    debtLevel: "High (Premium Cards)",
    investmentActivity: "Moderate (Ad-hoc Equity)",
    riskProfile: "High",
    spendingBehavior: "Heavy Discretionary Outflows",
    description: "High-income earners with intensive discretionary leisure spending and elevated dependency on card limits.",
    whyBelongs: "Classified by high card limits utilization and recurring dining and premium travel outflows.",
    differentiators: "High income index is offset by low net savings rate compared to other high-earning cohorts.",
    futureMovement: "At risk of credit stress if income loops experience volatility due to low cash buffer allocations.",
    recommendedActions: [
      "Set hard limits on discretionary travel card sweeps",
      "Establish automated sweeps to lock in monthly savings first",
      "Consolidate outstanding card credits into structured personal terms"
    ]
  },
  borrower: {
    id: "borrower",
    name: "High-Risk Borrowers",
    typicalIncome: "₹3,00,000 - ₹8,00,000 / year",
    savingsRate: "0% - 10%",
    debtLevel: "High (Personal Loans, EMIs)",
    investmentActivity: "Negligible",
    riskProfile: "Critical",
    spendingBehavior: "Leveraged / Deficit",
    description: "Customers carrying multiple outstanding retail loans, minimal emergency buffers, and vulnerable payment structures.",
    whyBelongs: "Isolated based on low savings coverage (under 2 months) and high monthly debt-to-income (DTI) levels.",
    differentiators: "High debt service ratio compared to low basic cash deposit patterns.",
    futureMovement: "High default probability model projections if credit lines expand or card delays compound.",
    recommendedActions: [
      "Hedge variables by clearing smallest card balances early",
      "Cease additional discretionary EMI subscriptions immediately",
      "Request temporary restructuring of high-interest credit lines"
    ]
  },
  family: {
    id: "family",
    name: "Budget Families",
    typicalIncome: "₹6,00,000 - ₹15,00,000 / year",
    savingsRate: "20% - 35%",
    debtLevel: "Moderate (Home/Auto Loans)",
    investmentActivity: "Moderate (Fixed Deposits, Gold)",
    riskProfile: "Low",
    spendingBehavior: "Fixed / Domestic Overhead",
    description: "Dual-income households with structured domestic expenses, locking resources in low-volatility fixed assets.",
    whyBelongs: "Matches based on recurring family medical, insurance premium, and education ledger swipes.",
    differentiators: "Highly consistent domestic spending patterns with low discretionary leisure spikes.",
    futureMovement: "Highly stable. Transitions towards long-term conservative wealth models over time.",
    recommendedActions: [
      "Ensure healthcare coverage balances are fully funded",
      "Diversify fixed deposits into index mutual funds",
      "Clear home loan principal pre-payments to cut interest drag"
    ]
  },
  student: {
    id: "student",
    name: "Students",
    typicalIncome: "₹1,00,000 - ₹3,00,000 / year",
    savingsRate: "5% - 15%",
    debtLevel: "Minimal",
    investmentActivity: "Low (Micro-investing)",
    riskProfile: "Medium",
    spendingBehavior: "Low Value / Discretionary",
    description: "Young users on entry budgets, driven by online delivery swipes and micro-savings patterns.",
    whyBelongs: "Identified by low monthly ledger volume and small average transactions sizes.",
    differentiators: "High spending count velocity but low aggregate values.",
    futureMovement: "Graduates into 'Young Investors' or 'Budget Families' as income contracts emerge post-graduation.",
    recommendedActions: [
      "Build basic emergency savings loops of ₹10,000",
      "Avoid buy-now-pay-later (BNPL) micro-loans sweeps",
      "Start minor systematic investment plan (SIP) loops of ₹1,000"
    ]
  },
  retired: {
    id: "retired",
    name: "Retired Customers",
    typicalIncome: "₹3,00,000 - ₹10,00,000 / year",
    savingsRate: "40% - 60%",
    debtLevel: "Near Zero",
    investmentActivity: "Conservative (Annuities, Bonds)",
    riskProfile: "Low",
    spendingBehavior: "Low / Non-discretionary",
    description: "Older demographics utilizing pensions and interest yields with low debt exposure and conservative savings pools.",
    whyBelongs: "Identified by low spending velocity and high income deposits derived from interest/annuities.",
    differentiators: "Extremely high savings rates combined with low risk tolerance indexes.",
    futureMovement: "Stays within stable conservative asset groups.",
    recommendedActions: [
      "Review treasury bonds tax allocations",
      "Ensure cash reserves are accessible in liquid assets",
      "Set up automated pension credit sweeps to simplified checking"
    ]
  }
};
