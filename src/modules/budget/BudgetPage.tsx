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
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="metric-label">{t('income')}</div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>{totalIncome.toLocaleString()}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="metric-label">{t('expenses')}</div>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>{totalExpenses.toLocaleString()}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="metric-label">{t('assets')}</div>
          <div className="metric-value">{totalAssets.toLocaleString()}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="metric-label">{t('liabilities')}</div>
          <div className="metric-value">{totalDebts.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('income')}</h3>
            <button className="btn" onClick={addIncome}><Plus size={16} /></button>
          </div>
          {incomes.map((inc, i) => (
            <div key={inc.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input className="input" style={{ flex: 2 }} value={inc.name} onChange={e => { const arr = [...incomes]; arr[i].name = e.target.value; setIncomes(arr); }} placeholder="Название" />
              <input className="input" style={{ flex: 1 }} type="number" value={inc.amount} onChange={e => { const arr = [...incomes]; arr[i].amount = +e.target.value; setIncomes(arr); }} />
              <select className="input select" style={{ flex: 1 }} value={inc.type} onChange={e => { const arr = [...incomes]; arr[i].type = e.target.value as any; setIncomes(arr); }}>
                <option value="active">Активный</option>
                <option value="passive">Пассивный</option>
              </select>
              <button className="btn btn-danger" onClick={() => setIncomes(incomes.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('expenses')}</h3>
            <button className="btn" onClick={addExpense}><Plus size={16} /></button>
          </div>
          {expenses.map((exp, i) => (
            <div key={exp.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input className="input" style={{ flex: 2 }} value={exp.name} onChange={e => { const arr = [...expenses]; arr[i].name = e.target.value; setExpenses(arr); }} placeholder="Название" />
              <input className="input" style={{ flex: 1 }} type="number" value={exp.amount} onChange={e => { const arr = [...expenses]; arr[i].amount = +e.target.value; setExpenses(arr); }} />
              <select className="input select" style={{ flex: 1 }} value={exp.category} onChange={e => { const arr = [...expenses]; arr[i].category = e.target.value as any; setExpenses(arr); }}>
                <option value="mandatory">Обязательные</option>
                <option value="discretionary">Желания</option>
                <option value="investment">Инвестиции</option>
              </select>
              <button className="btn btn-danger" onClick={() => setExpenses(expenses.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('assets')}</h3>
            <button className="btn" onClick={addAsset}><Plus size={16} /></button>
          </div>
          {assets.map((ast, i) => (
            <div key={ast.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input className="input" style={{ flex: 2 }} value={ast.name} onChange={e => { const arr = [...assets]; arr[i].name = e.target.value; setAssets(arr); }} placeholder="Название" />
              <input className="input" style={{ flex: 1 }} type="number" value={ast.value} onChange={e => { const arr = [...assets]; arr[i].value = +e.target.value; setAssets(arr); }} />
              <input className="input" style={{ flex: 1 }} type="number" value={ast.expectedReturn} onChange={e => { const arr = [...assets]; arr[i].expectedReturn = +e.target.value; setAssets(arr); }} placeholder="Доход %" />
              <button className="btn btn-danger" onClick={() => setAssets(assets.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('liabilities')}</h3>
            <button className="btn" onClick={addDebt}><Plus size={16} /></button>
          </div>
          {debts.map((debt, i) => (
            <div key={debt.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input className="input" style={{ flex: 2 }} value={debt.name} onChange={e => { const arr = [...debts]; arr[i].name = e.target.value; setDebts(arr); }} placeholder="Название" />
              <input className="input" style={{ flex: 1 }} type="number" value={debt.balance} onChange={e => { const arr = [...debts]; arr[i].balance = +e.target.value; setDebts(arr); }} />
              <input className="input" style={{ flex: 1 }} type="number" value={debt.interestRate} onChange={e => { const arr = [...debts]; arr[i].interestRate = +e.target.value; setDebts(arr); }} placeholder="Ставка %" />
              <button className="btn btn-danger" onClick={() => setDebts(debts.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="metric-label">Бюджет: {t('savingsRate')}</div>
            <div className="metric-value" style={{ color: budget.savingsRate > 0.2 ? 'var(--success)' : 'var(--warning)' }}>
              {Math.round(budget.savingsRate * 100)}%
            </div>
          </div>
          <button className="btn btn-success" onClick={saveSnapshot}><Save size={16} /> Сохранить снимок</button>
        </div>
      </div>
    </div>
  );
}
