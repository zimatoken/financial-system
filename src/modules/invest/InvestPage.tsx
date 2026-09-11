import { useState } from 'react';
import FinancialCore from '../../core/financialCore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calculator, RefreshCcw } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  t: (key: TranslationKey) => string;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'];

// Ключи локализации для классов активов
const ASSET_KEYS: Record<string, TranslationKey> = {
  stocks: 'assetStocks',
  bonds: 'assetBonds',
  realEstate: 'assetRealEstate',
  gold: 'assetGold',
  crypto: 'assetCrypto',
  deposits: 'assetDeposits',
  cash: 'assetCash',
};

export default function InvestPage({ t }: Props) {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [contribution, setContribution] = useState(10000);
  const [age, setAge] = useState(30);

  const compound = FinancialCore.compoundInterest(principal, rate, years, contribution);
  const allocation = FinancialCore.ageBasedAllocation(age);

  // Переводим ключи для графика
  const allocData = Object.entries(allocation)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(ASSET_KEYS[name] ?? (name as TranslationKey)),
      value,
    }));

  const chartData = compound.yearlyBreakdown;
  const fmt = (n: number) => n.toLocaleString('ru-RU');

  const diversification =
    FinancialCore.diversificationScore(allocation as unknown as Record<string, number>) * 100;

  return (
    <div className="animate-fade-in">
      <div className="grid-2">
        {/* Сложный процент */}
        <div className="card">
          <h3><Calculator size={18} /> {t('compoundInterest')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('principal')}</label>
              <input className="input" type="number" min="0" value={principal || ''} onChange={e => setPrincipal(Math.max(0, +e.target.value))} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('rate')}</label>
              <input className="input" type="number" min="0" max="100" value={rate || ''} onChange={e => setRate(Math.min(100, Math.max(0, +e.target.value)))} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('years')}</label>
              <input className="input" type="number" min="0" max="80" value={years || ''} onChange={e => setYears(Math.min(80, Math.max(0, +e.target.value)))} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('contribution')}</label>
              <input className="input" type="number" min="0" value={contribution || ''} onChange={e => setContribution(Math.max(0, +e.target.value))} />
            </div>
          </div>
          <div className="grid-3">
            <div className="card" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <div className="metric-label">{t('result')}</div>
              <div className="metric-value">{fmt(compound.futureValue)}</div>
            </div>
            <div className="card" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <div className="metric-label">{t('contributions')}</div>
              <div className="metric-value">{fmt(compound.totalContributions)}</div>
            </div>
            <div className="card" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <div className="metric-label">{t('totalInterest')}</div>
              <div className="metric-value">{fmt(compound.totalInterest)}</div>
            </div>
          </div>
        </div>

        {/* Распределение по возрасту */}
        <div className="card">
          <h3><RefreshCcw size={18} /> {t('ageAllocation')}</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('age')}</label>
            <input
              className="input"
              type="number" min="0" max="100"
              value={age || ''}
              onChange={e => setAge(Math.min(100, Math.max(0, +e.target.value)))}
            />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={allocData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {allocData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }}
                formatter={(v: number) => `${v}%`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 12, color: 'var(--subtext)', marginTop: 8, textAlign: 'center' }}>
            {t('model100Age')}: {t('assetStocks')} {allocation.stocks}% / {t('assetBonds')} {allocation.bonds}%
          </div>
        </div>
      </div>

      {/* Рост капитала */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>{t('capitalGrowth')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" stroke="var(--subtext)" />
            <YAxis stroke="var(--subtext)" />
            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="value" fill="#3b82f6" name={t('capital')} />
            <Bar dataKey="interest" fill="#22c55e" name={t('interest')} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Нижние информационные панели */}
      <div className="grid-3" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h3>{t('investmentMap')} <span title={t('investmentMapHint')} style={{ cursor: 'help', color: 'var(--subtext)', fontSize: 14 }}>ⓘ</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <div><span className="badge badge-success">{t('conservative')}</span> {t('mapConservative')}</div>
            <div><span className="badge badge-warning">{t('balanced')}</span> {t('mapBalanced')}</div>
            <div><span className="badge badge-danger">{t('aggressive')}</span> {t('mapAggressive')}</div>
          </div>
        </div>

        <div className="card">
          <h3>{t('dcaCalculator')} <span title={t('dcaTooltip')} style={{ cursor: 'help', color: 'var(--subtext)', fontSize: 14 }}>ⓘ</span></h3>
          <p style={{ color: 'var(--subtext)', fontSize: 14 }}>
            {t('dcaHintPrefix')} {fmt(contribution)} {t('dcaHintMiddle')} {years} {t('years')} {t('dcaHintAt')} {rate}% {t('dcaHintSuffix')}
          </p>
        </div>

        <div className="card">
          <h3>{t('diversification')} <span title={t('diversificationTooltip')} style={{ cursor: 'help', color: 'var(--subtext)', fontSize: 14 }}>ⓘ</span></h3>
          <p style={{ color: 'var(--subtext)', fontSize: 14 }}>
            {t('diversificationHint')}{' '}
            <span className="metric-value">{diversification.toFixed(1)}%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
