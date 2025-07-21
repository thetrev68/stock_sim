// src/views/research.js - Enhanced Research View - Session 10
/* global Chart */

// Core services and configuration
import { StockService } from "../services/stocks.js";
import { TIMEOUTS } from "../constants/app-config.js";
import { ERROR_MESSAGES } from "../constants/ui-messages.js";

// Utility functions
// import { toUpperCase } from "../utils/string-utils.js";

// Component managers
import { NewsManager } from "../components/research/NewsManager.js";
import { ChartManager } from "../components/research/ChartManager.js";
import { SearchManager } from "../components/research/SearchManager.js";
import { StockDataManager } from "../components/research/StockDataManager.js";

// Template modules
import { getMainResearchLayoutTemplate } from "../templates/research/research-main-layout.js";

export default class ResearchView {
    constructor() {
        this.name = "research";
        this.stockService = new StockService();
        this.viewContainer = null;
        this.currentStockData = null;
        this.chartManager = new ChartManager(this.stockService);
        this.searchManager = new SearchManager(this.stockService);
        this.newsManager = new NewsManager(this.stockService);
        this.stockDataManager = new StockDataManager();
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.viewContainer = container;
        this.attachEventListeners(container);
        
        // Load Chart.js dynamically
        await this.loadChartJS();
        
        // Check for pre-filled ticker from URL
        const urlParams = new URLSearchParams(window.location.search);
        const prefilledTicker = urlParams.get("ticker");
        
        if (prefilledTicker) {
            console.log(`Pre-filling research with ticker: ${prefilledTicker}`);
            // Set the input value
            const tickerInput = document.getElementById("research-ticker-input");
            if (tickerInput) {
                tickerInput.value = prefilledTicker.toUpperCase();
            }
            // Automatically research the stock
            setTimeout(() => {
                this.researchStock(prefilledTicker);
            }, 500);
        } else {
            // Show default state
            this.showDefaultState();
        }
    }

    async loadChartJS() {
        // Check if Chart.js is already loaded
        if (typeof Chart !== "undefined") {
            console.log("Chart.js already loaded");
            return;
        }

        return new Promise((resolve, _reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js";
            script.onload = () => {
                console.log("Chart.js loaded successfully");
                resolve();
            };
            script.onerror = () => {
                console.error("Failed to load Chart.js");
                // Fallback: show static message instead of chart
                resolve(); // Don't reject so the app continues working
            };
            document.head.appendChild(script);
        });
    }

    getTemplate() {
        return getMainResearchLayoutTemplate();
    }

