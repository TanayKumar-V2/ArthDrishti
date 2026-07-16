// MLOps Model Drift Monitoring Mock Dataset & Types

export type ModelId = 
  | "all"
  | "credit-risk"
  | "fraud-detection"
  | "financial-health"
  | "cash-flow"
  | "segmentation"
  | "explainability";

export interface ModelOption {
  id: ModelId;
  name: string;
  category: string;
  version: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "all", name: "All Deployed Models", category: "Global", version: "N/A" },
  { id: "credit-risk", name: "Credit Risk Ensemble", category: "Risk", version: "v2.4.1" },
  { id: "fraud-detection", name: "Fraud Autoencoder", category: "Security", version: "v4.1.0" },
  { id: "financial-health", name: "Financial Health Predictor", category: "Analysis", version: "v1.8.3" },
  { id: "cash-flow", name: "Cash Flow Forecast Regressor", category: "Forecasting", version: "v3.2.0" },
  { id: "segmentation", name: "Customer Segmentation", category: "Marketing", version: "v1.2.0" },
  { id: "explainability", name: "Explainability Engine", category: "Compliance", version: "v2.0.2" }
];

export interface KPICardData {
  title: string;
  value: string | number;
  trend: number; // percentage change
  sparkline: number[];
  icon: string;
  status: "success" | "warning" | "destructive" | "info" | "default";
  description: string;
}

export interface DriftOverviewPoint {
  time: string;
  overall: number;
  feature: number;
  prediction: number;
  concept: number;
  psi: number;
  ks: number;
}

export interface FeatureDriftRow {
  name: string;
  trainingMean: number;
  currentMean: number;
  driftScore: number; // PSI score
  importance: number; // 0-100 percentage
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Stable" | "Warning" | "Drifted" | "Critical";
  ksStat: number;
  missingPercentage: number;
}

export interface PredictionDistPoint {
  bin: string;
  baselineDensity: number;
  currentDensity: number;
  probabilityShift: number;
}

export interface ConfidenceDistPoint {
  confidenceRange: string;
  count: number;
  baselineCount: number;
}

export interface DataQualitySummary {
  missingValues: number;
  duplicateRecords: number;
  outliers: number;
  schemaChanges: number;
  nullPercentage: number;
  unexpectedCategories: number;
}

export interface ConceptDriftData {
  time: string;
  historicalAccuracy: number;
  currentAccuracy: number;
  expectedBehavior: number;
  observedBehavior: number;
  conceptStability: number;
}

export interface HeatmapPoint {
  feature: string;
  time: string;
  score: number; // 0 to 1 color intensity
}

export interface ModelHealthStatus {
  currentHealth: "Healthy" | "Degraded" | "Critical";
  lastRetraining: string;
  currentDriftScore: number;
  predictionStability: number; // percentage
  lastEvaluation: string;
}

export interface RetrainingRecommendation {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  confidence: number; // percentage
  reason: string;
  suggestedAction: string;
}

export interface DriftAlert {
  id: string;
  title: string;
  modelName: string;
  severity: "Critical" | "Warning" | "Minor" | "Resolved";
  timestamp: string;
  message: string;
  status: "Active" | "Acknowledged" | "Resolved";
  details: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: "Deployment" | "Baseline" | "MinorDrift" | "Warning" | "CriticalDrift" | "Retraining" | "Recovery";
  description: string;
}

export interface ModelDriftData {
  kpis: KPICardData[];
  overview: Record<string, DriftOverviewPoint[]>; // keys: Today, 7D, 30D, 90D, 1Y
  features: FeatureDriftRow[];
  predictionDistribution: PredictionDistPoint[];
  confidenceDistribution: ConfidenceDistPoint[];
  dataQuality: DataQualitySummary;
  conceptDrift: ConceptDriftData[];
  heatmap: HeatmapPoint[];
  health: ModelHealthStatus;
  recommendations: RetrainingRecommendation[];
  alerts: DriftAlert[];
  timeline: TimelineEvent[];
}

// ==========================================
// MOCK DATA BASE FOR MODELS
// ==========================================

