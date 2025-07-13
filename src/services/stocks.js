// src/services/stocks.js
/**
 * StockService with live Finnhub API integration
 * Includes caching, error handling, and fallback to mock data
 */
export class StockService {
    constructor() {
        // Your Finnhub API key - in production, this should come from environment variables
        this.apiKey = 'd1n5qs9r01qlvnp5lkugd1n5qs9r01qlvnp5lkv0'; // Replace with your actual key
        this.baseUrl = 'https://finnhub.io/api/v1';
        
        // Client-side cache to minimize API calls
        this.priceCache = new Map();
        this.cacheTimeout = 60 * 1000; // 1 minute cache
        
        // Rate limiting
        this.lastApiCall = 0;
        this.minTimeBetweenCalls = 1000; // 1 second between API calls
        
        // Mock prices as fallback
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
            // Get current quote
            const price = await this.getQuote(upperTicker);
            if (!price) {
                return null;
            }

            // Rate limiting for second API call
            await this.enforceRateLimit();

            // Get company profile for name
            const profileUrl = `${this.baseUrl}/stock/profile2?symbol=${upperTicker}&token=${this.apiKey}`;
            let companyName = `${upperTicker} Inc.`; // Default fallback
            
            try {
                const profileResponse = await fetch(profileUrl);
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    if (profileData.name) {
                        companyName = profileData.name;
                    }
                }
            } catch (profileError) {
                console.warn(`Could not fetch company profile for ${upperTicker}:`, profileError.message);
            }

            // Calculate mock daily stats (Finnhub has previous close data, but keeping it simple for now)
            const previousClose = price * (0.98 + Math.random() * 0.04); // Mock ±2% variation
            const priceChange = price - previousClose;
            const priceChangePercent = (priceChange / previousClose) * 100;

            return {
                ticker: upperTicker,
                companyName: companyName,
                currentPrice: price,
                previousClose: previousClose,
                dayHigh: price * (1 + Math.random() * 0.02), // Mock +2% max
                dayLow: price * (1 - Math.random() * 0.02), // Mock -2% max
                priceChange: priceChange.toFixed(2),
                priceChangePercent: priceChangePercent.toFixed(2),
                lastUpdated: new Date().toISOString()
            };

        } catch (error) {
            console.error(`Error fetching stock details for ${upperTicker}:`, error.message);
            return null;
        }
    }

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
        const timeSinceLastCall = Date.now() - this.lastApiCall;
        if (timeSinceLastCall < this.minTimeBetweenCalls) {
            const waitTime = this.minTimeBetweenCalls - timeSinceLastCall;
            console.log(`Rate limiting: waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastApiCall = Date.now();
    }

    /**
     * Clear the price cache (useful for testing or manual refresh)
     */
    clearCache() {
        this.priceCache.clear();
        console.log('Price cache cleared');
    }

    /**
     * Get cache status for debugging
     */
    getCacheStatus() {
        const now = Date.now();
        const cacheEntries = Array.from(this.priceCache.entries()).map(([ticker, data]) => ({
            ticker,
            price: data.price,
            age: Math.round((now - data.timestamp) / 1000),
            expired: (now - data.timestamp) > this.cacheTimeout
        }));
        return {
            totalEntries: this.priceCache.size,
            cacheTimeout: this.cacheTimeout / 1000,
            entries: cacheEntries
        };
    }
}