// File: src/components/simulation/SimulationPortfolioManager.js
// Updated portfolio value calculation with live prices - FIXED version

import { getPortfolio } from "../../services/trading.js";
import { formatCurrencyWithCommas, formatPortfolioChange } from "../../utils/currency-utils.js";
import { updateElementHTML } from "../../utils/dom-utils.js";
import { getHoldingElementTemplate, getTradeElementTemplate } from "../../templates/simulation/portfolio-components.js";
import { getPortfolioErrorTemplate } from "../../templates/portfolio/portfolio-errors.js";
import { TRADE_TYPE_CONFIG } from "../../constants/trade-types.js";
import { StockService } from "../../services/stocks.js";

export class SimulationPortfolioManager {
    constructor(view) {
        this.view = view;
        this.simulationPortfolio = null;
        this.stockService = new StockService();
        this.cachedPrices = new Map(); // Cache prices to avoid multiple fetches
    }

    async loadSimulationPortfolio() {
        if (!this.view.currentUser || !this.view.simulationId) {
            console.error("Cannot load portfolio: missing user or simulation ID");
            this.showPortfolioError();
            return;
        }

        try {
            const portfolio = await getPortfolio(this.view.currentUser.uid, this.view.simulationId);
            if (!portfolio) {
                console.warn("No portfolio found for simulation");
                this.showPortfolioError();
                return;
            }

            this.simulationPortfolio = portfolio;
            console.log("Loaded simulation portfolio:", this.simulationPortfolio);

            // Fetch live prices for all holdings
            await this.fetchLivePricesForHoldings();
            
            // Update the portfolio stats with live prices
            await this.updatePortfolioStats();
            
            // Load and display holdings and trades
            this.loadHoldings();
            this.loadRecentTrades();

        } catch (error) {
            console.error("Error loading simulation portfolio:", error);
            this.showPortfolioError();
        }
    }

    async fetchLivePricesForHoldings() {
        if (!this.simulationPortfolio?.holdings) return;

        const holdings = this.simulationPortfolio.holdings;
        const pricePromises = [];

        // Clear cache
        this.cachedPrices.clear();

        // Fetch all prices in parallel
        for (const ticker in holdings) {
            if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                pricePromises.push(
                    this.stockService.getQuote(ticker)
                        .then(price => {
                            if (price !== null && price !== undefined) {
                                this.cachedPrices.set(ticker, price);
                                // Update the holding with current price
                                holdings[ticker].currentPrice = price;
                            }
                        })
                        .catch(error => {
                            console.error(`Error fetching price for ${ticker}:`, error);
                        })
                );
            }
        }

