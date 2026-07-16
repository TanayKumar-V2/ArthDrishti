export interface ApplicantDetail {
  id: string;
  name: string;
  avatar: string;
  age: number;
  amount: number;
  purpose: string;
  loanType: "Home Loan" | "Business Loan" | "Personal Loan" | "Education Loan" | "Car Loan" | "Commercial Loan";
  date: string;
  status: "Pending" | "Under Review" | "AI Approved" | "AI Rejected" | "Manual Review" | "Documents Requested" | "Completed";
  defaultProb: number;
  healthScore: number;
  fraudRisk: "Low" | "Medium" | "High";
  aiRec: "Approve" | "Deny" | "Manual Review" | "Needs Documents";
  confidence: number;
  waitTime: string;
  
  // Financial Summary
  income: number;
  expenses: number;
  debt: number;
  savings: number;
  existingLoans: { bank: string; amount: number; emi: number; type: string }[];
  
  // Risk & Protective Factors
  riskFactors: string[];
  protectiveFactors: string[];
  
  // SHAP Feature attributions
  shapAttributions: { feature: string; value: number; impact: number }[];
  
  // Documents
  documents: { name: string; status: "Verified" | "Pending" | "Error"; type: string }[];
  
  // Audit History
  auditHistory: { date: string; action: string; user: string; notes: string }[];

  // Applications page specific
  employmentType: "Salaried" | "Self-Employed" | "Business Owner" | "Unemployed";
  officer: string;
  priority: "Critical" | "High" | "Medium" | "Low";
}

