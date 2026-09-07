import { useDataStore } from '../../hooks/useDataStore';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Download, Upload, User, Globe, Moon } from 'lucide-react';
import type { TranslationKey } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

const avatars = ['👤', '🦁', '🦊', '🐼', '🐯', '🚀', '💎', '👑'];

export default function SettingsPage({ store, t }: Props) {
  const { theme, toggle } = useTheme();
  const { lang, setLanguage } = useLanguage();
  const profile = store.data.profile;

  return (
    <div className="animate-fade-in">
      <div className="grid-2">
        <div className="card">
          <h3><User size={18} /> {t('profile')}</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--subtext)' }}>Имя</label>
            <input className="input" value={profile.name} onChange={e => store.updateProfile({ name: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--subtext)' }}>Аватар</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {avatars.map(a => (
                <button key={a} className="btn btn-secondary" onClick={() => store.updateProfile({ avatar: a })} style={{ fontSize: 24, padding: '0.5rem', background: profile.avatar === a ? 'var(--primary)' : undefined }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3><Moon size={18} /> {t('settings')}</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--subtext)' }}>Тема</label>
            <button className="btn" onClick={toggle} style={{ marginTop: 8, width: '100%' }}>
              {theme === 'dark' ? t('darkTheme') : t('lightTheme')}
            </button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--subtext)' }}><Globe size={14} /> {t('language')}</label>
            <button className="btn btn-secondary" onClick={() => setLanguage(lang === 'ru' ? 'en' : 'ru')} style={{ marginTop: 8, width: '100%' }}>
              {lang === 'ru' ? 'Русский' : 'English'}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Данные</h3>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button className="btn" onClick={store.exportJSON}><Download size={16} /> {t('exportData')}</button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> {t('importData')}
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && store.importJSON(e.target.files[0])} />
          </label>
        </div>
      </div>
    </div>
  );
}
