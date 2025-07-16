// file: src/constants/trade-types.js
// Trade type constants extracted from multiple files

// Core trade types
export const TRADE_TYPES = {
    BUY: "buy",
    SELL: "sell"
};

// Trade type display configurations
export const TRADE_TYPE_CONFIG = {
    [TRADE_TYPES.BUY]: {
        text: "Buy",
        color: "text-green-400",
        bgClass: "bg-green-600",
        buttonClass: "bg-green-600 hover:bg-green-500",
        icon: "↗"
    },
    [TRADE_TYPES.SELL]: {
        text: "Sell", 
        color: "text-red-400",
        bgClass: "bg-red-600",
        buttonClass: "bg-red-600 hover:bg-red-500",
        icon: "↘"
    }
};

// Portfolio context types
export const PORTFOLIO_TYPES = {
    SOLO: "solo",
    SIMULATION: "simulation"
};

// Trading validation constants
export const TRADE_VALIDATION = {
    MIN_QUANTITY: 1,
    MIN_PRICE: 0.01,
    MAX_TICKER_LENGTH: 6,
    REQUIRED_FIELDS: ["ticker", "quantity", "price", "type"]
};

// Trading hours constants
export const TRADING_HOURS = {
    MARKET: "market",
    EXTENDED: "extended",
    ALWAYS: "always"
};

// Market hours (UTC)
export const MARKET_HOURS_UTC = {
    WEEKDAYS_ONLY: [1, 2, 3, 4, 5], // Monday-Friday
    START_HOUR: 14, // 9:30 AM ET
    END_HOUR: 21    // 4:00 PM ET
};