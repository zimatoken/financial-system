import { useMemo } from 'react';
import { useDataStore } from '../../hooks/useDataStore';
import FinancialCore from '../../core/financialCore';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Shield, Target } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

export default function Dashboard({ store, t }: Props) {
  const snapshot = store.data.snapshots[store.data.snapshots.length - 1];

  const metrics = useMemo(() => {
    if (!snapshot) return null;
    const totalIncome = snapshot.incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = snapshot.expenses.reduce((s, e) => s + e.amount, 0);
    const totalAssets = snapshot.assets.reduce((s, a) => s + a.value, 0);
    const totalDebts = snapshot.debts.reduce((s, d) => s + d.balance, 0);
    const netWorth = totalAssets - totalDebts;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) : 0;
    const fire = FinancialCore.fireNumber(totalExpenses);
    const passiveIncome = snapshot.incomes.filter(i => i.type === 'passive').reduce((s, i) => s + i.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      totalAssets,
      totalDebts,
      netWorth,
      savingsRate,
      fire,
      passiveIncome,
      debtToIncome: totalIncome > 0 ? totalDebts / totalIncome : 0,
    };
  }, [snapshot]);

  if (!metrics) {
    return (
      <div className="card animate-fade-in">
        <h3>{t('dashboard')}</h3>
        <p style={{ color: 'var(--subtext)' }}>Добавьте первый снимок финансов в разделе "Бюджет"</p>
      </div>
    );
  }

  const cards = [
    { label: 'netWorth', value: metrics.netWorth.toLocaleString(), icon: <Wallet size={20} />, color: 'var(--primary)' },
    { label: 'savingsRate', value: `${Math.round(metrics.savingsRate * 100)}%`, icon: <PiggyBank size={20} />, color: 'var(--success)' },
    { label: 'passiveIncome', value: metrics.passiveIncome.toLocaleString(), icon: <TrendingUp size={20} />, color: 'var(--info)' },
    { label: 'fireNumber', value: metrics.fire.toLocaleString(), icon: <Target size={20} />, color: 'var(--warning)' },
    { label: 'debtToIncome', value: `${Math.round(metrics.debtToIncome * 100)}%`, icon: <TrendingDown size={20} />, color: metrics.debtToIncome > 0.3 ? 'var(--danger)' : 'var(--success)' },
    { label: 'emergencyFund', value: `${Math.round((metrics.totalIncome - metrics.totalExpenses) * 6).toLocaleString()}`, icon: <Shield size={20} />, color: 'var(--primary)' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {cards.map((card, i) => (
          <div key={i} className="card" style={{ borderLeft: `4px solid ${card.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ color: card.color }}>{card.icon}</span>
              <span style={{ color: 'var(--subtext)', fontSize: 14 }}>{t(card.label as TranslationKey)}</span>
            </div>
            <div className="metric-value" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Структура активов</h3>
          {snapshot.assets.length === 0 ? (
            <p style={{ color: 'var(--subtext)' }}>Нет данных об активах</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {snapshot.assets.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{a.name}</span>
                  <span style={{ fontWeight: 600 }}>{a.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Структура долгов</h3>
          {snapshot.debts.length === 0 ? (
            <p style={{ color: 'var(--subtext)' }}>Нет данных о долгах</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {snapshot.debts.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{d.name} <span className={`badge badge-${d.type === 'bad' ? 'danger' : 'success'}`}>{d.type === 'bad' ? 'Плохой' : 'Хороший'}</span></span>
                  <span style={{ fontWeight: 600 }}>{d.balance.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
