/**
 * Stock News Service
 * 
 * Handles news fetching, processing, filtering, and mock data
 * Extracted from services/stocks.js
 */

import { API_LIMITS, CACHE_CONFIG, API_ERROR_CONFIG } from "../../constants/app-config.js";
import { filterByDateRange, sortByDateDesc } from "../../utils/date-utils.js";
import { generateSummaryFromHeadline, generateUniqueId, filterBySearch } from "../../utils/string-utils.js";

export class StockNewsService {
    constructor() {
        // Your Finnhub API key (current data)
        this.apiKey = "d1n5qs9r01qlvnp5lkugd1n5qs9r01qlvnp5lkv0";
        this.baseUrl = "https://finnhub.io/api/v1";

        // NEW: Add this line - automatically detects development environment
        this.useMockDataFallback = window.location.hostname === "localhost" || 
                                window.location.hostname === "127.0.0.1" ||
                                window.location.hostname.includes("localhost");
        
        // Client-side cache to minimize API calls
        this.newsCache = new Map(); // NEW: Add news cache
        this.cacheTimeout = CACHE_CONFIG.STOCK_PRICES; // 5 minutes cache
        
        // Enhanced rate limiting
        this.lastApiCall = 0;
        this.minTimeBetweenCalls = API_LIMITS.MIN_TIME_BETWEEN_CALLS; // 2 seconds
        this.apiCallCount = 0;
        this.maxCallsPerMinute = API_LIMITS.MAX_CALLS_PER_MINUTE; // Conservative limit
        this.callTimestamps = []; // Track call timestamps
        
        // API status tracking
        this.apiStatus = {
            isDown: false,
            lastFailureTime: 0,
            cooldownPeriod: API_ERROR_CONFIG // 5 minutes cooldown after failures
        };

        // NEW: Mock news data for fallback
        this.mockNews = {
            "AAPL": [
                {
                    category: "technology",
                    datetime: Date.now() - 3600000, // 1 hour ago
                    headline: "Apple Reports Strong Q4 Earnings Beat Expectations",
                    id: "mock_1",
                    image: "https://via.placeholder.com/400x200/1f2937/ffffff?text=Apple+News",
                    related: "AAPL",
                    source: "MarketWatch",
                    summary: "Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales and services revenue growth.",
                    url: "https://example.com/apple-earnings"
                },
                {
                    category: "technology",
                    datetime: Date.now() - 7200000, // 2 hours ago
                    headline: "New iPhone Features Drive Consumer Interest",
                    id: "mock_2",
                    image: "https://via.placeholder.com/400x200/1f2937/ffffff?text=iPhone+News",
                    related: "AAPL",
                    source: "TechCrunch",
                    summary: "Latest iPhone models featuring advanced AI capabilities are generating significant consumer interest ahead of the holiday season.",
                    url: "https://example.com/iphone-features"
                }
            ],
            "TSLA": [
                {
                    category: "technology",
                    datetime: Date.now() - 1800000, // 30 minutes ago
                    headline: "Tesla Announces New Gigafactory Location",
                    id: "mock_3",
                    image: "https://via.placeholder.com/400x200/1f2937/ffffff?text=Tesla+News",
                    related: "TSLA",
                    source: "Reuters",
                    summary: "Tesla reveals plans for a new Gigafactory to meet growing demand for electric vehicles in the Asian market.",
                    url: "https://example.com/tesla-gigafactory"
                }
            ],
            "MSFT": [
                {
                    category: "technology",
                    datetime: Date.now() - 5400000, // 1.5 hours ago
                    headline: "Microsoft Azure Cloud Revenue Surges 30%",
                    id: "mock_4",
                    image: "https://via.placeholder.com/400x200/1f2937/ffffff?text=Microsoft+News",
                    related: "MSFT",
                    source: "Bloomberg",
                    summary: "Microsoft reports significant growth in cloud computing services, with Azure revenue increasing 30% year-over-year.",
                    url: "https://example.com/microsoft-azure"
                }
            ]
        };
    }

