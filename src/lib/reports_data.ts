// Mock Reports Data for Reports Center & Report Viewer

export interface ReportItem {
  id: string;
  name: string;
  type: "Complete Intelligence" | "Financial Health" | "Credit Risk" | "Fraud" | "Cash Flow";
  generatedDate: string;
  analysisPeriod: string;
  status: "Ready" | "Generating" | "Failed";
  fileSize: string;
  summary: {
    status: string;
    topRisk: string;
    strongestFactor: string;
    topRecommendation: string;
    confidence: string;
  };
  content: {
    executiveSummary: string;
    keyRisks: string;
    financialHealth: string;
    creditAnalysis: string;
    fraudAnalysis: string;
    cashFlowForecast: string;
    aiExplanations: string;
    recommendations: string;
    methodology: string;
  };
}

export const MOCK_REPORTS: ReportItem[] = [
  {
    id: "complete-intelligence",
    name: "Complete Financial Intelligence Report",
    type: "Complete Intelligence",
    generatedDate: "July 8, 2026",
    analysisPeriod: "Q2 2026",
    status: "Ready",
    fileSize: "4.8 MB",
    summary: {
      status: "COMPREHENSIVE AUDIT COMPLETE",
      topRisk: "Debt-to-Income ratio (42%) and revolving utilization (68%)",
      strongestFactor: "Income stability (₹1.2L salary credit velocity) and 100% billing history",
      topRecommendation: "Repay revolving credit card balance below ₹60,000 to drop DTI below 30%",
      confidence: "94.2% overall tree-ensemble confidence index"
    },
    content: {
      executiveSummary: "This Complete Financial Intelligence Report summarizes the Q2 2026 risk profiles of Rahul Chahar. Integrating credit records, transaction logs, anomaly vectors, and time-series projections, our systems evaluated your financial health index at 82/100, default probability at 18%, and cash flow risk as moderate. Immediate debt clearing actions are advised to secure primary grades.",
      keyRisks: "The primary risk vectors reside in credit card utilization rates (active at 68%) and Debt-to-Income (DTI) metrics which have risen to 42%. These factors are responsible for 78% of the risk attribution indicators in classification models.",
      financialHealth: "Your overall financial health rating is 82 (Strong). Liquid reserve buffer ratio is estimated at 2.1 months of overhead expense coverage. Automating savings sweep channels can raise this score to 90+.",
      creditAnalysis: "Credit score is healthy, backed by a 100% billing history. However, active debt ratios limit credit capability indices. The simulated model predicts a 14% drop in default risk if card balances are reduced below ₹60,000.",
      fraudAnalysis: "You have 2 pending transactional location anomaly flags. Both swipes were recorded from a Delhi telecom IP address while client geolocation was registered in Mumbai. Device credentials matched successfully, suggesting remote VPN routing rather than card duplication.",
      cashFlowForecast: "Time-series forecasting models project account balance growth to ₹3,15,000 in 6 months. Average income is stable at ₹1,20,000/mo, offset by average expense outlays of ₹82,000/mo.",
      aiExplanations: "SHAP (Shapley Additive Explanations) attributes the +24% default risk spike directly to debt ratio expansions, offset by a -8% reduction from stable monthly salary deposit streams.",
      recommendations: "1. Pay revolving credit card balances below ₹60,000 immediately.\n2. Establish an automatic emergency savings sweep account.\n3. Verify geolocation credentials for IP anomaly clearances.",
      methodology: "Computed using LightGBM and XGBoost classification ensembles, TreeSHAP Game Theory attribution models, and temporal LSTM networks for cash flow forecast projections."
    }
  },
  {
    id: "credit-risk",
    name: "Credit Risk Assessment Report",
    type: "Credit Risk",
    generatedDate: "July 7, 2026",
    analysisPeriod: "June 2026",
    status: "Ready",
    fileSize: "1.2 MB",
    summary: {
      status: "CREDIT AUDIT COMPLETE",
      topRisk: "Credit card utilization crossing 68%",
      strongestFactor: "Zero late payments or billing history defaults",
      topRecommendation: "Repay outstanding credit card dues before next statement cycle",
      confidence: "96.5% model prediction accuracy index"
    },
    content: {
      executiveSummary: "This Credit Risk Assessment Report provides detailed analysis of your outstanding balances, DTI ratios, and credit risk indicators for June 2026. The objective is to identify potential rating impact variables.",
      keyRisks: "Active revolving utilization stands at 68%, far above the healthy benchmark of 30%. This single factor accounts for the majority of default risk attributions.",
      financialHealth: "While savings metrics remain adequate, the high debt utilization ratio degrades overall financial health capacity and limits credit capabilities.",
      creditAnalysis: "All active loan accounts are fully current with zero delinquencies. Default probability is assessed at 18%, which classifies as low-risk, but displays upward trajectory indicators.",
      fraudAnalysis: "No active fraud alerts or swipe velocity anomalies were detected on card credit lines during this analysis period.",
      cashFlowForecast: "Net cash flows are sufficient to service existing EMI accounts (₹15,000/mo), but additional debt facilities will degrade cash reserves.",
      aiExplanations: "Model attributions indicate credit utilization is the largest driver of risk spikes, while stable salary velocity acts as the primary risk dampener.",
      recommendations: "1. Clear card outstanding balances to drop utilization below 30%.\n2. Do not apply for new revolving line products in the next 90 days.",
      methodology: "Evaluated using XGBoost credit classifier algorithms and TreeSHAP feature weight attributions."
    }
  },
  {
    id: "financial-health",
    name: "Financial Health Report",
    type: "Financial Health",
    generatedDate: "July 5, 2026",
    analysisPeriod: "Q2 2026",
    status: "Ready",
    fileSize: "2.1 MB",
    summary: {
      status: "HEALTH SCORE: 82/100",
      topRisk: "Emergency liquid buffer coverage (2.1 Months)",
      strongestFactor: "Savings rate active at 24.8%",
      topRecommendation: "Set up automated recurring deposits to emergency reserve accounts",
      confidence: "91.8% diagnostic stability"
    },
    content: {
      executiveSummary: "The Q2 2026 Financial Health Report audits the balance sheet strength, savings rate, and reserve buffers of Rahul Chahar. Your score is 82/100, indicating healthy status but with improvement margins in emergency reserve accounts.",
      keyRisks: "Liquid checking reserves cover only 2.1 months of fixed expenses. Model benchmarks recommend 6 months of expense coverage to protect against income disruptions.",
      financialHealth: "Your savings rate of 24.8% is strong. However, low allocation of these savings to liquid reserve sweeps limits emergency buffer accumulation.",
      creditAnalysis: "Debt levels are current but EMI-to-income metrics represent a moderate burden on monthly cash reserves.",
      fraudAnalysis: "No transactional fraud anomalies or account takeover indicators were detected during this financial health audit.",
      cashFlowForecast: "Net surplus is positive at ₹23,000/mo. Allocating ₹15,000/mo to automated reserves sweeps will secure 6 months expense coverage in 10 months.",
      aiExplanations: "Savings velocity is the primary positive weight on your health rating, while low reserve buffer duration represents the primary negative drag.",
      recommendations: "1. Link a high-yield sweep account to checking balance triggers.\n2. Target ₹15,000 monthly automated savings transfers.",
      methodology: "Calculated via multi-variable score indices evaluating liquidity, debt burden, savings rate, and asset allocation parameters."
    }
  },
  {
    id: "fraud-investigation",
    name: "Fraud Investigation Report",
    type: "Fraud",
    generatedDate: "July 3, 2026",
    analysisPeriod: "July 2026",
    status: "Ready",
    fileSize: "850 KB",
    summary: {
      status: "2 PENDING ALERTS RESOLVED",
      topRisk: "IP Geolocation location mismatch (New Delhi)",
      strongestFactor: "Primary registered mobile device confirmation",
      topRecommendation: "Configure local cell tower coordinates verification",
      confidence: "98.9% anomaly classifier index"
    },
    content: {
      executiveSummary: "This Fraud Investigation Report details the investigation of 2 transaction velocity anomalies flagged on July 2, 2026. Credentials verification indicate false alarm flags.",
      keyRisks: "Anomaly indicators triggered due to 5 card sweeps in under 60 seconds from a Delhi telecom IP address. Home city registry is Mumbai.",
      financialHealth: "This security audit does not directly impact credit rating scores or financial asset ratings.",
      creditAnalysis: "Credit lines were temporarily restricted for 5 minutes during alert triggers and restored immediately upon mobile device validation.",
      fraudAnalysis: "The registered smart-device coordinates matched Mumbai logs, indicating the IP anomaly was caused by cellular VPN routing nodes.",
      cashFlowForecast: "No unauthorized funds transfers occurred. Net cash balances are fully secured.",
      aiExplanations: "Isolation Forest models flagged velocity at 98% anomaly threshold. Device credential matches reduced net fraud probability to 4%.",
      recommendations: "1. Approve location-sharing logs for your primary banking app.\n2. Clear Delhi IP flags from trusted terminal devices list.",
      methodology: "Evaluated using Isolation Forest anomaly classifiers and registered device telemetry coordinates validation."
    }
  },
  {
    id: "cash-flow-forecast",
    name: "Cash Flow Forecast Report",
    type: "Cash Flow",
    generatedDate: "June 28, 2026",
    analysisPeriod: "H2 2026",
    status: "Ready",
    fileSize: "3.4 MB",
    summary: {
      status: "LIQUIDITY FORECAST POSITIVE",
      topRisk: "Delayed receivables clearance cycles (45 days)",
      strongestFactor: "Stable monthly salary inflows (₹1.2L)",
      topRecommendation: "Structure invoice clearing incentives for faster deposits",
      confidence: "93.4% time-series bounds accuracy"
    },
    content: {
      executiveSummary: "The H2 2026 Cash Flow Forecast Report projects account cash balances, discretionary expense rates, and liquidity margins for the next six months.",
      keyRisks: "Extended vendor payment clearing cycles (averaging 45 days) represent the primary drag on short-term liquidity buffer metrics.",
      financialHealth: "Stable salary credits maintain cash reserves, but operational margins can be optimized by faster invoice conversions.",
      creditAnalysis: "Monthly EMI commitments are fully covered, but cash surpluses should be maintained above ₹20,000 to protect payment capacities.",
      fraudAnalysis: "No cash outgoings anomalies or unauthorized vendor sweeps were detected.",
      cashFlowForecast: "Checking account balance is projected to rise to ₹3,15,000 by December 2026, assuming stable overhead outgoings of ₹82,000/mo.",
      aiExplanations: "Temporal Fusion Transformer forecasts output high-probability bounds between ₹2,40,000 (lower limit) and ₹3,50,000 (upper limit) by year-end.",
      recommendations: "1. Offer 1.5% discounts for net-15 invoice payments.\n2. Maintain minimum checking buffer levels of ₹40,000.",
      methodology: "Calculated using Temporal Fusion Transformer (TFT) time-series forecasting networks and autoregressive moving averages."
    }
  }
];
