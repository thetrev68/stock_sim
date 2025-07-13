// src/services/stocks.js - Enhanced for Session 10 Research Features
/**
 * StockService with live Finnhub API integration
 * Enhanced with research capabilities: company profiles, search, historical data
 */
export class StockService {
    constructor() {
    // Your Finnhub API key (current data)
    this.apiKey = 'd1n5qs9r01qlvnp5lkugd1n5qs9r01qlvnp5lkv0';
    this.baseUrl = 'https://finnhub.io/api/v1';

    // Your Tiingo API key (historical data)
    this.tiingoApiKey = '5630214e66cda21e12a6a1bcee38baa31eee76f3';
    this.tiingoBaseUrl = 'https://api.tiingo.com/tiingo';
    
    // Client-side cache to minimize API calls
    this.priceCache = new Map();
    this.profileCache = new Map();
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // CHANGE: Increase to 5 minutes cache
    
    // Enhanced rate limiting
    this.lastApiCall = 0;
    this.minTimeBetweenCalls = 2000; // CHANGE: Increase to 2 seconds
    this.apiCallCount = 0;
    this.maxCallsPerMinute = 30; // NEW: Conservative limit
    this.callTimestamps = []; // NEW: Track call timestamps
    
    // NEW: API status tracking
    this.apiStatus = {
        isDown: false,
        lastFailureTime: 0,
        cooldownPeriod: 5 * 60 * 1000 // 5 minutes cooldown after failures
    };
    
    // EXPAND: Add more mock prices (add these to your existing ones)
    this.mockPrices = {
        'AAPL': 170.50,
        'GOOG': 1500.25,
        'MSFT': 420.00,
        'TSLA': 180.75,
        'F': 12.45,
        'AMZN': 185.30,
        'NVDA': 1000.00,
        'SMCI': 800.00,
        'AMD': 160.00,
        'NFLX': 600.00,
        'KO': 62.50,
        'META': 450.00,        // NEW
        'GOOGL': 1495.00,      // NEW
        'INTC': 45.00,         // NEW
        'CRM': 280.00          // NEW
    };

    // EXPAND: Add MSFT to your existing mockProfiles
    this.mockProfiles = {
        // ... keep your existing AAPL and TSLA entries ...
        'MSFT': {  // ADD THIS NEW ENTRY
            name: 'Microsoft Corporation',
            country: 'US',
            currency: 'USD',
            exchange: 'NASDAQ',
            ipo: '1986-03-13',
            marketCapitalization: 2800000,
            shareOutstanding: 7430000,
            ticker: 'MSFT',
            weburl: 'https://www.microsoft.com/',
            logo: 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MSFT.png',
            finnhubIndustry: 'Technology'
        }
    };
}

    /**
     * Check if API should be used based on current status and rate limits
     */
    shouldUseAPI() {
        const now = Date.now();
        
        // Check if API is in cooldown after failures
        if (this.apiStatus.isDown && (now - this.apiStatus.lastFailureTime) < this.apiStatus.cooldownPeriod) {
            console.log('API in cooldown, using fallback data');
            return false;
        }
        
        // Check rate limiting
        this.callTimestamps = this.callTimestamps.filter(timestamp => now - timestamp < 60000);
        if (this.callTimestamps.length >= this.maxCallsPerMinute) {
            console.log('Rate limit exceeded, using fallback data');
            return false;
        }
        
        return true;
    }

    /**
     * Handle API errors and update status
     */
    handleAPIError(error, endpoint) {
        console.error(`API Error at ${endpoint}:`, error.message);
        
        // If it's a 403 or 429, mark API as down temporarily
        if (error.message.includes('403') || error.message.includes('429')) {
            this.apiStatus.isDown = true;
            this.apiStatus.lastFailureTime = Date.now();
            console.warn('API marked as down due to rate limiting. Using fallback data for 5 minutes.');
        }
    }

