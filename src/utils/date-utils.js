/**
 * Date Utilities
 * 
 * Pure utility functions for date formatting, duration calculations,
 * and time-related operations extracted from the codebase.
 */

/** TFC Move (main.js)
 * Convert Firebase Timestamp to JavaScript Date
 * Handles both Firebase Timestamp objects and regular Date objects
 * @param {*} timestamp - Firebase Timestamp or Date object
 * @returns {Date} JavaScript Date object
 */
export const convertFirebaseDate = (timestamp) => {
    return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};

/**
 * Format date range for display (used in simulation duration)
 * @param {*} startDate - Start date (Firebase Timestamp or Date)
 * @param {*} endDate - End date (Firebase Timestamp or Date)
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate) => {
    const start = convertFirebaseDate(startDate);
    const end = convertFirebaseDate(endDate);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

/**
 * Calculate days remaining until end date
 * @param {*} endDate - End date (Firebase Timestamp or Date)
 * @returns {number} Days remaining (0 if past end date)
 */
export const calculateDaysRemaining = (endDate) => {
    const end = convertFirebaseDate(endDate);
    const now = new Date();
    const diffTime = end - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * Calculate days until start date
 * @param {*} startDate - Start date (Firebase Timestamp or Date)
 * @returns {number} Days until start (negative if past start date)
 */
export const calculateDaysUntilStart = (startDate) => {
    const start = convertFirebaseDate(startDate);
    const now = new Date();
    return Math.ceil((start - now) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate days elapsed since start date
 * @param {*} startDate - Start date (Firebase Timestamp or Date)
 * @returns {number} Days elapsed (0 if before start date)
 */
export const calculateDaysElapsed = (startDate) => {
    const start = convertFirebaseDate(startDate);
    const now = new Date();
    return Math.max(0, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
};

/**
 * Calculate total duration between two dates
 * @param {*} startDate - Start date (Firebase Timestamp or Date)
 * @param {*} endDate - End date (Firebase Timestamp or Date)
 * @returns {number} Total duration in days
 */
export const calculateTotalDuration = (startDate, endDate) => {
    const start = convertFirebaseDate(startDate);
    const end = convertFirebaseDate(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate days ago from a given date
 * @param {*} date - Date to compare (Firebase Timestamp or Date)
 * @returns {number} Days ago (positive number)
 */
export const calculateDaysAgo = (date) => {
    const targetDate = convertFirebaseDate(date);
    const now = new Date();
    return Math.floor((now - targetDate) / (1000 * 60 * 60 * 24));
};

/**
 * Get "time ago" string for relative time display
 * Used in activity feeds and member lists
 * @param {Date} date - Date to compare
 * @returns {string} Formatted time ago string
 */
export const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
};

/**
 * Get compact "time ago" string for activity feeds
 * Uses shorter format (m, h, d instead of full words)
 * @param {Date} date - Date to compare
 * @returns {string} Compact time ago string
 */
export const getTimeAgoCompact = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
};

/**
 * Format news article date for display
 * Used in stocks service for news timestamps
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export const formatNewsDate = (timestamp) => {
    const now = new Date();
    const newsDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - newsDate) / (1000 * 60));
    
    if (diffInMinutes < 1) {
        return "Just now";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        if (days === 1) {
            return "Yesterday";
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return newsDate.toLocaleDateString();
        }
    }
};

// /**
//  * Get minimum date for HTML date inputs (tomorrow)
//  * Used for simulation extension forms
//  * @returns {string} ISO date string for tomorrow
//  */
// export const getTomorrowISO = () => {
//     return new Date(Date.now() + 24*60*60*1000).toISOString().split("T")[0];
// };

/**
 * Filter items by date range (used for news filtering)
 * @param {Array} items - Array of items with datetime property
 * @param {number} daysBack - Number of days to go back
 * @returns {Array} Filtered items
 */
export const filterByDateRange = (items, daysBack = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffTimestamp = cutoffDate.getTime();
    
    return items.filter(item => item.datetime >= cutoffTimestamp);
};

/**
 * Sort items by date (newest first)
 * @param {Array} items - Array of items with datetime property
 * @returns {Array} Sorted items
 */
export const sortByDateDesc = (items) => {
    return [...items].sort((a, b) => b.datetime - a.datetime);
};

// Add these new utilities to your date-utils.js file:

/**
 * Format trade date for detailed display (date + time)
 * Used in trade history tables and detailed views
 * @param {*} timestamp - Timestamp (Firebase Timestamp, Date, or number)
 * @returns {object} Object with formatted date and time strings
 */
export const formatTradeDateTime = (timestamp) => {
    const date = convertFirebaseDate(timestamp);
    return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        full: `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    };
};

/**
 * Format date for simple display (date only)
 * Used in portfolio components and simple trade lists
 * @param {*} timestamp - Timestamp (Firebase Timestamp, Date, or number)
 * @returns {string} Formatted date string
 */
export const formatSimpleDate = (timestamp) => {
    const date = convertFirebaseDate(timestamp);
    return date.toLocaleDateString();
};

/**
 * Get minimum date for HTML date inputs (tomorrow)
 * Used for simulation extension forms and date pickers
 * @returns {string} ISO date string for tomorrow
 */
export const getTomorrowISO = () => {
    return new Date(Date.now() + 24*60*60*1000).toISOString().split("T")[0];
};

/**
 * Sort array by creation date (newest first)
 * Handles Firebase timestamps automatically
 * @param {Array} items - Array of items with createdAt property
 * @returns {Array} Sorted items
 */
export const sortByCreatedDate = (items) => {
    return [...items].sort((a, b) => {
        const aTime = convertFirebaseDate(a.createdAt);
        const bTime = convertFirebaseDate(b.createdAt);
        return bTime.getTime() - aTime.getTime();
    });
};

/**
 * Sort array by archived date (newest first)
 * Handles Firebase timestamps automatically
 * @param {Array} items - Array of items with archivedAt property
 * @returns {Array} Sorted items
 */
export const sortByArchivedDate = (items) => {
    return [...items].sort((a, b) => {
        const aTime = convertFirebaseDate(a.archivedAt);
        const bTime = convertFirebaseDate(b.archivedAt);
        return (bTime?.getTime() || 0) - (aTime?.getTime() || 0);
    });
};