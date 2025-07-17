/**
 * Currency and Financial Utilities
 * 
 * Pure utility functions for currency formatting, percentage calculations,
 * and financial calculations extracted from the codebase.
 */

/** TFC
 * Format a number as currency with commas and 2 decimal places
 * @param {number} amount - Amount to format
 * @param {boolean} includeDollarSign - Whether to include $ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, includeDollarSign = true) => {
    const prefix = includeDollarSign ? "$" : "";
    return `${prefix}${amount.toFixed(2)}`;
};

/** TFC
 * Format a number as currency with thousand separators
 * @param {number} amount - Amount to format
 * @param {boolean} includeDollarSign - Whether to include $ symbol (default: true)
 * @returns {string} Formatted currency string with commas
 */
export const formatCurrencyWithCommas = (amount, includeDollarSign = true) => {
    const prefix = includeDollarSign ? "$" : "";
    return `${prefix}${amount.toLocaleString()}`;
};

/** TFC
 * Format a large number with thousand separators (no decimal places)
 * Used for quantities, volume, market cap
 * @param {number} number - Number to format
 * @returns {string} Formatted number string with commas
 */
export const formatNumberWithCommas = (number) => {
    return number.toLocaleString();
};

/** TFC
 * Format percentage with specified decimal places
 * @param {number} value - Percentage value (as decimal, e.g., 0.15 for 15%)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
    return `${value.toFixed(decimals)}%`;
};

/** TFC
 * Format price change with sign and percentage
 * Used in research view and portfolio displays
 * @param {number} change - Price change amount
 * @param {number} changePercent - Price change percentage
 * @param {boolean} includeIcon - Whether to include trend icons (default: true)
 * @returns {string} Formatted price change string
 */
export const formatPriceChange = (change, changePercent, includeIcon = true) => {
    const isPositive = change >= 0;
    const sign = isPositive ? "+" : "";
    const icon = includeIcon ? (isPositive ? "↗" : "↘") : "";
    const iconPrefix = icon ? `${icon} ` : "";
    
    return `${iconPrefix}${sign}${Math.abs(change).toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
};

/** TFC
 * Format gain/loss with sign, color class, and icon
 * Used throughout portfolio and holdings displays
 * @param {number} gainLoss - Gain/loss amount
 * @param {number} gainLossPercent - Gain/loss percentage
 * @param {boolean} includeIcon - Whether to include trend icons (default: true)
 * @returns {object} Object with formatted strings and CSS classes
 */
export const formatGainLoss = (gainLoss, gainLossPercent, includeIcon = true) => {
    const isPositive = gainLoss >= 0;
    const sign = isPositive ? "+" : "";
    const icon = includeIcon ? (isPositive ? "↗" : "↘") : "";
    const iconPrefix = icon ? `${icon} ` : "";
    const colorClass = isPositive ? "text-green-400" : "text-red-400";
    
    return {
        amount: `${iconPrefix}${sign}$${Math.abs(gainLoss).toFixed(2)}`,
        percentage: `${sign}${gainLossPercent.toFixed(2)}%`,
        colorClass,
        isPositive
    };
};

/** TFC
 * Calculate gain/loss from current and original values
 * @param {number} currentValue - Current value
 * @param {number} originalValue - Original value
 * @returns {object} Object with gain/loss amount and percentage
 */
export const calculateGainLoss = (currentValue, originalValue) => {
    const gainLoss = currentValue - originalValue;
    const gainLossPercent = (gainLoss / originalValue) * 100;
    
    return {
        amount: gainLoss,
        percentage: gainLossPercent
    };
};

/** TFC
 * Calculate market value of a holding
 * @param {number} quantity - Number of shares
 * @param {number} price - Price per share
 * @returns {number} Total market value
 */
export const calculateMarketValue = (quantity, price) => {
    return quantity * price;
};

/** TFC
 * Calculate cost basis of a holding
 * @param {number} quantity - Number of shares
 * @param {number} avgPrice - Average price per share
 * @returns {number} Total cost basis
 */
export const calculateCostBasis = (quantity, avgPrice) => {
    return quantity * avgPrice;
};

// /** TFC - Not Used
//  * Calculate portfolio percentage for a specific holding
//  * @param {number} holdingValue - Value of the holding
//  * @param {number} totalPortfolioValue - Total portfolio value
//  * @returns {number} Percentage of portfolio (as decimal)
//  */
// export const calculatePortfolioPercentage = (holdingValue, totalPortfolioValue) => {
//     if (totalPortfolioValue === 0) return 0;
//     return (holdingValue / totalPortfolioValue) * 100;
// };

/** TFC
 * Format portfolio change with appropriate styling
 * Used in portfolio headers and simulation stats
 * @param {number} change - Portfolio change amount
 * @param {number} changePercent - Portfolio change percentage
 * @returns {object} Object with formatted strings and CSS classes
 */
export const formatPortfolioChange = (change, changePercent) => {
    const isPositive = change >= 0;
    const sign = isPositive ? "+" : "";
    const colorClass = isPositive ? "text-green-400" : "text-red-400";
    
    return {
        display: `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`,
        colorClass,
        isPositive
    };
};

// /** TFC Not Used
//  * Format large numbers with appropriate suffixes (K, M, B)
//  * Used for volume, market cap display
//  * @param {number} num - Number to format
//  * @param {number} decimals - Number of decimal places (default: 1)
//  * @returns {string} Formatted number with suffix
//  */
// export const formatLargeNumber = (num, decimals = 1) => {
//     if (num === 0) return "0";
    
//     const units = ["", "K", "M", "B", "T"];
//     const magnitude = Math.floor(Math.log10(Math.abs(num)) / 3);
//     const index = Math.min(magnitude, units.length - 1);
//     const scaled = num / Math.pow(10, index * 3);
    
//     return `${scaled.toFixed(decimals)}${units[index]}`;
// };

/** TFC
 * Format price for display (always 2 decimal places)
 * @param {number} price - Price to format
 * @param {boolean} includeDollarSign - Whether to include $ symbol (default: true)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, includeDollarSign = true) => {
    if (price === null || price === undefined) return "--";
    const prefix = includeDollarSign ? "$" : "";
    return `${prefix}${price.toFixed(2)}`;
};

/** TFC
 * Get CSS color class for gain/loss values
 * @param {number} value - Value to check (positive/negative)
 * @returns {string} CSS class for styling
 */
export const getGainLossColorClass = (value) => {
    return value >= 0 ? "text-green-400" : "text-red-400";
};

/** TFC
 * Get CSS background color class for trade types
 * @param {string} tradeType - 'buy' or 'sell'
 * @returns {string} CSS class for styling
 */
export const getTradeTypeColorClass = (tradeType) => {
    return tradeType === "buy" ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10";
};

/** TFC
 * Calculate percentage of portfolio that is cash
 * @param {number} cash - Cash amount
 * @param {number} totalValue - Total portfolio value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatCashPercentage = (cash, totalValue, decimals = 1) => {
    if (totalValue === 0) return "0.0%";
    const percentage = (cash / totalValue) * 100;
    return `${percentage.toFixed(decimals)}%`;
};