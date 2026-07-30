import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MarketContext = createContext();

// Seed fallback data helper in case Yahoo Finance API is unavailable
const generateHistoricalData = (startPrice, points = 30, volatility = 0.015) => {
  let data = [];
  let currentPrice = startPrice;
  const now = new Date();
  
  for (let i = points; i > 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000);
    const changePercent = (Math.random() - 0.5) * 2 * volatility;
    const open = currentPrice;
    const close = currentPrice * (1 + changePercent);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      price: parseFloat(close.toFixed(2))
    });
    
    currentPrice = close;
  }
  return data;
};

// Initial Indian Bluechip stocks watch list seeds
const INITIAL_INDIAN_STOCKS = [
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries Ltd', price: 2450.0, open: 2445.0, high: 2465.0, low: 2435.0, prevClose: 2440.0, sector: 'Energy & Retail', volatility: 0.012, desc: 'India\'s largest private conglomerate with presence in refining, retail, and telecommunications (Jio).' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', price: 3420.0, open: 3410.0, high: 3445.0, low: 3395.0, prevClose: 3405.0, sector: 'Technology', volatility: 0.01, desc: 'A leading global IT services provider and anchor company of the Tata Group.' },
  { ticker: 'INFY.NS', name: 'Infosys Ltd', price: 1450.0, open: 1452.0, high: 1468.0, low: 1442.0, prevClose: 1455.0, sector: 'Technology', volatility: 0.015, desc: 'Pioneer of the Indian IT service model providing business consulting and technology outsourcing.' },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', price: 1620.0, open: 1615.0, high: 1632.0, low: 1608.0, prevClose: 1612.0, sector: 'Finance', volatility: 0.011, desc: 'India\'s largest private sector bank by assets and market capitalization.' },
  { ticker: 'SBIN.NS', name: 'State Bank of India', price: 585.0, open: 582.0, high: 591.0, low: 579.0, prevClose: 580.0, sector: 'Finance', volatility: 0.016, desc: 'The largest public sector banking and financial services institution in India.' },
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', price: 890.0, open: 885.0, high: 898.0, low: 881.0, prevClose: 884.0, sector: 'Telecom', volatility: 0.013, desc: 'A leading global telecommunications company operating across 18 countries in Asia and Africa.' },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', price: 955.0, open: 952.0, high: 963.0, low: 947.0, prevClose: 950.0, sector: 'Finance', volatility: 0.012, desc: 'Leading private sector bank offering diverse financial services through multi-channels.' }
];

