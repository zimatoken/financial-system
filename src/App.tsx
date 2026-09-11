import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useDataStore } from './hooks/useDataStore';
import { defaultAuditQuestions, calculateAuditScore } from './core/auditEngine';
import type { ModuleId } from './types';

// Icons
import {
  LayoutDashboard, Wallet, TrendingUp, CreditCard, Receipt,
  Shield, Gift, BarChart3, ClipboardCheck, MessageCircle,
  Settings, Briefcase, ArrowLeftRight, Menu, X, Moon, Sun, Globe
} from 'lucide-react';

// Pages
import Dashboard from './modules/dashboard/DashboardPage';
import BudgetPage from './modules/budget/BudgetPage';
import InvestPage from './modules/invest/InvestPage';
import DebtPage from './modules/debt/DebtPage';
import TaxPage from './modules/tax/TaxPage';
import InsurancePage from './modules/insurance/InsurancePage';
import LegacyPage from './modules/legacy/LegacyPage';
import AnalyticsPage from './modules/analytics/AnalyticsPage';
import AuditPage from './modules/audit/AuditPage';
import MessengerPage from './modules/messenger/MessengerPage';
import SettingsPage from './modules/settings/SettingsPage';
import DealsPage from './modules/deals/DealsPage';
import BarterPage from './modules/barter/BarterPage';

const navItems: { id: ModuleId; label: string; icon: React.ReactNode; category: string }[] = [
  { id: 'dashboard', label: 'dashboard', icon: <LayoutDashboard size={18} />, category: 'core' },
  { id: 'budget', label: 'budget', icon: <Wallet size={18} />, category: 'core' },
  { id: 'invest', label: 'invest', icon: <TrendingUp size={18} />, category: 'core' },
  { id: 'debt', label: 'debt', icon: <CreditCard size={18} />, category: 'core' },
  { id: 'tax', label: 'tax', icon: <Receipt size={18} />, category: 'core' },
  { id: 'insurance', label: 'insurance', icon: <Shield size={18} />, category: 'core' },
  { id: 'legacy', label: 'legacy', icon: <Gift size={18} />, category: 'core' },
  { id: 'analytics', label: 'analytics', icon: <BarChart3 size={18} />, category: 'analytics' },
  { id: 'audit', label: 'audit', icon: <ClipboardCheck size={18} />, category: 'analytics' },
  { id: 'deals', label: 'deals', icon: <Briefcase size={18} />, category: 'trade' },
  { id: 'barter', label: 'barter', icon: <ArrowLeftRight size={18} />, category: 'trade' },
  { id: 'messenger', label: 'messenger', icon: <MessageCircle size={18} />, category: 'communication' },
  { id: 'settings', label: 'settings', icon: <Settings size={18} />, category: 'system' },
];

export default function App() {
  const { theme, toggle } = useTheme();
  const { lang, t, setLanguage } = useLanguage();
  const store = useDataStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (store.data.audits.length === 0) {
      store.setAudits(defaultAuditQuestions);
    }
  }, []);

  const auditScore = calculateAuditScore(store.data.audits);

  const currentPath = location.pathname.slice(1) || 'dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        className="scrollbar"
        style={{
          width: sidebarOpen ? 260 : 64,
          background: 'var(--card-bg)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          position: 'fixed',
          top: 0, bottom: 0, left: 0,
          zIndex: 100,
          overflowY: 'auto',
        }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">🏛️</div>
          {sidebarOpen && (
            <div className="sidebar-titles">
              <div className="sidebar-title" title={t('appTitle')}>{t('appTitle')}</div>
              <div className="sidebar-subtitle" title={t('appSubtitle')}>{t('appSubtitle')}</div>
            </div>
          )}
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {navItems.map(item => {
            const active = currentPath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { navigate(`/${item.id}`); setMobileMenu(false); }}
                className="btn-secondary"
                style={{
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--text)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem',
                  fontSize: 14,
                  width: '100%',
                }}
                title={t(item.label as any)}
              >
                {item.icon}
                {sidebarOpen && <span style={{ marginLeft: 10, whiteSpace: 'nowrap' }}>{t(item.label as any)}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--subtext)', marginBottom: 4 }}>Аудит прогресс</div>
            <div className="progress-bar">
              <div style={{ width: `${auditScore}%`, background: auditScore > 70 ? 'var(--success)' : auditScore > 40 ? 'var(--warning)' : 'var(--danger)' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--subtext)', marginTop: 4, textAlign: 'right' }}>{auditScore}%</div>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileMenu && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 260 : 64,
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top bar */}
        <header style={{
          height: 60,
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn-secondary"
              style={{ padding: '0.4rem', display: 'none' }}
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={20} />
            </button>
            <h1 style={{ fontSize: 18, color: 'var(--heading)' }}>
              {t(navItems.find(n => n.id === currentPath)?.label as any || 'dashboard')}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-secondary" onClick={() => setLanguage(lang === 'ru' ? 'en' : 'ru')} style={{ padding: '0.4rem 0.8rem' }}>
              <Globe size={16} /> {lang.toUpperCase()}
            </button>
            <button className="btn-secondary" onClick={toggle} style={{ padding: '0.4rem' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{store.data.profile.avatar}</span>
              <span style={{ fontWeight: 500, color: 'var(--heading)' }}>{store.data.profile.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard store={store} t={t} />} />
            <Route path="/dashboard" element={<Dashboard store={store} t={t} />} />
            <Route path="/budget" element={<BudgetPage store={store} t={t} />} />
            <Route path="/invest" element={<InvestPage t={t} />} />
            {/* ✅ ИСПРАВЛЕНО: добавил lang={lang} */}
            <Route path="/debt" element={<DebtPage t={t} lang={lang} />} />
            <Route path="/tax" element={<TaxPage t={t} />} />
            <Route path="/insurance" element={<InsurancePage store={store} t={t} />} />
            <Route path="/legacy" element={<LegacyPage t={t} />} />
            <Route path="/analytics" element={<AnalyticsPage store={store} t={t} />} />
            <Route path="/audit" element={<AuditPage store={store} t={t} />} />
            <Route path="/messenger" element={<MessengerPage store={store} t={t} />} />
            <Route path="/settings" element={<SettingsPage store={store} t={t} />} />
            <Route path="/deals" element={<DealsPage store={store} t={t} />} />
            <Route path="/barter" element={<BarterPage store={store} t={t} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
