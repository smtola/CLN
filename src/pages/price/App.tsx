import React, { useEffect, useState } from 'react';
import QuoteForm from './components/QuoteForm';
import AdminPanel from './components/AdminPanel';
import QuoteHistory from './components/QuoteHistory';
import { getUser } from '../../authStorage';
import type { DecodeToken } from '../../types/auth';
import Logo from "/logo.png";
import { NavLink } from 'react-router-dom';
import PortManager from './components/PortManager';

type TabType = 'quote' | 'history' | 'ADMIN' | 'PORTS';

interface PriceAppProps {
  defaultTab?: TabType;
  showHeader?: boolean;
  showFooter?: boolean;
  onTabChange?: (tab: TabType) => void;
}

const ShipIcon = () => (
  <NavLink to="/">
    <img src={Logo} alt="logo" width={70} height={50} className="ms-2" />
  </NavLink>
);

const tabs: { key: TabType; label: string; adminOnly?: boolean }[] = [
  { key: 'quote',   label: 'Get Quote' },
  { key: 'history', label: 'My History' },
  { key: 'ADMIN',   label: 'Rate Manager', adminOnly: true },
  { key: 'PORTS',   label: 'Port Manager', adminOnly: true },
];

const PriceApp: React.FC<PriceAppProps> = ({
  defaultTab = 'quote',
  showHeader = true,
  showFooter = true,
  onTabChange,
}) => {
  const [user, setUser]           = useState<DecodeToken | undefined>();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  useEffect(() => {
    getUser().then(setUser).catch(() => {});
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const visibleTabs = tabs.filter(t => !t.adminOnly || user?.role === 'ADMIN');

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f0f2f5', fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>

      {/* ── Top navbar ── */}
      {showHeader && (
        <header className="sticky top-0 z-50 shadow-md" style={{ background: '#4f9848' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-14">

            {/* Brand */}
            <div className="flex items-center justify-start gap-2.5 text-white">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: '#4F9848' }}>
                <ShipIcon />
              </div>
              <span className="font-bold text-xl sm:block hidden tracking-tight text-nowrap">Quote System</span>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-1">
              {visibleTabs.map(tab => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className="relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-150"
                    style={{
                      color:      active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                      background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                    }}
                  >
                    {tab.label}
                    {active && (
                      <span
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full text-nowrap"
                        style={{ background: '#EE3A23' }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User pill */}
            {user && (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: '#4F9848' }}
                >
                  {user.username?.charAt(0).toUpperCase() ?? 'U'}
                </span>
                {user.username}
                {user.role === 'ADMIN' && (
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded" style={{ background: '#EE3A23', color: 'white' }}>
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      {/* ── Page content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {activeTab === 'quote'   && <QuoteForm />}
        {activeTab === 'history' && <QuoteHistory />}
        {activeTab === 'ADMIN'   && <AdminPanel />}
        {activeTab === 'PORTS'   && <PortManager />}
      </main>

      {/* ── Footer ── */}
      {showFooter && (
        <footer className="border-t text-center py-4 text-xs" style={{ borderColor: '#d1d5db', color: '#9ca3af', background: '#f0f2f5' }}>
          © {new Date().getFullYear()} CLN Logistics — Freight Quote System
        </footer>
      )}
    </div>
  );
};

export default PriceApp;