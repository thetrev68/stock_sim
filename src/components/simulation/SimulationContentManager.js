// src/components/simulation/SimulationContentManager.js
// Consolidated manager for display, portfolio, and activity content
// Replaces: SimulationDisplayManager, SimulationPortfolioManager, SimulationActivityManager

import { SIMULATION_STATUS } from "../../constants/simulation-status.js";
import { TRADE_TYPE_CONFIG } from "../../constants/trade-types.js";
import { formatDateRange, calculateDaysRemaining } from "../../utils/date-utils.js";
import { formatCurrencyWithCommas, formatPortfolioChange } from "../../utils/currency-utils.js";
import { capitalize } from "../../utils/string-utils.js";
import { updateElementHTML } from "../../utils/dom-utils.js";
import { getPortfolio } from "../../services/trading.js";
import { StockService } from "../../services/stocks.js";

// Templates
import { getHoldingElementTemplate, getTradeElementTemplate } from "../../templates/simulation/portfolio-components.js";
import { getPortfolioErrorTemplate } from "../../templates/portfolio/portfolio-errors.js";
import { 
    getActivityElementTemplate, 
    getEmptyActivityFeedTemplate 
} from "../../templates/simulation/activity-components.js";
import { getActivitiesErrorTemplate } from "../../templates/simulation/error-states.js";

/**
 * SimulationContentManager
 * 
 * Consolidates display, portfolio, and activity management into one focused class.
 * This replaces SimulationDisplayManager, SimulationPortfolioManager, and SimulationActivityManager
 * to eliminate code duplication and provide a cleaner separation of concerns.
 * 
 * Key responsibilities:
 * - Basic simulation info display (header, status, dates)
 * - Portfolio data loading and calculations with live prices
 * - Activity feed management and display
 * - Centralized error handling and loading states
 */
export class SimulationContentManager {
    constructor(simulationView) {
        // Core references
        this.view = simulationView;
        this.simulationService = simulationView.simulationService;
        this.activityService = simulationView.activityService;
        this.currentUser = simulationView.currentUser;
        this.simulationId = simulationView.simulationId;
        
        // Data storage
        this.currentSimulation = null;
        this.leaderboardData = null;
        this.simulationPortfolio = null;
        this.simulationActivities = [];
        
        // Services
        this.stockService = new StockService();
        this.cachedPrices = new Map();
    }

    // ===========================================
    // DISPLAY MANAGEMENT (from SimulationDisplayManager)
    // ===========================================

    /**
     * Update internal references to current data
     * Maintains backward compatibility with existing simulation.js calls
     */
    updateReferences(currentSimulation, currentUser, leaderboardData = null) {
        this.currentSimulation = currentSimulation;
        this.currentUser = currentUser;
        this.leaderboardData = leaderboardData;
    }

    /**
     * Main display update method - renders simulation header and basic info
     * Consolidated from SimulationDisplayManager.displaySimulation()
     */
    displaySimulation() {
        // Handle loading states
        const loadingEl = document.getElementById("simulation-loading");
        const contentEl = document.getElementById("simulation-content");
        
        if (loadingEl) loadingEl.classList.add("hidden");
        if (contentEl) contentEl.classList.remove("hidden");

        if (!this.currentSimulation) {
            console.log("No currentSimulation data available for display");
            return;
        }

        console.log("displaySimulation called with simulation:", {
            id: this.currentSimulation.id,
            name: this.currentSimulation.name,
            endDate: this.currentSimulation.endDate,
            inviteCode: this.currentSimulation.inviteCode
        });

        // Update all display elements
        this.updateHeaderElements();
        this.updateStatusElements();
        this.updateMetricElements();
        this.updateSimulationRules();
        this.updateTradeButton();
        
        // FIXED: Handle invite code directly like the original (not in updateSimulationRules)
        const inviteCodeEl = document.getElementById("sim-invite-code");
        if (inviteCodeEl && this.currentSimulation.inviteCode) {
            console.log("Setting invite code directly to:", this.currentSimulation.inviteCode);
            inviteCodeEl.textContent = this.currentSimulation.inviteCode;
        }
        
        console.log("Simulation displayed:", this.currentSimulation);
    }

