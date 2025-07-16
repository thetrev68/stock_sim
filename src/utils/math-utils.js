/**
 * Mathematical and Statistical Utilities
 * 
 * Pure utility functions for mathematical calculations, statistics,
 * and numerical operations extracted from the codebase.
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
 * Safely get the maximum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Maximum value
 */
export const safeMax = (a, b) => {
    if (isNaN(a) || a === null || a === undefined) return b || 0;
    if (isNaN(b) || b === null || b === undefined) return a || 0;
    return Math.max(a, b);
};

/**
 * Safely get the minimum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Minimum value
 */
export const safeMin = (a, b) => {
    if (isNaN(a) || a === null || a === undefined) return b || 0;
    if (isNaN(b) || b === null || b === undefined) return a || 0;
    return Math.min(a, b);
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
 * Calculate median of an array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Median value
 */
export const calculateMedian = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    const validNumbers = numbers.filter(n => !isNaN(n) && n !== null && n !== undefined);
    if (validNumbers.length === 0) return 0;
    
    const sorted = [...validNumbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
};

/**
 * Calculate sum of an array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Sum of all numbers
 */
export const calculateSum = (numbers) => {
    if (!Array.isArray(numbers)) return 0;
    return numbers.reduce((sum, num) => sum + (num || 0), 0);
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
 * Calculate average of a specific property from array of objects
 * @param {Array} objects - Array of objects
 * @param {string} property - Property name to average
 * @returns {number} Average of property values
 */
export const averageByProperty = (objects, property) => {
    if (!Array.isArray(objects) || objects.length === 0) return 0;
    const sum = sumByProperty(objects, property);
    return sum / objects.length;
};

/**
 * Count objects that match a condition
 * @param {Array} objects - Array of objects
 * @param {Function} condition - Condition function
 * @returns {number} Count of matching objects
 */
export const countByCondition = (objects, condition) => {
    if (!Array.isArray(objects)) return 0;
    return objects.filter(condition).length;
};

/**
 * Trading and Performance Metrics
 */

/**
 * Calculate win rate percentage
 * @param {number} wins - Number of winning positions
 * @param {number} total - Total number of positions
 * @returns {number} Win rate percentage (0-100)
 */
export const calculateWinRate = (wins, total) => {
    if (total === 0) return 0;
    return (wins / total) * 100;
};

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
    
    return calculateWinRate(wins, total);
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

/**
 * Assign ranks to sorted array (handles ties)
 * @param {Array} sortedArray - Array sorted by ranking criteria
 * @param {string} valueProperty - Property to compare for ties
 * @returns {Array} Array with rank property added
 */
export const assignRanks = (sortedArray, valueProperty) => {
    if (!Array.isArray(sortedArray)) return [];
    
    let currentRank = 1;
    for (let i = 0; i < sortedArray.length; i++) {
        if (i > 0 && sortedArray[i][valueProperty] < sortedArray[i-1][valueProperty]) {
            currentRank = i + 1;
        }
        sortedArray[i].rank = currentRank;
    }
    
    return sortedArray;
};

/**
 * Random Number Generation for Mock Data
 */

/**
 * Generate random number within range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number in range
 */
export const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
};

/**
 * Generate random integer within range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer in range
 */
export const randomIntInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random price change (for mock data)
 * @param {number} basePrice - Base price
 * @param {number} volatility - Volatility factor (default: 0.05 for 5%)
 * @returns {number} Price with random change applied
 */
export const generateRandomPriceChange = (basePrice, volatility = 0.05) => {
    const change = (Math.random() - 0.5) * 2 * volatility; // ±volatility
    return basePrice * (1 + change);
};

/**
 * Financial Calculations
 */

/**
 * Calculate compound growth rate
 * @param {number} initialValue - Initial value
 * @param {number} finalValue - Final value
 * @param {number} periods - Number of periods
 * @returns {number} Compound growth rate as percentage
 */
export const calculateCompoundGrowthRate = (initialValue, finalValue, periods) => {
    if (initialValue === 0 || periods === 0) return 0;
    return (Math.pow(finalValue / initialValue, 1 / periods) - 1) * 100;
};

/**
 * Calculate standard deviation
 * @param {Array} numbers - Array of numbers
 * @returns {number} Standard deviation
 */
export const calculateStandardDeviation = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    
    const mean = calculateAverage(numbers);
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    const meanSquaredDifference = calculateAverage(squaredDifferences);
    
    return Math.sqrt(meanSquaredDifference);
};

/**
 * Utility Functions
 */

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Check if a number is within a range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if within range
 */
export const isInRange = (value, min, max) => {
    return value >= min && value <= max;
};

/**
 * Convert a value to a safe number (handles null/undefined/NaN)
 * @param {any} value - Value to convert
 * @param {number} fallback - Fallback value (default: 0)
 * @returns {number} Safe number
 */
export const toSafeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
};