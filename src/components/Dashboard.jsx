import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BookOpen, 
  ArrowRight, 
  Clock,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { 
    cash, 
    portfolio, 
    stocks, 
    lessons, 
    getPortfolioValue, 
    getNetWorth, 
    setActiveTab,
    setSelectedStockTicker,
    searchRealTimeStock,
    addStockToWatchlist,
    isApiLoading,
    apiErrorMsg,
    syncStocksListWithAPI
  } = useMarket();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const portfolioValue = getPortfolioValue();
  const netWorth = getNetWorth();

  // Find next uncompleted lesson
  const nextLesson = lessons.find(l => !l.completed) || lessons[lessons.length - 1];

  // Daily performance calculation
  let dailyGainLoss = 0;
  let portfolioPrevValue = 0;

  Object.keys(portfolio).forEach(ticker => {
    const stock = stocks.find(s => s.ticker === ticker);
    const hold = portfolio[ticker];
    if (stock) {
      dailyGainLoss += (stock.price - stock.prevClose) * hold.quantity;
      portfolioPrevValue += stock.prevClose * hold.quantity;
    }
  });

  const dailyGainLossPercent = portfolioPrevValue === 0 ? 0 : parseFloat(((dailyGainLoss / portfolioPrevValue) * 100).toFixed(2));

  // Sort watchlist by gain percent
  const sortedStocks = [...stocks].map(s => {
    const change = parseFloat((s.price - s.prevClose).toFixed(2));
    const pct = parseFloat(((change / s.prevClose) * 100).toFixed(2));
    return { ...s, change, pct };
  }).sort((a, b) => b.pct - a.pct);

  const topGainer = sortedStocks[0];
  const topLoser = sortedStocks[sortedStocks.length - 1];

  // Autocomplete search handler
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchRealTimeStock(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchResultClick = async (ticker) => {
    const success = await addStockToWatchlist(ticker);
    if (success) {
      setSearchQuery('');
      setSearchResults([]);
      setActiveTab('simulator');
    }
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Indian Stock Market</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Real-time paper trading and financial classroom. Trade actual NSE/BSE equities.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={syncStocksListWithAPI}
            disabled={isApiLoading}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Refresh Live Data"
          >
            <RefreshCw size={14} className={isApiLoading ? 'spin-animation' : ''} style={{ transition: 'transform 0.5s ease' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <Clock size={16} color="var(--accent)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Market: </span>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>REAL TIME</span>
          </div>
        </div>
      </div>

      {/* Error Announcement */}
      {apiErrorMsg && (
        <div style={{
          background: 'var(--danger-glow)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--danger)'
        }}>
          <AlertCircle size={16} />
          {apiErrorMsg}
        </div>
      )}

      {/* Live search box */}
      <div className="glass-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Quote Search & Lookup</h3>
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search company name or symbol (e.g. Tata Motors, RELIANCE, TCS, SBIN)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '0.75rem 0.75rem 0.75rem 2.25rem',
              color: '#fff',
              outline: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'border-color var(--transition-fast)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Autocomplete suggestions dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(10px)'
          }}>
            {searchResults.map(result => (
              <div
                key={result.ticker}
                onClick={() => handleSearchResultClick(result.ticker)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1.25rem',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'background var(--transition-fast)'
                }}
                className="glass-card-interactive"
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{result.ticker}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>{result.name}</span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{result.exchange}</span>
              </div>
            ))}
          </div>
        )}

        {isSearching && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Searching ticker database...</p>
        )}
      </div>

      {/* Financial performance metrics */}
      <div className="grid-3">
        {/* Net Worth */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Net Worth (Cash + Equity)</span>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.4rem', borderRadius: '8px' }}>
              <span style={{ fontWeight: 700 }}>₹</span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            {dailyGainLoss >= 0 ? (
              <>
                <TrendingUp size={14} className="stat-up" />
                <span className="stat-up" style={{ fontWeight: 600 }}>+₹{dailyGainLoss.toFixed(2)} ({dailyGainLossPercent}%)</span>
              </>
            ) : (
              <>
                <TrendingDown size={14} className="stat-down" />
                <span className="stat-down" style={{ fontWeight: 600 }}>-₹{Math.abs(dailyGainLoss).toFixed(2)} ({dailyGainLossPercent}%)</span>
              </>
            )}
            <span style={{ color: 'var(--text-muted)' }}>today</span>
          </div>
        </div>

        {/* Portfolio Value */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Securities Value</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Current market value of assets in active holdings</p>
        </div>

        {/* Cash Balance */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Liquid Paper Cash</span>
            <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '0.4rem', borderRadius: '8px' }}>
              <span style={{ fontWeight: 700 }}>₹</span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{cash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Indian Rupees paper cash available for executing buy trades</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid-main-layout">
        
        {/* Left Column Watchlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top gainers / losers */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Market Movers</h3>
            <div className="grid-2">
              {topGainer && (
                <div 
                  onClick={() => { setSelectedStockTicker(topGainer.ticker); setActiveTab('simulator'); }}
                  style={{
                    background: 'var(--success-glow)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <p style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Gainer 🚀</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{topGainer.name}</span>
                    <span className="stat-up" style={{ fontWeight: 700, fontSize: '0.95rem' }}>+{topGainer.pct}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    <span>Ticker: <strong>{topGainer.ticker}</strong></span>
                    <span>Price: <strong>₹{topGainer.price}</strong></span>
                  </div>
                </div>
              )}

              {topLoser && (
                <div 
                  onClick={() => { setSelectedStockTicker(topLoser.ticker); setActiveTab('simulator'); }}
                  style={{
                    background: 'var(--danger-glow)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <p style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Loser 📉</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{topLoser.name}</span>
                    <span className="stat-down" style={{ fontWeight: 700, fontSize: '0.95rem' }}>{topLoser.pct}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    <span>Ticker: <strong>{topLoser.ticker}</strong></span>
                    <span>Price: <strong>₹{topLoser.price}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Watchlist table */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>NSE India Watchlist</h3>
              <button 
                onClick={() => setActiveTab('simulator')}
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                Go to Simulator <ArrowRight size={12} />
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Company</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Sector</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.map(stock => {
                    const isUp = stock.pct >= 0;
                    return (
                      <tr 
                        key={stock.ticker}
                        onClick={() => {
                          setSelectedStockTicker(stock.ticker);
                          setActiveTab('simulator');
                        }}
                        style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85rem', cursor: 'pointer' }}
                        className="glass-card-interactive"
                      >
                        <td style={{ padding: '0.8rem 0.5rem', fontWeight: 600 }}>
                          <div>{stock.name}</div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{stock.ticker}</span>
                        </td>
                        <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-secondary)' }}>{stock.sector}</td>
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>₹{stock.price.toFixed(2)}</td>
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 600, color: isUp ? 'var(--success)' : 'var(--danger)' }}>
                          {isUp ? `+${stock.pct}%` : `${stock.pct}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Next Lesson Box */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, var(--bg-card), rgba(99, 102, 241, 0.05))',
            borderColor: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <BookOpen size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Learning Path</span>
            </div>
            
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{nextLesson.category}</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>{nextLesson.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>{nextLesson.description}</p>
            </div>

            <button 
              onClick={() => setActiveTab('lessons')}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Start Lesson (+{nextLesson.xpReward} XP) <ArrowRight size={14} />
            </button>
          </div>

          {/* Guidelines info card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>NSE Indian Market Guide</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              All prices represent actual Indian security updates. If you search for stocks, make sure to look for NSE tickers (e.g., search company name and click, or enter symbol with `.NS` suffix).
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.7rem',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.75rem'
            }}>
              <span style={{ fontWeight: 600 }}>💡 Trading Hours:</span>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.3' }}>Monday - Friday (9:15 AM to 3:30 PM IST). Outside of these hours, the chart will display the latest closing values.</p>
            </div>
          </div>
        </div>

      </div>

      {/* CSS Animation injection */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default Dashboard;
