export interface SpendingCategory {
  id: string;
  name: "Food" | "Travel" | "Entertainment" | "Shopping" | "Utilities" | "Healthcare";
  amount: number;
  share: number; // percentage
  trend: number; // percentage change MoM
  budget: number;
  aiObservation: string;
}

export interface SpendPoint {
  dateLabel: string;
  Food: number;
  Travel: number;
  Entertainment: number;
  Shopping: number;
  Utilities: number;
  Healthcare: number;
  total: number;
  compareTotal?: number; // matching period comparison
}

export interface BehavioralMetric {
  name: string;
  value: string;
  status: "warning" | "positive" | "info" | "default";
  detail: string;
  iconName: string;
}

export interface MerchantMetric {
  name: string;
  metricValue: string; // e.g. "₹12,400" or "18 Transactions" or "+32.4%"
  subtext: string;
  category: string;
}

export const mockCategories: SpendingCategory[] = [
  {
    id: "cat-1",
    name: "Food",
    amount: 18500,
    share: 22.0,
    trend: 15.2,
    budget: 15000,
    aiObservation: "Weekend food delivery volume remains high, particularly post-midnight orders driving discretionary costs up."
  },
  {
    id: "cat-2",
    name: "Travel",
    amount: 12000,
    share: 14.3,
    trend: 4.8,
    budget: 10000,
    aiObservation: "Frequent ride-share trips under 3km comprise 40% of transit spending. Consider walking or micro-transit options."
  },
  {
    id: "cat-3",
    name: "Entertainment",
    amount: 8200,
    share: 9.7,
    trend: -2.1,
    budget: 12000,
    aiObservation: "Subscription consolidation has successfully decreased monthly recurring fees by 15%."
  },
  {
    id: "cat-4",
    name: "Shopping",
    amount: 15500,
    share: 18.4,
    trend: 22.4,
    budget: 15000,
    aiObservation: "Impulse shopping spikes detected during mid-week promotional events, especially on e-commerce platforms."
  },
  {
    id: "cat-5",
    name: "Utilities",
    amount: 13000,
    share: 15.4,
    trend: 1.2,
    budget: 13000,
    aiObservation: "A/C power overheads increased electricity bill in line with summer seasonal trends."
  },
  {
    id: "cat-6",
    name: "Healthcare",
    amount: 17000,
    share: 20.2,
    trend: 8.5,
    budget: 10000,
    aiObservation: "Bi-annual dental clearance check and prescription drug refills processed. Expected to normalize next month."
  }
];

export const mockDailyTrends: SpendPoint[] = [
  { dateLabel: "Jul 02", Food: 800, Travel: 300, Entertainment: 0, Shopping: 1200, Utilities: 0, Healthcare: 200, total: 2500, compareTotal: 2200 },
  { dateLabel: "Jul 03", Food: 1200, Travel: 450, Entertainment: 1500, Shopping: 3500, Utilities: 0, Healthcare: 0, total: 6650, compareTotal: 5100 },
  { dateLabel: "Jul 04", Food: 3200, Travel: 900, Entertainment: 2500, Shopping: 1800, Utilities: 0, Healthcare: 1500, total: 9900, compareTotal: 8400 },
  { dateLabel: "Jul 05", Food: 2800, Travel: 1200, Entertainment: 1800, Shopping: 4000, Utilities: 0, Healthcare: 0, total: 9800, compareTotal: 8600 },
  { dateLabel: "Jul 06", Food: 950, Travel: 200, Entertainment: 0, Shopping: 800, Utilities: 5500, Healthcare: 400, total: 7850, compareTotal: 7200 },
  { dateLabel: "Jul 07", Food: 1100, Travel: 350, Entertainment: 400, Shopping: 500, Utilities: 0, Healthcare: 5000, total: 7350, compareTotal: 6900 },
  { dateLabel: "Jul 08", Food: 1500, Travel: 400, Entertainment: 0, Shopping: 1200, Utilities: 0, Healthcare: 1000, total: 4100, compareTotal: 3800 }
];

