// file: src/views/trade.js
// Enhanced Trade view with simulation support - Session 7 + Research Integration - Session 10

// Services
import { StockService } from "../services/stocks.js";
import { initializePortfolio, getPortfolio, executeTrade, getRecentTrades, getUserPortfolios } from "../services/trading.js";
import { SimulationService } from "../services/simulation.js";
import { AuthService } from "../services/auth.js";

// Constants
import { TRADE_TYPES } from "../constants/trade-types.js";
import { INFO_MESSAGES } from "../constants/ui-messages.js";

// Utils
import { 
    formatPrice,
    formatCurrencyWithCommas,
    getTradeTypeColorClass
} from "../utils/currency-utils.js";

// Templates
import { getMainTradeLayoutTemplate } from "../templates/trade/trade-main-layout.js";
import { 
    getNoRecentTradesTemplate,
    getTradeItemTemplate
} from "../templates/trade/trade-recent-trades.js";

export default class TradeView {
    constructor() {
        this.name = "trade";
        this.authService = new AuthService();
        this.stockService = new StockService();
        this.simulationService = new SimulationService();
        this.currentUser = null;
        this.currentStockPrice = 0;
        this.currentPortfolio = null;
        this.userPortfolios = [];
        this.activePortfolioContext = null; // { type: 'solo'|'simulation', simulationId: null|string, simulation: object|null }
        this.viewContainer = null;
    }

    async render(container) {
        // Check for simulation context from URL
        const urlParams = new URLSearchParams(window.location.search);
        const simulationId = urlParams.get("sim");
        
        container.innerHTML = getMainTradeLayoutTemplate();
        this.viewContainer = container;
        this.attachEventListeners(container);
        
        setTimeout(async () => {
            await this.loadInitialData(simulationId);
        }, 0);
    }

    attachEventListeners(container) {
        const tickerInput = container.querySelector("#ticker");
        const quantityInput = container.querySelector("#quantity");
        const buyBtn = container.querySelector("#buy-btn");
        const sellBtn = container.querySelector("#sell-btn");
        const researchBtn = container.querySelector("#research-stock-btn");
        const portfolioSelector = container.querySelector("#portfolio-selector");

        // Portfolio context switching
        portfolioSelector.addEventListener("change", this.handlePortfolioSwitch.bind(this));

        // Trade form inputs
        tickerInput.addEventListener("input", this.updatePriceAndCost.bind(this));
        quantityInput.addEventListener("input", this.updatePriceAndCost.bind(this));
        
        // Trade buttons
        buyBtn.addEventListener("click", () => this.handleTrade(TRADE_TYPES.BUY));
        sellBtn.addEventListener("click", () => this.handleTrade(TRADE_TYPES.SELL));
        
        // Research button
        researchBtn.addEventListener("click", this.handleResearchStock.bind(this));
        
        // Enable research button when ticker is entered
        tickerInput.addEventListener("input", () => {
            const ticker = tickerInput.value.trim();
            if (researchBtn) {
                researchBtn.disabled = !ticker;
            }
        });
    }

    async loadInitialData(requestedSimulationId = null) {
        this.currentUser = this.authService.getCurrentUser();
        if (!this.currentUser) {
            this.showFeedback("Please sign in to make trades.", "text-yellow-400");
            return;
        }

        try {
            // Initialize services
            this.simulationService.initialize();

            // Load all user portfolios
            this.userPortfolios = await getUserPortfolios(this.currentUser.uid);
            console.log("Loaded user portfolios:", this.userPortfolios);

            // If no portfolios exist yet, we need to initialize at least the simulation ones
            if (requestedSimulationId && !this.userPortfolios.find(p => p.simulationId === requestedSimulationId)) {
                console.log("Requested simulation portfolio not found, initializing...");
                await this.initializeSimulationPortfolio(requestedSimulationId);
                // Reload portfolios after initialization
                this.userPortfolios = await getUserPortfolios(this.currentUser.uid);
                console.log("Reloaded portfolios after initialization:", this.userPortfolios);
            }

            // Populate portfolio selector
            this.populatePortfolioSelector();

            // Set initial context
            if (requestedSimulationId) {
                // Try to switch to requested simulation
                const simPortfolio = this.userPortfolios.find(p => p.simulationId === requestedSimulationId);
                if (simPortfolio) {
                    await this.switchToPortfolio(requestedSimulationId);
                } else {
                    // Simulation not found, initialize it
                    await this.initializeSimulationPortfolio(requestedSimulationId);
                }
            } else {
                // Default to solo portfolio
                await this.switchToPortfolio(null);
            }

            // Check for pre-filled ticker from URL (e.g., from research page)
            const urlParams = new URLSearchParams(window.location.search);
            const prefilledTicker = urlParams.get("ticker");
            
            if (prefilledTicker) {
                this.prefillTickerFromResearch(prefilledTicker);
            }

        } catch (error) {
            console.error("Error loading initial trade data:", error);
            this.showFeedback("Failed to load trading data. Please try again.", "text-red-400");
        }
    }

