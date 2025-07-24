// File: src/utils/portfolio-debug.js
// Utility functions for debugging and refreshing portfolio values - FIXED version

import { LeaderboardService } from "../services/leaderboard.js";
import { getPortfolio } from "../services/trading.js";
import { StockService } from "../services/stocks.js";
import { logger } from "../utils/logger.js";

/**
 * Debug utility for portfolio value calculations
 */
export class PortfolioDebugger {
    constructor() {
        this.leaderboardService = new LeaderboardService();
        this.stockService = new StockService();
        this.leaderboardService.initialize();
    }

    /**
     * Debug portfolio value calculation for a specific user in a simulation
     */
    async debugUserPortfolio(userId, simulationId) {
        logger.debug("=== PORTFOLIO DEBUG START ===");
        logger.debug(`User: ${userId}`);
        logger.debug(`Simulation: ${simulationId}`);
        
        try {
            // Get portfolio data
            const portfolio = await getPortfolio(userId, simulationId);
            if (!portfolio) {
                logger.error("No portfolio found!");
                return null;
            }

            logger.debug("\n--- Portfolio Data ---");
            logger.debug(`Cash: $${portfolio.cash}`);
            logger.debug(`Holdings: ${Object.keys(portfolio.holdings || {}).length}`);
            logger.debug(`Trades: ${(portfolio.trades || []).length}`);

            // Calculate value with live prices
            const portfolioValue = await this.leaderboardService.calculatePortfolioValue(portfolio);
            
            logger.debug("\n--- Calculated Values ---");
            logger.debug(`Total Value: $${portfolioValue.totalValue.toFixed(2)}`);
            logger.debug(`Holdings Value: $${portfolioValue.holdingsValue.toFixed(2)}`);
            logger.debug(`Cash: $${portfolioValue.cash.toFixed(2)}`);
            
            logger.debug("\n--- Holdings Breakdown ---");
            for (const [ticker, data] of Object.entries(portfolioValue.holdings)) {
                logger.debug(`${ticker}:`);
                logger.debug(`  Quantity: ${data.quantity}`);
                logger.debug(`  Avg Price: $${data.avgPrice.toFixed(2)}`);
                logger.debug(`  Current Price: $${data.currentPrice.toFixed(2)}`);
                logger.debug(`  Value: $${data.value.toFixed(2)}`);
                logger.debug(`  P&L: ${data.gainLoss >= 0 ? "+" : ""}$${data.gainLoss.toFixed(2)} (${data.gainLossPercent >= 0 ? "+" : ""}${data.gainLossPercent.toFixed(2)}%)`);
            }

            logger.debug("=== PORTFOLIO DEBUG END ===");
            
            return portfolioValue;

        } catch (error) {
            logger.error("Debug error:", error);
            throw error;
        }
    }

    /**
     * Compare portfolio values across different calculation methods
     */
    async compareCalculationMethods(userId, simulationId) {
        logger.debug("=== COMPARING CALCULATION METHODS ===");
        
        const portfolio = await getPortfolio(userId, simulationId);
        if (!portfolio) {
            logger.error("No portfolio found!");
            return;
        }

        // Method 1: Using average prices only
        let method1Value = portfolio.cash || 0;
        for (const ticker in portfolio.holdings) {
            const holding = portfolio.holdings[ticker];
            method1Value += holding.quantity * holding.avgPrice;
        }
        logger.debug(`Method 1 (Avg Prices): $${method1Value.toFixed(2)}`);

        // Method 2: Using live prices
        const liveValue = await this.leaderboardService.calculatePortfolioValue(portfolio);
        logger.debug(`Method 2 (Live Prices): $${liveValue.totalValue.toFixed(2)}`);

        // Show the difference
        const difference = liveValue.totalValue - method1Value;
        const percentDiff = (difference / method1Value) * 100;
        logger.debug(`Difference: $${difference.toFixed(2)} (${percentDiff.toFixed(2)}%)`);
        
        logger.debug("=== END COMPARISON ===");
        
        return {
            avgPriceValue: method1Value,
            livePriceValue: liveValue.totalValue,
            difference,
            percentDiff
        };
    }

    /**
     * Force refresh all portfolio values in a simulation
     */
    async refreshSimulationPortfolios(simulationId) {
        logger.debug(`Refreshing all portfolios for simulation ${simulationId}...`);
        
        try {
            // Use generateSimulationLeaderboard to force fresh calculation
            const leaderboard = await this.leaderboardService.generateSimulationLeaderboard(simulationId);
            
            if (leaderboard && leaderboard.rankings) {
                logger.debug(`Refreshed ${leaderboard.rankings.length} portfolios`);
                
                // Log top 5 for verification
                logger.debug("\nTop 5 After Refresh:");
                leaderboard.rankings.slice(0, 5).forEach((ranking, index) => {
                    logger.debug(`${index + 1}. ${ranking.displayName}: ${ranking.portfolioValue.toFixed(2)} (${ranking.totalReturnPercent >= 0 ? "+" : ""}${ranking.totalReturnPercent.toFixed(2)}%)`);
                });
            }
            
            return leaderboard;
            
        } catch (error) {
            logger.error("Error refreshing portfolios:", error);
            throw error;
        }
    }

    /**
     * Verify portfolio consistency across all views
     */
    async verifyPortfolioConsistency(userId, simulationId) {
        logger.debug("=== VERIFYING PORTFOLIO CONSISTENCY ===");
        
        try {
            // Get portfolio value from trading service
            const portfolio = await getPortfolio(userId, simulationId);
            const directValue = await this.leaderboardService.calculatePortfolioValue(portfolio);
            
            // Get value from leaderboard
            const leaderboard = await this.leaderboardService.getLeaderboard(simulationId);
            const userRanking = leaderboard?.rankings?.find(r => r.userId === userId);
            
            logger.debug(`Direct Calculation: $${directValue.totalValue.toFixed(2)}`);
            logger.debug(`Leaderboard Value: $${userRanking?.portfolioValue?.toFixed(2) || "Not found"}`);
            
            if (userRanking && Math.abs(directValue.totalValue - userRanking.portfolioValue) > 0.01) {
                console.warn("⚠️ INCONSISTENCY DETECTED!");
                logger.debug(`Difference: $${Math.abs(directValue.totalValue - userRanking.portfolioValue).toFixed(2)}`);
            } else {
                logger.debug("✅ Values are consistent");
            }
            
            return {
                directValue: directValue.totalValue,
                leaderboardValue: userRanking?.portfolioValue,
                isConsistent: userRanking && Math.abs(directValue.totalValue - userRanking.portfolioValue) <= 0.01
            };
            
        } catch (error) {
            logger.error("Error verifying consistency:", error);
            throw error;
        }
    }
}

/**
 * Quick debug function to add to console
 */
export async function debugPortfolio(userId, simulationId) {
    const portfolioDebugger = new PortfolioDebugger();
    return await portfolioDebugger.debugUserPortfolio(userId, simulationId);
}

/**
 * Force refresh portfolio values
 */
export async function refreshPortfolios(simulationId) {
    const portfolioDebugger = new PortfolioDebugger();
    return await portfolioDebugger.refreshSimulationPortfolios(simulationId);
}

// Make functions available globally for console debugging
if (typeof window !== "undefined") {
    window.portfolioDebug = {
        debug: debugPortfolio,
        refresh: refreshPortfolios,
        PortfolioDebugger
    };
    logger.debug("Portfolio debug utilities loaded. Use window.portfolioDebug.debug(userId, simulationId) to debug.");
}