    /**
     * Updates simulation header (name, description)
     */
    updateHeaderElements() {
        const nameEl = document.getElementById("sim-name");
        const descEl = document.getElementById("sim-description");

        if (nameEl) nameEl.textContent = this.currentSimulation.name;
        
        if (descEl) {
            if (this.currentSimulation.description) {
                descEl.textContent = this.currentSimulation.description;
                descEl.style.display = "block";
            } else {
                descEl.style.display = "none";
            }
        }
    }

    /**
     * Updates status badge and related elements
     */
    updateStatusElements() {
        const statusEl = document.getElementById("sim-status");
        const statusBadge = document.getElementById("sim-status-badge");

        const status = this.currentSimulation.status || "Active";
        const statusText = capitalize(status);

        if (statusEl) {
            statusEl.textContent = statusText;
            const statusClass = status === SIMULATION_STATUS.ACTIVE ? "bg-green-600 text-white" :
                               status === SIMULATION_STATUS.PENDING ? "bg-yellow-600 text-white" :
                               "bg-gray-600 text-white";
            statusEl.className = `px-3 py-1 rounded-full text-sm font-medium ${statusClass}`;
        }

        if (statusBadge) {
            statusBadge.textContent = statusText;
        }
    }

    /**
     * Updates metrics like participants count, duration, etc.
     */
    updateMetricElements() {
        console.log("updateMetricElements called");
        
        const participantsEl = document.getElementById("sim-participants");
        const durationEl = document.getElementById("sim-duration");
        const daysRemainingEl = document.getElementById("days-remaining"); // Original element ID

        console.log("Elements found:", {
            duration: !!durationEl,
            daysRemaining: !!daysRemainingEl,
            participants: !!participantsEl
        });

        // Participants - from original: `${this.currentSimulation.memberCount}/${this.currentSimulation.maxMembers} participants`
        if (participantsEl) {
            const memberCount = this.currentSimulation.memberCount || 0;
            const maxMembers = this.currentSimulation.maxMembers || 0;
            participantsEl.textContent = `${memberCount}/${maxMembers} participants`;
        }

        // Duration - from original: formatDateRange(this.currentSimulation.startDate, this.currentSimulation.endDate)
        if (durationEl) {
            const dateRange = formatDateRange(this.currentSimulation.startDate, this.currentSimulation.endDate);
            console.log("Setting duration (date range only) to:", dateRange);
            durationEl.textContent = dateRange;
        }

        // Days Remaining - from original: calculateDaysRemaining(this.currentSimulation.endDate)
        if (daysRemainingEl) {
            const diffDays = calculateDaysRemaining(this.currentSimulation.endDate);
            console.log("Setting days remaining to:", diffDays);
            daysRemainingEl.textContent = diffDays;
        }

        console.log("Days remaining calculation debug:", {
            endDate: this.currentSimulation.endDate,
            endDateConverted: this.currentSimulation.endDate.toDate ? this.currentSimulation.endDate.toDate() : new Date(this.currentSimulation.endDate),
            now: new Date(),
            daysLeft: calculateDaysRemaining(this.currentSimulation.endDate)
        });
    }

