// src/services/leaderboard.js
import { getFirestoreDb } from "./firebase.js";
import { getPortfolio } from "./trading.js";
import { StockService } from "./stocks.js";
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    query, 
    where,
    serverTimestamp 
} from "firebase/firestore";
import { 
    calculateReturnPercentage, 
    calculateTradeVolume, 
    calculateAverage, 
    calculateWinRateFromHoldings,
    calculatePercentile 
} from "../utils/math-utils.js";
import { logger } from "../utils/logger.js";

const LEADERBOARDS_COLLECTION = "simulationLeaderboards";
const SIMULATION_MEMBERS_COLLECTION = "simulationMembers";

export class LeaderboardService {
    constructor() {
        this.db = null;
        this.stockService = new StockService();
        this.isUpdating = new Map(); // Track updating simulations to prevent conflicts
    }

    initialize() {
        this.db = getFirestoreDb();
        logger.info("LeaderboardService initialized");
    }

    /**
     * Enhanced portfolio value calculation with better error handling
     * This method should replace the existing calculatePortfolioValue method
     */
    async calculatePortfolioValue(portfolio, cachedPrices = {}) {
        if (!portfolio) {
            return { 
                totalValue: 0, 
                holdingsValue: 0, 
                cash: 0, 
                holdings: {},
                lastUpdated: new Date()
            };
        }

        const cash = portfolio.cash || 0;
        const holdings = portfolio.holdings || {};
        let holdingsValue = 0;
        const holdingsBreakdown = {};

        logger.info(`Calculating portfolio value - Cash: $${cash}, Holdings: ${Object.keys(holdings).length}`);

        // Calculate holdings value with live prices
        for (const ticker in holdings) {
            if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                const holding = holdings[ticker];
                let currentPrice = cachedPrices[ticker];

                // Get price if not cached
                if (currentPrice === undefined || currentPrice === null) {
                    try {
                        currentPrice = await this.stockService.getQuote(ticker);
                        logger.info(`Fetched live price for ${ticker}: $${currentPrice}`);
                    } catch (error) {
                        logger.error(`Error fetching price for ${ticker}:`, error);
                        // Fall back to average price if API fails
                        currentPrice = holding.avgPrice;
                        logger.info(`Using fallback price for ${ticker}: $${currentPrice}`);
                    }
                }

                // Ensure we have a valid price
                if (currentPrice === null || currentPrice === undefined || isNaN(currentPrice)) {
                    currentPrice = holding.avgPrice || 0;
                }

                const quantity = holding.quantity || 0;
                const value = quantity * currentPrice;
                const costBasis = quantity * (holding.avgPrice || 0);
                const gainLoss = value - costBasis;
                const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

                holdingsValue += value;
                
                holdingsBreakdown[ticker] = {
                    quantity,
                    avgPrice: holding.avgPrice || 0,
                    currentPrice,
                    value,
                    costBasis,
                    gainLoss,
                    gainLossPercent
                };

                logger.info(`${ticker}: ${quantity} @ $${currentPrice} = $${value} (P&L: ${gainLoss >= 0 ? "+" : ""}$${gainLoss.toFixed(2)})`);
            }
        }

        const totalValue = cash + holdingsValue;
        
        logger.info(`Portfolio Total - Cash: $${cash}, Holdings: $${holdingsValue}, Total: $${totalValue}`);

