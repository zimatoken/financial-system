export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  currency: string;
  language: 'ru' | 'en';
  theme: 'dark' | 'light';
}

export interface IncomeStream {
  id: string;
  name: string;
  type: 'active' | 'passive';
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'variable';
  stability: number; // 0-1
  taxRate: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  category: 'mandatory' | 'discretionary' | 'investment';
  amount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AssetItem {
  id: string;
  name: string;
  type: 'financial' | 'physical' | 'intangible';
  value: number;
  liquidity: number; // 0-1
  risk: number; // 0-1
  expectedReturn: number; // annual %
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  monthlyPayment: number;
  type: 'bad' | 'good';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface InvestmentPortfolio {
  stocks: number;
  bonds: number;
  realEstate: number;
  gold: number;
  crypto: number;
  deposits: number;
  cash: number;
}

export interface FinancialSnapshot {
  incomes: IncomeStream[];
  expenses: ExpenseItem[];
  assets: AssetItem[];
  debts: DebtItem[];
  date: string;
}

export interface BudgetPlan {
  income: number;
  mandatoryExpenses: number;
  discretionaryExpenses: number;
  investmentExpenses: number;
  surplus: number;
  savingsRate: number;
}

export interface FireCalculation {
  monthlyExpenses: number;
  fireNumber: number;
  yearsToFire: number;
  passiveIncome: number;
}

export interface CompoundResult {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  yearlyBreakdown: { year: number; value: number; contributions: number; interest: number }[];
}

export interface Deal {
  id: string;
  title: string;
  stage: 'lead' | 'negotiation' | 'contract' | 'closed' | 'lost';
  value: number;
  probability: number;
  contact: string;
  notes: string;
  createdAt: string;
}

export interface BarterItem {
  id: string;
  title: string;
  description: string;
  category: string;
  wanted: string;
  contact: string;
  createdAt: string;
}

export interface AuditCheck {
  id: string;
  question: string;
  category: string;
  completed: boolean;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  status: 'pending' | 'delivered' | 'failed';
  file?: { name: string; size: number; data: string; type: string };
}

export interface Contact {
  id: string;
  name: string;
  publicKey: string;
  lastSeen: number;
}

export type ModuleId = 
  'dashboard' | 'budget' | 'invest' | 'debt' | 'tax' | 'insurance' | 'legacy' | 
  'analytics' | 'audit' | 'messenger' | 'settings' | 'deals' | 'barter';

export interface NavItem {
  id: ModuleId;
  label: string;
  icon: string;
  category: 'core' | 'strategy' | 'trade' | 'analytics' | 'communication' | 'system';
}

// ===== ТИПЫ ДЛЯ ЛОКАЛИЗАЦИИ (добавлено) =====
export type Lang = 'ru' | 'en';
export type TranslationKey = string;