    /**
     * Updates simulation rules display (starting balance, etc.)
     * This was missing from the original consolidation - from SimulationDisplayManager.updateSimulationRules()
     */
    updateSimulationRules() {
        const startingBalanceEl = document.getElementById("sim-starting-balance");
        const shortSellingEl = document.getElementById("sim-short-selling");
        const tradingHoursEl = document.getElementById("sim-trading-hours");
        const commissionEl = document.getElementById("sim-commission");

        if (startingBalanceEl) {
            startingBalanceEl.textContent = formatCurrencyWithCommas(this.currentSimulation.startingBalance || 10000);
        }

        if (shortSellingEl) {
            shortSellingEl.textContent = this.currentSimulation.rules?.allowShortSelling ? "Allowed" : "Not Allowed";
        }

        if (tradingHoursEl) {
            const hours = this.currentSimulation.rules?.tradingHours === "24/7" ? 
                "24/7 Trading" : "Market Hours Only";
            tradingHoursEl.textContent = hours;
        }

        if (commissionEl) {
            const commission = this.currentSimulation.rules?.commission || 0;
            commissionEl.textContent = commission > 0 ? `${commission} per trade` : "Commission-free";
        }
    }

    /**
     * Updates trade button functionality
     * From SimulationDisplayManager.displaySimulation()
     */
    updateTradeButton() {
        const tradeBtnTextEl = document.getElementById("trade-btn-text");
        const tradeBtn = document.getElementById("trade-now-btn");

        if (tradeBtnTextEl) {
            const isActive = this.currentSimulation.status === SIMULATION_STATUS.ACTIVE;
            tradeBtnTextEl.textContent = isActive ? "Make Trade" : "View Only";
        }

        if (tradeBtn) {
            // Remove existing listener to prevent duplicates
            tradeBtn.replaceWith(tradeBtn.cloneNode(true));
            const newTradeBtn = document.getElementById("trade-now-btn");
            
            newTradeBtn.addEventListener("click", () => {
                const tradeUrl = `/trade?sim=${this.currentSimulation.id}`;
                if (window.app && window.app.router) {
                    window.app.router.navigate(tradeUrl);
                } else {
                    window.location.href = tradeUrl;
                }
            });
        }
    }

    /**
     * Updates user rank display (maintains compatibility with existing calls)
     */
    updateUserRankDisplay() {
        // This method exists for backward compatibility
        // The actual rank display is handled by LeaderboardComponents
        console.log("User rank display updated");
    }

    // ===========================================
    // PORTFOLIO MANAGEMENT (from SimulationPortfolioManager)
    // ===========================================

    /**
     * Main portfolio loading method
     * Consolidated from SimulationPortfolioManager.loadSimulationPortfolio()
     */
    async loadSimulationPortfolio() {
        if (!this.currentUser || !this.simulationId) {
            console.error("Cannot load portfolio: missing user or simulation ID");
            this.showPortfolioError();
            return;
        }

        try {
            // Load portfolio data
            const portfolio = await getPortfolio(this.currentUser.uid, this.simulationId);
            if (!portfolio) {
                console.warn("No portfolio found for simulation");
                this.showPortfolioError();
                return;
            }

            this.simulationPortfolio = portfolio;
            console.log("Loaded simulation portfolio:", this.simulationPortfolio);

            // Fetch live prices and update displays
            await this.fetchLivePricesForHoldings();
            await this.updatePortfolioStats();
            this.loadHoldings();
            this.loadRecentTrades();

        } catch (error) {
            console.error("Error loading simulation portfolio:", error);
            this.showPortfolioError();
        }
    }

    /**
     * Fetches current market prices for all holdings
     */
    async fetchLivePricesForHoldings() {
        if (!this.simulationPortfolio?.holdings) return;

        const holdings = this.simulationPortfolio.holdings;
        this.cachedPrices.clear();

        // Fetch all prices in parallel
        const pricePromises = Object.keys(holdings).map(ticker =>
            this.stockService.getQuote(ticker)
                .then(price => {
                    if (price !== null && price !== undefined) {
                        this.cachedPrices.set(ticker, price);
                        holdings[ticker].currentPrice = price;
                    }
                })
                .catch(error => console.error(`Error fetching price for ${ticker}:`, error))
        );

        await Promise.all(pricePromises);
        console.log("Fetched live prices:", Object.fromEntries(this.cachedPrices));
    }

