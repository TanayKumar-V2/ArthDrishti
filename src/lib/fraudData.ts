export interface FraudTransaction {
  id: string;
  merchant: string;
  amount: number;
  date: string; // ISO String
  account: string;
  anomalyType: "Unusual Amount" | "Unusual Time" | "New Merchant" | "Location Anomaly" | "Transaction Frequency" | "Behavior Deviation" | "None";
  aiScore: number; // 0 to 100
  risk: "Low" | "Medium" | "High" | "Critical";
  status: "completed" | "under_review" | "approved" | "rejected";
  location: string;
  region: "Mumbai Hub" | "Delhi NCR Hub" | "Bengaluru Hub" | "Hyderabad Hub" | "International Inbound" | "Other";
  whyFlagged: {
    factor: string;
    weight: number;
  }[];
  behavioralComparison: {
    metric: string;
    historicalAverage: string;
    currentTransaction: string;
  }[];
}

export const mockFraudTransactions: FraudTransaction[] = [
  {
    id: "TXN-9082",
    merchant: "Foreign Crypto Escrow LLC",
    amount: 145000,
    date: "2026-07-08T03:14:00Z",
    account: "HDFC Savings Account *2819",
    anomalyType: "Unusual Amount",
    aiScore: 94,
    risk: "High",
    status: "under_review",
    location: "Saint Petersburg, RU",
    region: "International Inbound",
    whyFlagged: [
      { factor: "Amount Deviation", weight: 42 },
      { factor: "Unusual Time", weight: 28 },
      { factor: "New Merchant", weight: 16 },
      { factor: "Location Anomaly", weight: 8 }
    ],
    behavioralComparison: [
      { metric: "Average Merchant Amount", historicalAverage: "₹1,200", currentTransaction: "₹1,45,000" },
      { metric: "Transaction Window", historicalAverage: "9 AM - 6 PM", currentTransaction: "3:14 AM" },
      { metric: "Device Signature IP", historicalAverage: "Mumbai, India", currentTransaction: "St. Petersburg, Russia" }
    ]
  },
  {
    id: "TXN-9051",
    merchant: "Luxury Watches Emporium",
    amount: 320000,
    date: "2026-07-08T18:45:00Z",
    account: "ICICI Platinum Credit Card *4902",
    anomalyType: "Behavior Deviation",
    aiScore: 89,
    risk: "High",
    status: "under_review",
    location: "Delhi NCR, IN",
    region: "Delhi NCR Hub",
    whyFlagged: [
      { factor: "Behavior Deviation", weight: 38 },
      { factor: "Amount Deviation", weight: 30 },
      { factor: "New Merchant", weight: 15 },
      { factor: "Unusual Time", weight: 6 }
    ],
    behavioralComparison: [
      { metric: "Monthly Credit Spending", historicalAverage: "₹45,000 average total", currentTransaction: "₹3,20,000 single checkout" },
      { metric: "Category Frequency", historicalAverage: "0.05 watches/year", currentTransaction: "1 watch purchase" },
      { metric: "Terminal Verification", historicalAverage: "Self-service POS", currentTransaction: "Manual override code" }
    ]
  },
  {
    id: "TXN-8841",
    merchant: "Premium Electronics Store",
    amount: 85000,
    date: "2026-07-07T14:20:00Z",
    account: "HDFC Savings Account *2819",
    anomalyType: "New Merchant",
    aiScore: 78,
    risk: "Medium",
    status: "under_review",
    location: "Bengaluru, IN",
    region: "Bengaluru Hub",
    whyFlagged: [
      { factor: "New Merchant", weight: 35 },
      { factor: "Amount Deviation", weight: 25 },
      { factor: "Transaction Frequency", weight: 18 }
    ],
    behavioralComparison: [
      { metric: "Merchant Exposure History", historicalAverage: "First interaction", currentTransaction: "New vendor register" },
      { metric: "Daily Electronics Limit", historicalAverage: "₹15,000 limit", currentTransaction: "₹85,000 executed" }
    ]
  },
  {
    id: "TXN-8812",
    merchant: "Digital Cloud VPS Hosting",
    amount: 18500,
    date: "2026-07-07T01:10:00Z",
    account: "SBI Corporate Account *1029",
    anomalyType: "Unusual Time",
    aiScore: 72,
    risk: "Medium",
    status: "completed",
    location: "Mumbai, IN",
    region: "Mumbai Hub",
    whyFlagged: [
      { factor: "Unusual Time", weight: 40 },
      { factor: "Transaction Frequency", weight: 20 },
      { factor: "Behavior Deviation", weight: 12 }
    ],
    behavioralComparison: [
      { metric: "System Processing Hour", historicalAverage: "Standard working hours", currentTransaction: "1:10 AM automated call" },
      { metric: "Burst Frequency", historicalAverage: "1 txn per week", currentTransaction: "4 txns in 12 hours" }
    ]
  },
  {
    id: "TXN-8762",
    merchant: "Global Direct Remit Ltd",
    amount: 98000,
    date: "2026-07-06T11:45:00Z",
    account: "ICICI Platinum Credit Card *4902",
    anomalyType: "Location Anomaly",
    aiScore: 82,
    risk: "Medium",
    status: "under_review",
    location: "London, UK",
    region: "International Inbound",
    whyFlagged: [
      { factor: "Location Anomaly", weight: 45 },
      { factor: "New Merchant", weight: 22 },
      { factor: "Amount Deviation", weight: 15 }
    ],
    behavioralComparison: [
      { metric: "IP Distance Delta", historicalAverage: "Within 20km from Mumbai", currentTransaction: "7,200km remote transit" },
      { metric: "Account Velocity", historicalAverage: "₹5,000/hr", currentTransaction: "₹98,000 instantly" }
    ]
  },
  {
    id: "TXN-8711",
    merchant: "Supermarket Chains Direct",
    amount: 4500,
    date: "2026-07-06T15:30:00Z",
    account: "HDFC Savings Account *2819",
    anomalyType: "None",
    aiScore: 12,
    risk: "Low",
    status: "completed",
    location: "Mumbai, IN",
    region: "Mumbai Hub",
    whyFlagged: [],
    behavioralComparison: []
  },
  {
    id: "TXN-8699",
    merchant: "Fuel Station Terminal Hub",
    amount: 2800,
    date: "2026-07-05T09:15:00Z",
    account: "HDFC Savings Account *2819",
    anomalyType: "None",
    aiScore: 8,
    risk: "Low",
    status: "completed",
    location: "Mumbai, IN",
    region: "Mumbai Hub",
    whyFlagged: [],
    behavioralComparison: []
  },
  {
    id: "TXN-8540",
    merchant: "E-Commerce Gateway India",
    amount: 12500,
    date: "2026-07-05T12:10:00Z",
    account: "ICICI Platinum Credit Card *4902",
    anomalyType: "Transaction Frequency",
    aiScore: 68,
    risk: "Medium",
    status: "completed",
    location: "Bengaluru, IN",
    region: "Bengaluru Hub",
    whyFlagged: [
      { factor: "Transaction Frequency", weight: 35 },
      { factor: "Behavior Deviation", weight: 20 },
      { factor: "New Merchant", weight: 13 }
    ],
    behavioralComparison: [
      { metric: "Hourly Transaction Count", historicalAverage: "1.2 checkouts/hr max", currentTransaction: "6 checkouts in 15 mins" },
      { metric: "Cumulative Daily Value", historicalAverage: "₹8,000 limit", currentTransaction: "₹45,500 total day spend" }
    ]
  },
  {
    id: "TXN-8429",
    merchant: "Online Betting & Casino",
    amount: 50000,
    date: "2026-07-04T22:30:00Z",
    account: "SBI Corporate Account *1029",
    anomalyType: "Behavior Deviation",
    aiScore: 85,
    risk: "High",
    status: "rejected",
    location: "Valletta, MT",
    region: "International Inbound",
    whyFlagged: [
      { factor: "Behavior Deviation", weight: 40 },
      { factor: "Unusual Time", weight: 25 },
      { factor: "Location Anomaly", weight: 20 }
    ],
    behavioralComparison: [
      { metric: "Merchant Risk Category", historicalAverage: "No gambling historical activity", currentTransaction: "Betting terminal clearance" },
      { metric: "Billing Country IP", historicalAverage: "India", currentTransaction: "Malta proxy VPN" }
    ]
  },
  {
    id: "TXN-8319",
    merchant: "Co-Working Space Delhi",
    amount: 15000,
    date: "2026-07-04T10:00:00Z",
    account: "HDFC Savings Account *2819",
    anomalyType: "None",
    aiScore: 18,
    risk: "Low",
    status: "completed",
    location: "Delhi NCR, IN",
    region: "Delhi NCR Hub",
    whyFlagged: [],
    behavioralComparison: []
  },
  {
    id: "TXN-8201",
    merchant: "International Flights Agent",
    amount: 110000,
    date: "2026-07-03T16:40:00Z",
    account: "ICICI Platinum Credit Card *4902",
    anomalyType: "Unusual Amount",
    aiScore: 75,
    risk: "Medium",
    status: "approved",
    location: "Mumbai, IN",
    region: "Mumbai Hub",
    whyFlagged: [
      { factor: "Amount Deviation", weight: 38 },
      { factor: "Behavior Deviation", weight: 25 },
      { factor: "New Merchant", weight: 12 }
    ],
    behavioralComparison: [
      { metric: "Travel Ticket Ingests", historicalAverage: "₹25,000 average", currentTransaction: "₹1,10,000 business class multi-ticket" },
      { metric: "Lead Time to Travel", historicalAverage: "24 days advance", currentTransaction: "2 hours before departure" }
    ]
  },
  {
    id: "TXN-8114",
    merchant: "Ride Share Local Cab",
    amount: 750,
    date: "2026-07-03T08:30:00Z",
    account: "ICICI Platinum Credit Card *4902",
    anomalyType: "None",
    aiScore: 5,
    risk: "Low",
    status: "completed",
    location: "Bengaluru, IN",
    region: "Bengaluru Hub",
    whyFlagged: [],
    behavioralComparison: []
  },
  {
    id: "TXN-8090",
    merchant: "Premium Apparel Brand",
    amount: 22000,
    date: "2026-07-02T13:10:00Z",
    account: "HDFC Savings Account *2819",
    anomalyType: "None",
    aiScore: 24,
    risk: "Low",
    status: "completed",
    location: "Mumbai, IN",
    region: "Mumbai Hub",
    whyFlagged: [],
    behavioralComparison: []
  },
  {
    id: "TXN-7945",
    merchant: "ATM Cash Cashout Express",
    amount: 40000,
    date: "2026-07-02T23:55:00Z",
    account: "HDFC Savings Account *2819",
    anomalyType: "Unusual Time",
    aiScore: 76,
    risk: "Medium",
    status: "completed",
    location: "Hyderabad, IN",
    region: "Hyderabad Hub",
    whyFlagged: [
      { factor: "Unusual Time", weight: 45 },
      { factor: "Location Anomaly", weight: 18 },
      { factor: "Transaction Frequency", weight: 13 }
    ],
    behavioralComparison: [
      { metric: "Cash Withdrawal Hour", historicalAverage: "8 AM - 8 PM", currentTransaction: "11:55 PM" },
      { metric: "Cashout Ratio vs Balance", historicalAverage: "5% daily max", currentTransaction: "28% liquid draw" }
    ]
  },
  {
    id: "TXN-7811",
    merchant: "Local Coffee Brewery",
    amount: 320,
    date: "2026-07-01T09:00:00Z",
    account: "HDFC Savings Account *2819",
    anomalyType: "None",
    aiScore: 2,
    risk: "Low",
    status: "completed",
    location: "Mumbai, IN",
    region: "Mumbai Hub",
    whyFlagged: [],
    behavioralComparison: []
  },
  {
    id: "TXN-7740",
    merchant: "Online Electronics Store India",
    amount: 135000,
    date: "2026-07-01T15:50:00Z",
    account: "SBI Corporate Account *1029",
    anomalyType: "Unusual Amount",
    aiScore: 81,
    risk: "Medium",
    status: "approved",
    location: "Hyderabad, IN",
    region: "Hyderabad Hub",
    whyFlagged: [
      { factor: "Amount Deviation", weight: 40 },
      { factor: "Behavior Deviation", weight: 22 },
      { factor: "New Merchant", weight: 19 }
    ],
    behavioralComparison: [
      { metric: "Bulk Order Ingests", historicalAverage: "₹30,000 average", currentTransaction: "₹1,35,000 order value" },
      { metric: "Shipment Address Delta", historicalAverage: "Bengaluru HQ", currentTransaction: "Third-party shipping warehouse Hyderabad" }
    ]
  }
];