export const MODEL_DRIFT_DB: Record<ModelId, ModelDriftData> = {
  all: {
    kpis: [
      { title: "Models Monitored", value: 6, trend: 20.0, sparkline: [5, 5, 5, 6, 6, 6], icon: "Cpu", status: "info", description: "Active instances running in prod" },
      { title: "Healthy Models", value: 5, trend: 25.0, sparkline: [4, 4, 3, 3, 4, 5], icon: "CheckCircle", status: "success", description: "Models below alert threshold" },
      { title: "Models With Drift", value: 1, trend: -50.0, sparkline: [1, 1, 2, 2, 2, 1], icon: "AlertTriangle", status: "warning", description: "PSI > 0.1 detected" },
      { title: "Critical Alerts", value: 1, trend: 0.0, sparkline: [0, 1, 1, 1, 0, 1], icon: "ShieldAlert", status: "destructive", description: "Immediate retraining recommended" },
      { title: "Average Drift Score", value: 0.078, trend: -5.4, sparkline: [0.088, 0.082, 0.085, 0.082, 0.077, 0.078], icon: "Activity", status: "info", description: "Global average Population Stability Index" },
      { title: "Retraining Recommended", value: 1, trend: -50.0, sparkline: [1, 1, 1, 2, 2, 1], icon: "RefreshCw", status: "warning", description: "Schedules pending update trigger" },
      { title: "Predictions Today", value: "328.4K", trend: 12.3, sparkline: [290, 310, 305, 315, 320, 328], icon: "TrendingUp", status: "info", description: "Aggregated query volume" },
      { title: "Average Stability", value: "95.6%", trend: 1.2, sparkline: [94.4, 94.8, 94.8, 95.1, 95.3, 95.6], icon: "SlidersHorizontal", status: "success", description: "Prediction alignment index" }
    ],
    overview: {
      "Today": [
        { time: "00:00", overall: 0.06, feature: 0.05, prediction: 0.07, concept: 0.06, psi: 0.06, ks: 0.05 },
        { time: "04:00", overall: 0.07, feature: 0.06, prediction: 0.08, concept: 0.07, psi: 0.07, ks: 0.06 },
        { time: "08:00", overall: 0.08, feature: 0.07, prediction: 0.09, concept: 0.08, psi: 0.08, ks: 0.07 },
        { time: "12:00", overall: 0.078, feature: 0.070, prediction: 0.086, concept: 0.078, psi: 0.078, ks: 0.070 }
      ],
      "7 Days": [
        { time: "Jul 08", overall: 0.088, feature: 0.082, prediction: 0.094, concept: 0.088, psi: 0.088, ks: 0.080 },
        { time: "Jul 09", overall: 0.082, feature: 0.076, prediction: 0.088, concept: 0.082, psi: 0.082, ks: 0.074 },
        { time: "Jul 10", overall: 0.085, feature: 0.079, prediction: 0.091, concept: 0.085, psi: 0.085, ks: 0.077 },
        { time: "Jul 11", overall: 0.082, feature: 0.076, prediction: 0.088, concept: 0.082, psi: 0.082, ks: 0.074 },
        { time: "Jul 12", overall: 0.077, feature: 0.071, prediction: 0.083, concept: 0.077, psi: 0.077, ks: 0.069 },
        { time: "Jul 13", overall: 0.077, feature: 0.071, prediction: 0.083, concept: 0.077, psi: 0.077, ks: 0.069 },
        { time: "Jul 14", overall: 0.078, feature: 0.072, prediction: 0.084, concept: 0.078, psi: 0.078, ks: 0.070 }
      ],
      "30 Days": [
        { time: "Wk 1", overall: 0.088, feature: 0.082, prediction: 0.094, concept: 0.088, psi: 0.088, ks: 0.080 },
        { time: "Wk 2", overall: 0.082, feature: 0.076, prediction: 0.088, concept: 0.082, psi: 0.082, ks: 0.074 },
        { time: "Wk 3", overall: 0.085, feature: 0.079, prediction: 0.091, concept: 0.085, psi: 0.085, ks: 0.077 },
        { time: "Wk 4", overall: 0.078, feature: 0.072, prediction: 0.084, concept: 0.078, psi: 0.078, ks: 0.070 }
      ],
      "90 Days": [
        { time: "May", overall: 0.085, feature: 0.079, prediction: 0.091, concept: 0.085, psi: 0.085, ks: 0.077 },
        { time: "Jun", overall: 0.082, feature: 0.076, prediction: 0.088, concept: 0.082, psi: 0.082, ks: 0.074 },
        { time: "Jul", overall: 0.078, feature: 0.072, prediction: 0.084, concept: 0.078, psi: 0.078, ks: 0.070 }
      ],
      "1 Year": [
        { time: "Q3 2025", overall: 0.065, feature: 0.059, prediction: 0.071, concept: 0.065, psi: 0.065, ks: 0.057 },
        { time: "Q4 2025", overall: 0.072, feature: 0.066, prediction: 0.078, concept: 0.072, psi: 0.072, ks: 0.064 },
        { time: "Q1 2026", overall: 0.080, feature: 0.074, prediction: 0.086, concept: 0.080, psi: 0.080, ks: 0.072 },
        { time: "Q2 2026", overall: 0.078, feature: 0.072, prediction: 0.084, concept: 0.078, psi: 0.078, ks: 0.070 }
      ]
    },
    features: [
      { name: "velocity_counter_10m", trainingMean: 1.42, currentMean: 2.85, driftScore: 0.245, importance: 92, severity: "High", status: "Drifted", ksStat: 0.156, missingPercentage: 0.22 },
      { name: "transaction_value_delta", trainingMean: 154.2, currentMean: 198.5, driftScore: 0.124, importance: 85, severity: "Medium", status: "Warning", ksStat: 0.082, missingPercentage: 0.08 },
      { name: "debt_to_income_ratio", trainingMean: 0.32, currentMean: 0.33, driftScore: 0.024, importance: 88, severity: "Low", status: "Stable", ksStat: 0.015, missingPercentage: 0.01 },
      { name: "quick_liquidity_ratio", trainingMean: 1.62, currentMean: 1.48, driftScore: 0.084, importance: 74, severity: "Low", status: "Stable", ksStat: 0.041, missingPercentage: 0.04 },
      { name: "monthly_transaction_freq", trainingMean: 24.5, currentMean: 26.2, driftScore: 0.076, importance: 62, severity: "Low", status: "Stable", ksStat: 0.038, missingPercentage: 0.02 },
      { name: "customer_age_years", trainingMean: 41.2, currentMean: 41.4, driftScore: 0.008, importance: 45, severity: "Low", status: "Stable", ksStat: 0.004, missingPercentage: 0.00 },
      { name: "credit_utilization_ratio", trainingMean: 0.38, currentMean: 0.42, driftScore: 0.105, importance: 79, severity: "Medium", status: "Warning", ksStat: 0.065, missingPercentage: 0.11 }
    ],
    predictionDistribution: [
      { bin: "0.0-0.2", baselineDensity: 45, currentDensity: 38, probabilityShift: -7 },
      { bin: "0.2-0.4", baselineDensity: 25, currentDensity: 23, probabilityShift: -2 },
      { bin: "0.4-0.6", baselineDensity: 15, currentDensity: 18, probabilityShift: 3 },
      { bin: "0.6-0.8", baselineDensity: 10, currentDensity: 14, probabilityShift: 4 },
      { bin: "0.8-1.0", baselineDensity: 5, currentDensity: 7, probabilityShift: 2 }
    ],
    confidenceDistribution: [
      { confidenceRange: "90-100%", count: 1840, baselineCount: 2150 },
      { confidenceRange: "80-90%", count: 850, baselineCount: 720 },
      { confidenceRange: "70-80%", count: 320, baselineCount: 210 },
      { confidenceRange: "60-70%", count: 140, baselineCount: 90 },
      { confidenceRange: "<60%", count: 50, baselineCount: 30 }
    ],
    dataQuality: {
      missingValues: 1024,
      duplicateRecords: 45,
      outliers: 188,
      schemaChanges: 1,
      nullPercentage: 1.45,
      unexpectedCategories: 12
    },
    conceptDrift: [
      { time: "Wk 1", historicalAccuracy: 95.8, currentAccuracy: 95.6, expectedBehavior: 95.8, observedBehavior: 95.6, conceptStability: 99.8 },
      { time: "Wk 2", historicalAccuracy: 95.8, currentAccuracy: 94.9, expectedBehavior: 95.8, observedBehavior: 94.9, conceptStability: 99.1 },
      { time: "Wk 3", historicalAccuracy: 95.8, currentAccuracy: 93.4, expectedBehavior: 95.8, observedBehavior: 93.4, conceptStability: 97.5 },
      { time: "Wk 4", historicalAccuracy: 95.8, currentAccuracy: 95.6, expectedBehavior: 95.8, observedBehavior: 95.6, conceptStability: 99.8 }
    ],
    heatmap: [
      { feature: "velocity_counter_10m", time: "Jul 10", score: 0.8 },
      { feature: "velocity_counter_10m", time: "Jul 11", score: 0.9 },
      { feature: "velocity_counter_10m", time: "Jul 12", score: 0.85 },
      { feature: "velocity_counter_10m", time: "Jul 13", score: 0.92 },
      { feature: "velocity_counter_10m", time: "Jul 14", score: 0.95 },
      { feature: "transaction_value_delta", time: "Jul 10", score: 0.3 },
      { feature: "transaction_value_delta", time: "Jul 11", score: 0.45 },
      { feature: "transaction_value_delta", time: "Jul 12", score: 0.5 },
      { feature: "transaction_value_delta", time: "Jul 13", score: 0.55 },
      { feature: "transaction_value_delta", time: "Jul 14", score: 0.58 },
      { feature: "debt_to_income_ratio", time: "Jul 10", score: 0.1 },
      { feature: "debt_to_income_ratio", time: "Jul 11", score: 0.12 },
      { feature: "debt_to_income_ratio", time: "Jul 12", score: 0.11 },
      { feature: "debt_to_income_ratio", time: "Jul 13", score: 0.13 },
      { feature: "debt_to_income_ratio", time: "Jul 14", score: 0.11 },
      { feature: "quick_liquidity_ratio", time: "Jul 10", score: 0.2 },
      { feature: "quick_liquidity_ratio", time: "Jul 11", score: 0.25 },
      { feature: "quick_liquidity_ratio", time: "Jul 12", score: 0.35 },
      { feature: "quick_liquidity_ratio", time: "Jul 13", score: 0.4 },
      { feature: "quick_liquidity_ratio", time: "Jul 14", score: 0.42 }
    ],
    health: {
      currentHealth: "Degraded",
      lastRetraining: "2026-06-12",
      currentDriftScore: 0.078,
      predictionStability: 95.6,
      lastEvaluation: "2026-07-14 18:30"
    },
    recommendations: [
      { id: "R-1", title: "Retrain Fraud Autoencoder", priority: "High", confidence: 94.5, reason: "Velocity counter features have drifted drastically (PSI 0.245), degrading reconstruction confidence.", suggestedAction: "Initiate pipeline trigger with July transaction records batch." },
      { id: "R-2", title: "Monitor Credit utilization feature", priority: "Medium", confidence: 78.0, reason: "Feature credit_utilization_ratio has warning status (PSI 0.105) for 5 consecutive days.", suggestedAction: "Investigate if macroeconomic shift or client acquisition bias is responsible." }
    ],
    alerts: [
      { id: "AL-1", title: "Critical Feature Drift detected", modelName: "Fraud Autoencoder", severity: "Critical", timestamp: "2026-07-14 16:45:00", message: "Feature 'velocity_counter_10m' has drifted past Critical Threshold (PSI 0.245 > 0.200).", status: "Active", details: "Short-interval velocity patterns in transactions indicate rapid cluster divergence from baseline training sets." },
      { id: "AL-2", title: "Feature Drift warning", modelName: "Credit Risk Ensemble", severity: "Warning", timestamp: "2026-07-14 12:30:00", message: "Feature 'credit_utilization_ratio' has breached warning limits (PSI 0.105 > 0.100).", status: "Active", details: "Average client utilization has risen. Re-evaluating risk exposure levels is recommended." }
    ],
    timeline: [
      { id: "TL-1", title: "Model Deployed", date: "2026-06-12", type: "Deployment", description: "Version v4.1.0 promoted to production cluster." },
      { id: "TL-2", title: "Baseline Established", date: "2026-06-13", type: "Baseline", description: "Reference dataset mapped with 1.2M historical samples." },
      { id: "TL-3", title: "Minor Drift Detected", date: "2026-07-02", type: "MinorDrift", description: "Slow divergence in liquidity markers detected." },
      { id: "TL-4", title: "Warning Breached", date: "2026-07-08", type: "Warning", description: "Transaction value delta exceeded the 0.10 PSI threshold." },
      { id: "TL-5", title: "Critical Drift Breach", date: "2026-07-14", type: "CriticalDrift", description: "Velocity counter drifted past 0.2 PSI threshold." }
    ]
  },
  "credit-risk": {
    kpis: [
      { title: "Models Monitored", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "Cpu", status: "info", description: "Credit Risk Ensemble instances" },
      { title: "Healthy Models", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "CheckCircle", status: "success", description: "Model below alert threshold" },
      { title: "Models With Drift", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "AlertTriangle", status: "success", description: "PSI < 0.1 detected" },
      { title: "Critical Alerts", value: 0, trend: -100.0, sparkline: [1, 0, 0, 0, 0, 0], icon: "ShieldAlert", status: "success", description: "No active critical issues" },
      { title: "Average Drift Score", value: 0.042, trend: -3.5, sparkline: [0.045, 0.044, 0.043, 0.042, 0.042, 0.042], icon: "Activity", status: "success", description: "Population Stability Index" },
      { title: "Retraining Recommended", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "RefreshCw", status: "success", description: "Model parameters stable" },
      { title: "Predictions Today", value: "84.2K", trend: 5.6, sparkline: [78, 80, 81, 82, 83, 84], icon: "TrendingUp", status: "info", description: "Active query volume" },
      { title: "Average Stability", value: "98.1%", trend: 0.4, sparkline: [97.5, 97.8, 97.9, 98.0, 98.1, 98.1], icon: "SlidersHorizontal", status: "success", description: "Prediction alignment index" }
    ],
    overview: {
      "Today": [
        { time: "00:00", overall: 0.038, feature: 0.035, prediction: 0.040, concept: 0.038, psi: 0.038, ks: 0.032 },
        { time: "04:00", overall: 0.040, feature: 0.037, prediction: 0.042, concept: 0.040, psi: 0.040, ks: 0.034 },
        { time: "08:00", overall: 0.042, feature: 0.039, prediction: 0.044, concept: 0.042, psi: 0.042, ks: 0.036 },
        { time: "12:00", overall: 0.041, feature: 0.038, prediction: 0.043, concept: 0.041, psi: 0.041, ks: 0.035 }
      ],
      "7 Days": [
        { time: "Jul 08", overall: 0.045, feature: 0.042, prediction: 0.048, concept: 0.045, psi: 0.045, ks: 0.039 },
        { time: "Jul 09", overall: 0.044, feature: 0.041, prediction: 0.047, concept: 0.044, psi: 0.044, ks: 0.038 },
        { time: "Jul 10", overall: 0.043, feature: 0.040, prediction: 0.046, concept: 0.043, psi: 0.043, ks: 0.037 },
        { time: "Jul 11", overall: 0.042, feature: 0.039, prediction: 0.045, concept: 0.042, psi: 0.042, ks: 0.036 },
        { time: "Jul 12", overall: 0.042, feature: 0.039, prediction: 0.044, concept: 0.042, psi: 0.042, ks: 0.036 },
        { time: "Jul 13", overall: 0.042, feature: 0.039, prediction: 0.045, concept: 0.042, psi: 0.042, ks: 0.036 },
        { time: "Jul 14", overall: 0.042, feature: 0.039, prediction: 0.044, concept: 0.042, psi: 0.042, ks: 0.035 }
      ],
      "30 Days": [
        { time: "Wk 1", overall: 0.048, feature: 0.045, prediction: 0.052, concept: 0.048, psi: 0.048, ks: 0.042 },
        { time: "Wk 2", overall: 0.046, feature: 0.043, prediction: 0.050, concept: 0.046, psi: 0.046, ks: 0.040 },
        { time: "Wk 3", overall: 0.044, feature: 0.041, prediction: 0.048, concept: 0.044, psi: 0.044, ks: 0.038 },
        { time: "Wk 4", overall: 0.042, feature: 0.039, prediction: 0.045, concept: 0.042, psi: 0.042, ks: 0.036 }
      ],
      "90 Days": [
        { time: "May", overall: 0.052, feature: 0.049, prediction: 0.056, concept: 0.052, psi: 0.052, ks: 0.046 },
        { time: "Jun", overall: 0.047, feature: 0.044, prediction: 0.051, concept: 0.047, psi: 0.047, ks: 0.041 },
        { time: "Jul", overall: 0.042, feature: 0.039, prediction: 0.045, concept: 0.042, psi: 0.042, ks: 0.036 }
      ],
      "1 Year": [
        { time: "Q3 2025", overall: 0.035, feature: 0.032, prediction: 0.038, concept: 0.035, psi: 0.035, ks: 0.030 },
        { time: "Q4 2025", overall: 0.040, feature: 0.037, prediction: 0.043, concept: 0.040, psi: 0.040, ks: 0.035 },
        { time: "Q1 2026", overall: 0.048, feature: 0.045, prediction: 0.052, concept: 0.048, psi: 0.048, ks: 0.042 },
        { time: "Q2 2026", overall: 0.042, feature: 0.039, prediction: 0.045, concept: 0.042, psi: 0.042, ks: 0.036 }
      ]
    },
    features: [
      { name: "debt_to_income_ratio", trainingMean: 0.32, currentMean: 0.33, driftScore: 0.024, importance: 95, severity: "Low", status: "Stable", ksStat: 0.015, missingPercentage: 0.01 },
      { name: "quick_liquidity_ratio", trainingMean: 1.62, currentMean: 1.58, driftScore: 0.038, importance: 88, severity: "Low", status: "Stable", ksStat: 0.021, missingPercentage: 0.02 },
      { name: "monthly_transaction_freq", trainingMean: 24.5, currentMean: 25.1, driftScore: 0.018, importance: 74, severity: "Low", status: "Stable", ksStat: 0.009, missingPercentage: 0.01 },
      { name: "customer_age_years", trainingMean: 41.2, currentMean: 41.3, driftScore: 0.005, importance: 62, severity: "Low", status: "Stable", ksStat: 0.002, missingPercentage: 0.0 }
    ],
    predictionDistribution: [
      { bin: "0.0-0.2", baselineDensity: 88, currentDensity: 87, probabilityShift: -1 },
      { bin: "0.2-0.4", baselineDensity: 8, currentDensity: 8.5, probabilityShift: 0.5 },
      { bin: "0.4-0.6", baselineDensity: 2.5, currentDensity: 3, probabilityShift: 0.5 },
      { bin: "0.6-0.8", baselineDensity: 1.0, currentDensity: 1.1, probabilityShift: 0.1 },
      { bin: "0.8-1.0", baselineDensity: 0.5, currentDensity: 0.4, probabilityShift: -0.1 }
    ],
    confidenceDistribution: [
      { confidenceRange: "90-100%", count: 4890, baselineCount: 4850 },
      { confidenceRange: "80-90%", count: 120, baselineCount: 130 },
      { confidenceRange: "70-80%", count: 40, baselineCount: 45 },
      { confidenceRange: "60-70%", count: 15, baselineCount: 15 },
      { confidenceRange: "<60%", count: 5, baselineCount: 5 }
    ],
    dataQuality: {
      missingValues: 122,
      duplicateRecords: 3,
      outliers: 22,
      schemaChanges: 0,
      nullPercentage: 0.15,
      unexpectedCategories: 1
    },
    conceptDrift: [
      { time: "Wk 1", historicalAccuracy: 98.4, currentAccuracy: 98.4, expectedBehavior: 98.4, observedBehavior: 98.4, conceptStability: 100.0 },
      { time: "Wk 2", historicalAccuracy: 98.4, currentAccuracy: 98.3, expectedBehavior: 98.4, observedBehavior: 98.3, conceptStability: 99.9 },
      { time: "Wk 3", historicalAccuracy: 98.4, currentAccuracy: 98.4, expectedBehavior: 98.4, observedBehavior: 98.4, conceptStability: 100.0 },
      { time: "Wk 4", historicalAccuracy: 98.4, currentAccuracy: 98.4, expectedBehavior: 98.4, observedBehavior: 98.4, conceptStability: 100.0 }
    ],
    heatmap: [
      { feature: "debt_to_income_ratio", time: "Jul 10", score: 0.12 },
      { feature: "debt_to_income_ratio", time: "Jul 11", score: 0.11 },
      { feature: "debt_to_income_ratio", time: "Jul 12", score: 0.13 },
      { feature: "debt_to_income_ratio", time: "Jul 13", score: 0.12 },
      { feature: "debt_to_income_ratio", time: "Jul 14", score: 0.11 },
      { feature: "quick_liquidity_ratio", time: "Jul 10", score: 0.18 },
      { feature: "quick_liquidity_ratio", time: "Jul 11", score: 0.20 },
      { feature: "quick_liquidity_ratio", time: "Jul 12", score: 0.19 },
      { feature: "quick_liquidity_ratio", time: "Jul 13", score: 0.21 },
      { feature: "quick_liquidity_ratio", time: "Jul 14", score: 0.22 }
    ],
    health: {
      currentHealth: "Healthy",
      lastRetraining: "2026-06-01",
      currentDriftScore: 0.042,
      predictionStability: 98.1,
      lastEvaluation: "2026-07-14 18:30"
    },
    recommendations: [
      { id: "R-3", title: "Stable Model Parameters", priority: "Low", confidence: 99.2, reason: "All feature checks (DTI, Liquidity) remain comfortably within acceptable baseline boundaries.", suggestedAction: "Continue standard daily validation runs." }
    ],
    alerts: [],
    timeline: [
      { id: "TL-6", title: "Model Deployed", date: "2026-06-01", type: "Deployment", description: "Version v2.4.1 promoted to production cluster." },
      { id: "TL-7", title: "Baseline Established", date: "2026-06-02", type: "Baseline", description: "Reference dataset mapped with 3.5M records." }
    ]
  },
  "fraud-detection": {
    kpis: [
      { title: "Models Monitored", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "Cpu", status: "info", description: "Fraud Autoencoder instances" },
      { title: "Healthy Models", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "CheckCircle", status: "destructive", description: "Model requires critical update" },
      { title: "Models With Drift", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "AlertTriangle", status: "destructive", description: "PSI > 0.2 detected" },
      { title: "Critical Alerts", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "ShieldAlert", status: "destructive", description: "Immediate retraining recommended" },
      { title: "Average Drift Score", value: 0.245, trend: 15.4, sparkline: [0.18, 0.20, 0.22, 0.25, 0.24, 0.245], icon: "Activity", status: "destructive", description: "Population Stability Index" },
      { title: "Retraining Recommended", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "RefreshCw", status: "destructive", description: "Execution trigger active" },
      { title: "Predictions Today", value: "244.2K", trend: 15.6, sparkline: [210, 220, 230, 235, 240, 244], icon: "TrendingUp", status: "info", description: "Active query volume" },
      { title: "Average Stability", value: "90.3%", trend: -2.8, sparkline: [93.1, 92.5, 91.9, 90.8, 90.1, 90.3], icon: "SlidersHorizontal", status: "destructive", description: "Prediction alignment index" }
    ],
    overview: {
      "Today": [
        { time: "00:00", overall: 0.22, feature: 0.20, prediction: 0.24, concept: 0.22, psi: 0.22, ks: 0.14 },
        { time: "04:00", overall: 0.23, feature: 0.21, prediction: 0.25, concept: 0.23, psi: 0.23, ks: 0.15 },
        { time: "08:00", overall: 0.25, feature: 0.23, prediction: 0.27, concept: 0.25, psi: 0.25, ks: 0.16 },
        { time: "12:00", overall: 0.245, feature: 0.225, prediction: 0.265, concept: 0.245, psi: 0.245, ks: 0.156 }
      ],
      "7 Days": [
        { time: "Jul 08", overall: 0.185, feature: 0.165, prediction: 0.205, concept: 0.185, psi: 0.185, ks: 0.125 },
        { time: "Jul 09", overall: 0.202, feature: 0.182, prediction: 0.222, concept: 0.202, psi: 0.202, ks: 0.134 },
        { time: "Jul 10", overall: 0.221, feature: 0.201, prediction: 0.241, concept: 0.221, psi: 0.221, ks: 0.145 },
        { time: "Jul 11", overall: 0.254, feature: 0.234, prediction: 0.274, concept: 0.254, psi: 0.254, ks: 0.162 },
        { time: "Jul 12", overall: 0.241, feature: 0.221, prediction: 0.261, concept: 0.241, psi: 0.241, ks: 0.155 },
        { time: "Jul 13", overall: 0.243, feature: 0.223, prediction: 0.263, concept: 0.243, psi: 0.243, ks: 0.154 },
        { time: "Jul 14", overall: 0.245, feature: 0.225, prediction: 0.265, concept: 0.245, psi: 0.245, ks: 0.156 }
      ],
      "30 Days": [
        { time: "Wk 1", overall: 0.152, feature: 0.132, prediction: 0.172, concept: 0.152, psi: 0.152, ks: 0.098 },
        { time: "Wk 2", overall: 0.175, feature: 0.155, prediction: 0.195, concept: 0.175, psi: 0.175, ks: 0.114 },
        { time: "Wk 3", overall: 0.218, feature: 0.198, prediction: 0.238, concept: 0.218, psi: 0.218, ks: 0.139 },
        { time: "Wk 4", overall: 0.245, feature: 0.225, prediction: 0.265, concept: 0.245, psi: 0.245, ks: 0.156 }
      ],
      "90 Days": [
        { time: "May", overall: 0.092, feature: 0.072, prediction: 0.112, concept: 0.092, psi: 0.092, ks: 0.058 },
        { time: "Jun", overall: 0.165, feature: 0.145, prediction: 0.185, concept: 0.165, psi: 0.165, ks: 0.106 },
        { time: "Jul", overall: 0.245, feature: 0.225, prediction: 0.265, concept: 0.245, psi: 0.245, ks: 0.156 }
      ],
      "1 Year": [
        { time: "Q3 2025", overall: 0.048, feature: 0.038, prediction: 0.058, concept: 0.048, psi: 0.048, ks: 0.032 },
        { time: "Q4 2025", overall: 0.055, feature: 0.045, prediction: 0.065, concept: 0.055, psi: 0.055, ks: 0.036 },
        { time: "Q1 2026", overall: 0.112, feature: 0.092, prediction: 0.132, concept: 0.112, psi: 0.112, ks: 0.074 },
        { time: "Q2 2026", overall: 0.245, feature: 0.225, prediction: 0.265, concept: 0.245, psi: 0.245, ks: 0.156 }
      ]
    },
    features: [
      { name: "velocity_counter_10m", trainingMean: 1.42, currentMean: 2.85, driftScore: 0.245, importance: 92, severity: "High", status: "Drifted", ksStat: 0.156, missingPercentage: 0.22 },
      { name: "transaction_value_delta", trainingMean: 154.2, currentMean: 198.5, driftScore: 0.124, importance: 85, severity: "Medium", status: "Warning", ksStat: 0.082, missingPercentage: 0.08 }
    ],
    predictionDistribution: [
      { bin: "0.0-0.2", baselineDensity: 82, currentDensity: 65, probabilityShift: -17 },
      { bin: "0.2-0.4", baselineDensity: 12, currentDensity: 15, probabilityShift: 3 },
      { bin: "0.4-0.6", baselineDensity: 4, currentDensity: 10, probabilityShift: 6 },
      { bin: "0.6-0.8", baselineDensity: 1.5, currentDensity: 7, probabilityShift: 5.5 },
      { bin: "0.8-1.0", baselineDensity: 0.5, currentDensity: 3, probabilityShift: 2.5 }
    ],
    confidenceDistribution: [
      { confidenceRange: "90-100%", count: 1240, baselineCount: 1850 },
      { confidenceRange: "80-90%", count: 680, baselineCount: 420 },
      { confidenceRange: "70-80%", count: 350, baselineCount: 110 },
      { confidenceRange: "60-70%", count: 120, baselineCount: 40 },
      { confidenceRange: "<60%", count: 60, baselineCount: 15 }
    ],
    dataQuality: {
      missingValues: 902,
      duplicateRecords: 42,
      outliers: 166,
      schemaChanges: 1,
      nullPercentage: 2.75,
      unexpectedCategories: 11
    },
    conceptDrift: [
      { time: "Wk 1", historicalAccuracy: 95.8, currentAccuracy: 95.6, expectedBehavior: 95.8, observedBehavior: 95.6, conceptStability: 99.8 },
      { time: "Wk 2", historicalAccuracy: 95.8, currentAccuracy: 94.9, expectedBehavior: 95.8, observedBehavior: 94.9, conceptStability: 99.1 },
      { time: "Wk 3", historicalAccuracy: 95.8, currentAccuracy: 93.4, expectedBehavior: 95.8, observedBehavior: 93.4, conceptStability: 97.5 },
      { time: "Wk 4", historicalAccuracy: 95.8, currentAccuracy: 90.3, expectedBehavior: 95.8, observedBehavior: 90.3, conceptStability: 94.2 }
    ],
    heatmap: [
      { feature: "velocity_counter_10m", time: "Jul 10", score: 0.8 },
      { feature: "velocity_counter_10m", time: "Jul 11", score: 0.9 },
      { feature: "velocity_counter_10m", time: "Jul 12", score: 0.85 },
      { feature: "velocity_counter_10m", time: "Jul 13", score: 0.92 },
      { feature: "velocity_counter_10m", time: "Jul 14", score: 0.95 },
      { feature: "transaction_value_delta", time: "Jul 10", score: 0.3 },
      { feature: "transaction_value_delta", time: "Jul 11", score: 0.45 },
      { feature: "transaction_value_delta", time: "Jul 12", score: 0.5 },
      { feature: "transaction_value_delta", time: "Jul 13", score: 0.55 },
      { feature: "transaction_value_delta", time: "Jul 14", score: 0.58 }
    ],
    health: {
      currentHealth: "Degraded",
      lastRetraining: "2026-06-12",
      currentDriftScore: 0.245,
      predictionStability: 90.3,
      lastEvaluation: "2026-07-14 18:30"
    },
    recommendations: [
      { id: "R-1", title: "Retrain Fraud Autoencoder", priority: "High", confidence: 94.5, reason: "Velocity counter features have drifted drastically (PSI 0.245), degrading reconstruction confidence.", suggestedAction: "Initiate pipeline trigger with July transaction records batch." }
    ],
    alerts: [
      { id: "AL-1", title: "Critical Feature Drift detected", modelName: "Fraud Autoencoder", severity: "Critical", timestamp: "2026-07-14 16:45:00", message: "Feature 'velocity_counter_10m' has drifted past Critical Threshold (PSI 0.245 > 0.200).", status: "Active", details: "Short-interval velocity patterns in transactions indicate rapid cluster divergence from baseline training sets." }
    ],
    timeline: [
      { id: "TL-1", title: "Model Deployed", date: "2026-06-12", type: "Deployment", description: "Version v4.1.0 promoted to production cluster." },
      { id: "TL-2", title: "Baseline Established", date: "2026-06-13", type: "Baseline", description: "Reference dataset mapped with 1.2M historical samples." },
      { id: "TL-3", title: "Minor Drift Detected", date: "2026-07-02", type: "MinorDrift", description: "Slow divergence in liquidity markers detected." },
      { id: "TL-4", title: "Warning Breached", date: "2026-07-08", type: "Warning", description: "Transaction value delta exceeded the 0.10 PSI threshold." },
      { id: "TL-5", title: "Critical Drift Breach", date: "2026-07-14", type: "CriticalDrift", description: "Velocity counter drifted past 0.2 PSI threshold." }
    ]
  },
  "financial-health": {
    kpis: [
      { title: "Models Monitored", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "Cpu", status: "info", description: "Financial Health Predictor" },
      { title: "Healthy Models", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "CheckCircle", status: "success", description: "Model below alert threshold" },
      { title: "Models With Drift", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "AlertTriangle", status: "success", description: "PSI < 0.1 detected" },
      { title: "Critical Alerts", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "ShieldAlert", status: "success", description: "No active critical issues" },
      { title: "Average Drift Score", value: 0.034, trend: -1.2, sparkline: [0.036, 0.035, 0.035, 0.034, 0.034, 0.034], icon: "Activity", status: "success", description: "Population Stability Index" },
      { title: "Retraining Recommended", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "RefreshCw", status: "success", description: "Model parameters stable" },
      { title: "Predictions Today", value: "32.1K", trend: 2.1, sparkline: [30, 31, 31, 32, 32, 32], icon: "TrendingUp", status: "info", description: "Active query volume" },
      { title: "Average Stability", value: "97.4%", trend: 0.1, sparkline: [97.2, 97.3, 97.4, 97.4, 97.4, 97.4], icon: "SlidersHorizontal", status: "success", description: "Prediction alignment index" }
    ],
    overview: {
      "Today": [
        { time: "00:00", overall: 0.032, feature: 0.030, prediction: 0.035, concept: 0.032, psi: 0.032, ks: 0.028 },
        { time: "12:00", overall: 0.034, feature: 0.032, prediction: 0.036, concept: 0.034, psi: 0.034, ks: 0.030 }
      ],
      "7 Days": [
        { time: "Jul 08", overall: 0.036, feature: 0.034, prediction: 0.038, concept: 0.036, psi: 0.036, ks: 0.031 },
        { time: "Jul 14", overall: 0.034, feature: 0.032, prediction: 0.036, concept: 0.034, psi: 0.034, ks: 0.030 }
      ],
      "30 Days": [
        { time: "Wk 1", overall: 0.038, feature: 0.035, prediction: 0.041, concept: 0.038, psi: 0.038, ks: 0.033 },
        { time: "Wk 4", overall: 0.034, feature: 0.032, prediction: 0.036, concept: 0.034, psi: 0.034, ks: 0.030 }
      ],
      "90 Days": [
        { time: "May", overall: 0.040, feature: 0.037, prediction: 0.043, concept: 0.040, psi: 0.040, ks: 0.035 },
        { time: "Jul", overall: 0.034, feature: 0.032, prediction: 0.036, concept: 0.034, psi: 0.034, ks: 0.030 }
      ],
      "1 Year": [
        { time: "Q1 2026", overall: 0.042, feature: 0.039, prediction: 0.045, concept: 0.042, psi: 0.042, ks: 0.037 },
        { time: "Q2 2026", overall: 0.034, feature: 0.032, prediction: 0.036, concept: 0.034, psi: 0.034, ks: 0.030 }
      ]
    },
    features: [
      { name: "savings_ratio", trainingMean: 0.18, currentMean: 0.19, driftScore: 0.015, importance: 90, severity: "Low", status: "Stable", ksStat: 0.010, missingPercentage: 0.0 },
      { name: "expense_variance", trainingMean: 320.5, currentMean: 318.0, driftScore: 0.021, importance: 82, severity: "Low", status: "Stable", ksStat: 0.012, missingPercentage: 0.02 }
    ],
    predictionDistribution: [
      { bin: "0.0-0.2", baselineDensity: 12, currentDensity: 11, probabilityShift: -1 },
      { bin: "0.2-0.4", baselineDensity: 28, currentDensity: 28.5, probabilityShift: 0.5 },
      { bin: "0.4-0.6", baselineDensity: 40, currentDensity: 41, probabilityShift: 1 },
      { bin: "0.6-0.8", baselineDensity: 15, currentDensity: 14.5, probabilityShift: -0.5 },
      { bin: "0.8-1.0", baselineDensity: 5, currentDensity: 5, probabilityShift: 0 }
    ],
    confidenceDistribution: [
      { confidenceRange: "90-100%", count: 2800, baselineCount: 2780 },
      { confidenceRange: "80-90%", count: 180, baselineCount: 200 }
    ],
    dataQuality: {
      missingValues: 18,
      duplicateRecords: 0,
      outliers: 5,
      schemaChanges: 0,
      nullPercentage: 0.05,
      unexpectedCategories: 0
    },
    conceptDrift: [
      { time: "Wk 1", historicalAccuracy: 96.5, currentAccuracy: 96.5, expectedBehavior: 96.5, observedBehavior: 96.5, conceptStability: 100.0 },
      { time: "Wk 4", historicalAccuracy: 96.5, currentAccuracy: 96.4, expectedBehavior: 96.5, observedBehavior: 96.4, conceptStability: 99.9 }
    ],
    heatmap: [
      { feature: "savings_ratio", time: "Jul 14", score: 0.05 },
      { feature: "expense_variance", time: "Jul 14", score: 0.08 }
    ],
    health: {
      currentHealth: "Healthy",
      lastRetraining: "2026-05-15",
      currentDriftScore: 0.034,
      predictionStability: 97.4,
      lastEvaluation: "2026-07-14 18:30"
    },
    recommendations: [
      { id: "R-4", title: "Stable Model", priority: "Low", confidence: 98.5, reason: "Financial Health Predictor indicators show high stability indexes.", suggestedAction: "No retraining required." }
    ],
    alerts: [],
    timeline: [
      { id: "TL-8", title: "Model Deployed", date: "2026-05-15", type: "Deployment", description: "Version v1.8.3 promoted to production." }
    ]
  },
  "cash-flow": {
    kpis: [
      { title: "Models Monitored", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "Cpu", status: "info", description: "Cash Flow Forecast Regressor" },
      { title: "Healthy Models", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "CheckCircle", status: "success", description: "Model below alert threshold" },
      { title: "Models With Drift", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "AlertTriangle", status: "success", description: "PSI < 0.1 detected" },
      { title: "Critical Alerts", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "ShieldAlert", status: "success", description: "No active critical issues" },
      { title: "Average Drift Score", value: 0.055, trend: 2.1, sparkline: [0.052, 0.053, 0.055, 0.054, 0.054, 0.055], icon: "Activity", status: "success", description: "Population Stability Index" },
      { title: "Retraining Recommended", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "RefreshCw", status: "success", description: "Model parameters stable" },
      { title: "Predictions Today", value: "11.2K", trend: 8.4, sparkline: [9.5, 10.1, 10.4, 10.8, 11.0, 11.2], icon: "TrendingUp", status: "info", description: "Active query volume" },
      { title: "Average Stability", value: "96.5%", trend: 0.2, sparkline: [96.0, 96.2, 96.3, 96.5, 96.5, 96.5], icon: "SlidersHorizontal", status: "success", description: "Prediction alignment index" }
    ],
    overview: {
      "Today": [
        { time: "00:00", overall: 0.052, feature: 0.048, prediction: 0.055, concept: 0.052, psi: 0.052, ks: 0.042 },
        { time: "12:00", overall: 0.055, feature: 0.051, prediction: 0.058, concept: 0.055, psi: 0.055, ks: 0.044 }
      ],
      "7 Days": [
        { time: "Jul 08", overall: 0.052, feature: 0.049, prediction: 0.055, concept: 0.052, psi: 0.052, ks: 0.041 },
        { time: "Jul 14", overall: 0.055, feature: 0.052, prediction: 0.058, concept: 0.055, psi: 0.055, ks: 0.044 }
      ],
      "30 Days": [
        { time: "Wk 1", overall: 0.056, feature: 0.053, prediction: 0.059, concept: 0.056, psi: 0.056, ks: 0.045 },
        { time: "Wk 4", overall: 0.055, feature: 0.052, prediction: 0.058, concept: 0.055, psi: 0.055, ks: 0.044 }
      ],
      "90 Days": [
        { time: "May", overall: 0.058, feature: 0.055, prediction: 0.061, concept: 0.058, psi: 0.058, ks: 0.047 },
        { time: "Jul", overall: 0.055, feature: 0.052, prediction: 0.058, concept: 0.055, psi: 0.055, ks: 0.044 }
      ],
      "1 Year": [
        { time: "Q1 2026", overall: 0.062, feature: 0.059, prediction: 0.065, concept: 0.062, psi: 0.062, ks: 0.050 },
        { time: "Q2 2026", overall: 0.055, feature: 0.052, prediction: 0.058, concept: 0.055, psi: 0.055, ks: 0.044 }
      ]
    },
    features: [
      { name: "seasonal_revenue", trainingMean: 10450.0, currentMean: 10600.0, driftScore: 0.048, importance: 94, severity: "Low", status: "Stable", ksStat: 0.035, missingPercentage: 0.0 },
      { name: "outflow_coefficient", trainingMean: 0.72, currentMean: 0.74, driftScore: 0.062, importance: 88, severity: "Low", status: "Stable", ksStat: 0.042, missingPercentage: 0.05 }
    ],
    predictionDistribution: [
      { bin: "0.0-0.2", baselineDensity: 5, currentDensity: 4, probabilityShift: -1 },
      { bin: "0.2-0.4", baselineDensity: 15, currentDensity: 16, probabilityShift: 1 },
      { bin: "0.4-0.6", baselineDensity: 30, currentDensity: 29, probabilityShift: -1 },
      { bin: "0.6-0.8", baselineDensity: 35, currentDensity: 36, probabilityShift: 1 },
      { bin: "0.8-1.0", baselineDensity: 15, currentDensity: 15, probabilityShift: 0 }
    ],
    confidenceDistribution: [
      { confidenceRange: "90-100%", count: 980, baselineCount: 960 },
      { confidenceRange: "80-90%", count: 120, baselineCount: 130 }
    ],
    dataQuality: {
      missingValues: 54,
      duplicateRecords: 1,
      outliers: 12,
      schemaChanges: 0,
      nullPercentage: 0.22,
      unexpectedCategories: 0
    },
    conceptDrift: [
      { time: "Wk 1", historicalAccuracy: 94.2, currentAccuracy: 94.1, expectedBehavior: 94.2, observedBehavior: 94.1, conceptStability: 99.8 },
      { time: "Wk 4", historicalAccuracy: 94.2, currentAccuracy: 94.3, expectedBehavior: 94.2, observedBehavior: 94.3, conceptStability: 100.0 }
    ],
    heatmap: [
      { feature: "seasonal_revenue", time: "Jul 14", score: 0.12 },
      { feature: "outflow_coefficient", time: "Jul 14", score: 0.18 }
    ],
    health: {
      currentHealth: "Healthy",
      lastRetraining: "2026-04-10",
      currentDriftScore: 0.055,
      predictionStability: 96.5,
      lastEvaluation: "2026-07-14 18:30"
    },
    recommendations: [
      { id: "R-5", title: "Stable Model", priority: "Low", confidence: 97.4, reason: "Cash flow prediction models display historical and actual alignment.", suggestedAction: "Maintain monthly checks." }
    ],
    alerts: [],
    timeline: [
      { id: "TL-9", title: "Model Deployed", date: "2026-04-10", type: "Deployment", description: "Version v3.2.0 deployed to prod clusters." }
    ]
  },
  "segmentation": {
    kpis: [
      { title: "Models Monitored", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "Cpu", status: "info", description: "Customer Segmentation Model" },
      { title: "Healthy Models", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "CheckCircle", status: "success", description: "Model below alert threshold" },
      { title: "Models With Drift", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "AlertTriangle", status: "success", description: "PSI < 0.1 detected" },
      { title: "Critical Alerts", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "ShieldAlert", status: "success", description: "No active critical issues" },
      { title: "Average Drift Score", value: 0.076, trend: 4.2, sparkline: [0.072, 0.073, 0.075, 0.078, 0.076, 0.076], icon: "Activity", status: "success", description: "Population Stability Index" },
      { title: "Retraining Recommended", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "RefreshCw", status: "success", description: "Model parameters stable" },
      { title: "Predictions Today", value: "48.5K", trend: -1.2, sparkline: [50, 49, 48, 48, 48, 48], icon: "TrendingUp", status: "info", description: "Active query volume" },
      { title: "Average Stability", value: "95.1%", trend: -0.3, sparkline: [95.5, 95.4, 95.2, 95.1, 95.0, 95.1], icon: "SlidersHorizontal", status: "success", description: "Clustering alignment index" }
    ],
    overview: {
      "Today": [
        { time: "00:00", overall: 0.072, feature: 0.068, prediction: 0.075, concept: 0.072, psi: 0.072, ks: 0.035 },
        { time: "12:00", overall: 0.076, feature: 0.072, prediction: 0.079, concept: 0.076, psi: 0.076, ks: 0.038 }
      ],
      "7 Days": [
        { time: "Jul 08", overall: 0.072, feature: 0.069, prediction: 0.075, concept: 0.072, psi: 0.072, ks: 0.036 },
        { time: "Jul 14", overall: 0.076, feature: 0.073, prediction: 0.079, concept: 0.076, psi: 0.076, ks: 0.038 }
      ],
      "30 Days": [
        { time: "Wk 1", overall: 0.070, feature: 0.067, prediction: 0.073, concept: 0.070, psi: 0.070, ks: 0.034 },
        { time: "Wk 4", overall: 0.076, feature: 0.073, prediction: 0.079, concept: 0.076, psi: 0.076, ks: 0.038 }
      ],
      "90 Days": [
        { time: "May", overall: 0.068, feature: 0.065, prediction: 0.071, concept: 0.068, psi: 0.068, ks: 0.032 },
        { time: "Jul", overall: 0.076, feature: 0.073, prediction: 0.079, concept: 0.076, psi: 0.076, ks: 0.038 }
      ],
      "1 Year": [
        { time: "Q1 2026", overall: 0.060, feature: 0.057, prediction: 0.063, concept: 0.060, psi: 0.060, ks: 0.028 },
        { time: "Q2 2026", overall: 0.076, feature: 0.073, prediction: 0.079, concept: 0.076, psi: 0.076, ks: 0.038 }
      ]
    },
    features: [
      { name: "monthly_transaction_freq", trainingMean: 24.5, currentMean: 26.2, driftScore: 0.076, importance: 88, severity: "Low", status: "Stable", ksStat: 0.038, missingPercentage: 0.02 },
      { name: "avg_tenure_months", trainingMean: 18.2, currentMean: 18.4, driftScore: 0.025, importance: 64, severity: "Low", status: "Stable", ksStat: 0.012, missingPercentage: 0.0 }
    ],
    predictionDistribution: [
      { bin: "Cluster A", baselineDensity: 35, currentDensity: 33, probabilityShift: -2 },
      { bin: "Cluster B", baselineDensity: 25, currentDensity: 27, probabilityShift: 2 },
      { bin: "Cluster C", baselineDensity: 20, currentDensity: 19, probabilityShift: -1 },
      { bin: "Cluster D", baselineDensity: 15, currentDensity: 16, probabilityShift: 1 },
      { bin: "Cluster E", baselineDensity: 5, currentDensity: 5, probabilityShift: 0 }
    ],
    confidenceDistribution: [
      { confidenceRange: "90-100%", count: 3200, baselineCount: 3250 },
      { confidenceRange: "80-90%", count: 1200, baselineCount: 1150 }
    ],
    dataQuality: {
      missingValues: 104,
      duplicateRecords: 12,
      outliers: 42,
      schemaChanges: 0,
      nullPercentage: 0.12,
      unexpectedCategories: 1
    },
    conceptDrift: [
      { time: "Wk 1", historicalAccuracy: 92.5, currentAccuracy: 92.4, expectedBehavior: 92.5, observedBehavior: 92.4, conceptStability: 99.8 },
      { time: "Wk 4", historicalAccuracy: 92.5, currentAccuracy: 92.1, expectedBehavior: 92.5, observedBehavior: 92.1, conceptStability: 99.5 }
    ],
    heatmap: [
      { feature: "monthly_transaction_freq", time: "Jul 14", score: 0.22 },
      { feature: "avg_tenure_months", time: "Jul 14", score: 0.08 }
    ],
    health: {
      currentHealth: "Healthy",
      lastRetraining: "2026-03-20",
      currentDriftScore: 0.076,
      predictionStability: 95.1,
      lastEvaluation: "2026-07-14 18:30"
    },
    recommendations: [
      { id: "R-6", title: "Stable Model", priority: "Low", confidence: 96.0, reason: "Customer profiles have shifted slightly but within limits.", suggestedAction: "Continue standard updates." }
    ],
    alerts: [],
    timeline: [
      { id: "TL-10", title: "Model Deployed", date: "2026-03-20", type: "Deployment", description: "Version v1.2.0 deployed to prod clusters." }
    ]
  },
  "explainability": {
    kpis: [
      { title: "Models Monitored", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "Cpu", status: "info", description: "Explainability Engine Instance" },
      { title: "Healthy Models", value: 1, trend: 0.0, sparkline: [1, 1, 1, 1, 1, 1], icon: "CheckCircle", status: "success", description: "Model below alert threshold" },
      { title: "Models With Drift", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "AlertTriangle", status: "success", description: "PSI < 0.1 detected" },
      { title: "Critical Alerts", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "ShieldAlert", status: "success", description: "No active critical issues" },
      { title: "Average Drift Score", value: 0.022, trend: 0.0, sparkline: [0.022, 0.022, 0.022, 0.022, 0.022, 0.022], icon: "Activity", status: "success", description: "Population Stability Index" },
      { title: "Retraining Recommended", value: 0, trend: 0.0, sparkline: [0, 0, 0, 0, 0, 0], icon: "RefreshCw", status: "success", description: "Model parameters stable" },
      { title: "Predictions Today", value: "32.2K", trend: 1.1, sparkline: [31, 31, 32, 32, 32, 32], icon: "TrendingUp", status: "info", description: "Active query volume" },
      { title: "Average Stability", value: "99.2%", trend: 0.1, sparkline: [99.0, 99.1, 99.2, 99.2, 99.2, 99.2], icon: "SlidersHorizontal", status: "success", description: "Explanation alignment index" }
    ],
    overview: {
      "Today": [
        { time: "00:00", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 },
        { time: "12:00", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 }
      ],
      "7 Days": [
        { time: "Jul 08", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 },
        { time: "Jul 14", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 }
      ],
      "30 Days": [
        { time: "Wk 1", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 },
        { time: "Wk 4", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 }
      ],
      "90 Days": [
        { time: "May", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 },
        { time: "Jul", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 }
      ],
      "1 Year": [
        { time: "Q1 2026", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 },
        { time: "Q2 2026", overall: 0.022, feature: 0.020, prediction: 0.024, concept: 0.022, psi: 0.022, ks: 0.018 }
      ]
    },
    features: [
      { name: "shap_values_sum", trainingMean: 0.85, currentMean: 0.85, driftScore: 0.022, importance: 99, severity: "Low", status: "Stable", ksStat: 0.018, missingPercentage: 0.0 }
    ],
    predictionDistribution: [
      { bin: "0.0-0.2", baselineDensity: 5, currentDensity: 5, probabilityShift: 0 },
      { bin: "0.2-0.4", baselineDensity: 10, currentDensity: 10, probabilityShift: 0 },
      { bin: "0.4-0.6", baselineDensity: 70, currentDensity: 70, probabilityShift: 0 },
      { bin: "0.6-0.8", baselineDensity: 10, currentDensity: 10, probabilityShift: 0 },
      { bin: "0.8-1.0", baselineDensity: 5, currentDensity: 5, probabilityShift: 0 }
    ],
    confidenceDistribution: [
      { confidenceRange: "90-100%", count: 4200, baselineCount: 4200 }
    ],
    dataQuality: {
      missingValues: 0,
      duplicateRecords: 0,
      outliers: 0,
      schemaChanges: 0,
      nullPercentage: 0.0,
      unexpectedCategories: 0
    },
    conceptDrift: [
      { time: "Wk 1", historicalAccuracy: 99.5, currentAccuracy: 99.5, expectedBehavior: 99.5, observedBehavior: 99.5, conceptStability: 100.0 },
      { time: "Wk 4", historicalAccuracy: 99.5, currentAccuracy: 99.5, expectedBehavior: 99.5, observedBehavior: 99.5, conceptStability: 100.0 }
    ],
    heatmap: [
      { feature: "shap_values_sum", time: "Jul 14", score: 0.02 }
    ],
    health: {
      currentHealth: "Healthy",
      lastRetraining: "2026-05-02",
      currentDriftScore: 0.022,
      predictionStability: 99.2,
      lastEvaluation: "2026-07-14 18:30"
    },
    recommendations: [
      { id: "R-7", title: "Stable Model", priority: "Low", confidence: 99.8, reason: "Explainability alignment matches baseline standards.", suggestedAction: "Continue standard runs." }
    ],
    alerts: [],
    timeline: [
      { id: "TL-11", title: "Model Deployed", date: "2026-05-02", type: "Deployment", description: "Version v2.0.2 promoted to prod." }
    ]
  }
};