        await Promise.all(pricePromises);
        console.log("Fetched live prices:", Object.fromEntries(this.cachedPrices));
    }

    async updatePortfolioStats() {
        if (!this.simulationPortfolio) return;

        const portfolioValueEl = document.getElementById("sim-portfolio-value");
        const portfolioChangeEl = document.getElementById("sim-portfolio-change");
        
        // Calculate portfolio value with live prices
        const portfolioValue = await this.calculateTotalPortfolioValue();
        
        if (portfolioValueEl) {
            portfolioValueEl.textContent = formatCurrencyWithCommas(portfolioValue.totalValue);
            
            if (portfolioChangeEl && this.view.currentSimulation) {
                const startingBalance = this.view.currentSimulation.startingBalance || 10000;
                const change = portfolioValue.totalValue - startingBalance;
                const changePercent = (change / startingBalance * 100);
                
                const formatted = formatPortfolioChange(change, changePercent);
                portfolioChangeEl.textContent = formatted.display;
                portfolioChangeEl.className = `text-sm font-medium ${formatted.colorClass}`;
            }
        }

        // Also update the stats cards if they exist
        this.updateStatsCards(portfolioValue);
    }

    async calculateTotalPortfolioValue() {
        if (!this.simulationPortfolio) {
            return { totalValue: 0, cash: 0, holdingsValue: 0 };
        }

        const cash = this.simulationPortfolio.cash || 0;
        let holdingsValue = 0;
        
        console.log("=== PORTFOLIO VALUE CALCULATION ===");
        console.log("Cash:", cash);
        
        const holdings = this.simulationPortfolio.holdings || {};
        for (const ticker in holdings) {
            if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                const holding = holdings[ticker];
                // Use cached live price, fall back to average price
                const currentPrice = this.cachedPrices.get(ticker) || holding.currentPrice || holding.avgPrice;
                const holdingValue = holding.quantity * currentPrice;
                holdingsValue += holdingValue;
                
                console.log(`${ticker}: ${holding.quantity} shares @ $${currentPrice} = $${holdingValue}`);
            }
        }
        
        const totalValue = cash + holdingsValue;
        console.log("Total holdings value:", holdingsValue);
        console.log("Total portfolio value:", totalValue);
        console.log("==================================");
        
        return { totalValue, cash, holdingsValue };
    }

    updateStatsCards(portfolioValue) {
        // Update main portfolio value card
        const portfolioValueCard = document.getElementById("portfolio-value");
        if (portfolioValueCard) {
            portfolioValueCard.textContent = formatCurrencyWithCommas(portfolioValue.totalValue);
        }

        // Update portfolio change
        const portfolioChangeCard = document.getElementById("portfolio-change");
        if (portfolioChangeCard && this.view.currentSimulation) {
            const startingBalance = this.view.currentSimulation.startingBalance || 10000;
            const change = portfolioValue.totalValue - startingBalance;
            const changePercent = (change / startingBalance * 100);
            
            const formatted = formatPortfolioChange(change, changePercent);
            portfolioChangeCard.textContent = formatted.display;
            portfolioChangeCard.className = `text-xs ${formatted.colorClass}`;
        }
    }

    loadHoldings() {
        const holdingsContainer = document.getElementById("sim-holdings-container");
        if (!holdingsContainer) return;

        const holdingsLoading = document.getElementById("sim-holdings-loading");
        const holdingsEmpty = document.getElementById("sim-holdings-empty");
        const holdingsList = document.getElementById("sim-holdings-list");

        if (holdingsLoading) holdingsLoading.classList.add("hidden");

        if (!this.simulationPortfolio?.holdings || Object.keys(this.simulationPortfolio.holdings).length === 0) {
            if (holdingsEmpty) holdingsEmpty.classList.remove("hidden");
            if (holdingsList) holdingsList.classList.add("hidden");
            return;
        }

        if (holdingsEmpty) holdingsEmpty.classList.add("hidden");
        if (holdingsList) {
            holdingsList.classList.remove("hidden");
            holdingsList.innerHTML = "";

            // Display holdings with live prices
            for (const ticker in this.simulationPortfolio.holdings) {
                if (Object.prototype.hasOwnProperty.call(this.simulationPortfolio.holdings, ticker)) {
                    const holding = this.simulationPortfolio.holdings[ticker];
                    // Update holding object with current price for display
                    const displayHolding = {
                        ...holding,
                        currentPrice: this.cachedPrices.get(ticker) || holding.currentPrice || holding.avgPrice
                    };
                    const holdingEl = getHoldingElementTemplate(ticker, displayHolding);
                    holdingsList.innerHTML += holdingEl;
                }
            }
        }
    }

    async loadRecentTrades() {
        console.log("Loading recent trades for simulation:", this.view.simulationId);
        console.log("Current portfolio trades:", this.simulationPortfolio?.trades);
        
        const tradesContainer = document.getElementById("sim-recent-trades-container");
        if (!tradesContainer) {
            console.log("ERROR: sim-recent-trades-container not found!");
            return;
        }

        const tradesLoading = document.getElementById("sim-trades-loading");
        const tradesEmpty = document.getElementById("sim-trades-empty");
        const tradesList = document.getElementById("sim-trades-list");

        // NOW you can safely use the variables:
        console.log("Trades length:", this.simulationPortfolio?.trades?.length);
        console.log(`Found ${this.simulationPortfolio.trades.length} trades`);
        console.log("tradesEmpty element:", tradesEmpty);
        console.log("tradesList element:", tradesList);

        if (tradesLoading) tradesLoading.classList.add("hidden");

        if (!this.simulationPortfolio?.trades || this.simulationPortfolio.trades.length === 0) {
            console.log("No trades found, showing empty state");
            if (tradesEmpty) tradesEmpty.classList.remove("hidden");
            if (tradesList) tradesList.classList.add("hidden");
            return;
        }

        console.log(`Found ${this.simulationPortfolio.trades.length} trades`);
        if (tradesEmpty) tradesEmpty.classList.add("hidden");
        if (tradesList) {
            tradesList.classList.remove("hidden");
            tradesList.innerHTML = "";

            // Sort trades by timestamp (most recent first)
            const sortedTrades = [...this.simulationPortfolio.trades].sort((a, b) => {
                const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return dateB - dateA;
            });

            // Show only recent trades (e.g., last 10)
            const recentTrades = sortedTrades.slice(0, 10);
            console.log("Displaying recent trades:", recentTrades);

            recentTrades.forEach(trade => {
                const tradeConfig = TRADE_TYPE_CONFIG[trade.type] || TRADE_TYPE_CONFIG.buy;
                const tradeEl = getTradeElementTemplate(trade, tradeConfig);
                tradesList.innerHTML += tradeEl;
            });
        }
    }

    showPortfolioError() {
        const errorContent = getPortfolioErrorTemplate();
        updateElementHTML("sim-holdings-container", errorContent);
        updateElementHTML("sim-recent-trades-container", errorContent);
    }

    // Method to refresh portfolio data
    async refreshPortfolioData() {
        await this.loadSimulationPortfolio();
    }

    // Method to get current portfolio value for external use
    async getCurrentPortfolioValue() {
        if (!this.simulationPortfolio) return 0;
        const portfolioValue = await this.calculateTotalPortfolioValue();
        return portfolioValue.totalValue;
    }
}