    /**
     * Create fallback stock details from mock data
     */
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
            exchange: mockProfile?.exchange || 'NASDAQ',
            currency: mockProfile?.currency || 'USD',
            sector: mockProfile?.finnhubIndustry || 'Technology',
            website: mockProfile?.weburl || null,
            logo: mockProfile?.logo || null,
            companyProfile: mockProfile,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Fetches current price for a given ticker from Finnhub API
     * @param {string} ticker - The stock ticker symbol
     * @returns {Promise<number|null>} The current price or null if not found
     */
    async getQuote(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // Check cache first
        const cachedPrice = this.getCachedPrice(upperTicker);
        if (cachedPrice !== null) {
            console.log(`Using cached price for ${upperTicker}: $${cachedPrice}`);
            return cachedPrice;
        }

        // ADD THIS CHECK:
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

    /**
     * Fetches detailed stock info including price, company name, and daily stats
     * @param {string} ticker - The stock ticker symbol
     * @returns {Promise<object|null>} Detailed stock info or null if not found
     */
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
                exchange: profileData?.exchange || 'Unknown',
                currency: profileData?.currency || 'USD',
                sector: profileData?.finnhubIndustry || 'Unknown',
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

    /**
     * Get detailed quote data from Finnhub API
     * @param {string} ticker - The stock ticker symbol
     * @returns {Promise<object|null>} Quote data object or null
     */
    async getQuoteData(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // ADD THIS CHECK:
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
                
                // ADD THIS: Reset API status on success
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
            // CHANGE THIS: Replace your existing catch block
            this.handleAPIError(error, 'quote');
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

    /**
     * Get company profile information
     * @param {string} ticker - The stock ticker symbol
     * @returns {Promise<object|null>} Company profile or null
     */
    async getCompanyProfile(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // Check cache first (keep your existing cache check)
        const cached = this.getFromCache(this.profileCache, upperTicker);
        if (cached) {
            return cached;
        }

        // ADD THIS CHECK:
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
                // ADD THIS:
                this.apiStatus.isDown = false;
                return data;
            }
            
            // Fallback to mock data (keep your existing fallback logic)
            const mockProfile = this.mockProfiles[upperTicker];
            if (mockProfile) {
                this.setInCache(this.profileCache, upperTicker, mockProfile);
                return mockProfile;
            }
            
            return null;
            
        } catch (error) {
            // CHANGE THIS: Replace your existing catch block
            this.handleAPIError(error, 'profile');
            
            // Return mock profile if available
            const mockProfile = this.mockProfiles[upperTicker];
            if (mockProfile) {
                this.setInCache(this.profileCache, upperTicker, mockProfile);
                return mockProfile;
            }
            
            return null;
        }
    }

    /**
     * Search for stocks by symbol or company name
     * @param {string} query - Search query (ticker or company name)
     * @returns {Promise<Array>} Array of search results
     */
    async searchStocks(query) {
        if (!query || query.trim().length < 1) {
            return [];
        }

        const searchQuery = query.trim().toUpperCase();
        
        // Check cache first (keep your existing cache check)
        const cached = this.getFromCache(this.searchCache, searchQuery);
        if (cached) {
            return cached;
        }

        // ADD THIS CHECK:
        if (!this.shouldUseAPI()) {
            return this.getMockSearchResults(searchQuery);
        }

        try {
            await this.enforceRateLimit();
            
            // ... rest of your existing method stays the same ...
            // BUT in the catch block, change to:
            
        } catch (error) {
            this.handleAPIError(error, 'search');  // CHANGE THIS LINE
            return this.getMockSearchResults(searchQuery);
        }
    }

