import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import StockChart from './StockChart';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  FileText, 
  ShoppingCart,
  Tag,
  AlertCircle
} from 'lucide-react';

const Simulator = () => {
  const { 
    cash, 
    portfolio, 
    stocks, 
    selectedStockTicker, 
    setSelectedStockTicker,
    buyStock,
    sellStock
  } = useMarket();

  const [tradeQuantity, setTradeQuantity] = useState('10');
  const [tradeType, setTradeType] = useState('BUY'); // BUY or SELL

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

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Vite Trading Simulator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Execute paper orders, analyze real-time charts, and backtest news triggers.</p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid-main-layout">
        
        {/* Left Side: Stock List Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Available Securities</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxHeight: '520px',
            overflowY: 'auto',
            paddingRight: '0.25rem'
          }}>
            {stocks.map(s => {
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    background: isSelected ? 'var(--primary-glow)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="glass-card-interactive"
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>{s.ticker}</span>
                      {isOwned && <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>HOLDING</span>}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{s.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>${s.price.toFixed(2)}</div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      color: sIsUp ? 'var(--success)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      justifyContent: 'flex-end'
                    }}>
                      {sIsUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {sIsUp ? `+${sPct}%` : `${sPct}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Stock Details & Trade Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Stats */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="badge badge-info">{stock.sector}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticker: {stock.ticker}</span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.2rem 0' }}>{stock.name}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{stock.desc}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>${stock.price.toFixed(2)}</h2>
                <span className={`badge ${isUp ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {isUp ? `+${changePercent}%` : `${changePercent}%`}
                </span>
              </div>
            </div>

            {/* Price Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              padding: '0.85rem',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Day Open</p>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.15rem' }}>${stock.open.toFixed(2)}</h4>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Day High</p>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.15rem', color: 'var(--success)' }}>${stock.high.toFixed(2)}</h4>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Day Low</p>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.15rem', color: 'var(--danger)' }}>${stock.low.toFixed(2)}</h4>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prev Close</p>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.15rem' }}>${stock.prevClose.toFixed(2)}</h4>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div style={{ height: '320px', width: '100%', position: 'relative' }}>
              <StockChart ticker={stock.ticker} />
            </div>
          </div>

          {/* Trade Execution Panel */}
          <div className="grid-2">
            
            {/* Holdings Card */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Briefcase size={16} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Your Holdings</h3>
              </div>
              
              {history ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quantity Owned</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{history.quantity} shares</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Buy Price</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>${history.avgPrice.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Value</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>${(history.quantity * stock.price).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Return</span>
                    {((stock.price - history.avgPrice) * history.quantity) >= 0 ? (
                      <span className="stat-up" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        +${((stock.price - history.avgPrice) * history.quantity).toFixed(2)} (+{(((stock.price - history.avgPrice) / history.avgPrice) * 100).toFixed(2)}%)
                      </span>
                    ) : (
                      <span className="stat-down" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        -${Math.abs((stock.price - history.avgPrice) * history.quantity).toFixed(2)} ({(((stock.price - history.avgPrice) / history.avgPrice) * 100).toFixed(2)}%)
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '1rem', textAlign: 'center' }}>
                  <AlertCircle size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You don't own any shares of {stock.ticker} yet.</p>
                </div>
              )}
            </div>

            {/* Trading Order Desk */}
            <form onSubmit={handleExecuteTrade} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                <ShoppingCart size={16} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Execution Desk</h3>
              </div>

              {/* BUY / SELL Switcher */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <button
                  type="button"
                  onClick={() => setTradeType('BUY')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: tradeType === 'BUY' ? 'var(--success)' : 'transparent',
                    color: tradeType === 'BUY' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  Buy
                </button>
                <button
                  type="button"
                  disabled={!history}
                  onClick={() => setTradeType('SELL')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: history ? 'pointer' : 'not-allowed',
                    background: tradeType === 'SELL' ? 'var(--danger)' : 'transparent',
                    color: tradeType === 'SELL' ? '#fff' : 'var(--text-muted)',
                    transition: 'all var(--transition-fast)',
                    opacity: history ? 1 : 0.5
                  }}
                >
                  Sell
                </button>
              </div>

              {/* Quantity Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Quantity (Shares)</label>
                <input
                  type="number"
                  min="1"
                  max={tradeType === 'SELL' && history ? history.quantity : undefined}
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.55rem',
                    color: '#fff',
                    outline: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Summary Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.6rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Liquid Cash:</span>
                  <span style={{ fontWeight: 600 }}>${cash.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Estimated Total:</span>
                  <span style={{ fontWeight: 600 }}>${estimatedTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Error/Warning validation alert */}
              {tradeType === 'BUY' && !hasSufficientCash && qty > 0 && (
                <div style={{ color: 'var(--danger)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                  <AlertCircle size={12} /> Insufficient cash balance.
                </div>
              )}
              {tradeType === 'SELL' && !hasSufficientShares && qty > 0 && (
                <div style={{ color: 'var(--danger)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                  <AlertCircle size={12} /> You do not own enough shares.
                </div>
              )}

              {/* Order Button */}
              <button
                type="submit"
                disabled={qty <= 0 || (tradeType === 'BUY' ? !hasSufficientCash : !hasSufficientShares)}
                className={`btn ${tradeType === 'BUY' ? 'btn-success' : 'btn-danger'} ${(qty <= 0 || (tradeType === 'BUY' ? !hasSufficientCash : !hasSufficientShares)) ? 'btn-disabled' : ''}`}
                style={{ width: '100%', marginTop: '0.35rem' }}
              >
                Execute {tradeType} Order
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Simulator;
