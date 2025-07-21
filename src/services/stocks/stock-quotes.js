/**
 * Stock Quotes Service
 * 
 * Handles stock quotes, profiles, search, and historical data
 * Extracted from services/stocks.js
 */

import { roundToDecimals } from "../../utils/currency-utils";

export class StockQuotesService {
    constructor(apiService, cacheService) {
        this.apiService = apiService;
        this.cacheService = cacheService;
        
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
            priceChange: Math.round(priceChange * 100) / 100,
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
        const cachedPrice = this.cacheService.getCachedPrice(upperTicker);
        if (cachedPrice !== null) {
            console.log(`Using cached price for ${upperTicker}: $${cachedPrice}`);
            return cachedPrice;
        }

        if (!this.apiService.shouldUseAPI()) {
            return this.getFallbackPrice(upperTicker);
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
            if (!this.apiService.shouldUseAPI()) {
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
        
        if (!this.apiService.shouldUseAPI()) {
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
                    priceChange: Math.round(priceChange * 100) / 100,
                    priceChangePercent: parseFloat((priceChange / previousClose * 100).toFixed(2)),
                    volume: Math.floor(Math.random() * 10000000)
                };
            }
            return null;
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

    async getHistoricalData(ticker, _resolution = "D", days = 30) {
        const upperTicker = ticker.toUpperCase();
        
        try {
            await this.apiService.enforceRateLimit();
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const startDateStr = startDate.toISOString().split("T")[0];
            const endDateStr = endDate.toISOString().split("T")[0];
            
            // Build Tiingo URL
            const tiingoUrl = `https://api.tiingo.com/tiingo/daily/${upperTicker}/prices?startDate=${startDateStr}&endDate=${endDateStr}&token=${this.apiService.tiingoApiKey}`;
            
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
                this.apiService.apiStatus.isDown = false;
                
                return { timestamps, closes, opens, highs, lows, volumes };
            } else {
                console.warn(`No historical data returned for ${upperTicker}`);
                return this.generateMockHistoricalData(upperTicker, days);
            }
            
        } catch (error) {
            console.error(`Error fetching historical data for ${upperTicker}:`, error);
            this.apiService.handleAPIError(error, "tiingo-proxy");
            
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
            opens.push(roundToDecimals(open));
            closes.push(roundToDecimals(close));
            highs.push(roundToDecimals(high));
            lows.push(roundToDecimals(low));
            volumes.push(volume);
            
            price = close;
        }
        
        return { timestamps, closes, opens, highs, lows, volumes };
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
}