    // New method for pre-filling ticker from research
    prefillTickerFromResearch(ticker) {
        const tickerInput = this.viewContainer.querySelector("#ticker");
        const quantityInput = this.viewContainer.querySelector("#quantity");
        const researchBtn = this.viewContainer.querySelector("#research-stock-btn");
        
        if (tickerInput) {
            tickerInput.value = ticker.toUpperCase();
            
            // Enable research button
            if (researchBtn) {
                researchBtn.disabled = false;
            }
            
            // Focus on quantity field for better UX
            if (quantityInput) {
                quantityInput.focus();
            }
            
            // Automatically fetch price preview
            setTimeout(() => {
                this.updatePriceAndCost();
            }, 500);
            
            // Show helpful message
            this.showFeedback(`Ready to trade ${ticker.toUpperCase()}! Enter quantity to continue.`, "text-cyan-400");
        }
    }

    handleResearchStock() {
        const tickerInput = this.viewContainer.querySelector("#ticker");
        const ticker = tickerInput?.value.trim();
        
        if (!ticker) {
            this.showFeedback("Please enter a ticker symbol first.", "text-yellow-400");
            return;
        }
        
        // Navigate to research page with the ticker
        const researchUrl = `/research?ticker=${ticker.toUpperCase()}`;
        
        if (window.app && window.app.router) {
            window.app.router.navigate(researchUrl);
        } else {
            window.location.href = researchUrl;
        }
    }

    populatePortfolioSelector() {
        const selector = this.viewContainer.querySelector("#portfolio-selector");
        if (!selector) return;

        selector.innerHTML = "";

        // Add solo portfolio option
        const soloOption = document.createElement("option");
        soloOption.value = "solo";
        soloOption.textContent = "Solo Practice Mode";
        selector.appendChild(soloOption);

        // Add simulation portfolio options with FRESH names
        this.userPortfolios.forEach(portfolio => {
            if (portfolio.type === "simulation" && portfolio.simulationId) {
                const option = document.createElement("option");
                option.value = portfolio.simulationId;
                // Use the updated simulationName from the portfolio document
                option.textContent = portfolio.simulationName || `Simulation ${portfolio.simulationId}`;
                selector.appendChild(option);
            }
        });

        console.log("Portfolio selector populated with:", this.userPortfolios.length, "portfolios");
        console.log("Simulation portfolios:", this.userPortfolios.filter(p => p.type === "simulation"));
    }

    async handlePortfolioSwitch() {
        const selector = this.viewContainer.querySelector("#portfolio-selector");
        const selectedValue = selector.value;

        if (selectedValue === "solo") {
            await this.switchToPortfolio(null);
        } else if (selectedValue) {
            await this.switchToPortfolio(selectedValue);
        }
    }

    async switchToPortfolio(simulationId) {
        try {
            this.showFeedback("Switching portfolio...", "text-cyan-400");

            // Get simulation info if needed
            let simulation = null;
            if (simulationId) {
                simulation = await this.simulationService.getSimulation(simulationId);
                if (!simulation) {
                    throw new Error("Simulation not found");
                }
            }

            // Initialize portfolio if needed
            const startingBalance = simulation ? simulation.startingBalance : 10000;
            await initializePortfolio(this.currentUser.uid, startingBalance, simulationId, simulation);

            // Load portfolio data
            this.currentPortfolio = await getPortfolio(this.currentUser.uid, simulationId);
            
            // Set active context
            this.activePortfolioContext = {
                type: simulationId ? "simulation" : "solo",
                simulationId: simulationId,
                simulation: simulation
            };

            // Update UI
            this.updateContextDisplay();
            this.updatePortfolioSummary();
            await this.updateRecentTrades();
            this.enableTradingForm();

            // Update URL if in simulation mode
            if (simulationId) {
                const newUrl = `${window.location.pathname}?sim=${simulationId}`;
                window.history.replaceState({}, "", newUrl);
            } else {
                window.history.replaceState({}, "", window.location.pathname);
            }

            // Update selector
            const selector = this.viewContainer.querySelector("#portfolio-selector");
            if (selector) {
                selector.value = simulationId || "solo";
            }

            this.showFeedback("");

        } catch (error) {
            console.error("Error switching portfolio:", error);
            this.showFeedback(`Failed to switch portfolio: ${error.message}`, "text-red-400");
        }
    }