const INITIAL_LESSONS = [
  {
    id: 1,
    title: "Stock Market Basics",
    category: "Getting Started",
    description: "Learn what the stock market is, how exchanges function, and basic market terminology.",
    xpReward: 100,
    completed: false,
    quizScore: null,
    slides: [
      {
        title: "What is a Share?",
        content: "A share represents fractional ownership of a corporation. When you buy a share of Reliance, you literally own a micro-percentage of that company. As the company grows in profitability and value, your share value increases.",
        concept: "Ownership",
        visualData: { label: "Company Value", segments: [{ name: "Your Share", value: 5, color: "#6366f1" }, { name: "Other Investors", value: 95, color: "#1f2937" }] }
      },
      {
        title: "The Stock Exchange",
        content: "Stocks are traded on public marketplaces called exchanges (in India, NSE and BSE). Buyers and sellers place orders, and the exchange matches them. Prices change instantly based on supply and demand: more buyers drives prices UP; more sellers drives prices DOWN.",
        concept: "Market Matching",
        visualData: null
      },
      {
        title: "Bulls vs. Bears",
        content: "Markets go through distinct cycles. A Bull Market refers to a period where stock prices are rising and economic confidence is high. A Bear Market represents a period where stock prices are falling, usually by 20% or more, amid recession fears.",
        concept: "Market Sentiment",
        visualData: null
      }
    ],
    quiz: [
      {
        question: "What does buying a share of stock represent?",
        options: [
          "A loan you make to the government",
          "Fractional ownership in a corporation",
          "A guarantee of annual salary bonuses",
          "A certificate to purchase the company's products for free"
        ],
        correctAnswer: 1,
        explanation: "Buying a share means you own a small piece of the company's assets and earnings."
      },
      {
        question: "If a market is described as a 'Bear Market', what is happening?",
        options: [
          "Prices are rising rapidly due to high demand",
          "Stocks are trading sideways with zero movement",
          "Prices are generally falling, showing pessimistic sentiment",
          "Only tech and green energy shares are allowed to trade"
        ],
        correctAnswer: 2,
        explanation: "Bear markets represent falling prices and pessimism, named after the downward swipe of a bear's paw."
      }
    ]
  },
  {
    id: 2,
    title: "Understanding Chart Styles",
    category: "Technical Analysis",
    description: "Learn how to read line charts, candlestick charts, and identify price trends.",
    xpReward: 150,
    completed: false,
    quizScore: null,
    slides: [
      {
        title: "The Anatomy of a Candlestick",
        content: "A candlestick chart displays the Open, High, Low, and Close (OHLC) prices for a specific time frame. The thick body shows the range between Open and Close. The thin lines (shadows/wicks) show the highest and lowest prices reached.",
        concept: "OHLC Anatomy",
        visualData: null
      },
      {
        title: "Green vs. Red Candles",
        content: "A candlestick is GREEN (or bullish) if the Close price is higher than the Open price. It is RED (or bearish) if the Close price is lower than the Open price. Wicks represent extreme prices rejected by the market during that timeframe.",
        concept: "Candlestick Color",
        visualData: null
      },
      {
        title: "Support and Resistance",
        content: "Support is a price level where a downtrend tends to pause due to a concentration of buying demand. Resistance is a price level where an uptrend pauses due to selling pressure. Identifying these helps traders time entries and exits.",
        concept: "Floor and Ceiling",
        visualData: null
      }
    ],
    quiz: [
      {
        question: "On a red candlestick, where is the Open price located relative to the Close price?",
        options: [
          "Open is below the Close price",
          "Open is above the Close price",
          "Open and Close are at the exact same level",
          "Red candlesticks do not contain open prices"
        ],
        correctAnswer: 1,
        explanation: "A red candle is bearish, meaning the price closed lower than it opened. Therefore, the open is at the top of the body."
      },
      {
        question: "What is 'Support' in technical analysis?",
        options: [
          "The legal team defending a company in court",
          "A price ceiling where sellers dominate and force prices down",
          "A price floor where buying interest is strong enough to overcome selling pressure",
          "The cash deposit required to open a brokerage account"
        ],
        correctAnswer: 2,
        explanation: "Support acts as a floor. It is the price level where buyers step in, preventing the price from falling further."
      }
    ]
  },
  {
    id: 3,
    title: "Technical Indicators",
    category: "Technical Analysis",
    description: "Master Moving Averages and how they help identify market momentum.",
    xpReward: 200,
    completed: false,
    quizScore: null,
    slides: [
      {
        title: "What is a Moving Average?",
        content: "A Simple Moving Average (SMA) smooths out price data by creating a constantly updated average price. For example, a 10-day SMA adds the closing prices of the last 10 days and divides by 10. This filters out short-term market noise.",
        concept: "Trend Line",
        visualData: null
      },
      {
        title: "Golden Cross vs. Death Cross",
        content: "Traders look for moving average crossovers. When a short-term average (like 50-day) crosses ABOVE a long-term average (like 200-day), it is a bullish signal called a 'Golden Cross'. The opposite is a bearish 'Death Cross'.",
        concept: "Momentum Signals",
        visualData: null
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of using a Simple Moving Average (SMA)?",
        options: [
          "To predict exactly what price a stock will open at tomorrow",
          "To calculate corporate earnings tax deductions",
          "To smooth out price fluctuations and highlight the overall trend direction",
          "To guarantee a trade will make a profit"
        ],
        correctAnswer: 2,
        explanation: "SMAs smooth out volatile price data to help you identify the primary trend direction."
      }
    ]
  },
  {
    id: 4,
    title: "Fundamental Analysis",
    category: "Investment Strategy",
    description: "Learn how to read financial metrics: Market Cap, P/E Ratio, and Balance Sheets.",
    xpReward: 200,
    completed: false,
    quizScore: null,
    slides: [
      {
        title: "Market Capitalization",
        content: "Market Cap represents the total dollar value of a company's outstanding shares. It is calculated by: Share Price × Total Number of Shares. It categorizes companies into Large-cap ($10B+), Mid-cap ($2B-$10B), and Small-cap (under $2B).",
        concept: "Company Scale",
        visualData: null
      },
      {
        title: "Price-to-Earnings (P/E) Ratio",
        content: "The P/E ratio measures a company's current share price relative to its per-share earnings. Formula: Share Price / Earnings Per Share (EPS). A high P/E could mean the stock is overvalued, or that investors expect high growth in the future.",
        concept: "Valuation Multiple",
        visualData: null
      }
    ],
    quiz: [
      {
        question: "How is a company's Market Capitalization calculated?",
        options: [
          "Net Profit minus Assets",
          "Current Share Price multiplied by Total Outstanding Shares",
          "Annual Revenue divided by the P/E Ratio",
          "The value of real estate properties owned"
        ],
        correctAnswer: 1,
        explanation: "Market Cap = Share Price * Outstanding Shares, representing the cost to buy the entire company at market rate."
      },
      {
        question: "What does a very high P/E ratio generally suggest?",
        options: [
          "The company is bankrupt",
          "The stock is trading at a discount",
          "Investors are expecting high earnings growth or the stock is overvalued",
          "The company does not have a CEO"
        ],
        correctAnswer: 2,
        explanation: "A high P/E indicates investors are willing to pay a premium price per dollar of current earnings due to high growth expectations."
      }
    ]
  },
  {
    id: 5,
    title: "Risk Management",
    category: "Trading Psychology",
    description: "Learn to protect your capital using diversification, position sizing, and stop-losses.",
    xpReward: 250,
    completed: false,
    quizScore: null,
    slides: [
      {
        title: "The Power of Diversification",
        content: "Diversification means spreading your investments across different assets and sectors (e.g. holding technology, energy, healthcare, and retail). If one sector crashes due to sector-specific news, your other holdings insulate your portfolio.",
        concept: "Asset Allocation",
        visualData: null
      },
      {
        title: "Using Stop-Loss Orders",
        content: "A stop-loss order instructs your broker to automatically sell a stock if the price falls to a specific level. For example, if you buy a stock at ₹100 and set a stop-loss at ₹90, your maximum risk is capped at 10%.",
        concept: "Capital Protection",
        visualData: null
      }
    ],
    quiz: [
      {
        question: "What is the primary benefit of portfolio diversification?",
        options: [
          "It guarantees double-digit returns every month",
          "It lowers transaction fees at brokerages",
          "It reduces overall risk by spreading investments across different sectors",
          "It makes it easier to track your stock trades"
        ],
        correctAnswer: 2,
        explanation: "By spreading capital across unrelated sectors, a loss in one stock won't devastate your entire net worth."
      }
    ]
  }
];

