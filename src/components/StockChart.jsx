import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { Calendar } from 'lucide-react';

const StockChart = ({ ticker }) => {
  const { priceHistory, fetchStockHistoryFromAPI } = useMarket();
  const [chartType, setChartType] = useState('candlestick'); // 'line' or 'candlestick'
  const [timeRange, setTimeRange] = useState('1d'); // '1d' or '1mo'
  const [showSMA, setShowSMA] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  
  // Local chart data loaded from API
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch history from API whenever ticker or range changes
  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      setIsLoading(true);
      const data = await fetchStockHistoryFromAPI(ticker, timeRange);
      if (active) {
        if (data && data.history && data.history.length > 0) {
          setChartData(data.history);
        } else {
          // Fall back to context watchlist history if API fails
          setChartData(priceHistory[ticker] || []);
        }
        setIsLoading(false);
      }
    };
    loadHistory();
    return () => { active = false; };
  }, [ticker, timeRange, priceHistory]);

  const data = chartData;

  if (isLoading) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid var(--border)',
        borderRadius: '10px'
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Fetching real-time market candlesticks...</p>
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid var(--border)',
        borderRadius: '10px'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No price ticks available for {ticker}</p>
      </div>
    );
  }

  // Dimensions of SVG
  const width = 600;
  const height = 280;
  const paddingRight = 55;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scaling limits
  let allVals = [];
  data.forEach(d => {
    allVals.push(d.high, d.low, d.open, d.close);
  });
  const maxVal = Math.max(...allVals);
  const minVal = Math.min(...allVals);
  
  const valRange = maxVal - minVal;
  const yPad = valRange === 0 ? 10 : valRange * 0.06;
  const yMax = maxVal + yPad;
  const yMin = Math.max(0.1, minVal - yPad);

  const getX = (index) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value) => {
    return paddingTop + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
  };

  // Line Chart path
  let linePath = "";
  data.forEach((d, idx) => {
    const x = getX(idx);
    const y = getY(d.close);
    if (idx === 0) {
      linePath += `M ${x} ${y}`;
    } else {
      linePath += ` L ${x} ${y}`;
    }
  });

  const areaPath = linePath ? `${linePath} L ${getX(data.length - 1)} ${getY(yMin)} L ${getX(0)} ${getY(yMin)} Z` : "";

  // SMA computation
  let smaPath = "";
  const smaPeriod = 10;
  const smaData = [];

  for (let i = 0; i < data.length; i++) {
    if (i >= smaPeriod - 1) {
      let sum = 0;
      for (let j = 0; j < smaPeriod; j++) {
        sum += data[i - j].close;
      }
      const avg = sum / smaPeriod;
      smaData.push({ index: i, value: avg });
    }
  }

  smaData.forEach((point, idx) => {
    const x = getX(point.index);
    const y = getY(point.value);
    if (idx === 0) {
      smaPath += `M ${x} ${y}`;
    } else {
      smaPath += ` L ${x} ${y}`;
    }
  });

  // Y-Axis division lines
  const gridLines = [];
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const val = yMin + (i / gridCount) * (yMax - yMin);
    gridLines.push(val);
  }

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const relativeX = mouseX - paddingLeft;
    const index = Math.round((relativeX / chartWidth) * (data.length - 1));
    
    if (index >= 0 && index < data.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeHoverData = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', width: '100%' }}>
      
      {/* Control row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Chart type switch */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setChartType('candlestick')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: chartType === 'candlestick' ? 'var(--primary)' : 'transparent',
                color: chartType === 'candlestick' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('line')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: chartType === 'line' ? 'var(--primary)' : 'transparent',
                color: chartType === 'line' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              Line
            </button>
          </div>

          {/* Time range switch */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setTimeRange('1d')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: timeRange === '1d' ? 'var(--accent)' : 'transparent',
                color: timeRange === '1d' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              1 Day
            </button>
            <button
              onClick={() => setTimeRange('1mo')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: timeRange === '1mo' ? 'var(--accent)' : 'transparent',
                color: timeRange === '1mo' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              1 Month
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={showSMA}
              onChange={() => setShowSMA(!showSMA)}
              style={{ accentColor: 'var(--accent)' }}
            />
            SMA (10)
          </label>
        </div>
      </div>

      {/* Drawing Board */}
      <div style={{ position: 'relative', flex: 1, minHeight: '230px' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ overflow: 'visible', userSelect: 'none' }}
        >
          {/* Grid lines and Y ticks */}
          {gridLines.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text
                  x={width - paddingRight + 6}
                  y={y + 3}
                  fill="var(--text-muted)"
                  fontSize="8.5"
                  fontFamily="Inter"
                  fontWeight="500"
                >
                  ₹{val.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </text>
              </g>
            );
          })}

          {/* Line view */}
          {chartType === 'line' && (
            <>
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#chart-area-grad)" />
              <path
                d={linePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Candle view */}
          {chartType === 'candlestick' && 
            data.map((d, idx) => {
              const isBullish = d.close >= d.open;
              const color = isBullish ? 'var(--success)' : 'var(--danger)';
              const x = getX(idx);
              const openY = getY(d.open);
              const closeY = getY(d.close);
              const highY = getY(d.high);
              const lowY = getY(d.low);
              
              const candleWidth = Math.max(3, chartWidth / data.length * 0.65);
              const candleHeight = Math.max(1, Math.abs(closeY - openY));
              const candleY = Math.min(openY, closeY);

              return (
                <g key={idx}>
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  <rect
                    x={x - candleWidth / 2}
                    y={candleY}
                    width={candleWidth}
                    height={candleHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })
          }

          {/* SMA line overlay */}
          {showSMA && smaPath && (
            <path
              d={smaPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray="1"
            />
          )}

          {/* Crosshair indicator */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={height - paddingBottom}
                stroke="var(--primary)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(data[hoverIndex].close)}
                r="4.5"
                fill="var(--primary)"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* X ticks */}
          {data.map((d, idx) => {
            const step = Math.ceil(data.length / 5);
            if (idx % step === 0 || idx === data.length - 1) {
              return (
                <text
                  key={idx}
                  x={getX(idx)}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="8.5"
                  fontFamily="Inter"
                >
                  {d.time}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Floating Tooltip */}
        {activeHoverData && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            gap: '0.75rem',
            pointerEvents: 'none',
            zIndex: 10,
            fontSize: '0.7rem',
            fontFamily: 'Inter',
            backdropFilter: 'blur(4px)'
          }}>
            <div>
              <p style={{ color: 'var(--text-muted)' }}>Date/Time</p>
              <p style={{ fontWeight: 700 }}>{activeHoverData.time}</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '0.50rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Open</p>
              <p style={{ fontWeight: 700 }}>₹{activeHoverData.open}</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '0.50rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>High</p>
              <p style={{ fontWeight: 700, color: 'var(--success)' }}>₹{activeHoverData.high}</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '0.50rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Low</p>
              <p style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{activeHoverData.low}</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '0.50rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Close</p>
              <p style={{ fontWeight: 700 }}>₹{activeHoverData.close}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default StockChart;