export const mockWeeklyTrends: SpendPoint[] = [
  { dateLabel: "Week 23", Food: 3800, Travel: 2500, Entertainment: 1800, Shopping: 2900, Utilities: 3100, Healthcare: 1500, total: 15600, compareTotal: 14200 },
  { dateLabel: "Week 24", Food: 4200, Travel: 2200, Entertainment: 2000, Shopping: 3100, Utilities: 0, Healthcare: 4000, total: 15500, compareTotal: 14900 },
  { dateLabel: "Week 25", Food: 3500, Travel: 3100, Entertainment: 1200, Shopping: 4500, Utilities: 3200, Healthcare: 2500, total: 18000, compareTotal: 16100 },
  { dateLabel: "Week 26", Food: 4800, Travel: 2800, Entertainment: 3200, Shopping: 5000, Utilities: 3350, Healthcare: 9000, total: 28150, compareTotal: 24500 }
];

export const mockMonthlyTrends: SpendPoint[] = [
  { dateLabel: "Feb", Food: 14200, Travel: 8900, Entertainment: 9500, Shopping: 11000, Utilities: 12500, Healthcare: 8000, total: 64100, compareTotal: 62000 },
  { dateLabel: "Mar", Food: 15000, Travel: 9200, Entertainment: 9000, Shopping: 12500, Utilities: 12800, Healthcare: 9500, total: 68000, compareTotal: 65100 },
  { dateLabel: "Apr", Food: 15800, Travel: 10500, Entertainment: 8200, Shopping: 13000, Utilities: 12600, Healthcare: 11000, total: 71100, compareTotal: 69000 },
  { dateLabel: "May", Food: 16200, Travel: 11000, Entertainment: 8400, Shopping: 12800, Utilities: 12900, Healthcare: 10500, total: 71800, compareTotal: 72000 },
  { dateLabel: "Jun", Food: 17100, Travel: 11500, Entertainment: 8500, Shopping: 13900, Utilities: 13000, Healthcare: 12000, total: 76000, compareTotal: 73000 },
  { dateLabel: "Jul (YTD)", Food: 18500, Travel: 12000, Entertainment: 8200, Shopping: 15500, Utilities: 13000, Healthcare: 17000, total: 84200, compareTotal: 74900 }
];

export const mockBehavioralMetrics: BehavioralMetric[] = [
  {
    name: "Weekend Spending",
    value: "42.0%",
    status: "warning",
    detail: "₹35,364 spent on Fri/Sat/Sun, driven by restaurants and electronics checkout hubs.",
    iconName: "Calendar"
  },
  {
    name: "Impulse Purchases",
    value: "28.4%",
    status: "warning",
    detail: "Spontaneous shopping card clearings executed during mid-week promotional flashes.",
    iconName: "TrendingUp"
  },
  {
    name: "Recurring Subscription",
    value: "₹18,200",
    status: "info",
    detail: "12 active digital services, cloud SaaS, and local wellness memberships billed early month.",
    iconName: "Clock"
  },
  {
    name: "Cash Withdrawals",
    value: "₹15,000",
    status: "positive",
    detail: "3 transactions processed at bank ATMs, primarily deployed for street market vendors.",
    iconName: "DollarSign"
  },
  {
    name: "Shopping Frequency",
    value: "6 txns/wk",
    status: "info",
    detail: "High consolidation of online orders. Average cart size logged at ₹2,580.",
    iconName: "Search"
  },
  {
    name: "Subscription Growth",
    value: "+18.5%",
    status: "default",
    detail: "2 new video and workspace platforms integrated into current month billing logs.",
    iconName: "Sliders"
  }
];