export const OFFICER_APPLICANTS: ApplicantDetail[] = [
  {
    id: "app1",
    name: "Rahul Sen",
    avatar: "RS",
    age: 34,
    amount: 650000,
    purpose: "Business Expansion Loan",
    loanType: "Business Loan",
    date: "2026-07-01",
    status: "Manual Review",
    defaultProb: 42,
    healthScore: 68,
    fraudRisk: "Low",
    aiRec: "Manual Review",
    confidence: 94.2,
    waitTime: "4 Hours",
    income: 120000,
    expenses: 78000,
    debt: 450000,
    savings: 320000,
    existingLoans: [
      { bank: "SBI", amount: 350000, emi: 12000, type: "Car Loan" },
      { bank: "HDFC", amount: 100000, emi: 4500, type: "Personal Loan" }
    ],
    riskFactors: [
      "High revolving card utilization (64%)",
      "Debt-to-Income ratio (42%) is close to threshold",
      "Recent payment delay of 12 days flagged on car loan"
    ],
    protectiveFactors: [
      "Consistent payroll checks history from verified employer",
      "Savings account buffer covers 4 months of EMI liabilities",
      "No historical fraud IP coordinates recorded"
    ],
    shapAttributions: [
      { feature: "Debt-to-Income Ratio", value: 42, impact: 18 },
      { feature: "Credit Card Utilization", value: 64, impact: 14 },
      { feature: "Recent Late Payments", value: 1, impact: 10 },
      { feature: "Savings Balance", value: 320000, impact: -8 },
      { feature: "Account Longevity", value: 8, impact: -6 }
    ],
    documents: [
      { name: "Income Tax Returns FY 2024-25", status: "Verified", type: "PDF" },
      { name: "Salary slips (Last 3 Months)", status: "Verified", type: "PDF" },
      { name: "Bank Ledger Statement", status: "Pending", type: "CSV" },
      { name: "Identity Proof (Aadhaar / PAN)", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-01 10:30 AM", action: "Application Submitted", user: "Applicant", notes: "Submitted via merchant gateway API." },
      { date: "2026-07-01 10:35 AM", action: "Automatic Bureau Pull Success", user: "System", notes: "Experian score fetched: 712." },
      { date: "2026-07-02 02:15 PM", action: "AI Prediction Completed", user: "Ensemble Models", notes: "Default probability estimated at 42%." }
    ],
    employmentType: "Business Owner",
    officer: "Officer Rahul",
    priority: "High"
  },
  {
    id: "app2",
    name: "Priyanka Roy",
    avatar: "PR",
    age: 29,
    amount: 820000,
    purpose: "Home Refurbishment Loan",
    loanType: "Home Loan",
    date: "2026-07-03",
    status: "Pending",
    defaultProb: 18,
    healthScore: 84,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 96.5,
    waitTime: "8 Hours",
    income: 185000,
    expenses: 65000,
    debt: 120000,
    savings: 950000,
    existingLoans: [],
    riskFactors: [
      "Relatively short credit history length (2.5 Years)"
    ],
    protectiveFactors: [
      "Exceptional Financial Health Score (84)",
      "Zero existing debt or active personal loans",
      "Savings balance covers full loan request"
    ],
    shapAttributions: [
      { feature: "Savings Balance", value: 950000, impact: -22 },
      { feature: "Debt-to-Income Ratio", value: 12, impact: -14 },
      { feature: "Existing Credit Cards", value: 1, impact: -4 },
      { feature: "Credit History Length", value: 2.5, impact: 8 }
    ],
    documents: [
      { name: "Salary slips (Last 3 Months)", status: "Verified", type: "PDF" },
      { name: "Bank Account Ledger", status: "Verified", type: "CSV" },
      { name: "Property Valuation Certificate", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-03 09:12 AM", action: "Application Created", user: "Applicant", notes: "Submitted via customer portal." },
      { date: "2026-07-03 09:15 AM", action: "AI Pipeline Finished", user: "System", notes: "Default risk: 18%. Status set to auto-approve threshold." }
    ],
    employmentType: "Salaried",
    officer: "Officer Priya",
    priority: "Medium"
  },
  {
    id: "app3",
    name: "Amit Sharma",
    avatar: "AS",
    age: 42,
    amount: 1200000,
    purpose: "Commercial Equipment Purchase",
    loanType: "Commercial Loan",
    date: "2026-06-28",
    status: "Under Review",
    defaultProb: 72,
    healthScore: 45,
    fraudRisk: "Medium",
    aiRec: "Deny",
    confidence: 91.8,
    waitTime: "1 Day",
    income: 95000,
    expenses: 82000,
    debt: 1800000,
    savings: 45000,
    existingLoans: [
      { bank: "ICICI", amount: 1500000, emi: 45000, type: "Business Loan" },
      { bank: "Axis Bank", amount: 300000, emi: 9500, type: "Equipment EMI" }
    ],
    riskFactors: [
      "Extremely high existing leverage (₹18L Debt)",
      "Savings floor is dangerously low (₹45K)",
      "High debt service requirement consumes 57% of cash inflows"
    ],
    protectiveFactors: [
      "Sole Proprietorship registration valid for 10 years",
      "Collateral asset evaluation report exists"
    ],
    shapAttributions: [
      { feature: "Debt-to-Income Ratio", value: 57, impact: 32 },
      { feature: "Active Borrowings", value: 1800000, impact: 24 },
      { feature: "Savings Balance", value: 45000, impact: 12 },
      { feature: "Proprietorship Age", value: 10, impact: -6 }
    ],
    documents: [
      { name: "Business Registration License", status: "Verified", type: "PDF" },
      { name: "Audited Balance Sheets (3 Years)", status: "Verified", type: "PDF" },
      { name: "Bank Statements (12 Months)", status: "Error", type: "CSV" }
    ],
    auditHistory: [
      { date: "2026-06-28 04:50 PM", action: "Bureau Score Queried", user: "System", notes: "Experian: 589. Flags: High DTI." }
    ],
    employmentType: "Business Owner",
    officer: "Unassigned",
    priority: "Critical"
  },
  {
    id: "app4",
    name: "Vikram Malhotra",
    avatar: "VM",
    age: 38,
    amount: 450000,
    purpose: "Personal Consolidations Loan",
    loanType: "Personal Loan",
    date: "2026-06-29",
    status: "Under Review",
    defaultProb: 28,
    healthScore: 75,
    fraudRisk: "High",
    aiRec: "Manual Review",
    confidence: 89.4,
    waitTime: "2 Days",
    income: 140000,
    expenses: 70000,
    debt: 150000,
    savings: 420000,
    existingLoans: [
      { bank: "Kotak", amount: 150000, emi: 6000, type: "Credit Line Loan" }
    ],
    riskFactors: [
      "High Fraud telemetry IP anomaly detected",
      "Discrepancies in submitted income documentation logs"
    ],
    protectiveFactors: [
      "Comfortable DTI ratio (22%)",
      "Credit bureau score: 765",
      "No historical default occurrences logged in last 5 years"
    ],
    shapAttributions: [
      { feature: "Identity Telemetry Anomalies", value: 1, impact: 22 },
      { feature: "Income Slips Discrepancy", value: 1, impact: 14 },
      { feature: "Debt Service Ratio", value: 22, impact: -12 },
      { feature: "Bureau Index", value: 765, impact: -10 }
    ],
    documents: [
      { name: "Income statements", status: "Error", type: "PDF" },
      { name: "Verify Address logs", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-06-29 02:40 PM", action: "Application Intake", user: "System", notes: "Identity alert: Multi-device session login." }
    ],
    employmentType: "Salaried",
    officer: "Officer Rahul",
    priority: "High"
  },
  {
    id: "app5",
    name: "Sanjay Gupta",
    avatar: "SG",
    age: 23,
    amount: 300000,
    purpose: "Education Fees Loan",
    loanType: "Education Loan",
    date: "2026-07-05",
    status: "Completed",
    defaultProb: 15,
    healthScore: 88,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 97.2,
    waitTime: "3 Hours",
    income: 50000,
    expenses: 12000,
    debt: 0,
    savings: 150000,
    existingLoans: [],
    riskFactors: [
      "No active credit cards or prior loan records"
    ],
    protectiveFactors: [
      "High grading marks in university records",
      "Guarantor has high net worth asset statements"
    ],
    shapAttributions: [
      { feature: "Savings Balance", value: 150000, impact: -15 },
      { feature: "Guarantor Net Worth", value: 92, impact: -18 },
      { feature: "Prior Loans Count", value: 0, impact: 5 }
    ],
    documents: [
      { name: "Admission Offer Letter", status: "Verified", type: "PDF" },
      { name: "Guarantor PAN Card", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-05 11:00 AM", action: "Submission Complete", user: "Applicant", notes: "Guarantor forms attached." }
    ],
    employmentType: "Unemployed",
    officer: "Officer Priya",
    priority: "Low"
  },
  {
    id: "app6",
    name: "Deepa Nair",
    avatar: "DN",
    age: 45,
    amount: 150000,
    purpose: "Medical Emergency Loan",
    loanType: "Personal Loan",
    date: "2026-07-10",
    status: "Pending",
    defaultProb: 35,
    healthScore: 62,
    fraudRisk: "Low",
    aiRec: "Manual Review",
    confidence: 88.5,
    waitTime: "1 Hour",
    income: 80000,
    expenses: 48000,
    debt: 200000,
    savings: 30000,
    existingLoans: [
      { bank: "Axis Bank", amount: 200000, emi: 8000, type: "Personal Loan" }
    ],
    riskFactors: [
      "Low liquidity buffer to cover hospital fees",
      "High DTI (60%)"
    ],
    protectiveFactors: [
      "Government employee tenure (12 years)",
      "Provident fund backing exists"
    ],
    shapAttributions: [
      { feature: "DTI Ratio", value: 60, impact: 15 },
      { feature: "Savings Buffer", value: 30000, impact: 8 },
      { feature: "Job Tenure", value: 12, impact: -12 }
    ],
    documents: [
      { name: "Hospital Estimate Billing", status: "Verified", type: "PDF" },
      { name: "Salary slips", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-10 08:00 AM", action: "Urgent Intake Flagged", user: "System", notes: "Requested priority escalation." }
    ],
    employmentType: "Salaried",
    officer: "Unassigned",
    priority: "Critical"
  },
  {
    id: "app7",
    name: "Rohan Mehta",
    avatar: "RM",
    age: 31,
    amount: 1500000,
    purpose: "Startup Capital Loan",
    loanType: "Business Loan",
    date: "2026-07-08",
    status: "Under Review",
    defaultProb: 55,
    healthScore: 50,
    fraudRisk: "Low",
    aiRec: "Deny",
    confidence: 90.1,
    waitTime: "12 Hours",
    income: 250000,
    expenses: 190000,
    debt: 1200000,
    savings: 500000,
    existingLoans: [
      { bank: "Yes Bank", amount: 1200000, emi: 35000, type: "Commercial Credit" }
    ],
    riskFactors: [
      "Highly volatile monthly cash balances",
      "DTI is at 76% due to office rents and salaries"
    ],
    protectiveFactors: [
      "Substantial initial capital seed balance",
      "Co-signer with verified IT returns FY25"
    ],
    shapAttributions: [
      { feature: "Debt Burden", value: 1200000, impact: 22 },
      { feature: "Expense Ratio", value: 76, impact: 18 },
      { feature: "Capital Seed", value: 500000, impact: -10 }
    ],
    documents: [
      { name: "Business Pitch Deck & Financials", status: "Verified", type: "PDF" },
      { name: "Bank Statements (6 Months)", status: "Verified", type: "CSV" }
    ],
    auditHistory: [
      { date: "2026-07-08 02:00 PM", action: "Business Desk Routing", user: "System", notes: "Auto-routed to Commercial loan category." }
    ],
    employmentType: "Self-Employed",
    officer: "Officer Rahul",
    priority: "High"
  },
  {
    id: "app8",
    name: "Anjali Verma",
    avatar: "AV",
    age: 36,
    amount: 500000,
    purpose: "Smart Home Solar Loan",
    loanType: "Home Loan",
    date: "2026-06-15",
    status: "Completed",
    defaultProb: 12,
    healthScore: 92,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 98.4,
    waitTime: "Completed",
    income: 150000,
    expenses: 40000,
    debt: 50000,
    savings: 800000,
    existingLoans: [],
    riskFactors: [
      "No specific negative factors identified"
    ],
    protectiveFactors: [
      "Very low DTI (26%)",
      "Substantial liquid reserve of 8L",
      "CIBIL score: 790"
    ],
    shapAttributions: [
      { feature: "Credit Score", value: 790, impact: -25 },
      { feature: "Savings Balance", value: 800000, impact: -18 },
      { feature: "DTI Ratio", value: 26, impact: -12 }
    ],
    documents: [
      { name: "Solar Vendor Invoice", status: "Verified", type: "PDF" },
      { name: "Income Certificate", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-06-15 04:00 PM", action: "Final Disbursal Done", user: "Disbursal Office", notes: "Funded to solar vendor ledger." }
    ],
    employmentType: "Salaried",
    officer: "Officer Priya",
    priority: "Low"
  },
  {
    id: "app9",
    name: "Vikram Singh",
    avatar: "VS",
    age: 41,
    amount: 280000,
    purpose: "Used Car Financing",
    loanType: "Car Loan",
    date: "2026-07-04",
    status: "Documents Requested",
    defaultProb: 24,
    healthScore: 71,
    fraudRisk: "Medium",
    aiRec: "Needs Documents",
    confidence: 87.2,
    waitTime: "1.5 Days",
    income: 90000,
    expenses: 42000,
    debt: 180000,
    savings: 100000,
    existingLoans: [
      { bank: "Kotak", amount: 180000, emi: 6500, type: "Car Loan" }
    ],
    riskFactors: [
      "Vehicle evaluation certificate missing details",
      "Fraud risk alert: Seller matches flag address list"
    ],
    protectiveFactors: [
      "Credit profile is clean of payment defaults",
      "DTI remains manageable at 32%"
    ],
    shapAttributions: [
      { feature: "Seller Address Flag", value: 1, impact: 15 },
      { feature: "DTI", value: 32, impact: -6 },
      { feature: "Credit Cleanliness", value: 100, impact: -10 }
    ],
    documents: [
      { name: "Vehicle RC & Insurance Copy", status: "Pending", type: "PDF" },
      { name: "Income statements", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-04 10:20 AM", action: "RFI Issued", user: "Verification Unit", notes: "Requested verified RC from seller." }
    ],
    employmentType: "Salaried",
    officer: "Unassigned",
    priority: "Medium"
  },
  {
    id: "app10",
    name: "Neha Kapoor",
    avatar: "NK",
    age: 28,
    amount: 600000,
    purpose: "Wedding Expenses Loan",
    loanType: "Personal Loan",
    date: "2026-07-02",
    status: "AI Rejected",
    defaultProb: 81,
    healthScore: 32,
    fraudRisk: "Low",
    aiRec: "Deny",
    confidence: 93.5,
    waitTime: "2 Hours",
    income: 70000,
    expenses: 60000,
    debt: 800000,
    savings: 12000,
    existingLoans: [
      { bank: "HDFC", amount: 500000, emi: 18000, type: "Personal Loan" },
      { bank: "SBI", amount: 300000, emi: 11000, type: "Credit Line" }
    ],
    riskFactors: [
      "Extremely thin margins of cash flow safety",
      "High DTI (85%)",
      "Four late credit card payments in 12 months"
    ],
    protectiveFactors: [
      "Co-borrower signature attached (Parent)"
    ],
    shapAttributions: [
      { feature: "Late Payments", value: 4, impact: 28 },
      { feature: "DTI Burden", value: 85, impact: 24 },
      { feature: "Savings Balance", value: 12000, impact: 15 }
    ],
    documents: [
      { name: "Income Statements", status: "Verified", type: "PDF" },
      { name: "CIBIL Report Extract", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-02 01:10 PM", action: "Auto-Reject Run Triggered", user: "System", notes: "Default score exceeds 80% limit." }
    ],
    employmentType: "Salaried",
    officer: "Officer Rahul",
    priority: "Low"
  },
  {
    id: "app11",
    name: "Abhishek Roy",
    avatar: "AR",
    age: 46,
    amount: 900000,
    purpose: "Franchise Store Deposit",
    loanType: "Business Loan",
    date: "2026-07-09",
    status: "AI Approved",
    defaultProb: 14,
    healthScore: 82,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 95.8,
    waitTime: "5 Hours",
    income: 220000,
    expenses: 85000,
    debt: 150000,
    savings: 1400000,
    existingLoans: [],
    riskFactors: [
      "Franchise licensing documentation is still pending final notary stamp"
    ],
    protectiveFactors: [
      "Excellent savings-to-credit size ratio",
      "Corporate guarantee backing from franchise owner"
    ],
    shapAttributions: [
      { feature: "Corporate Guarantee", value: 1, impact: -18 },
      { feature: "Savings Balance", value: 1400000, impact: -14 },
      { feature: "DTI", value: 38, impact: -6 }
    ],
    documents: [
      { name: "Franchise Allocation Letter", status: "Verified", type: "PDF" },
      { name: "Audited Accounts FY25", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-09 09:30 AM", action: "AI Pipeline Verified", user: "System", notes: "Recommended for auto-clearing." }
    ],
    employmentType: "Business Owner",
    officer: "Officer Priya",
    priority: "High"
  },
  {
    id: "app12",
    name: "Meera Joshi",
    avatar: "MJ",
    age: 52,
    amount: 1800000,
    purpose: "Land Purchase Loan",
    loanType: "Home Loan",
    date: "2026-07-07",
    status: "Under Review",
    defaultProb: 49,
    healthScore: 59,
    fraudRisk: "Low",
    aiRec: "Manual Review",
    confidence: 91.2,
    waitTime: "1 Day",
    income: 180000,
    expenses: 110000,
    debt: 950000,
    savings: 600000,
    existingLoans: [
      { bank: "BOB", amount: 950000, emi: 24000, type: "Business Loan" }
    ],
    riskFactors: [
      "Property plot is under dispute history checks",
      "High leverage relative to active liquid margin check"
    ],
    protectiveFactors: [
      "Substantial agricultural collateral backing",
      "CIBIL score is solid: 742"
    ],
    shapAttributions: [
      { feature: "Leverage Burden", value: 950000, impact: 15 },
      { feature: "Plot Conflict Flag", value: 1, impact: 12 },
      { feature: "Collateral Value", value: 2500000, impact: -16 }
    ],
    documents: [
      { name: "Property Deed Certificate", status: "Pending", type: "PDF" },
      { name: "Collateral Evaluation Document", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-07 12:45 PM", action: "Legal Desk Check", user: "System", notes: "Flagged title dispute tag." }
    ],
    employmentType: "Self-Employed",
    officer: "Unassigned",
    priority: "Critical"
  },
  {
    id: "app13",
    name: "Kunal Shah",
    avatar: "KS",
    age: 39,
    amount: 400000,
    purpose: "Tech Equipment Lease",
    loanType: "Commercial Loan",
    date: "2026-06-20",
    status: "Completed",
    defaultProb: 11,
    healthScore: 89,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 96.9,
    waitTime: "Completed",
    income: 160000,
    expenses: 52000,
    debt: 200000,
    savings: 500000,
    existingLoans: [],
    riskFactors: [
      "Rapid depreciation rate of tech inventory asset leases"
    ],
    protectiveFactors: [
      "Client cash ledger shows recurrent monthly profits",
      "CIBIL score: 785"
    ],
    shapAttributions: [
      { feature: "Profit Consistency", value: 94, impact: -18 },
      { feature: "Credit Score", value: 785, impact: -15 },
      { feature: "Asset Depreciation", value: 1, impact: 4 }
    ],
    documents: [
      { name: "Lease Vendor Details", status: "Verified", type: "PDF" },
      { name: "Audited Ledger Statements", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-06-20 02:00 PM", action: "Audit Complete", user: "System", notes: "Archived after disbursal verification." }
    ],
    employmentType: "Business Owner",
    officer: "Officer Rahul",
    priority: "Low"
  },
  {
    id: "app14",
    name: "Sneha Reddy",
    avatar: "SR",
    age: 27,
    amount: 750000,
    purpose: "Executive MBA Tuition",
    loanType: "Education Loan",
    date: "2026-07-06",
    status: "Pending",
    defaultProb: 21,
    healthScore: 78,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 93.4,
    waitTime: "5 Hours",
    income: 115000,
    expenses: 32000,
    debt: 80000,
    savings: 220000,
    existingLoans: [
      { bank: "HDFC", amount: 80000, emi: 3500, type: "Consumer EMI" }
    ],
    riskFactors: [
      "Post-graduation career placement volatility metrics"
    ],
    protectiveFactors: [
      "Currently employed in tier-1 tech consulting firm",
      "Salary increases guaranteed under training program contract"
    ],
    shapAttributions: [
      { feature: "Employer Status", value: 98, impact: -14 },
      { feature: "Low Existing Debt", value: 80000, impact: -10 },
      { feature: "Savings Balance", value: 220000, impact: -6 }
    ],
    documents: [
      { name: "ISB Admission Offer", status: "Verified", type: "PDF" },
      { name: "Company Sponsorship letter", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-06 10:45 AM", action: "Credentials Checked", user: "System", notes: "Education desk verify passed." }
    ],
    employmentType: "Salaried",
    officer: "Officer Priya",
    priority: "Medium"
  },
  {
    id: "app15",
    name: "Alok Pandey",
    avatar: "AP",
    age: 48,
    amount: 2200000,
    purpose: "Agriculture Warehouse",
    loanType: "Commercial Loan",
    date: "2026-07-02",
    status: "Documents Requested",
    defaultProb: 58,
    healthScore: 49,
    fraudRisk: "Medium",
    aiRec: "Manual Review",
    confidence: 89.2,
    waitTime: "2 Days",
    income: 130000,
    expenses: 85000,
    debt: 1400000,
    savings: 120000,
    existingLoans: [
      { bank: "SBI Agri", amount: 1400000, emi: 32000, type: "Agri Land Credit" }
    ],
    riskFactors: [
      "Highly vulnerable to seasonal rain cycle returns",
      "DTI remains high at 65% on existing land credit"
    ],
    protectiveFactors: [
      "Government cold chain subsidy support document exists"
    ],
    shapAttributions: [
      { feature: "Seasonal Rain Risk", value: 1, impact: 24 },
      { feature: "DTI", value: 65, impact: 18 },
      { feature: "Government Subsidy", value: 1, impact: -12 }
    ],
    documents: [
      { name: "Subsidy Verification Slip", status: "Verified", type: "PDF" },
      { name: "Land Title Records", status: "Pending", type: "PDF" },
      { name: "Income Statements", status: "Error", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-02 03:00 PM", action: "Documents Flagged", user: "Verification Unit", notes: "Requested tax certificate proof." }
    ],
    employmentType: "Self-Employed",
    officer: "Unassigned",
    priority: "High"
  },
  {
    id: "app16",
    name: "Tanvi Sen",
    avatar: "TS",
    age: 32,
    amount: 550000,
    purpose: "Boutique Store Launch",
    loanType: "Business Loan",
    date: "2026-07-08",
    status: "AI Approved",
    defaultProb: 19,
    healthScore: 81,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 94.6,
    waitTime: "8 Hours",
    income: 140000,
    expenses: 42000,
    debt: 100000,
    savings: 650000,
    existingLoans: [],
    riskFactors: [
      "Competitive sector location check warnings"
    ],
    protectiveFactors: [
      "Excellent savings reserves covers loan size",
      "Previous successful boutique venture exits logged"
    ],
    shapAttributions: [
      { feature: "Savings Balance", value: 650000, impact: -18 },
      { feature: "Prior Business Exits", value: 1, impact: -12 },
      { feature: "Sector Density Index", value: 72, impact: 4 }
    ],
    documents: [
      { name: "Lease Contract Details", status: "Verified", type: "PDF" },
      { name: "Assets Appraisal Sheets", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-08 05:00 PM", action: "Risk Checked", user: "System", notes: "Low risk verified." }
    ],
    employmentType: "Self-Employed",
    officer: "Officer Rahul",
    priority: "Medium"
  },
  {
    id: "app17",
    name: "Harish Patel",
    avatar: "HP",
    age: 50,
    amount: 1100000,
    purpose: "Home Extension Credit",
    loanType: "Home Loan",
    date: "2026-06-30",
    status: "AI Rejected",
    defaultProb: 76,
    healthScore: 40,
    fraudRisk: "Low",
    aiRec: "Deny",
    confidence: 92.4,
    waitTime: "3 Hours",
    income: 110000,
    expenses: 95000,
    debt: 2200000,
    savings: 35000,
    existingLoans: [
      { bank: "BOI", amount: 2200000, emi: 58000, type: "Home Mortgage" }
    ],
    riskFactors: [
      "Highly over-leveraged mortgage account balance",
      "Debt obligations absorb 86% of monthly income pool"
    ],
    protectiveFactors: [
      "Continuous employment history (20 years in same company)"
    ],
    shapAttributions: [
      { feature: "DTI Burden", value: 86, impact: 35 },
      { feature: "Mortgage Balance", value: 2200000, impact: 20 },
      { feature: "Job Stability", value: 20, impact: -10 }
    ],
    documents: [
      { name: "Home Blueprint extension copy", status: "Verified", type: "PDF" },
      { name: "Salary cert", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-06-30 11:30 AM", action: "AI Pipeline Checked", user: "System", notes: "Rejected on DTI metrics limits." }
    ],
    employmentType: "Salaried",
    officer: "Officer Priya",
    priority: "Medium"
  },
  {
    id: "app18",
    name: "Divya Rao",
    avatar: "DR",
    age: 35,
    amount: 1450000,
    purpose: "Premium SUV Loan",
    loanType: "Car Loan",
    date: "2026-07-11",
    status: "Under Review",
    defaultProb: 22,
    healthScore: 79,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 95.1,
    waitTime: "10 Hours",
    income: 230000,
    expenses: 75000,
    debt: 300000,
    savings: 1100000,
    existingLoans: [
      { bank: "ICICI", amount: 300000, emi: 12000, type: "Credit Line" }
    ],
    riskFactors: [
      "High asset price volatility index on luxury vehicles"
    ],
    protectiveFactors: [
      "DTI remains exceptionally low at 32%",
      "CIBIL score is high: 772",
      "Substantial liquid reserve backing"
    ],
    shapAttributions: [
      { feature: "Savings Balance", value: 1100000, impact: -16 },
      { feature: "DTI", value: 32, impact: -10 },
      { feature: "CIBIL Score", value: 772, impact: -12 }
    ],
    documents: [
      { name: "Showroom Quote Proforma", status: "Verified", type: "PDF" },
      { name: "Income statements", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-11 09:00 AM", action: "Ingestion Check Done", user: "System", notes: "Vehicle collateral confirmed." }
    ],
    employmentType: "Salaried",
    officer: "Unassigned",
    priority: "Low"
  },
  {
    id: "app19",
    name: "Siddharth Jain",
    avatar: "SJ",
    age: 40,
    amount: 800000,
    purpose: "Debt Restructuring",
    loanType: "Personal Loan",
    date: "2026-07-09",
    status: "Pending",
    defaultProb: 65,
    healthScore: 52,
    fraudRisk: "Medium",
    aiRec: "Manual Review",
    confidence: 90.8,
    waitTime: "1 Day",
    income: 110000,
    expenses: 85000,
    debt: 1800000,
    savings: 60000,
    existingLoans: [
      { bank: "HDFC", amount: 1200000, emi: 38000, type: "Unsecured Personal" },
      { bank: "Kotak", amount: 600000, emi: 22000, type: "Credit Card Loan" }
    ],
    riskFactors: [
      "Extremely high existing unsecured leverage",
      "Revolving utilization is at 88%",
      "Two missed card payments reported in CIBIL history"
    ],
    protectiveFactors: [
      "Employer is listed on Fortune-500 list",
      "Loan is backed by family co-guarantors"
    ],
    shapAttributions: [
      { feature: "Existing Liabilities", value: 1800000, impact: 26 },
      { feature: "Revolving Utilization", value: 88, impact: 20 },
      { feature: "CIBIL Delinquency", value: 2, impact: 14 }
    ],
    documents: [
      { name: "Liability certificates HDFC/Kotak", status: "Verified", type: "PDF" },
      { name: "Guarantor deed signatures", status: "Verified", type: "PDF" }
    ],
    auditHistory: [
      { date: "2026-07-09 11:20 AM", action: "Debt Desk Routing", user: "System", notes: "Assigned alert: Debt Restructuring request." }
    ],
    employmentType: "Salaried",
    officer: "Officer Rahul",
    priority: "Critical"
  },
  {
    id: "app20",
    name: "Ritu Sharma",
    avatar: "RS",
    age: 33,
    amount: 350000,
    purpose: "Retail Stock Purchase",
    loanType: "Business Loan",
    date: "2026-06-25",
    status: "Completed",
    defaultProb: 16,
    healthScore: 83,
    fraudRisk: "Low",
    aiRec: "Approve",
    confidence: 95.4,
    waitTime: "Completed",
    income: 130000,
    expenses: 40000,
    debt: 50000,
    savings: 380000,
    existingLoans: [],
    riskFactors: [
      "No specific negative factors identified"
    ],
    protectiveFactors: [
      "Merchant sales statements show strong sales velocity",
      "Low leverage profiles and clean history records"
    ],
    shapAttributions: [
      { feature: "Merchant Ledger Volume", value: 92, impact: -18 },
      { feature: "Savings Balance", value: 380000, impact: -12 }
    ],
    documents: [
      { name: "GST filing records FY25", status: "Verified", type: "PDF" },
      { name: "Merchant gateway statements", status: "Verified", type: "CSV" }
    ],
    auditHistory: [
      { date: "2026-06-25 04:30 PM", action: "Disbursal Executed", user: "Disbursal Team", notes: "Closed after receipt verification." }
    ],
    employmentType: "Business Owner",
    officer: "Officer Priya",
    priority: "Low"
  }
];
