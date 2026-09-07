import { useState } from 'react';
import { useDataStore } from '../../hooks/useDataStore';
import { Plus, Trash2, Search } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

export default function BarterPage({ store, t }: Props) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [wanted, setWanted] = useState('');
  const [search, setSearch] = useState('');

  const add = () => {
    if (!title) return;
    store.addBarter({ id: crypto.randomUUID(), title, description: desc, category: 'general', wanted, contact: store.data.profile.name, createdAt: new Date().toISOString() });
    setTitle(''); setDesc(''); setWanted('');
  };

  const filtered = store.data.barters.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.wanted.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input className="input" style={{ flex: 1 }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Что предлагаете" />
          <input className="input" style={{ flex: 1 }} value={wanted} onChange={e => setWanted(e.target.value)} placeholder="Что ищете" />
          <button className="btn" onClick={add}><Plus size={16} /></button>
        </div>
        <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Описание" />
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={18} color="var(--subtext)" />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." style={{ border: 'none', background: 'transparent' }} />
        </div>
      </div>

      <div className="grid-2">
        {filtered.map(item => (
          <div key={item.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3 style={{ margin: 0 }}>{item.title}</h3>
              <button className="btn btn-danger" onClick={() => store.deleteBarter(item.id)}><Trash2 size={14} /></button>
            </div>
            <p style={{ color: 'var(--subtext)', margin: '8px 0', fontSize: 14 }}>{item.description}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-info">Ищу: {item.wanted}</span>
              <span style={{ fontSize: 12, color: 'var(--subtext)', marginLeft: 'auto' }}>{item.contact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
