import React from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  TrendingUp, 
  TrendingDown, 
  History, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart
} from 'lucide-react';

const Portfolio = () => {
  const { 
    cash, 
    portfolio, 
    stocks, 
    transactionHistory,
    getPortfolioValue, 
    getNetWorth, 
    setActiveTab,
    setSelectedStockTicker
  } = useMarket();

  const portfolioValue = getPortfolioValue();
  const netWorth = getNetWorth();

  // Calculate overall performance metrics
  let totalCostBasis = 0;
  Object.keys(portfolio).forEach(ticker => {
    const hold = portfolio[ticker];
    totalCostBasis += hold.avgPrice * hold.quantity;
  });

  const totalReturn = portfolioValue - totalCostBasis;
  const totalReturnPercent = totalCostBasis === 0 ? 0 : parseFloat(((totalReturn / totalCostBasis) * 100).toFixed(2));

  // Asset allocation breakdown
  const allocation = [];
  let totalAllocated = cash + portfolioValue;

  if (cash > 0) {
    allocation.push({
      name: 'Liquid Cash',
      value: cash,
      pct: parseFloat(((cash / totalAllocated) * 100).toFixed(1)),
      color: '#10b981'
    });
  }

  const sectorValues = {};
  Object.keys(portfolio).forEach(ticker => {
    const stock = stocks.find(s => s.ticker === ticker);
    const hold = portfolio[ticker];
    if (stock) {
      const val = stock.price * hold.quantity;
      sectorValues[stock.sector] = (sectorValues[stock.sector] || 0) + val;
    }
  });

  const sectorColors = {
    'Technology': '#6366f1',
    'Telecom': '#06b6d4',
    'Healthcare': '#8b5cf6',
    'Real Estate': '#f59e0b',
    'Automotive': '#ec4899',
    'FMCG': '#14b8a6',
    'Finance': '#3b82f6',
    'Searched Stock': '#a855f7'
  };

  Object.keys(sectorValues).forEach(sector => {
    const val = sectorValues[sector];
    allocation.push({
      name: sector,
      value: val,
      pct: parseFloat(((val / totalAllocated) * 100).toFixed(1)),
      color: sectorColors[sector] || '#6b7280'
    });
  });

  const handleTradeClick = (ticker) => {
    setSelectedStockTicker(ticker);
    setActiveTab('simulator');
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Portfolio Valuation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Evaluate holdings, trace sector concentration, and examine transaction receipts.</p>
      </div>

      {/* Financial Health Header */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Combined Equity Value</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
            ₹{netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invested Assets</span>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem' }}>₹{portfolioValue.toLocaleString('en-IN')}</h4>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Liquid Balance</span>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem' }}>₹{cash.toLocaleString('en-IN')}</h4>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Return</span>
            {totalReturn >= 0 ? (
              <h4 className="stat-up" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <TrendingUp size={16} /> +₹{totalReturn.toFixed(2)} (+{totalReturnPercent}%)
              </h4>
            ) : (
              <h4 className="stat-down" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <TrendingDown size={16} /> -₹{Math.abs(totalReturn).toFixed(2)} ({totalReturnPercent}%)
              </h4>
            )}
          </div>
        </div>
      </div>

      {/* Asset Allocation Section */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <PieChart size={18} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Asset & Sector Allocation</h3>
        </div>

        {/* Allocation Bar Chart */}
        <div style={{ display: 'flex', height: '18px', width: '100%', borderRadius: '99px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
          {allocation.map((alloc, idx) => (
            <div
              key={idx}
              style={{
                width: `${alloc.pct}%`,
                backgroundColor: alloc.color,
                height: '100%',
                transition: 'width 0.4s ease'
              }}
              title={`${alloc.name}: ${alloc.pct}%`}
            />
          ))}
        </div>

        {/* Allocation Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.5rem' }}>
          {allocation.map((alloc, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', backgroundColor: alloc.color }}></span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{alloc.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>({alloc.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layout: Holdings on Left, History on Right */}
      <div className="grid-main-layout">
        
        {/* Active Holdings Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Securities Portfolio</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {Object.keys(portfolio).length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.9rem' }}>No open positions in your portfolio.</p>
                <button 
                  onClick={() => setActiveTab('simulator')} 
                  className="btn btn-primary" 
                  style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  Start Trading NSE Stocks
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Asset</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Shares</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Avg Price</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Current</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Market Value</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(portfolio).map(ticker => {
                    const hold = portfolio[ticker];
                    const stock = stocks.find(s => s.ticker === ticker);
                    if (!stock) return null;

                    const marketValue = hold.quantity * stock.price;
                    const costBasis = hold.quantity * hold.avgPrice;
                    const profitLoss = marketValue - costBasis;
                    const profitLossPct = parseFloat(((profitLoss / costBasis) * 100).toFixed(2));
                    const isGain = profitLoss >= 0;

                    return (
                      <tr 
                        key={ticker} 
                        onClick={() => handleTradeClick(ticker)}
                        className="glass-card-interactive"
                        style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        <td style={{ padding: '0.8rem 0.5rem', fontWeight: 700 }}>
                          <div>{ticker}</div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>{stock.name}</span>
                        </td>
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{hold.quantity}</td>
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>₹{hold.avgPrice.toFixed(2)}</td>
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>₹{stock.price.toFixed(2)}</td>
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>₹{marketValue.toFixed(2)}</td>
                        <td style={{ 
                          padding: '0.8rem 0.5rem', 
                          textAlign: 'right', 
                          fontWeight: 700, 
                          color: isGain ? 'var(--success)' : 'var(--danger)' 
                        }}>
                          <div>{isGain ? `+₹${profitLoss.toFixed(2)}` : `-₹${Math.abs(profitLoss).toFixed(2)}`}</div>
                          <span style={{ fontSize: '0.65rem' }}>{isGain ? `+${profitLossPct}%` : `${profitLossPct}%`}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Transaction History Log */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Transaction Log</h3>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflowY: 'auto',
            maxHeight: '360px',
            paddingRight: '0.25rem'
          }}>
            {transactionHistory.length === 0 ? (
              <p style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No orders executed yet.</p>
            ) : (
              transactionHistory.map(log => {
                const isBuy = log.type === 'BUY';
                return (
                  <div
                    key={log.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        background: isBuy ? 'var(--success-glow)' : 'var(--danger-glow)',
                        color: isBuy ? 'var(--success)' : 'var(--danger)',
                        padding: '0.35rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isBuy ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          {isBuy ? 'Bought' : 'Sold'} {log.quantity} {log.ticker}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.timestamp}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        ₹{(log.price * log.quantity).toFixed(2)}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        @₹{log.price.toFixed(2)} / share
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Portfolio;
