import { useMemo } from 'react';
import { useDataStore } from '../../hooks/useDataStore';
import FinancialCore from '../../core/financialCore';
import { Shield, Heart, Home, Scale } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

export default function InsurancePage({ store, t }: Props) {
  const snapshot = store.data.snapshots[store.data.snapshots.length - 1];

  const coverage = useMemo(() => {
    const income = snapshot?.incomes.reduce((s, i) => s + i.amount, 0) || 0;
    const assets = snapshot?.assets.reduce((s, a) => s + a.value, 0) || 0;
    return FinancialCore.calculateCoverage(income * 12, assets);
  }, [snapshot]);

  const types = [
    { key: 'life', label: t('lifeInsurance'), icon: <Shield size={20} />, value: coverage.life, rec: 'доход × 10' },
    { key: 'health', label: t('healthInsurance'), icon: <Heart size={20} />, value: coverage.health, rec: 'доход × 2' },
    { key: 'property', label: t('propertyInsurance'), icon: <Home size={20} />, value: coverage.property, rec: '50% активов' },
    { key: 'liability', label: t('liabilityInsurance'), icon: <Scale size={20} />, value: coverage.total, rec: 'комплекс' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="metric-label">Рекомендуемое покрытие</div>
          <div className="metric-value">{coverage.total.toLocaleString()}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="metric-label">Ежемесячная премия</div>
          <div className="metric-value">{coverage.monthlyPremium.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid-2">
        {types.map(type => (
          <div key={type.key} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ color: 'var(--primary)' }}>{type.icon}</span>
              <h3 style={{ margin: 0 }}>{type.label}</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--subtext)' }}>Рекомендуемое покрытие</span>
              <span style={{ fontWeight: 600 }}>{type.value.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--subtext)' }}>Формула</span>
              <span>{type.rec}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Три уровня защиты</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div className="card" style={{ background: 'rgba(59,130,246,0.05)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Уровень 1: Ликвидность</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>Финансовая подушка на 6 месяцев расходов в депозите/наличных</div>
          </div>
          <div className="card" style={{ background: 'rgba(34,197,94,0.05)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Уровень 2: Страхование</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>Жизнь, здоровье, имущество, ответственность</div>
          </div>
          <div className="card" style={{ background: 'rgba(245,158,11,0.05)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Уровень 3: Диверсификация</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>Распределение рисков по классам активов</div>
          </div>
        </div>
      </div>
    </div>
  );
}
