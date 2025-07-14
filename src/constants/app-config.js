// file: src/constants/app-config.js
// Application configuration constants extracted from multiple files

// Auto-refresh intervals (milliseconds)
export const REFRESH_INTERVALS = {
    SIMULATION_DATA: 30000,     // 30 seconds - members and activities
    LEADERBOARD: 120000,        // 2 minutes - leaderboard refresh
    PORTFOLIO: 60000,           // 1 minute - portfolio data
    STOCK_PRICES: 60000         // 1 minute - stock price updates
};

// Timeouts (milliseconds)
export const TIMEOUTS = {
    SEARCH_DEBOUNCE: 300,       // Search input debounce
    NEWS_SEARCH_DEBOUNCE: 300,  // News search debounce
    SEARCH_RESULTS_HIDE: 200,   // Delay before hiding search results
    TEMP_MESSAGE_AUTO_HIDE: 5000, // Auto-hide temporary messages
    API_RATE_LIMIT_WAIT: 1000,  // Rate limit protection buffer
    CACHE_TIMEOUT: 60000        // Default cache timeout (1 minute)
};

// Time calculation constants (milliseconds)
export const TIME_UNITS = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000
};

// API Rate limiting
export const API_LIMITS = {
    MAX_CALLS_PER_MINUTE: 60,   // Stock API calls per minute
    MIN_TIME_BETWEEN_CALLS: 100, // Minimum milliseconds between calls
    RATE_LIMIT_WINDOW: 60000    // Rate limit tracking window
};

// API Error handling
export const API_ERROR_CONFIG = {
    COOLDOWN_PERIOD: 5 * 60 * 1000,  // 5 minutes cooldown after failures
    MAX_RETRY_ATTEMPTS: 3,           // Maximum retry attempts for failed requests
    RETRY_DELAY: 1000,               // Base delay between retries (milliseconds)
    TIMEOUT_DURATION: 10000          // Request timeout (10 seconds)
};

// Cache configurations
export const CACHE_CONFIG = {
    STOCK_PRICES: 60000,        // 1 minute
    STOCK_PROFILES: 300000,     // 5 minutes
    STOCK_SEARCH: 300000,       // 5 minutes
    STOCK_NEWS: 600000,         // 10 minutes
    SIMULATION_DATA: 30000      // 30 seconds
};

// UI Timing
export const UI_TIMING = {
    ANIMATION_DURATION: 300,    // Standard animation duration
    LOADING_MIN_DISPLAY: 500,   // Minimum time to show loading states
    BUTTON_CLICK_DEBOUNCE: 250, // Prevent double-clicks
    TOOLTIP_DELAY: 500,         // Tooltip show delay
    NOTIFICATION_DURATION: 5000 // Standard notification display time
};

// Pagination and limits
export const DATA_LIMITS = {
    RECENT_TRADES_COUNT: 10,    // Recent trades to display
    RECENT_TRADES_SIMULATION: 5, // Recent trades in simulation view
    NEWS_ARTICLES_DEFAULT: 20,  // Default news articles to fetch
    SEARCH_RESULTS_MAX: 10,     // Max search results to display
    ACTIVITY_FEED_COUNT: 20,    // Activity feed items
    LEADERBOARD_MAX_DISPLAY: 50 // Max leaderboard entries to show
};

// Chart configurations
export const CHART_CONFIG = {
    DEFAULT_PERIOD: 7,          // Default chart period (days)
    DEFAULT_RESOLUTION: 'D',    // Default chart resolution
    ANIMATION_DURATION: 750,    // Chart animation duration
    POINT_RADIUS: 0,            // Default point radius
    POINT_HOVER_RADIUS: 4,      // Point radius on hover
    MAX_TICKS_LIMIT: 8          // Maximum chart ticks
};

// Form validation limits
export const VALIDATION_LIMITS = {
    TICKER_MAX_LENGTH: 6,       // Maximum ticker symbol length
    SIMULATION_NAME_MAX: 100,   // Maximum simulation name length
    DESCRIPTION_MAX: 500,       // Maximum description length
    MAX_MEMBERS_DEFAULT: 50,    // Default max members for simulation
    MIN_TRADE_QUANTITY: 1,      // Minimum trade quantity
    MIN_TRADE_PRICE: 0.01       // Minimum trade price
};

// Network configurations
export const NETWORK_CONFIG = {
    REQUEST_TIMEOUT: 10000,     // 10 seconds request timeout
    RETRY_ATTEMPTS: 3,          // Number of retry attempts
    RETRY_DELAY: 1000,          // Base retry delay
    CONNECTION_CHECK_INTERVAL: 30000 // Connection status check
};