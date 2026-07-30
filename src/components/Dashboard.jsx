import React from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Award, 
  BookOpen, 
  ArrowRight, 
  Newspaper,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { 
    cash, 
    portfolio, 
    stocks, 
    lessons, 
    newsFeed, 
    transactionHistory,
    getPortfolioValue, 
    getNetWorth, 
    setActiveTab,
    setSelectedStockTicker
  } = useMarket();

  const portfolioValue = getPortfolioValue();
  const netWorth = getNetWorth();

  // Find next uncompleted lesson
  const nextLesson = lessons.find(l => !l.completed) || lessons[lessons.length - 1];

  // Calculate daily gains / losses
  // Let's compare current price vs previous close for portfolio holdings
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

  // Sort stocks to find top gainers and losers
  const sortedStocks = [...stocks].map(s => {
    const change = parseFloat((s.price - s.prevClose).toFixed(2));
    const pct = parseFloat(((change / s.prevClose) * 100).toFixed(2));
    return { ...s, change, pct };
  }).sort((a, b) => b.pct - a.pct);

  const topGainer = sortedStocks[0];
  const topLoser = sortedStocks[sortedStocks.length - 1];

  const handleNewsClick = (ticker) => {
    if (ticker && ticker !== 'ALL') {
      setSelectedStockTicker(ticker);
      setActiveTab('simulator');
    } else {
      setActiveTab('news');
    }
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Market Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Welcome to the paper trading dashboard. Watch live prices and build your strategy.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <Clock size={16} color="var(--accent)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Market: </span>
          <span className="badge badge-success">LIVE SIMULATED</span>
        </div>
      </div>

      {/* Top row cards (Financial performance metrics) */}
      <div className="grid-3">
        {/* Net Worth */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', relative: 'true' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Net Worth (Equity + Cash)</span>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.4rem', borderRadius: '8px' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            {dailyGainLoss >= 0 ? (
              <>
                <TrendingUp size={14} className="stat-up" />
                <span className="stat-up" style={{ fontWeight: 600 }}>+${dailyGainLoss.toFixed(2)} ({dailyGainLossPercent}%)</span>
              </>
            ) : (
              <>
                <TrendingDown size={14} className="stat-down" />
                <span className="stat-down" style={{ fontWeight: 600 }}>-${Math.abs(dailyGainLoss).toFixed(2)} ({dailyGainLossPercent}%)</span>
              </>
            )}
            <span style={{ color: 'var(--text-muted)' }}>today</span>
          </div>
        </div>

        {/* Portfolio Value */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Invested Securities</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Value of holdings fluctuating with live market ticks</p>
        </div>

        {/* Cash Balance */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Available Liquid Cash</span>
            <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '0.4rem', borderRadius: '8px' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Reserve buying power for executing instant orders</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid-main-layout">
        
        {/* Left Column (Market overview & News) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top gainers / losers */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Market Movers</h3>
            <div className="grid-2">
              {topGainer && (
                <div 
                  onClick={() => handleNewsClick(topGainer.ticker)}
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
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{topGainer.name}</span>
                    <span className="stat-up" style={{ fontWeight: 700, fontSize: '0.95rem' }}>+{topGainer.pct}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    <span>Ticker: <strong>{topGainer.ticker}</strong></span>
                    <span>Price: <strong>${topGainer.price}</strong></span>
                  </div>
                </div>
              )}

              {topLoser && (
                <div 
                  onClick={() => handleNewsClick(topLoser.ticker)}
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
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{topLoser.name}</span>
                    <span className="stat-down" style={{ fontWeight: 700, fontSize: '0.95rem' }}>{topLoser.pct}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    <span>Ticker: <strong>{topLoser.ticker}</strong></span>
                    <span>Price: <strong>${topLoser.price}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick stock watch table */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Market Watchlist</h3>
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
                  {sortedStocks.slice(0, 5).map(stock => {
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
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>${stock.price}</td>
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

        {/* Right Column (Learning progress & News ticker) */}
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

          {/* Dynamic news room */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Newspaper size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Breaking News Room</h3>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: '300px',
              paddingRight: '0.25rem'
            }}>
              {newsFeed.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Waiting for market disclosures...</p>
              ) : (
                newsFeed.slice(0, 3).map(item => {
                  const isGood = item.type === 'good';
                  const isBad = item.type === 'bad';
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleNewsClick(item.target)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '0.75rem',
                        cursor: item.target !== 'ALL' ? 'pointer' : 'default',
                        transition: 'all var(--transition-fast)'
                      }}
                      className={item.target !== 'ALL' ? "glass-card-interactive" : ""}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={10} /> {item.timestamp}
                        </span>
                        {item.target !== 'ALL' && (
                          <span className={`badge ${isGood ? 'badge-success' : isBad ? 'badge-danger' : 'badge-info'}`}>
                            {item.target}
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: '1.3', marginBottom: '0.2rem' }}>{item.headline}</h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.body}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
