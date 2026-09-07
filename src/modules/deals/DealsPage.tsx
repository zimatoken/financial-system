import { useState } from 'react';
import { useDataStore } from '../../hooks/useDataStore';
import { Plus, Trash2, MoveRight } from 'lucide-react';
import type { Deal, TranslationKey } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

const stages = ['lead', 'negotiation', 'contract', 'closed', 'lost'] as const;
const stageLabels: Record<string, string> = { lead: 'Лид', negotiation: 'Переговоры', contract: 'Договор', closed: 'Закрыто', lost: 'Потеряно' };
const stageColors: Record<string, string> = { lead: '#3b82f6', negotiation: '#f59e0b', contract: '#8b5cf6', closed: '#22c55e', lost: '#ef4444' };

export default function DealsPage({ store, t }: Props) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState(0);
  const deals = store.data.deals;

  const addDeal = () => {
    if (!title) return;
    store.addDeal({ id: crypto.randomUUID(), title, stage: 'lead', value, probability: 20, contact: '', notes: '', createdAt: new Date().toISOString() });
    setTitle(''); setValue(0);
  };

  const moveStage = (id: string, dir: number) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;
    const idx = stages.indexOf(deal.stage);
    const next = stages[Math.max(0, Math.min(stages.length - 1, idx + dir))];
    store.updateDeal(id, { stage: next, probability: next === 'closed' ? 100 : next === 'lost' ? 0 : Math.min(100, deal.probability + dir * 20) });
  };

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" style={{ flex: 2 }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Название сделки" />
          <input className="input" style={{ flex: 1 }} type="number" value={value} onChange={e => setValue(+e.target.value)} placeholder="Сумма" />
          <button className="btn" onClick={addDeal}><Plus size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {stages.map(stage => (
          <div key={stage} className="card" style={{ padding: 8, borderTop: `3px solid ${stageColors[stage]}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--subtext)', marginBottom: 8, textAlign: 'center' }}>{stageLabels[stage]}</div>
            {deals.filter(d => d.stage === stage).map(deal => (
              <div key={deal.id} className="card" style={{ marginBottom: 8, background: 'rgba(59,130,246,0.05)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{deal.title}</div>
                <div style={{ fontSize: 12, color: 'var(--subtext)' }}>{deal.value.toLocaleString()} ₽</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  <button className="btn btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveStage(deal.id, -1)}>←</button>
                  <button className="btn btn-secondary" style={{ padding: '0.2rem' }} onClick={() => moveStage(deal.id, 1)}><MoveRight size={14} /></button>
                  <button className="btn btn-danger" style={{ padding: '0.2rem', marginLeft: 'auto' }} onClick={() => store.deleteDeal(deal.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