    /**
     * Get mock search results for fallback
     * @param {string} query - Search query
     * @returns {Array} Mock search results
     */
    getMockSearchResults(query) {
        const mockResults = [
            { symbol: 'AAPL', description: 'Apple Inc', type: 'Common Stock', displaySymbol: 'AAPL' },
            { symbol: 'TSLA', description: 'Tesla Inc', type: 'Common Stock', displaySymbol: 'TSLA' },
            { symbol: 'MSFT', description: 'Microsoft Corporation', type: 'Common Stock', displaySymbol: 'MSFT' },
            { symbol: 'GOOG', description: 'Alphabet Inc Class C', type: 'Common Stock', displaySymbol: 'GOOG' },
            { symbol: 'AMZN', description: 'Amazon.com Inc', type: 'Common Stock', displaySymbol: 'AMZN' },
            { symbol: 'NVDA', description: 'NVIDIA Corporation', type: 'Common Stock', displaySymbol: 'NVDA' },
            { symbol: 'META', description: 'Meta Platforms Inc', type: 'Common Stock', displaySymbol: 'META' },
            { symbol: 'NFLX', description: 'Netflix Inc', type: 'Common Stock', displaySymbol: 'NFLX' }
        ];

        return mockResults.filter(stock => 
            stock.symbol.includes(query) || 
            stock.description.toUpperCase().includes(query)
        );
    }

    /**
     * Get historical price data for charts
     * @param {string} ticker - Stock ticker symbol
     * @param {string} resolution - Resolution (1, 5, 15, 30, 60, D, W, M)
     * @param {number} days - Number of days back
     * @returns {Promise<object|null>} Historical data or null
     */
    async getHistoricalData(ticker, resolution = 'D', days = 30) {
        const upperTicker = ticker.toUpperCase();
        
        try {
            await this.enforceRateLimit();
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
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
                throw new Error('Proxy returned no data');
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
            this.handleAPIError(error, 'tiingo-proxy');
            
            // Fallback to mock data
            return this.generateMockHistoricalData(upperTicker, days);
        }
    }

    /**
     * Generate mock historical data for charts
     * @param {string} ticker - Stock ticker
     * @param {number} days - Number of days
     * @returns {object} Mock historical data
     */
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

    /**
     * Check cache for a recent price
     * @param {string} ticker - The stock ticker symbol
     * @returns {number|null} Cached price or null if not found/expired
     */
    getCachedPrice(ticker) {
        const cached = this.priceCache.get(ticker);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.price;
        }
        return null;
    }

    /**
     * Store price in cache with timestamp
     * @param {string} ticker - The stock ticker symbol
     * @param {number} price - The price to cache
     */
    setCachedPrice(ticker, price) {
        this.priceCache.set(ticker, {
            price: price,
            timestamp: Date.now()
        });
    }

    /**
     * Generic cache getter
     * @param {Map} cache - Cache map to check
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null
     */
    getFromCache(cache, key) {
        const cached = cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.data;
        }
        return null;
    }

    /**
     * Generic cache setter
     * @param {Map} cache - Cache map to set
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    setInCache(cache, key, data) {
        cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * Get fallback mock price when API fails
     * @param {string} ticker - The stock ticker symbol
     * @returns {number|null} Mock price or null if not found
     */
    getFallbackPrice(ticker) {
        const mockPrice = this.mockPrices[ticker];
        if (mockPrice) {
            console.log(`Using fallback mock price for ${ticker}: $${mockPrice}`);
            return mockPrice;
        }
        console.warn(`No fallback price available for ${ticker}`);
        return null;
    }

    /**
     * Simple rate limiting to avoid hitting API limits
     */
    async enforceRateLimit() {
        const now = Date.now();
        
        // Clean old timestamps
        this.callTimestamps = this.callTimestamps.filter(timestamp => now - timestamp < 60000);
        
        // Check if we're hitting rate limits
        if (this.callTimestamps.length >= this.maxCallsPerMinute) {
            const oldestCall = Math.min(...this.callTimestamps);
            const waitTime = 60000 - (now - oldestCall) + 1000; // Wait until we can make another call
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

    /**
     * Clear all caches (useful for testing or manual refresh)
     */
    clearCache() {
        this.priceCache.clear();
        this.profileCache.clear();
        this.searchCache.clear();
        console.log('All caches cleared');
    }

    /**
     * Get cache status for debugging
     */
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
            prices: cacheInfo(this.priceCache, 'prices'),
            profiles: cacheInfo(this.profileCache, 'profiles'),
            searches: cacheInfo(this.searchCache, 'searches')
        };
    }
}