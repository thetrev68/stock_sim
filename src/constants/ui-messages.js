// file: src/constants/ui-messages.js
// UI messages and text constants extracted from multiple files

// Loading messages
export const LOADING_MESSAGES = {
    SIMULATION: "Loading simulation...",
    PORTFOLIO: "Loading portfolio...",
    PORTFOLIOS: "Loading portfolios...",
    TRADES: "Loading trades...",
    MEMBERS: "Loading members...",
    ACTIVITIES: "Loading activities...",
    ARCHIVE: "Loading archive...",
    NEWS: "Loading news...",
    CHART: "Loading chart...",
    PROFILE: "Loading profile...",
    STOCK_DATA: "Researching stock...",
    LEADERBOARD: "Loading leaderboard..."
};

// Error messages
export const ERROR_MESSAGES = {
    // Auth errors
    AUTH_USER_NOT_FOUND: "No account found with this email address.",
    AUTH_WRONG_PASSWORD: "Incorrect password.",
    AUTH_EMAIL_IN_USE: "An account with this email already exists.",
    AUTH_WEAK_PASSWORD: "Password should be at least 6 characters.",
    AUTH_INVALID_EMAIL: "Please enter a valid email address.",
    AUTH_POPUP_CLOSED: "Sign-in popup was closed.",
    AUTH_NETWORK_ERROR: "Network error. Please check your connection.",
    AUTH_GENERAL: "An authentication error occurred.",
    AUTH_LOGIN_REQUIRED: "You must be logged in to make trades.",
    AUTH_SIGN_IN_REQUIRED: "Please sign in to start trading",

    // Trading errors
    TRADE_INSUFFICIENT_CASH: "Insufficient cash for this trade.",
    TRADE_INSUFFICIENT_SHARES: "Insufficient shares to sell.",
    TRADE_INVALID_DETAILS: "Please enter a valid ticker and quantity, and ensure a price is available.",
    TRADE_PORTFOLIO_SELECT: "Please select a portfolio to trade with.",
    TRADE_VALIDATION_ERROR: "Error validating trade. Please try again.",
    TRADE_EXECUTION_ERROR: "Error executing trade. Please try again.",

    // Simulation errors
    SIMULATION_NOT_FOUND: "Simulation not found",
    SIMULATION_ENDED: "Simulation has ended",
    SIMULATION_NOT_STARTED: "Simulation has not started yet",
    SIMULATION_LOAD_ERROR: "There was a problem loading the simulation data.",
    SIMULATION_SETTINGS_LOAD: "Failed to load settings",
    SIMULATION_NAME_REQUIRED: "Simulation name cannot be empty",
    SIMULATION_PERMISSION_DENIED: "Only simulation creator can end simulation",
    SIMULATION_ALREADY_ENDED: "Simulation is already ended",

    // Stock/Research errors
    STOCK_NOT_FOUND: "Stock data not found for ticker",
    STOCK_RESEARCH_ERROR: "Failed to fetch stock data. Please try again.",
    STOCK_TICKER_REQUIRED: "Please enter a stock ticker symbol",
    STOCK_PRICE_ERROR: "Error fetching price. Try again.",

    // General errors
    NETWORK_ERROR: "Network error. Please check your connection.",
    LOADING_ERROR: "Error loading data",
    EXPORT_FAILED: "Failed to export",
    ARCHIVE_LOAD_ERROR: "There was a problem loading the archive data.",
    MEMBER_REMOVE_ERROR: "Failed to remove member",
    DATA_REFRESH_WARNING: "Warning: Some data may not have refreshed properly"
};

// Success messages
export const SUCCESS_MESSAGES = {
    TRADE_SUCCESS: "Trade successful!",
    SETTINGS_UPDATED: "Settings updated successfully",
    MEMBER_REMOVED: "has been removed from the simulation.",
    EXPORT_SUCCESS: "exported successfully!",
    ARCHIVE_SUCCESS: "Simulation archived successfully!",
    RESULTS_EXPORTED: "Results exported successfully!",
    FIRESTORE_TEST_SUCCESS: "Firestore update test succeeded"
};

// Info messages
export const INFO_MESSAGES = {
    PROCESSING_TRADE: "Processing trade...",
    SAVING_SETTINGS: "Saving...",
    REMOVING_MEMBER: "Removing...",
    GENERATING_EXPORT: "Generating Export...",
    ARCHIVING: "Archiving..."
};

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
    NO_TRADES: "No recent trades.",
    NO_SIMULATIONS: "No Simulations Yet",
    NO_SIMULATIONS_DESC: "Create your first simulation or join one to get started",
    NO_HOLDINGS: "No holdings yet",
    NO_HOLDINGS_DESC: "Start trading to build your portfolio",
    NO_ACTIVITIES: "No recent activity",
    NO_NEWS: "No news articles found",
    NO_MEMBERS: "No members found"
};

// Confirmation messages
export const CONFIRMATION_MESSAGES = {
    END_SIMULATION: "Are you sure you want to end this simulation early? This action cannot be undone and will immediately stop all trading.",
    REMOVE_MEMBER: "Are you sure you want to remove this member from the simulation?",
    ARCHIVE_SIMULATION: "Archive this simulation? This will move it to your archives and make it read-only."
};

// Button text
export const BUTTON_TEXT = {
    RETRY: "Retry",
    CONTINUE: "Continue",
    CANCEL: "Cancel",
    SAVE: "Save",
    LOADING: "Loading...",
    SIGNING_IN: "Signing in...",
    SIGN_IN: "Sign In",
    SIGN_UP: "Sign Up",
    BUY: "Buy",
    SELL: "Sell",
    TRADE_NOW: "Trade Now",
    PRACTICE_TRADE: "Practice Trade",
    VIEW_PORTFOLIO: "View Portfolio",
    EXPORT_RESULTS: "Export Results",
    ARCHIVE_SIMULATION: "Archive Simulation"
};

// Page titles and headings
export const PAGE_TITLES = {
    DASHBOARD: "Dashboard",
    PORTFOLIO: "Portfolio",
    TRADE: "Make a Trade",
    RESEARCH: "Research",
    SIMULATION: "Simulation",
    ARCHIVE: "Archive"
};

// Status text
export const STATUS_TEXT = {
    PORTFOLIO_VALUE: "Portfolio Value",
    ACTIVE_SIMULATIONS: "Active Simulations",
    COMPETITIVE_TRADING: "Competitive trading",
    SOLO_PRACTICE: "Solo Practice Mode",
    PERSONAL_PORTFOLIO: "Trade with your personal portfolio",
    DAYS_REMAINING: "days remaining",
    DAYS_AGO: "days ago",
    ENDING_SOON: "Ending soon",
    STARTS_IN: "Starts in",
    ENDED: "Ended"
};