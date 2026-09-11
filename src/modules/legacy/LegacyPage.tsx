import { useState } from 'react';
import { Gift, FileText, Users, Clock, Trash2, Plus } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  t: (key: TranslationKey) => string;
}

interface Heir {
  id: string;
  name: string;
  share: number;
}

export default function LegacyPage({ t }: Props) {
  const [heirs, setHeirs] = useState<Heir[]>([
    { id: crypto.randomUUID(), name: '', share: 50 },
  ]);
  const [hasWill, setHasWill] = useState(false);
  const [trust, setTrust] = useState(false);

  const totalShare = heirs.reduce((s, h) => s + (h.share || 0), 0);
  const isValid = totalShare <= 100;

  const addHeir = () => setHeirs([...heirs, { id: crypto.randomUUID(), name: '', share: 0 }]);
  const removeHeir = (id: string) => setHeirs(heirs.filter(h => h.id !== id));
  const updateHeir = (id: string, patch: Partial<Heir>) =>
    setHeirs(heirs.map(h => (h.id === id ? { ...h, ...patch } : h)));

  return (
    <div className="animate-fade-in">
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Завещание */}
        <div className="card">
          <h3><FileText size={18} /> {t('will')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input
              type="checkbox" id="will"
              checked={hasWill}
              onChange={e => setHasWill(e.target.checked)}
              style={{ width: 20, height: 20 }}
            />
            <label htmlFor="will" style={{ cursor: 'pointer' }}>{t('willConfirm')}</label>
          </div>
          {!hasWill && <div className="badge badge-danger">{t('recommendWill')}</div>}
        </div>

        {/* Траст */}
        <div className="card">
          <h3><Gift size={18} /> {t('trustFund')} <span title={t('trustTooltip')} style={{ cursor: 'help', color: 'var(--subtext)', fontSize: 14 }}>ⓘ</span></h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input
              type="checkbox" id="trust"
              checked={trust}
              onChange={e => setTrust(e.target.checked)}
              style={{ width: 20, height: 20 }}
            />
            <label htmlFor="trust" style={{ cursor: 'pointer' }}>{t('trustConfirm')}</label>
          </div>
          <div style={{ fontSize: 13, color: 'var(--subtext)' }}>{t('trustDescription')}</div>
        </div>
      </div>

      {/* Наследники */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ marginBottom: 0 }}><Users size={18} /> {t('heirs')}</h3>
          <button className="btn" onClick={addHeir} aria-label={t('add')}><Plus size={16} /></button>
        </div>

        {/* Прогресс суммы долей */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--subtext)', marginBottom: 4 }}>
            <span>{t('sharesSum')}</span>
            <span style={{ color: isValid ? 'var(--success)' : 'var(--danger)' }}>{totalShare}% / 100%</span>
          </div>
          <div className="progress-bar">
            <div
              style={{
                width: `${Math.min(100, totalShare)}%`,
                background: isValid ? 'var(--success)' : 'var(--danger)',
              }}
            />
          </div>
        </div>

        {heirs.map(h => (
          <div key={h.id} className="budget-row">
            <input
              className="input"
              value={h.name}
              onChange={e => updateHeir(h.id, { name: e.target.value })}
              placeholder={t('heirName')}
              title={t('heirName')}
            />
            <input
              className="input"
              type="number" min="0" max="100"
              value={h.share || ''}
              onChange={e => updateHeir(h.id, { share: Math.min(100, Math.max(0, +e.target.value)) })}
              placeholder={t('heirShare')}
              title={t('heirShareTooltip')}
            />
            <button className="btn btn-danger" onClick={() => removeHeir(h.id)} aria-label={t('delete')}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {!isValid && (
          <div className="badge badge-danger" style={{ marginTop: 8 }}>
            {t('sharesExceedError')}
          </div>
        )}
      </div>

      {/* План наследования */}
      <div className="card">
        <h3><Clock size={18} /> {t('legacyPlan')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div className="card" style={{ background: 'rgba(59,130,246,0.05)' }}>
            <div style={{ fontWeight: 600 }}>{t('legacyStep1Title')}</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>{t('legacyStep1Desc')}</div>
          </div>
          <div className="card" style={{ background: 'rgba(34,197,94,0.05)' }}>
            <div style={{ fontWeight: 600 }}>{t('legacyStep2Title')}</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>{t('legacyStep2Desc')}</div>
          </div>
          <div className="card" style={{ background: 'rgba(245,158,11,0.05)' }}>
            <div style={{ fontWeight: 600 }}>{t('legacyStep3Title')}</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>{t('legacyStep3Desc')}</div>
          </div>
          <div className="card" style={{ background: 'rgba(239,68,68,0.05)' }}>
            <div style={{ fontWeight: 600 }}>{t('legacyStep4Title')}</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>{t('legacyStep4Desc')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
