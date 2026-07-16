export interface CashFlowDataPoint {
  date: string;
  balance: number;
  isForecast: boolean;
  confidenceLower?: number;
  confidenceUpper?: number;
  event?: string;
  eventAmount?: number;
  eventType?: "inflow" | "outflow";
  isRiskEvent?: boolean;
}

export interface FutureEvent {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: "credit" | "debit";
  status: "scheduled" | "predicted" | "risk";
  description: string;
}

export interface ExpenseForecastCategory {
  category: string;
  currentAverage: number;
  expectedAverage: number;
  percentChange: number; // e.g. +4.2 or -12.0
  trend: "up" | "down" | "stable";
  description: string;
}

// 7-day view (Daily data from July 9, 2026 to July 15, 2026)
export const mock7DaysCashFlow: CashFlowDataPoint[] = [
  { date: "Jul 09", balance: 515000, isForecast: false },
  { date: "Jul 10", balance: 513000, isForecast: true, confidenceLower: 510000, confidenceUpper: 516000 },
  { date: "Jul 11", balance: 512000, isForecast: true, confidenceLower: 508000, confidenceUpper: 516000 },
  { date: "Jul 12", balance: 511000, isForecast: true, confidenceLower: 505000, confidenceUpper: 517000 },
  { date: "Jul 13", balance: 510000, isForecast: true, confidenceLower: 502000, confidenceUpper: 518000 },
  { date: "Jul 14", balance: 508000, isForecast: true, confidenceLower: 498000, confidenceUpper: 518000 },
  { 
    date: "Jul 15", 
    balance: 506000, 
    isForecast: true, 
    confidenceLower: 494000, 
    confidenceUpper: 518000,
    event: "Investment SIP",
    eventAmount: 5000,
    eventType: "outflow"
  }
];

// 30-day view (Daily from July 1, 2026 to August 8, 2026)
export const mock30DaysCashFlow: CashFlowDataPoint[] = [
  // Historical Actuals (July 1 - July 9)
  { date: "Jul 01", balance: 410000, isForecast: false },
  { date: "Jul 02", balance: 408000, isForecast: false },
  { 
    date: "Jul 03", 
    balance: 403000, 
    isForecast: false,
    event: "Investment SIP",
    eventAmount: 5000,
    eventType: "outflow"
  },
  { date: "Jul 04", balance: 402000, isForecast: false },
  { 
    date: "Jul 05", 
    balance: 554000, 
    isForecast: false,
    event: "Salary Credit",
    eventAmount: 152000,
    eventType: "inflow"
  },
  { date: "Jul 06", balance: 551500, isForecast: false },
  { 
    date: "Jul 07", 
    balance: 519500, 
    isForecast: false,
    event: "Rent",
    eventAmount: 32000,
    eventType: "outflow"
  },
  { date: "Jul 08", balance: 518000, isForecast: false },
  { date: "Jul 09", balance: 515000, isForecast: false }, // Today

  // Projections & Forecast (July 10 - August 8)
  { date: "Jul 10", balance: 513000, isForecast: true, confidenceLower: 510000, confidenceUpper: 516000 },
  { date: "Jul 11", balance: 512000, isForecast: true, confidenceLower: 508000, confidenceUpper: 516000 },
  { date: "Jul 12", balance: 511000, isForecast: true, confidenceLower: 505000, confidenceUpper: 517000 },
  { date: "Jul 13", balance: 510000, isForecast: true, confidenceLower: 502000, confidenceUpper: 518000 },
  { date: "Jul 14", balance: 508000, isForecast: true, confidenceLower: 498000, confidenceUpper: 518000 },
  { 
    date: "Jul 15", 
    balance: 503000, 
    isForecast: true, 
    confidenceLower: 492000, 
    confidenceUpper: 514000,
    event: "Investment SIP",
    eventAmount: 5000,
    eventType: "outflow"
  },
  { date: "Jul 16", balance: 501000, isForecast: true, confidenceLower: 489000, confidenceUpper: 513000 },
  { date: "Jul 17", balance: 500000, isForecast: true, confidenceLower: 486000, confidenceUpper: 514000 },
  { 
    date: "Jul 18", 
    balance: 455000, 
    isForecast: true, 
    confidenceLower: 438000, 
    confidenceUpper: 472000,
    event: "Loan EMI",
    eventAmount: 45000,
    eventType: "outflow"
  },
  { date: "Jul 19", balance: 453000, isForecast: true, confidenceLower: 434000, confidenceUpper: 472000 },
  { date: "Jul 20", balance: 451000, isForecast: true, confidenceLower: 430000, confidenceUpper: 472000 },
  { date: "Jul 21", balance: 448000, isForecast: true, confidenceLower: 425000, confidenceUpper: 471000 },
  { date: "Jul 22", balance: 440000, isForecast: true, confidenceLower: 415000, confidenceUpper: 465000 },
  { date: "Jul 23", balance: 435000, isForecast: true, confidenceLower: 408000, confidenceUpper: 462000 },
  { date: "Jul 24", balance: 430000, isForecast: true, confidenceLower: 401000, confidenceUpper: 459000 },
  { date: "Jul 25", balance: 422000, isForecast: true, confidenceLower: 391000, confidenceUpper: 453000 },
  { date: "Jul 26", balance: 418000, isForecast: true, confidenceLower: 385000, confidenceUpper: 451000 },
  { 
    date: "Jul 27", 
    balance: 38000, 
    isForecast: true, 
    confidenceLower: 15000, 
    confidenceUpper: 61000,
    event: "Potential Low Balance",
    eventAmount: 380000,
    eventType: "outflow",
    isRiskEvent: true
  },
  { date: "Jul 28", balance: 37500, isForecast: true, confidenceLower: 12000, confidenceUpper: 63000 },
  { date: "Jul 29", balance: 37000, isForecast: true, confidenceLower: 10000, confidenceUpper: 64000 },
  { 
    date: "Jul 30", 
    balance: 437000, 
    isForecast: true, 
    confidenceLower: 395000, 
    confidenceUpper: 479000,
    event: "Salary Credit",
    eventAmount: 400000,
    eventType: "inflow"
  },
  { date: "Jul 31", balance: 435000, isForecast: true, confidenceLower: 390000, confidenceUpper: 480000 },
  { date: "Aug 01", balance: 432000, isForecast: true, confidenceLower: 384000, confidenceUpper: 480000 },
  { 
    date: "Aug 02", 
    balance: 400000, 
    isForecast: true, 
    confidenceLower: 348000, 
    confidenceUpper: 452000,
    event: "Rent",
    eventAmount: 32000,
    eventType: "outflow"
  },
  { date: "Aug 03", balance: 398000, isForecast: true, confidenceLower: 342000, confidenceUpper: 454000 },
  { date: "Aug 04", balance: 397000, isForecast: true, confidenceLower: 338000, confidenceUpper: 456000 },
  { date: "Aug 05", balance: 395000, isForecast: true, confidenceLower: 332000, confidenceUpper: 458000 },
  { date: "Aug 06", balance: 428000, isForecast: true, confidenceLower: 360000, confidenceUpper: 496000 },
  { date: "Aug 07", balance: 426000, isForecast: true, confidenceLower: 354000, confidenceUpper: 498000 },
  { date: "Aug 08", balance: 424000, isForecast: true, confidenceLower: 348000, confidenceUpper: 500000 }
];

