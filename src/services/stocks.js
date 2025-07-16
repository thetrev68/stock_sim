// src/services/stocks.js - Enhanced with News Integration for Session 11

import { API_LIMITS, CACHE_CONFIG, API_ERROR_CONFIG } from "../constants/app-config.js";
import { 
    filterByDateRange, 
    sortByDateDesc 
} from "../utils/date-utils.js";

/**
 * StockService with live Finnhub API integration
 * Enhanced with research capabilities: company profiles, search, historical data, and NEWS
 */
export class StockService {
    constructor() {
        // Your Finnhub API key (current data)
        this.apiKey = "d1n5qs9r01qlvnp5lkugd1n5qs9r01qlvnp5lkv0";
        this.baseUrl = "https://finnhub.io/api/v1";

        // Your Tiingo API key (historical data)
        this.tiingoApiKey = "5630214e66cda21e12a6a1bcee38baa31eee76f3";
        this.tiingoBaseUrl = "https://api.tiingo.com/tiingo";

        // NEW: Add this line - automatically detects development environment
        this.useMockDataFallback = window.location.hostname === "localhost" || 
                                window.location.hostname === "127.0.0.1" ||
                                window.location.hostname.includes("localhost");
        
        // Client-side cache to minimize API calls
        this.priceCache = new Map();
        this.profileCache = new Map();
        this.searchCache = new Map();
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
        
        // Mock prices (keep existing)
        this.mockPrices = {
            "AAPL": 170.50,
            "GOOG": 1500.25,
            "MSFT": 420.00,
            "TSLA": 180.75,
            "F": 12.45,
            "AMZN": 185.30,
            "NVDA": 1000.00,
            "SMCI": 800.00,
            "AMD": 160.00,
            "NFLX": 600.00,
            "KO": 62.50,
            "META": 450.00,
            "GOOGL": 1495.00,
            "INTC": 45.00,
            "CRM": 280.00
        };

        // Mock profiles (keep existing)
        this.mockProfiles = {
            "MSFT": {
                name: "Microsoft Corporation",
                country: "US",
                currency: "USD",
                exchange: "NASDAQ",
                ipo: "1986-03-13",
                marketCapitalization: 2800000,
                shareOutstanding: 7430000,
                ticker: "MSFT",
                weburl: "https://www.microsoft.com/",
                logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MSFT.png",
                finnhubIndustry: "Technology"
            }
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
        
        const filteredNews = allNews.filter(article => {
            return article.headline.toLowerCase().includes(searchTerm) ||
                   article.summary.toLowerCase().includes(searchTerm) ||
                   article.source.toLowerCase().includes(searchTerm);
        });

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
                id: rawArticle.id || `news_${rawArticle.datetime}_${Math.random().toString(36).substr(2, 9)}`,
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
        // Simple summary generation - could be enhanced
        if (headline.length > 100) {
            return headline.substring(0, 97) + "...";
        }
        return `${headline} - Read the full article for more details.`;
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

    // ==========================================
    // EXISTING METHODS (keep all unchanged)
    // ==========================================

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

    getFallbackStockDetails(ticker) {
        const mockPrice = this.mockPrices[ticker];
        const mockProfile = this.mockProfiles[ticker];
        
        if (!mockPrice) {
            return null;
        }

        const previousClose = mockPrice * (0.98 + Math.random() * 0.04);
        const priceChange = mockPrice - previousClose;
        
        return {
            ticker: ticker,
            companyName: mockProfile?.name || `${ticker} Inc.`,
            currentPrice: mockPrice,
            previousClose,
            dayHigh: mockPrice * 1.02,
            dayLow: mockPrice * 0.98,
            priceChange: parseFloat(priceChange.toFixed(2)),
            priceChangePercent: parseFloat((priceChange / previousClose * 100).toFixed(2)),
            openPrice: previousClose,
            volume: Math.floor(Math.random() * 10000000),
            marketCap: mockProfile?.marketCapitalization || null,
            exchange: mockProfile?.exchange || "NASDAQ",
            currency: mockProfile?.currency || "USD",
            sector: mockProfile?.finnhubIndustry || "Technology",
            website: mockProfile?.weburl || null,
            logo: mockProfile?.logo || null,
            companyProfile: mockProfile,
            lastUpdated: new Date().toISOString()
        };
    }

    async getQuote(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // Check cache first
        const cachedPrice = this.getCachedPrice(upperTicker);
        if (cachedPrice !== null) {
            console.log(`Using cached price for ${upperTicker}: $${cachedPrice}`);
            return cachedPrice;
        }

        if (!this.shouldUseAPI()) {
            return this.getFallbackPrice(upperTicker);
        }

        try {
            // Rate limiting check
            await this.enforceRateLimit();
            
            // Make API call to Finnhub
            const url = `${this.baseUrl}/quote?symbol=${upperTicker}&token=${this.apiKey}`;
            console.log(`Fetching live price for ${upperTicker}...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Finnhub returns current price in 'c' field
            if (data.c && data.c > 0) {
                const price = data.c;
                this.setCachedPrice(upperTicker, price);
                console.log(`Live price for ${upperTicker}: $${price}`);
                return price;
            } else {
                // API returned but no valid price data
                console.warn(`No valid price data for ${upperTicker} from API`);
                return this.getFallbackPrice(upperTicker);
            }
            
        } catch (error) {
            console.error(`Error fetching price for ${upperTicker}:`, error.message);
            return this.getFallbackPrice(upperTicker);
        }
    }

    async getStockDetails(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        try {
            // Use cached or fallback data if API is down
            if (!this.shouldUseAPI()) {
                return this.getFallbackStockDetails(upperTicker);
            }

            // Get both quote and profile in parallel
            const [quoteData, profileData] = await Promise.all([
                this.getQuoteData(upperTicker),
                this.getCompanyProfile(upperTicker)
            ]);

            if (!quoteData) {
                return this.getFallbackStockDetails(upperTicker);
            }

            // Combine quote and profile data
            return {
                ticker: upperTicker,
                companyName: profileData?.name || `${upperTicker} Inc.`,
                currentPrice: quoteData.currentPrice,
                previousClose: quoteData.previousClose,
                dayHigh: quoteData.dayHigh,
                dayLow: quoteData.dayLow,
                priceChange: quoteData.priceChange,
                priceChangePercent: quoteData.priceChangePercent,
                openPrice: quoteData.openPrice,
                volume: quoteData.volume,
                marketCap: profileData?.marketCapitalization || null,
                exchange: profileData?.exchange || "Unknown",
                currency: profileData?.currency || "USD",
                sector: profileData?.finnhubIndustry || "Unknown",
                website: profileData?.weburl || null,
                logo: profileData?.logo || null,
                companyProfile: profileData,
                lastUpdated: new Date().toISOString()
            };

        } catch (error) {
            console.error(`Error fetching stock details for ${upperTicker}:`, error.message);
            return this.getFallbackStockDetails(upperTicker);
        }
    }

    async getQuoteData(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        if (!this.shouldUseAPI()) {
            // Return mock quote data
            const mockPrice = this.mockPrices[upperTicker];
            if (mockPrice) {
                const previousClose = mockPrice * (0.98 + Math.random() * 0.04);
                const priceChange = mockPrice - previousClose;
                
                return {
                    currentPrice: mockPrice,
                    previousClose,
                    dayHigh: mockPrice * 1.02,
                    dayLow: mockPrice * 0.98,
                    openPrice: previousClose,
                    priceChange: parseFloat(priceChange.toFixed(2)),
                    priceChangePercent: parseFloat((priceChange / previousClose * 100).toFixed(2)),
                    volume: Math.floor(Math.random() * 10000000)
                };
            }
            return null;
        }
        
        try {
            await this.enforceRateLimit();
            
            const url = `${this.baseUrl}/quote?symbol=${upperTicker}&token=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.c && data.c > 0) {
                const currentPrice = data.c;
                const previousClose = data.pc || currentPrice;
                const dayHigh = data.h || currentPrice;
                const dayLow = data.l || currentPrice;
                const openPrice = data.o || currentPrice;
                const priceChange = currentPrice - previousClose;
                const priceChangePercent = (priceChange / previousClose) * 100;
                
                this.apiStatus.isDown = false;
                
                return {
                    currentPrice,
                    previousClose,
                    dayHigh,
                    dayLow,
                    openPrice,
                    priceChange: parseFloat(priceChange.toFixed(2)),
                    priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
                    volume: data.v || 0
                };
            }
            
            return null;
            
        } catch (error) {
            this.handleAPIError(error, "quote");
            // Return fallback mock data
            const mockPrice = this.mockPrices[upperTicker];
            if (mockPrice) {
                const previousClose = mockPrice * (0.98 + Math.random() * 0.04);
                const priceChange = mockPrice - previousClose;
                
                return {
                    currentPrice: mockPrice,
                    previousClose,
                    dayHigh: mockPrice * 1.02,
                    dayLow: mockPrice * 0.98,
                    openPrice: previousClose,
                    priceChange: parseFloat(priceChange.toFixed(2)),
                    priceChangePercent: parseFloat((priceChange / previousClose * 100).toFixed(2)),
                    volume: Math.floor(Math.random() * 10000000)
                };
            }
            return null;
        }
    }

    async getCompanyProfile(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // Check cache first
        const cached = this.getFromCache(this.profileCache, upperTicker);
        if (cached) {
            return cached;
        }

        if (!this.shouldUseAPI()) {
            const mockProfile = this.mockProfiles[upperTicker];
            if (mockProfile) {
                this.setInCache(this.profileCache, upperTicker, mockProfile);
                return mockProfile;
            }
            return null;
        }

        try {
            await this.enforceRateLimit();
            
            const url = `${this.baseUrl}/stock/profile2?symbol=${upperTicker}&token=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data && data.name) {
                this.setInCache(this.profileCache, upperTicker, data);
                this.apiStatus.isDown = false;
                return data;
            }
            
            // Fallback to mock data
            const mockProfile = this.mockProfiles[upperTicker];
            if (mockProfile) {
                this.setInCache(this.profileCache, upperTicker, mockProfile);
                return mockProfile;
            }
            
            return null;
            
        } catch (error) {
            this.handleAPIError(error, "profile");
            
            // Return mock profile if available
            const mockProfile = this.mockProfiles[upperTicker];
            if (mockProfile) {
                this.setInCache(this.profileCache, upperTicker, mockProfile);
                return mockProfile;
            }
            
            return null;
        }
    }

    async searchStocks(query) {
        if (!query || query.trim().length < 1) {
            return [];
        }

        const searchQuery = query.trim().toUpperCase();
        
        // Check cache first
        const cached = this.getFromCache(this.searchCache, searchQuery);
        if (cached) {
            return cached;
        }

        if (!this.shouldUseAPI()) {
            return this.getMockSearchResults(searchQuery);
        }

        try {
            await this.enforceRateLimit();
            
            const url = `${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}&token=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data && data.result && Array.isArray(data.result)) {
                const results = data.result
                    .filter(item => item.type === "Common Stock")
                    .slice(0, 10)
                    .map(item => ({
                        symbol: item.symbol,
                        description: item.description,
                        type: item.type,
                        displaySymbol: item.displaySymbol || item.symbol
                    }));
                
                this.setInCache(this.searchCache, searchQuery, results);
                this.apiStatus.isDown = false;
                return results;
            }
            
            return this.getMockSearchResults(searchQuery);
            
        } catch (error) {
            this.handleAPIError(error, "search");
            return this.getMockSearchResults(searchQuery);
        }
    }

    getMockSearchResults(query) {
        const mockResults = [
            { symbol: "AAPL", description: "Apple Inc", type: "Common Stock", displaySymbol: "AAPL" },
            { symbol: "TSLA", description: "Tesla Inc", type: "Common Stock", displaySymbol: "TSLA" },
            { symbol: "MSFT", description: "Microsoft Corporation", type: "Common Stock", displaySymbol: "MSFT" },
            { symbol: "GOOG", description: "Alphabet Inc Class C", type: "Common Stock", displaySymbol: "GOOG" },
            { symbol: "AMZN", description: "Amazon.com Inc", type: "Common Stock", displaySymbol: "AMZN" },
            { symbol: "NVDA", description: "NVIDIA Corporation", type: "Common Stock", displaySymbol: "NVDA" },
            { symbol: "META", description: "Meta Platforms Inc", type: "Common Stock", displaySymbol: "META" },
            { symbol: "NFLX", description: "Netflix Inc", type: "Common Stock", displaySymbol: "NFLX" }
        ];

        return mockResults.filter(stock => 
            stock.symbol.includes(query) || 
            stock.description.toUpperCase().includes(query)
        );
    }

    async getHistoricalData(ticker, resolution = "D", days = 30) {
        const upperTicker = ticker.toUpperCase();
        
        try {
            await this.enforceRateLimit();
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const startDateStr = startDate.toISOString().split("T")[0];
            const endDateStr = endDate.toISOString().split("T")[0];
            
            // Build Tiingo URL
            const tiingoUrl = `https://api.tiingo.com/tiingo/daily/${upperTicker}/prices?startDate=${startDateStr}&endDate=${endDateStr}&token=${this.tiingoApiKey}`;
            
            // Use AllOrigins CORS proxy
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(tiingoUrl)}`;
            
            console.log(`Fetching historical data via CORS proxy for ${upperTicker} (${days} days)...`);
            
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`Proxy error: ${response.status} ${response.statusText}`);
            }
            
            const proxyData = await response.json();
            
            // Check if proxy succeeded
            if (!proxyData.contents) {
                throw new Error("Proxy returned no data");
            }
            
            // Parse the actual Tiingo data
            const data = JSON.parse(proxyData.contents);
            
            if (data && Array.isArray(data) && data.length > 0) {
                console.log(`Successfully fetched ${data.length} data points for ${upperTicker}`);
                
                // Convert Tiingo format to your chart format
                const timestamps = data.map(d => new Date(d.date).getTime() / 1000);
                const closes = data.map(d => d.adjClose || d.close);
                const opens = data.map(d => d.adjOpen || d.open);
                const highs = data.map(d => d.adjHigh || d.high);
                const lows = data.map(d => d.adjLow || d.low);
                const volumes = data.map(d => d.volume || 0);
                
                // Reset API status on success
                this.apiStatus.isDown = false;
                
                return { timestamps, closes, opens, highs, lows, volumes };
            } else {
                console.warn(`No historical data returned for ${upperTicker}`);
                return this.generateMockHistoricalData(upperTicker, days);
            }
            
        } catch (error) {
            console.error(`Error fetching historical data for ${upperTicker}:`, error);
            this.handleAPIError(error, "tiingo-proxy");
            
            // Fallback to mock data
            return this.generateMockHistoricalData(upperTicker, days);
        }
    }

    generateMockHistoricalData(ticker, days) {
        const currentPrice = this.mockPrices[ticker] || 100;
        const timestamps = [];
        const closes = [];
        const opens = [];
        const highs = [];
        const lows = [];
        const volumes = [];
        
        let price = currentPrice * 0.9; // Start 10% lower
        const now = Date.now();
        
        for (let i = days; i >= 0; i--) {
            const timestamp = Math.floor((now - (i * 24 * 60 * 60 * 1000)) / 1000);
            const change = (Math.random() - 0.5) * 0.1; // ±5% daily change
            
            const open = price;
            const close = price * (1 + change);
            const high = Math.max(open, close) * (1 + Math.random() * 0.02);
            const low = Math.min(open, close) * (1 - Math.random() * 0.02);
            const volume = Math.floor(Math.random() * 10000000);
            
            timestamps.push(timestamp);
            opens.push(parseFloat(open.toFixed(2)));
            closes.push(parseFloat(close.toFixed(2)));
            highs.push(parseFloat(high.toFixed(2)));
            lows.push(parseFloat(low.toFixed(2)));
            volumes.push(volume);
            
            price = close;
        }
        
        return { timestamps, closes, opens, highs, lows, volumes };
    }

    // === Cache Management Methods ===

    getCachedPrice(ticker) {
        const cached = this.priceCache.get(ticker);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.price;
        }
        return null;
    }

    setCachedPrice(ticker, price) {
        this.priceCache.set(ticker, {
            price: price,
            timestamp: Date.now()
        });
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

    getFallbackPrice(ticker) {
        const mockPrice = this.mockPrices[ticker];
        if (mockPrice) {
            console.log(`Using fallback mock price for ${ticker}: ${mockPrice}`);
            return mockPrice;
        }
        console.warn(`No fallback price available for ${ticker}`);
        return null;
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

    clearCache() {
        this.priceCache.clear();
        this.profileCache.clear();
        this.searchCache.clear();
        this.newsCache.clear(); // NEW: Clear news cache too
        console.log("All caches cleared");
    }

    getCacheStatus() {
        const now = Date.now();
        
        const cacheInfo = (cache, name) => {
            const entries = Array.from(cache.entries()).map(([key, data]) => ({
                key,
                age: Math.round((now - data.timestamp) / 1000),
                expired: (now - data.timestamp) > this.cacheTimeout
            }));
            return { name, totalEntries: cache.size, entries };
        };

        return {
            cacheTimeout: this.cacheTimeout / 1000,
            prices: cacheInfo(this.priceCache, "prices"),
            profiles: cacheInfo(this.profileCache, "profiles"),
            searches: cacheInfo(this.searchCache, "searches"),
            news: cacheInfo(this.newsCache, "news") // NEW: Include news cache status
        };
    }
}