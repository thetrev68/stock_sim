// file: src/templates/simulation/ui-messages.js
// Simulation-specific UI messages and text constants
// Focused module: Only simulation view messages

/**
 * Loading messages specific to simulation view
 */
export const SIMULATION_LOADING_MESSAGES = {
    SIMULATION: "Loading simulation...",
    MEMBERS: "Loading members...",
    ACTIVITIES: "Loading activities...",
    PORTFOLIO: "Loading portfolio...",
    SETTINGS: "Loading settings...",
    LEADERBOARD: "Loading leaderboard..."
};

/**
 * Button text used throughout simulation view
 */
export const SIMULATION_BUTTON_TEXT = {
    TRADE_NOW: "Trade Now",
    PRACTICE_TRADE: "Practice Trade",
    VIEW_PORTFOLIO: "View Portfolio",
    MANAGE_MEMBERS: "Manage Members",
    SIMULATION_SETTINGS: "Settings",
    RETRY: "Retry",
    RETURN_TO_DASHBOARD: "Return to Dashboard",
    REFRESH: "Refresh",
    LOADING: "Loading...",
    SAVING: "Saving...",
    REMOVE: "Remove",
    COPY_CODE: "Copy Code",
    INVITE_FRIENDS: "Invite Friends"
};

/**
 * Status text and labels for simulation view
 */
export const SIMULATION_STATUS_TEXT = {
    PORTFOLIO_VALUE: "Portfolio Value",
    YOUR_RANK: "Your Rank",
    SIMULATION_RULES: "Simulation Rules",
    RECENT_ACTIVITY: "Recent Activity",
    SIMULATION_MEMBERS: "Simulation Members",
    STARTING_BALANCE: "Starting Balance:",
    SHORT_SELLING: "Short Selling:",
    TRADING_HOURS: "Trading Hours:",
    COMMISSION: "Commission:",
    START_DATE: "Start Date:",
    END_DATE: "End Date:",
    DAYS_REMAINING: "Days Remaining:",
    PARTICIPANTS: "participants",
    TIMELINE: "Timeline",
    ACTIVE: "Active",
    PENDING: "Pending",
    ENDED: "Ended",
    CREATOR: "Creator",
    MEMBER: "Member",
    YOU: "You",
    ALLOWED: "Allowed",
    NOT_ALLOWED: "Not Allowed",
    MARKET_HOURS: "Market Hours",
    TWENTY_FOUR_SEVEN: "24/7"
};

/**
 * Error messages specific to simulation view
 */
export const SIMULATION_ERROR_MESSAGES = {
    SIMULATION_NOT_FOUND: "Simulation Not Found",
    SIMULATION_NOT_FOUND_DESC: "The simulation you're looking for doesn't exist or you don't have access to it.",
    ERROR_LOADING_SIMULATION: "Error Loading Simulation",
    ERROR_LOADING_SIMULATION_DESC: "There was a problem loading the simulation data.",
    ERROR_LOADING_MEMBERS: "Error Loading Members",
    ERROR_LOADING_MEMBERS_DESC: "Unable to load member information",
    ERROR_LOADING_ACTIVITIES: "Error Loading Activities",
    ERROR_LOADING_ACTIVITIES_DESC: "Unable to load recent activity",
    ERROR_LOADING_PORTFOLIO: "Error Loading Portfolio",
    ERROR_LOADING_PORTFOLIO_DESC: "Unable to load portfolio data"
};

/**
 * Success messages for simulation actions
 */
export const SIMULATION_SUCCESS_MESSAGES = {
    SETTINGS_UPDATED: "Settings updated successfully",
    MEMBER_REMOVED: "has been removed from the simulation.",
    TRADING_RULES_UPDATED: "Trading rules updated successfully",
    SIMULATION_ENDED: "Simulation ended successfully",
    FINAL_RESULTS_AVAILABLE: "Final results are now available."
};

/**
 * Info messages for simulation actions
 */
export const SIMULATION_INFO_MESSAGES = {
    SAVING_SETTINGS: "Saving...",
    REMOVING_MEMBER: "Removing...",
    ENDING_SIMULATION: "Ending simulation...",
    PROCESSING: "Processing..."
};

/**
 * Empty state messages for simulation sections
 */
export const SIMULATION_EMPTY_MESSAGES = {
    NO_RECENT_ACTIVITY: "No recent activity",
    NO_MEMBERS_YET: "No members yet",
    NO_MEMBERS_DESC: "Invite participants to get started",
    NO_HOLDINGS_YET: "No holdings yet",
    NO_TRADES_YET: "No recent trades.",
    ACTIVITY_FEED_LOADING: "Activity feed loading..."
};

/**
 * Confirmation messages for simulation actions
 */
export const SIMULATION_CONFIRMATIONS = {
    END_SIMULATION: "Are you sure you want to end this simulation early? This action cannot be undone and will immediately stop all trading.",
    REMOVE_MEMBER: "Are you sure you want to remove this member from the simulation?",
    LEAVE_SIMULATION: "Are you sure you want to leave this simulation?"
};

/**
 * Placeholder text for simulation forms
 */
export const SIMULATION_PLACEHOLDERS = {
    SIMULATION_NAME: "Enter simulation name...",
    SIMULATION_DESCRIPTION: "Optional description...",
    SEARCH_MEMBERS: "Search members...",
    END_REASON: "Optional reason for ending early..."
};

/**
 * Helper function to get trade button text based on simulation status
 * @param {string} status - Simulation status ('pending', 'active', 'ended')
 * @returns {string} Button text
 */
export const getTradeButtonText = (status) => {
    switch (status) {
        case "pending":
            return SIMULATION_BUTTON_TEXT.PRACTICE_TRADE;
        case "active":
            return SIMULATION_BUTTON_TEXT.TRADE_NOW;
        case "ended":
        default:
            return SIMULATION_BUTTON_TEXT.VIEW_PORTFOLIO;
    }
};

/**
 * Helper function to get status display text
 * @param {string} status - Simulation status
 * @returns {string} Display text
 */
export const getStatusDisplayText = (status) => {
    switch (status) {
        case "active":
            return SIMULATION_STATUS_TEXT.ACTIVE;
        case "pending":
            return SIMULATION_STATUS_TEXT.PENDING;
        case "ended":
            return SIMULATION_STATUS_TEXT.ENDED;
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};