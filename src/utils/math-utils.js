/**
 * Mathematical and Statistical Utilities
 * 
 * Core utility functions for mathematical calculations, statistics,
 * and numerical operations used throughout the trading simulator.
 * Cleaned up to include only actively used functions.
 */

/**
 * Safe math operations with null/undefined handling
 */

/**
 * Safely round a number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {number} Rounded value
 */
export const safeRound = (value, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) return 0;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Portfolio and Trading Calculations
 */

/**
 * Calculate total portfolio value
 * @param {number} cash - Cash amount
 * @param {object} holdings - Holdings object with quantity and price
 * @returns {number} Total portfolio value
 */
export const calculateTotalPortfolioValue = (cash, holdings) => {
    const cashValue = cash || 0;
    const holdingsValue = calculateTotalHoldingsValue(holdings);
    return cashValue + holdingsValue;
};

/**
 * Calculate total holdings value
 * @param {object} holdings - Holdings object with ticker as key
 * @returns {number} Total holdings value
 */
export const calculateTotalHoldingsValue = (holdings) => {
    if (!holdings || typeof holdings !== "object") return 0;
    
    let total = 0;
    for (const ticker in holdings) {
        if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
            const holding = holdings[ticker];
            total += (holding.quantity || 0) * (holding.avgPrice || 0);
        }
    }
    return total;
};

/**
 * Calculate trade volume from trades array
 * @param {Array} trades - Array of trade objects with tradeCost property
 * @returns {number} Total trade volume
 */
export const calculateTradeVolume = (trades) => {
    if (!Array.isArray(trades)) return 0;
    return trades.reduce((sum, trade) => sum + (trade.tradeCost || 0), 0);
};

/**
 * Calculate return percentage
 * @param {number} currentValue - Current value
 * @param {number} originalValue - Original value
 * @returns {number} Return percentage
 */
export const calculateReturnPercentage = (currentValue, originalValue) => {
    if (originalValue === 0 || originalValue === null || originalValue === undefined) return 0;
    return ((currentValue - originalValue) / originalValue) * 100;
};

/**
 * Calculate utilization percentage
 * @param {number} used - Used amount
 * @param {number} total - Total amount
 * @returns {number} Utilization percentage (0-100)
 */
export const calculateUtilizationPercent = (used, total) => {
    if (total === 0 || total === null || total === undefined) return 0;
    return (used / total) * 100;
};

/**
 * Calculate progress percentage
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgressPercent = (current, total) => {
    if (total === 0 || total === null || total === undefined) return 0;
    return Math.min(100, (current / total) * 100);
};

/**
 * Statistical Functions
 */

/**
 * Calculate average (mean) of an array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Average value
 */
export const calculateAverage = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    const validNumbers = numbers.filter(n => !isNaN(n) && n !== null && n !== undefined);
    if (validNumbers.length === 0) return 0;
    return validNumbers.reduce((sum, num) => sum + num, 0) / validNumbers.length;
};

/**
 * Calculate sum of a specific property from array of objects
 * @param {Array} objects - Array of objects
 * @param {string} property - Property name to sum
 * @returns {number} Sum of property values
 */
export const sumByProperty = (objects, property) => {
    if (!Array.isArray(objects)) return 0;
    return objects.reduce((sum, obj) => sum + (obj[property] || 0), 0);
};

/**
 * Trading and Performance Metrics
 */

/**
 * Calculate win rate from holdings with gains/losses
 * @param {object} holdings - Holdings object with gainLoss property
 * @returns {number} Win rate percentage
 */
export const calculateWinRateFromHoldings = (holdings) => {
    if (!holdings || typeof holdings !== "object") return 0;
    
    const holdingsArray = Object.values(holdings);
    const wins = holdingsArray.filter(h => (h.gainLoss || 0) > 0).length;
    const total = holdingsArray.length;
    
    if (total === 0) return 0;
    return (wins / total) * 100;
};

/**
 * Calculate average trades per member
 * @param {number} totalTrades - Total number of trades
 * @param {number} activeMembers - Number of active members
 * @returns {number} Average trades per member
 */
export const calculateAvgTradesPerMember = (totalTrades, activeMembers) => {
    if (activeMembers === 0) return 0;
    return totalTrades / activeMembers;
};

/**
 * Ranking and Percentile Calculations
 */

/**
 * Calculate percentile rank
 * @param {number} rank - Current rank (1-based)
 * @param {number} total - Total participants
 * @returns {number} Percentile (0-100)
 */
export const calculatePercentile = (rank, total) => {
    if (total === 0 || rank > total) return 0;
    return Math.round((1 - (rank - 1) / total) * 100);
};