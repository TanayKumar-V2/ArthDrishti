/**
 * ArthDrishti API Client
 * Manages JWT tokens, automatic refresh rotation, and typed requests to the FastAPI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
  async evaluateCreditRisk(): Promise<any> {
    return apiRequest("/predictions/credit-risk", { method: "POST" });
  },
  async getLatestRiskScore(): Promise<any> {
    return apiRequest("/predictions/credit-risk/latest");
  },
  async getScoreHistory(): Promise<any[]> {
    return apiRequest("/predictions/credit-risk/history");
  },
  async getCustomerSegment(): Promise<any> {
    return apiRequest("/predictions/segment");
  },
  async getFinancialHealthScore(): Promise<any> {
    return apiRequest("/predictions/financial-health-score");
  },
};

/**
 * Fraud Intelligence APIs
 */
export const fraudApi = {
  async triggerScan(): Promise<any> {
    return apiRequest("/predictions/fraud/scan", { method: "POST" });
  },
  async listAlerts(status?: string): Promise<any[]> {
    return apiRequest(`/predictions/fraud/alerts${status ? `?alert_status=${status}` : ""}`);
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
    return apiRequest(`/explainability/${predictionId}`);
  },
  async simulateWhatIf(params: { income_delta?: number; expense_delta?: number; debt_delta?: number; loan_amount?: number }): Promise<any> {
    return apiRequest("/explainability/what-if", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },
};

/**
 * Cash Flow Forecasting APIs
 */
export const forecastApi = {
  async generateForecast(horizon: "7d" | "30d" | "180d" = "30d"): Promise<any> {
    return apiRequest("/forecast/generate", {
      method: "POST",
      body: JSON.stringify({ horizon }),
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
  async apply(data: { amount: number; purpose: string; term_months: number; interest_rate?: number }): Promise<any> {
    return apiRequest("/loans/apply", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async listLoans(): Promise<any[]> {
    return apiRequest("/loans");
  },
  async getRepaymentSchedule(loanId: string): Promise<any[]> {
    return apiRequest(`/loans/${loanId}/repayment-schedule`);
  },
};

/**
 * Reports & PDF APIs
 */
export const reportsApi = {
  async generate(report_type: string = "comprehensive"): Promise<any> {
    return apiRequest("/reports/generate", {
      method: "POST",
      body: JSON.stringify({ report_type }),
    });
  },
  async listReports(): Promise<any[]> {
    return apiRequest("/reports");
  },
  getDownloadUrl(reportId: string): string {
    return `${API_BASE_URL}/reports/${reportId}/download`;
  },
};

/**
 * Transactions APIs
 */
export const transactionsApi = {
  async list(params?: { skip?: number; limit?: number; category?: string; transaction_type?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.skip) query.set("skip", String(params.skip));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.category) query.set("category", params.category);
    if (params?.transaction_type) query.set("transaction_type", params.transaction_type);
    const qs = query.toString();
    return apiRequest(`/transactions${qs ? `?${qs}` : ""}`);
  },
  async getSummary(): Promise<{
    total_income: number;
    total_expenses: number;
    net_cash_flow: number;
    savings_rate: number;
    category_breakdown: Array<{ category: string; amount: number; percentage: number; count: number }>;
    monthly_trend: Array<{ month: string; income: number; expenses: number; net_savings: number }>;
  }> {
    return apiRequest("/transactions/summary");
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
    source: "groq" | "fallback";
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