    /**
     * Get news articles for a specific stock
     * @param {string} ticker - Stock ticker symbol
     * @param {number} limit - Maximum number of articles (default: 10)
     * @returns {Promise<Array>} Array of news articles
     */
    async getStockNews(ticker, limit = 10) {
        const upperTicker = ticker.toUpperCase();
        const cacheKey = `${upperTicker}_${limit}`;
        
        // Check cache first
        const cached = this.getFromCache(this.newsCache, cacheKey);
        if (cached) {
            console.log(`Using cached news for ${upperTicker}`);
            return cached;
        }

        // Check if API should be used
        if (!this.shouldUseAPI()) {
            if (this.useMockDataFallback) {
                return this.getFallbackNews(upperTicker, limit);
            } else {
                throw new Error(`News API temporarily unavailable for ${upperTicker}`);
            }
        }

        try {
            await this.enforceRateLimit();
            
            // Calculate date range (last 30 days)
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 30);
            
            const fromDateStr = fromDate.toISOString().split("T")[0];
            const toDateStr = toDate.toISOString().split("T")[0];
            
            // Build Finnhub company news URL
            const url = `${this.baseUrl}/company-news?symbol=${upperTicker}&from=${fromDateStr}&to=${toDateStr}&token=${this.apiKey}`;
            
            console.log(`Fetching news for ${upperTicker}...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const newsData = await response.json();
            
            if (Array.isArray(newsData) && newsData.length > 0) {
                // Process and limit results
                const processedNews = newsData
                    .slice(0, limit)
                    .map(article => this.processNewsArticle(article))
                    .filter(article => article !== null);
                
                // Cache the results
                this.setInCache(this.newsCache, cacheKey, processedNews);
                
                // Reset API status on success
                this.apiStatus.isDown = false;
                
                console.log(`Fetched ${processedNews.length} news articles for ${upperTicker}`);
                return processedNews;
            } else {
                console.warn(`No news data returned for ${upperTicker}`);
                if (this.useMockDataFallback) {
                    return this.getFallbackNews(upperTicker, limit);
                } else {
                    throw new Error(`No news articles found for ${upperTicker}`);
                }
            }
            
        } catch (error) {
            console.error(`Error fetching news for ${upperTicker}:`, error);
            this.handleAPIError(error, "news");
            
            // Only use fallback data in development environment
            if (this.useMockDataFallback) {
                console.log("Development environment detected - using mock news data");
                return this.getFallbackNews(upperTicker, limit);
            } else {
                console.log("Production environment - throwing error instead of using mock data");
                throw new Error(`Unable to fetch news for ${upperTicker}: API temporarily unavailable`);
            }
        }
    }

    /**
     * Search within stock news articles
     * @param {string} ticker - Stock ticker symbol
     * @param {string} query - Search query
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} Filtered news articles
     */
    async searchStockNews(ticker, query, limit = 10) {
        if (!query || query.trim().length < 2) {
            return await this.getStockNews(ticker, limit);
        }

        const allNews = await this.getStockNews(ticker, 50); // Get more articles to search through
        const searchTerm = query.toLowerCase().trim();
        
        const filteredNews = filterBySearch(allNews, searchTerm, ["headline", "summary", "source"]);

        return filteredNews.slice(0, limit);
    }

    /**
     * Process raw news article from Finnhub API
     * @param {object} rawArticle - Raw article data from API
     * @returns {object|null} Processed article or null if invalid
     */
    processNewsArticle(rawArticle) {
        try {
            // Validate required fields
            if (!rawArticle.headline || !rawArticle.datetime) {
                return null;
            }

            return {
                id: rawArticle.id || generateUniqueId("news"),
                headline: rawArticle.headline,
                summary: rawArticle.summary || this.generateSummaryFromHeadline(rawArticle.headline),
                source: rawArticle.source || "Unknown Source",
                datetime: rawArticle.datetime * 1000, // Convert Unix timestamp to milliseconds
                url: rawArticle.url || "#",
                image: rawArticle.image || this.getDefaultNewsImage(),
                category: rawArticle.category || "business",
                related: rawArticle.related || ""
            };
        } catch (error) {
            console.error("Error processing news article:", error);
            return null;
        }
    }

    /**
     * Generate a summary from headline when summary is not available
     * @param {string} headline - Article headline
     * @returns {string} Generated summary
     */
    generateSummaryFromHeadline(headline) {
        return generateSummaryFromHeadline(headline);
    }

    /**
     * Get default placeholder image for news articles
     * @returns {string} Default image URL
     */
    getDefaultNewsImage() {
        return "https://via.placeholder.com/400x200/1f2937/ffffff?text=News";
    }

    /**
     * Get fallback mock news when API is unavailable
     * @param {string} ticker - Stock ticker
     * @param {number} limit - Maximum articles
     * @returns {Array} Mock news articles
     */
    getFallbackNews(ticker, limit = 10) {
        const mockNewsForTicker = this.mockNews[ticker] || [];
        
        if (mockNewsForTicker.length === 0) {
            // Generate generic news for unknown tickers
            return this.generateGenericNews(ticker, limit);
        }
        
        return mockNewsForTicker.slice(0, limit);
    }

    /**
     * Generate generic news articles for tickers without mock data
     * @param {string} ticker - Stock ticker
     * @param {number} limit - Maximum articles
     * @returns {Array} Generic news articles
     */
    generateGenericNews(ticker, limit = 10) {
        const genericHeadlines = [
            `${ticker} Reports Quarterly Earnings`,
            `Analysts Update ${ticker} Price Target`,
            `${ticker} Announces Strategic Partnership`,
            `Market Outlook for ${ticker} Remains Positive`,
            `${ticker} Sees Increased Trading Volume`
        ];

        return genericHeadlines.slice(0, limit).map((headline, index) => ({
            id: `generic_${ticker}_${index}`,
            headline: headline,
            summary: `${headline} - Stay updated with the latest developments and market analysis.`,
            source: "Market News",
            datetime: Date.now() - (index * 3600000), // Stagger times by 1 hour
            url: "#",
            image: this.getDefaultNewsImage(),
            category: "business",
            related: ticker
        }));
    }

    /**
     * Filter news articles by date range
     * @param {Array} newsArticles - Array of news articles
     * @param {number} daysBack - Number of days to go back
     * @returns {Array} Filtered articles
     */
    filterNewsByDate(newsArticles, daysBack = 7) {
        return filterByDateRange(newsArticles, daysBack);
    }

    /**
     * Sort news articles by date (newest first)
     * @param {Array} newsArticles - Array of news articles
     * @returns {Array} Sorted articles
     */
    sortNewsByDate(newsArticles) {
        return sortByDateDesc(newsArticles);
    }

    // === Shared Utility Methods (copied from original) ===

    shouldUseAPI() {
        const now = Date.now();
        
        // Check if API is in cooldown after failures
        if (this.apiStatus.isDown && (now - this.apiStatus.lastFailureTime) < this.apiStatus.cooldownPeriod) {
            console.log("API in cooldown, using fallback data");
            return false;
        }
        
        // Check rate limiting
        this.callTimestamps = this.callTimestamps.filter(timestamp => now - timestamp < API_LIMITS.RATE_LIMIT_WINDOW);
        if (this.callTimestamps.length >= this.maxCallsPerMinute) {
            console.log("Rate limit exceeded, using fallback data");
            return false;
        }
        
        return true;
    }

    handleAPIError(error, endpoint) {
        console.error(`API Error at ${endpoint}:`, error.message);
        
        // If it's a 403 or 429, mark API as down temporarily
        if (error.message.includes("403") || error.message.includes("429")) {
            this.apiStatus.isDown = true;
            this.apiStatus.lastFailureTime = Date.now();
            console.warn("API marked as down due to rate limiting. Using fallback data for 5 minutes.");
        }
    }

    async enforceRateLimit() {
        const now = Date.now();
        
        // Clean old timestamps
        this.callTimestamps = this.callTimestamps.filter(timestamp => now - timestamp < API_LIMITS.RATE_LIMIT_WINDOW);
        
        // Check if we're hitting rate limits
        if (this.callTimestamps.length >= this.maxCallsPerMinute) {
            const oldestCall = Math.min(...this.callTimestamps);
            const waitTime = API_LIMITS.RATE_LIMIT_WINDOW - (now - oldestCall) + API_LIMITS.MIN_TIME_BETWEEN_CALLS;
            console.log(`Rate limit protection: waiting ${Math.round(waitTime/1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        // Enforce minimum time between calls
        const timeSinceLastCall = now - this.lastApiCall;
        if (timeSinceLastCall < this.minTimeBetweenCalls) {
            const waitTime = this.minTimeBetweenCalls - timeSinceLastCall;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        // Track this call
        this.callTimestamps.push(Date.now());
        this.lastApiCall = Date.now();
    }

    getFromCache(cache, key) {
        const cached = cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.data;
        }
        return null;
    }

    setInCache(cache, key, data) {
        cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
}