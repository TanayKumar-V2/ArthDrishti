export type ModelEnvironment = "Development" | "Testing" | "Staging" | "Production" | "Archived";
export type ModelStatus = "Production" | "Staging" | "Development" | "Archived" | "Training" | "Failed";
export type ModelHealth = "Healthy" | "Degraded" | "Offline";
export type ModelFramework = "XGBoost" | "PyTorch" | "TensorFlow" | "Scikit-Learn" | "LightGBM" | "HuggingFace" | "SHAP";

export interface VersionLog {
  id: string;
  version: string;
  status: ModelStatus;
  health: ModelHealth;
  accuracy: number;
  latency: number; // in ms
  predictions: number;
  updatedDate: string;
  description: string;
}

export interface EnvironmentStatus {
  name: ModelEnvironment;
  version: string;
  health: ModelHealth;
  deployedAt: string;
  status: "Active" | "Canary" | "Inactive";
}

export interface ModelActivity {
  id: string;
  type: "Model Registered" | "Deployment Started" | "Deployment Completed" | "Rollback" | "Performance Drop" | "Drift Warning" | "Version Updated" | "Archive";
  timestamp: string;
  operator: string;
  detail: string;
}

export interface MetricSnapshot {
  accuracy: number;
  latency: number;
  predictions: number;
  confidence: number; // 0-100
  errorRate: number; // percentage
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
}

export interface AIModel {
  id: string;
  name: string;
  type: string;
  version: string;
  framework: ModelFramework;
  environment: ModelEnvironment;
  status: ModelStatus;
  health: ModelHealth;
  accuracy: number; // Primary accuracy representation
  latency: number; // in ms
  predictions: number; // predictions count
  owner: string;
  createdDate: string;
  lastUpdated: string;
  description: string;
  datasetName: string;
  featureCount: number;
  repositoryLink: string;
  tags: string[];
  metrics: MetricSnapshot;
  environments: EnvironmentStatus[];
  versions: VersionLog[];
  activities: ModelActivity[];
  sparkline: number[];
}

export const MOCK_FRAMEWORKS: ModelFramework[] = ["XGBoost", "PyTorch", "TensorFlow", "Scikit-Learn", "LightGBM", "HuggingFace", "SHAP"];
export const MOCK_ENVIRONMENTS: ModelEnvironment[] = ["Development", "Testing", "Staging", "Production", "Archived"];
export const MOCK_STATUSES: ModelStatus[] = ["Production", "Staging", "Development", "Archived", "Training", "Failed"];
export const MOCK_HEALTHS: ModelHealth[] = ["Healthy", "Degraded", "Offline"];
export const MOCK_OWNERS = ["Risk Intelligence", "Credit Ops", "Data Platform", "Compliance AI", "Retail Risk"];
export const MOCK_TAGS = ["Credit", "Fraud", "Forecast", "Explainability", "Classification", "Regression", "Production", "Experimental"];