        return {
            totalValue,
            holdingsValue,
            cash,
            holdings: holdingsBreakdown,
            lastUpdated: new Date()
        };
    }

    /**
     * Get simulation members with portfolio data
     * @param {string} simulationId - Simulation ID
     * @returns {Promise<Array>} Array of member objects with portfolio info
     */
    async getSimulationMembersWithPortfolios(simulationId) {
        this.db = this.db || getFirestoreDb();

        try {
            // Get simulation members
            const membersQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where("simulationId", "==", simulationId),
                where("status", "==", "active")
            );
            const memberDocs = await getDocs(membersQuery);

            const membersWithPortfolios = [];

            // Get portfolio for each member
            for (const memberDoc of memberDocs.docs) {
                const member = memberDoc.data();
                
                try {
                    const portfolio = await getPortfolio(member.userId, simulationId);
                    
                    if (portfolio) {
                        membersWithPortfolios.push({
                            ...member,
                            portfolio: portfolio,
                            memberId: memberDoc.id
                        });
                    }
                } catch (error) {
                    console.warn(`Error getting portfolio for user ${member.userId}:`, error);
                }
            }

            return membersWithPortfolios;

        } catch (error) {
            logger.error("Error getting simulation members with portfolios:", error);
            throw error;
        }
    }

    /**
     * Enhanced prefetch method with better error handling
     * This method should replace the existing prefetchStockPrices method
     */
    async prefetchStockPrices(membersWithPortfolios) {
        const uniqueTickers = new Set();
        
        // Collect all unique tickers
        membersWithPortfolios.forEach(member => {
            if (member.portfolio && member.portfolio.holdings) {
                Object.keys(member.portfolio.holdings).forEach(ticker => {
                    uniqueTickers.add(ticker);
                });
            }
        });

        const prices = {};
        const errors = [];
        
        // Batch fetch with rate limiting
        const batchSize = 5; // Fetch 5 at a time to avoid rate limits
        const tickerArray = Array.from(uniqueTickers);
        
        for (let i = 0; i < tickerArray.length; i += batchSize) {
            const batch = tickerArray.slice(i, i + batchSize);
            const batchPromises = batch.map(async (ticker) => {
                try {
                    const price = await this.stockService.getQuote(ticker);
                    if (price !== null && price !== undefined && !isNaN(price)) {
                        prices[ticker] = price;
                        logger.info(`Prefetched ${ticker}: $${price}`);
                    } else {
                        errors.push(`Invalid price for ${ticker}`);
                    }
                } catch (error) {
                    console.warn(`Error prefetching price for ${ticker}:`, error.message);
                    errors.push(`${ticker}: ${error.message}`);
                }
            });
            
            await Promise.all(batchPromises);
            
            // Small delay between batches to avoid rate limiting
            if (i + batchSize < tickerArray.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        logger.info(`Prefetched prices for ${Object.keys(prices).length}/${uniqueTickers.size} tickers`);
        if (errors.length > 0) {
            console.warn(`Price fetch errors: ${errors.join(", ")}`);
        }
        
        return prices;
    }

    /**
     * Calculate performance metrics
     * @param {object} portfolioValue - Calculated portfolio value
     * @param {object} portfolio - Portfolio data
     * @param {number} startingBalance - Simulation starting balance
     * @returns {object} Performance metrics
     */
    calculatePerformanceMetrics(portfolioValue, portfolio, startingBalance) {
        const totalReturn = portfolioValue.totalValue - startingBalance;
        const totalReturnPercent = calculateReturnPercentage(portfolioValue.totalValue, startingBalance);
        
        // Calculate trading stats
        const trades = portfolio.trades || [];
        const buyTrades = trades.filter(t => t.type === "buy");
        const sellTrades = trades.filter(t => t.type === "sell");
        
        // Calculate total volume traded
        const totalVolume = calculateTradeVolume(trades);
        
        // Simple win rate calculation (gains from holdings)
        const holdingsWithGains = Object.values(portfolioValue.holdings || {})
            .filter(h => h.gainLoss > 0);
        const holdingsWithLosses = Object.values(portfolioValue.holdings || {})
            .filter(h => h.gainLoss < 0);
        
        return {
            totalReturn,
            totalReturnPercent,
            dailyPL: 0, // TODO: Calculate daily P&L when we have historical data
            dailyPLPercent: 0,
            totalTrades: trades.length,
            buyTrades: buyTrades.length,
            sellTrades: sellTrades.length,
            totalVolume,
            holdingsCount: Object.keys(portfolioValue.holdings || {}).length,
            winningPositions: holdingsWithGains.length,
            losingPositions: holdingsWithLosses.length,
            winRate: calculateWinRateFromHoldings(portfolioValue.holdings),
            lastUpdated: new Date()
        };
    }

    /**
     * Generate complete leaderboard for a simulation
     * @param {string} simulationId - Simulation ID
     * @param {object} simulationInfo - Simulation data (optional, for starting balance)
     * @returns {Promise<object>} Complete leaderboard data
     */
    async generateSimulationLeaderboard(simulationId, simulationInfo = null) {
        // Prevent concurrent updates for the same simulation
        if (this.isUpdating.get(simulationId)) {
            logger.info(`Leaderboard update already in progress for simulation ${simulationId}`);
            return null;
        }

        this.isUpdating.set(simulationId, true);

        try {
            logger.info(`Generating leaderboard for simulation ${simulationId}...`);

            // Get simulation info if not provided
            if (!simulationInfo) {
                const simRef = doc(this.db, "simulations", simulationId);
                const simSnap = await getDoc(simRef);
                if (simSnap.exists()) {
                    simulationInfo = simSnap.data();
                } else {
                    throw new Error("Simulation not found");
                }
            }

            const startingBalance = simulationInfo.startingBalance || 10000;

            // Get all members with portfolios
            const membersWithPortfolios = await this.getSimulationMembersWithPortfolios(simulationId);
            
            if (membersWithPortfolios.length === 0) {
                console.warn(`No members with portfolios found for simulation ${simulationId}`);
                return {
                    simulationId,
                    rankings: [],
                    lastUpdated: new Date(),
                    totalParticipants: 0,
                    averageReturn: 0,
                    topPerformer: null,
                    worstPerformer: null
                };
            }

            // Prefetch all stock prices for efficiency
            const stockPrices = await this.prefetchStockPrices(membersWithPortfolios);

            // Calculate portfolio values and rankings
            const rankings = [];
            
            for (const member of membersWithPortfolios) {
                try {
                    const portfolioValue = await this.calculatePortfolioValue(member.portfolio, stockPrices);
                    const performanceMetrics = this.calculatePerformanceMetrics(
                        portfolioValue, 
                        member.portfolio, 
                        startingBalance
                    );

                    rankings.push({
                        userId: member.userId,
                        displayName: member.displayName,
                        email: member.email,
                        role: member.role,
                        joinedAt: member.joinedAt,
                        portfolioValue: portfolioValue.totalValue,
                        cash: portfolioValue.cash,
                        holdingsValue: portfolioValue.holdingsValue,
                        holdings: portfolioValue.holdings,
                        performance: performanceMetrics,
                        rank: 0, // Will be set after sorting
                        previousRank: null // TODO: Track from previous leaderboard
                    });
                } catch (error) {
                    logger.error(`Error calculating portfolio for user ${member.userId}:`, error);
                }
            }

            // Sort by portfolio value (descending)
            rankings.sort((a, b) => b.portfolioValue - a.portfolioValue);

            // Assign ranks (handle ties)
            let currentRank = 1;
            for (let i = 0; i < rankings.length; i++) {
                if (i > 0 && rankings[i].portfolioValue < rankings[i-1].portfolioValue) {
                    currentRank = i + 1;
                }
                rankings[i].rank = currentRank;
            }

            // Calculate summary statistics
            const totalParticipants = rankings.length;
            const averageReturn = calculateAverage(rankings.map(r => r.performance.totalReturnPercent));
            const topPerformer = rankings[0] || null;
            const worstPerformer = rankings[rankings.length - 1] || null;

            const leaderboardData = {
                simulationId,
                rankings,
                lastUpdated: new Date(),
                totalParticipants,
                averageReturn,
                topPerformer: topPerformer ? {
                    userId: topPerformer.userId,
                    displayName: topPerformer.displayName,
                    portfolioValue: topPerformer.portfolioValue,
                    totalReturn: topPerformer.performance.totalReturn,
                    totalReturnPercent: topPerformer.performance.totalReturnPercent
                } : null,
                worstPerformer: worstPerformer ? {
                    userId: worstPerformer.userId,
                    displayName: worstPerformer.displayName,
                    portfolioValue: worstPerformer.portfolioValue,
                    totalReturn: worstPerformer.performance.totalReturn,
                    totalReturnPercent: worstPerformer.performance.totalReturnPercent
                } : null
            };

            // Store leaderboard in Firestore
            await this.saveLeaderboard(leaderboardData);

            logger.info(`Leaderboard generated successfully for simulation ${simulationId} with ${totalParticipants} participants`);
            return leaderboardData;

        } catch (error) {
            logger.error(`Error generating leaderboard for simulation ${simulationId}:`, error);
            throw error;
        } finally {
            this.isUpdating.set(simulationId, false);
        }
    }

    /**
     * Save leaderboard data to Firestore
     * @param {object} leaderboardData - Complete leaderboard data
     */
    async saveLeaderboard(leaderboardData) {
        this.db = this.db || getFirestoreDb();

        try {
            const leaderboardRef = doc(this.db, LEADERBOARDS_COLLECTION, leaderboardData.simulationId);
            
            // Prepare data for Firestore (remove complex objects)
            const firestoreData = {
                simulationId: leaderboardData.simulationId,
                lastUpdated: serverTimestamp(),
                totalParticipants: leaderboardData.totalParticipants,
                averageReturn: leaderboardData.averageReturn,
                topPerformer: leaderboardData.topPerformer,
                worstPerformer: leaderboardData.worstPerformer,
                rankings: leaderboardData.rankings.map(ranking => ({
                    userId: ranking.userId,
                    displayName: ranking.displayName,
                    email: ranking.email,
                    role: ranking.role,
                    rank: ranking.rank,
                    portfolioValue: ranking.portfolioValue,
                    cash: ranking.cash,
                    holdingsValue: ranking.holdingsValue,
                    totalReturn: ranking.performance.totalReturn,
                    totalReturnPercent: ranking.performance.totalReturnPercent,
                    totalTrades: ranking.performance.totalTrades,
                    totalVolume: ranking.performance.totalVolume,
                    winRate: ranking.performance.winRate,
                    holdingsCount: ranking.performance.holdingsCount
                }))
            };

            await setDoc(leaderboardRef, firestoreData);
            logger.info(`Leaderboard saved for simulation ${leaderboardData.simulationId}`);

        } catch (error) {
            logger.error("Error saving leaderboard:", error);
            throw error;
        }
    }

    /**
     * Get cached leaderboard from Firestore
     * @param {string} simulationId - Simulation ID
     * @returns {Promise<object|null>} Cached leaderboard data or null
     */
    async getCachedLeaderboard(simulationId) {
        this.db = this.db || getFirestoreDb();

        try {
            const leaderboardRef = doc(this.db, LEADERBOARDS_COLLECTION, simulationId);
            const leaderboardSnap = await getDoc(leaderboardRef);

            if (leaderboardSnap.exists()) {
                return leaderboardSnap.data();
            }
            return null;

        } catch (error) {
            logger.error("Error getting cached leaderboard:", error);
            return null;
        }
    }

    /**
     * Get leaderboard (cached or generate new)
     * @param {string} simulationId - Simulation ID
     * @param {boolean} forceRefresh - Force regeneration even if cached
     * @param {object} simulationInfo - Simulation data (optional)
     * @returns {Promise<object>} Leaderboard data
     */
    async getLeaderboard(simulationId, forceRefresh = false, simulationInfo = null) {
        try {
            // Check for cached leaderboard
            if (!forceRefresh) {
                const cached = await this.getCachedLeaderboard(simulationId);
                if (cached) {
                    const lastUpdated = cached.lastUpdated?.toDate ? cached.lastUpdated.toDate() : new Date(cached.lastUpdated);
                    const ageMinutes = (new Date() - lastUpdated) / (1000 * 60);
                    
                    // Return cached if less than 5 minutes old
                    if (ageMinutes < 5) {
                        logger.info(`Using cached leaderboard for simulation ${simulationId} (${ageMinutes.toFixed(1)} minutes old)`);
                        return cached;
                    }
                }
            }

            // Generate fresh leaderboard
            return await this.generateSimulationLeaderboard(simulationId, simulationInfo);

        } catch (error) {
            logger.error("Error getting leaderboard:", error);
            throw error;
        }
    }

    /**
     * Get user's rank in a simulation
     * @param {string} simulationId - Simulation ID
     * @param {string} userId - User ID
     * @returns {Promise<object|null>} User's rank info or null
     */
    async getUserRank(simulationId, userId) {
        try {
            const leaderboard = await this.getLeaderboard(simulationId);
            if (!leaderboard || !leaderboard.rankings) {
                return null;
            }

            const userRanking = leaderboard.rankings.find(r => r.userId === userId);
            if (!userRanking) {
                return null;
            }

            return {
                rank: userRanking.rank,
                totalParticipants: leaderboard.totalParticipants,
                portfolioValue: userRanking.portfolioValue,
                totalReturn: userRanking.totalReturn,
                totalReturnPercent: userRanking.totalReturnPercent,
                percentile: calculatePercentile(userRanking.rank, leaderboard.totalParticipants)
            };

        } catch (error) {
            logger.error("Error getting user rank:", error);
            return null;
        }
    }

    /**
     * Update leaderboard for multiple simulations (batch operation)
     * @param {Array<string>} simulationIds - Array of simulation IDs
     * @returns {Promise<Array>} Results for each simulation
     */
    async updateMultipleLeaderboards(simulationIds) {
        const results = [];
        
        for (const simulationId of simulationIds) {
            try {
                const leaderboard = await this.generateSimulationLeaderboard(simulationId);
                results.push({ simulationId, success: true, leaderboard });
            } catch (error) {
                logger.error(`Error updating leaderboard for simulation ${simulationId}:`, error);
                results.push({ simulationId, success: false, error: error.message });
            }
        }
        
        return results;
    }
}