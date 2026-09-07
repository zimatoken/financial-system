import { useState } from 'react';
import FinancialCore from '../../core/financialCore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calculator, RefreshCcw } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  t: (key: TranslationKey) => string;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'];

export default function InvestPage({ t }: Props) {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [contribution, setContribution] = useState(10000);
  const [age, setAge] = useState(30);

  const compound = FinancialCore.compoundInterest(principal, rate, years, contribution);
  const allocation = FinancialCore.ageBasedAllocation(age);

  const allocData = Object.entries(allocation).map(([name, value]) => ({ name, value }));
  const chartData = compound.yearlyBreakdown;

  return (
    <div className="animate-fade-in">
      <div className="grid-2">
        <div className="card">
          <h3><Calculator size={18} /> {t('compoundInterest')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('principal')}</label>
              <input className="input" type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('rate')}</label>
              <input className="input" type="number" value={rate} onChange={e => setRate(+e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('years')}</label>
              <input className="input" type="number" value={years} onChange={e => setYears(+e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('contribution')}</label>
              <input className="input" type="number" value={contribution} onChange={e => setContribution(+e.target.value)} />
            </div>
          </div>
          <div className="grid-3">
            <div className="card" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <div className="metric-label">{t('result')}</div>
              <div className="metric-value">{compound.futureValue.toLocaleString()}</div>
            </div>
            <div className="card" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <div className="metric-label">Взносы</div>
              <div className="metric-value">{compound.totalContributions.toLocaleString()}</div>
            </div>
            <div className="card" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <div className="metric-label">{t('totalInterest')}</div>
              <div className="metric-value">{compound.totalInterest.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3><RefreshCcw size={18} /> Распределение по возрасту</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--subtext)' }}>Возраст</label>
            <input className="input" type="number" value={age} onChange={e => setAge(+e.target.value)} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={allocData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {allocData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Рост капитала по годам</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" stroke="var(--subtext)" />
            <YAxis stroke="var(--subtext)" />
            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }} />
            <Bar dataKey="value" fill="#3b82f6" name="Капитал" />
            <Bar dataKey="interest" fill="#22c55e" name="Проценты" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-3" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h3>{t('investmentMap')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div><span className="badge badge-success">{t('conservative')}</span> Депозиты 8%, Облигации 12%</div>
            <div><span className="badge badge-warning">{t('balanced')}</span> Акции 20%, ETF 15%, Недвижимость 10%</div>
            <div><span className="badge badge-danger">{t('aggressive')}</span> Крипта 50%, Бизнес 30%, VC 40%</div>
          </div>
        </div>

        <div className="card">
          <h3>DCA Калькулятор</h3>
          <p style={{ color: 'var(--subtext)', fontSize: 14 }}>
            При ежемесячных взносах {contribution.toLocaleString()} на {years} лет при {rate}% годовых
            средняя цена покупки будет оптимизирована через усреднение.
          </p>
        </div>

        <div className="card">
          <h3>Диверсификация</h3>
          <p style={{ color: 'var(--subtext)', fontSize: 14 }}>
            Индекс диверсификации вашего портфеля:{' '}
            <span className="metric-value">
              {(FinancialCore.diversificationScore(allocation as unknown as Record<string, number>) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}