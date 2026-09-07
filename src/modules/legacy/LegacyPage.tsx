import { useState } from 'react';
import { Gift, FileText, Users, Clock } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  t: (key: TranslationKey) => string;
}

export default function LegacyPage({ t }: Props) {
  const [heirs, setHeirs] = useState([{ name: '', share: 50 }]);
  const [hasWill, setHasWill] = useState(false);
  const [trust, setTrust] = useState(false);

  return (
    <div className="animate-fade-in">
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3><FileText size={18} /> Завещание</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input type="checkbox" id="will" checked={hasWill} onChange={e => setHasWill(e.target.checked)} style={{ width: 20, height: 20 }} />
            <label htmlFor="will" style={{ cursor: 'pointer' }}>У меня оформлено завещание</label>
          </div>
          {!hasWill && (
            <div className="badge badge-danger">Рекомендуется оформить</div>
          )}
        </div>

        <div className="card">
          <h3><Gift size={18} /> Траст / Фонд</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input type="checkbox" id="trust" checked={trust} onChange={e => setTrust(e.target.checked)} style={{ width: 20, height: 20 }} />
            <label htmlFor="trust" style={{ cursor: 'pointer' }}>Создан семейный траст</label>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3><Users size={18} /> Наследники</h3>
        {heirs.map((h, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input className="input" style={{ flex: 2 }} value={h.name} onChange={e => { const arr = [...heirs]; arr[i].name = e.target.value; setHeirs(arr); }} placeholder="ФИО наследника" />
            <input className="input" style={{ flex: 1 }} type="number" value={h.share} onChange={e => { const arr = [...heirs]; arr[i].share = +e.target.value; setHeirs(arr); }} placeholder="Доля %" />
            <button className="btn btn-danger" onClick={() => setHeirs(heirs.filter((_, idx) => idx !== i))}>Удалить</button>
          </div>
        ))}
        <button className="btn" onClick={() => setHeirs([...heirs, { name: '', share: 0 }])}>Добавить наследника</button>
      </div>

      <div className="card">
        <h3><Clock size={18} /> План наследования</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <div className="card" style={{ background: 'rgba(59,130,246,0.05)' }}>
            <div style={{ fontWeight: 600 }}>1. Составьте инвентаризацию активов</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>Список всех счетов, недвижимости, инвестиций, страховок</div>
          </div>
          <div className="card" style={{ background: 'rgba(34,197,94,0.05)' }}>
            <div style={{ fontWeight: 600 }}>2. Оформите завещание</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>У нотариуса, с указанием всех наследников и долей</div>
          </div>
          <div className="card" style={{ background: 'rgba(245,158,11,0.05)' }}>
            <div style={{ fontWeight: 600 }}>3. Назначьте бенефициаров</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>В страховках, пенсионных фондах, брокерских счетах</div>
          </div>
          <div className="card" style={{ background: 'rgba(239,68,68,0.05)' }}>
            <div style={{ fontWeight: 600 }}>4. Создайте семейный траст (опционально)</div>
            <div style={{ fontSize: 14, color: 'var(--subtext)' }}>Для защиты активов и управления наследством</div>
          </div>
        </div>
      </div>
    </div>
  );
}
