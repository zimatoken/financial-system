import type { CompoundResult, FireCalculation, BudgetPlan, InvestmentPortfolio, DebtItem } from '../types';

export const FinancialCore = {
  // ===== СЛОЖНЫЙ ПРОЦЕНТ =====
  compoundInterest(
    principal: number,
    annualRate: number,
    years: number,
    monthlyContribution: number = 0
  ): CompoundResult {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    let futureValue = principal * Math.pow(1 + r, n);
    let totalContributions = principal;
    const yearlyBreakdown = [];
    let currentValue = principal;
    let yearlyContributions = 0;
    let yearlyInterest = 0;

    for (let i = 1; i <= n; i++) {
      const interest = currentValue * r;
      currentValue += interest + monthlyContribution;
      totalContributions += monthlyContribution;
      yearlyContributions += monthlyContribution;
      yearlyInterest += interest;

      if (i % 12 === 0) {
        yearlyBreakdown.push({
          year: i / 12,
          value: Math.round(currentValue),
          contributions: Math.round(yearlyContributions),
          interest: Math.round(yearlyInterest),
        });
        yearlyContributions = 0;
        yearlyInterest = 0;
      }
    }

    return {
      futureValue: Math.round(futureValue + (monthlyContribution > 0 ? totalContributions - principal : 0)),
      totalContributions: Math.round(totalContributions),
      totalInterest: Math.round(currentValue - totalContributions),
      yearlyBreakdown,
    };
  },

  // ===== ВРЕМЯ ДО ЦЕЛИ =====
  timeToGoal(goal: number, current: number, annualRate: number, monthlyContribution: number): number {
    const r = annualRate / 100 / 12;
    let wealth = current;
    let months = 0;
    while (wealth < goal && months < 1200) {
      wealth = wealth * (1 + r) + monthlyContribution;
      months++;
    }
    return Math.ceil(months / 12 * 10) / 10;
  },

  // ===== FIRE NUMBER (4% правило) =====
  fireNumber(monthlyExpenses: number): number {
    return Math.round((monthlyExpenses * 12) / 0.04);
  },

  // ===== БЮДЖЕТ =====
  createBudget(income: number, fixedExpenses: number, variableExpenses: number): BudgetPlan {
    const totalExpenses = fixedExpenses + variableExpenses;
    const surplus = income - totalExpenses;
    return {
      income,
      mandatoryExpenses: fixedExpenses,
      discretionaryExpenses: variableExpenses,
      investmentExpenses: 0,
      surplus,
      savingsRate: income > 0 ? surplus / income : 0,
    };
  },

  // ===== ДИВЕРСИФИКАЦИЯ (Индекс Герфиндаля) =====
  diversificationScore(portfolio: Record<string, number>): number {
    const values = Object.values(portfolio).filter(v => v > 0);
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum === 0) return 0;
    const squaredWeights = values.map(v => Math.pow(v / sum, 2));
    const herfindahl = squaredWeights.reduce((a, b) => a + b, 0);
    return 1 - herfindahl;
  },

  // ===== МАКСИМАЛЬНАЯ ПРОСАДКА =====
  maxDrawdown(history: number[]): number {
    let peak = history[0] || 0;
    let maxDd = 0;
    for (const value of history) {
      if (value > peak) peak = value;
      const dd = peak > 0 ? (peak - value) / peak : 0;
      if (dd > maxDd) maxDd = dd;
    }
    return maxDd;
  },

  // ===== ПОГАШЕНИЕ ДОЛГА =====
  calculatePayoff(debt: number, payment: number, annualRate: number) {
    const r = annualRate / 100 / 12;
    let balance = debt;
    let months = 0;
    let totalPaid = 0;
    while (balance > 0 && months < 1200) {
      const interest = balance * r;
      balance = balance + interest - payment;
      if (balance < 0) balance = 0;
      totalPaid += payment;
      months++;
    }
    return {
      months,
      years: Math.round((months / 12) * 10) / 10,
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalPaid - debt),
    };
  },

  // ===== КОНСОЛИДАЦИЯ ДОЛГОВ =====
  consolidateDebts(debts: DebtItem[]) {
    const total = debts.reduce((sum, d) => sum + d.balance, 0);
    const weightedRate = total > 0
      ? debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0) / total
      : 0;
    return {
      totalDebt: total,
      weightedRate: Math.round(weightedRate * 100) / 100,
      monthlyPayment: Math.round(total * (weightedRate / 100 / 12)),
      recommendation: weightedRate > 10 ? 'refinance' : 'acceptable',
    };
  },

  // ===== НАЛОГИ РФ 2026 =====
  calculateTax(income: number, expenses: number = 0, investments: number = 0) {
    const taxable = Math.max(0, income - expenses - investments);
    const brackets = [
      { min: 0, max: 500000, rate: 0.13 },
      { min: 500000, max: 1500000, rate: 0.15 },
      { min: 1500000, max: Infinity, rate: 0.17 },
    ];
    let tax = 0;
    let remaining = taxable;
    for (const bracket of brackets) {
      const amount = Math.min(remaining, bracket.max - bracket.min);
      tax += amount * bracket.rate;
      remaining -= amount;
      if (remaining <= 0) break;
    }
    return {
      taxableIncome: taxable,
      tax: Math.round(tax),
      effectiveRate: income > 0 ? Math.round((tax / income) * 1000) / 10 : 0,
    };
  },

  // ===== СТРАХОВАНИЕ =====
  calculateCoverage(income: number, assets: number) {
    return {
      life: Math.round(income * 10),
      health: Math.round(income * 2),
      property: Math.round(assets * 0.5),
      total: Math.round(income * 12 + assets * 0.5),
      monthlyPremium: Math.round(income * 0.08),
    };
  },

  // ===== ПРАВИЛО 100 - ВОЗРАСТ =====
  ageBasedAllocation(age: number): InvestmentPortfolio {
    const stocks = Math.max(0, Math.min(100, 100 - age));
    const nonStocks = 100 - stocks; // = age
    return {
      stocks,
      bonds: Math.round(nonStocks * 0.5),
      realEstate: Math.round(nonStocks * 0.2),
      gold: Math.round(nonStocks * 0.1),
      crypto: Math.round(nonStocks * 0.05),
      deposits: Math.round(nonStocks * 0.1),
      cash: Math.round(nonStocks * 0.05),
    };
  },

  // ===== DCA (Dollar Cost Averaging) =====
  dca(monthlyAmount: number, prices: number[]) {
    const totalInvested = monthlyAmount * prices.length;
    const totalShares = prices.reduce((shares, price) => shares + monthlyAmount / price, 0);
    const avgPrice = totalInvested / totalShares;
    const currentValue = totalShares * (prices[prices.length - 1] || 0);
    return {
      totalInvested,
      totalShares: Math.round(totalShares * 100) / 100,
      averagePrice: Math.round(avgPrice * 100) / 100,
      currentValue: Math.round(currentValue),
      profit: Math.round(currentValue - totalInvested),
    };
  },

  // ===== РЕБАЛАНСИРОВКА =====
  rebalance(current: Record<string, number>, target: Record<string, number>) {
    const total = Object.values(current).reduce((a, b) => a + b, 0);
    const trades: Record<string, number> = {};
    for (const [asset, value] of Object.entries(current)) {
      const targetValue = total * (target[asset] || 0);
      trades[asset] = Math.round((targetValue - value) * 100) / 100;
    }
    return { trades, needsRebalance: Object.values(trades).some(t => Math.abs(t) > total * 0.05) };
  },

  // ===== СОЦИАЛЬНЫЙ ВЫЧЕТ =====
  socialDeduction(expenses: number, limit: number = 120000) {
    return Math.min(expenses, limit) * 0.13;
  },

  // ===== ИМУЩЕСТВЕННЫЙ ВЫЧЕТ =====
  propertyDeduction(mortgage: number, limit: number = 260000) {
    return Math.min(mortgage * 0.13, limit);
  },
};

export default FinancialCore;
