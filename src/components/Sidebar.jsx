import React from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Briefcase, 
  Award, 
  Newspaper, 
  Volume2, 
  VolumeX, 
  Trophy 
} from 'lucide-react';

const Sidebar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    getLevelInfo, 
    badges, 
    audioNotifications, 
    setAudioNotifications 
  } = useMarket();

  const { level, rankName, xp, nextXpLimit, prevXpLimit, progressPercent } = getLevelInfo();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'simulator', label: 'Simulator', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'quizzes', label: 'Quizzes', icon: Award },
    { id: 'news', label: 'News Room', icon: Newspaper }
  ];

  return (
    <aside className="sidebar">
      {/* Brand logo */}
      <div style={{
        padding: '1.75rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '0.5rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)'
        }}>
          <TrendingUp size={22} color="#fff" />
        </div>
        <div>
          <h2 className="brand-font" style={{ fontSize: '1.25rem', fontWeight: 800 }}>TradeCraft</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Academy</span>
        </div>
      </div>

      {/* User profile rank card */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1.5px solid var(--primary)',
              color: 'var(--primary)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.2)'
            }}>
              {level}
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Rank</p>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rankName}</h4>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
              <span>XP: {xp} / {nextXpLimit}</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>

          {/* Achievements Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.6rem', marginTop: '0.1rem' }}>
            <Trophy size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Badges: <strong>{badges.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.8rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer controls & Audio Toggle */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          © 2026 Antigravity
        </span>
        <button
          onClick={() => setAudioNotifications(!audioNotifications)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          title={audioNotifications ? "Mute sounds" : "Unmute sounds"}
        >
          {audioNotifications ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
