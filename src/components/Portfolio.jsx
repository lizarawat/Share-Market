import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { 
  TrendingUp, 
  TrendingDown, 
  History, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Briefcase,
  X
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
    setSelectedStockTicker,
    sellStock,
    triggerAlert
  } = useMarket();

  const portfolioValue = Number(getPortfolioValue()) || 0;
  const netWorth = Number(getNetWorth()) || 0;
  const cashVal = Number(cash) || 0;

  // Quick Sell modal state
  const [sellModalTicker, setSellModalTicker] = useState(null);
  const [sellModalOwnedQty, setSellModalOwnedQty] = useState(0);
  const [sellModalPrice, setSellModalPrice] = useState(0);
  const [sellQuantityInput, setSellQuantityInput] = useState('10');

  // Calculate overall performance metrics
  let totalCostBasis = 0;
  Object.keys(portfolio).forEach(ticker => {
    const hold = portfolio[ticker];
    totalCostBasis += (Number(hold.avgPrice) || 0) * (Number(hold.quantity) || 0);
  });

  const totalReturn = portfolioValue - totalCostBasis;
  const totalReturnPercent = totalCostBasis === 0 ? 0 : parseFloat(((totalReturn / totalCostBasis) * 100).toFixed(2));

  // Asset allocation breakdown
  const allocation = [];
  let totalAllocated = cashVal + portfolioValue;
  if (totalAllocated === 0) totalAllocated = 1; // avoid division by zero

  if (cashVal > 0) {
    allocation.push({
      name: 'Liquid Cash',
      value: cashVal,
      pct: parseFloat(((cashVal / totalAllocated) * 100).toFixed(1)),
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

  const handleOpenSellModal = (e, ticker, ownedQty, price) => {
    e.stopPropagation(); // prevent navigation row trigger
    setSellModalTicker(ticker);
    setSellModalOwnedQty(ownedQty);
    setSellModalPrice(price);
    setSellQuantityInput(ownedQty.toString());
  };

  const handleConfirmSell = (e) => {
    e.preventDefault();
    const qtyToSell = parseInt(sellQuantityInput) || 0;
    if (qtyToSell <= 0) {
      triggerAlert("Please enter a valid quantity to sell.", "error");
      return;
    }
    if (qtyToSell > sellModalOwnedQty) {
      triggerAlert(`You only own ${sellModalOwnedQty} shares of this security.`, "error");
      return;
    }

    const success = sellStock(sellModalTicker, qtyToSell);
    if (success) {
      setSellModalTicker(null);
    }
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

        {/* Allocation Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.5rem' }}>
          {allocation.map((alloc, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ inlineBlock: 'true', width: '10px', height: '10px', borderRadius: '3px', backgroundColor: alloc.color }}></span>
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
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(portfolio).map(ticker => {
                    const hold = portfolio[ticker];
                    const stock = stocks.find(s => s.ticker === ticker);
                    if (!stock) return null;

                    const avgPrice = Number(hold.avgPrice) || 0;
                    const price = Number(stock.price) || 0;
                    const marketValue = hold.quantity * price;
                    const costBasis = hold.quantity * avgPrice;
                    const profitLoss = marketValue - costBasis;
                    const profitLossPct = costBasis === 0 ? 0 : parseFloat(((profitLoss / costBasis) * 100).toFixed(2));
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
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>₹{avgPrice.toFixed(2)}</td>
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>₹{price.toFixed(2)}</td>
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
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'center' }}>
                          <button
                            onClick={(e) => handleOpenSellModal(e, ticker, hold.quantity, price)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              background: 'rgba(244, 63, 94, 0.08)',
                              border: '1px solid rgba(244, 63, 94, 0.2)',
                              borderRadius: '6px',
                              color: 'var(--danger)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)'}
                          >
                            Sell Position
                          </button>
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
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No transaction logs recorded yet.
              </div>
            ) : (
              transactionHistory.slice().reverse().map((tx, idx) => {
                const isBuy = tx.type === 'BUY';
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px', 
                      padding: '0.65rem 0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={`badge ${isBuy ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6rem', padding: '0.15rem 0.35rem' }}>
                          {tx.type}
                        </span>
                        <strong style={{ color: '#fff' }}>{tx.ticker}</strong>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {tx.quantity} shares @ ₹{tx.price.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: isBuy ? 'var(--danger)' : 'var(--success)' }}>
                        {isBuy ? `-₹` : `+₹`}{(tx.quantity * tx.price).toFixed(2)}
                      </strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {tx.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Quick Sell Modal Overlay */}
      {sellModalTicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 5, 10, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-card fade-in-up" style={{
            maxWidth: '360px',
            width: '100%',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Close */}
            <button
              onClick={() => setSellModalTicker(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div>
              <span className="badge badge-danger">Sell Position</span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.35rem 0 0.15rem' }}>{sellModalTicker}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                You currently own <strong style={{ color: '#fff' }}>{sellModalOwnedQty} shares</strong> of this security.
              </p>
            </div>

            <form onSubmit={handleConfirmSell} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <label htmlFor="sell-qty">Sell Quantity</label>
                  <span 
                    onClick={() => setSellQuantityInput(sellModalOwnedQty.toString())}
                    style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Use Max ({sellModalOwnedQty})
                  </span>
                </div>
                <input
                  id="sell-qty"
                  type="number"
                  min="1"
                  max={sellModalOwnedQty}
                  value={sellQuantityInput}
                  onChange={(e) => setSellQuantityInput(e.target.value)}
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

              {/* Pricing summary */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.65rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Execution Price</span>
                  <strong style={{ color: '#fff' }}>₹{sellModalPrice.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Payout</span>
                  <strong style={{ color: 'var(--success)' }}>
                    ₹{((parseInt(sellQuantityInput) || 0) * sellModalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setSellModalTicker(null)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '0.6rem',
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Sell Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Portfolio;