    attachEventListeners(container) {
        const tickerInput = container.querySelector("#research-ticker-input");
        const researchBtn = container.querySelector("#research-btn");
        const quickBtns = container.querySelectorAll(".quick-research-btn");
        const chartPeriodBtns = container.querySelectorAll(".chart-period-btn");
        const refreshChartBtn = container.querySelector("#refresh-chart-btn");
        const addWatchlistBtn = container.querySelector("#add-to-watchlist-btn");
        const quickTradeBtn = container.querySelector("#quick-trade-btn");
        // News-related event listeners
        const newsFilterBtns = container.querySelectorAll(".news-filter-btn");
        const refreshNewsBtn = container.querySelector("#refresh-news-btn");
        const newsSearchInput = container.querySelector("#news-search-input");                                                                                  

        // Search input events
        if (tickerInput) {
            tickerInput.addEventListener("input", this.handleSearchInput.bind(this));
            tickerInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.handleResearch();
                }
            });
            tickerInput.addEventListener("focus", this.searchManager.showSearchResults.bind(this));
            tickerInput.addEventListener("blur", () => {
                // Delay hiding to allow click on results
                setTimeout(() => this.searchManager.hideSearchResults(), 200);
            });
        }

        // Research button
        if (researchBtn) {
            researchBtn.addEventListener("click", this.handleResearch.bind(this));
        }

        // Quick research buttons
        quickBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const ticker = e.target.dataset.ticker;
                this.researchStock(ticker);
            });
        });

        // Chart period buttons
        chartPeriodBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.switchChartPeriod(e.target);
            });
        });

        // Refresh chart button
        if (refreshChartBtn) {
            refreshChartBtn.addEventListener("click", this.refreshChart.bind(this));
        }

        // Action buttons
        if (addWatchlistBtn) {
            addWatchlistBtn.addEventListener("click", this.handleAddToWatchlist.bind(this));
        }

        if (quickTradeBtn) {
            quickTradeBtn.addEventListener("click", this.handleQuickTrade.bind(this));
        }

        // Click outside to hide search results
        document.addEventListener("click", (e) => {
            if (!container.contains(e.target)) {
                this.searchManager.hideSearchResults();
            }
        });

        // News filter buttons
        newsFilterBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.switchNewsFilter(e.target);
            });
        });

        // Refresh news button
        if (refreshNewsBtn) {
            refreshNewsBtn.addEventListener("click", this.refreshNews.bind(this));
        }

        // News search input with debouncing
        if (newsSearchInput) {
            let searchTimeout;
            newsSearchInput.addEventListener("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchNews(e.target.value);
                }, TIMEOUTS.NEWS_SEARCH_DEBOUNCE);
            });
        }
    }

    async handleSearchInput(e) {
        await this.searchManager.handleSearchInput(e, (ticker) => this.researchStock(ticker));
    }

    async handleResearch() {
        const ticker = document.getElementById("research-ticker-input")?.value.trim();
        
        if (!ticker) {
            this.showError(ERROR_MESSAGES.STOCK_TICKER_REQUIRED);
            return;
        }

        await this.researchStock(ticker);
    }

    async researchStock(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // Update input field
        const tickerInput = document.getElementById("research-ticker-input");
        if (tickerInput) {
            tickerInput.value = upperTicker;
        }

        // Show loading state
        this.showLoading();
        this.hideError();

        try {
            // Fetch stock details
            console.log(`Researching stock: ${upperTicker}`);
            this.currentStockData = await this.stockService.getStockDetails(upperTicker);
            
            if (!this.currentStockData) {
                throw new Error(`Stock data not found for ticker: ${upperTicker}`);
            }

            // Display results
            this.displayStockData();
            await this.loadPriceChart();
            this.displayCompanyProfile();
            await this.loadStockNews(); // NEW: Add this line

        } catch (error) {
            console.error("Research error:", error);
            this.showError(error.message || "Failed to fetch stock data. Please try again.");
        } finally {
            this.hideLoading();
        }
    }

    displayStockData() {
        this.stockDataManager.displayStockData(this.currentStockData);
        this.showResults();
    }

    async loadPriceChart(period = 7, resolution = "D") {
        await this.chartManager.loadPriceChart(this.currentStockData, period, resolution);
    }

    displayCompanyProfile() {
        this.stockDataManager.displayCompanyProfile(this.currentStockData);
    }

    switchChartPeriod(targetButton) {
        this.chartManager.switchChartPeriod(targetButton, this.currentStockData);
    }

    refreshChart() {
        this.chartManager.refreshChart(this.currentStockData);
    }

    handleAddToWatchlist() {
        if (this.currentStockData) {
            alert(`Added ${this.currentStockData.ticker} to watchlist! (Functionality to be implemented)`);
            // In a real app, you'd integrate with a watchlist service here
        }
    }

    handleQuickTrade() {
        if (this.currentStockData) {
            const ticker = this.currentStockData.ticker;
            const tradeUrl = `/trade?ticker=${ticker}`;
            
            console.log(`Navigating to trade ${ticker}`);
            
            if (window.app && window.app.router) {
                window.app.router.navigate(tradeUrl);
            } else {
                window.location.href = tradeUrl;
            }
        }
    }

    // ==========================================
    // NEWS INTEGRATION METHODS - Delegated to NewsManager
    // ==========================================

    async loadStockNews() {
        await this.newsManager.loadStockNews(this.currentStockData);
    }

    switchNewsFilter(targetButton) {
        this.newsManager.switchNewsFilter(targetButton);
    }

    searchNews(query) {
        this.newsManager.searchNews(query);
    }

    async refreshNews() {
        await this.newsManager.refreshNews(this.currentStockData);
    }

    // UI State Management
    showLoading() {
        document.getElementById("research-placeholder")?.classList.add("hidden");
        document.getElementById("research-results")?.classList.add("hidden");
        document.getElementById("research-loading")?.classList.remove("hidden");
        this.hideError();
    }

    hideLoading() {
        document.getElementById("research-loading")?.classList.add("hidden");
    }

    showDefaultState() {
        document.getElementById("research-placeholder")?.classList.remove("hidden");
        document.getElementById("research-results")?.classList.add("hidden");
        document.getElementById("research-loading")?.classList.add("hidden");
        this.hideError();
    }

    showResults() {
        document.getElementById("research-placeholder")?.classList.add("hidden");
        document.getElementById("research-loading")?.classList.add("hidden");
        document.getElementById("research-results")?.classList.remove("hidden");
        this.hideError();
    }

    showError(message) {
        const errorDiv = document.getElementById("research-error");
        const errorText = document.getElementById("research-error-text");
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove("hidden");
        }
        document.getElementById("research-placeholder")?.classList.add("hidden");
        document.getElementById("research-results")?.classList.add("hidden");
        document.getElementById("research-loading")?.classList.add("hidden");
    }

    hideError() {
        document.getElementById("research-error")?.classList.add("hidden");
    }
}