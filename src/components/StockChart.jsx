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

// Helper to generate realistic mock history walking backwards from currentPrice
const generateMockHistory = (currentPrice, count = 40) => {
  const result = [];
  let price = currentPrice;
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.49) * (price * 0.012);
    const open = price - change;
    const close = price;
    const high = Math.max(open, close) + Math.random() * (price * 0.005);
    const low = Math.min(open, close) - Math.random() * (price * 0.005);
    const volume = Math.floor(Math.random() * 8000 + 2000);

    const timeString = new Date(now.getTime() - i * 5 * 60000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    result.push({
      time: timeString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });

    price = open;
  }
  return result.reverse();
};

const StockChart = ({ ticker }) => {
  const { priceHistory, fetchStockHistoryFromAPI, stocks } = useMarket();
  const [chartType, setChartType] = useState('candlestick'); // 'line', 'candlestick', or 'heikin-ashi'
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[4]); // default to 5m
  const [showSMA, setShowSMA] = useState(false);
  const [showTrendline, setShowTrendline] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  
  // Local chart data loaded from API
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Zoom states
  const [zoomX, setZoomX] = useState(65); // default visible candle count span
  const [zoomY, setZoomY] = useState(1.0); // Y-axis price scaling padding multiplier
  const [scrollOffset, setScrollOffset] = useState(0);

  const svgRef = React.useRef(null);

  // Chart drag to pan states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollOffset, setDragStartScrollOffset] = useState(0);

  // Reset scrollOffset on stock change
  useEffect(() => {
    setScrollOffset(0);
  }, [ticker]);

  // Touchpad non-passive wheel events mapping (pinch-zoom deltaY and horizontal pan deltaX)
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const onWheel = (e) => {
      e.preventDefault();
      const zoomStep = Math.max(1, Math.round(zoomX * 0.08));

      // 1. Pinch zoom or vertical scroll zoom
      if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        if (e.deltaY > 0) {
          setZoomX(prev => Math.min(prev + zoomStep, chartData.length));
        } else {
          setZoomX(prev => Math.max(prev - zoomStep, 10));
        }
      } 
      // 2. Pan (horizontal scrolling)
      else {
        const panStep = Math.max(1, Math.round(zoomX * 0.03));
        const minOffset = -zoomX + 10;
        const maxOffset = chartData.length - 10;
        if (e.deltaX > 0) {
          setScrollOffset(prev => Math.max(minOffset, prev - panStep));
        } else {
          setScrollOffset(prev => Math.min(maxOffset, prev + panStep));
        }
      }
    };

    svgEl.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      svgEl.removeEventListener('wheel', onWheel);
    };
  }, [svgRef, zoomX, chartData.length, scrollOffset]);

  // Fetch history from API whenever ticker or range/interval changes
  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      setIsLoading(true);
      
      // Clear local state first
      setChartData([]);

      const data = await fetchStockHistoryFromAPI(ticker, selectedTimeframe.range, selectedTimeframe.interval);
      if (active) {
        if (data && data.history && data.history.length > 0) {
          // If timeframe requires aggregation (e.g. 3m candles made of 1m)
          let finalHist = data.history;
          if (selectedTimeframe.aggregate > 1) {
            const agg = [];
            const src = data.history;
            for (let i = 0; i < src.length; i += selectedTimeframe.aggregate) {
              const chunk = src.slice(i, i + selectedTimeframe.aggregate);
              if (chunk.length > 0) {
                agg.push({
                  time: chunk[chunk.length - 1].time,
                  open: chunk[0].open,
                  high: Math.max(...chunk.map(c => c.high)),
                  low: Math.min(...chunk.map(c => c.low)),
                  close: chunk[chunk.length - 1].close,
                  volume: chunk.reduce((sum, c) => sum + (c.volume || 0), 0)
                });
              }
            }
            finalHist = agg;
          }
          setChartData(finalHist);
        } else {
          // Fallback to local context cache
          if (priceHistory[ticker]) {
            setChartData(priceHistory[ticker]);
          } else {
            // Generate mock fallback walking backwards from live price quote
            const stockObj = stocks.find(s => s.ticker === ticker);
            const currentPrice = stockObj ? stockObj.price : 500;
            setChartData(generateMockHistory(currentPrice, 40));
          }
        }
        setIsLoading(false);
      }
    };
    loadHistory();
    return () => { active = false; };
  }, [ticker, selectedTimeframe, priceHistory, fetchStockHistoryFromAPI, stocks]);

  const resetZoom = () => {
    setZoomX(65);
    setZoomY(1.0);
    setScrollOffset(0);
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

  // Infinite Dragging Bounds (Allow dragging past boundaries for empty space)
  const minOffset = -zoomX + 10;
  const maxOffset = data.length - 10;
  const currentScrollOffset = Math.max(minOffset, Math.min(scrollOffset, maxOffset));
  const startIndex = data.length - zoomX - currentScrollOffset;

  // Build finalRenderData padding mock slots where index goes out of bounds
  const visibleData = [];
  for (let i = 0; i < zoomX; i++) {
    const dataIdx = startIndex + i;
    if (dataIdx >= 0 && dataIdx < data.length) {
      visibleData.push({ ...data[dataIdx], isMockSlot: false });
    } else {
      visibleData.push({ 
        time: '', 
        open: null, 
        high: null, 
        low: null, 
        close: null, 
        volume: 0, 
        isMockSlot: true 
      });
    }
  }

  // Heikin-Ashi Transformation (smooth candles)
  let finalRenderData = visibleData;
  if (chartType === 'heikin-ashi' && visibleData.length > 0) {
    const ha = [];
    // Find first non-mock slot to initialize
    const firstValid = visibleData.find(v => !v.isMockSlot) || visibleData[0];
    let prevOpen = firstValid.open || 0;
    let prevClose = firstValid.close || 0;

    for (let i = 0; i < visibleData.length; i++) {
      const d = visibleData[i];
      if (d.isMockSlot) {
        ha.push(d);
        continue;
      }

      const haClose = (d.open + d.high + d.low + d.close) / 4;
      const haOpen = (prevOpen + prevClose) / 2;
      const haHigh = Math.max(d.high, haOpen, haClose);
      const haLow = Math.min(d.low, haOpen, haClose);

      ha.push({
        ...d,
        open: haOpen,
        close: haClose,
        high: haHigh,
        low: haLow
      });

      prevOpen = haOpen;
      prevClose = haClose;
    }
    finalRenderData = ha;
  }

  // Dynamic X-Axis Step interval rendering based on zoom levels:
  let step = 20;
  if (zoomX <= 12) {
    step = 1;
  } else if (zoomX <= 25) {
    step = 2;
  } else if (zoomX <= 45) {
    step = 5;
  } else if (zoomX <= 80) {
    step = 10;
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

  // Scaling limits based on finalRenderData valid candles
  const validTicks = finalRenderData.filter(d => !d.isMockSlot && d.open !== null);
  let maxVal = 10;
  let minVal = 0;
  if (validTicks.length > 0) {
    let allVals = [];
    validTicks.forEach(d => {
      allVals.push(d.high, d.low, d.open, d.close);
    });
    maxVal = Math.max(...allVals);
    minVal = Math.min(...allVals);
  }
  
  const valRange = maxVal - minVal;
  const midVal = (maxVal + minVal) / 2;
  const halfRange = ((valRange === 0 ? 10 : valRange) / 2) * zoomY;

  const yMax = midVal + halfRange;
  const yMin = Math.max(0.1, midVal - halfRange);

  const getX = (index) => {
    return paddingLeft + (index / (finalRenderData.length - 1)) * chartWidth;
  };

  const getY = (value) => {
    return paddingTop + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
  };

  // Line Chart path (ignoring empty mock slots)
  let linePath = "";
  let areaPath = "";
  const validLinePoints = finalRenderData
    .map((d, idx) => ({ d, idx }))
    .filter(item => !item.d.isMockSlot && item.d.close !== null);

  if (validLinePoints.length > 0) {
    validLinePoints.forEach((point, i) => {
      const x = getX(point.idx);
      const y = getY(point.d.close);
      if (i === 0) {
        linePath += `M ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
      }
    });
    areaPath = `${linePath} L ${getX(validLinePoints[validLinePoints.length - 1].idx)} ${getY(yMin)} L ${getX(validLinePoints[0].idx)} ${getY(yMin)} Z`;
  }

  // SMA computation (10 period)
  let smaPath = "";
  const smaPeriod = 10;
  const smaData = [];

  for (let i = 0; i < finalRenderData.length; i++) {
    const d = finalRenderData[i];
    if (d.isMockSlot) continue;

    if (i >= smaPeriod - 1) {
      let sum = 0;
      let validCount = 0;
      for (let j = 0; j < smaPeriod; j++) {
        if (!finalRenderData[i - j].isMockSlot) {
          sum += finalRenderData[i - j].close;
          validCount++;
        }
      }
      if (validCount === smaPeriod) {
        const avg = sum / smaPeriod;
        smaData.push({ index: i, value: avg });
      }
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

  // Linear Regression Trendline (ignoring mock slots)
  let trendlinePoints = null;
  if (showTrendline) {
    const validPts = [];
    finalRenderData.forEach((d, idx) => {
      if (!d.isMockSlot && d.close !== null) {
        validPts.push({ x: idx, y: d.close });
      }
    });

    if (validPts.length >= 2) {
      const N = validPts.length;
      let sumX = 0;
      let sumY = 0;
      let sumXY = 0;
      let sumXX = 0;

      validPts.forEach(p => {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
      });

      const slope = (N * sumXY - sumX * sumY) / (N * sumXX - sumX * sumX || 1);
      const intercept = (sumY - slope * sumX) / N;

      const firstIndex = validPts[0].x;
      const lastIndex = validPts[validPts.length - 1].x;

      const yStart = slope * firstIndex + intercept;
      const yEnd = slope * lastIndex + intercept;

      trendlinePoints = {
        x1: getX(firstIndex),
        y1: getY(yStart),
        x2: getX(lastIndex),
        y2: getY(yEnd)
      };
    }
  }

  // Y-Axis division lines
  const gridLines = [];
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const val = yMin + (i / gridCount) * (yMax - yMin);
    gridLines.push(val);
  }

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // left click only
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartScrollOffset(scrollOffset);
  };

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    
    // Scale client X pixel to viewBox layout grid width
    const relativeX = (mouseX / svgRect.width) * width - paddingLeft;
    const index = Math.round((relativeX / chartWidth) * (finalRenderData.length - 1));
    
    if (index >= 0 && index < finalRenderData.length) {
      setHoverIndex(index);
    }

    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const barsMoved = Math.round((deltaX / svgRect.width) * zoomX);
      setScrollOffset(Math.max(minOffset, Math.min(maxOffset, dragStartScrollOffset + barsMoved)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setIsDragging(false);
  };

  const activeHoverData = hoverIndex !== null && !finalRenderData[hoverIndex]?.isMockSlot ? finalRenderData[hoverIndex] : null;

  // Maximum volume in visibleData to scale the volume profile bars
  const maxVol = Math.max(...finalRenderData.map(d => d.volume || (Math.abs(d.close - d.open) * 1000 + 500)));

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
              onClick={() => setChartType('heikin-ashi')}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: chartType === 'heikin-ashi' ? 'var(--primary)' : 'transparent',
                color: chartType === 'heikin-ashi' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              Heikin Ashi
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

        {/* Indicators Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={showSMA}
              onChange={() => setShowSMA(!showSMA)}
              style={{ accentColor: 'var(--accent)' }}
            />
            SMA (10)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={showTrendline}
              onChange={() => setShowTrendline(!showTrendline)}
              style={{ accentColor: 'var(--accent)' }}
            />
            Trendline
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
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{
            overflow: 'visible',
            userSelect: 'none',
            cursor: isDragging ? 'grabbing' : (hoverIndex !== null ? 'crosshair' : 'grab')
          }}
        >
          {/* Grid lines and Y prices (Legible & High Contrast) */}
          {gridLines.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text
                  x={width - paddingRight + 6}
                  y={y + 3.5}
                  fill="#e2e8f0"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  ₹{val.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </text>
              </g>
            );
          })}

          {/* Vertical grid lines (Subtle timeline lines) */}
          {finalRenderData.map((d, idx) => {
            if (d.isMockSlot || !d.time) return null;
            const absoluteIndex = startIndex + idx;
            if (absoluteIndex % step !== 0) return null;
            const x = getX(idx);
            return (
              <line
                key={`grid-x-${idx}`}
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={paddingTop + chartHeight}
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="0.8"
              />
            );
          })}

          {/* Volume Profile Bars (TradingView style at bottom) */}
          <g opacity="0.12">
            {finalRenderData.map((d, idx) => {
              if (d.isMockSlot) return null;
              const x = getX(idx);
              const vol = d.volume || (Math.abs(d.close - d.open) * 1000 + 500);
              const volHeight = (vol / (maxVol || 1)) * (chartHeight * 0.18);
              const y = paddingTop + chartHeight - volHeight;
              const isUpCandle = d.close >= d.open;
              const fill = isUpCandle ? 'var(--success)' : 'var(--danger)';
              const candleWidth = (chartWidth / finalRenderData.length) * 0.65;
              const barWidth = Math.max(1.5, candleWidth * 0.8);
              return (
                <rect
                  key={idx}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={volHeight}
                  fill={fill}
                />
              );
            })}
          </g>

          {/* Line view */}
          {chartType === 'line' && linePath && (
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
              />
              <path
                d={linePath}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
              />
            </>
          )}

          {/* Candlestick / Heikin-Ashi view */}
          {(chartType === 'candlestick' || chartType === 'heikin-ashi') && (
            <g>
              {finalRenderData.map((d, idx) => {
                if (d.isMockSlot) return null;
                const x = getX(idx);
                const yOpen = getY(d.open);
                const yClose = getY(d.close);
                const yHigh = getY(d.high);
                const yLow = getY(d.low);

                const isUpCandle = d.close >= d.open;
                const fillColor = isUpCandle ? 'var(--success)' : 'var(--danger)';
                const strokeColor = isUpCandle ? 'var(--success)' : 'var(--danger)';
                const candleWidth = (chartWidth / finalRenderData.length) * 0.65;

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

          {/* Trendline overlay */}
          {showTrendline && trendlinePoints && (
            <line
              x1={trendlinePoints.x1}
              y1={trendlinePoints.y1}
              x2={trendlinePoints.x2}
              y2={trendlinePoints.y2}
              stroke="var(--secondary)"
              strokeWidth="2"
              strokeDasharray="4 3"
              style={{ filter: 'drop-shadow(0 0 3px var(--secondary-glow))' }}
            />
          )}

          {/* Vertical cursor tracking line on hover */}
          {hoverIndex !== null && finalRenderData[hoverIndex] && !finalRenderData[hoverIndex].isMockSlot && (
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
                cy={getY(finalRenderData[hoverIndex].close)}
                r="4.5"
                fill="var(--accent)"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* X Axis Timeline Labels (Dynamic Multiples Steps - Legible & Pinned) */}
          {finalRenderData.map((d, idx) => {
            if (d.isMockSlot || !d.time) return null;
            const absoluteIndex = startIndex + idx;
            if (absoluteIndex % step !== 0) return null;

            const x = getX(idx);
            const y = paddingTop + chartHeight + 15;
            return (
              <text
                key={`lbl-x-${idx}`}
                x={x}
                y={y}
                fill="#cbd5e1"
                fontSize="9.5"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="700"
              >
                {d.time}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Axis zoom controls panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '0.4rem 0.75rem'
      }}>
        
        {/* Horizontal Zoom (X axis span) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>X-Zoom:</span>
          <button
            onClick={() => setZoomX(prev => Math.min(prev + 10, data.length))}
            style={{
              padding: '0.15rem 0.3rem',
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
            <ZoomOut size={11} />
          </button>
          <input
            type="range"
            min={10}
            max={data.length}
            value={zoomX}
            onChange={(e) => setZoomX(parseInt(e.target.value))}
            style={{ width: '70px', accentColor: 'var(--accent)', cursor: 'pointer', height: '3px' }}
          />
          <button
            onClick={() => setZoomX(prev => Math.max(prev - 10, 10))}
            style={{
              padding: '0.15rem 0.3rem',
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
            <ZoomIn size={11} />
          </button>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', minWidth: '55px' }}>{zoomX} bars</span>
        </div>

        {/* Vertical Zoom (Y axis height scale) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Y-Zoom:</span>
          <button
            onClick={() => setZoomY(prev => Math.min(prev + 0.15, 2.5))}
            style={{
              padding: '0.15rem 0.3rem',
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
            <ZoomOut size={11} />
          </button>
          <input
            type="range"
            min={0.3}
            max={2.5}
            step={0.1}
            value={zoomY}
            onChange={(e) => setZoomY(parseFloat(e.target.value))}
            style={{ width: '70px', accentColor: 'var(--accent)', cursor: 'pointer', height: '3px' }}
          />
          <button
            onClick={() => setZoomY(prev => Math.max(prev - 0.15, 0.3))}
            style={{
              padding: '0.15rem 0.3rem',
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
            <ZoomIn size={11} />
          </button>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', minWidth: '45px' }}>{Math.round(100 / zoomY)}%</span>
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
          <RotateCcw size={11} />
          100%
        </button>

      </div>

    </div>
  );
};

export default StockChart;
