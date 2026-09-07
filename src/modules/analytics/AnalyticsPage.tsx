import { useMemo } from 'react';
import { useDataStore } from '../../hooks/useDataStore';
import FinancialCore from '../../core/financialCore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

export default function AnalyticsPage({ store, t }: Props) {
  const snapshots = store.data.snapshots;

  const health = useMemo(() => {
    if (snapshots.length === 0) return null;
    const last = snapshots[snapshots.length - 1];
    const income = last.incomes.reduce((s, i) => s + i.amount, 0);
    const expenses = last.expenses.reduce((s, e) => s + e.amount, 0);
    const assets = last.assets.reduce((s, a) => s + a.value, 0);
    const debts = last.debts.reduce((s, d) => s + d.balance, 0);
    const savingsRate = income > 0 ? (income - expenses) / income : 0;
    const debtToIncome = income > 0 ? debts / income : 0;
    const netWorth = assets - debts;

    let zone: 'red' | 'yellow' | 'green' = 'red';
    if (savingsRate > 0.15 && debtToIncome < 0.2) zone = 'green';
    else if (savingsRate > 0.05 && debtToIncome < 0.4) zone = 'yellow';

    return { savingsRate, debtToIncome, netWorth, zone, emergencyMonths: income > 0 ? (netWorth / expenses) : 0 };
  }, [snapshots]);

  const historyData = snapshots.map((s, i) => {
    const income = s.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const expenses = s.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const assets = s.assets.reduce((sum, a) => sum + a.value, 0);
    return { index: i + 1, date: new Date(s.date).toLocaleDateString(), income, expenses, assets, netWorth: assets - s.debts.reduce((sum, d) => sum + d.balance, 0) };
  });

  if (!health) {
    return (
      <div className="card animate-fade-in">
        <h3>{t('analytics')}</h3>
        <p style={{ color: 'var(--subtext)' }}>Добавьте данные в разделе Бюджет для аналитики</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: `4px solid ${health.zone === 'green' ? 'var(--success)' : health.zone === 'yellow' ? 'var(--warning)' : 'var(--danger)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {health.zone === 'green' ? <CheckCircle size={18} color="var(--success)" /> : health.zone === 'yellow' ? <AlertTriangle size={18} color="var(--warning)" /> : <AlertTriangle size={18} color="var(--danger)" />}
            <span className="metric-label">{t('financialHealth')}</span>
          </div>
          <div className="metric-value" style={{ color: health.zone === 'green' ? 'var(--success)' : health.zone === 'yellow' ? 'var(--warning)' : 'var(--danger)' }}>
            {health.zone === 'green' ? t('greenZone') : health.zone === 'yellow' ? t('yellowZone') : t('redZone')}
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="metric-label">{t('savingsRate')}</div>
          <div className="metric-value">{Math.round(health.savingsRate * 100)}%</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="metric-label">{t('debtToIncome')}</div>
          <div className="metric-value">{Math.round(health.debtToIncome * 100)}%</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="metric-label">Подушка (мес)</div>
          <div className="metric-value">{Math.round(health.emergencyMonths)}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3><Activity size={18} /> Динамика капитала</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--subtext)" />
              <YAxis stroke="var(--subtext)" />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="netWorth" stroke="#3b82f6" name="Капитал" strokeWidth={2} />
              <Line type="monotone" dataKey="assets" stroke="#22c55e" name="Активы" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3><TrendingUp size={18} /> Доходы vs Расходы</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--subtext)" />
              <YAxis stroke="var(--subtext)" />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }} />
              <Bar dataKey="income" fill="#22c55e" name="Доходы" />
              <Bar dataKey="expenses" fill="#ef4444" name="Расходы" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Карта финансового здоровья</h3>
        <div className="grid-3" style={{ marginTop: 12 }}>
          <div className="card" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid var(--danger)' }}>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>{t('redZone')}</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>Сбережения &lt; 3 мес, Долг/доход &gt; 40%, Норма сбережений &lt; 5%</div>
          </div>
          <div className="card" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid var(--warning)' }}>
            <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>{t('yellowZone')}</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>Сбережения 3-6 мес, Долг/доход 20-40%, Норма сбережений 5-15%</div>
          </div>
          <div className="card" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid var(--success)' }}>
            <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>{t('greenZone')}</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>Сбережения &gt; 6 мес, Долг/доход &lt; 20%, Норма сбережений &gt; 15%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