    async initializeSimulationPortfolio(simulationId) {
        try {
            // Get simulation details
            const simulation = await this.simulationService.getSimulation(simulationId);
            if (!simulation) {
                throw new Error("Simulation not found");
            }

            // Check if user is a member
            const isMember = await this.simulationService.isUserMemberOfSimulation(simulationId, this.currentUser.uid);
            if (!isMember) {
                throw new Error("You are not a member of this simulation");
            }

            // Initialize portfolio with simulation starting balance
            await initializePortfolio(this.currentUser.uid, simulation.startingBalance, simulationId, simulation);

            // Reload portfolios and switch to this simulation
            this.userPortfolios = await getUserPortfolios(this.currentUser.uid);
            this.populatePortfolioSelector();
            await this.switchToPortfolio(simulationId);

        } catch (error) {
            console.error("Error initializing simulation portfolio:", error);
            this.showFeedback(`Failed to initialize simulation portfolio: ${error.message}`, "text-red-400");
            // Fall back to solo mode
            await this.switchToPortfolio(null);
        }
    }

    updateContextDisplay() {
        const contextInfo = this.viewContainer.querySelector("#context-info");
        const contextIndicator = this.viewContainer.querySelector("#context-indicator");
        const contextTitle = this.viewContainer.querySelector("#context-title");
        const contextDescription = this.viewContainer.querySelector("#context-description");

        if (!contextInfo || !this.activePortfolioContext) return;

        contextInfo.classList.remove("hidden");

        if (this.activePortfolioContext.type === "solo") {
            contextIndicator.className = "w-3 h-3 bg-cyan-400 rounded-full";
            contextTitle.textContent = "Solo Practice Mode";
            contextDescription.textContent = "Trade with your personal portfolio";
        } else {
            const simulation = this.activePortfolioContext.simulation;
            contextIndicator.className = "w-3 h-3 bg-purple-400 rounded-full";
            contextTitle.textContent = simulation.name;
            
            // Status-based description
            let description = "";
            if (simulation.status === "active") {
                const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
                const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
                description = `Active simulation • ${daysRemaining} days remaining`;
            } else if (simulation.status === "pending") {
                description = "Simulation starting soon";
            } else {
                description = "Simulation ended";
            }
            
            contextDescription.textContent = description;
        }
    }

    enableTradingForm() {
        const buyBtn = this.viewContainer.querySelector("#buy-btn");
        const sellBtn = this.viewContainer.querySelector("#sell-btn");
        
        if (buyBtn) buyBtn.disabled = false;
        if (sellBtn) sellBtn.disabled = false;
    }

    async updatePortfolioSummary() {
        if (!this.currentPortfolio || !this.viewContainer) return;

        const portfolioCashEl = this.viewContainer.querySelector("#portfolio-cash");
        if (portfolioCashEl) {
            portfolioCashEl.textContent = formatCurrencyWithCommas(this.currentPortfolio.cash);
        }
        
        // Calculate total holdings value with LIVE PRICES
        let totalHoldingsValue = 0;
        const holdings = this.currentPortfolio.holdings || {}; 
        
        for (const ticker in holdings) {
            if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                const holding = holdings[ticker];
                
                try {
                    // ✅ Use live prices instead of mock prices
                    const currentPrice = await this.stockService.getQuote(ticker);
                    const finalPrice = currentPrice !== null ? currentPrice : holding.avgPrice;
                    totalHoldingsValue += holding.quantity * finalPrice;
                } catch (error) {
                    console.error(`Error getting live price for ${ticker}:`, error);
                    // Fallback to average price if API fails
                    totalHoldingsValue += holding.quantity * holding.avgPrice;
                }
            }
        }

