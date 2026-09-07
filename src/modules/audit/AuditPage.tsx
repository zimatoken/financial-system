import { useDataStore } from '../../hooks/useDataStore';
import { calculateAuditScore } from '../../core/auditEngine';
import { CheckCircle, Circle, ClipboardCheck } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

export default function AuditPage({ store, t }: Props) {
  const audits = store.data.audits;
  const score = calculateAuditScore(audits);

  return (
    <div className="animate-fade-in">
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: `4px solid ${score > 70 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--danger)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}><ClipboardCheck size={20} /> Финансовый аудит</h3>
            <div style={{ color: 'var(--subtext)', marginTop: 4 }}>Еженедельная проверка 24 пунктов</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="metric-value">{score}%</div>
            <div className="metric-label">Выполнено</div>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: 12 }}>
          <div style={{ width: `${score}%`, background: score > 70 ? 'var(--success)' : score > 40 ? 'var(--warning)' : 'var(--danger)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {audits.map(audit => (
          <div
            key={audit.id}
            className="card"
            style={{
              cursor: 'pointer',
              background: audit.completed ? 'rgba(34,197,94,0.05)' : 'var(--card-bg)',
              borderColor: audit.completed ? 'var(--success)' : 'var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '1rem',
            }}
            onClick={() => store.updateAudit(audit.id, !audit.completed)}
          >
            <span style={{ color: audit.completed ? 'var(--success)' : 'var(--subtext)' }}>
              {audit.completed ? <CheckCircle size={22} /> : <Circle size={22} />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{audit.question}</div>
              <div style={{ fontSize: 12, color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{audit.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
