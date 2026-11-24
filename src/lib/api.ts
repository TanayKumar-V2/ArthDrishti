/**
 * ArthDrishti API Client
 * Manages JWT tokens, automatic refresh rotation, and typed requests to the FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
const ACTIVE_DOCUMENTS_KEY = "arthdrishti_active_documents";

function scopeQuery(endpoint: string, documentIds?: string[]): string {
  const ids = documentIds ?? (typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem(ACTIVE_DOCUMENTS_KEY) || "null") as string[] | null
    : null);
  if (!ids?.length) return endpoint;
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}document_ids=${encodeURIComponent(ids.join(","))}`;
}

function activeDocumentIds(): string[] | undefined {
  if (typeof window === "undefined") return undefined;
  return JSON.parse(localStorage.getItem(ACTIVE_DOCUMENTS_KEY) || "null") as string[] | undefined;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "customer" | "loan_officer" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user?: AuthUser;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Token Storage Helpers (safely handles SSR)
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("arthdrishti_access_token");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("arthdrishti_refresh_token");
};

export const setAuthSession = (tokens: AuthTokens) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("arthdrishti_access_token", tokens.access_token);
  localStorage.setItem("arthdrishti_refresh_token", tokens.refresh_token);
  if (tokens.user) {
    localStorage.setItem("arthdrishti_user", JSON.stringify(tokens.user));
  }
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("arthdrishti_access_token");
  localStorage.removeItem("arthdrishti_refresh_token");
  localStorage.removeItem("arthdrishti_user");
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("arthdrishti_user");
  return user ? JSON.parse(user) : null;
};

/**
 * Core HTTP Request Wrapper with Bearer Auth & Auto-refresh
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getAccessToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized by attempting token refresh
  if (response.status === 401 && getRefreshToken()) {
    try {
      const refreshedTokens = await refreshAuthToken();
      headers["Authorization"] = `Bearer ${refreshedTokens.access_token}`;
      response = await fetch(url, { ...options, headers });
    } catch {
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, errorData);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

/**
 * Refresh access token using current refresh token
 */
export async function refreshAuthToken(): Promise<AuthTokens> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearAuthSession();
    throw new Error("Failed to refresh token");
  }

  const data: AuthTokens = await response.json();
  setAuthSession(data);
  return data;
}

/**
 * Authentication Methods
 */
export const authApi = {
  async register(data: { email: string; password: string; full_name?: string; role?: string }): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }): Promise<AuthTokens> {
    const tokens = await apiRequest<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setAuthSession(tokens);
    return tokens;
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await apiRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // Ignore logout errors and clean local state
      }
    }
    clearAuthSession();
  },

  async getCurrentUser(): Promise<AuthUser> {
    return apiRequest<AuthUser>("/auth/me");
  },
};

/**
 * Risk & Prediction APIs
 */
export const riskApi = {
  async evaluateCreditRisk(documentIds?: string[]): Promise<any> {
    return apiRequest(scopeQuery("/predictions/credit-risk", documentIds), { method: "POST" });
  },
  async getLatestRiskScore(): Promise<any> {
    return apiRequest(scopeQuery("/predictions/credit-risk/latest"));
  },
  async getScoreHistory(): Promise<any[]> {
    return apiRequest("/predictions/credit-risk/history");
  },
  async getCustomerSegment(): Promise<any> {
    return apiRequest(scopeQuery("/predictions/segment"));
  },
  async getFinancialHealthScore(): Promise<any> {
    return apiRequest(scopeQuery("/predictions/financial-health-score"));
  },
};

/**
 * Uploaded statement documents
 */
export interface UploadedDocument {
  id?: string;
  document_id?: string;
  file_name?: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string | null;
}

export const documentsApi = {
  async list(): Promise<UploadedDocument[]> {
    return apiRequest<UploadedDocument[]>("/documents");
  },
  async upload(file: File): Promise<UploadedDocument> {
    const body = new FormData();
    body.append("file", file);
    return apiRequest<UploadedDocument>("/documents/upload", {
      method: "POST",
      body,
    });
  },
  async getStatus(documentId: string): Promise<UploadedDocument> {
    return apiRequest<UploadedDocument>(`/documents/${encodeURIComponent(documentId)}/status`);
  },
  async recategorize(documentId: string): Promise<{ categorized_transactions: number; provider: string }> {
    return apiRequest(`/documents/${encodeURIComponent(documentId)}/recategorize`, { method: "POST" });
  },
  async delete(documentId: string): Promise<void> {
    return apiRequest<void>(`/documents/${encodeURIComponent(documentId)}`, { method: "DELETE" });
  },
};

