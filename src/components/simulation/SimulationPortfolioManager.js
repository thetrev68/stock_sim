// src/components/simulation/SimulationPortfolioManager.js
// Portfolio management for simulation view - extracted from simulation.js

import { getPortfolio, initializePortfolio, getRecentTrades } from "../../services/trading.js";
import { TRADE_TYPE_CONFIG } from "../../constants/trade-types.js";
import { formatCurrencyWithCommas } from "../../utils/currency-utils.js";
import { 
    getHoldingElementTemplate, 
    getTradeElementTemplate 
} from "../../templates/simulation/portfolio-components.js";
import { getPortfolioErrorTemplate } from "../../templates/simulation/error-states.js";

export class SimulationPortfolioManager {
    constructor(simulationView) {
        this.view = simulationView;
        this.simulationPortfolio = null;
    }

    async loadSimulationPortfolio() {
        try {
            // Initialize portfolio if it doesn't exist
            await initializePortfolio(
                this.view.currentUser.uid, 
                this.view.currentSimulation.startingBalance, 
                this.view.simulationId, 
                this.view.currentSimulation
            );

            // Load portfolio data
            this.simulationPortfolio = await getPortfolio(this.view.currentUser.uid, this.view.simulationId);
            
            // Update view's portfolio reference
            this.view.simulationPortfolio = this.simulationPortfolio;
            
            // Load UI components
            setTimeout(() => {
                this.loadHoldings();
                this.loadRecentTrades();
            }, 0);
            
        } catch (error) {
            console.error("Error loading simulation portfolio:", error);
            this.showPortfolioError();
        }
    }

    async loadHoldings() {
        const holdingsLoading = document.getElementById("sim-holdings-loading");
        const holdingsEmpty = document.getElementById("sim-holdings-empty");
        const holdingsList = document.getElementById("sim-holdings-list");

        if (!this.simulationPortfolio || !this.simulationPortfolio.holdings) {
            if (holdingsLoading) holdingsLoading.classList.add("hidden");
            if (holdingsEmpty) holdingsEmpty.classList.remove("hidden");
            if (holdingsList) holdingsList.classList.add("hidden");
            return;
        }

        const holdings = this.simulationPortfolio.holdings;
        
        if (Object.keys(holdings).length === 0) {
            if (holdingsLoading) holdingsLoading.classList.add("hidden");
            if (holdingsEmpty) holdingsEmpty.classList.remove("hidden");
            if (holdingsList) holdingsList.classList.add("hidden");
        } else {
            if (holdingsLoading) holdingsLoading.classList.add("hidden");
            if (holdingsEmpty) holdingsEmpty.classList.add("hidden");
            if (holdingsList) {
                holdingsList.classList.remove("hidden");
                holdingsList.innerHTML = "";

                for (const ticker in holdings) {
                    const holding = holdings[ticker];
                    const holdingElement = this.createHoldingElement(ticker, holding);
                    holdingsList.appendChild(holdingElement);
                }
            }
        }
    }

    createHoldingElement(ticker, holding) {
        const element = document.createElement("div");
        element.className = "bg-gray-700 p-4 rounded-lg flex justify-between items-center";
        
        element.innerHTML = getHoldingElementTemplate(ticker, holding);
        
        return element;
    }

    async loadRecentTrades() {
        const tradesLoading = document.getElementById("sim-trades-loading");
        const tradesEmpty = document.getElementById("sim-trades-empty");
        const tradesList = document.getElementById("sim-trades-list");

        try {
            const trades = await getRecentTrades(this.view.currentUser.uid, 5, this.view.simulationId);
            
            if (tradesLoading) tradesLoading.classList.add("hidden");
            
            if (trades.length === 0) {
                if (tradesEmpty) tradesEmpty.classList.remove("hidden");
                if (tradesList) tradesList.classList.add("hidden");
            } else {
                if (tradesEmpty) tradesEmpty.classList.add("hidden");
                if (tradesList) {
                    tradesList.classList.remove("hidden");
                    tradesList.innerHTML = "";

                    trades.forEach(trade => {
                        const tradeElement = this.createTradeElement(trade);
                        tradesList.appendChild(tradeElement);
                    });
                }
            }
        } catch (error) {
            console.error("Error loading recent trades:", error);
            if (tradesLoading) tradesLoading.classList.add("hidden");
            if (tradesEmpty) tradesEmpty.classList.remove("hidden");
        }
    }

    createTradeElement(trade) {
        const element = document.createElement("div");
        element.className = "bg-gray-700 p-4 rounded-lg flex justify-between items-center";
        
        const tradeConfig = TRADE_TYPE_CONFIG[trade.type];
        element.innerHTML = getTradeElementTemplate(trade, tradeConfig);
        
        return element;
    }

    updatePortfolioStats() {
        if (!this.simulationPortfolio) return;

        const portfolioValueEl = document.getElementById("sim-portfolio-value");
        const portfolioChangeEl = document.getElementById("sim-portfolio-change");
        
        if (portfolioValueEl) {
            const cash = this.simulationPortfolio.cash;
            let holdingsValue = 0;
            
            console.log("=== PORTFOLIO DEBUG ===");
            console.log("Cash:", cash);
            console.log("Holdings:", this.simulationPortfolio.holdings);
            
            const holdings = this.simulationPortfolio.holdings || {};
            for (const ticker in holdings) {
                if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                    const currentPrice = holdings[ticker].currentPrice || holdings[ticker].avgPrice;
                    const holdingValue = holdings[ticker].quantity * currentPrice;
                    holdingsValue += holdingValue;
                    
                    console.log(`${ticker}: ${holdings[ticker].quantity} shares @ $${currentPrice} = $${holdingValue}`);
                }
            }
            
            const totalValue = cash + holdingsValue;
            console.log("Total holdings value:", holdingsValue);
            console.log("Total portfolio value:", totalValue);
            console.log("========================");
            
            portfolioValueEl.textContent = formatCurrencyWithCommas(totalValue);
            
            if (portfolioChangeEl) {
                const startingBalance = this.view.currentSimulation.startingBalance;
                const change = totalValue - startingBalance;
                const changePercent = (change / startingBalance * 100);
                
                const changeClass = change >= 0 ? "text-green-400" : "text-red-400";
                portfolioChangeEl.className = `text-sm font-medium ${changeClass}`;
                portfolioChangeEl.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)`;
            }
        }
    }

    showPortfolioError() {
        const holdingsContainer = document.getElementById("sim-holdings-container");
        const tradesContainer = document.getElementById("sim-trades-container");
        
        const errorContent = getPortfolioErrorTemplate();
        
        if (holdingsContainer) holdingsContainer.innerHTML = errorContent;
        if (tradesContainer) tradesContainer.innerHTML = errorContent;
    }

    // Method to refresh portfolio data
    async refreshPortfolioData() {
        await this.loadSimulationPortfolio();
        this.updatePortfolioStats();
    }

    // Method to get current portfolio value for external use
    getCurrentPortfolioValue() {
        if (!this.simulationPortfolio) return 0;

        const cash = this.simulationPortfolio.cash;
        let holdingsValue = 0;
        
        const holdings = this.simulationPortfolio.holdings || {};
        for (const ticker in holdings) {
            if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                holdingsValue += holdings[ticker].quantity * holdings[ticker].avgPrice;
            }
        }
        
        return cash + holdingsValue;
    }
}