// 6-month view (Monthly aggregated data)
export const mock6MonthsCashFlow: CashFlowDataPoint[] = [
  // Historical Actuals (Feb 2026 - Jul 2026)
  { date: "Feb 26", balance: 320000, isForecast: false },
  { date: "Mar 26", balance: 350000, isForecast: false },
  { date: "Apr 26", balance: 335000, isForecast: false },
  { date: "May 26", balance: 390000, isForecast: false },
  { date: "Jun 26", balance: 410000, isForecast: false },
  { date: "Jul 26", balance: 403000, isForecast: false },

  // Projections & Forecast (Aug 2026 - Jan 2027)
  { date: "Aug 26", balance: 424000, isForecast: true, confidenceLower: 348000, confidenceUpper: 500000 },
  { date: "Sep 26", balance: 450000, isForecast: true, confidenceLower: 360000, confidenceUpper: 540000 },
  { date: "Oct 26", balance: 465000, isForecast: true, confidenceLower: 350000, confidenceUpper: 580000 },
  { date: "Nov 26", balance: 440000, isForecast: true, confidenceLower: 310000, confidenceUpper: 570000 },
  { date: "Dec 26", balance: 480000, isForecast: true, confidenceLower: 330000, confidenceUpper: 630000 },
  { date: "Jan 27", balance: 510000, isForecast: true, confidenceLower: 340000, confidenceUpper: 680000 }
];

// Future Predicted & Scheduled Timeline events
export const mockFutureEvents: FutureEvent[] = [
  {
    id: "fe-1",
    name: "Regular Office Rent Sweep",
    date: "August 02, 2026",
    amount: 32000.00,
    type: "debit",
    status: "scheduled",
    description: "Contractual rent deduction for primary co-working hub desks."
  },
  {
    id: "fe-2",
    name: "SIP Investment Accumulation",
    date: "July 15, 2026",
    amount: 5000.00,
    type: "debit",
    status: "scheduled",
    description: "Automated sweep for institutional mutual fund portfolio addition."
  },
  {
    id: "fe-3",
    name: "Corporate Vehicle Loan EMI",
    date: "July 18, 2026",
    amount: 45000.00,
    type: "debit",
    status: "scheduled",
    description: "Monthly loan repayment debit. Safe rating on ledger."
  },
  {
    id: "fe-4",
    name: "TCS consulting milestone credit",
    date: "July 30, 2026",
    amount: 400000.00,
    type: "credit",
    status: "predicted",
    description: "Invoice payout matching standard milestone delivery profiles."
  },
  {
    id: "fe-5",
    name: "Balance Dip Risk Warning",
    date: "July 27, 2026",
    amount: 38000.00,
    type: "debit",
    status: "risk",
    description: "Computed low balance risk threshold. Cash sweeps may bottom out below safety limit."
  }
];

// Expense Category Forecast Swings
export const mockExpenseForecast: ExpenseForecastCategory[] = [
  {
    category: "utilities",
    currentAverage: 31800,
    expectedAverage: 33135,
    percentChange: 4.2,
    trend: "up",
    description: "Expected cloud usage increases during upcoming product release sprints."
  },
  {
    category: "leisure",
    currentAverage: 19500,
    expectedAverage: 17160,
    percentChange: -12.0,
    trend: "down",
    description: "Client hospitality bounds forecast lower under seasonal corporate travel cuts."
  },
  {
    category: "housing",
    currentAverage: 32000,
    expectedAverage: 32000,
    percentChange: 0.0,
    trend: "stable",
    description: "Co-working space rent is locked in for the next 6 months contract duration."
  },
  {
    category: "business",
    currentAverage: 135000,
    expectedAverage: 145800,
    percentChange: 8.0,
    trend: "up",
    description: "Atypical SaaS seat upgrades and freelancer deliverables scheduled."
  },
  {
    category: "debt_repayment",
    currentAverage: 73000,
    expectedAverage: 73000,
    percentChange: 0.0,
    trend: "stable",
    description: "Standard monthly EMI and card sweeps remain flat."
  }
];
