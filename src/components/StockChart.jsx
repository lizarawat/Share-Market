import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { Calendar, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const TIMEFRAMES = [
  { label: '1m', interval: '1m', range: '1d', aggregate: 1 },
  { label: '2m', interval: '2m', range: '1d', aggregate: 1 },
  { label: '3m', interval: '1m', range: '1d', aggregate: 3 },
  { label: '4m', interval: '1m', range: '1d', aggregate: 4 },
  { label: '5m', interval: '5m', range: '1d', aggregate: 1 },
  { label: '10m', interval: '5m', range: '2d', aggregate: 2 },
  { label: '15m', interval: '15m', range: '2d', aggregate: 1 },
  { label: '30m', interval: '30m', range: '5d', aggregate: 1 },
  { label: '1H', interval: '1h', range: '1mo', aggregate: 1 },
  { label: '4H', interval: '4h', range: '3mo', aggregate: 1 },
  { label: '1D', interval: '1d', range: '1y', aggregate: 1 },
  { label: '1W', interval: '1wk', range: '2y', aggregate: 1 },
  { label: '1M', interval: '1mo', range: '5y', aggregate: 1 },
  { label: '1Y', interval: '1mo', range: 'max', aggregate: 12 }
];

const aggregateCandles = (history, groupSize) => {
  if (!history || history.length === 0 || groupSize <= 1) return history;
  const aggregated = [];
  for (let i = 0; i < history.length; i += groupSize) {
    const chunk = history.slice(i, i + groupSize);
    if (chunk.length === 0) continue;
    const open = chunk[0].open;
    const close = chunk[chunk.length - 1].close;
    const high = Math.max(...chunk.map(c => c.high));
    const low = Math.min(...chunk.map(c => c.low));
    aggregated.push({
      time: chunk[0].time,
      open,
      high,
      low,
      close,
      price: close
    });
  }
  return aggregated;
};

const StockChart = ({ ticker }) => {
  const { priceHistory, fetchStockHistoryFromAPI } = useMarket();
  const [chartType, setChartType] = useState('candlestick'); // 'line' or 'candlestick'
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[10]); // default to 1D
  const [showSMA, setShowSMA] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  
  // Local chart data loaded from API
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Zoom states
  const [zoomX, setZoomX] = useState(65); // default visible candle count span
  const [zoomY, setZoomY] = useState(1.0); // Y-axis price scaling padding multiplier

  // Fetch history from API whenever ticker or range/interval changes
  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      setIsLoading(true);
      const data = await fetchStockHistoryFromAPI(ticker, selectedTimeframe.range, selectedTimeframe.interval);
      if (active) {
        if (data && data.history && data.history.length > 0) {
          if (selectedTimeframe.aggregate > 1) {
            setChartData(aggregateCandles(data.history, selectedTimeframe.aggregate));
          } else {
            setChartData(data.history);
          }
        } else {
          setChartData(priceHistory[ticker] || []);
        }
        setIsLoading(false);
      }
    };
    loadHistory();
    return () => { active = false; };
  }, [ticker, selectedTimeframe, priceHistory, fetchStockHistoryFromAPI]);

  const resetZoom = () => {
    setZoomX(65);
    setZoomY(1.0);
  };

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
        borderRadius: '10px',
        minHeight: '280px'
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
        borderRadius: '10px',
        minHeight: '280px'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No price ticks available for {ticker}</p>
      </div>
    );
  }

  // Slice data based on zoomX (Horizontal zoom)
  const visibleData = data.slice(-Math.min(data.length, Math.max(8, zoomX)));

  // Dimensions of SVG
  const width = 600;
  const height = 280;
  const paddingRight = 55;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scaling limits based on visible data and zoomY (Vertical zoom)
  let allVals = [];
  visibleData.forEach(d => {
    allVals.push(d.high, d.low, d.open, d.close);
  });
  const maxVal = Math.max(...allVals);
  const minVal = Math.min(...allVals);
  
  const valRange = maxVal - minVal;
  const midVal = (maxVal + minVal) / 2;
  const halfRange = ((valRange === 0 ? 10 : valRange) / 2) * zoomY;

  const yMax = midVal + halfRange;
  const yMin = Math.max(0.1, midVal - halfRange);

  const getX = (index) => {
    return paddingLeft + (index / (visibleData.length - 1)) * chartWidth;
  };

  const getY = (value) => {
    return paddingTop + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
  };

  // Line Chart path
  let linePath = "";
  visibleData.forEach((d, idx) => {
    const x = getX(idx);
    const y = getY(d.close);
    if (idx === 0) {
      linePath += `M ${x} ${y}`;
    } else {
      linePath += ` L ${x} ${y}`;
    }
  });

  const areaPath = linePath ? `${linePath} L ${getX(visibleData.length - 1)} ${getY(yMin)} L ${getX(0)} ${getY(yMin)} Z` : "";

  // SMA computation
  let smaPath = "";
  const smaPeriod = 10;
  const smaData = [];

  for (let i = 0; i < visibleData.length; i++) {
    if (i >= smaPeriod - 1) {
      let sum = 0;
      for (let j = 0; j < smaPeriod; j++) {
        sum += visibleData[i - j].close;
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
    const index = Math.round((relativeX / chartWidth) * (visibleData.length - 1));
    
    if (index >= 0 && index < visibleData.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeHoverData = hoverIndex !== null ? visibleData[hoverIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', width: '100%' }}>
      
      {/* Timeframes and layout controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        {/* Left Side: Type and Timeframe ribbon */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {/* Chart type switch */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '0.15rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setChartType('candlestick')}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.7rem',
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
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: chartType === 'line' ? 'var(--primary)' : 'transparent',
                color: chartType === 'line' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              Line
            </button>
          </div>

          {/* Timeframes Ribbon */}
          <div style={{ display: 'flex', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '0.15rem', borderRadius: '8px', border: '1px solid var(--border)', gap: '1px' }}>
            {TIMEFRAMES.map(tf => {
              const isSelected = selectedTimeframe.label === tf.label;
              return (
                <button
                  key={tf.label}
                  onClick={() => setSelectedTimeframe(tf)}
                  style={{
                    padding: '0.25rem 0.45rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SMA Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
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

      {/* Dynamic Hover Quote Overlay */}
      <div style={{
        minHeight: '26px',
        display: 'flex',
        gap: '1rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        background: 'rgba(255, 255, 255, 0.01)',
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
        border: '1px solid var(--border)'
      }}>
        {activeHoverData ? (
          <>
            <span>Time: <strong style={{ color: '#fff' }}>{activeHoverData.time}</strong></span>
            <span>Open: <strong style={{ color: '#fff' }}>₹{activeHoverData.open.toFixed(2)}</strong></span>
            <span>High: <strong style={{ color: 'var(--success)' }}>₹{activeHoverData.high.toFixed(2)}</strong></span>
            <span>Low: <strong style={{ color: 'var(--danger)' }}>₹{activeHoverData.low.toFixed(2)}</strong></span>
            <span>Close: <strong style={{ color: '#fff' }}>₹{activeHoverData.close.toFixed(2)}</strong></span>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Hover over candles to view tick values</span>
        )}
      </div>

      {/* SVG Canvas Board */}
      <div style={{ position: 'relative', flex: 1, minHeight: '240px' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ overflow: 'visible', userSelect: 'none' }}
        >
          {/* Grid lines and Y prices */}
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
                  fontFamily="monospace"
                  fontWeight="600"
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
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              <path
                d={areaPath}
                fill="url(#areaGrad)"
                stroke="none"
              />
              <path
                d={linePath}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Candlestick view */}
          {chartType === 'candlestick' && (
            <g>
              {visibleData.map((d, idx) => {
                const x = getX(idx);
                const yOpen = getY(d.open);
                const yClose = getY(d.close);
                const yHigh = getY(d.high);
                const yLow = getY(d.low);

                const isBullish = d.close >= d.open;
                const strokeColor = isBullish ? 'var(--success)' : 'var(--danger)';
                const fillColor = isBullish ? 'var(--success)' : 'var(--danger)';

                // Width of candle based on density
                const candleWidth = Math.max(1.5, (chartWidth / visibleData.length) * 0.65);

                return (
                  <g key={idx}>
                    {/* Wick line */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={strokeColor}
                      strokeWidth="1.2"
                    />
                    {/* Body rect */}
                    <rect
                      x={x - candleWidth / 2}
                      y={Math.min(yOpen, yClose)}
                      width={candleWidth}
                      height={Math.max(1.2, Math.abs(yOpen - yClose))}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="0.5"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* SMA line overlay */}
          {showSMA && smaPath && (
            <path
              d={smaPath}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="2 1"
            />
          )}

          {/* Vertical cursor tracking line on hover */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + chartHeight}
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(visibleData[hoverIndex].close)}
                r="4.5"
                fill="var(--accent)"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* X axis labels (Time) */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: `${paddingLeft}px`,
          width: `${chartWidth}px`,
          height: `${paddingBottom}px`,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '8px',
          color: 'var(--text-muted)',
          paddingTop: '6px',
          pointerEvents: 'none',
          fontFamily: 'monospace'
        }}>
          <span>{visibleData[0]?.time}</span>
          <span>{visibleData[Math.floor(visibleData.length / 2)]?.time}</span>
          <span>{visibleData[visibleData.length - 1]?.time}</span>
        </div>
      </div>

      {/* Axis zoom controls panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '0.5rem 0.75rem'
      }}>
        
        {/* Horizontal Zoom (X axis span) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Horizontal Zoom:</span>
          <button
            onClick={() => setZoomX(prev => Math.min(prev + 10, data.length))}
            style={{
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Zoom Out (Show More Candles)"
          >
            <ZoomOut size={12} />
          </button>
          <input
            type="range"
            min={10}
            max={data.length}
            value={zoomX}
            onChange={(e) => setZoomX(parseInt(e.target.value))}
            style={{ width: '80px', accentColor: 'var(--accent)', cursor: 'pointer', height: '4px' }}
          />
          <button
            onClick={() => setZoomX(prev => Math.max(prev - 10, 10))}
            style={{
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Zoom In (Show Fewer Candles)"
          >
            <ZoomIn size={12} />
          </button>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{zoomX} Candles</span>
        </div>

        {/* Vertical Zoom (Y axis height scale) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Vertical Zoom:</span>
          <button
            onClick={() => setZoomY(prev => Math.min(prev + 0.15, 2.5))}
            style={{
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Zoom Out (Flatten Prices)"
          >
            <ZoomOut size={12} />
          </button>
          <input
            type="range"
            min={0.3}
            max={2.5}
            step={0.1}
            value={zoomY}
            onChange={(e) => setZoomY(parseFloat(e.target.value))}
            style={{ width: '80px', accentColor: 'var(--accent)', cursor: 'pointer', height: '4px' }}
          />
          <button
            onClick={() => setZoomY(prev => Math.max(prev - 0.15, 0.3))}
            style={{
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Zoom In (Stretch Prices)"
          >
            <ZoomIn size={12} />
          </button>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{Math.round(100 / zoomY)}% Scale</span>
        </div>

        {/* Reset Zoom Button */}
        <button
          onClick={resetZoom}
          style={{
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            background: 'var(--primary-glow)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: 'var(--primary)',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            transition: 'all var(--transition-fast)'
          }}
          className="glass-card-interactive"
        >
          <RotateCcw size={12} />
          100% (Reset)
        </button>

      </div>

    </div>
  );
};

export default StockChart;
