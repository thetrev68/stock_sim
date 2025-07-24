// src/components/research/NewsManager.js
// Extracted from views/research.js - News integration functionality
// Handles all news-related operations for research view

import { formatNewsDate } from "../../utils/date-utils.js";
import { setUIState } from "../../utils/dom-utils.js";
import { getNewsArticleCardTemplate } from "../../templates/research/research-news.js";
import { getRefreshNewsButtonTemplate } from "../../templates/research/research-stock-display.js";

export class NewsManager {
    constructor(stockService) {
        this.stockService = stockService;
        this.currentNewsData = [];
        this.filteredNewsData = [];
        this.currentNewsFilter = "all";
        this.newsSearchQuery = "";
    }

    /**
     * Load and display news for the current stock
     */
    async loadStockNews(currentStockData) {
        if (!currentStockData) {
            console.warn("No current stock data for news loading");
            return;
        }

        this.showNewsLoading();

        try {
            console.log(`Loading news for ${currentStockData.ticker}...`);
            
            // Fetch news articles
            this.currentNewsData = await this.stockService.getStockNews(currentStockData.ticker, 20);
            
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
    async refreshNews(currentStockData) {
        if (!currentStockData) return;
        
        const refreshBtn = document.getElementById("refresh-news-btn");
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = getRefreshNewsButtonTemplate(true);
        }
        
        try {
            // Clear cache for this ticker to force fresh data
            this.stockService.newsCache.delete(`${currentStockData.ticker}_20`);
            
            // Reload news
            await this.loadStockNews(currentStockData);
            
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
        setUIState({
            loadingId: "news-loading",
            contentId: "news-articles", 
            errorId: "news-error",
            emptyId: "news-empty"
        }, "loading");
    }

    showNewsArticles() {
        setUIState({
            loadingId: "news-loading",
            contentId: "news-articles", 
            errorId: "news-error",
            emptyId: "news-empty"
        }, "content");
    }

    showNewsEmpty() {
        setUIState({
            loadingId: "news-loading",
            contentId: "news-articles", 
            errorId: "news-error",
            emptyId: "news-empty"
        }, "empty");
    }

    showNewsError() {
        setUIState({
            loadingId: "news-loading",
            contentId: "news-articles", 
            errorId: "news-error",
            emptyId: "news-empty"
        }, "error");
    }
}