export const mockMerchants: Record<string, MerchantMetric[]> = {
  top: [
    { name: "Amazon India Retail", metricValue: "₹12,400", subtext: "12 purchases", category: "Shopping" },
    { name: "Zomato Inbound Delivery", metricValue: "₹8,200", subtext: "24 orders", category: "Food" },
    { name: "Apollo Pharmacy Group", metricValue: "₹7,800", subtext: "3 invoices", category: "Healthcare" },
    { name: "Tata Power Ingest", metricValue: "₹6,900", subtext: "1 electricity clearance", category: "Utilities" }
  ],
  frequent: [
    { name: "Uber Ride Share Cabs", metricValue: "18 transactions", subtext: "₹5,200 total value", category: "Travel" },
    { name: "Swiggy Foods Delivery", metricValue: "15 transactions", subtext: "₹6,100 total value", category: "Food" },
    { name: "Starbucks Coffee Retail", metricValue: "8 transactions", subtext: "₹2,800 total value", category: "Food" },
    { name: "Amazon Prime Video & Kindle", metricValue: "4 transactions", subtext: "₹1,199 total value", category: "Entertainment" }
  ],
  spikes: [
    { name: "Zomato Inbound Delivery", metricValue: "+32.4% MoM", subtext: "₹8,200 vs ₹6,200 previous", category: "Food" },
    { name: "Amazon India Retail", metricValue: "+24.1% MoM", subtext: "₹12,400 vs ₹9,990 previous", category: "Shopping" },
    { name: "Uber Ride Share Cabs", metricValue: "+18.2% MoM", subtext: "₹5,200 vs ₹4,400 previous", category: "Travel" },
    { name: "Local Pharmacy Chemist", metricValue: "+12.5% MoM", subtext: "₹3,400 vs ₹3,020 previous", category: "Healthcare" }
  ],
  new: [
    { name: "Netflix Premium Direct", metricValue: "₹1,499", subtext: "Ingested Jul 05", category: "Entertainment" },
    { name: "Co-Working Office Cafe", metricValue: "₹2,100", subtext: "Ingested Jul 03", category: "Food" },
    { name: "Global Health Dental Care", metricValue: "₹6,500", subtext: "Ingested Jul 02", category: "Healthcare" },
    { name: "Digital Server Hosting Hub", metricValue: "₹1,200", subtext: "Ingested Jul 01", category: "Utilities" }
  ]
};

export const mockSavingsOpportunities = [
  {
    id: "opp-1",
    recommendation: "Food delivery spending increased 32% during weekends compared to mid-week medians.",
    potentialSaving: 3400,
    category: "Food",
    details: "Your average Friday-Sunday meal order costs ₹1,400 compared to a Tuesday-Thursday median of ₹650. Consolidating ordering windows could yield savings.",
    comparisons: [
      { name: "Weekend Average Spend", value: "₹1,400 / order" },
      { name: "Weekday Average Spend", value: "₹650 / order" },
      { name: "Target Budget Cap", value: "₹900 / order" }
    ]
  },
  {
    id: "opp-2",
    recommendation: "Frequent ride-share trips under 3km comprise 40% of transit spending.",
    potentialSaving: 1800,
    category: "Travel",
    details: "You booked 11 trips under 3km on Uber and Ola this month, averaging ₹180 per ride. Utilizing eco-cabs or minor walking trips saves transit credits.",
    comparisons: [
      { name: "Short Ride Count", value: "11 trips / month" },
      { name: "Short Ride Cost", value: "₹1,980 total" },
      { name: "Average Walking Time", value: "14 minutes" }
    ]
  },
  {
    id: "opp-3",
    recommendation: "Consolidate inactive digital video & streaming subscriptions.",
    potentialSaving: 1200,
    category: "Entertainment",
    details: "You have overlaps in video streaming. Restructuring or suspending inactive cloud memberships trims recurring credit drafts.",
    comparisons: [
      { name: "Active Subscriptions", value: "5 services" },
      { name: "Unused/Underutilized", value: "2 services" },
      { name: "Monthly Leakage", value: "₹1,200" }
    ]
  }
];