    /**
     * Updates portfolio statistics cards with current values
     */
    async updatePortfolioStats() {
        if (!this.simulationPortfolio) return;

        const portfolioValue = await this.calculateTotalPortfolioValue();
        this.updateStatsCards(portfolioValue);
    }

    /**
     * Calculates total portfolio value with live prices
     */
    async calculateTotalPortfolioValue() {
        if (!this.simulationPortfolio) return { totalValue: 0, cash: 0, holdingsValue: 0 };

        const cash = this.simulationPortfolio.cash || 0;
        let holdingsValue = 0;

        if (this.simulationPortfolio.holdings) {
            for (const [ticker, holding] of Object.entries(this.simulationPortfolio.holdings)) {
                const currentPrice = this.cachedPrices.get(ticker) || holding.currentPrice || holding.avgPrice || 0;
                const holdingValue = holding.quantity * currentPrice;
                holdingsValue += holdingValue;
            }
        }
        
        const totalValue = cash + holdingsValue;
        return { totalValue, cash, holdingsValue };
    }

    /**
     * Updates the stats cards in the UI
     */
    updateStatsCards(portfolioValue) {
        // Update main portfolio value card
        const portfolioValueCard = document.getElementById("portfolio-value");
        if (portfolioValueCard) {
            portfolioValueCard.textContent = formatCurrencyWithCommas(portfolioValue.totalValue);
        }

        // Update portfolio change
        const portfolioChangeCard = document.getElementById("portfolio-change");
        if (portfolioChangeCard && this.currentSimulation) {
            const startingBalance = this.currentSimulation.startingBalance || 10000;
            const change = portfolioValue.totalValue - startingBalance;
            const changePercent = (change / startingBalance * 100);
            
            const formatted = formatPortfolioChange(change, changePercent);
            portfolioChangeCard.textContent = formatted.display;
            portfolioChangeCard.className = `text-xs ${formatted.colorClass}`;
        }
    }

