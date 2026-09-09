import { useMemo, useState } from 'react';
import FinancialCore from '../../core/financialCore';
import { Snowflake, Flame, Trash2, Plus } from 'lucide-react';
import type { DebtItem, TranslationKey } from '../../types';

interface Props {
  t: (key: TranslationKey) => string;
  lang?: 'ru' | 'en';
}

type Strategy = 'snowball' | 'avalanche';

const makeFormatter = (lang: 'ru' | 'en') =>
  new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU', { maximumFractionDigits: 0 });

const rub = (fmt: Intl.NumberFormat, value: number) => `${fmt.format(Math.round(value))} ₽`;

/**
 * Симуляция погашения по стратегии.
 * Когда долг закрыт — его ежемесячный платёж перенаправляется на следующий долг в очереди.
 * Возвращает полную переплату (проценты) и порядок погашения.
 */
function simulateStrategy(debts: DebtItem[], strategy: Strategy) {
  const ordered = strategy === 'snowball'
    ? [...debts].sort((a, b) => a.balance - b.balance)
    : [...debts].sort((a, b) => b.interestRate - a.interestRate);

  const queue = ordered.map(d => ({ ...d }));
  let totalInterest = 0;
  let months = 0;
  const MAX_MONTHS = 1200; // страховка от бесконечного цикла (100 лет)

  while (queue.some(d => d.balance > 0.5) && months < MAX_MONTHS) {
    months++;
    let freed = 0; // освободившийся платёж текущего месяца
    for (const d of queue) {
      if (d.balance <= 0.5) continue;
      const payment = (d.monthlyPayment || d.balance * 0.05) + freed;
      freed = 0;
      const interest = (d.balance * d.interestRate) / 100 / 12;
      const due = d.balance + interest;
      totalInterest += interest;
      if (payment >= due) {
        freed = payment - due; // излишек — на следующий долг
        d.balance = 0;
      } else {
        d.balance = due - payment;
      }
    }
  }
  return { totalInterest, months, order: ordered.map(d => d.id) };
}

