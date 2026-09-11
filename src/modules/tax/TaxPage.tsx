import { useState } from 'react';
import FinancialCore from '../../core/financialCore';
import { Receipt, Calculator } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  t: (key: TranslationKey) => string;
}

export default function TaxPage({ t }: Props) {
  const [income, setIncome] = useState(1200000);
  const [expenses, setExpenses] = useState(200000);
  const [investments, setInvestments] = useState(100000);
  const [socialExpenses, setSocialExpenses] = useState(80000);
  const [mortgage, setMortgage] = useState(0);

  const tax = FinancialCore.calculateTax(income, expenses, investments);
  const socialRefund = FinancialCore.socialDeduction(socialExpenses);
  const propertyRefund = FinancialCore.propertyDeduction(mortgage);

  return (
    <div className="animate-fade-in">
      <div className="grid-2">
        <div className="card">
          <h3><Calculator size={18} /> {t('taxOptimization')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('annualIncome')}</label>
              <input className="input" type="number" value={income} onChange={e => setIncome(+e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('expensesDeduction')}</label>
              <input className="input" type="number" value={expenses} onChange={e => setExpenses(+e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('investmentsDeduction')}</label>
              <input className="input" type="number" value={investments} onChange={e => setInvestments(+e.target.value)} />
            </div>
          </div>
          <div className="grid-3">
            <div className="card" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <div className="metric-label">{t('taxableBase')}</div>
              <div className="metric-value">{tax.taxableIncome.toLocaleString('ru-RU')}</div>
            </div>
            <div className="card" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <div className="metric-label">{t('taxPayable')}</div>
              <div className="metric-value" style={{ color: 'var(--danger)' }}>{tax.tax.toLocaleString('ru-RU')}</div>
            </div>
            <div className="card" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <div className="metric-label">{t('effectiveRate')}</div>
              <div className="metric-value">{tax.effectiveRate}%</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3><Receipt size={18} /> {t('taxRefund')}</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('socialExpensesHint')}</label>
            <input className="input" type="number" value={socialExpenses} onChange={e => setSocialExpenses(+e.target.value)} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('mortgageHint')}</label>
            <input className="input" type="number" value={mortgage} onChange={e => setMortgage(+e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="card" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <div className="metric-label">{t('socialDeduction')}</div>
              <div className="metric-value" style={{ color: 'var(--success)' }}>{Math.round(socialRefund).toLocaleString('ru-RU')}</div>
            </div>
            <div className="card" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <div className="metric-label">{t('propertyDeduction')}</div>
              <div className="metric-value" style={{ color: 'var(--success)' }}>{Math.round(propertyRefund).toLocaleString('ru-RU')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>{t('taxRates')}</h3>
        <table className="table">
          <thead>
            <tr><th>{t('range')}</th><th>{t('ratePercent')}</th></tr>
          </thead>
          <tbody>
            <tr><td>0 — 500 000 ₽</td><td>13%</td></tr>
            <tr><td>500 000 — 1 500 000 ₽</td><td>15%</td></tr>
            <tr><td>1 500 000+ ₽</td><td>17%</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
