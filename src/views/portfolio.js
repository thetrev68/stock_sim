// file: src/views/portfolio.js
// Enhanced Portfolio view with UI polish - Session 5

// Services
import { getPortfolio, getRecentTrades } from "../services/trading.js";
import { AuthService } from "../services/auth.js";
import { StockService } from "../services/stocks.js";

// Utilities
import { 
    formatCurrencyWithCommas,
    formatCashPercentage,
    formatPortfolioChange,
    calculateGainLoss,
    calculateMarketValue,
    calculateCostBasis
} from "../utils/currency-utils.js";
import { calculateComprehensiveGains } from "../utils/math-utils.js";

// Portfolio Templates
import { getMainPortfolioLayoutTemplate } from "../templates/portfolio/portfolio-main-layout.js";
import { 
    getHoldingLoadingRowTemplate,
    getHoldingRowTemplate,
    getHoldingErrorRowTemplate
} from "../templates/portfolio/portfolio-holdings.js";
import { getTradeHistoryRowTemplate } from "../templates/portfolio/portfolio-trade-history.js";
import { getPortfolioErrorTemplate } from "../templates/portfolio/portfolio-errors.js";
import { 
    createGainsSummarySection, 
    updateGainsSummary,
    setupGainsEventListeners 
} from "../templates/gains-templates.js";

export default class PortfolioView {
    constructor() {
        this.name = "portfolio";
        this.authService = new AuthService();
        this.stockService = new StockService();
        this.viewContainer = null;
        this.currentPortfolio = null;
        this.allTrades = [];
        this.sortOrder = { field: "date", direction: "desc" };
        this.gainsData = null;
    }

    // ADD THE MISSING RENDER METHOD
    async render(container) {
        container.innerHTML = this.getTemplate();
        
        this.viewContainer = container;
        this.attachEventListeners(container);
        
        // Setup gains event listeners
        setupGainsEventListeners();
        
        setTimeout(async () => {
            await this.loadData();
            // Calculate and display gains after data loads
            await this.calculateAndDisplayGains();
        }, 0); 
    }

    // UPDATED: Fix the gains calculation method
    async calculateAndDisplayGains() {
        try {
            // Make sure we have the required data
            if (!this.currentPortfolio || !this.allTrades) {
                console.warn("Portfolio or trades data not available for gains calculation");
                return;
            }

            const holdings = this.currentPortfolio.holdings || {};
            const currentPrices = {};
            
            // Get current prices for all holdings
            for (const ticker of Object.keys(holdings)) {
                try {
                    // Use your existing stock service method
                    const quote = await this.stockService.getQuote(ticker);
                    currentPrices[ticker] = quote || holdings[ticker].avgPrice;
                } catch (error) {
                    console.warn(`Could not get current price for ${ticker}:`, error);
                    currentPrices[ticker] = holdings[ticker].avgPrice;
                }
            }

            // Calculate comprehensive gains
            const gainsData = calculateComprehensiveGains(holdings, currentPrices, this.allTrades);
            
            // Update the gains display
            updateGainsSummary(gainsData);
            
            // Store for later use
            this.gainsData = gainsData;
            
        } catch (error) {
            console.error("Error calculating gains:", error);
            // Optionally show error state in gains section
            this.showGainsError();
        }
    }

    // Keep your existing showGainsError method
    showGainsError() {
        const totalGainsEl = document.getElementById("total-gains");
        const realizedEl = document.getElementById("realized-gains");
        const unrealizedEl = document.getElementById("unrealized-gains");
        
        if (totalGainsEl) totalGainsEl.textContent = "Error loading";
        if (realizedEl) realizedEl.textContent = "Error loading";
        if (unrealizedEl) unrealizedEl.textContent = "Error loading";
    }

    // UPDATED: Modify getTemplate to include gains section
    getTemplate() {
        const originalTemplate = getMainPortfolioLayoutTemplate();
        const gainsSection = createGainsSummarySection();
        
        // Insert gains section after the portfolio summary section
        // Look for the end of the first section and insert gains section
        return originalTemplate.replace(
            /(<\/section>)/, // Find the first closing section tag
            `$1${gainsSection}` // Replace it with itself plus the gains section
        );
    }

