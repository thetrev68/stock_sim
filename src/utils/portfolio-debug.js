// File: src/utils/portfolio-debug.js
// Utility functions for debugging and refreshing portfolio values - FIXED version

import { LeaderboardService } from "../services/leaderboard.js";
import { getPortfolio } from "../services/trading.js";
import { StockService } from "../services/stocks.js";

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
        console.log("=== PORTFOLIO DEBUG START ===");
        console.log(`User: ${userId}`);
        console.log(`Simulation: ${simulationId}`);
        
        try {
            // Get portfolio data
            const portfolio = await getPortfolio(userId, simulationId);
            if (!portfolio) {
                console.error("No portfolio found!");
                return null;
            }

            console.log("\n--- Portfolio Data ---");
            console.log(`Cash: $${portfolio.cash}`);
            console.log(`Holdings: ${Object.keys(portfolio.holdings || {}).length}`);
            console.log(`Trades: ${(portfolio.trades || []).length}`);

            // Calculate value with live prices
            const portfolioValue = await this.leaderboardService.calculatePortfolioValue(portfolio);
            
            console.log("\n--- Calculated Values ---");
            console.log(`Total Value: $${portfolioValue.totalValue.toFixed(2)}`);
            console.log(`Holdings Value: $${portfolioValue.holdingsValue.toFixed(2)}`);
            console.log(`Cash: $${portfolioValue.cash.toFixed(2)}`);
            
            console.log("\n--- Holdings Breakdown ---");
            for (const [ticker, data] of Object.entries(portfolioValue.holdings)) {
                console.log(`${ticker}:`);
                console.log(`  Quantity: ${data.quantity}`);
                console.log(`  Avg Price: $${data.avgPrice.toFixed(2)}`);
                console.log(`  Current Price: $${data.currentPrice.toFixed(2)}`);
                console.log(`  Value: $${data.value.toFixed(2)}`);
                console.log(`  P&L: ${data.gainLoss >= 0 ? "+" : ""}$${data.gainLoss.toFixed(2)} (${data.gainLossPercent >= 0 ? "+" : ""}${data.gainLossPercent.toFixed(2)}%)`);
            }

            console.log("=== PORTFOLIO DEBUG END ===");
            
            return portfolioValue;

        } catch (error) {
            console.error("Debug error:", error);
            throw error;
        }
    }

    /**
     * Compare portfolio values across different calculation methods
     */
    async compareCalculationMethods(userId, simulationId) {
        console.log("=== COMPARING CALCULATION METHODS ===");
        
        const portfolio = await getPortfolio(userId, simulationId);
        if (!portfolio) {
            console.error("No portfolio found!");
            return;
        }

        // Method 1: Using average prices only
        let method1Value = portfolio.cash || 0;
        for (const ticker in portfolio.holdings) {
            const holding = portfolio.holdings[ticker];
            method1Value += holding.quantity * holding.avgPrice;
        }
        console.log(`Method 1 (Avg Prices): $${method1Value.toFixed(2)}`);

        // Method 2: Using live prices
        const liveValue = await this.leaderboardService.calculatePortfolioValue(portfolio);
        console.log(`Method 2 (Live Prices): $${liveValue.totalValue.toFixed(2)}`);

        // Show the difference
        const difference = liveValue.totalValue - method1Value;
        const percentDiff = (difference / method1Value) * 100;
        console.log(`Difference: $${difference.toFixed(2)} (${percentDiff.toFixed(2)}%)`);
        
        console.log("=== END COMPARISON ===");
        
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
        console.log(`Refreshing all portfolios for simulation ${simulationId}...`);
        
        try {
            // Use generateSimulationLeaderboard to force fresh calculation
            const leaderboard = await this.leaderboardService.generateSimulationLeaderboard(simulationId);
            
            if (leaderboard && leaderboard.rankings) {
                console.log(`Refreshed ${leaderboard.rankings.length} portfolios`);
                
                // Log top 5 for verification
                console.log("\nTop 5 After Refresh:");
                leaderboard.rankings.slice(0, 5).forEach((ranking, index) => {
                    console.log(`${index + 1}. ${ranking.displayName}: ${ranking.portfolioValue.toFixed(2)} (${ranking.totalReturnPercent >= 0 ? "+" : ""}${ranking.totalReturnPercent.toFixed(2)}%)`);
                });
            }
            
            return leaderboard;
            
        } catch (error) {
            console.error("Error refreshing portfolios:", error);
            throw error;
        }
    }

    /**
     * Verify portfolio consistency across all views
     */
    async verifyPortfolioConsistency(userId, simulationId) {
        console.log("=== VERIFYING PORTFOLIO CONSISTENCY ===");
        
        try {
            // Get portfolio value from trading service
            const portfolio = await getPortfolio(userId, simulationId);
            const directValue = await this.leaderboardService.calculatePortfolioValue(portfolio);
            
            // Get value from leaderboard
            const leaderboard = await this.leaderboardService.getLeaderboard(simulationId);
            const userRanking = leaderboard?.rankings?.find(r => r.userId === userId);
            
            console.log(`Direct Calculation: $${directValue.totalValue.toFixed(2)}`);
            console.log(`Leaderboard Value: $${userRanking?.portfolioValue?.toFixed(2) || "Not found"}`);
            
            if (userRanking && Math.abs(directValue.totalValue - userRanking.portfolioValue) > 0.01) {
                console.warn("⚠️ INCONSISTENCY DETECTED!");
                console.log(`Difference: $${Math.abs(directValue.totalValue - userRanking.portfolioValue).toFixed(2)}`);
            } else {
                console.log("✅ Values are consistent");
            }
            
            return {
                directValue: directValue.totalValue,
                leaderboardValue: userRanking?.portfolioValue,
                isConsistent: userRanking && Math.abs(directValue.totalValue - userRanking.portfolioValue) <= 0.01
            };
            
        } catch (error) {
            console.error("Error verifying consistency:", error);
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
    console.log("Portfolio debug utilities loaded. Use window.portfolioDebug.debug(userId, simulationId) to debug.");
}