        const portfolioValueEl = this.viewContainer.querySelector("#portfolio-value");
        if (portfolioValueEl) {
            portfolioValueEl.textContent = formatCurrencyWithCommas(this.currentPortfolio.cash + totalHoldingsValue);
        }
    }

    // REPLACE the updateRecentTrades() method with this:
    async updateRecentTrades() { 
        if (!this.currentUser || !this.viewContainer || !this.activePortfolioContext) return;
        
        const trades = await getRecentTrades(
            this.currentUser.uid, 
            10, 
            this.activePortfolioContext.simulationId
        ); 
        const tradeListContainer = this.viewContainer.querySelector("#recent-trades-list"); 
        
        if (!tradeListContainer) return;

        tradeListContainer.innerHTML = "";

        if (trades.length === 0) {
            tradeListContainer.innerHTML = getNoRecentTradesTemplate();
            return;
        }

        trades.forEach(trade => {
            const tradeTypeClass = getTradeTypeColorClass(trade.type);
            const tradeTime = new Date(trade.timestamp).toLocaleString();
            
            const tradeItemHTML = getTradeItemTemplate(trade, tradeTypeClass, tradeTime);
            tradeListContainer.insertAdjacentHTML("beforeend", tradeItemHTML);
        });
    }

    async updatePriceAndCost() {
        const ticker = document.getElementById("ticker").value.trim();
        const quantity = parseInt(document.getElementById("quantity").value, 10);
        const pricePreview = document.getElementById("price-preview");
        const currentPriceSpan = document.getElementById("current-price");
        const totalCostSpan = document.getElementById("total-cost");

        if (ticker && quantity > 0) {
            this.showFeedback("Fetching price...", "text-cyan-400");
            try {
                const price = await this.stockService.getQuote(ticker);
                if (price !== null) {
                    this.currentStockPrice = price;
                    const totalCost = price * quantity;
                    currentPriceSpan.textContent = formatPrice(price);
                    totalCostSpan.textContent = formatPrice(totalCost);
                    pricePreview.classList.remove("hidden");
                    this.showFeedback("");
                } else {
                    currentPriceSpan.textContent = "N/A";
                    totalCostSpan.textContent = "N/A";
                    pricePreview.classList.remove("hidden");
                    this.showFeedback("Could not fetch price for this ticker.", "text-yellow-400");
                }
            } catch (error) {
                console.error("Error fetching price:", error);
                currentPriceSpan.textContent = "Error";
                totalCostSpan.textContent = "Error";
                pricePreview.classList.remove("hidden");
                this.showFeedback("Error fetching price. Try again.", "text-red-400");
            }
        } else {
            pricePreview.classList.add("hidden");
            this.showFeedback("");
        }
    }

    async handleTrade(type) {
        const tickerInput = document.getElementById("ticker");
        const quantityInput = document.getElementById("quantity");
        const ticker = tickerInput.value.trim();
        const quantity = parseInt(quantityInput.value, 10);

        this.showFeedback(INFO_MESSAGES.PROCESSING_TRADE, "text-cyan-400");

        if (!this.currentUser) {
            this.showFeedback("You must be logged in to make trades.", "text-red-400");
            return;
        }

        if (!this.activePortfolioContext) {
            this.showFeedback("Please select a portfolio to trade with.", "text-red-400");
            return;
        }

        const currentPrice = this.currentStockPrice; 

        if (!ticker || isNaN(quantity) || quantity <= 0 || isNaN(currentPrice) || currentPrice <= 0) {
            this.showFeedback("Please enter a valid ticker and quantity, and ensure a price is available.", "text-red-400");
            return;
        }

        const tradeDetails = {
            ticker: ticker,
            quantity: quantity,
            price: currentPrice,
            type: type,
        };

        try {
            const result = await executeTrade(
                this.currentUser.uid, 
                tradeDetails, 
                this.activePortfolioContext.simulationId
            );
            
            if (result.success) {
                const contextMsg = this.activePortfolioContext.type === "solo" ? "in solo mode" : `in ${this.activePortfolioContext.simulation.name}`;
                this.showFeedback(`Trade successful! ${type.toUpperCase} ${quantity} shares of ${ticker.toUpperCase} ${contextMsg}.`, "text-green-400");
                
                // Clear form
                tickerInput.value = "";
                quantityInput.value = "";
                document.getElementById("price-preview").classList.add("hidden");
                this.currentStockPrice = 0;

                // Disable research button since ticker is cleared
                const researchBtn = this.viewContainer.querySelector("#research-stock-btn");
                if (researchBtn) {
                    researchBtn.disabled = true;
                }

                // Reload data
                this.currentPortfolio = await getPortfolio(this.currentUser.uid, this.activePortfolioContext.simulationId);
                this.updatePortfolioSummary();
                await this.updateRecentTrades();
            } else {
                this.showFeedback(`Trade failed: ${result.message}`, "text-red-400");
            }
        } catch (error) {
            console.error("Trade execution error:", error);
            this.showFeedback(`Trade failed: ${error.message}`, "text-red-400");
        } finally {
            setTimeout(() => {
                this.showFeedback("");
            }, 3000);
        }
    }

    showFeedback(message, className = "") { 
        const feedback = document.getElementById("trade-feedback");
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `mt-4 text-sm text-center ${className}`.trim(); 
        }
    }
}