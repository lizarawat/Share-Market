import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import StockChart from './StockChart';
import { 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  ShoppingCart,
  AlertCircle,
  Search,
  Plus,
  X
} from 'lucide-react';

const Simulator = () => {
  const { 
    cash, 
    portfolio, 
    stocks, 
    selectedStockTicker, 
    setSelectedStockTicker,
    buyStock,
    sellStock,
    searchRealTimeStock,
    addStockToWatchlist,
    isApiLoading,
    triggerAlert,
    activeCompanyDetails,
    isDetailsLoading,
    priceHistory
  } = useMarket();

  const [tradeQuantity, setTradeQuantity] = useState('10');
  const [tradeType, setTradeType] = useState('BUY'); // BUY or SELL
  
  // Search state inside simulator
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState([]);
  const [localSearching, setLocalSearching] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('recent_searches_securities');
      return saved ? JSON.parse(saved) : ['RELIANCE.NS', 'TCS.NS', 'SBIN.NS'];
    } catch (e) {
      return ['RELIANCE.NS', 'TCS.NS', 'SBIN.NS'];
    }
  });

  const addToRecentSearches = (ticker) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t !== ticker);
      const updated = [ticker, ...filtered].slice(0, 5);
      localStorage.setItem('recent_searches_securities', JSON.stringify(updated));
      return updated;
    });
  };

  // Auto-complete suggestion fetcher
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (localSearchQuery.trim().length >= 2) {
        setLocalSearching(true);
        const results = await searchRealTimeStock(localSearchQuery);
        setLocalSearchResults(results);
        setLocalSearching(false);
      } else {
        setLocalSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearchQuery]);

  const handleAddStock = async (ticker) => {
    const success = await addStockToWatchlist(ticker);
    if (success) {
      setLocalSearchQuery('');
      setLocalSearchResults([]);
      addToRecentSearches(ticker);
      setIsInputFocused(false);
    }
  };

  const handleLocalSearchSubmit = async (e) => {
    e.preventDefault();
    if (!localSearchQuery.trim()) return;

    let ticker = localSearchQuery.toUpperCase().trim();
    if (!ticker.endsWith('.NS') && !ticker.endsWith('.BO') && !ticker.startsWith('^')) {
      ticker = `${ticker}.NS`;
    }

    const success = await addStockToWatchlist(ticker);
    if (success) {
      setLocalSearchQuery('');
      setLocalSearchResults([]);
      addToRecentSearches(ticker);
      setIsInputFocused(false);
    } else {
      if (localSearchResults.length > 0) {
        const firstTicker = localSearchResults[0].ticker;
        const successFirst = await addStockToWatchlist(firstTicker);
        if (successFirst) {
          setLocalSearchQuery('');
          setLocalSearchResults([]);
          addToRecentSearches(firstTicker);
          setIsInputFocused(false);
        }
      }
    }
  };

  // Get active stock data
  const stock = stocks.find(s => s.ticker === selectedStockTicker) || stocks[0];
  const history = portfolio[stock.ticker] || null;

  // Calculate change %
  const change = parseFloat((stock.price - stock.prevClose).toFixed(2));
  const changePercent = parseFloat(((change / stock.prevClose) * 100).toFixed(2));
  const isUp = changePercent >= 0;

  // Transaction calculations
  const qty = parseInt(tradeQuantity) || 0;
  const estimatedTotal = parseFloat((stock.price * qty).toFixed(2));
  const hasSufficientCash = cash >= estimatedTotal;
  const hasSufficientShares = history ? history.quantity >= qty : false;

  const handleExecuteTrade = (e) => {
    e.preventDefault();
    if (qty <= 0) return;

    if (tradeType === 'BUY') {
      const success = buyStock(stock.ticker, qty);
      if (success) setTradeQuantity('10');
    } else {
      const success = sellStock(stock.ticker, qty);
      if (success) setTradeQuantity('10');
    }
  };

  // Display all stocks including indices in watchlist tabs row
  const activeWatchlistStocks = stocks;

  // Dynamic Performance & Sentiment Calculations
  let performanceStatus = "No performance data is currently available.";
  let perfPct = 0;
  if (priceHistory && priceHistory[stock.ticker] && priceHistory[stock.ticker].length > 1) {
    const hist = priceHistory[stock.ticker];
    const oldestPrice = hist[0].close;
    const currentPrice = hist[hist.length - 1].close;
    perfPct = parseFloat((((currentPrice - oldestPrice) / oldestPrice) * 100).toFixed(2));
    if (perfPct >= 0) {
      performanceStatus = `📈 Strong growth over this timeline, gaining +${perfPct}% overall.`;
    } else {
      performanceStatus = ` Had a downfall of ${perfPct}% in this time period.`;
    }
  }

  let sentimentType = "Neutral";
  let bullishPct = 50;
  if (activeCompanyDetails && activeCompanyDetails.news) {
    const articles = activeCompanyDetails.news;
    let posCount = 0;
    let negCount = 0;
    const posWords = ['grow', 'profit', 'up', 'gain', 'buy', 'bull', 'success', 'record', 'high', 'beat', 'expansion', 'dividend', 'upgrade', 'robust'];
    const negWords = ['fall', 'loss', 'down', 'drop', 'sell', 'bear', 'decline', 'concern', 'debt', 'risk', 'fail', 'warning', 'insufficient', 'downfall'];
    
    articles.forEach(art => {
      const text = (art.title || '').toLowerCase();
      posWords.forEach(w => { if (text.includes(w)) posCount++; });
      negWords.forEach(w => { if (text.includes(w)) negCount++; });
    });

    const total = posCount + negCount;
    if (total > 0) {
      bullishPct = Math.round((posCount / total) * 100);
    } else {
      bullishPct = 50;
    }
    
    if (bullishPct > 60) sentimentType = "Bullish";
    else if (bullishPct < 40) sentimentType = "Bearish";
  }

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header bar with Integrated Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>NSE Trading Simulator</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Buy/sell Indian equities at real-time quotes, track holdings, and practice risk management.</p>
        </div>
        
        {/* Watchlist Search Bar */}
        <div style={{ position: 'relative', width: '300px' }}>
          <form onSubmit={handleLocalSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <div style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Search & Add NSE Ticker..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.45rem 0.45rem 0.45rem 1.85rem',
                color: '#fff',
                outline: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'border-color var(--transition-fast)'
              }}
            />
          </form>

          {/* Combined Suggestions, Recommended, and Recent Searches Dropdown */}
          {(isInputFocused || localSearchResults.length > 0) && (
            <div 
              onMouseDown={(e) => e.preventDefault()} // prevents input blur on clicking
              style={{
                position: 'absolute',
                top: 'calc(100% + 5px)',
                right: 0,
                width: '320px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-lg)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(12px)',
                padding: '0.5rem'
              }}
            >
              {localSearchQuery.trim() === '' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.4rem' }}>
                  {/* Recommended Stock list */}
                  <div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.05em' }}>RECOMMENDED SECURITIES</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {['RELIANCE.NS', 'TCS.NS', 'SBIN.NS', 'TATAMOTORS.NS', 'INDOMIM.NS'].map(rec => (
                        <button
                          key={rec}
                          type="button"
                          onClick={() => handleAddStock(rec)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                          className="glass-card-interactive"
                        >
                          {rec.replace('.NS', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches list */}
                  {recentSearches.length > 0 && (
                    <div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.05em' }}>RECENT SEARCHES</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {recentSearches.map(rec => (
                          <button
                            key={rec}
                            type="button"
                            onClick={() => handleAddStock(rec)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(99, 102, 241, 0.05)',
                              border: '1px solid rgba(99, 102, 241, 0.15)',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                            className="glass-card-interactive"
                          >
                            {rec.replace('.NS', '')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Live Autocomplete suggestions */
                localSearchResults.map(result => (
                  <div
                    key={result.ticker}
                    onClick={() => handleAddStock(result.ticker)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      transition: 'background var(--transition-fast)'
                    }}
                    className="glass-card-interactive"
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{result.ticker}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{result.name}</span>
                    </div>
                    <Plus size={12} color="var(--primary)" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Securities Watchlist Tabs: PLACED DIRECTLY ABOVE CHART REGION */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Watchlist Tickers</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click to switch stock candles</span>
        </div>
        
        {/* Horizontal scroll tabs */}
        <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
          {activeWatchlistStocks.map(s => {
            const sChange = parseFloat((s.price - s.prevClose).toFixed(2));
            const sPct = parseFloat(((sChange / s.prevClose) * 100).toFixed(2));
            const sIsUp = sPct >= 0;
            const isSelected = s.ticker === selectedStockTicker;
            const isOwned = portfolio[s.ticker] !== undefined;

            return (
              <div
                key={s.ticker}
                onClick={() => setSelectedStockTicker(s.ticker)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  background: isSelected ? 'var(--primary-glow)' : 'rgba(255, 255, 255, 0.01)',
                  cursor: 'pointer',
                  minWidth: '155px',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)'
                }}
                className="glass-card-interactive"
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>{s.ticker}</span>
                    {isOwned && <span style={{ fontSize: '0.55rem', background: 'var(--primary)', color: '#fff', padding: '0.05rem 0.2rem', borderRadius: '3px' }}>HOLD</span>}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{s.name}</span>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>₹{s.price.toFixed(2)}</div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: sIsUp ? 'var(--success)' : 'var(--danger)' }}>
                    {sIsUp ? `+${sPct}%` : `${sPct}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Grid Layout (Chart occupying full width left side, Trade panels on right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Candlestick Active Chart Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Stock details header */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-info">{stock.sector}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NSE Ticker: {stock.ticker}</span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.2rem 0' }}>{stock.name}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stock.desc}</p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹{stock.price.toFixed(2)}</h2>
                <span className={isUp ? 'stat-up' : 'stat-down'} style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {isUp ? `+₹${change} (+${changePercent}%)` : `-₹${Math.abs(change)} (${changePercent}%)`}
                </span>
              </div>
            </div>

            {/* Statistics row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
              gap: '0.75rem',
              borderTop: '1px solid var(--border)',
              paddingTop: '0.75rem',
              marginTop: '0.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Day Open</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.1rem', color: '#fff' }}>₹{stock.open ? stock.open.toFixed(2) : '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Day High</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.1rem' }}>₹{stock.high ? stock.high.toFixed(2) : '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Day Low</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.1rem' }}>₹{stock.low ? stock.low.toFixed(2) : '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Prev Close</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.1rem', color: '#fff' }}>₹{stock.prevClose ? stock.prevClose.toFixed(2) : '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>All-Time High</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.1rem' }}>₹{stock.ath ? stock.ath.toFixed(2) : (stock.high * 1.35).toFixed(2)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>All-Time Low</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.1rem' }}>₹{stock.atl ? stock.atl.toFixed(2) : (stock.low * 0.65).toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* SVG Candlestick Chart Card */}
          <div className="glass-card" style={{ padding: '1.25rem', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            <StockChart ticker={stock.ticker} />
          </div>
        </div>

        {/* Right Side: Holdings and Trade execution console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Holdings summary for active stock */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <Briefcase size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Your Holdings</h3>
            </div>

            {history ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shares Owned</span>
                  <strong style={{ color: '#fff' }}>{history.quantity} shares</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Average Price</span>
                  <strong style={{ color: '#fff' }}>₹{history.avgPrice.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Investment Cost</span>
                  <strong style={{ color: '#fff' }}>₹{(history.quantity * history.avgPrice).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Value</span>
                  <strong style={{ color: '#fff' }}>₹{(history.quantity * stock.price).toFixed(2)}</strong>
                </div>
                
                {/* Profit / Loss calculations */}
                {(() => {
                  const profitLoss = (stock.price - history.avgPrice) * history.quantity;
                  const plPercent = ((stock.price - history.avgPrice) / history.avgPrice) * 100;
                  const isGainVal = profitLoss >= 0;
                  
                  return (
                    <div style={{
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.8rem', 
                      borderTop: '1px solid var(--border)', 
                      paddingTop: '0.5rem', 
                      marginTop: '0.2rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Unrealized P&L</span>
                      <strong className={isGainVal ? 'stat-up' : 'stat-down'} style={{ fontWeight: 700 }}>
                        {isGainVal ? '+' : ''}₹{profitLoss.toFixed(2)} ({isGainVal ? '+' : ''}{plPercent.toFixed(2)}%)
                      </strong>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                You do not own shares of {stock.ticker} yet.
              </p>
            )}
          </div>

          {/* Trade Execution console */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <ShoppingCart size={16} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Execution Desk</h3>
            </div>

            {/* Order type switch */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setTradeType('BUY')}
                style={{
                  padding: '0.4rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: tradeType === 'BUY' ? 'var(--success)' : 'transparent',
                  color: tradeType === 'BUY' ? '#fff' : 'var(--text-secondary)',
                  transition: 'background var(--transition-fast)'
                }}
              >
                BUY (Long)
              </button>
              <button
                onClick={() => setTradeType('SELL')}
                style={{
                  padding: '0.4rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: tradeType === 'SELL' ? 'var(--danger)' : 'transparent',
                  color: tradeType === 'SELL' ? '#fff' : 'var(--text-secondary)',
                  transition: 'background var(--transition-fast)'
                }}
              >
                SELL (Short)
              </button>
            </div>

            {/* Order execution inputs */}
            <form onSubmit={handleExecuteTrade} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
              
              {/* Quantity input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <label htmlFor="quantity">Order Quantity</label>
                  <span>Max: {tradeType === 'BUY' ? Math.floor(cash / stock.price) : (history?.quantity || 0)} shares</span>
                </div>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Order pricing summary details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.65rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Price Quote</span>
                  <strong style={{ color: '#fff' }}>₹{stock.price.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Total</span>
                  <strong style={{ color: '#fff' }}>₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Liquid Cash Balance</span>
                  <strong style={{ color: '#fff' }}>₹{cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>

              {/* Insufficient alerts */}
              {tradeType === 'BUY' && !hasSufficientCash && qty > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger)', fontSize: '0.7rem', padding: '0.2rem 0' }}>
                  <AlertCircle size={12} />
                  <span>Warning: Insufficient margin available to trade.</span>
                </div>
              )}

              {tradeType === 'SELL' && !hasSufficientShares && qty > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger)', fontSize: '0.7rem', padding: '0.2rem 0' }}>
                  <AlertCircle size={12} />
                  <span>Warning: Insufficient owned shares available to execute sell.</span>
                </div>
              )}

              {/* Trigger trade button */}
              <button
                type="submit"
                disabled={tradeType === 'BUY' ? !hasSufficientCash || qty <= 0 : !hasSufficientShares || qty <= 0}
                style={{
                  background: tradeType === 'BUY' ? 'var(--success)' : 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'opacity var(--transition-fast)',
                  opacity: (tradeType === 'BUY' ? !hasSufficientCash || qty <= 0 : !hasSufficientShares || qty <= 0) ? 0.4 : 1,
                  marginTop: '0.25rem'
                }}
              >
                Execute {tradeType} Order
              </button>

            </form>
          </div>

        </div>

      </div>

      {/* 📊 Company Intelligence & Live Feed Panel */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📊 Company Intelligence & Market Insights</span>
          <span style={{ fontSize: '0.75rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
            {stock.ticker}
          </span>
        </h2>

        {isDetailsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading latest company intel & live metrics...</span>
          </div>
        ) : activeCompanyDetails ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Left Column: Bio and Status Profile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Company Profile & Performance</h3>
              </div>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0, maxHeight: '120px', overflowY: 'auto' }}>
                {activeCompanyDetails.bio}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shares Outstanding:</span>
                  <strong style={{ color: '#fff' }}>{activeCompanyDetails.shares || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Sector:</span>
                  <strong style={{ color: '#fff' }}>{activeCompanyDetails.sector || 'N/A'}</strong>
                </div>
              </div>

              {/* Company Status Summary at the End */}
              <div style={{
                background: perfPct >= 0 ? 'rgba(16, 185, 129, 0.04)' : 'rgba(244, 63, 94, 0.04)',
                border: '1px solid',
                borderColor: perfPct >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: perfPct >= 0 ? 'var(--success)' : 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                {performanceStatus}
              </div>
            </div>

            {/* Middle Column: Officers & Public Opinion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Key Management & Directors</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeCompanyDetails.officers && activeCompanyDetails.officers.length > 0 ? (
                  activeCompanyDetails.officers.slice(0, 3).map((off, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem 0.65rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{off.name}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Officer Status: Active, Executive duties</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={off.title}>
                        {off.title}
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No officer credentials listed.</span>
                )}
              </div>

              {/* Public Opinion Sentiment Gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Public Opinion Sentiment:</span>
                  <strong style={{ color: sentimentType === 'Bullish' ? 'var(--success)' : (sentimentType === 'Bearish' ? 'var(--danger)' : 'var(--text-secondary)') }}>
                    {sentimentType} ({bullishPct}% Positive)
                  </strong>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${bullishPct}%`, background: 'var(--success)', height: '100%' }} />
                  <div style={{ width: `${100 - bullishPct}%`, background: 'var(--danger)', height: '100%' }} />
                </div>
              </div>
            </div>

            {/* Right Column: Live News Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Live Intelligence Stream</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '235px', overflowY: 'auto' }}>
                {activeCompanyDetails.news && activeCompanyDetails.news.length > 0 ? (
                  activeCompanyDetails.news.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.link || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        padding: '0.5rem 0.65rem',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.01)',
                        textDecoration: 'none',
                        transition: 'border-color var(--transition-fast)'
                      }}
                      className="glass-card-interactive"
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', lineHeight: '1.4' }}>
                        {item.title}
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        <span>Source: {item.publisher}</span>
                        <span>{new Date(item.providerPublishTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </a>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No live news bulletins available.</span>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No company details found for {stock.ticker}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default Simulator;
