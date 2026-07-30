import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  Newspaper, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Filter,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const News = () => {
  const { newsFeed, stocks, setActiveTab, setSelectedStockTicker } = useMarket();
  const [filterTicker, setFilterTicker] = useState('ALL');

  // Filter news feed (with robust target symbol matching)
  const filteredNews = filterTicker === 'ALL' 
    ? newsFeed 
    : newsFeed.filter(item => {
        if (!item.target) return false;
        const targetClean = item.target.toUpperCase();
        const filterClean = filterTicker.replace('.NS', '').replace('.BO', '').toUpperCase();
        return targetClean === filterClean || targetClean === 'ALL';
      });

  // Unique tickers list for filter dropdown dynamically created from watchlist
  const tickersList = ['ALL', ...stocks.map(s => s.ticker).filter(t => t !== '^NSEI' && t !== '^NSEBANK')];

  const handleTradeEvent = (ticker) => {
    if (ticker && ticker !== 'ALL') {
      setSelectedStockTicker(ticker);
      setActiveTab('simulator');
    }
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>News Room</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Monitor simulated macroeconomic releases and corporate bulletins that drive ticker volatility.</p>
      </div>

      {/* Control / Filter Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Tickers:</span>
        </div>
        
        {/* Horizontal filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {tickersList.map(ticker => {
            const isSelected = filterTicker === ticker;
            return (
              <button
                key={ticker}
                onClick={() => setFilterTicker(ticker)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  background: isSelected ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className={!isSelected ? "glass-card-interactive" : ""}
              >
                {ticker}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left News Feed, Right Educational Sidebar */}
      <div className="grid-main-layout">
        
        {/* Left Side: News Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredNews.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Newspaper size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>No announcements found matching ticker "{filterTicker}".</p>
            </div>
          ) : (
            filteredNews.map(item => {
              const isGood = item.type === 'good';
              const isBad = item.type === 'bad';
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                  className="glass-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className={`badge ${isGood ? 'badge-success' : isBad ? 'badge-danger' : 'badge-info'}`}>
                        {isGood ? '🟢 POSITIVE' : isBad ? '🔴 NEGATIVE' : '🔵 SYSTEM'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={12} /> {item.timestamp}
                      </span>
                    </div>
                    {item.target !== 'ALL' && (
                      <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                        Target: {item.target}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{item.headline}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.body}</p>

                  {item.target !== 'ALL' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
                      <button
                        onClick={() => handleTradeEvent(item.target)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        Trade {item.target} Event <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Educational Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)' }}>
              <HelpCircle size={16} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Trading on News?</h4>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Stock markets react rapidly to new disclosures. Public events like earnings reports, federal rulings, drug approvals, and product recalls alter general assumptions about future cash flows.
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.7rem'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>🟢 Positive Bulletins:</span>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.3' }}>Creates high buy-side volume, shifting supply-demand equilibrium higher. Look to enter long positions quickly.</p>
              
              <span style={{ fontWeight: 600, color: 'var(--danger)', display: 'block', marginTop: '0.35rem' }}>🔴 Negative Bulletins:</span>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.3' }}>Triggers retail sell-offs and institutional rebalancing, pushing valuation down. Set defensive stop-losses.</p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
              <CheckCircle size={16} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>News Drill-down</h4>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Our simulated engine triggers updates based on a random event loop. The stock's mathematical drift is modified temporarily upon news release:
            </p>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.3rem', borderRadius: '4px', color: 'var(--accent)' }}>DriftOverride = Impact * 0.45</code>
              <p style={{ marginTop: '0.35rem', lineHeight: '1.3' }}>The drift decay rate is set to 25% per tick, causing the price to gradually stabilize to its baseline volatility walk.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default News;
