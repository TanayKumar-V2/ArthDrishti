export interface Branch {
  id: string;
  name: string;
  city: string;
  state: string;
  manager: string;
  employees: number;
  status: "Active" | "Inactive";
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Manager" | "Staff" | "Viewer";
  department: string;
  branch: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
}

export interface ActivityLog {
  id: string;
  type: "Organization Created" | "Plan Changed" | "Branch Added" | "Member Invited" | "API Key Generated" | "Settings Updated";
  timestamp: string;
  detail: string;
}

export interface MetricPoint {
  date: string;
  value: number;
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry: "Banking" | "NBFC" | "Microfinance" | "Wealth Management" | "Insurance";
  website: string;
  address: string;
  country: string;
  state: string;
  registrationNumber: string;
  taxId: string;
  createdDate: string;
  subscription: "Starter" | "Professional" | "Enterprise" | "Custom";
  subscriptionStatus: "Active" | "Trial" | "Expired" | "Suspended";
  billingCycle: "Monthly" | "Annual";
  renewalDate: string;
  apiKey: string;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
  predictionVolume: number; // monthly total predictions
  predictionLimit: number;
  apiRequests: number; // monthly total API requests
  apiRequestLimit: number;
  activeUsers: number;
  userLimit: number;
  bandwidthUsed: number; // in GB
  bandwidthLimit: number; // in GB
  dbUsage: number; // in MB
  dbLimit: number; // in MB
  revenue: number; // ARR or MRR in USD equivalent
  departments: string[];
  branches: Branch[];
  members: Member[];
  activities: ActivityLog[];
  metrics: {
    memberGrowth: MetricPoint[];
    predictionUsage: MetricPoint[];
    monthlyActiveUsers: MetricPoint[];
    storageGrowth: MetricPoint[];
    apiUsage: MetricPoint[];
    revenueTrend: MetricPoint[];
  };
}

