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

/**
 * Enhanced Math Utilities - Gains/Loss and Short/Long Term Calculations
 * Add these functions to your existing utils/math-utils.js file
 */

/**
 * Calculate realized gains/losses from completed trades
 * @param {Array} trades - Array of all trade records
 * @returns {object} Realized gains data with short/long term breakdown
 */
export const calculateRealizedGains = (trades) => {
    if (!Array.isArray(trades) || trades.length === 0) {
        return {
            totalRealized: 0,
            shortTermGains: 0,
            longTermGains: 0,
            shortTermTrades: [],
            longTermTrades: []
        };
    }

    // Group trades by ticker
    const tradesByTicker = {};
    trades.forEach(trade => {
        if (!tradesByTicker[trade.ticker]) {
            tradesByTicker[trade.ticker] = [];
        }
        tradesByTicker[trade.ticker].push({
            ...trade,
            timestamp: new Date(trade.timestamp)
        });
    });

    let totalRealized = 0;
    let shortTermGains = 0;
    let longTermGains = 0;
    const shortTermTrades = [];
    const longTermTrades = [];

    // Calculate realized gains for each ticker using FIFO method
    Object.keys(tradesByTicker).forEach(ticker => {
        const tickerTrades = tradesByTicker[ticker].sort((a, b) => a.timestamp - b.timestamp);
        const buyQueue = []; // FIFO queue for buy trades
        
        tickerTrades.forEach(trade => {
            if (trade.type === "buy") {
                buyQueue.push(trade);
            } else if (trade.type === "sell") {
                let sellQuantity = trade.quantity;
                
                while (sellQuantity > 0 && buyQueue.length > 0) {
                    const buyTrade = buyQueue[0];
                    const matchQuantity = Math.min(sellQuantity, buyTrade.quantity);
                    
                    // Calculate realized gain/loss for this match
                    const costBasis = matchQuantity * buyTrade.price;
                    const saleProceeds = matchQuantity * trade.price;
                    const realizedGain = saleProceeds - costBasis;
                    
                    // Determine if short-term or long-term (365 days = 1 year)
                    const holdingPeriodDays = (trade.timestamp - buyTrade.timestamp) / (1000 * 60 * 60 * 24);
                    const isLongTerm = holdingPeriodDays >= 365;
                    
                    const gainRecord = {
                        ticker,
                        quantity: matchQuantity,
                        buyDate: buyTrade.timestamp,
                        sellDate: trade.timestamp,
                        buyPrice: buyTrade.price,
                        sellPrice: trade.price,
                        costBasis,
                        saleProceeds,
                        realizedGain,
                        holdingPeriodDays: Math.round(holdingPeriodDays),
                        isLongTerm
                    };
                    
                    totalRealized += realizedGain;
                    
                    if (isLongTerm) {
                        longTermGains += realizedGain;
                        longTermTrades.push(gainRecord);
                    } else {
                        shortTermGains += realizedGain;
                        shortTermTrades.push(gainRecord);
                    }
                    
                    // Update quantities
                    sellQuantity -= matchQuantity;
                    buyTrade.quantity -= matchQuantity;
                    
                    if (buyTrade.quantity === 0) {
                        buyQueue.shift();
                    }
                }
            }
        });
    });

    return {
        totalRealized,
        shortTermGains,
        longTermGains,
        shortTermTrades,
        longTermTrades
    };
};

/**
 * Calculate unrealized gains/losses from current holdings
 * @param {object} holdings - Current holdings with avgPrice and quantity
 * @param {object} currentPrices - Current market prices by ticker
 * @param {Array} trades - All trades to determine holding periods
 * @returns {object} Unrealized gains data with short/long term breakdown
 */
export const calculateUnrealizedGains = (holdings, currentPrices, trades) => {
    if (!holdings || typeof holdings !== "object") {
        return {
            totalUnrealized: 0,
            shortTermUnrealized: 0,
            longTermUnrealized: 0,
            holdingDetails: []
        };
    }

    const holdingDetails = [];
    let totalUnrealized = 0;
    let shortTermUnrealized = 0;
    let longTermUnrealized = 0;

    // Calculate purchase dates for each holding using trades
    const holdingPurchaseDates = calculateHoldingPurchaseDates(holdings, trades);

    Object.keys(holdings).forEach(ticker => {
        const holding = holdings[ticker];
        const currentPrice = currentPrices[ticker] || holding.avgPrice;
        const marketValue = holding.quantity * currentPrice;
        const costBasis = holding.quantity * holding.avgPrice;
        const unrealizedGain = marketValue - costBasis;
        
        // Get weighted average holding period
        const avgHoldingDays = holdingPurchaseDates[ticker]?.avgHoldingDays || 0;
        const isLongTerm = avgHoldingDays >= 365;
        
        const holdingDetail = {
            ticker,
            quantity: holding.quantity,
            avgPrice: holding.avgPrice,
            currentPrice,
            costBasis,
            marketValue,
            unrealizedGain,
            unrealizedGainPercent: (unrealizedGain / costBasis) * 100,
            avgHoldingDays: Math.round(avgHoldingDays),
            isLongTerm
        };
        
        holdingDetails.push(holdingDetail);
        totalUnrealized += unrealizedGain;
        
        if (isLongTerm) {
            longTermUnrealized += unrealizedGain;
        } else {
            shortTermUnrealized += unrealizedGain;
        }
    });

    return {
        totalUnrealized,
        shortTermUnrealized,
        longTermUnrealized,
        holdingDetails
    };
};