    /**
     * Displays holdings list with live prices
     * Maintains backward compatibility with existing loadHoldings() calls
     */
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
            for (const [ticker, holding] of Object.entries(this.simulationPortfolio.holdings)) {
                const displayHolding = {
                    ...holding,
                    currentPrice: this.cachedPrices.get(ticker) || holding.currentPrice || holding.avgPrice
                };
                const holdingEl = getHoldingElementTemplate(ticker, displayHolding);
                holdingsList.innerHTML += holdingEl;
            }
        }
    }

    /**
     * Displays recent trades
     * Maintains backward compatibility with existing loadRecentTrades() calls
     */
    loadRecentTrades() {
        const tradesContainer = document.getElementById("sim-recent-trades-container");
        if (!tradesContainer) return;

        const tradesLoading = document.getElementById("sim-trades-loading");
        const tradesEmpty = document.getElementById("sim-trades-empty");
        const tradesList = document.getElementById("sim-trades-list");

        if (tradesLoading) tradesLoading.classList.add("hidden");

        if (!this.simulationPortfolio?.trades || this.simulationPortfolio.trades.length === 0) {
            if (tradesEmpty) tradesEmpty.classList.remove("hidden");
            if (tradesList) tradesList.classList.add("hidden");
            return;
        }

        if (tradesEmpty) tradesEmpty.classList.add("hidden");
        if (tradesList) {
            tradesList.classList.remove("hidden");
            tradesList.innerHTML = "";

            // Sort and display recent trades
            const sortedTrades = [...this.simulationPortfolio.trades].sort((a, b) => {
                const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return dateB - dateA;
            });

            const recentTrades = sortedTrades.slice(0, 10);
            recentTrades.forEach(trade => {
                const tradeConfig = TRADE_TYPE_CONFIG[trade.type] || TRADE_TYPE_CONFIG.buy;
                const tradeEl = getTradeElementTemplate(trade, tradeConfig);
                tradesList.innerHTML += tradeEl;
            });
        }
    }

    /**
     * Shows portfolio error state
     */
    showPortfolioError() {
        const errorContent = getPortfolioErrorTemplate();
        updateElementHTML("sim-holdings-container", errorContent);
        updateElementHTML("sim-recent-trades-container", errorContent);
    }

    // ===========================================
    // ACTIVITY MANAGEMENT (from SimulationActivityManager)
    // ===========================================

    /**
     * Initialize activity manager (maintains backward compatibility)
     */
    initialize(simulationId) {
        this.simulationId = simulationId;
        this.simulationActivities = [];
    }

    /**
     * Load simulation activities
     * Consolidated from SimulationActivityManager.loadSimulationActivities()
     */
    async loadSimulationActivities() {
        try {
            this.simulationActivities = await this.activityService.getSimulationActivities(this.simulationId, 15);
            console.log("Loaded simulation activities:", this.simulationActivities);
            this.displayActivities();
        } catch (error) {
            console.error("Error loading simulation activities:", error);
            this.showActivitiesError();
        }
    }

    /**
     * Display activities in the activity feed
     * Consolidated from SimulationActivityManager.displayActivities()
     */
    displayActivities() {
        const activityFeed = document.getElementById("activity-feed");
        const activityLoading = document.getElementById("activity-loading");
        
        // Hide loading state and show activity feed
        if (activityLoading) activityLoading.classList.add("hidden");
        if (activityFeed) activityFeed.classList.remove("hidden");
        
        if (!activityFeed) return;

        if (this.simulationActivities.length === 0) {
            activityFeed.innerHTML = getEmptyActivityFeedTemplate();
        } else {
            activityFeed.innerHTML = "";
            this.simulationActivities.forEach(activity => {
                const activityElement = this.createActivityElement(activity);
                activityFeed.appendChild(activityElement);
            });
        }
    }

    /**
     * Create individual activity element
     * Consolidated from SimulationActivityManager.createActivityElement()
     */
    createActivityElement(activity) {
        const formattedActivity = this.activityService.formatActivity(activity);
        const element = document.createElement("div");
        element.className = "bg-gray-700 p-4 rounded-lg flex items-start gap-3";
        
        element.innerHTML = getActivityElementTemplate(formattedActivity);
        return element;
    }

    /**
     * Show activities error state
     */
    showActivitiesError() {
        const activityFeed = document.getElementById("activity-feed");
        if (activityFeed) {
            activityFeed.innerHTML = getActivitiesErrorTemplate();
        }
    }

    // ===========================================
    // UTILITY METHODS & BACKWARD COMPATIBILITY
    // ===========================================

    /**
     * Get current activities (for external access)
     */
    getActivities() {
        return this.simulationActivities;
    }

    /**
     * Get current portfolio value (for external use)
     */
    async getCurrentPortfolioValue() {
        if (!this.simulationPortfolio) return 0;
        const portfolioValue = await this.calculateTotalPortfolioValue();
        return portfolioValue.totalValue;
    }

    /**
     * Refresh all content data
     */
    async refreshContentData() {
        await Promise.all([
            this.loadSimulationPortfolio(),
            this.loadSimulationActivities()
        ]);
    }

    /**
     * Backward compatibility methods for simulation.js
     * These maintain the existing API so simulation.js doesn't need major changes
     */
    
    // From SimulationActivityManager
    async refreshActivities() {
        await this.loadSimulationActivities();
    }

    // From SimulationPortfolioManager  
    async refreshPortfolioData() {
        await this.loadSimulationPortfolio();
    }

    // Legacy method names for compatibility - createTradeElement and createHoldingElement
    createTradeElement(trade) {
        const tradeConfig = TRADE_TYPE_CONFIG[trade.type] || TRADE_TYPE_CONFIG.buy;
        return getTradeElementTemplate(trade, tradeConfig);
    }

    createHoldingElement(ticker, holding) {
        return getHoldingElementTemplate(ticker, holding);
    }
}