// src/services/stocks.js - Enhanced with News Integration for Session 11

// import { API_LIMITS, API_ERROR_CONFIG } from "../constants/app-config.js";
import { StockNewsService } from "./stocks/stock-news.js";
import { StockCacheService } from "./stocks/stock-cache.js";
import { StockApiService } from "./stocks/stock-api.js";
import { StockQuotesService } from "./stocks/stock-quotes.js";
// import { filterByDateRange, sortByDateDesc } from "../utils/date-utils.js";
// import { generateSummaryFromHeadline, generateUniqueId, filterBySearch } from "../utils/string-utils.js";

/**
 * StockService with live Finnhub API integration
 * Enhanced with research capabilities: company profiles, search, historical data, and NEWS
 */
export class StockService {
    constructor() {

        // Initialize cache service
        this.cacheService = new StockCacheService();

        // Initialize API service
        this.apiService = new StockApiService();
        
        // Initialize quotes service
        this.quotesService = new StockQuotesService(this.apiService, this.cacheService);

        // Initialize news service
        this.newsService = new StockNewsService();
    }

    // ==========================================
    // NEWS METHODS - Delegated to newsService
    // ==========================================

    /**
     * Get news articles for a specific stock
     */
    async getStockNews(ticker, limit = 10) {
        return await this.newsService.getStockNews(ticker, limit);
    }

    /**
     * Search within stock news articles
     */
    async searchStockNews(ticker, query, limit = 10) {
        return await this.newsService.searchStockNews(ticker, query, limit);
    }

    /**
     * Process raw news article from Finnhub API
     */
    processNewsArticle(rawArticle) {
        return this.newsService.processNewsArticle(rawArticle);
    }

    /**
     * Generate a summary from headline when summary is not available
     */
    generateSummaryFromHeadline(headline) {
        return this.newsService.generateSummaryFromHeadline(headline);
    }

    /**
     * Get default placeholder image for news articles
     */
    getDefaultNewsImage() {
        return this.newsService.getDefaultNewsImage();
    }

    /**
     * Get fallback mock news when API is unavailable
     */
    getFallbackNews(ticker, limit = 10) {
        return this.newsService.getFallbackNews(ticker, limit);
    }

    /**
     * Generate generic news articles for tickers without mock data
     */
    generateGenericNews(ticker, limit = 10) {
        return this.newsService.generateGenericNews(ticker, limit);
    }

    /**
     * Filter news articles by date range
     */
    filterNewsByDate(newsArticles, daysBack = 7) {
        return this.newsService.filterNewsByDate(newsArticles, daysBack);
    }

    /**
     * Sort news articles by date (newest first)
     */
    sortNewsByDate(newsArticles) {
        return this.newsService.sortNewsByDate(newsArticles);
    }

    // ==========================================
    // CACHE METHODS - Delegated to cacheService
    // ==========================================

    getCachedPrice(ticker) {
        return this.cacheService.getCachedPrice(ticker);
    }

    setCachedPrice(ticker, price) {
        return this.cacheService.setCachedPrice(ticker, price);
    }

    getFromCache(cache, key) {
        return this.cacheService.getFromCache(cache, key);
    }

    setInCache(cache, key, data) {
        return this.cacheService.setInCache(cache, key, data);
    }

    clearCache() {
        return this.cacheService.clearCache();
    }

    getCacheStatus() {
        return this.cacheService.getCacheStatus();
    }

    // ==========================================
    // API METHODS - Delegated to apiService
    // ==========================================

    shouldUseAPI() {
        return this.apiService.shouldUseAPI();
    }

    handleAPIError(error, endpoint) {
        return this.apiService.handleAPIError(error, endpoint);
    }

    async enforceRateLimit() {
        return await this.apiService.enforceRateLimit();
    }

    // ==========================================
    // QUOTES/DATA METHODS - Delegated to quotesService
    // ==========================================

    async getQuote(ticker) {
        return await this.quotesService.getQuote(ticker);
    }

    async getStockDetails(ticker) {
        return await this.quotesService.getStockDetails(ticker);
    }

    async getQuoteData(ticker) {
        return await this.quotesService.getQuoteData(ticker);
    }

    async getCompanyProfile(ticker) {
        return await this.quotesService.getCompanyProfile(ticker);
    }

    async searchStocks(query) {
        return await this.quotesService.searchStocks(query);
    }

    async getHistoricalData(ticker, resolution = "D", days = 30) {
        return await this.quotesService.getHistoricalData(ticker, resolution, days);
    }

    getFallbackStockDetails(ticker) {
        return this.quotesService.getFallbackStockDetails(ticker);
    }

    getFallbackPrice(ticker) {
        return this.quotesService.getFallbackPrice(ticker);
    }

    generateMockHistoricalData(ticker, days) {
        return this.quotesService.generateMockHistoricalData(ticker, days);
    }

    getMockSearchResults(query) {
        return this.quotesService.getMockSearchResults(query);
    }
}