export default function DebtPage({ t, lang = 'ru' }: Props) {
  const fmt = makeFormatter(lang);

  const [debts, setDebts] = useState<DebtItem[]>([
    { id: '1', name: 'Кредитная карта', balance: 150000, interestRate: 25, monthlyPayment: 15000, type: 'bad', priority: 'critical' },
    { id: '2', name: 'Ипотека', balance: 3000000, interestRate: 10, monthlyPayment: 35000, type: 'good', priority: 'low' },
  ]);
  const [strategy, setStrategy] = useState<Strategy>('snowball');

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const consolidation = FinancialCore.consolidateDebts(debts);

  // Симуляции обеих стратегий — чтобы показать реальную разницу в переплате
  const sims = useMemo(
    () => ({
      snowball: simulateStrategy(debts, 'snowball'),
      avalanche: simulateStrategy(debts, 'avalanche'),
    }),
    [debts]
  );
  const current = sims[strategy];
  const other = strategy === 'snowball' ? sims.avalanche : sims.snowball;
  const savingsVsOther = Math.max(0, Math.round(other.totalInterest - current.totalInterest));

  const sortedDebts = strategy === 'snowball'
    ? [...debts].sort((a, b) => a.balance - b.balance)
    : [...debts].sort((a, b) => b.interestRate - a.interestRate);

  const updateDebt = (i: number, patch: Partial<DebtItem>) =>
    setDebts(debts.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const addDebt = () =>
    setDebts([...debts, {
      id: crypto.randomUUID(),
      name: '',
      balance: 0,
      interestRate: 10,
      monthlyPayment: 0,
      type: 'bad',
      priority: 'high',
    }]);

  return (
    <div className="animate-fade-in">
      {/* Метрики */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="metric-label">{t('totalDebt')}</div>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>{rub(fmt, totalDebt)}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="metric-label">{t('averageRate')}</div>
          <div className="metric-value">{consolidation.weightedRate.toFixed(2)}%</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="metric-label">{t('recommendation')}</div>
          <div style={{ fontSize: 14, color: 'var(--subtext)' }}>
            {consolidation.recommendation === 'refinance' ? t('refinance') : t('ratesAcceptable')}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Левая колонка: список долгов */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{t('myDebts')}</h3>
            <button className="btn" onClick={addDebt} aria-label={t('add')}><Plus size={16} /></button>
          </div>
          {debts.map((debt, i) => (
            <div key={debt.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                className="input"
                style={{ flex: 2, minWidth: 140 }}
                placeholder={t('debtName')}
                value={debt.name}
                onChange={e => updateDebt(i, { name: e.target.value })}
              />
              <input
                className="input"
                style={{ flex: 1, minWidth: 100 }}
                type="number" min="0"
                placeholder={t('debtBalance')}
                title={t('debtBalance')}
                value={debt.balance || ''}
                onChange={e => updateDebt(i, { balance: Math.max(0, +e.target.value) })}
              />
              <input
                className="input"
                style={{ flex: 1, minWidth: 90 }}
                type="number" min="0" max="100"
                placeholder={t('interestRate')}
                title={t('interestRate')}
                value={debt.interestRate || ''}
                onChange={e => updateDebt(i, { interestRate: Math.min(100, Math.max(0, +e.target.value)) })}
              />
              <input
                className="input"
                style={{ flex: 1, minWidth: 110 }}
                type="number" min="0"
                placeholder={t('monthlyPayment')}
                title={t('monthlyPayment')}
                value={debt.monthlyPayment || ''}
                onChange={e => updateDebt(i, { monthlyPayment: Math.max(0, +e.target.value) })}
              />
              <select
                className="input select"
                style={{ flex: 1, minWidth: 100 }}
                value={debt.type}
                onChange={e => updateDebt(i, { type: e.target.value as DebtItem['type'] })}
              >
                <option value="bad">{t('bad')}</option>
                <option value="good">{t('good')}</option>
              </select>
              <button
                className="btn btn-danger"
                onClick={() => setDebts(debts.filter((_, idx) => idx !== i))}
                aria-label={t('delete')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Правая колонка: стратегия */}
        <div className="card">
          <h3>{t('repaymentStrategy')}</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              className={`btn ${strategy === 'snowball' ? '' : 'btn-secondary'}`}
              onClick={() => setStrategy('snowball')}
            >
              <Snowflake size={16} /> {t('snowball')}
            </button>
            <button
              className={`btn ${strategy === 'avalanche' ? '' : 'btn-secondary'}`}
              onClick={() => setStrategy('avalanche')}
            >
              <Flame size={16} /> {t('avalanche')}
            </button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--subtext)', marginBottom: 16 }}>
            {strategy === 'snowball' ? t('snowballHint') : t('avalancheHint')}
          </div>

          {/* Реальная разница между стратегиями */}
          <div className="card" style={{ background: 'rgba(59,130,246,0.08)', marginBottom: 16 }}>
            <div className="metric-label">{t('overpayment')}</div>
            <div className="metric-value" style={{ color: 'var(--warning)' }}>
              {rub(fmt, current.totalInterest)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--subtext)' }}>
              {t('term')}: {current.months} {t('monthsToPayoff')}
              {savingsVsOther > 0 && (
                <> · <span style={{ color: 'var(--success)' }}>
                  {rub(fmt, savingsVsOther)} {t('betterThanOther')} «{strategy === 'snowball' ? t('avalanche') : t('snowball')}»
                </span></>
              )}
            </div>
          </div>

          <div style={{ fontSize: 13, color: 'var(--subtext)', marginBottom: 8 }}>{t('payoffOrder')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedDebts.map((debt, idx) => {
              const payoff = FinancialCore.calculatePayoff(
                debt.balance,
                debt.monthlyPayment || debt.balance * 0.05,
                debt.interestRate
              );
              return (
                <div key={debt.id} className="card" style={{ background: 'rgba(59,130,246,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>
                      {idx + 1}. {debt.name || t('debtName')}
                      {idx === 0 && (
                        <span className="badge badge-success" style={{ marginLeft: 8 }}>
                          {t('firstInQueue')}
                        </span>
                      )}
                    </span>
                    <span className={`badge badge-${debt.type === 'bad' ? 'danger' : 'success'}`}>
                      {debt.type === 'bad' ? t('bad') : t('good')}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--subtext)', marginTop: 4 }}>
                    {`${t('balance')}: ${rub(fmt, debt.balance)} | ${t('rate')}: ${debt.interestRate}% | ${t('term')}: ${payoff.years.toFixed(1)} ${t('years')} | ${t('totalInterest')}: ${rub(fmt, payoff.totalInterest)}`}
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
