import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Lessons from './components/Lessons';
import Simulator from './components/Simulator';
import Portfolio from './components/Portfolio';
import Quiz from './components/Quiz';
import News from './components/News';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import './styles/global.css';

const AppContent = () => {
  const { activeTab, appAlert } = useMarket();

  // Route renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'lessons':
        return <Lessons />;
      case 'simulator':
        return <Simulator />;
      case 'portfolio':
        return <Portfolio />;
      case 'quizzes':
        return <Quiz />;
      case 'news':
        return <News />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main viewport */}
      <main className="content-area">
        {renderTabContent()}
      </main>

      {/* Floating System Disclosures & Alerts */}
      {appAlert && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--bg-card)',
          border: '1px solid',
          borderColor: appAlert.type === 'success' 
            ? 'rgba(16, 185, 129, 0.4)' 
            : appAlert.type === 'error' 
              ? 'rgba(244, 63, 94, 0.4)' 
              : 'rgba(99, 102, 241, 0.4)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          maxWidth: '420px',
          zIndex: 9999,
          animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          backdropFilter: 'blur(12px)'
        }}>
          {appAlert.type === 'success' ? (
            <CheckCircle size={18} color="var(--success)" />
          ) : appAlert.type === 'error' ? (
            <AlertCircle size={18} color="var(--danger)" />
          ) : (
            <Info size={18} color="var(--primary)" />
          )}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' }}>
            {appAlert.message}
          </span>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <MarketProvider>
      <AppContent />
    </MarketProvider>
  );
}

export default App;