    attachEventListeners(container) {
        // Navigation buttons
        const makeTradeButtons = container.querySelectorAll("[data-navigate=\"/trade\"]");
        makeTradeButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Navigating to trade page...");
            });
        });

        // Refresh prices button
        const refreshBtn = container.querySelector("#refresh-prices-btn");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                this.refreshPrices();
            });
        }

        // Trade filter buttons
        const filterButtons = container.querySelectorAll(".filter-btn");
        filterButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        // Sort dropdown
        const sortSelect = container.querySelector("#sort-trades");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => {
                this.handleSortChange(e.target.value);
            });
        }
    }

    async loadData() {
        console.log("Loading portfolio data...");
        const user = this.authService.getCurrentUser();
        if (!user) {
            console.log("No user signed in for portfolio.");
            return;
        }

        try {
            const userId = user.uid;
            this.currentPortfolio = await getPortfolio(userId);
            this.allTrades = await getRecentTrades(userId, 100); // Get more trades for filtering

            if (this.currentPortfolio) {
                // Update basic stats first
                this.updateBasicStats();
                
                // Load holdings with live prices
                await this.loadHoldingsWithLivePrices();

                // Load and display trade history
                this.displayTrades();

            } else {
                this.showDefaultState();
            }
        } catch (error) {
            console.error("Error loading portfolio data:", error);
            this.showErrorState();
        }
    }

    updateBasicStats() {
        const availableCashEl = this.viewContainer.querySelector("#available-cash");
        if (availableCashEl) availableCashEl.textContent = formatCurrencyWithCommas(this.currentPortfolio.cash);

        const totalTradesEl = this.viewContainer.querySelector("#total-trades");
        if (totalTradesEl) totalTradesEl.textContent = this.allTrades.length;

        // Calculate total trade volume
        const totalVolume = this.allTrades.reduce((sum, trade) => sum + trade.tradeCost, 0);
        const tradeVolumeEl = this.viewContainer.querySelector("#trade-volume");
        if (tradeVolumeEl) tradeVolumeEl.textContent = `$${totalVolume.toFixed(0)} volume`;
    }

    async loadHoldingsWithLivePrices() {
        const holdings = this.currentPortfolio.holdings || {};
        const holdingsTbody = this.viewContainer.querySelector("#holdings-tbody");
        const noHoldingsMessage = this.viewContainer.querySelector("#no-holdings-message");
        const holdingsTableContainer = this.viewContainer.querySelector("#holdings-table-container");

        if (holdingsTbody) holdingsTbody.innerHTML = "";

        if (Object.keys(holdings).length === 0) {
            if (noHoldingsMessage) noHoldingsMessage.classList.remove("hidden");
            if (holdingsTableContainer) holdingsTableContainer.classList.add("hidden");
            this.updatePortfolioSummary(0);
            return;
        }

        // Show table, hide no holdings message
        if (noHoldingsMessage) noHoldingsMessage.classList.add("hidden");
        if (holdingsTableContainer) holdingsTableContainer.classList.remove("hidden");

        let totalHoldingsValue = 0;
        const holdingsCount = Object.keys(holdings).length;

        // Update holdings count
        const holdingsCountEl = this.viewContainer.querySelector("#holdings-count");
        if (holdingsCountEl) holdingsCountEl.textContent = `${holdingsCount} position${holdingsCount !== 1 ? "s" : ""}`;

        // Process each holding with live price lookup
        for (const ticker in holdings) {
            if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                const holding = holdings[ticker];
                
                // Show loading row first
                const loadingRow = getHoldingLoadingRowTemplate(ticker, holding);
                if (holdingsTbody) holdingsTbody.innerHTML += loadingRow;

                try {
                    // Get live price
                    const currentPrice = await this.stockService.getQuote(ticker);
                    const finalPrice = currentPrice !== null ? currentPrice : holding.avgPrice;
                    
                    const marketValue = calculateMarketValue(holding.quantity, finalPrice);
                    totalHoldingsValue += marketValue;

                    const costBasis = calculateCostBasis(holding.quantity, holding.avgPrice);
                    const gainLossData = calculateGainLoss(marketValue, costBasis);
                    // const gainLossFormatted = formatGainLoss(gainLossData.amount, gainLossData.percentage);

                    // Update the row with real data
                    const updatedRow = getHoldingRowTemplate(ticker, holding, finalPrice);

                    // Replace loading row
                    const existingRow = document.getElementById(`holding-${ticker}`);
                    if (existingRow) {
                        existingRow.outerHTML = updatedRow;
                    }
                } catch (error) {
                    console.error(`Error loading price for ${ticker}:`, error);
                    // Fallback to average price if API fails
                    const marketValue = calculateMarketValue(holding.quantity, holding.avgPrice);
                    totalHoldingsValue += marketValue;

                    const errorRow = getHoldingErrorRowTemplate(ticker, holding);

                    // Replace loading row with error row
                    const existingRow = document.getElementById(`holding-${ticker}`);
                    if (existingRow) {
                        existingRow.outerHTML = errorRow;
                    }
                }
            }
        }

        // Update portfolio summary with final totals
        this.updatePortfolioSummary(totalHoldingsValue);
    }

    updatePortfolioSummary(totalHoldingsValue) {
        const stockHoldingsValueEl = this.viewContainer.querySelector("#stock-holdings-value");
        if (stockHoldingsValueEl) stockHoldingsValueEl.textContent = formatCurrencyWithCommas(totalHoldingsValue);

        const portfolioValueEl = this.viewContainer.querySelector("#portfolio-value");
        const totalValue = this.currentPortfolio.cash + totalHoldingsValue;
        if (portfolioValueEl) {
            portfolioValueEl.textContent = formatCurrencyWithCommas(totalValue);
        }

        // Calculate portfolio change vs starting balance (assuming $10,000 start)
        const startingBalance = 10000;
        const gainLossData = calculateGainLoss(totalValue, startingBalance);
        const changeFormatted = formatPortfolioChange(gainLossData.amount, gainLossData.percentage);
        
        const portfolioChangeEl = this.viewContainer.querySelector("#portfolio-change");
        if (portfolioChangeEl) {
            portfolioChangeEl.className = `text-sm font-medium ${changeFormatted.colorClass}`;
            portfolioChangeEl.textContent = changeFormatted.display;
        }

        // Calculate cash percentage
        const _cashPercentage = (this.currentPortfolio.cash / totalValue * 100);
        const cashPercentageEl = this.viewContainer.querySelector("#cash-percentage");
        if (cashPercentageEl) {
            cashPercentageEl.textContent = `${formatCashPercentage(this.currentPortfolio.cash, totalValue)} of portfolio`;
        }
    }

    displayTrades() {
        const tradesTbody = this.viewContainer.querySelector("#trades-tbody");
        const noTradesMessage = this.viewContainer.querySelector("#no-trades-message");
        const recentTradesTableContainer = this.viewContainer.querySelector("#recent-trades-table-container");

        if (tradesTbody) tradesTbody.innerHTML = "";

        if (this.allTrades.length > 0) {
            if (noTradesMessage) noTradesMessage.classList.add("hidden");
            if (recentTradesTableContainer) recentTradesTableContainer.classList.remove("hidden");
            
            // Sort and filter trades
            const filteredTrades = this.getFilteredAndSortedTrades();
            
            filteredTrades.forEach(trade => {
                const row = getTradeHistoryRowTemplate(trade);
                if (tradesTbody) tradesTbody.innerHTML += row;
            });
        } else {
            if (noTradesMessage) noTradesMessage.classList.remove("hidden");
            if (recentTradesTableContainer) recentTradesTableContainer.classList.add("hidden");
        }
    }

    getFilteredAndSortedTrades() {
        let trades = [...this.allTrades];
        
        // Apply filter
        const activeFilter = this.viewContainer.querySelector(".filter-btn.bg-cyan-600");
        if (activeFilter) {
            const filter = activeFilter.dataset.filter;
            if (filter !== "all") {
                trades = trades.filter(trade => trade.type === filter);
            }
        }
        
        // Apply sort
        const sortSelect = this.viewContainer.querySelector("#sort-trades");
        if (sortSelect) {
            const [field, direction] = sortSelect.value.split("-");
            
            trades.sort((a, b) => {
                let aVal, bVal;
                
                switch (field) {
                    case "date":
                        aVal = new Date(a.timestamp);
                        bVal = new Date(b.timestamp);
                        break;
                    case "ticker":
                        aVal = a.ticker.toLowerCase();
                        bVal = b.ticker.toLowerCase();
                        break;
                    case "amount":
                        aVal = a.tradeCost;
                        bVal = b.tradeCost;
                        break;
                    default:
                        return 0;
                }
                
                if (direction === "asc") {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        return trades;
    }

    handleFilterChange(filter) {
        // Update active filter button
        this.viewContainer.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("bg-cyan-600", "text-white");
            btn.classList.add("text-gray-300", "hover:text-white");
        });
        
        const activeBtn = this.viewContainer.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add("bg-cyan-600", "text-white");
            activeBtn.classList.remove("text-gray-300", "hover:text-white");
        }
        
        // Refresh trade display
        this.displayTrades();
    }

    handleSortChange(_sortValue) {
        // Refresh trade display with new sort
        this.displayTrades();
    }

    async refreshPrices() {
        const refreshBtn = this.viewContainer.querySelector("#refresh-prices-btn");
        const refreshText = this.viewContainer.querySelector("#refresh-text");
        const refreshLoading = this.viewContainer.querySelector("#refresh-loading");

        if (refreshText) refreshText.classList.add("hidden");
        if (refreshLoading) refreshLoading.classList.remove("hidden");
        if (refreshBtn) refreshBtn.disabled = true;

        try {
            // Clear cache to force fresh API calls
            this.stockService.clearCache();
            
            // Reload holdings with fresh prices
            await this.loadHoldingsWithLivePrices();
            
            // ADDED: Recalculate gains after price refresh
            await this.calculateAndDisplayGains();
            
            console.log("Prices refreshed successfully");
        } catch (error) {
            console.error("Error refreshing prices:", error);
        } finally {
            if (refreshText) refreshText.classList.remove("hidden");
            if (refreshLoading) refreshLoading.classList.add("hidden");
            if (refreshBtn) refreshBtn.disabled = false;
        }
    }

    showDefaultState() {
        const portfolioValueEl = this.viewContainer.querySelector("#portfolio-value");
        if (portfolioValueEl) portfolioValueEl.textContent = `$10,000`;
        
        const availableCashEl = this.viewContainer.querySelector("#available-cash");
        if (availableCashEl) availableCashEl.textContent = `$10,000`;
        
        const stockHoldingsValueEl = this.viewContainer.querySelector("#stock-holdings-value");
        if (stockHoldingsValueEl) stockHoldingsValueEl.textContent = `$0`;
        
        const totalTradesEl = this.viewContainer.querySelector("#total-trades");
        if (totalTradesEl) totalTradesEl.textContent = `0`;
        
        const portfolioChangeEl = this.viewContainer.querySelector("#portfolio-change");
        if (portfolioChangeEl) {
            portfolioChangeEl.className = "text-sm font-medium text-gray-400";
            portfolioChangeEl.textContent = "$0.00 (0.00%)";
        }
        
        const cashPercentageEl = this.viewContainer.querySelector("#cash-percentage");
        if (cashPercentageEl) cashPercentageEl.textContent = "100% of portfolio";
        
        const holdingsCountEl = this.viewContainer.querySelector("#holdings-count");
        if (holdingsCountEl) holdingsCountEl.textContent = "0 positions";
        
        const tradeVolumeEl = this.viewContainer.querySelector("#trade-volume");
        if (tradeVolumeEl) tradeVolumeEl.textContent = "$0 volume";
        
        const noHoldingsMessage = this.viewContainer.querySelector("#no-holdings-message");
        if (noHoldingsMessage) noHoldingsMessage.classList.remove("hidden");
        
        const holdingsTableContainer = this.viewContainer.querySelector("#holdings-table-container");
        if (holdingsTableContainer) holdingsTableContainer.classList.add("hidden");
        
        const noTradesMessage = this.viewContainer.querySelector("#no-trades-message");
        if (noTradesMessage) noTradesMessage.classList.remove("hidden");
        
        const recentTradesTableContainer = this.viewContainer.querySelector("#recent-trades-table-container");
        if (recentTradesTableContainer) recentTradesTableContainer.classList.add("hidden");
    }

    showErrorState() {
        if (this.viewContainer) {
            this.viewContainer.innerHTML = getPortfolioErrorTemplate();
        }
    }
}