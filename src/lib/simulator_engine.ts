// What-If Simulator Calculation Engine
// Keeps mathematical model separate from React UI rendering

export interface SimulatorInputs {
  income: number;        // Monthly Income (INR)
  expenses: number;      // Monthly Expenses (INR)
  utilization: number;   // Credit Utilization (%)
  savings: number;       // Monthly Savings (INR)
  totalDebt: number;     // Total Debt (INR)
  loanAmount: number;    // Loan Amount (INR)
  emi: number;           // EMI Amount (INR)
}

export interface SimulatorResults {
  defaultRisk: number;       // Default Risk (%)
  financialHealth: number;   // Financial Health (0-100)
  savingsScore: number;      // Savings Score (0-100)
  cashFlowRisk: "LOW" | "MEDIUM" | "HIGH";
  impacts: { feature: string; effect: string; isPositive: boolean }[];
}

export const BASELINE_INPUTS: SimulatorInputs = {
  income: 120000,
  expenses: 82000,
  utilization: 68,
  savings: 38000,
  totalDebt: 540000,
  loanAmount: 250000,
  emi: 15000
};

export const BASELINE_RESULTS: SimulatorResults = {
  defaultRisk: 42,
  financialHealth: 68,
  savingsScore: 54,
  cashFlowRisk: "MEDIUM",
  impacts: []
};

export function calculateSimulatorResults(inputs: SimulatorInputs): SimulatorResults {
  const {
    income,
    expenses,
    utilization,
    savings,
    totalDebt,
    emi
  } = inputs;

  // 1. Savings Score
  // Current savings rate vs optimal 30% savings rate
  const savingsRate = income > 0 ? (savings / income) : 0;
  const rawSavingsScore = 30 + (savingsRate * 100 * 0.95);
  const savingsScore = Math.min(100, Math.max(5, Math.round(rawSavingsScore)));

  // 2. Default Risk Calculation
  // Base Risk: 42%
  // DTI calculation: (EMI + Expenses) / Income
  const dti = income > 0 ? ((emi + expenses) / income) : 1;
  const baselineDti = (15000 + 82000) / 120000;
  const dtiDelta = (dti - baselineDti) * 45;

  // Credit Utilization: baseline 68%, increases risk above, reduces below
  const utilDelta = (utilization - 68) * 0.38;

  // Debt-to-Annual Income ratio: baseline 5,40,000 / (1,20,000 * 12) = 0.375
  const debtRatio = income > 0 ? (totalDebt / (income * 12)) : 10;
  const debtRatioDelta = (debtRatio - 0.375) * 28;

  // Savings buffer cushion effect
  const savingsDelta = (savings - 38000) / 5000 * -1.2;

  const rawDefaultRisk = 42 + dtiDelta + utilDelta + debtRatioDelta + savingsDelta;
  const defaultRisk = Math.min(95, Math.max(5, Math.round(rawDefaultRisk)));

  // 3. Financial Health Score
  // Correlated with low risk, low debt ratios, and healthy savings
  const utilFactor = Math.max(0, 30 - (utilization * 0.3));
  const savingsFactor = Math.min(30, savingsRate * 80);
  const riskFactor = Math.max(0, 40 * (1 - defaultRisk / 100));
  
  const rawFinancialHealth = 20 + utilFactor + savingsFactor + riskFactor;
  const financialHealth = Math.min(100, Math.max(10, Math.round(rawFinancialHealth)));

  // 4. Cash Flow Risk
  // Based on monthly surplus: Income - Expenses - EMI
  const monthlySurplus = income - expenses - emi;
  let cashFlowRisk: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (monthlySurplus >= 35000) {
    cashFlowRisk = "LOW";
  } else if (monthlySurplus < 10000) {
    cashFlowRisk = "HIGH";
  }

  // 5. Impact list derivation
  const impacts: { feature: string; effect: string; isPositive: boolean }[] = [];

  // Credit Utilization Change Impact
  const utilChange = utilization - 68;
  if (Math.abs(utilChange) >= 2) {
    const effectVal = Math.round(Math.abs(utilChange * 0.38));
    impacts.push({
      feature: "Credit Utilization",
      effect: `${utilChange < 0 ? "-" : "+"}${effectVal}% Default Risk`,
      isPositive: utilChange < 0
    });
  }

  // Savings Change Impact
  const savingsChange = savings - 38000;
  if (Math.abs(savingsChange) >= 2000) {
    const healthEffect = Math.round(Math.abs(savingsChange / 4500));
    if (healthEffect > 0) {
      impacts.push({
        feature: "Monthly Savings",
        effect: `${savingsChange > 0 ? "+" : "-"}${healthEffect} Health Points`,
        isPositive: savingsChange > 0
      });
    }
  }

  // Debt reduction Impact
  const debtChange = totalDebt - 540000;
  if (Math.abs(debtChange) >= 15000) {
    const riskEffect = Math.round(Math.abs((debtChange / (120000 * 12)) * 28));
    if (riskEffect > 0) {
      impacts.push({
        feature: "Debt Reduction",
        effect: `${debtChange < 0 ? "-" : "+"}${riskEffect}% Default Risk`,
        isPositive: debtChange < 0
      });
    }
  }

  // Income change Impact
  const incomeChange = income - 120000;
  if (Math.abs(incomeChange) >= 5000) {
    const healthEffect = Math.round(Math.abs(incomeChange / 12000));
    if (healthEffect > 0) {
      impacts.push({
        feature: "Monthly Income",
        effect: `${incomeChange > 0 ? "+" : "-"}${healthEffect} Health Points`,
        isPositive: incomeChange > 0
      });
    }
  }

  // Expenses change Impact
  const expenseChange = expenses - 82000;
  if (Math.abs(expenseChange) >= 3000) {
    const riskEffect = Math.round(Math.abs((expenseChange / 120000) * 45));
    if (riskEffect > 0) {
      impacts.push({
        feature: "Monthly Expenses",
        effect: `${expenseChange < 0 ? "-" : "+"}${riskEffect}% Default Risk`,
        isPositive: expenseChange < 0
      });
    }
  }

  return {
    defaultRisk,
    financialHealth,
    savingsScore,
    cashFlowRisk,
    impacts
  };
}
