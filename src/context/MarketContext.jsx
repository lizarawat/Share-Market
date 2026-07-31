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
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\s*[aApP][mM]\s*$/, ''),
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
  { ticker: '^NSEI', name: 'Nifty 50 Index', price: 24320.55, open: 24250.00, high: 24410.80, low: 24190.20, prevClose: 24180.10, sector: 'Broad Market Index', volatility: 0.008, desc: 'The benchmark index of the National Stock Exchange of India (NSE), tracking the 50 largest blue-chip equities.', ath: 24500.00, atl: 18000.00 },
  { ticker: '^NSEBANK', name: 'Nifty Bank Index', price: 51200.10, open: 51300.20, high: 51450.80, low: 51050.20, prevClose: 51300.20, sector: 'Broad Market Index', volatility: 0.012, desc: 'The banking sector index tracking the 12 most liquid and large banking stocks listed on the NSE.', ath: 53500.00, atl: 35000.00 },
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries Ltd', price: 2450.0, open: 2445.0, high: 2465.0, low: 2435.0, prevClose: 2440.0, sector: 'Energy & Retail', volatility: 0.012, desc: 'India\'s largest private conglomerate with presence in refining, retail, and telecommunications (Jio).', ath: 3029.0, atl: 860.0 },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', price: 3420.0, open: 3410.0, high: 3445.0, low: 3395.0, prevClose: 3405.0, sector: 'Technology', volatility: 0.01, desc: 'A leading global IT services provider and anchor company of the Tata Group.', ath: 4254.0, atl: 1500.0 },
  { ticker: 'INFY.NS', name: 'Infosys Ltd', price: 1450.0, open: 1452.0, high: 1468.0, low: 1442.0, prevClose: 1455.0, sector: 'Technology', volatility: 0.015, desc: 'Pioneer of the Indian IT service model providing business consulting and technology outsourcing.', ath: 1953.0, atl: 650.0 },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', price: 1620.0, open: 1615.0, high: 1632.0, low: 1608.0, prevClose: 1612.0, sector: 'Finance', volatility: 0.011, desc: 'India\'s largest private sector bank by assets and market capitalization.', ath: 1757.0, atl: 700.0 },
  { ticker: 'SBIN.NS', name: 'State Bank of India', price: 585.0, open: 582.0, high: 591.0, low: 579.0, prevClose: 580.0, sector: 'Finance', volatility: 0.016, desc: 'The largest public sector banking and financial services institution in India.', ath: 912.0, atl: 150.0 },
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', price: 890.0, open: 885.0, high: 898.0, low: 881.0, prevClose: 884.0, sector: 'Telecom', volatility: 0.013, desc: 'A leading global telecommunications company operating across 18 countries in Asia and Africa.', ath: 1460.0, atl: 280.0 },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', price: 955.0, open: 952.0, high: 963.0, low: 947.0, prevClose: 950.0, sector: 'Finance', volatility: 0.012, desc: 'Leading private sector bank offering diverse financial services through multi-channels.', ath: 1170.0, atl: 300.0 },
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', price: 630.0, open: 628.0, high: 636.0, low: 624.0, prevClose: 625.0, sector: 'Automotive', volatility: 0.022, desc: 'Leading global automobile manufacturer offering cars, utility vehicles, trucks, and buses.', ath: 1065.0, atl: 65.0 },
  { ticker: 'ITC.NS', name: 'ITC Ltd', price: 440.0, open: 438.0, high: 443.0, low: 436.0, prevClose: 437.0, sector: 'FMCG', volatility: 0.011, desc: 'One of India\'s foremost private sector companies with business spanning FMCG, hotels, and paper.', ath: 499.0, atl: 130.0 },
  { ticker: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', price: 2520.0, open: 2515.0, high: 2538.0, low: 2502.0, prevClose: 2510.0, sector: 'FMCG', volatility: 0.009, desc: 'India\'s largest fast-moving consumer goods company with brands used by millions daily.', ath: 2859.0, atl: 1700.0 },
  { ticker: 'LT.NS', name: 'Larsen & Toubro Ltd', price: 2980.0, open: 2970.0, high: 3012.0, low: 2955.0, prevClose: 2962.0, sector: 'Infrastructure', volatility: 0.014, desc: 'Indian multinational engaged in EPC projects, manufacturing, defense, and services.', ath: 3900.0, atl: 660.0 },
  { ticker: 'AXISBANK.NS', name: 'Axis Bank Ltd', price: 980.0, open: 978.0, high: 989.0, low: 972.0, prevClose: 975.0, sector: 'Finance', volatility: 0.015, desc: 'Third-largest private sector bank in India, offering comprehensive financial services.', ath: 1339.0, atl: 280.0 },
  { ticker: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', price: 1780.0, open: 1775.0, high: 1798.0, low: 1765.0, prevClose: 1772.0, sector: 'Finance', volatility: 0.012, desc: 'Leading financial services group providing commercial banking, stock broking, and mutual funds.', ath: 2253.0, atl: 1000.0 },
  { ticker: 'M&M.NS', name: 'Mahindra & Mahindra Ltd', price: 1540.0, open: 1530.0, high: 1558.0, low: 1522.0, prevClose: 1528.0, sector: 'Automotive', volatility: 0.018, desc: 'One of the largest vehicle manufacturers by production in India and the largest tractor manufacturer.', ath: 3015.0, atl: 240.0 },
  { ticker: 'POWERGRID.NS', name: 'Power Grid Corp of India', price: 200.0, open: 199.0, high: 202.0, low: 197.0, prevClose: 198.0, sector: 'Energy', volatility: 0.013, desc: 'State-owned electric utility company transmitting about 50% of the total power generated in India.', ath: 366.0, atl: 70.0 },
  { ticker: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries', price: 1120.0, open: 1115.0, high: 1132.0, low: 1108.0, prevClose: 1112.0, sector: 'Healthcare', volatility: 0.012, desc: 'India\'s largest pharmaceutical company and a global leader in generic specialty medicines.', ath: 1800.0, atl: 310.0 },
  { ticker: 'NTPC.NS', name: 'NTPC Ltd', price: 235.0, open: 234.0, high: 238.0, low: 232.0, prevClose: 233.0, sector: 'Energy', volatility: 0.016, desc: 'India\'s largest power utility company, engaged in power generation and allied activities.', ath: 425.0, atl: 75.0 },
  { ticker: 'TATASTEEL.NS', name: 'Tata Steel Ltd', price: 115.0, open: 114.5, high: 116.8, low: 113.2, prevClose: 114.0, sector: 'Metals', volatility: 0.02, desc: 'One of the world\'s most geographically diversified steel producers, operating in 26 countries.', ath: 184.0, atl: 25.0 }
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
  const [cash, setCash] = useState(() => {
    const val = loadState('cash', 500000);
    return typeof val === 'number' ? val : parseFloat(val) || 500000;
  });
  const [portfolio, setPortfolio] = useState(() => loadState('portfolio', {}));
  const [stocks, setStocks] = useState(() => {
    const savedStocks = loadState('stocks', null);
    if (!savedStocks) return INITIAL_INDIAN_STOCKS;

    // Migration helper: merge missing INITIAL_INDIAN_STOCKS into savedStocks
    let merged = [...savedStocks];
    let updated = false;
    INITIAL_INDIAN_STOCKS.forEach(initial => {
      if (!merged.some(s => s.ticker === initial.ticker)) {
        merged.push(initial);
        updated = true;
      }
    });
    if (updated) {
      saveState('stocks', merged);
    }
    return merged;
  });
  
  // Auth state declarations
  const [users, setUsers] = useState(() => loadState('users', [
    { username: 'admin', email: 'admin@tradecraft.com', password: 'adminpass' }
  ]));
  const [currentUser, setCurrentUser] = useState(() => loadState('currentUser', null));
  
  const [priceHistory, setPriceHistory] = useState(() => {
    // Migration: clear cache once to fetch year-inclusive historical timestamps
    const migVer = localStorage.getItem('market_app_mig_v1');
    let savedHistory = {};
    if (migVer) {
      savedHistory = loadState('priceHistory', null) || {};
    } else {
      localStorage.removeItem('market_app_in_priceHistory');
      localStorage.setItem('market_app_mig_v1', 'true');
    }

    let updated = false;
    INITIAL_INDIAN_STOCKS.forEach(stock => {
      if (!savedHistory[stock.ticker]) {
        savedHistory[stock.ticker] = generateHistoricalData(stock.price - 40, 30, stock.volatility);
        updated = true;
      }
    });
    if (updated) {
      saveState('priceHistory', savedHistory);
    }
    return savedHistory;
  });

  const [activeTab, setActiveTab] = useState(() => loadState('activeTab', 'dashboard'));
  const [xp, setXp] = useState(() => loadState('xp', 0));
  const [badges, setBadges] = useState(() => loadState('badges', []));
  const [lessons, setLessons] = useState(() => loadState('lessons', INITIAL_LESSONS));
  const [transactionHistory, setTransactionHistory] = useState(() => loadState('transactionHistory', []));
  const [selectedStockTicker, setSelectedStockTicker] = useState('^NSEI');
  const [activeCompanyDetails, setActiveCompanyDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  
  // Real-time API state indicators
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState(null);

  // Nifty and Bank Nifty Indices states
  const [nifty, setNifty] = useState(() => loadState('nifty', { price: 24317.15, prevClose: 24250.2, change: 66.95, pct: 0.28 }));
  const [bankNifty, setBankNifty] = useState(() => loadState('bankNifty', { price: 51200.10, prevClose: 51300.20, change: -100.10, pct: -0.19 }));

  // Real-time News state
  const [newsFeed, setNewsFeed] = useState(() => loadState('newsFeed', []));

  // Refs to prevent stale closures in periodic background sync
  const stocksRef = React.useRef(stocks);
  const portfolioRef = React.useRef(portfolio);

  useEffect(() => { stocksRef.current = stocks; }, [stocks]);
  useEffect(() => { portfolioRef.current = portfolio; }, [portfolio]);

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
  useEffect(() => { saveState('nifty', nifty); }, [nifty]);
  useEffect(() => { saveState('users', users); }, [users]);
  useEffect(() => { saveState('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { saveState('bankNifty', bankNifty); }, [bankNifty]);
  useEffect(() => { saveState('newsFeed', newsFeed); }, [newsFeed]);
  useEffect(() => { saveState('activeTab', activeTab); }, [activeTab]);

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

    // Always pre-populate matching local stocks first so recommendations are instant
    const localResults = stocks
      .filter(s => 
        s.ticker.toLowerCase().includes(query.toLowerCase()) || 
        s.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(s => ({
        ticker: s.ticker,
        name: s.name,
        exchange: s.ticker.endsWith('.NS') ? 'NSE' : 'INDEX',
        sector: s.sector || 'Global Equity'
      }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const response = await fetch(`/api-yahoo/v1/finance/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      const data = await response.json();
      const quotes = data.quotes || [];
      
      const remoteResults = quotes
        .filter(q => q.quoteType === 'EQUITY' || q.typeDisp === 'Equity' || q.quoteType === 'INDEX' || q.typeDisp === 'Index')
        .map(q => ({
          ticker: q.symbol,
          name: q.longname || q.shortname || q.symbol,
          exchange: q.exchange,
          sector: q.sector || 'Global Equity'
        }));

      // Merge local and remote, avoiding duplicates
      const merged = [...localResults];
      remoteResults.forEach(r => {
        if (!merged.some(m => m.ticker === r.ticker)) {
          merged.push(r);
        }
      });
      return merged;
    } catch (e) {
      console.warn("Autocompletion search failed, returning local fallback matches", e);
      return localResults;
    }
  };

  // Fetch chart history for active view (wrapped in useCallback to prevent infinite render loops)
  const fetchStockHistoryFromAPI = useCallback(async (ticker, range = '1d', interval = '15m') => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

      const response = await fetch(`/api-yahoo/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`, { signal: controller.signal });
      clearTimeout(timeoutId);

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
          let timeStr = "";
          if (range === '1d') {
            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\s*[aApP][mM]\s*$/, '');
          } else if (interval === '1mo') {
            timeStr = date.toLocaleDateString([], { year: 'numeric', month: 'short' });
          } else {
            timeStr = date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
          }

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
  }, []);

  // Real-time News fetcher from Yahoo Finance Search
  const fetchMarketNewsFromAPI = useCallback(async (query = 'Indian Stock Market') => {
    try {
      const response = await fetch(`/api-yahoo/v1/finance/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      const news = data.news || [];
      const formatted = news.map(item => {
        const date = new Date(item.providerPublishTime * 1000);
        const titleLower = item.title.toLowerCase();
        let type = 'neutral';
        if (titleLower.includes('gain') || titleLower.includes('rise') || titleLower.includes('surge') || titleLower.includes('profit') || titleLower.includes('win') || titleLower.includes('fda') || titleLower.includes('buy')) {
          type = 'good';
        } else if (titleLower.includes('fall') || titleLower.includes('drop') || titleLower.includes('loss') || titleLower.includes('investigate') || titleLower.includes('recall') || titleLower.includes('sell') || titleLower.includes('slump') || titleLower.includes('down') || titleLower.includes('decline')) {
          type = 'bad';
        }
        return {
          id: item.uuid,
          headline: item.title,
          body: item.publisher,
          timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          target: item.relatedTickers?.[0] || 'ALL',
          type: type,
          link: item.link
        };
      });
      setNewsFeed(formatted);
    } catch (e) {
      console.warn("Failed to fetch news feed from API", e);
    }
  }, []);

  // Sync / refresh real-time prices for list & portfolio using Refs (prevents stale closure wipes)
  const syncStocksListWithAPI = useCallback(async () => {
    setIsApiLoading(true);
    setApiErrorMsg(null);

    const watchlistTickers = stocksRef.current.map(s => s.ticker);
    const portfolioTickers = Object.keys(portfolioRef.current);
    const uniqueTickers = [...new Set([...watchlistTickers, ...portfolioTickers])];

    if (uniqueTickers.length === 0) {
      setIsApiLoading(false);
      return;
    }

    try {
      const results = [];
      for (let ticker of uniqueTickers) {
        const res = await fetchStockHistoryFromAPI(ticker, '1d');
        results.push(res);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setStocks(prevStocks => {
        let updatedStocks = [...prevStocks];
        results.forEach((res, index) => {
          const ticker = uniqueTickers[index];
          if (res) {
            const existingStockIdx = updatedStocks.findIndex(s => s.ticker === ticker);
            
            // --- VARIETY AND ANOMALY-DAMPING SYSTEM ---
            let price = res.price;
            let prevClose = res.prevClose;

            // 1. Damp major Yahoo API splitting anomalies (e.g. INDOMIM.NS splits)
            const ratio = price / prevClose;
            if (ratio > 1.12 || ratio < 0.88) {
              const seedVal = Math.sin(ticker.charCodeAt(0));
              const simDiff = 0.015 + Math.abs(seedVal) * 0.025; // 1.5% to 4%
              if (price > prevClose) {
                prevClose = price / (1 + simDiff);
              } else {
                prevClose = price / (1 - simDiff);
              }
            }

            // 2. Inject realistic 1% - 4.5% moves when markets are closed (zero/stale change)
            const diffPct = Math.abs((price - prevClose) / prevClose);
            if (diffPct < 0.002) {
              const seedVal = Math.sin(ticker.charCodeAt(0) + new Date().getDate());
              const simPct = 0.01 + Math.abs(seedVal) * 0.035; // 1% to 4.5%
              const isUp = (ticker.charCodeAt(1) % 2 === 0);
              if (isUp) {
                price = prevClose * (1 + simPct);
              } else {
                price = prevClose * (1 - simPct);
              }
            }
            // ------------------------------------------

            const updatedInfo = {
              ticker,
              name: res.name,
              price: parseFloat(price.toFixed(2)),
              open: parseFloat(res.open.toFixed(2)),
              high: parseFloat(Math.max(price, res.high).toFixed(2)),
              low: parseFloat(Math.min(price, res.low).toFixed(2)),
              prevClose: parseFloat(prevClose.toFixed(2)),
              sector: updatedStocks[existingStockIdx]?.sector || 'Finance & Equity',
              volatility: updatedStocks[existingStockIdx]?.volatility || 0.015,
              desc: updatedStocks[existingStockIdx]?.desc || `Real-time public stock listed on ${res.exchange}`,
              ath: updatedStocks[existingStockIdx]?.ath || parseFloat((Math.max(price, res.high) * 1.35).toFixed(2)),
              atl: updatedStocks[existingStockIdx]?.atl || parseFloat((Math.min(price, res.low) * 0.65).toFixed(2))
            };

            if (existingStockIdx > -1) {
              updatedStocks[existingStockIdx] = updatedInfo;
            } else {
              updatedStocks.push(updatedInfo);
            }
          }
        });
        return updatedStocks;
      });

      setPriceHistory(prevHistory => {
        let updatedHistory = { ...prevHistory };
        results.forEach((res, index) => {
          const ticker = uniqueTickers[index];
          if (res && res.history && res.history.length > 0) {
            updatedHistory[ticker] = res.history.slice(-40);
          }
        });
        return updatedHistory;
      });

      // Fetch index values in background
      try {
        const niftyRes = await fetchStockHistoryFromAPI('^NSEI', '1d');
        if (niftyRes) {
          const changeVal = niftyRes.price - niftyRes.prevClose;
          const pctVal = (changeVal / niftyRes.prevClose) * 100;
          setNifty({
            price: niftyRes.price,
            prevClose: niftyRes.prevClose,
            change: parseFloat(changeVal.toFixed(2)),
            pct: parseFloat(pctVal.toFixed(2))
          });
        }

        const bankNiftyRes = await fetchStockHistoryFromAPI('^NSEBANK', '1d');
        if (bankNiftyRes) {
          const changeVal = bankNiftyRes.price - bankNiftyRes.prevClose;
          const pctVal = (changeVal / bankNiftyRes.prevClose) * 100;
          setBankNifty({
            price: bankNiftyRes.price,
            prevClose: bankNiftyRes.prevClose,
            change: parseFloat(changeVal.toFixed(2)),
            pct: parseFloat(pctVal.toFixed(2))
          });
        }
      } catch (err) {
        console.warn("Failed to fetch Nifty indices", err);
      }

      // Also trigger a background news sync
      fetchMarketNewsFromAPI('Indian Stock Market');
    } catch (e) {
      setApiErrorMsg("Real-time API is currently rate-limited. Falling back to local market snapshots.");
      console.warn("Sync failed, rate limit or network issue.", e);
    } finally {
      setIsApiLoading(false);
    }
  }, [fetchStockHistoryFromAPI, fetchMarketNewsFromAPI]);

  // Sync on startup, and set up automatic periodic sync every 15 seconds
  useEffect(() => {
    syncStocksListWithAPI();
    fetchMarketNewsFromAPI('Indian Stock Market');

    const interval = setInterval(() => {
      syncStocksListWithAPI();
    }, 15000);

    return () => clearInterval(interval);
  }, [syncStocksListWithAPI, fetchMarketNewsFromAPI]);

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
      // --- ANOMALY & VARIETY DAMPING ---
      let price = data.price;
      let prevClose = data.prevClose;

      const ratio = price / prevClose;
      if (ratio > 1.12 || ratio < 0.88) {
        const seedVal = Math.sin(ticker.charCodeAt(0));
        const simDiff = 0.015 + Math.abs(seedVal) * 0.025; // 1.5% to 4%
        if (price > prevClose) {
          prevClose = price / (1 + simDiff);
        } else {
          prevClose = price / (1 - simDiff);
        }
      }

      const diffPct = Math.abs((price - prevClose) / prevClose);
      if (diffPct < 0.002) {
        const seedVal = Math.sin(ticker.charCodeAt(0) + new Date().getDate());
        const simPct = 0.01 + Math.abs(seedVal) * 0.035; // 1% to 4.5%
        const isUp = (ticker.charCodeAt(1) % 2 === 0);
        if (isUp) {
          price = prevClose * (1 + simPct);
        } else {
          price = prevClose * (1 - simPct);
        }
      }
      // ---------------------------------

      const newStock = {
        ticker,
        name: data.name,
        price: parseFloat(price.toFixed(2)),
        open: data.open,
        high: parseFloat(Math.max(price, data.high).toFixed(2)),
        low: parseFloat(Math.min(price, data.low).toFixed(2)),
        prevClose: parseFloat(prevClose.toFixed(2)),
        sector: 'Searched Stock',
        volatility: 0.015,
        desc: `Public equity listed on ${data.exchange}. Added from real-time quote search.`,
        ath: parseFloat((Math.max(price, data.high) * 1.35).toFixed(2)),
        atl: parseFloat((Math.min(price, data.low) * 0.65).toFixed(2))
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
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const isFirstTime = !lesson.completed;
    const earnedXP = isFirstTime ? lesson.xpReward : 0;

    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        return { ...l, completed: true, quizScore: score };
      }
      return l;
    }));

    if (isFirstTime) {
      setXp(prev => prev + earnedXP);
      triggerAlert(`Completed Lesson! +${earnedXP} XP Earned.`, 'success');
      playSound('achievement');
      
      const completedCount = lessons.filter(l => l.completed).length + 1;
      if (completedCount === 1) checkAndAwardBadge("Quick Learner", "Completed your first financial lesson.");
      if (completedCount === 5) checkAndAwardBadge("Financial Analyst", "Successfully completed all educational models.");
    }
  }, [lessons, triggerAlert, playSound, checkAndAwardBadge]);

  // Auth actions helper callbacks
  const signUpUser = useCallback((username, email, password) => {
    const emailLower = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === emailLower)) {
      triggerAlert("An account with this email already exists.", "error");
      return false;
    }
    const newUser = { username: username.trim(), email: emailLower, password: password.trim() };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    triggerAlert(`Welcome, ${newUser.username}! Account created successfully.`, "success");
    return true;
  }, [users, triggerAlert]);

  const signInUser = useCallback((email, password) => {
    const emailLower = email.toLowerCase().trim();
    const foundUser = users.find(u => u.email.toLowerCase() === emailLower && u.password === password.trim());
    if (foundUser) {
      setCurrentUser(foundUser);
      triggerAlert(`Welcome back, ${foundUser.username}! Logged in successfully.`, "success");
      return true;
    } else {
      triggerAlert("Invalid email or password. Please try again.", "error");
      return false;
    }
  }, [users, triggerAlert]);

  const signOutUser = useCallback(() => {
    setCurrentUser(null);
    triggerAlert("Logged out successfully.", "success");
  }, [triggerAlert]);

  const continueAsGuest = useCallback(() => {
    const guestUser = { username: 'Guest Trader', email: 'guest@tradecraft.com', isGuest: true };
    setCurrentUser(guestUser);
    triggerAlert("Logged in as Guest Trader.", "success");
    return true;
  }, [triggerAlert]);

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

  const getMockCompanyDetails = useCallback((ticker) => {
    const stock = stocks.find(s => s.ticker === ticker) || { name: ticker, sector: 'Equities', desc: 'Public listed equity on NSE.' };
    
    let officers = [
      { name: "Rajesh Kumar", title: "Chief Executive Officer" },
      { name: "Amit Sharma", title: "Chief Financial Officer" },
      { name: "Priya Patel", title: "Compliance Officer & CS" }
    ];

    if (ticker === 'RELIANCE.NS') {
      officers = [
        { name: "Mukesh Ambani", title: "Chairman & Managing Director" },
        { name: "Alok Agarwal", title: "Chief Financial Officer" },
        { name: "Nita Ambani", title: "Non-Executive Director" }
      ];
    } else if (ticker === 'TCS.NS') {
      officers = [
        { name: "K. Krithivasan", title: "Chief Executive Officer & MD" },
        { name: "Samir Seksaria", title: "Chief Financial Officer" },
        { name: "N. Chandrasekaran", title: "Chairman" }
      ];
    } else if (ticker === 'INFY.NS') {
      officers = [
        { name: "Salil Parekh", title: "Chief Executive Officer & MD" },
        { name: "Jayesh Sanghrajka", title: "Chief Financial Officer" },
        { name: "Nandan Nilekani", title: "Chairman" }
      ];
    } else if (ticker === 'HDFCBANK.NS') {
      officers = [
        { name: "Sashidhar Jagdishan", title: "Managing Director & CEO" },
        { name: "Srinivasan Vaidyanathan", title: "Chief Financial Officer" },
        { name: "Atanu Chakraborty", title: "Chairman" }
      ];
    } else if (ticker === 'SBIN.NS') {
      officers = [
        { name: "Dinesh Kumar Khara", title: "Chairman" },
        { name: "Kama Shastry", title: "Managing Director" },
        { name: "Saloni Narayan", title: "Deputy Managing Director" }
      ];
    }

    const news = [
      {
        title: `${stock.name} announces quarterly expansion plans and technological upgrades`,
        publisher: "Bloomberg Quint",
        providerPublishTime: Date.now() - 3600 * 1000
      },
      {
        title: `Board of ${ticker} approves special interim dividend for shareholders`,
        publisher: "MoneyControl",
        providerPublishTime: Date.now() - 7200 * 1000
      },
      {
        title: `Market analysts upgrade ratings for ${ticker} following robust volume growth`,
        publisher: "Economic Times",
        providerPublishTime: Date.now() - 14400 * 1000
      }
    ];

    let shares = "2.40B";
    if (ticker === 'RELIANCE.NS') shares = "6.76B";
    else if (ticker === 'TCS.NS') shares = "3.62B";
    else if (ticker === 'INFY.NS') shares = "4.15B";
    else if (ticker === 'HDFCBANK.NS') shares = "7.60B";

    return {
      ticker,
      news,
      bio: stock.desc || "No company biography is currently registered.",
      officers,
      shares,
      sector: stock.sector || "General Equities",
      industry: "Conglomerate Operations",
      website: `https://www.google.com/search?q=${encodeURIComponent(stock.name)}`
    };
  }, [stocks]);

  const fetchCompanyDetails = useCallback(async (ticker) => {
    setIsDetailsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      // 1. Fetch news via search API
      const searchRes = await fetch(`/api-yahoo/v1/finance/search?q=${ticker}`, { signal: controller.signal });
      const searchData = await searchRes.json();
      const news = searchData.news || [];

      // 2. Fetch profile via summary API
      const summaryRes = await fetch(`/api-yahoo/v10/finance/quoteSummary/${ticker}?modules=assetProfile,defaultKeyStatistics`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const summaryData = await summaryRes.json();
      const result = summaryData.quoteSummary?.result?.[0] || {};
      
      const assetProfile = result.assetProfile || {};
      const keyStats = result.defaultKeyStatistics || {};

      const mockFallback = getMockCompanyDetails(ticker);

      setActiveCompanyDetails({
        ticker,
        news: news.length > 0 ? news.map(n => ({
          title: n.title,
          publisher: n.publisher || "Finance Feed",
          providerPublishTime: n.providerPublishTime ? n.providerPublishTime * 1000 : Date.now()
        })) : mockFallback.news,
        bio: assetProfile.longBusinessSummary || mockFallback.bio,
        officers: (assetProfile.companyOfficers && assetProfile.companyOfficers.length > 0) 
          ? assetProfile.companyOfficers.map(o => ({ name: o.name, title: o.title })) 
          : mockFallback.officers,
        shares: keyStats.sharesOutstanding?.fmt || keyStats.sharesOutstanding?.longFmt || mockFallback.shares,
        sector: assetProfile.sector || mockFallback.sector,
        industry: assetProfile.industry || mockFallback.industry,
        website: assetProfile.website || mockFallback.website
      });
    } catch (error) {
      console.warn("Failed to fetch company details from Yahoo Finance. Falling back to mock data:", error);
      setActiveCompanyDetails(getMockCompanyDetails(ticker));
    } finally {
      setIsDetailsLoading(false);
    }
  }, [getMockCompanyDetails]);

  useEffect(() => {
    if (selectedStockTicker) {
      fetchCompanyDetails(selectedStockTicker);
    }
  }, [selectedStockTicker, fetchCompanyDetails]);

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
      activeCompanyDetails,
      isDetailsLoading,
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
      syncStocksListWithAPI,
      nifty,
      bankNifty,
      newsFeed,
      fetchMarketNewsFromAPI,
      users,
      currentUser,
      signUpUser,
      signInUser,
      signOutUser,
      continueAsGuest
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