export const MOCK_INDUSTRIES = ["Banking", "NBFC", "Microfinance", "Wealth Management", "Insurance"] as const;
export const MOCK_COUNTRIES = ["India", "United States", "Singapore", "United Kingdom", "United Arab Emirates"] as const;
export const MOCK_STATES: Record<string, string[]> = {
  "India": ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Haryana", "Telangana"],
  "United States": ["California", "New York", "Texas", "Delaware", "Illinois"],
  "Singapore": ["Central Region", "East Region", "West Region"],
  "United Kingdom": ["England", "Scotland", "Wales"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah"]
};

// Seed sparklines for KPI Cards
export const KPI_SPARKLINES = {
  totalOrgs: [12, 14, 15, 18, 20, 22, 24, 25, 27, 28, 30, 32],
  enterpriseOrgs: [4, 5, 5, 6, 7, 7, 8, 9, 10, 11, 12, 12],
  branches: [80, 95, 110, 115, 130, 142, 150, 165, 180, 192, 210, 218],
  activeMembers: [890, 1120, 1240, 1400, 1680, 1890, 2100, 2340, 2560, 2890, 3120, 3450],
  storage: [4.2, 5.1, 5.8, 6.4, 7.1, 8.3, 9.5, 10.8, 12.1, 13.4, 14.8, 15.6],
  apiUsage: [45, 52, 60, 68, 75, 82, 90, 105, 118, 125, 132, 142],
  predictions: [1.8, 2.1, 2.4, 2.8, 3.2, 3.8, 4.2, 4.9, 5.5, 6.2, 6.8, 7.4],
  revenue: [45, 55, 68, 75, 90, 105, 120, 138, 150, 168, 185, 204]
};

// Generates time-series points
const generateTimeSeries = (startVal: number, step: number, variance: number, count = 6): MetricPoint[] => {
  const points: MetricPoint[] = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  
  for (let i = count - 1; i >= 0; i--) {
    const monthIdx = (currentMonthIdx - i + 12) % 12;
    const randomChange = (Math.random() - 0.45) * variance;
    const value = Math.max(0, Math.round((startVal + (count - 1 - i) * step + randomChange) * 100) / 100);
    points.push({
      date: months[monthIdx],
      value
    });
  }
  return points;
};

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: "org-hdfc",
    name: "HDFC Bank Ltd.",
    logo: "HB",
    description: "Major Indian private sector bank providing retail, corporate lending and treasury services.",
    industry: "Banking",
    website: "https://www.hdfcbank.com",
    address: "HDFC Bank House, Senapati Bapat Marg, Lower Parel",
    country: "India",
    state: "Maharashtra",
    registrationNumber: "L65920MH1994PLC080618",
    taxId: "27AAACH2702P1Z9",
    createdDate: "2024-02-18",
    subscription: "Enterprise",
    subscriptionStatus: "Active",
    billingCycle: "Annual",
    renewalDate: "2027-02-18",
    apiKey: "ad_live_hdfc_83f7a8b92cd38f1",
    storageUsed: 3820,
    storageLimit: 10000,
    predictionVolume: 3245000,
    predictionLimit: 10000000,
    apiRequests: 18450000,
    apiRequestLimit: 50000000,
    activeUsers: 840,
    userLimit: 2000,
    bandwidthUsed: 4200,
    bandwidthLimit: 10000,
    dbUsage: 480,
    dbLimit: 2048,
    revenue: 48000, // ARR in USD
    departments: ["Retail Credit", "Corporate Risk", "Treasury Ops", "Internal Audit"],
    branches: [
      { id: "br-hdfc-1", name: "Mumbai Lower Parel Branch", city: "Mumbai", state: "Maharashtra", manager: "Ramesh Iyer", employees: 42, status: "Active" },
      { id: "br-hdfc-2", name: "Delhi Connaught Place Branch", city: "Delhi", state: "Delhi", manager: "Aditi Rao", employees: 35, status: "Active" },
      { id: "br-hdfc-3", name: "Bangalore MG Road Branch", city: "Bangalore", state: "Karnataka", manager: "Siddharth Nair", employees: 28, status: "Active" },
      { id: "br-hdfc-4", name: "Pune Hinjewadi Hub", city: "Pune", state: "Maharashtra", manager: "Vikram Shinde", employees: 18, status: "Inactive" }
    ],
    members: [
      { id: "mem-hdfc-1", name: "Rohan Sen", email: "rohan.sen@hdfcbank.com", role: "Administrator", department: "Retail Credit", branch: "Mumbai Lower Parel Branch", status: "Active", lastLogin: "Just Now" },
      { id: "mem-hdfc-2", name: "Sunita Deshmukh", email: "sunita.d@hdfcbank.com", role: "Manager", department: "Corporate Risk", branch: "Mumbai Lower Parel Branch", status: "Active", lastLogin: "2 hours ago" },
      { id: "mem-hdfc-3", name: "Deepak Sharma", email: "deepak.s@hdfcbank.com", role: "Staff", department: "Retail Credit", branch: "Delhi Connaught Place Branch", status: "Active", lastLogin: "Yesterday" },
      { id: "mem-hdfc-4", name: "Meera Nair", email: "meera.nair@hdfcbank.com", role: "Viewer", department: "Internal Audit", branch: "Bangalore MG Road Branch", status: "Pending", lastLogin: "Never" }
    ],
    activities: [
      { id: "act-hdfc-1", type: "Settings Updated", timestamp: "2026-07-13 14:22:15", detail: "SSO Domain restrictions updated by Rohan Sen." },
      { id: "act-hdfc-2", type: "Branch Added", timestamp: "2026-07-10 11:05:40", detail: "Branch 'Pune Hinjewadi Hub' registered under Maharashtra operations." },
      { id: "act-hdfc-3", type: "API Key Generated", timestamp: "2026-07-01 09:30:00", detail: "API key key_live_v2 initialized for risk analysis pipeline integrations." },
      { id: "act-hdfc-4", type: "Plan Changed", timestamp: "2025-02-18 10:00:00", detail: "Subscribed to Enterprise Plan with quota expansions." }
    ],
    metrics: {
      memberGrowth: generateTimeSeries(600, 40, 20),
      predictionUsage: generateTimeSeries(2.5, 0.15, 0.25),
      monthlyActiveUsers: generateTimeSeries(650, 30, 15),
      storageGrowth: generateTimeSeries(3200, 120, 50),
      apiUsage: generateTimeSeries(15, 0.7, 0.9),
      revenueTrend: generateTimeSeries(42, 1.2, 0.5)
    }
  },
  {
    id: "org-icici",
    name: "ICICI Bank Ltd.",
    logo: "IB",
    description: "Multinational banking and financial services company specializing in digital retail products.",
    industry: "Banking",
    website: "https://www.icicibank.com",
    address: "ICICI Bank Towers, Bandra Kurla Complex",
    country: "India",
    state: "Maharashtra",
    registrationNumber: "L65190GJ1994PLC021012",
    taxId: "24AAACI0902K1Z5",
    createdDate: "2024-04-12",
    subscription: "Enterprise",
    subscriptionStatus: "Active",
    billingCycle: "Annual",
    renewalDate: "2027-04-12",
    apiKey: "ad_live_icici_62a781b28cdaef32",
    storageUsed: 2950,
    storageLimit: 10000,
    predictionVolume: 2890000,
    predictionLimit: 10000000,
    apiRequests: 14200000,
    apiRequestLimit: 50000000,
    activeUsers: 680,
    userLimit: 2000,
    bandwidthUsed: 3600,
    bandwidthLimit: 10000,
    dbUsage: 395,
    dbLimit: 2048,
    revenue: 40000,
    departments: ["Digital Lending", "Credit Cards Risk", "Zonal Operations"],
    branches: [
      { id: "br-icici-1", name: "Mumbai BKC HQ", city: "Mumbai", state: "Maharashtra", manager: "Anil Kulkarni", employees: 60, status: "Active" },
      { id: "br-icici-2", name: "Bangalore Whitefield Branch", city: "Bangalore", state: "Karnataka", manager: "Kavitha Raj", employees: 22, status: "Active" }
    ],
    members: [
      { id: "mem-icici-1", name: "Amit Patel", email: "amit.patel@icicibank.com", role: "Administrator", department: "Digital Lending", branch: "Mumbai BKC HQ", status: "Active", lastLogin: "30 mins ago" },
      { id: "mem-icici-2", name: "Shweta Rao", email: "shweta.rao@icicibank.com", role: "Staff", department: "Credit Cards Risk", branch: "Mumbai BKC HQ", status: "Active", lastLogin: "3 days ago" }
    ],
    activities: [
      { id: "act-icici-1", type: "Member Invited", timestamp: "2026-07-12 16:40:00", detail: "Shweta Rao invited to digital lending desk." },
      { id: "act-icici-2", type: "API Key Generated", timestamp: "2026-04-15 11:15:00", detail: "Primary production API token generated." }
    ],
    metrics: {
      memberGrowth: generateTimeSeries(500, 30, 15),
      predictionUsage: generateTimeSeries(2.1, 0.12, 0.2),
      monthlyActiveUsers: generateTimeSeries(550, 22, 12),
      storageGrowth: generateTimeSeries(2400, 110, 40),
      apiUsage: generateTimeSeries(12, 0.4, 0.6),
      revenueTrend: generateTimeSeries(35, 1.0, 0.3)
    }
  },
  {
    id: "org-muthoot",
    name: "Muthoot Finance",
    logo: "MF",
    description: "India's largest gold loan NBFC offering microloans, housing finance, and gold financing.",
    industry: "NBFC",
    website: "https://www.muthootfinance.com",
    address: "Muthoot Chambers, Opposite Saritha Theatre Complex, Kochi",
    country: "India",
    state: "Kerala",
    registrationNumber: "L65910KL1997PLC011300",
    taxId: "32AAACM3412B1ZC",
    createdDate: "2024-06-25",
    subscription: "Enterprise",
    subscriptionStatus: "Active",
    billingCycle: "Annual",
    renewalDate: "2027-06-25",
    apiKey: "ad_live_muthoot_01a39f674bd28c89",
    storageUsed: 4890,
    storageLimit: 8000,
    predictionVolume: 5120000,
    predictionLimit: 8000000,
    apiRequests: 22100000,
    apiRequestLimit: 30000000,
    activeUsers: 1450,
    userLimit: 1500,
    bandwidthUsed: 5400,
    bandwidthLimit: 8000,
    dbUsage: 620,
    dbLimit: 1024,
    revenue: 35000,
    departments: ["Gold Valuations", "Microfinance Underwriting", "Collections Desk"],
    branches: [
      { id: "br-muthoot-1", name: "Kochi Main Branch", city: "Kochi", state: "Kerala", manager: "Mathew Jacob", employees: 25, status: "Active" },
      { id: "br-muthoot-2", name: "Delhi Karol Bagh Branch", city: "Delhi", state: "Delhi", manager: "Rajesh Mishra", employees: 18, status: "Active" },
      { id: "br-muthoot-3", name: "Chennai T-Nagar Branch", city: "Chennai", state: "Tamil Nadu", manager: "Srinivasan K", employees: 15, status: "Active" }
    ],
    members: [
      { id: "mem-muthoot-1", name: "George Muthoot", email: "george@muthoot.com", role: "Administrator", department: "Gold Valuations", branch: "Kochi Main Branch", status: "Active", lastLogin: "1 hour ago" },
      { id: "mem-muthoot-2", name: "Karthik Raja", email: "karthik.raja@muthoot.com", role: "Manager", department: "Collections Desk", branch: "Chennai T-Nagar Branch", status: "Active", lastLogin: "Yesterday" }
    ],
    activities: [
      { id: "act-muthoot-1", type: "Settings Updated", timestamp: "2026-07-09 10:30:12", detail: "Whitelisted collection officer subnets." }
    ],
    metrics: {
      memberGrowth: generateTimeSeries(1100, 70, 30),
      predictionUsage: generateTimeSeries(4.2, 0.18, 0.35),
      monthlyActiveUsers: generateTimeSeries(1200, 50, 20),
      storageGrowth: generateTimeSeries(4100, 150, 60),
      apiUsage: generateTimeSeries(18, 0.8, 1.1),
      revenueTrend: generateTimeSeries(30, 0.8, 0.4)
    }
  },
  {
    id: "org-bajaj",
    name: "Bajaj Finserv Ltd.",
    logo: "BF",
    description: "Diversified financial services group focused on lending, asset management, and digital consumer credit.",
    industry: "NBFC",
    website: "https://www.bajajfinserv.in",
    address: "Bajaj Auto Limited Complex, Mumbai-Pune Road, Akurdi",
    country: "India",
    state: "Maharashtra",
    registrationNumber: "L65923PN2007PLC130075",
    taxId: "27AAACB0341J1Z8",
    createdDate: "2024-09-05",
    subscription: "Enterprise",
    subscriptionStatus: "Active",
    billingCycle: "Annual",
    renewalDate: "2026-09-05",
    apiKey: "ad_live_bajaj_901c89f81a7bdfd9",
    storageUsed: 6200,
    storageLimit: 12000,
    predictionVolume: 6480000,
    predictionLimit: 15000000,
    apiRequests: 31200000,
    apiRequestLimit: 75000000,
    activeUsers: 1120,
    userLimit: 2500,
    bandwidthUsed: 7100,
    bandwidthLimit: 15000,
    dbUsage: 790,
    dbLimit: 4096,
    revenue: 55000,
    departments: ["Consumer Durable Loans", "Personal Loans Risk", "API Integrations Hub"],
    branches: [
      { id: "br-bajaj-1", name: "Pune Corporate Office", city: "Pune", state: "Maharashtra", manager: "Sandeep Bhasin", employees: 120, status: "Active" },
      { id: "br-bajaj-2", name: "Delhi Consumer Financing Hub", city: "Delhi", state: "Delhi", manager: "Nitin Gupta", employees: 48, status: "Active" }
    ],
    members: [
      { id: "mem-bajaj-1", name: "Pooja Mehta", email: "pooja.mehta@bajaj.in", role: "Administrator", department: "API Integrations Hub", branch: "Pune Corporate Office", status: "Active", lastLogin: "Yesterday" }
    ],
    activities: [
      { id: "act-bajaj-1", type: "Settings Updated", timestamp: "2026-07-11 11:20:00", detail: "Consumer Loan risk score threshold elevated." }
    ],
    metrics: {
      memberGrowth: generateTimeSeries(900, 45, 25),
      predictionUsage: generateTimeSeries(5.5, 0.2, 0.4),
      monthlyActiveUsers: generateTimeSeries(950, 35, 18),
      storageGrowth: generateTimeSeries(5000, 240, 80),
      apiUsage: generateTimeSeries(26, 1.0, 1.5),
      revenueTrend: generateTimeSeries(45, 2.0, 0.8)
    }
  },
  {
    id: "org-razorpay",
    name: "Razorpay Financial",
    logo: "RF",
    description: "Fintech innovator facilitating digital merchant payouts, credit lines and transaction risks.",
    industry: "Wealth Management",
    website: "https://razorpay.com",
    address: "SJR Cyber, 22 Laskar-Hosur Road, Adugodi",
    country: "India",
    state: "Karnataka",
    registrationNumber: "U74900KA2013PTC097450",
    taxId: "29AAACR0204P1Z3",
    createdDate: "2024-11-10",
    subscription: "Professional",
    subscriptionStatus: "Active",
    billingCycle: "Monthly",
    renewalDate: "2026-08-10",
    apiKey: "ad_live_razor_a47bc671bcfd9921",
    storageUsed: 920,
    storageLimit: 2000,
    predictionVolume: 920000,
    predictionLimit: 2000000,
    apiRequests: 8400000,
    apiRequestLimit: 15000000,
    activeUsers: 145,
    userLimit: 300,
    bandwidthUsed: 1400,
    bandwidthLimit: 3000,
    dbUsage: 120,
    dbLimit: 512,
    revenue: 15000,
    departments: ["Merchant Risk Underwriting", "Capital Disbursals"],
    branches: [
      { id: "br-razor-1", name: "Bangalore HQ Desk", city: "Bangalore", state: "Karnataka", manager: "Harshil Mathur", employees: 30, status: "Active" }
    ],
    members: [
      { id: "mem-razor-1", name: "Karan Johar", email: "karan.j@razorpay.com", role: "Administrator", department: "Merchant Risk Underwriting", branch: "Bangalore HQ Desk", status: "Active", lastLogin: "3 hours ago" }
    ],
    activities: [
      { id: "act-razor-1", type: "API Key Generated", timestamp: "2026-06-20 18:00:00", detail: "Sandbox API key generated for integration verification." }
    ],
    metrics: {
      memberGrowth: generateTimeSeries(110, 7, 5),
      predictionUsage: generateTimeSeries(0.7, 0.04, 0.08),
      monthlyActiveUsers: generateTimeSeries(120, 5, 4),
      storageGrowth: generateTimeSeries(700, 45, 15),
      apiUsage: generateTimeSeries(6.8, 0.3, 0.5),
      revenueTrend: generateTimeSeries(12, 0.6, 0.2)
    }
  },
  {
    id: "org-zeta",
    name: "Zeta Finance Corp",
    logo: "ZF",
    description: "SaaS banking platform provider helping digital-only banks design structured lending routes.",
    industry: "Wealth Management",
    website: "https://zeta.tech",
    address: "32 Market Street, Financial Hub",
    country: "Singapore",
    state: "Central Region",
    registrationNumber: "SG2015891A",
    taxId: "SG-TAX-9021",
    createdDate: "2025-05-01",
    subscription: "Starter",
    subscriptionStatus: "Trial",
    billingCycle: "Monthly",
    renewalDate: "2026-08-01",
    apiKey: "ad_test_zeta_bf8901cfaed3810f",
    storageUsed: 120,
    storageLimit: 500,
    predictionVolume: 110000,
    predictionLimit: 500000,
    apiRequests: 1890000,
    apiRequestLimit: 5000000,
    activeUsers: 14,
    userLimit: 50,
    bandwidthUsed: 210,
    bandwidthLimit: 1000,
    dbUsage: 18,
    dbLimit: 256,
    revenue: 3500,
    departments: ["Lending Sandboxes"],
    branches: [
      { id: "br-zeta-1", name: "Singapore Sandbox Hub", city: "Singapore", state: "Central Region", manager: "Cheryl Chen", employees: 6, status: "Active" }
    ],
    members: [
      { id: "mem-zeta-1", name: "Cheryl Chen", email: "cheryl.c@zeta.tech", role: "Administrator", department: "Lending Sandboxes", branch: "Singapore Sandbox Hub", status: "Active", lastLogin: "Just Now" }
    ],
    activities: [
      { id: "act-zeta-1", type: "Organization Created", timestamp: "2025-05-01 09:00:00", detail: "Workspace created under sandbox evaluation tier." }
    ],
    metrics: {
      memberGrowth: generateTimeSeries(10, 1, 1),
      predictionUsage: generateTimeSeries(0.08, 0.005, 0.01),
      monthlyActiveUsers: generateTimeSeries(10, 1, 1),
      storageGrowth: generateTimeSeries(80, 8, 5),
      apiUsage: generateTimeSeries(1.2, 0.1, 0.2),
      revenueTrend: generateTimeSeries(3.5, 0.0, 0.0)
    }
  },
  {
    id: "org-upstox",
    name: "Upstox Wealth Group",
    logo: "UW",
    description: "Online broker expanding options risk metrics computation for consumer margin accounts.",
    industry: "Wealth Management",
    website: "https://upstox.com",
    address: "Sunshine Towers, Senapati Bapat Marg",
    country: "India",
    state: "Maharashtra",
    registrationNumber: "L67120MH2009PLC192801",
    taxId: "27AAACU1204K1Z9",
    createdDate: "2025-01-10",
    subscription: "Starter",
    subscriptionStatus: "Expired",
    billingCycle: "Monthly",
    renewalDate: "2026-06-10",
    apiKey: "ad_live_upstox_cd9831fbe831eef1",
    storageUsed: 310,
    storageLimit: 500,
    predictionVolume: 420000,
    predictionLimit: 500000,
    apiRequests: 4100000,
    apiRequestLimit: 5000000,
    activeUsers: 35,
    userLimit: 50,
    bandwidthUsed: 490,
    bandwidthLimit: 1000,
    dbUsage: 45,
    dbLimit: 256,
    revenue: 0,
    departments: ["Margin Lending Desk"],
    branches: [
      { id: "br-upstox-1", name: "Mumbai Options Desk", city: "Mumbai", state: "Maharashtra", manager: "Ravi Kumar", employees: 12, status: "Active" }
    ],
    members: [
      { id: "mem-upstox-1", name: "Ravi Kumar", email: "ravi.k@upstox.com", role: "Administrator", department: "Margin Lending Desk", branch: "Mumbai Options Desk", status: "Active", lastLogin: "3 weeks ago" }
    ],
    activities: [
      { id: "act-upstox-1", type: "Plan Changed", timestamp: "2026-06-10 00:00:00", detail: "Workspace access restricted due to subscription expiration." }
    ],
    metrics: {
      memberGrowth: generateTimeSeries(30, 1, 1),
      predictionUsage: generateTimeSeries(0.35, 0.01, 0.02),
      monthlyActiveUsers: generateTimeSeries(28, 1, 2),
      storageGrowth: generateTimeSeries(270, 8, 3),
      apiUsage: generateTimeSeries(3.5, 0.1, 0.15),
      revenueTrend: generateTimeSeries(3.5, -0.7, 0.1)
    }
  },
  {
    id: "org-credco",
    name: "CredCo Microfinance",
    logo: "CM",
    description: "Providing small business loans and financial inclusion services in regional zones.",
    industry: "Microfinance",
    website: "https://credco.org",
    address: "24 Financial District, East Zone",
    country: "United States",
    state: "Delaware",
    registrationNumber: "DE-5678912",
    taxId: "DE-TAX-4560",
    createdDate: "2024-08-15",
    subscription: "Professional",
    subscriptionStatus: "Suspended",
    billingCycle: "Monthly",
    renewalDate: "2026-05-15",
    apiKey: "ad_live_credco_fe87a13bfd021c9d",
    storageUsed: 890,
    storageLimit: 2000,
    predictionVolume: 1200000,
    predictionLimit: 2000000,
    apiRequests: 6200000,
    apiRequestLimit: 15000000,
    activeUsers: 180,
    userLimit: 300,
    bandwidthUsed: 1100,
    bandwidthLimit: 3000,
    dbUsage: 140,
    dbLimit: 512,
    revenue: 0,
    departments: ["Micro Lending Desk", "Field Audits"],
    branches: [
      { id: "br-credco-1", name: "Delaware Regional Office", city: "Wilmington", state: "Delaware", manager: "Sarah Jenkins", employees: 20, status: "Active" },
      { id: "br-credco-2", name: "Texas Micro Hub", city: "Dallas", state: "Texas", manager: "John Davis", employees: 14, status: "Inactive" }
    ],
    members: [
      { id: "mem-credco-1", name: "Sarah Jenkins", email: "sarah.j@credco.org", role: "Administrator", department: "Micro Lending Desk", branch: "Delaware Regional Office", status: "Active", lastLogin: "1 month ago" }
    ],
    activities: [
      { id: "act-credco-1", type: "Settings Updated", timestamp: "2026-05-15 00:00:00", detail: "Workspace suspended by administrator action." }
    ],
    metrics: {
      memberGrowth: generateTimeSeries(160, 4, 3),
      predictionUsage: generateTimeSeries(1.0, 0.05, 0.1),
      monthlyActiveUsers: generateTimeSeries(150, 6, 5),
      storageGrowth: generateTimeSeries(780, 20, 10),
      apiUsage: generateTimeSeries(5.2, 0.2, 0.3),
      revenueTrend: generateTimeSeries(15, -3.0, 0.5)
    }
  }
];
