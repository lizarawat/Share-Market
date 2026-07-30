import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MarketContext = createContext();

// Seed data helper to generate realistic historical OHLC data
const generateHistoricalData = (startPrice, points = 30, volatility = 0.02) => {
  let data = [];
  let currentPrice = startPrice;
  const now = new Date();
  
  for (let i = points; i > 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000); // 15-minute intervals
    
    // Brownian motion simulation
    const changePercent = (Math.random() - 0.5) * 2 * volatility;
    const open = currentPrice;
    const close = currentPrice * (1 + changePercent);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      price: parseFloat(close.toFixed(2)) // Line chart value
    });
    
    currentPrice = close;
  }
  return data;
};

// Initial stocks configuration
const INITIAL_STOCKS = [
  { ticker: 'BTECH', name: 'ByteTech Inc.', price: 150.0, open: 148.5, high: 152.0, low: 147.0, prevClose: 148.5, sector: 'Technology', volatility: 0.025, desc: 'A cutting-edge AI and software services provider dominating cloud infrastructure.' },
  { ticker: 'SLRFTR', name: 'SolarFuture', price: 78.5, open: 79.0, high: 80.2, low: 77.1, prevClose: 79.0, sector: 'Green Energy', volatility: 0.02, desc: 'Leading manufacturer of high-efficiency solar cells and commercial grid batteries.' },
  { ticker: 'BIOLFE', name: 'BioLife Pharma', price: 235.2, open: 230.0, high: 238.5, low: 228.0, prevClose: 230.0, sector: 'Healthcare', volatility: 0.035, desc: 'Biotech firm focusing on advanced gene therapy and global vaccine distribution.' },
  { ticker: 'APEX', name: 'Apex Corp', price: 42.1, open: 42.0, high: 42.5, low: 41.8, prevClose: 42.0, sector: 'Real Estate', volatility: 0.008, desc: 'Commercial real estate trust managing high-value downtown office spaces.' },
  { ticker: 'ELMTR', name: 'ElectroMotors', price: 92.4, open: 91.0, high: 93.8, low: 90.2, prevClose: 91.0, sector: 'Automotive', volatility: 0.022, desc: 'Next-generation electric vehicle and autonomous driving software developer.' },
  { ticker: 'FOODS', name: 'DailyFoods', price: 61.3, open: 61.5, high: 61.9, low: 60.8, prevClose: 61.5, sector: 'FMCG', volatility: 0.007, desc: 'Global consumer packaged goods company distributing packaged meals and organic beverages.' },
  { ticker: 'FNTCH', name: 'FinTech Go', price: 112.8, open: 113.5, high: 114.2, low: 111.9, prevClose: 113.5, sector: 'Finance', volatility: 0.015, desc: 'Mobile banking and digital payment infrastructure platform supporting micro-lending.' }
];

// Initial News Feed Database
const NEWS_TEMPLATES = [
  { headline: "ByteTech announces breakthrough in AI Neural Net compiler", target: "BTECH", impact: 0.15, type: "good", body: "Tech analysts praise ByteTech's new hardware architecture. Shares expected to experience strong buying momentum." },
  { headline: "SolarFuture wins major government contract for national grid initiative", target: "SLRFTR", impact: 0.12, type: "good", body: "The federal renewable project guarantees steady cashflow for SolarFuture over the next decade." },
  { headline: "BioLife Pharma receives FDA approval for breakthrough diabetes drug", target: "BIOLFE", impact: 0.18, type: "good", body: "FDA clearance unlocks a $12B global market. BioLife's patent is protected for the next 15 years." },
  { headline: "Apex Corp reports 98% occupancy rate across commercial properties", target: "APEX", impact: 0.04, type: "good", body: "High corporate demand pushes leasing revenue 5% above analyst expectations." },
  { headline: "ElectroMotors recalls 50,000 vehicles over minor software glitch", target: "ELMTR", impact: -0.08, type: "bad", body: "A firmware patch is scheduled next week, but recall costs and PR headwind trigger institutional selling." },
  { headline: "Raw material supply disruptions drag down DailyFoods quarterly margin", target: "FOODS", impact: -0.04, type: "bad", body: "Agricultural inflation and transport logistics bottleneck lead to a minor earnings miss." },
  { headline: "Regulators investigate FinTech Go for licensing non-compliant partners", target: "FNTCH", impact: -0.10, type: "bad", body: "Compliance investigation creates market uncertainty. Analysts downgrade stock rating to neutral." }
];

