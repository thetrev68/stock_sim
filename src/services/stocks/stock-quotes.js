/**
 * Stock Quotes Service
 * 
 * Handles stock quotes, profiles, search, and historical data
 * Extracted from services/stocks.js
 */

// import { roundToDecimals } from "../../utils/currency-utils";
import { MultiApiHistoricalService } from "./multi-api-historical.js";

export class StockQuotesService {
    constructor(apiService, cacheService) {
        this.apiService = apiService;
        this.cacheService = cacheService;

        this.multiApiHistorical = new MultiApiHistoricalService(apiService, cacheService);
    }

    async getQuote(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // Check cache first
        const cachedPrice = this.cacheService.getCachedPrice(upperTicker);
        if (cachedPrice !== null) {
            console.log(`Using cached price for ${upperTicker}: $${cachedPrice}`);
            return cachedPrice;
        }

        if (!this.apiService.shouldUseAPI()) {
            throw new Error(`Price data temporarily unavailable for ${upperTicker}`);
        }

        try {
            // Rate limiting check
            await this.apiService.enforceRateLimit();
            
            // Make API call to Finnhub
            const url = `${this.apiService.baseUrl}/quote?symbol=${upperTicker}&token=${this.apiService.apiKey}`;
            console.log(`Fetching live price for ${upperTicker}...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Finnhub returns current price in 'c' field
            if (data.c && data.c > 0) {
                const price = data.c;
                this.cacheService.setCachedPrice(upperTicker, price);
                console.log(`Live price for ${upperTicker}: $${price}`);
                return price;
            } else {
                // API returned but no valid price data
                console.warn(`No valid price data for ${upperTicker} from API`);
                throw new Error(`No valid price data available for ${upperTicker}`);
            }
            
        } catch (error) {
            console.error(`Error fetching price for ${upperTicker}:`, error.message);
            throw new Error(`Price data temporarily unavailable for ${upperTicker}`);
        }
    }

    async getStockDetails(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        try {
            // Check if API should be used
            if (!this.apiService.shouldUseAPI()) {
                throw new Error(`Stock details temporarily unavailable for ${upperTicker}`);
            }

            // Get both quote and profile in parallel
            const [quoteData, profileData] = await Promise.all([
                this.getQuoteData(upperTicker),
                this.getCompanyProfile(upperTicker)
            ]);

            if (!quoteData) {
                throw new Error(`Quote data unavailable for ${upperTicker}`);
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
            throw new Error(`Stock details temporarily unavailable for ${upperTicker}`);
        }
    }

    async getQuoteData(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // Remove the mock data section and replace with:
        if (!this.apiService.shouldUseAPI()) {
            throw new Error(`Quote data temporarily unavailable for ${ticker}`);
        }
        
        try {
            await this.apiService.enforceRateLimit();
            
            const url = `${this.apiService.baseUrl}/quote?symbol=${upperTicker}&token=${this.apiService.apiKey}`;
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
                
                this.apiService.apiStatus.isDown = false;
                
                return {
                    currentPrice,
                    previousClose,
                    dayHigh,
                    dayLow,
                    openPrice,
                    priceChange: Math.round(priceChange * 100) / 100,
                    priceChangePercent: Math.round(priceChangePercent * 100) / 100,
                    volume: data.v || 0
                };
            }
            
            return null;
            
        } catch (error) {
            this.apiService.handleAPIError(error, "quote");
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
                    priceChange: Math.round(priceChange * 100) / 100,
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
        const cached = this.cacheService.getFromCache(this.cacheService.getProfileCache(), upperTicker);
        if (cached) {
            return cached;
        }

        if (!this.apiService.shouldUseAPI()) {
            const mockProfile = this.mockProfiles[upperTicker];
            if (mockProfile) {
                this.cacheService.setInCache(this.cacheService.getProfileCache(), upperTicker, mockProfile);
                return mockProfile;
            }
            return null;
        }

        try {
            await this.apiService.enforceRateLimit();
            
            const url = `${this.apiService.baseUrl}/stock/profile2?symbol=${upperTicker}&token=${this.apiService.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data && data.name) {
                this.cacheService.setInCache(this.cacheService.getProfileCache(), upperTicker, data);
                this.apiService.apiStatus.isDown = false;
                return data;
            }
            
            // Fallback to mock data
            const mockProfile = this.mockProfiles[upperTicker];
            if (mockProfile) {
                this.cacheService.setInCache(this.cacheService.getProfileCache(), upperTicker, mockProfile);
                return mockProfile;
            }
            
            return null;
            
        } catch (error) {
            this.apiService.handleAPIError(error, "profile");
            
            // Return mock profile if available
            const mockProfile = this.mockProfiles[upperTicker];
            if (mockProfile) {
                this.cacheService.setInCache(this.cacheService.getProfileCache(), upperTicker, mockProfile);
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
        const cached = this.cacheService.getFromCache(this.cacheService.getSearchCache(), searchQuery);
        if (cached) {
            return cached;
        }

        if (!this.apiService.shouldUseAPI()) {
            return this.getMockSearchResults(searchQuery);
        }

        try {
            await this.apiService.enforceRateLimit();
            
            const url = `${this.apiService.baseUrl}/search?q=${encodeURIComponent(searchQuery)}&token=${this.apiService.apiKey}`;
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
                
                this.cacheService.setInCache(this.cacheService.getSearchCache(), searchQuery, results);
                this.apiService.apiStatus.isDown = false;
                return results;
            }
            
            return this.getMockSearchResults(searchQuery);
            
        } catch (error) {
            this.apiService.handleAPIError(error, "search");
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
        // Use the multi-API service instead of single Tiingo approach
        return await this.multiApiHistorical.getHistoricalData(ticker, resolution, days);
    }

    

    
}