export const MarketProvider = ({ children }) => {
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`market_app_in_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const saveState = (key, value) => {
    try {
      localStorage.setItem(`market_app_in_${key}`, JSON.stringify(value));
    } catch (e) {}
  };

  // State Declarations
  const [cash, setCash] = useState(() => loadState('cash', 500000)); // Starting cash ₹5,00,000
  const [portfolio, setPortfolio] = useState(() => loadState('portfolio', {}));
  const [stocks, setStocks] = useState(() => {
    const savedStocks = loadState('stocks', null);
    if (savedStocks) return savedStocks;
    return INITIAL_INDIAN_STOCKS;
  });
  
  const [priceHistory, setPriceHistory] = useState(() => {
    const savedHistory = loadState('priceHistory', null);
    if (savedHistory) return savedHistory;
    
    // Seed initial history
    const initialHist = {};
    INITIAL_INDIAN_STOCKS.forEach(stock => {
      initialHist[stock.ticker] = generateHistoricalData(stock.price - 40, 30, stock.volatility);
    });
    return initialHist;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [xp, setXp] = useState(() => loadState('xp', 0));
  const [badges, setBadges] = useState(() => loadState('badges', []));
  const [lessons, setLessons] = useState(() => loadState('lessons', INITIAL_LESSONS));
  const [transactionHistory, setTransactionHistory] = useState(() => loadState('transactionHistory', []));
  const [selectedStockTicker, setSelectedStockTicker] = useState('RELIANCE.NS');
  
  // Real-time API state indicators
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState(null);

  // Floating notifications
  const [appAlert, setAppAlert] = useState(null);
  const [audioNotifications, setAudioNotifications] = useState(true);

  // Sync to local storage
  useEffect(() => { saveState('cash', cash); }, [cash]);
  useEffect(() => { saveState('portfolio', portfolio); }, [portfolio]);
  useEffect(() => { saveState('stocks', stocks); }, [stocks]);
  useEffect(() => { saveState('priceHistory', priceHistory); }, [priceHistory]);
  useEffect(() => { saveState('xp', xp); }, [xp]);
  useEffect(() => { saveState('badges', badges); }, [badges]);
  useEffect(() => { saveState('lessons', lessons); }, [lessons]);
  useEffect(() => { saveState('transactionHistory', transactionHistory); }, [transactionHistory]);

  const triggerAlert = useCallback((message, type = 'info') => {
    setAppAlert({ message, type });
    setTimeout(() => setAppAlert(null), 4500);
  }, []);

  const playSound = useCallback((type) => {
    if (!audioNotifications) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'achievement') {
        osc.frequency.setValueAtTime(261.63, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.16);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.24);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}
  }, [audioNotifications]);

  // Search stocks suggestion endpoint proxy
  const searchRealTimeStock = async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await fetch(`/api-yahoo/v1/finance/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      // Filter out non-equities
      const quotes = data.quotes || [];
      return quotes
        .filter(q => q.quoteType === 'EQUITY' || q.typeDisp === 'Equity')
        .map(q => ({
          ticker: q.symbol,
          name: q.longname || q.shortname || q.symbol,
          exchange: q.exchange,
          sector: q.sector || 'Global Equity'
        }));
    } catch (e) {
      console.warn("Autocompletion search failed", e);
      return [];
    }
  };

  // Fetch chart history for active view
  const fetchStockHistoryFromAPI = async (ticker, range = '1d') => {
    const interval = range === '1d' ? '15m' : '1d';
    try {
      const response = await fetch(`/api-yahoo/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`);
      const data = await response.json();
      const result = data?.chart?.result?.[0];
      if (!result) return null;

      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0] || {};
      const meta = result.meta || {};

      const historyPoints = [];
      timestamps.forEach((t, index) => {
        const o = quote.open?.[index];
        const h = quote.high?.[index];
        const l = quote.low?.[index];
        const c = quote.close?.[index];
        
        if (o !== null && c !== null && h !== null && l !== null && o !== undefined) {
          const date = new Date(t * 1000);
          const timeStr = range === '1d' 
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

          historyPoints.push({
            time: timeStr,
            open: parseFloat(o.toFixed(2)),
            high: parseFloat(h.toFixed(2)),
            low: parseFloat(l.toFixed(2)),
            close: parseFloat(c.toFixed(2)),
            price: parseFloat(c.toFixed(2))
          });
        }
      });

      return {
        price: meta.regularMarketPrice,
        open: meta.regularMarketOpen || meta.chartPreviousClose || meta.regularMarketPrice,
        high: meta.regularMarketDayHigh || meta.regularMarketPrice,
        low: meta.regularMarketDayLow || meta.regularMarketPrice,
        prevClose: meta.chartPreviousClose || meta.regularMarketPrice,
        history: historyPoints,
        name: meta.longName || meta.shortName || ticker,
        exchange: meta.exchangeName
      };
    } catch (e) {
      console.error(`Error fetching history for ${ticker}`, e);
      return null;
    }
  };

  // Sync / refresh real-time prices for list & portfolio
  const syncStocksListWithAPI = useCallback(async () => {
    setIsApiLoading(true);
    setApiErrorMsg(null);

    // Make list of tickers we care about
    const watchlistTickers = stocks.map(s => s.ticker);
    const portfolioTickers = Object.keys(portfolio);
    const uniqueTickers = [...new Set([...watchlistTickers, ...portfolioTickers])];

    if (uniqueTickers.length === 0) {
      setIsApiLoading(false);
      return;
    }

    try {
      const promises = uniqueTickers.map(ticker => fetchStockHistoryFromAPI(ticker, '1d'));
      const results = await Promise.all(promises);

      let updatedStocks = [...stocks];
      let updatedHistory = { ...priceHistory };

      results.forEach((res, index) => {
        const ticker = uniqueTickers[index];
        if (res) {
          // 1. Update stock prices in state
          const existingStockIdx = updatedStocks.findIndex(s => s.ticker === ticker);
          
          const updatedInfo = {
            ticker,
            name: res.name,
            price: parseFloat(res.price.toFixed(2)),
            open: parseFloat(res.open.toFixed(2)),
            high: parseFloat(res.high.toFixed(2)),
            low: parseFloat(res.low.toFixed(2)),
            prevClose: parseFloat(res.prevClose.toFixed(2)),
            sector: updatedStocks[existingStockIdx]?.sector || 'Finance & Equity',
            volatility: updatedStocks[existingStockIdx]?.volatility || 0.015,
            desc: updatedStocks[existingStockIdx]?.desc || `Real-time public stock listed on ${res.exchange}`
          };

          if (existingStockIdx > -1) {
            updatedStocks[existingStockIdx] = updatedInfo;
          } else {
            updatedStocks.push(updatedInfo); // Add searched/imported stock to our local list
          }

          // 2. Update price history (limit to 40 data points)
          if (res.history && res.history.length > 0) {
            updatedHistory[ticker] = res.history.slice(-40);
          }
        }
      });

      setStocks(updatedStocks);
      setPriceHistory(updatedHistory);
    } catch (e) {
      setApiErrorMsg("Real-time API is currently rate-limited. Falling back to local market snapshots.");
      console.warn("Sync failed, rate limit or network issue.", e);
    } finally {
      setIsApiLoading(false);
    }
  }, [stocks, portfolio, priceHistory]);

  // Sync on startup, and set up automatic periodic sync every 15 seconds
  useEffect(() => {
    syncStocksListWithAPI();

    const interval = setInterval(() => {
      // Sync only if tab is not focused on quiz slide to prevent CPU waste
      syncStocksListWithAPI();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Add stock lookup & subscribe mechanism
  const addStockToWatchlist = useCallback(async (ticker) => {
    if (stocks.some(s => s.ticker === ticker)) {
      setSelectedStockTicker(ticker);
      return true;
    }

    setIsApiLoading(true);
    const data = await fetchStockHistoryFromAPI(ticker, '1d');
    setIsApiLoading(false);

    if (data) {
      const newStock = {
        ticker,
        name: data.name,
        price: data.price,
        open: data.open,
        high: data.high,
        low: data.low,
        prevClose: data.prevClose,
        sector: 'Searched Stock',
        volatility: 0.015,
        desc: `Public equity listed on ${data.exchange}. Added from real-time quote search.`
      };

      setStocks(prev => [...prev, newStock]);
      if (data.history && data.history.length > 0) {
        setPriceHistory(prev => ({ ...prev, [ticker]: data.history.slice(-40) }));
      }
      setSelectedStockTicker(ticker);
      triggerAlert(`Added ${ticker} to active watchlist!`, 'success');
      return true;
    } else {
      playSound('error');
      triggerAlert(`Could not retrieve quote details for ${ticker}.`, 'error');
      return false;
    }
  }, [stocks, triggerAlert, playSound]);

  const checkAndAwardBadge = useCallback((badgeName, desc) => {
    setBadges(prev => {
      if (prev.some(b => b.name === badgeName)) return prev;
      const newBadge = { name: badgeName, description: desc, earnedAt: new Date().toLocaleDateString() };
      playSound('achievement');
      triggerAlert(`Unlocked Badge: ${badgeName}!`, 'success');
      return [...prev, newBadge];
    });
  }, [playSound, triggerAlert]);

  const getLevelInfo = useCallback(() => {
    let currentLvl = 1;
    let rankName = "Novice Trader";
    let nextXpLimit = 100;
    let prevXpLimit = 0;
    
    if (xp >= 1000) {
      currentLvl = 5;
      rankName = "Market Guru";
      nextXpLimit = xp;
      prevXpLimit = 1000;
    } else if (xp >= 600) {
      currentLvl = 4;
      rankName = "Portfolio Manager";
      nextXpLimit = 1000;
      prevXpLimit = 600;
    } else if (xp >= 300) {
      currentLvl = 3;
      rankName = "Swing Trader";
      nextXpLimit = 600;
      prevXpLimit = 300;
    } else if (xp >= 100) {
      currentLvl = 2;
      rankName = "Retail Investor";
      nextXpLimit = 300;
      prevXpLimit = 100;
    }
    
    const progressPercent = nextXpLimit === prevXpLimit ? 100 : Math.round(((xp - prevXpLimit) / (nextXpLimit - prevXpLimit)) * 100);
    return { level: currentLvl, rankName, xp, nextXpLimit, prevXpLimit, progressPercent };
  }, [xp]);

  // Buy Order
  const buyStock = useCallback((ticker, quantity) => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      playSound('error');
      triggerAlert("Please enter a valid positive quantity.", "error");
      return false;
    }

    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock) return false;

    const totalCost = stock.price * qty;
    if (cash < totalCost) {
      playSound('error');
      triggerAlert("Insufficient cash balance to complete order.", "error");
      return false;
    }

    setCash(prev => prev - totalCost);
    setPortfolio(prev => {
      const existing = prev[ticker] || { quantity: 0, avgPrice: 0 };
      const newQty = existing.quantity + qty;
      const newAvg = ((existing.quantity * existing.avgPrice) + totalCost) / newQty;
      
      return {
        ...prev,
        [ticker]: {
          quantity: newQty,
          avgPrice: parseFloat(newAvg.toFixed(2))
        }
      };
    });

    setTransactionHistory(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'BUY',
        ticker,
        quantity: qty,
        price: stock.price,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);

    playSound('success');
    triggerAlert(`Successfully purchased ${qty} shares of ${ticker}!`, "success");
    checkAndAwardBadge("First Steps", "Completed your very first stock purchase.");
    return true;
  }, [stocks, cash, playSound, triggerAlert, checkAndAwardBadge]);

  // Sell Order
  const sellStock = useCallback((ticker, quantity) => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      playSound('error');
      triggerAlert("Please enter a valid positive quantity.", "error");
      return false;
    }

    const stock = stocks.find(s => s.ticker === ticker);
    const pos = portfolio[ticker];
    if (!stock || !pos || pos.quantity < qty) {
      playSound('error');
      triggerAlert("You do not own enough shares to sell.", "error");
      return false;
    }

    const totalRevenue = stock.price * qty;
    const profitLoss = (stock.price - pos.avgPrice) * qty;

    setCash(prev => prev + totalRevenue);
    setPortfolio(prev => {
      const remainingQty = pos.quantity - qty;
      const updated = { ...prev };
      
      if (remainingQty <= 0) {
        delete updated[ticker];
      } else {
        updated[ticker] = {
          ...pos,
          quantity: remainingQty
        };
      }
      return updated;
    });

    setTransactionHistory(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'SELL',
        ticker,
        quantity: qty,
        price: stock.price,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);

    playSound('success');
    triggerAlert(`Successfully sold ${qty} shares of ${ticker}!`, "success");
    
    if (profitLoss > 1000) {
      checkAndAwardBadge("Profit Maker", "Booked a profit of over ₹1,000 on a single transaction.");
    }
    return true;
  }, [stocks, portfolio, playSound, triggerAlert, checkAndAwardBadge]);

  const submitQuizAnswers = useCallback((lessonId, score) => {
    let earnedXP = 0;
    setLessons(prev => prev.map(lesson => {
      if (lesson.id === lessonId) {
        if (!lesson.completed) {
          earnedXP = lesson.xpReward;
        }
        return { ...lesson, completed: true, quizScore: score };
      }
      return lesson;
    }));

    if (earnedXP > 0) {
      setXp(prev => prev + earnedXP);
      triggerAlert(`Completed Lesson! +${earnedXP} XP Earned.`, 'success');
      playSound('achievement');
      
      const completedCount = lessons.filter(l => l.id === lessonId ? true : l.completed).length;
      if (completedCount === 1) checkAndAwardBadge("Quick Learner", "Completed your first financial lesson.");
      if (completedCount === 5) checkAndAwardBadge("Financial Analyst", "Successfully completed all educational models.");
    }
  }, [lessons, triggerAlert, playSound, checkAndAwardBadge]);

  const getPortfolioValue = useCallback(() => {
    let holdingsVal = 0;
    Object.keys(portfolio).forEach(ticker => {
      const stock = stocks.find(s => s.ticker === ticker);
      if (stock) {
        holdingsVal += stock.price * portfolio[ticker].quantity;
      }
    });
    return parseFloat(holdingsVal.toFixed(2));
  }, [portfolio, stocks]);

  const getNetWorth = useCallback(() => {
    return parseFloat((cash + getPortfolioValue()).toFixed(2));
  }, [cash, getPortfolioValue]);

  return (
    <MarketContext.Provider value={{
      cash,
      portfolio,
      stocks,
      priceHistory,
      activeTab,
      setActiveTab,
      xp,
      badges,
      lessons,
      transactionHistory,
      selectedStockTicker,
      setSelectedStockTicker,
      getLevelInfo,
      buyStock,
      sellStock,
      submitQuizAnswers,
      getPortfolioValue,
      getNetWorth,
      appAlert,
      audioNotifications,
      setAudioNotifications,
      triggerAlert,
      playSound,
      searchRealTimeStock,
      addStockToWatchlist,
      fetchStockHistoryFromAPI,
      isApiLoading,
      apiErrorMsg,
      syncStocksListWithAPI
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
