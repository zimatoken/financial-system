import { useState } from 'react';
import { useDataStore } from '../../hooks/useDataStore';
import FinancialCore from '../../core/financialCore';
import { Plus, Trash2, Save } from 'lucide-react';
import type { IncomeStream, ExpenseItem, AssetItem, DebtItem, TranslationKey } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

export default function BudgetPage({ store, t }: Props) {
  const [incomes, setIncomes] = useState<IncomeStream[]>([
    { id: '1', name: 'Зарплата', type: 'active', amount: 150000, frequency: 'monthly', stability: 0.9, taxRate: 13 },
  ]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: '1', name: 'Аренда', category: 'mandatory', amount: 45000, priority: 'critical' },
    { id: '2', name: 'Продукты', category: 'mandatory', amount: 20000, priority: 'critical' },
    { id: '3', name: 'Развлечения', category: 'discretionary', amount: 10000, priority: 'low' },
  ]);
  const [assets, setAssets] = useState<AssetItem[]>([
    { id: '1', name: 'Накопления', type: 'financial', value: 300000, liquidity: 0.8, risk: 0.1, expectedReturn: 8 },
  ]);
  const [debts, setDebts] = useState<DebtItem[]>([]);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalDebts = debts.reduce((s, d) => s + d.balance, 0);
  const budget = FinancialCore.createBudget(totalIncome, totalExpenses, 0);

  const fmt = (n: number) => n.toLocaleString('ru-RU');

  const saveSnapshot = () => {
    store.addSnapshot({
      incomes: [...incomes],
      expenses: [...expenses],
      assets: [...assets],
      debts: [...debts],
      date: new Date().toISOString(),
    });
  };

  const addIncome = () => setIncomes([...incomes, { id: crypto.randomUUID(), name: '', type: 'active', amount: 0, frequency: 'monthly', stability: 0.5, taxRate: 13 }]);
  const addExpense = () => setExpenses([...expenses, { id: crypto.randomUUID(), name: '', category: 'mandatory', amount: 0, priority: 'medium' }]);
  const addAsset = () => setAssets([...assets, { id: crypto.randomUUID(), name: '', type: 'financial', value: 0, liquidity: 0.5, risk: 0.3, expectedReturn: 10 }]);
  const addDebt = () => setDebts([...debts, { id: crypto.randomUUID(), name: '', balance: 0, interestRate: 10, monthlyPayment: 0, type: 'bad', priority: 'high' }]);

  return (
    <div className="animate-fade-in">
      {/* Метрики */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="metric-label">{t('income')}</div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>{fmt(totalIncome)}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="metric-label">{t('expenses')}</div>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>{fmt(totalExpenses)}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="metric-label">{t('assets')}</div>
          <div className="metric-value">{fmt(totalAssets)}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="metric-label">{t('liabilities')}</div>
          <div className="metric-value">{fmt(totalDebts)}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* ДОХОДЫ */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('income')}</h3>
            <button className="btn" onClick={addIncome} aria-label={t('add')}><Plus size={16} /></button>
          </div>
          {incomes.map((inc, i) => (
            <div key={inc.id} className="budget-row">
              <input
                className="input"
                value={inc.name}
                onChange={e => { const arr = [...incomes]; arr[i].name = e.target.value; setIncomes(arr); }}
                placeholder={t('incomeName')}
                title={t('incomeName')}
              />
              <input
                className="input"
                type="number" min="0"
                value={inc.amount || ''}
                onChange={e => { const arr = [...incomes]; arr[i].amount = Math.max(0, +e.target.value); setIncomes(arr); }}
                placeholder={t('amount')}
                title={t('amount')}
              />
              <select
                className="input select"
                value={inc.type}
                onChange={e => { const arr = [...incomes]; arr[i].type = e.target.value as any; setIncomes(arr); }}
                title={t('incomeType')}
              >
                <option value="active">{t('activeIncome')}</option>
                <option value="passive">{t('passiveIncomeType')}</option>
              </select>
              <button className="btn btn-danger" onClick={() => setIncomes(incomes.filter((_, idx) => idx !== i))} aria-label={t('delete')}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* РАСХОДЫ */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('expenses')}</h3>
            <button className="btn" onClick={addExpense} aria-label={t('add')}><Plus size={16} /></button>
          </div>
          {expenses.map((exp, i) => (
            <div key={exp.id} className="budget-row">
              <input
                className="input"
                value={exp.name}
                onChange={e => { const arr = [...expenses]; arr[i].name = e.target.value; setExpenses(arr); }}
                placeholder={t('expenseName')}
                title={t('expenseName')}
              />
              <input
                className="input"
                type="number" min="0"
                value={exp.amount || ''}
                onChange={e => { const arr = [...expenses]; arr[i].amount = Math.max(0, +e.target.value); setExpenses(arr); }}
                placeholder={t('amount')}
                title={t('amount')}
              />
              <select
                className="input select"
                value={exp.category}
                onChange={e => { const arr = [...expenses]; arr[i].category = e.target.value as any; setExpenses(arr); }}
                title={t('expenseCategory')}
              >
                <option value="mandatory">{t('mandatory')}</option>
                <option value="discretionary">{t('discretionary')}</option>
                <option value="investment">{t('invest')}</option>
              </select>
              <button className="btn btn-danger" onClick={() => setExpenses(expenses.filter((_, idx) => idx !== i))} aria-label={t('delete')}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* АКТИВЫ */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('assets')}</h3>
            <button className="btn" onClick={addAsset} aria-label={t('add')}><Plus size={16} /></button>
          </div>
          {assets.map((ast, i) => (
            <div key={ast.id} className="budget-row">
              <input
                className="input"
                value={ast.name}
                onChange={e => { const arr = [...assets]; arr[i].name = e.target.value; setAssets(arr); }}
                placeholder={t('assetName')}
                title={t('assetName')}
              />
              <input
                className="input"
                type="number" min="0"
                value={ast.value || ''}
                onChange={e => { const arr = [...assets]; arr[i].value = Math.max(0, +e.target.value); setAssets(arr); }}
                placeholder={t('assetValue')}
                title={t('assetValue')}
              />
              <input
                className="input"
                type="number" min="0" max="100"
                value={ast.expectedReturn || ''}
                onChange={e => { const arr = [...assets]; arr[i].expectedReturn = Math.min(100, Math.max(0, +e.target.value)); setAssets(arr); }}
                placeholder={t('yieldPercent')}
                title={t('yieldTooltip')}
              />
              <button className="btn btn-danger" onClick={() => setAssets(assets.filter((_, idx) => idx !== i))} aria-label={t('delete')}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* ПАССИВЫ */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('liabilities')}</h3>
            <button className="btn" onClick={addDebt} aria-label={t('add')}><Plus size={16} /></button>
          </div>
          {debts.map((debt, i) => (
            <div key={debt.id} className="budget-row">
              <input
                className="input"
                value={debt.name}
                onChange={e => { const arr = [...debts]; arr[i].name = e.target.value; setDebts(arr); }}
                placeholder={t('liabilityName')}
                title={t('liabilityName')}
              />
              <input
                className="input"
                type="number" min="0"
                value={debt.balance || ''}
                onChange={e => { const arr = [...debts]; arr[i].balance = Math.max(0, +e.target.value); setDebts(arr); }}
                placeholder={t('liabilityValue')}
                title={t('liabilityValue')}
              />
              <input
                className="input"
                type="number" min="0" max="100"
                value={debt.interestRate || ''}
                onChange={e => { const arr = [...debts]; arr[i].interestRate = Math.min(100, Math.max(0, +e.target.value)); setDebts(arr); }}
                placeholder={t('ratePercent')}
                title={t('rateTooltip')}
              />
              <button className="btn btn-danger" onClick={() => setDebts(debts.filter((_, idx) => idx !== i))} aria-label={t('delete')}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Норма сбережений + Сохранить */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="metric-label">{t('budget')}: {t('savingsRate')}</div>
            <div className="metric-value" style={{ color: budget.savingsRate > 0.2 ? 'var(--success)' : 'var(--warning)' }}>
              {Math.round(budget.savingsRate * 100)}%
            </div>
          </div>
          <button className="btn btn-success" onClick={saveSnapshot}>
            <Save size={16} /> {t('saveSnapshot')}
          </button>
        </div>
      </div>
    </div>
  );
}
