// src/components/simulation/SimulationPortfolioManager.js
// Portfolio management for simulation view - extracted from simulation.js

import { getPortfolio, initializePortfolio, getRecentTrades } from "../../services/trading.js";
import { TRADE_TYPE_CONFIG } from "../../constants/trade-types.js";
import { formatCurrencyWithCommas, formatPortfolioChange } from "../../utils/currency-utils.js";
import {
    setUIState,
    createElement,
    clearElement,
    appendChild,
    hideElement,
    updateElementHTML
} from "../../utils/dom-utils.js";
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
        if (!this.simulationPortfolio || !this.simulationPortfolio.holdings) {
            setUIState({
                loadingId: "sim-holdings-loading",
                contentId: "sim-holdings-list",
                emptyId: "sim-holdings-empty"
            }, "empty");
            return;
        }

        const holdings = this.simulationPortfolio.holdings;
        
        if (Object.keys(holdings).length === 0) {
            setUIState({
                loadingId: "sim-holdings-loading",
                contentId: "sim-holdings-list",
                emptyId: "sim-holdings-empty"
            }, "empty");
        } else {
            setUIState({
                loadingId: "sim-holdings-loading",
                contentId: "sim-holdings-list",
                emptyId: "sim-holdings-empty"
            }, "content");
            
            clearElement("sim-holdings-list");
            
            for (const ticker in holdings) {
                const holding = holdings[ticker];
                const holdingElement = this.createHoldingElement(ticker, holding);
                appendChild("sim-holdings-list", holdingElement);
            }
        }
    }

    createHoldingElement(ticker, holding) {
        return createElement(
            "div", 
            "bg-gray-700 p-4 rounded-lg flex justify-between items-center",
            getHoldingElementTemplate(ticker, holding),
            true // useInnerHTML
        );
    }

    async loadRecentTrades() {
        try {
            const trades = await getRecentTrades(this.view.currentUser.uid, 5, this.view.simulationId);
            
            hideElement("sim-trades-loading");
            
            if (trades.length === 0) {
                setUIState({
                    loadingId: "sim-trades-loading",
                    contentId: "sim-trades-list",
                    emptyId: "sim-trades-empty"
                }, "empty");
            } else {
                setUIState({
                    loadingId: "sim-trades-loading",
                    contentId: "sim-trades-list",
                    emptyId: "sim-trades-empty"
                }, "content");
                
                clearElement("sim-trades-list");
                
                trades.forEach(trade => {
                    const tradeElement = this.createTradeElement(trade);
                    appendChild("sim-trades-list", tradeElement);
                });
            }
        } catch (error) {
            console.error("Error loading recent trades:", error);
            setUIState({
                loadingId: "sim-trades-loading",
                contentId: "sim-trades-list",
                emptyId: "sim-trades-empty"
            }, "empty");
        }
    }

    createTradeElement(trade) {
        const tradeConfig = TRADE_TYPE_CONFIG[trade.type];
        return createElement(
            "div", 
            "bg-gray-700 p-4 rounded-lg flex justify-between items-center",
            getTradeElementTemplate(trade, tradeConfig),
            true // useInnerHTML
        );
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
                const formatted = formatPortfolioChange(change, changePercent);
                portfolioChangeEl.textContent = formatted.display;
                portfolioChangeEl.className = `text-sm font-medium ${formatted.colorClass}`;
            }
        }
    }

    showPortfolioError() {
        const errorContent = getPortfolioErrorTemplate();
        updateElementHTML("sim-holdings-container", errorContent);
        updateElementHTML("sim-trades-container", errorContent);
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