export const INITIAL_MODELS: AIModel[] = [
  {
    id: "credit-risk",
    name: "Credit Risk Prediction Engine",
    type: "Credit Risk Prediction",
    version: "v4.2.1",
    framework: "XGBoost",
    environment: "Production",
    status: "Production",
    health: "Healthy",
    accuracy: 94.8,
    latency: 18.5,
    predictions: 3245000,
    owner: "Credit Ops",
    createdDate: "2024-02-15",
    lastUpdated: "2026-06-20",
    description: "Evaluates individual and corporate loan defaults probability scores based on historical ledgers.",
    datasetName: "ds_credit_scoring_v5_large.parquet",
    featureCount: 142,
    repositoryLink: "github.com/arthdrishti/models/credit-risk",
    tags: ["Credit", "Classification", "Production"],
    sparkline: [93.1, 93.4, 93.8, 94.2, 94.5, 94.8],
    metrics: {
      accuracy: 0.948,
      latency: 18.5,
      predictions: 3245000,
      confidence: 96.5,
      errorRate: 5.2,
      precision: 0.938,
      recall: 0.952,
      f1Score: 0.945,
      rocAuc: 0.982
    },
    environments: [
      { name: "Development", version: "v4.3.0-rc1", health: "Healthy", deployedAt: "2026-07-10 14:00", status: "Active" },
      { name: "Testing", version: "v4.2.2-rc2", health: "Healthy", deployedAt: "2026-07-05 11:30", status: "Active" },
      { name: "Staging", version: "v4.2.1", health: "Healthy", deployedAt: "2026-06-25 09:00", status: "Inactive" },
      { name: "Production", version: "v4.2.1", health: "Healthy", deployedAt: "2026-06-20 18:00", status: "Active" }
    ],
    versions: [
      { id: "v-cr-1", version: "v4.2.1", status: "Production", health: "Healthy", accuracy: 0.948, latency: 18.5, predictions: 3245000, updatedDate: "2026-06-20", description: "Updated parameters tree weights." },
      { id: "v-cr-2", version: "v4.2.0", status: "Archived", health: "Healthy", accuracy: 0.942, latency: 19.2, predictions: 1250000, updatedDate: "2026-05-15", description: "Baseline parameter tuning release." },
      { id: "v-cr-3", version: "v4.1.2", status: "Archived", health: "Degraded", accuracy: 0.925, latency: 22.0, predictions: 850000, updatedDate: "2026-03-10", description: "Experimental dataset release." }
    ],
    activities: [
      { id: "act-cr-1", type: "Deployment Completed", timestamp: "2026-06-20 18:00", operator: "System CD Pipeline", detail: "Version v4.2.1 promoted to active production cluster pod." },
      { id: "act-cr-2", type: "Version Updated", timestamp: "2026-06-18 10:20", operator: "Sunil Gavaskar", detail: "Registered version v4.2.1-rc3 weights patch." },
      { id: "act-cr-3", type: "Model Registered", timestamp: "2024-02-15 09:00", operator: "Admin", detail: "Credit Risk scoring ensemble registered in DB." }
    ]
  },
  {
    id: "fraud-detection",
    name: "Anomaly Fraud Autoencoder",
    type: "Fraud Detection",
    version: "v2.8.2",
    framework: "PyTorch",
    environment: "Production",
    status: "Production",
    health: "Degraded",
    accuracy: 89.8,
    latency: 32.4,
    predictions: 5120000,
    owner: "Risk Intelligence",
    createdDate: "2024-08-10",
    lastUpdated: "2026-07-01",
    description: "Deep Autoencoder neural network checking real-time transaction ledger streams for anomalies.",
    datasetName: "ds_fraud_anomalies_v8_realtime.tfrecords",
    featureCount: 88,
    repositoryLink: "github.com/arthdrishti/models/fraud-detection",
    tags: ["Fraud", "Classification", "Production"],
    sparkline: [91.2, 90.8, 90.2, 89.9, 89.8, 89.8],
    metrics: {
      accuracy: 0.898,
      latency: 32.4,
      predictions: 5120000,
      confidence: 88.5,
      errorRate: 10.2,
      precision: 0.912,
      recall: 0.885,
      f1Score: 0.898,
      rocAuc: 0.934
    },
    environments: [
      { name: "Development", version: "v2.9.0-alpha", health: "Healthy", deployedAt: "2026-07-12 16:30", status: "Active" },
      { name: "Testing", version: "v2.8.3-rc1", health: "Healthy", deployedAt: "2026-07-08 14:00", status: "Active" },
      { name: "Staging", version: "v2.8.2", health: "Healthy", deployedAt: "2026-07-02 09:00", status: "Inactive" },
      { name: "Production", version: "v2.8.2", health: "Degraded", deployedAt: "2026-07-01 11:30", status: "Active" }
    ],
    versions: [
      { id: "v-fr-1", version: "v2.8.2", status: "Production", health: "Degraded", accuracy: 0.898, latency: 32.4, predictions: 5120000, updatedDate: "2026-07-01", description: "Hyperparameter tuning release." },
      { id: "v-fr-2", version: "v2.8.1", status: "Archived", health: "Healthy", accuracy: 0.902, latency: 31.0, predictions: 2450000, updatedDate: "2026-05-10", description: "Stable standard neural network model." }
    ],
    activities: [
      { id: "act-fr-1", type: "Drift Warning", timestamp: "2026-07-13 15:30", operator: "Drift Monitor Service", detail: "Model accuracy drift warning: accuracy dropped to 89.8% due to schema drift." },
      { id: "act-fr-2", type: "Deployment Completed", timestamp: "2026-07-01 11:30", operator: "System CD Pipeline", detail: "Promoted PyTorch deep autoencoder v2.8.2." }
    ]
  },
  {
    id: "financial-health",
    name: "Financial Health Scoring Model",
    type: "Financial Health Score",
    version: "v3.1.0",
    framework: "LightGBM",
    environment: "Production",
    status: "Production",
    health: "Healthy",
    accuracy: 92.5,
    latency: 12.0,
    predictions: 1840000,
    owner: "Compliance AI",
    createdDate: "2025-01-18",
    lastUpdated: "2026-06-15",
    description: "Evaluates comprehensive business financial wellness categories based on tax registers and bank logs.",
    datasetName: "ds_financial_wellness_v3.parquet",
    featureCount: 65,
    repositoryLink: "github.com/arthdrishti/models/financial-health",
    tags: ["Credit", "Classification", "Production"],
    sparkline: [91.8, 92.0, 92.1, 92.3, 92.4, 92.5],
    metrics: {
      accuracy: 0.925,
      latency: 12.0,
      predictions: 1840000,
      confidence: 93.0,
      errorRate: 7.5,
      precision: 0.921,
      recall: 0.928,
      f1Score: 0.924,
      rocAuc: 0.968
    },
    environments: [
      { name: "Staging", version: "v3.1.0", health: "Healthy", deployedAt: "2026-06-10 09:00", status: "Inactive" },
      { name: "Production", version: "v3.1.0", health: "Healthy", deployedAt: "2026-06-15 10:00", status: "Active" }
    ],
    versions: [
      { id: "v-fh-1", version: "v3.1.0", status: "Production", health: "Healthy", accuracy: 0.925, latency: 12.0, predictions: 1840000, updatedDate: "2026-06-15", description: "LightGBM parameter tuning release." }
    ],
    activities: [
      { id: "act-fh-1", type: "Deployment Completed", timestamp: "2026-06-15 10:00", operator: "System CD Pipeline", detail: "Financial health score LightGBM v3.1.0 deployed." }
    ]
  },
  {
    id: "cash-flow",
    name: "Institutional Cash Flow Regressor",
    type: "Cash Flow Forecast",
    version: "v3.1.2",
    framework: "Scikit-Learn",
    environment: "Production",
    status: "Production",
    health: "Healthy",
    accuracy: 96.8, // 100 - MAPE (3.2%)
    latency: 24.5,
    predictions: 1240000,
    owner: "Credit Ops",
    createdDate: "2024-05-15",
    lastUpdated: "2026-06-15",
    description: "Predicts inflow and outflow trajectories for corporate clients to evaluate working capital risk.",
    datasetName: "ds_cashflow_timeseries_v6.parquet",
    featureCount: 54,
    repositoryLink: "github.com/arthdrishti/models/cash-flow",
    tags: ["Forecast", "Regression", "Production"],
    sparkline: [95.4, 95.8, 96.0, 96.2, 96.5, 96.8],
    metrics: {
      accuracy: 0.968,
      latency: 24.5,
      predictions: 1240000,
      confidence: 97.2,
      errorRate: 3.2,
      precision: 0.962,
      recall: 0.974,
      f1Score: 0.968,
      rocAuc: 0.990
    },
    environments: [
      { name: "Staging", version: "v3.1.2", health: "Healthy", deployedAt: "2026-06-12 14:00", status: "Inactive" },
      { name: "Production", version: "v3.1.2", health: "Healthy", deployedAt: "2026-06-15 11:30", status: "Active" }
    ],
    versions: [
      { id: "v-cf-1", version: "v3.1.2", status: "Production", health: "Healthy", accuracy: 0.968, latency: 24.5, predictions: 1240000, updatedDate: "2026-06-15", description: "Ensemble random forest regression weights update." }
    ],
    activities: [
      { id: "act-cf-1", type: "Deployment Completed", timestamp: "2026-06-15 11:30", operator: "System CD Pipeline", detail: "Random Forest Regressor v3.1.2 promoted." }
    ]
  },
  {
    id: "segmentation",
    name: "Portfolio Segmentation Clustering",
    type: "Customer Segmentation",
    version: "v1.9.0",
    framework: "Scikit-Learn",
    environment: "Staging",
    status: "Staging",
    health: "Healthy",
    accuracy: 85.0,
    latency: 45.0,
    predictions: 18900,
    owner: "Risk Intelligence",
    createdDate: "2025-06-01",
    lastUpdated: "2026-07-08",
    description: "Clusters client businesses into risk-aligned portfolios to track asset concentrations.",
    datasetName: "ds_portfolio_clusters_v1.csv",
    featureCount: 22,
    repositoryLink: "github.com/arthdrishti/models/portfolio-segmentation",
    tags: ["Credit", "Classification", "Experimental"],
    sparkline: [82.0, 83.2, 84.0, 84.5, 84.8, 85.0],
    metrics: {
      accuracy: 0.850,
      latency: 45.0,
      predictions: 18900,
      confidence: 86.0,
      errorRate: 15.0,
      precision: 0.840,
      recall: 0.860,
      f1Score: 0.850,
      rocAuc: 0.890
    },
    environments: [
      { name: "Development", version: "v1.9.1", health: "Healthy", deployedAt: "2026-07-10 09:00", status: "Active" },
      { name: "Testing", version: "v1.9.0", health: "Healthy", deployedAt: "2026-07-05 14:00", status: "Inactive" },
      { name: "Staging", version: "v1.9.0", health: "Healthy", deployedAt: "2026-07-08 15:30", status: "Active" }
    ],
    versions: [
      { id: "v-sg-1", version: "v1.9.0", status: "Staging", health: "Healthy", accuracy: 0.850, latency: 45.0, predictions: 18900, updatedDate: "2026-07-08", description: "K-Means Clustering models configuration." }
    ],
    activities: [
      { id: "act-sg-1", type: "Deployment Started", timestamp: "2026-07-08 15:00", operator: "Pooja Mehta", detail: "Promoted K-Means segmentation v1.9.0 to Staging Cluster Canary Pod." }
    ]
  },
  {
    id: "explainable-ai",
    name: "Explainable Credit Attribution Explainer",
    type: "Explainable AI Engine",
    version: "v2.1.0",
    framework: "SHAP",
    environment: "Production",
    status: "Production",
    health: "Healthy",
    accuracy: 98.2,
    latency: 120.5,
    predictions: 425000,
    owner: "Compliance AI",
    createdDate: "2025-09-12",
    lastUpdated: "2026-05-18",
    description: "Computes SHAP values attribution variables explaining specific credit prediction outputs.",
    datasetName: "ds_credit_scoring_v5_large.parquet",
    featureCount: 142,
    repositoryLink: "github.com/arthdrishti/models/xai-explainer",
    tags: ["Explainability", "Production"],
    sparkline: [97.8, 97.9, 98.0, 98.1, 98.1, 98.2],
    metrics: {
      accuracy: 0.982,
      latency: 120.5,
      predictions: 425000,
      confidence: 99.0,
      errorRate: 1.8,
      precision: 0.980,
      recall: 0.984,
      f1Score: 0.982,
      rocAuc: 0.998
    },
    environments: [
      { name: "Staging", version: "v2.1.0", health: "Healthy", deployedAt: "2026-05-10 11:00", status: "Inactive" },
      { name: "Production", version: "v2.1.0", health: "Healthy", deployedAt: "2026-05-18 14:00", status: "Active" }
    ],
    versions: [
      { id: "v-xa-1", version: "v2.1.0", status: "Production", health: "Healthy", accuracy: 0.982, latency: 120.5, predictions: 425000, updatedDate: "2026-05-18", description: "Kernel SHAP explainer weights release." }
    ],
    activities: [
      { id: "act-xa-1", type: "Deployment Completed", timestamp: "2026-05-18 14:00", operator: "System CD Pipeline", detail: "SHAP attribution explainer deployed." }
    ]
  },
  {
    id: "loan-recommendation",
    name: "Collaborative Credit Recommendation Engine",
    type: "Loan Recommendation Engine",
    version: "v1.4.0",
    framework: "TensorFlow",
    environment: "Staging",
    status: "Staging",
    health: "Healthy",
    accuracy: 88.4,
    latency: 28.2,
    predictions: 95000,
    owner: "Retail Risk",
    createdDate: "2025-11-20",
    lastUpdated: "2026-06-18",
    description: "Recommends risk-adjusted loan thresholds and term policies matching client segment parameters.",
    datasetName: "ds_loan_preferences_v2.parquet",
    featureCount: 38,
    repositoryLink: "github.com/arthdrishti/models/loan-recommendations",
    tags: ["Credit", "Regression", "Experimental"],
    sparkline: [86.5, 87.0, 87.4, 87.9, 88.2, 88.4],
    metrics: {
      accuracy: 0.884,
      latency: 28.2,
      predictions: 95000,
      confidence: 89.0,
      errorRate: 11.6,
      precision: 0.880,
      recall: 0.890,
      f1Score: 0.885,
      rocAuc: 0.920
    },
    environments: [
      { name: "Development", version: "v1.5.0-alpha", health: "Healthy", deployedAt: "2026-07-08 09:00", status: "Active" },
      { name: "Staging", version: "v1.4.0", health: "Healthy", deployedAt: "2026-06-18 15:00", status: "Active" }
    ],
    versions: [
      { id: "v-lr-1", version: "v1.4.0", status: "Staging", health: "Healthy", accuracy: 0.884, latency: 28.2, predictions: 95000, updatedDate: "2026-06-18", description: "Collaborative filtering neural net configuration." }
    ],
    activities: [
      { id: "act-lr-1", type: "Deployment Completed", timestamp: "2026-06-18 15:00", operator: "System CD Pipeline", detail: "Staging Canary promoted for loan recommender." }
    ]
  },
  {
    id: "document-classification",
    name: "Bank Statement Document Classifier",
    type: "Document Classification",
    version: "v2.0.1",
    framework: "HuggingFace",
    environment: "Development",
    status: "Development",
    health: "Healthy",
    accuracy: 95.2,
    latency: 85.0,
    predictions: 124500,
    owner: "Data Platform",
    createdDate: "2025-03-10",
    lastUpdated: "2026-07-10",
    description: "BERT-based transformer parsing tax records, salary slips, and statement uploads to extract variables.",
    datasetName: "ds_ocr_financial_slips_v4.tar.gz",
    featureCount: 768, // BERT embeddings dim
    repositoryLink: "github.com/arthdrishti/models/doc-classifier",
    tags: ["Classification", "Experimental"],
    sparkline: [93.0, 93.8, 94.2, 94.8, 95.0, 95.2],
    metrics: {
      accuracy: 0.952,
      latency: 85.0,
      predictions: 124500,
      confidence: 96.0,
      errorRate: 4.8,
      precision: 0.950,
      recall: 0.954,
      f1Score: 0.952,
      rocAuc: 0.985
    },
    environments: [
      { name: "Development", version: "v2.0.1", health: "Healthy", deployedAt: "2026-07-10 16:00", status: "Active" }
    ],
    versions: [
      { id: "v-dc-1", version: "v2.0.1", status: "Development", health: "Healthy", accuracy: 0.952, latency: 85.0, predictions: 124500, updatedDate: "2026-07-10", description: "BERT NLP transformer fine-tuning." }
    ],
    activities: [
      { id: "act-dc-1", type: "Model Registered", timestamp: "2025-03-10 09:00", operator: "Data Platform CI", detail: "BERT statements classifier registered." }
    ]
  },
  {
    id: "transaction-category",
    name: "Transaction Categorization Engine",
    type: "Transaction Categorization",
    version: "v1.1.0",
    framework: "Scikit-Learn",
    environment: "Production",
    status: "Production",
    health: "Degraded",
    accuracy: 86.4,
    latency: 8.5,
    predictions: 12500000,
    owner: "Data Platform",
    createdDate: "2025-05-15",
    lastUpdated: "2026-05-20",
    description: "Regex patterns plus TF-IDF features classifing transaction descriptions into standard accounting categories.",
    datasetName: "ds_transactions_tags_v2.csv",
    featureCount: 1500,
    repositoryLink: "github.com/arthdrishti/models/txn-categorization",
    tags: ["Classification", "Production"],
    sparkline: [89.0, 88.5, 87.8, 87.0, 86.6, 86.4],
    metrics: {
      accuracy: 0.864,
      latency: 8.5,
      predictions: 12500000,
      confidence: 85.0,
      errorRate: 13.6,
      precision: 0.858,
      recall: 0.870,
      f1Score: 0.864,
      rocAuc: 0.910
    },
    environments: [
      { name: "Staging", version: "v1.1.0", health: "Healthy", deployedAt: "2026-05-12 09:00", status: "Inactive" },
      { name: "Production", version: "v1.1.0", health: "Degraded", deployedAt: "2026-05-20 10:00", status: "Active" }
    ],
    versions: [
      { id: "v-tc-1", version: "v1.1.0", status: "Production", health: "Degraded", accuracy: 0.864, latency: 8.5, predictions: 12500000, updatedDate: "2026-05-20", description: "TF-IDF classifier weights release." }
    ],
    activities: [
      { id: "act-tc-1", type: "Performance Drop", timestamp: "2026-07-12 14:00", operator: "Performance Monitor", detail: "Transaction classification accuracy dropped below 88% threshold." }
    ]
  },
  {
    id: "risk-scoring",
    name: "Logistic Risk Scoring Baseline",
    type: "Risk Scoring Engine",
    version: "v1.0.0",
    framework: "Scikit-Learn",
    environment: "Archived",
    status: "Archived",
    health: "Healthy",
    accuracy: 82.5,
    latency: 4.2,
    predictions: 450000,
    owner: "Credit Ops",
    createdDate: "2023-01-10",
    lastUpdated: "2025-02-15",
    description: "Archived logistic regression baseline model replaced by credit risk XGBoost ensemble.",
    datasetName: "ds_legacy_defaults_2023.csv",
    featureCount: 15,
    repositoryLink: "github.com/arthdrishti/models/legacy-baseline",
    tags: ["Credit", "Classification", "Experimental"],
    sparkline: [82.5, 82.5, 82.5, 82.5, 82.5, 82.5],
    metrics: {
      accuracy: 0.825,
      latency: 4.2,
      predictions: 450000,
      confidence: 82.0,
      errorRate: 17.5,
      precision: 0.820,
      recall: 0.830,
      f1Score: 0.825,
      rocAuc: 0.860
    },
    environments: [
      { name: "Archived", version: "v1.0.0", health: "Healthy", deployedAt: "2023-03-12 09:00", status: "Inactive" }
    ],
    versions: [
      { id: "v-rs-1", version: "v1.0.0", status: "Archived", health: "Healthy", accuracy: 0.825, latency: 4.2, predictions: 450000, updatedDate: "2023-03-12", description: "Logistic regression baseline." }
    ],
    activities: [
      { id: "act-rs-1", type: "Archive", timestamp: "2025-02-15 18:00", operator: "Admin", detail: "Archived legacy baseline model weights." }
    ]
  }
];

export const MOCK_KPIS = {
  total: 10,
  production: 6,
  staging: 2,
  archived: 1,
  healthy: 8,
  attention: 2, // Degradeds
  avgAccuracy: 92.1,
  predictionsToday: 425000
};

// Seeding sparklines for KPIs
export const KPI_SPARKLINES = {
  totalModels: [8, 8, 8, 9, 9, 9, 10, 10, 10, 10, 10, 10],
  productionModels: [4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6],
  stagingModels: [2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2],
  archivedModels: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  healthyModels: [6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8],
  attentionModels: [2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
  avgAccuracy: [91.5, 91.8, 92.0, 92.2, 92.1, 92.0, 92.2, 92.3, 92.1, 92.2, 92.0, 92.1],
  predictions: [38, 41, 44, 48, 52, 58, 62, 69, 74, 82, 91, 95] // Millions or count
};