/**
 * Calculate weighted average holding periods for current holdings
 * @param {object} holdings - Current holdings
 * @param {Array} trades - All trade records
 * @returns {object} Holding purchase date information by ticker
 */
export const calculateHoldingPurchaseDates = (holdings, trades) => {
    if (!Array.isArray(trades) || !holdings) return {};

    const holdingPurchaseDates = {};
    const now = new Date();

    // Group trades by ticker and sort by date
    const tradesByTicker = {};
    trades.forEach(trade => {
        if (!tradesByTicker[trade.ticker]) {
            tradesByTicker[trade.ticker] = [];
        }
        tradesByTicker[trade.ticker].push({
            ...trade,
            timestamp: new Date(trade.timestamp)
        });
    });

    Object.keys(holdings).forEach(ticker => {
        if (!tradesByTicker[ticker]) return;

        const tickerTrades = tradesByTicker[ticker].sort((a, b) => a.timestamp - b.timestamp);
        const buyTrades = [];

        // Simulate trades to find current position composition
        tickerTrades.forEach(trade => {
            if (trade.type === "buy") {
                buyTrades.push({
                    ...trade,
                    remainingShares: trade.quantity
                });
            } else if (trade.type === "sell") {
                let sellQuantity = trade.quantity;
                
                // Remove sold shares from buy trades (FIFO)
                for (let i = 0; i < buyTrades.length && sellQuantity > 0; i++) {
                    const reduction = Math.min(sellQuantity, buyTrades[i].remainingShares);
                    buyTrades[i].remainingShares -= reduction;
                    sellQuantity -= reduction;
                }
                
                // Remove buy trades with no remaining shares
                for (let i = buyTrades.length - 1; i >= 0; i--) {
                    if (buyTrades[i].remainingShares === 0) {
                        buyTrades.splice(i, 1);
                    }
                }
            }
        });

        // Calculate weighted average holding period for remaining shares
        if (buyTrades.length > 0) {
            let totalShareDays = 0;
            let totalShares = 0;

            buyTrades.forEach(buyTrade => {
                if (buyTrade.remainingShares > 0) {
                    const holdingDays = (now - buyTrade.timestamp) / (1000 * 60 * 60 * 24);
                    totalShareDays += buyTrade.remainingShares * holdingDays;
                    totalShares += buyTrade.remainingShares;
                }
            });

            holdingPurchaseDates[ticker] = {
                avgHoldingDays: totalShares > 0 ? totalShareDays / totalShares : 0,
                oldestBuyDate: buyTrades[0]?.timestamp,
                totalShares
            };
        }
    });

    return holdingPurchaseDates;
};

/**
 * Calculate comprehensive gains summary
 * @param {object} holdings - Current holdings
 * @param {object} currentPrices - Current market prices
 * @param {Array} trades - All trade records
 * @returns {object} Complete gains/loss summary
 */
export const calculateComprehensiveGains = (holdings, currentPrices, trades) => {
    const realized = calculateRealizedGains(trades);
    const unrealized = calculateUnrealizedGains(holdings, currentPrices, trades);

    return {
        realized,
        unrealized,
        totalGains: realized.totalRealized + unrealized.totalUnrealized,
        netShortTerm: realized.shortTermGains + unrealized.shortTermUnrealized,
        netLongTerm: realized.longTermGains + unrealized.longTermUnrealized
    };
};

/**
 * Calculate tax implications (simplified US tax rates)
 * @param {number} shortTermGains - Short-term capital gains
 * @param {number} longTermGains - Long-term capital gains
 * @param {number} ordinaryTaxRate - Ordinary income tax rate (default: 22%)
 * @param {number} capitalGainsTaxRate - Long-term capital gains rate (default: 15%)
 * @returns {object} Tax calculation summary
 */
export const calculateTaxImplications = (
    shortTermGains, 
    longTermGains, 
    ordinaryTaxRate = 0.22, 
    capitalGainsTaxRate = 0.15
) => {
    const shortTermTax = Math.max(0, shortTermGains * ordinaryTaxRate);
    const longTermTax = Math.max(0, longTermGains * capitalGainsTaxRate);
    const totalTax = shortTermTax + longTermTax;
    const afterTaxGains = (shortTermGains + longTermGains) - totalTax;

    return {
        shortTermTax,
        longTermTax,
        totalTax,
        afterTaxGains,
        effectiveRate: (shortTermGains + longTermGains) > 0 ? 
            (totalTax / (shortTermGains + longTermGains)) * 100 : 0
    };
};