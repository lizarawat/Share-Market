import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  ArrowRight, 
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  Briefcase,
  DollarSign
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
    syncStocksListWithAPI,
    nifty,
    bankNifty
  } = useMarket();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Financial calculations
  const portfolioValue = getPortfolioValue();
  const netWorth = getNetWorth();

  let totalCostBasis = 0;
  Object.keys(portfolio).forEach(ticker => {
    const hold = portfolio[ticker];
    totalCostBasis += hold.avgPrice * hold.quantity;
  });

  const totalPL = portfolioValue - totalCostBasis;
  const totalPLPercent = totalCostBasis === 0 ? 0 : parseFloat(((totalPL / totalCostBasis) * 100).toFixed(2));

  // Find next uncompleted lesson
  const nextLesson = lessons.find(l => !l.completed) || lessons[lessons.length - 1];

  // Daily watchlist movers calculation
  const sortedStocks = [...stocks]
    .filter(s => s.ticker !== '^NSEI' && s.ticker !== '^NSEBANK') // Filter out indices from stock watch list
    .map(s => {
      const change = parseFloat((s.price - s.prevClose).toFixed(2));
      const pct = parseFloat(((change / s.prevClose) * 100).toFixed(2));
      return { ...s, change, pct };
    })
    .sort((a, b) => b.pct - a.pct);

  const topGainers = [...sortedStocks]
    .filter(s => s.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  const topLosers = [...sortedStocks]
    .filter(s => s.pct < 0)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4);

  // Autocomplete search suggestions
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
    }, 300);

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

  // Handle Search Form Submission (pressing Enter)
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    let ticker = searchQuery.toUpperCase().trim();

    // Try to parse suffix (default to .NS for Indian stocks if no suffix present)
    if (!ticker.endsWith('.NS') && !ticker.endsWith('.BO') && !ticker.startsWith('^')) {
      ticker = `${ticker}.NS`;
    }

    // Try adding directly
    const success = await addStockToWatchlist(ticker);
    setIsSearching(false);

    if (success) {
      setSearchQuery('');
      setSearchResults([]);
      setActiveTab('simulator');
    } else {
      // If direct add fails, check if we have any search suggestions, choose the first one
      if (searchResults.length > 0) {
        const firstTicker = searchResults[0].ticker;
        const successFirst = await addStockToWatchlist(firstTicker);
        if (successFirst) {
          setSearchQuery('');
          setSearchResults([]);
          setActiveTab('simulator');
        }
      } else {
        // Run a fresh lookup to be absolutely sure
        const results = await searchRealTimeStock(searchQuery);
        if (results.length > 0) {
          const firstTicker = results[0].ticker;
          const successFirst = await addStockToWatchlist(firstTicker);
          if (successFirst) {
            setSearchQuery('');
            setSearchResults([]);
            setActiveTab('simulator');
          }
        }
      }
    }
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Index Ticker Banner Row */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.2rem',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* NIFTY 50 Index Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.4rem 0.8rem',
          minWidth: '220px',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>NIFTY 50</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>₹{nifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: nifty.pct >= 0 ? 'var(--success)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.15rem'
          }}>
            {nifty.pct >= 0 ? '▲' : '▼'} {nifty.pct >= 0 ? `+${nifty.pct}%` : `${nifty.pct}%`}
          </span>
        </div>

        {/* BANK NIFTY Index Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.4rem 0.8rem',
          minWidth: '220px',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>NIFTY BANK</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>₹{bankNifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: bankNifty.pct >= 0 ? 'var(--success)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.15rem'
          }}>
            {bankNifty.pct >= 0 ? '▲' : '▼'} {bankNifty.pct >= 0 ? `+${bankNifty.pct}%` : `${bankNifty.pct}%`}
          </span>
        </div>
      </div>

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Trading Desk</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Real-time paper trading room. Search Nifty equities and simulate trades.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={syncStocksListWithAPI}
            disabled={isApiLoading}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Refresh Live Market Data"
          >
            <RefreshCw size={14} className={isApiLoading ? 'spin-animation' : ''} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <Clock size={16} color="var(--accent)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Time: </span>
            <span className="badge badge-success" style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>{time.toLocaleTimeString()}</span>
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

      {/* Live search box with Form wrapping */}
      <form onSubmit={handleSearchSubmit} className="glass-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Search NSE Securities & Open Charts</h3>
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
            placeholder="Search company name or symbol (e.g. Reliance, Tata Motors, TCS, SBIN) and press Enter..."
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
      </form>

      {/* Trading App Portfolio Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Available Margin (Cash) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Available Margin</span>
            <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '0.4rem', borderRadius: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>₹</span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>₹{cash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Reserve buying power for placing buy orders</p>
        </div>

        {/* Current Investment (Cost Basis) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Current Investment</span>
            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.4rem', borderRadius: '8px' }}>
              <Briefcase size={14} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>₹{totalCostBasis.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total cost basis (purchase value) of active shares</p>
        </div>

        {/* Current Portfolio Value */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Current Value</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingUp size={14} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>₹{portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Current market value of portfolio shares</p>
        </div>

        {/* Total Profit & Loss (P&L) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Total P&L</span>
            <div style={{ 
              background: totalPL >= 0 ? 'var(--success-glow)' : 'var(--danger-glow)', 
              color: totalPL >= 0 ? 'var(--success)' : 'var(--danger)', 
              padding: '0.4rem', 
              borderRadius: '8px' 
            }}>
              {totalPL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </div>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: totalPL >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {totalPL >= 0 ? '+' : ''}₹{totalPL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            {totalPL >= 0 ? (
              <span className="stat-up" style={{ fontWeight: 600 }}>+{totalPLPercent}% return</span>
            ) : (
              <span className="stat-down" style={{ fontWeight: 600 }}>{totalPLPercent}% return</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid-main-layout">
        
        {/* Left Column Watchlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top gainers / losers */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today's Top Market Movers</h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily NSE Metrics</span>
            </div>
            
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              
              {/* Top Gainers Card */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.02)',
                border: '1px solid rgba(16, 185, 129, 0.12)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Gainers (1% - 4.5% Moves)</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {topGainers.map(s => (
                    <div 
                      key={s.ticker}
                      onClick={() => { setSelectedStockTicker(s.ticker); setActiveTab('simulator'); }}
                      className="glass-card-interactive"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#fff' }}>{s.ticker}</strong>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>₹{s.price.toFixed(2)}</div>
                        <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', marginTop: '0.15rem', display: 'inline-block' }}>
                          +{s.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Losers Card */}
              <div style={{
                background: 'rgba(244, 63, 94, 0.02)',
                border: '1px solid rgba(244, 63, 94, 0.12)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)' }}>
                  <TrendingDown size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Losers (-1% - -4.5% Moves)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {topLosers.map(s => (
                    <div 
                      key={s.ticker}
                      onClick={() => { setSelectedStockTicker(s.ticker); setActiveTab('simulator'); }}
                      className="glass-card-interactive"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#fff' }}>{s.ticker}</strong>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>₹{s.price.toFixed(2)}</div>
                        <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', marginTop: '0.15rem', display: 'inline-block' }}>
                          {s.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