// Initial Lessons Database
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
        content: "A share represents fractional ownership of a corporation. When you buy a share of ByteTech, you literally own a micro-percentage of that company. As the company grows in profitability and value, your share value increases.",
        concept: "Ownership",
        visualData: { label: "Company Value", segments: [{ name: "Your Share", value: 5, color: "#6366f1" }, { name: "Other Investors", value: 95, color: "#1f2937" }] }
      },
      {
        title: "The Stock Exchange",
        content: "Stocks are traded on public marketplaces called exchanges (e.g., NYSE, NASDAQ, NSE). Buyers and sellers place orders, and the exchange matches them. Prices change instantly based on supply and demand: more buyers drives prices UP; more sellers drives prices DOWN.",
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
        content: "A stop-loss order instructs your broker to automatically sell a stock if the price falls to a specific level. For example, if you buy a stock at $100 and set a stop-loss at $90, your maximum risk is capped at 10%.",
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
  // Load state from localStorage if it exists, otherwise use defaults
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`market_app_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const saveState = (key, value) => {
    try {
      localStorage.setItem(`market_app_${key}`, JSON.stringify(value));
    } catch (e) {}
  };

  // State Declarations
  const [cash, setCash] = useState(() => loadState('cash', 50000));
  const [portfolio, setPortfolio] = useState(() => loadState('portfolio', {}));
  const [stocks, setStocks] = useState(() => {
    const savedStocks = loadState('stocks', null);
    if (savedStocks) return savedStocks;
    return INITIAL_STOCKS;
  });
  
  const [priceHistory, setPriceHistory] = useState(() => {
    const savedHistory = loadState('priceHistory', null);
    if (savedHistory) return savedHistory;
    
    // Generate initial history for all stocks
    const initialHist = {};
    INITIAL_STOCKS.forEach(stock => {
      initialHist[stock.ticker] = generateHistoricalData(stock.price - 10, 30, stock.volatility);
    });
    return initialHist;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [xp, setXp] = useState(() => loadState('xp', 0));
  const [badges, setBadges] = useState(() => loadState('badges', []));
  const [lessons, setLessons] = useState(() => loadState('lessons', INITIAL_LESSONS));
  const [transactionHistory, setTransactionHistory] = useState(() => loadState('transactionHistory', []));
  
  // Active stock selected in the Simulator
  const [selectedStockTicker, setSelectedStockTicker] = useState('BTECH');
  
  // News system state
  const [newsFeed, setNewsFeed] = useState(() => loadState('newsFeed', [
    {
      id: 1,
      headline: "Welcome to the Paper Trading Floor!",
      target: "ALL",
      impact: 0,
      type: "neutral",
      body: "Start trading, learn from the modules, and watch how real-time news affects the mock market.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]));
  
  // Active news impact drift overrides
  const [newsDrifts, setNewsDrifts] = useState({});
  const [audioNotifications, setAudioNotifications] = useState(true);
  
  // Alert/Toast feedback systems
  const [appAlert, setAppAlert] = useState(null);

  // Sync state to localStorage on changes
  useEffect(() => { saveState('cash', cash); }, [cash]);
  useEffect(() => { saveState('portfolio', portfolio); }, [portfolio]);
  useEffect(() => { saveState('stocks', stocks); }, [stocks]);
  useEffect(() => { saveState('priceHistory', priceHistory); }, [priceHistory]);
  useEffect(() => { saveState('xp', xp); }, [xp]);
  useEffect(() => { saveState('badges', badges); }, [badges]);
  useEffect(() => { saveState('lessons', lessons); }, [lessons]);
  useEffect(() => { saveState('transactionHistory', transactionHistory); }, [transactionHistory]);
  useEffect(() => { saveState('newsFeed', newsFeed); }, [newsFeed]);

  // Audio Feedback using Web Audio API
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
        // High double-beep
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'error') {
        // Low buzzer
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'achievement') {
        // Melodic arpeggio
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.08); // E4
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.16); // G4
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.24); // C5
        gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.24);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      console.warn("AudioContext failed to trigger", e);
    }
  }, [audioNotifications]);

  // Trigger alert banner
  const triggerAlert = useCallback((message, type = 'info') => {
    setAppAlert({ message, type });
    setTimeout(() => {
      setAppAlert(null);
    }, 4500);
  }, []);

  // XP level calculation helper
  const getLevelInfo = useCallback(() => {
    // 0-100: Level 1 (Novice)
    // 101-300: Level 2 (Retail Investor)
    // 301-600: Level 3 (Swing Trader)
    // 601-1000: Level 4 (Portfolio Manager)
    // 1001+: Level 5 (Market Guru)
    let currentLvl = 1;
    let rankName = "Novice Trader";
    let nextXpLimit = 100;
    let prevXpLimit = 0;
    
    if (xp >= 1000) {
      currentLvl = 5;
      rankName = "Market Guru";
      nextXpLimit = xp; // Maxed
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

  // Award achievements
  const checkAndAwardBadge = useCallback((badgeName, desc) => {
    setBadges(prev => {
      if (prev.some(b => b.name === badgeName)) return prev;
      
      const newBadge = { name: badgeName, description: desc, earnedAt: new Date().toLocaleDateString() };
      playSound('achievement');
      triggerAlert(`Unlocked Badge: ${badgeName}!`, 'success');
      return [...prev, newBadge];
    });
  }, [playSound, triggerAlert]);

  // Main Buy Order logic
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

  // Main Sell Order logic
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
    
    if (profitLoss > 100) {
      checkAndAwardBadge("Profit Maker", "Booked a profit of over $100 on a single transaction.");
    }
    return true;
  }, [stocks, portfolio, playSound, triggerAlert, checkAndAwardBadge]);

  // Lesson quiz completion
  const submitQuizAnswers = useCallback((lessonId, score) => {
    let earnedXP = 0;
    setLessons(prev => prev.map(lesson => {
      if (lesson.id === lessonId) {
        if (!lesson.completed) {
          earnedXP = lesson.xpReward;
        }
        return {
          ...lesson,
          completed: true,
          quizScore: score
        };
      }
      return lesson;
    }));

    if (earnedXP > 0) {
      setXp(prev => prev + earnedXP);
      triggerAlert(`Completed Lesson! +${earnedXP} XP Earned.`, 'success');
      playSound('achievement');
      
      // Unlock achievement check
      const completedCount = lessons.filter(l => l.id === lessonId ? true : l.completed).length;
      if (completedCount === 1) {
        checkAndAwardBadge("Quick Learner", "Completed your first financial lesson.");
      }
      if (completedCount === 5) {
        checkAndAwardBadge("Financial Analyst", "Successfully completed all educational models.");
      }
    }
  }, [lessons, triggerAlert, playSound, checkAndAwardBadge]);

  // Periodically generate stock price fluctuations & market news
  useEffect(() => {
    const marketTick = setInterval(() => {
      // 1. Update prices of each stock
      setStocks(prevStocks => {
        const nextStocks = prevStocks.map(stock => {
          // Check news override impact
          const newsDrift = newsDrifts[stock.ticker] || 0;
          
          // Brownian motion drift calculation
          // Stocks will drift slightly upward on average (+0.05% default drift)
          const baseDrift = 0.0004; 
          const finalDrift = baseDrift + newsDrift;
          const randomWalk = (Math.random() - 0.48) * 2 * stock.volatility;
          const priceMultiplier = 1 + finalDrift + randomWalk;
          
          const nextPrice = Math.max(2.0, parseFloat((stock.price * priceMultiplier).toFixed(2)));
          
          // Calculate daily high/lows
          const high = parseFloat(Math.max(stock.high, nextPrice).toFixed(2));
          const low = parseFloat(Math.min(stock.low, nextPrice).toFixed(2));
          
          return {
            ...stock,
            price: nextPrice,
            high,
            low
          };
        });

        // 2. Append new prices to chart history
        setPriceHistory(prevHistory => {
          const nextHistory = { ...prevHistory };
          nextStocks.forEach(s => {
            const hist = [...(nextHistory[s.ticker] || [])];
            const lastCandle = hist[hist.length - 1];
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            // Build OHLC candle representation for the tick
            const open = lastCandle ? lastCandle.close : s.price;
            const close = s.price;
            const high = Math.max(open, close) * (1 + Math.random() * 0.002);
            const low = Math.min(open, close) * (1 - Math.random() * 0.002);
            
            hist.push({
              time: timeStr,
              open,
              high: parseFloat(high.toFixed(2)),
              low: parseFloat(low.toFixed(2)),
              close,
              price: close
            });
            
            // Keep history window at 40 candles for dashboard scaling
            if (hist.length > 40) {
              hist.shift();
            }
            nextHistory[s.ticker] = hist;
          });
          return nextHistory;
        });

        // Decay news overrides over time
        setNewsDrifts(prevDrifts => {
          const updated = { ...prevDrifts };
          Object.keys(updated).forEach(ticker => {
            if (Math.abs(updated[ticker]) < 0.002) {
              delete updated[ticker];
            } else {
              updated[ticker] *= 0.75; // Decay by 25% per tick
            }
          });
          return updated;
        });

        return nextStocks;
      });
    }, 4000);

    return () => clearInterval(marketTick);
  }, [newsDrifts]);

  // Periodic news events scheduler
  useEffect(() => {
    const triggerRandomNews = () => {
      // Choose random news headline
      const template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        headline: template.headline,
        target: template.target,
        impact: template.impact,
        type: template.type,
        body: template.body,
        timestamp: timeStr
      };

      setNewsFeed(prev => [newEvent, ...prev.slice(0, 15)]);
      
      // Inject directional stock price pressure
      setNewsDrifts(prev => ({
        ...prev,
        [template.target]: template.impact * 0.45 // Initial drift impact
      }));

      // Trigger notification banner
      const sentimentText = template.type === 'good' ? '🟢 POSITIVE' : '🔴 NEGATIVE';
      triggerAlert(`[NEWS] ${sentimentText} for ${template.target}: ${template.headline}`);
      
      if (audioNotifications) {
        playSound('achievement'); // soft chime
      }
    };

    // Trigger initial news after 10s, then random news every 35-50 seconds
    const firstNewsTimer = setTimeout(triggerRandomNews, 12000);
    
    const newsInterval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to fire
        triggerRandomNews();
      }
    }, 35000);

    return () => {
      clearTimeout(firstNewsTimer);
      clearInterval(newsInterval);
    };
  }, [audioNotifications, playSound, triggerAlert]);

  // Value calculation helpers
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
      newsFeed,
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
      playSound
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
