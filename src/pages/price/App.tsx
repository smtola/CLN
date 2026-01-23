import React, { useEffect, useState } from 'react';
import QuoteForm from './components/QuoteForm';
import AdminPanel from './components/AdminPanel';
import QuoteHistory from './components/QuoteHistory';
import { getUser } from '../../authStorage';
import type { DecodeToken } from '../../types/auth';
type TabType = 'quote' | 'history' | 'ADMIN';

interface PriceAppProps {
  defaultTab?: TabType;
  showHeader?: boolean;
  showFooter?: boolean;
  onTabChange?: (tab: TabType) => void;
}

const PriceApp: React.FC<PriceAppProps> = ({
  defaultTab = 'quote',
  showHeader = true,
  showFooter = true,
  onTabChange,
}) => {
  const [user, setUser] = useState<DecodeToken>();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userToken = await getUser();
      setUser(userToken);
    };
    fetchUser();
  }, []);
  

  return (
    <div className="flex flex-col justify-between min-h-screen bg-[#e7e6e6]">
      {/* Header */}
      {showHeader && (
        <div className="navbar text-primary-content shadow-lg sticky top-0 z-50">
          <div className="flex-1">
            <a className="btn btn-white text-xl">CLN Quote System</a>
          </div>
          <div className="flex-none">
            <div className="tabs tabs-boxed">
              <a
                className={`tab ${activeTab === 'quote' ? 'tab-active' : ''}`}
                onClick={() => handleTabChange('quote')}
              >
                Get Quote
              </a>
              <a
                className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
                onClick={() => handleTabChange('history')}
              >
                History
              </a>
              {user?.role === 'ADMIN' && 
                <a
                  className={`tab ${activeTab === 'ADMIN' ? 'tab-active' : ''}`}
                  onClick={() => handleTabChange('ADMIN')}
                >
                  Admin
                </a>
              }
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        {activeTab === 'quote' && <QuoteForm />}
        {activeTab === 'history' && <QuoteHistory />}
        {activeTab === 'ADMIN' && <AdminPanel />}
      </div>

      {/* Footer */}
      {showFooter && (
        <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
          <aside>
            <p>© 2025 Logistics Quote System</p>
          </aside>
        </footer>
      )}
    </div>
  );
};

export default PriceApp;