/**
 * Fraud Intelligence APIs
 */
export const fraudApi = {
  async triggerScan(documentIds?: string[]): Promise<any> {
    return apiRequest(scopeQuery("/predictions/fraud/scan", documentIds), { method: "POST" });
  },
  async listAlerts(status?: string): Promise<any[]> {
    return apiRequest(scopeQuery(`/predictions/fraud/alerts${status ? `?alert_status=${status}` : ""}`));
  },
  async updateAlertStatus(alertId: string, status: string): Promise<any> {
    return apiRequest(`/predictions/fraud/alerts/${alertId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

/**
 * Explainable AI & What-If Simulator APIs
 */
export const xaiApi = {
  async getExplanation(predictionId: string = "latest"): Promise<any> {
    return apiRequest(scopeQuery(`/explainability/${predictionId}`));
  },
  async simulateWhatIf(params: { income_delta?: number; expense_delta?: number }): Promise<any> {
    const documentIds = activeDocumentIds();
    return apiRequest("/explainability/what-if", {
      method: "POST",
      body: JSON.stringify({ ...params, ...(documentIds ? { document_ids: documentIds } : {}) }),
    });
  },
};

/**
 * Cash Flow Forecasting APIs
 */
export const forecastApi = {
  async generateForecast(horizon: "7d" | "30d" | "180d" = "30d", documentIds?: string[]): Promise<any> {
    const ids = documentIds ?? activeDocumentIds();
    return apiRequest("/forecast/generate", {
      method: "POST",
      body: JSON.stringify({ horizon, ...(ids ? { document_ids: ids } : {}) }),
    });
  },
  async getForecast(horizon: "7d" | "30d" | "180d" = "30d"): Promise<any> {
    return apiRequest(`/forecast?horizon=${horizon}`);
  },
};

/**
 * Loan Application & Underwriting APIs
 */
export const loansApi = {
  async apply(data: { amount: number; purpose: string; term_months: number; interest_rate?: number }): Promise<LoanRecord> {
    const documentIds = activeDocumentIds();
    return apiRequest<LoanRecord>("/loans/apply", {
      method: "POST",
      body: JSON.stringify({ ...data, ...(documentIds ? { document_ids: documentIds } : {}) }),
    });
  },
  async listLoans(): Promise<LoanRecord[]> {
    return apiRequest<LoanRecord[]>("/loans");
  },
  async getRepaymentSchedule(loanId: string): Promise<any[]> {
    return apiRequest(`/loans/${loanId}/repayment-schedule`);
  },
};

export interface LoanRecord {
  id: string;
  user_id: string;
  amount: number;
  purpose: string;
  term_months: number;
  interest_rate: number;
  status: string;
  risk_tier: string;
  created_at: string;
  updated_at: string;
}

export interface LoanReviewRecord extends LoanRecord {
  applicant_name: string;
  applicant_email: string;
  financial_health_score: number | null;
  default_probability: number | null;
}

export interface LoanApplicantAnalysis {
  application: LoanReviewRecord;
  credit_risk: {
    financial_health_score: number;
    default_probability: number;
    risk_band: string;
    model_version: string;
  };
  transaction_count: number;
  period_start: string | null;
  period_end: string | null;
  source_document_ids: string[];
  source_document_names: string[];
  features: Record<string, number | null>;
  spending_breakdown: Array<{ category: string; amount: number; percentage: number; count: number }>;
  monthly_cash_flow: Array<{ month: string; income: number; expenses: number; net_savings: number }>;
  fraud_summary: {
    scan_status: "completed" | "failed" | "not_run";
    saved_alert_count: number;
    flagged_transaction_count: number;
    risk_level_counts: Record<string, number>;
    basis_note: string;
  };
  fraud_alerts: Array<{
    transaction_id: string;
    transaction_date: string;
    description: string;
    category: string;
    amount: number;
    risk_level: string;
    anomaly_score: number;
    reasons: string[];
    status: string;
  }>;
  segment: { cluster_id: string; segment_name: string; characteristics: Record<string, unknown> } | null;
  xai_contributions: Array<{ feature: string; description: string }>;
  recommendations: Array<{ title: string; reason: string }>;
  analysis_basis: "application_time" | "review_time_backfill";
  generated_at: string;
}

export const loanOfficerApi = {
  async listApplications(status?: string): Promise<LoanReviewRecord[]> {
    const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest<LoanReviewRecord[]>(`/admin/loans${query}`);
  },
  async getApplicantAnalysis(applicationId: string): Promise<LoanApplicantAnalysis> {
    return apiRequest<LoanApplicantAnalysis>(`/admin/loans/${encodeURIComponent(applicationId)}/analysis`);
  },
  async decide(applicationId: string, decision: "approved" | "rejected", officer_notes?: string): Promise<LoanRecord> {
    return apiRequest<LoanRecord>(`/admin/loans/${encodeURIComponent(applicationId)}/decision`, {
      method: "PATCH",
      body: JSON.stringify({ decision, officer_notes }),
    });
  },
};

/**
 * Reports & PDF APIs
 */
export const reportsApi = {
  async generate(report_type: string = "comprehensive"): Promise<any> {
    const documentIds = activeDocumentIds();
    return apiRequest("/reports/generate", {
      method: "POST",
      body: JSON.stringify({ report_type, ...(documentIds ? { document_ids: documentIds } : {}) }),
    });
  },
  async listReports(): Promise<Array<{
    id: string;
    user_id: string;
    report_type: string;
    file_path: string;
    status: string;
    created_at: string;
  }>> {
    return apiRequest("/reports");
  },
  async download(reportId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/reports/${encodeURIComponent(reportId)}/download`;
    const token = getAccessToken();
    let response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (response.status === 401 && getRefreshToken()) {
      const refreshed = await refreshAuthToken();
      response = await fetch(url, { headers: { Authorization: `Bearer ${refreshed.access_token}` } });
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.detail || "Could not download this report.", errorData);
    }
    return response.blob();
  },
  getDownloadUrl(reportId: string): string {
    return `${API_BASE_URL}/reports/${reportId}/download`;
  },
};

