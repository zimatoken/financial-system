import { useState } from 'react';
import FinancialCore from '../../core/financialCore';
import { Snowflake, Flame, Trash2, Plus } from 'lucide-react';
import type { DebtItem, TranslationKey } from '../../types';

interface Props {
  t: (key: TranslationKey) => string;
}

export default function DebtPage({ t }: Props) {
  const [debts, setDebts] = useState<DebtItem[]>([
    { id: '1', name: 'Кредитная карта', balance: 150000, interestRate: 25, monthlyPayment: 15000, type: 'bad', priority: 'critical' },
    { id: '2', name: 'Ипотека', balance: 3000000, interestRate: 10, monthlyPayment: 35000, type: 'good', priority: 'low' },
  ]);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const consolidation = FinancialCore.consolidateDebts(debts);

  const sortedDebts = strategy === 'snowball'
    ? [...debts].sort((a, b) => a.balance - b.balance)
    : [...debts].sort((a, b) => b.interestRate - a.interestRate);

  const addDebt = () => setDebts([...debts, { id: crypto.randomUUID(), name: '', balance: 0, interestRate: 10, monthlyPayment: 0, type: 'bad', priority: 'high' }]);

  // Вспомогательная функция для локализованных строк с переменными
  const formatDebtItem = (debt: DebtItem, idx: number) => {
    const payoff = FinancialCore.calculatePayoff(debt.balance, debt.monthlyPayment || debt.balance * 0.05, debt.interestRate);
    return `${idx+1}. ${debt.name} | ${t('balance')}: ${debt.balance.toLocaleString()} | ${t('rate')}: ${debt.interestRate}% | ${t('payoffDate')}: ${payoff.years} ${t('years')} | ${t('totalInterest')}: ${payoff.totalInterest.toLocaleString()}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="metric-label">{t('totalDebt')}</div>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>{totalDebt.toLocaleString()}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="metric-label">{t('averageRate')}</div>
          <div className="metric-value">{consolidation.weightedRate}%</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="metric-label">{t('recommendation')}</div>
          <div style={{ fontSize: 14, color: 'var(--subtext)' }}>
            {consolidation.recommendation === 'refinance' ? t('refinance') : t('ratesAcceptable')}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('myDebts')}</h3>
            <button className="btn" onClick={addDebt}><Plus size={16} /></button>
          </div>
          {debts.map((debt, i) => (
            <div key={debt.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input className="input" style={{ flex: 2 }} value={debt.name} onChange={e => { const arr = [...debts]; arr[i].name = e.target.value; setDebts(arr); }} />
              <input className="input" style={{ flex: 1 }} type="number" value={debt.balance} onChange={e => { const arr = [...debts]; arr[i].balance = +e.target.value; setDebts(arr); }} />
              <input className="input" style={{ flex: 1 }} type="number" value={debt.interestRate} onChange={e => { const arr = [...debts]; arr[i].interestRate = +e.target.value; setDebts(arr); }} placeholder="%" />
              <select className="input select" style={{ flex: 1 }} value={debt.type} onChange={e => { const arr = [...debts]; arr[i].type = e.target.value as any; setDebts(arr); }}>
                <option value="bad">{t('bad')}</option>
                <option value="good">{t('good')}</option>
              </select>
              <button className="btn btn-danger" onClick={() => setDebts(debts.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>{t('repaymentStrategy')}</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className={`btn ${strategy === 'snowball' ? '' : 'btn-secondary'}`} onClick={() => setStrategy('snowball')}>
              <Snowflake size={16} /> {t('snowball')}
            </button>
            <button className={`btn ${strategy === 'avalanche' ? '' : 'btn-secondary'}`} onClick={() => setStrategy('avalanche')}>
              <Flame size={16} /> {t('avalanche')}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedDebts.map((debt, idx) => {
              const payoff = FinancialCore.calculatePayoff(debt.balance, debt.monthlyPayment || debt.balance * 0.05, debt.interestRate);
              return (
                <div key={debt.id} className="card" style={{ background: 'rgba(59,130,246,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{idx + 1}. {debt.name}</span>
                    <span className={`badge badge-${debt.type === 'bad' ? 'danger' : 'success'}`}>
                      {debt.type === 'bad' ? t('bad') : t('good')}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--subtext)', marginTop: 4 }}>
                    {`${t('balance')}: ${debt.balance.toLocaleString()} | ${t('rate')}: ${debt.interestRate}% | ${t('payoffDate')}: ${payoff.years} ${t('years')} | ${t('totalInterest')}: ${payoff.totalInterest.toLocaleString()}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
