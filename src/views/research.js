// src/views/research.js - Enhanced Research View - Session 10
/* global Chart */

// Core services and configuration
import { StockService } from "../services/stocks.js";
import { TIMEOUTS } from "../constants/app-config.js";
import { ERROR_MESSAGES } from "../constants/ui-messages.js";

// Utility functions
import { 
    formatPrice,
    formatNumberWithCommas,
    formatPriceChange,
    getGainLossColorClass
} from "../utils/currency-utils.js";
import { formatNewsDate } from "../utils/date-utils.js";
import { getInitial, toUpperCase } from "../utils/string-utils.js";

// Template modules
import { getMainResearchLayoutTemplate } from '../templates/research/research-main-layout.js';
import { getNewsArticleCardTemplate } from '../templates/research/research-news.js';
import { 
    getSearchResultItemTemplate, 
    getSearchEmptyStateTemplate 
} from '../templates/research/research-search.js';
import { getChartUnavailableTemplate } from '../templates/research/research-errors.js';
import { getRefreshNewsButtonTemplate } from '../templates/research/research-stock-display.js';

export default class ResearchView {
    constructor() {
        this.name = "research";
        this.stockService = new StockService();
        this.viewContainer = null;
        this.currentStockData = null;
        this.currentChart = null;
        this.searchResults = [];
        this.searchTimeout = null;
        this.currentNewsData = [];
        this.filteredNewsData = [];
        this.currentNewsFilter = "all";
        this.newsSearchQuery = "";
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
                tickerInput.value = toUpperCase(prefilledTicker);
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
            tickerInput.addEventListener("focus", this.showSearchResults.bind(this));
            tickerInput.addEventListener("blur", () => {
                // Delay hiding to allow click on results
                setTimeout(() => this.hideSearchResults(), 200);
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
                this.hideSearchResults();
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
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length < 1) {
            this.hideSearchResults();
            return;
        }

        // Show loading
        this.showSearchLoading(true);

        // Debounce search
        this.searchTimeout = setTimeout(async () => {
            try {
                this.searchResults = await this.stockService.searchStocks(query);
                this.displaySearchResults();
            } catch (error) {
                console.error("Search error:", error);
                this.hideSearchResults();
            } finally {
                this.showSearchLoading(false);
            }
        }, TIMEOUTS.SEARCH_DEBOUNCE);
    }

    showSearchLoading(show) {
        const searchIcon = document.querySelector("#research-ticker-input + div svg");
        const loadingIcon = document.getElementById("search-loading");
        
        if (show) {
            if (searchIcon) searchIcon.style.display = "none";
            if (loadingIcon) loadingIcon.classList.remove("hidden");
        } else {
            if (searchIcon) searchIcon.style.display = "block";
            if (loadingIcon) loadingIcon.classList.add("hidden");
        }
    }

    displaySearchResults() {
        const resultsContainer = document.getElementById("search-results");
        const resultsList = document.getElementById("search-results-list");
        
        if (!resultsContainer || !resultsList) return;

        if (this.searchResults.length === 0) {
            resultsList.innerHTML = getSearchEmptyStateTemplate();
        } else {
            resultsList.innerHTML = this.searchResults.map(stock => getSearchResultItemTemplate(stock)).join("");

            // Attach click events to search results
            resultsList.querySelectorAll(".search-result-item").forEach(item => {
                item.addEventListener("click", (e) => {
                    const ticker = e.currentTarget.dataset.ticker;
                    this.researchStock(ticker);
                    this.hideSearchResults();
                });
            });
        }

        this.showSearchResults();
    }

    showSearchResults() {
        const resultsContainer = document.getElementById("search-results");
        if (resultsContainer && this.searchResults.length > 0) {
            resultsContainer.classList.remove("hidden");
        }
    }

    hideSearchResults() {
        const resultsContainer = document.getElementById("search-results");
        if (resultsContainer) {
            resultsContainer.classList.add("hidden");
        }
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
        const upperTicker = toUpperCase(ticker);
        
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
        if (!this.currentStockData) return;

        const data = this.currentStockData;

        // Update header information
        this.updateElement("company-name", data.companyName);
        this.updateElement("quote-ticker", data.ticker);
        this.updateElement("company-exchange", data.exchange);
        this.updateElement("company-sector", data.sector);
        this.updateElement("company-currency", data.currency);

        // Update price information
        this.updateElement("current-price", formatPrice(data.currentPrice));
        
        // Price change with color
        const changeEl = document.getElementById("price-change");
        if (changeEl && data.priceChange !== undefined) {
            const changeFormatted = formatPriceChange(data.priceChange, data.priceChangePercent);
            const colorClass = getGainLossColorClass(data.priceChange);

            changeEl.className = `text-lg font-semibold ${colorClass}`;
            changeEl.textContent = changeFormatted;
        }

        // Update quick stats
        this.updateElement("open-price", formatPrice(data.openPrice));
        this.updateElement("day-high", formatPrice(data.dayHigh));
        this.updateElement("day-low", formatPrice(data.dayLow));
        this.updateElement("volume", data.volume ? formatNumberWithCommas(data.volume) : "--");

        // Update last updated
        this.updateElement("last-updated", `Last updated: ${new Date().toLocaleTimeString()}`);

        // Update company logo
        const logoImg = document.getElementById("logo-img");
        const logoContainer = document.getElementById("company-logo");
        const logoFallback = document.getElementById("company-logo-fallback");
        const companyInitial = document.getElementById("company-initial");

        if (data.logo && logoImg && logoContainer && logoFallback) {
            logoImg.src = data.logo;
            logoImg.onerror = () => {
                logoContainer.classList.add("hidden");
                logoFallback.classList.remove("hidden");
            };
            logoImg.onload = () => {
                logoContainer.classList.remove("hidden");
                logoContainer.classList.add("flex");
                logoFallback.classList.add("hidden");
            };
        }

        if (companyInitial) {
            companyInitial.textContent = getInitial(data.ticker);
        }

        // Show results
        this.showResults();
    }

    async loadPriceChart(period = 7, resolution = "D") {
        if (!this.currentStockData) {
            console.warn("No current stock data for chart");
            return;
        }

        this.showChartLoading();

        try {
            // Check if Chart.js is available
            if (typeof Chart === "undefined") {
                console.warn("Chart.js not available, showing fallback message");
                this.showChartUnavailable();
                return;
            }

            const historicalData = await this.stockService.getHistoricalData(
                this.currentStockData.ticker, 
                resolution, 
                period
            );

            if (historicalData && historicalData.timestamps && historicalData.closes && historicalData.closes.length > 0) {
                await this.renderChart(historicalData);
                this.showChart();
            } else {
                console.warn("No historical data available");
                this.showChartUnavailable("No historical data available");
            }

        } catch (error) {
            console.error("Chart loading error:", error);
            this.showChartUnavailable("Chart temporarily unavailable");
        }
    }

    async renderChart(historicalData) {
        const canvas = document.getElementById("price-chart");
    if (!canvas) {
        console.error("Chart canvas not found");
        return;
    }

    // Check if Chart.js is available
    if (typeof Chart === "undefined") {
        console.error("Chart.js not loaded");
        this.showChartUnavailable("Chart library not available");
        return;
    }

    // Destroy existing chart
    if (this.currentChart) {
        try {
            this.currentChart.destroy();
        } catch (error) {
            console.warn("Error destroying previous chart:", error);
        }
        this.currentChart = null;
    }

    try {
        const ctx = canvas.getContext("2d");
        
        // Prepare data for Chart.js
        const labels = historicalData.timestamps.map(timestamp => {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString();
        });
        const prices = historicalData.closes;

        // Validate data
        if (!labels.length || !prices.length) {
            throw new Error("No chart data available");
        }

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(6, 182, 212, 0.1)");
        gradient.addColorStop(1, "rgba(6, 182, 212, 0)");

        const chartConfig = {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: `${this.currentStockData.ticker} Price`,
                    data: prices,
                    borderColor: "#06B6D4",
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: "#06B6D4",
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "#ffffff",
                        bodyColor: "#ffffff",
                        borderColor: "#06B6D4",
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: "rgba(75, 85, 99, 0.3)",
                            drawBorder: false
                        },
                        ticks: {
                            color: "#9CA3AF",
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: "rgba(75, 85, 99, 0.3)",
                            drawBorder: false
                        },
                        ticks: {
                            color: "#9CA3AF",
                            callback: function(value) {
                                return "$" + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        };

        this.currentChart = new Chart(ctx, chartConfig);
            console.log("Chart rendered successfully");

        } catch (error) {
            console.error("Error rendering chart:", error);
            this.showChartUnavailable("Unable to render chart");
        }
    }

    // Add this new method to show chart unavailable message
    showChartUnavailable(message = "Chart temporarily unavailable") {
        const chartContainer = document.getElementById("chart-container");
        const chartLoading = document.getElementById("chart-loading");
        const chartError = document.getElementById("chart-error");
        
        if (chartLoading) chartLoading.classList.add("hidden");
        if (chartContainer) chartContainer.classList.add("hidden");
        
        if (chartError) {
            chartError.innerHTML = getChartUnavailableTemplate(message);
            chartError.classList.remove("hidden");
        }
    }

    displayCompanyProfile() {
        if (!this.currentStockData || !this.currentStockData.companyProfile) {
            this.showProfileError();
            return;
        }

        const profile = this.currentStockData.companyProfile;

        this.updateElement("market-cap", profile.marketCapitalization ? this.formatMillionsBillions(profile.marketCapitalization) : "--");
        this.updateElement("shares-outstanding", profile.shareOutstanding ? profile.shareOutstanding.toLocaleString() : "--");
        this.updateElement("ipo-date", profile.ipo ? new Date(profile.ipo).toLocaleDateString() : "--");
        this.updateElement("company-country", profile.country || "--");

        const companyWebsiteDiv = document.getElementById("company-website");
        const websiteLink = document.getElementById("website-link");
        if (profile.weburl && websiteLink && companyWebsiteDiv) {
            websiteLink.href = profile.weburl;
            companyWebsiteDiv.classList.remove("hidden");
        } else if (companyWebsiteDiv) {
            companyWebsiteDiv.classList.add("hidden");
        }

        this.showProfileData();
    }

    formatMillionsBillions(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + "B";
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + "M";
        }
        return num.toLocaleString();
    }

    switchChartPeriod(targetButton) {
        const period = parseInt(targetButton.dataset.period);
        const resolution = targetButton.dataset.resolution;

        // Update active button style
        document.querySelectorAll(".chart-period-btn").forEach(btn => {
            btn.classList.remove("bg-cyan-600", "text-white");
            btn.classList.add("text-gray-300", "hover:text-white");
        });
        targetButton.classList.add("bg-cyan-600", "text-white");
        targetButton.classList.remove("text-gray-300", "hover:text-white");

        this.loadPriceChart(period, resolution);
    }

    refreshChart() {
        const activeBtn = document.querySelector(".chart-period-btn.bg-cyan-600");
        if (activeBtn) {
            const period = parseInt(activeBtn.dataset.period);
            const resolution = activeBtn.dataset.resolution;
            this.loadPriceChart(period, resolution);
        } else {
            // Default to 7D if no active button found
            this.loadPriceChart(7, "D");
        }
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
    // NEWS INTEGRATION METHODS - Session 11
    // ==========================================

    /**
     * Load and display news for the current stock
     */
    async loadStockNews() {
        if (!this.currentStockData) {
            console.warn("No current stock data for news loading");
            return;
        }

        this.showNewsLoading();

        try {
            console.log(`Loading news for ${this.currentStockData.ticker}...`);
            
            // Fetch news articles
            this.currentNewsData = await this.stockService.getStockNews(this.currentStockData.ticker, 20);
            
            // Apply current filter and search
            this.applyNewsFilters();
            
            // Display the news
            this.displayNews();
            
        } catch (error) {
            console.error("Error loading stock news:", error);
            this.showNewsError();
        }
    }

    /**
     * Apply current filters and search to news data
     */
    applyNewsFilters() {
        let filtered = [...this.currentNewsData];
        
        // Apply date filter
        if (this.currentNewsFilter === "today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filtered = this.stockService.filterNewsByDate(filtered, 1);
        } else if (this.currentNewsFilter === "week") {
            filtered = this.stockService.filterNewsByDate(filtered, 7);
        }
        
        // Apply search filter
        if (this.newsSearchQuery && this.newsSearchQuery.trim().length > 0) {
            const searchTerm = this.newsSearchQuery.toLowerCase();
            filtered = filtered.filter(article => 
                article.headline.toLowerCase().includes(searchTerm) ||
                article.summary.toLowerCase().includes(searchTerm) ||
                article.source.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort by date (newest first)
        this.filteredNewsData = this.stockService.sortNewsByDate(filtered);
    }

    /**
     * Display news articles
     */
    displayNews() {
        const newsArticlesContainer = document.getElementById("news-articles");
        const _newsEmptyContainer = document.getElementById("news-empty");
        
        if (!newsArticlesContainer) return;
        
        if (this.filteredNewsData.length === 0) {
            this.showNewsEmpty();
            return;
        }
        
        // Clear existing content
        newsArticlesContainer.innerHTML = "";
        
        // Create article cards
        this.filteredNewsData.forEach(article => {
            const articleCard = this.createNewsArticleCard(article);
            newsArticlesContainer.appendChild(articleCard);
        });
        
        // Show news articles
        this.showNewsArticles();
    }

    /**
     * Create a news article card element
     */
    createNewsArticleCard(article) {
        const card = document.createElement("div");
        const formattedDate = formatNewsDate(article.datetime);
        
        card.innerHTML = getNewsArticleCardTemplate(article, formattedDate);
        card.className = "bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200 cursor-pointer border border-gray-600";
        
        // Add click handler to open article
        card.addEventListener("click", () => {
            this.openNewsArticle(article);
        });
        
        return card;
    }

    /**
     * Open news article in new tab
     */
    openNewsArticle(article) {
        if (article.url && article.url !== "#") {
            window.open(article.url, "_blank", "noopener,noreferrer");
        } else {
            // Show modal or alert for articles without URLs
            alert(`Article: ${article.headline}\n\nSummary: ${article.summary}\n\nSource: ${article.source}`);
        }
    }

    /**
     * Switch news filter (All, Today, This Week)
     */
    switchNewsFilter(targetButton) {
        const filter = targetButton.dataset.filter;
        this.currentNewsFilter = filter;
        
        // Update button styles
        document.querySelectorAll(".news-filter-btn").forEach(btn => {
            btn.classList.remove("bg-cyan-600", "text-white");
            btn.classList.add("text-gray-300", "hover:text-white");
        });
        targetButton.classList.add("bg-cyan-600", "text-white");
        targetButton.classList.remove("text-gray-300", "hover:text-white");
        
        // Apply filters and redisplay
        this.applyNewsFilters();
        this.displayNews();
    }

    /**
     * Search within news articles
     */
    searchNews(query) {
        this.newsSearchQuery = query;
        this.applyNewsFilters();
        this.displayNews();
    }

    /**
     * Refresh news data
     */
    async refreshNews() {
    if (!this.currentStockData) return;
    
    const refreshBtn = document.getElementById("refresh-news-btn");
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = getRefreshNewsButtonTemplate(true);
    }
    
    try {
        // Clear cache for this ticker to force fresh data
        this.stockService.newsCache.delete(`${this.currentStockData.ticker}_20`);
        
        // Reload news
        await this.loadStockNews();
        
    } catch (error) {
        console.error("Error refreshing news:", error);
        this.showNewsError();
    } finally {
        // Reset refresh button
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = getRefreshNewsButtonTemplate(false);
        }
    }
}

    // News UI State Management
    showNewsLoading() {
        document.getElementById("news-loading")?.classList.remove("hidden");
        document.getElementById("news-articles")?.classList.add("hidden");
        document.getElementById("news-empty")?.classList.add("hidden");
        document.getElementById("news-error")?.classList.add("hidden");
    }

    showNewsArticles() {
        document.getElementById("news-loading")?.classList.add("hidden");
        document.getElementById("news-articles")?.classList.remove("hidden");
        document.getElementById("news-empty")?.classList.add("hidden");
        document.getElementById("news-error")?.classList.add("hidden");
    }

    showNewsEmpty() {
        document.getElementById("news-loading")?.classList.add("hidden");
        document.getElementById("news-articles")?.classList.add("hidden");
        document.getElementById("news-empty")?.classList.remove("hidden");
        document.getElementById("news-error")?.classList.add("hidden");
    }

    showNewsError() {
        document.getElementById("news-loading")?.classList.add("hidden");
        document.getElementById("news-articles")?.classList.add("hidden");
        document.getElementById("news-empty")?.classList.add("hidden");
        document.getElementById("news-error")?.classList.remove("hidden");
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

    showChartLoading() {
        document.getElementById("chart-loading")?.classList.remove("hidden");
        document.getElementById("chart-container")?.classList.add("hidden");
        document.getElementById("chart-error")?.classList.add("hidden");
    }

    showChart() {
        document.getElementById("chart-loading")?.classList.add("hidden");
        document.getElementById("chart-container")?.classList.remove("hidden");
        document.getElementById("chart-error")?.classList.add("hidden");
    }

    showChartError() {
        document.getElementById("chart-loading")?.classList.add("hidden");
        document.getElementById("chart-container")?.classList.add("hidden");
        document.getElementById("chart-error")?.classList.remove("hidden");
    }

    showProfileLoading() {
        document.getElementById("profile-loading")?.classList.remove("hidden");
        document.getElementById("profile-data")?.classList.add("hidden");
        document.getElementById("profile-error")?.classList.add("hidden");
    }

    showProfileData() {
        document.getElementById("profile-loading")?.classList.add("hidden");
        document.getElementById("profile-data")?.classList.remove("hidden");
        document.getElementById("profile-error")?.classList.add("hidden");
    }

    showProfileError() {
        document.getElementById("profile-loading")?.classList.add("hidden");
        document.getElementById("profile-data")?.classList.add("hidden");
        document.getElementById("profile-error")?.classList.remove("hidden");
    }

    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
}