/**
 * Transactions APIs
 */
export const transactionsApi = {
  async list(params?: { skip?: number; limit?: number; category?: string; transaction_type?: string; documentIds?: string[] }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.skip) query.set("skip", String(params.skip));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.category) query.set("category", params.category);
    if (params?.transaction_type) query.set("transaction_type", params.transaction_type);
    const qs = query.toString();
    return apiRequest(scopeQuery(`/transactions${qs ? `?${qs}` : ""}`, params?.documentIds));
  },
  async getSummary(documentIds?: string[]): Promise<{
    transaction_count: number;
    total_income: number;
    total_expenses: number;
    net_cash_flow: number;
    savings_rate: number;
    category_breakdown: Array<{ category: string; amount: number; percentage: number; count: number }>;
    monthly_trend: Array<{ month: string; income: number; expenses: number; net_savings: number }>;
  }> {
    return apiRequest(scopeQuery("/transactions/summary", documentIds));
  },
  async getFeatures(documentIds?: string[]): Promise<{ user_id: string; features: Record<string, number>; feature_count: number; computed_at: string }> {
    return apiRequest(scopeQuery("/transactions/features", documentIds));
  },
  async update(id: string, data: { category?: string; is_flagged?: boolean }): Promise<any> {
    return apiRequest(`/transactions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

/**
 * Recommendations APIs
 */
export const recommendationsApi = {
  async list(): Promise<Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    impact_level: string;
    is_dismissed: boolean;
    created_at: string;
  }>> {
    return apiRequest("/recommendations");
  },
  async dismiss(id: string): Promise<any> {
    return apiRequest(`/recommendations/${id}/dismiss`, { method: "PATCH" });
  },
};

/**
 * AI Financial Advisor (Groq / openai/gpt-oss-20b)
 */
export const advisorApi = {
  async chat(
    message: string,
    history?: Array<{ sender: "user" | "assistant"; text: string }>
  ): Promise<{
    response: string;
    model: string;
    source: "groq";
    metrics: Record<string, unknown>;
  }> {
    return apiRequest("/advisor/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  },
  async getContext(): Promise<Record<string, unknown>> {
    return apiRequest("/advisor/context");
  },
};
