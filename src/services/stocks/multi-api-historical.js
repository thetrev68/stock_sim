// src/services/stocks/multi-api-historical.js
// Multi-provider historical data service with fallback support

export class MultiApiHistoricalService {
    constructor(apiService, cacheService) {
        this.apiService = apiService;
        this.cacheService = cacheService;
    }

    async getHistoricalData(ticker, _resolution = "D", days = 30) {
        const upperTicker = ticker.toUpperCase();
        
        // Try APIs in order of preference
        const apiProvider = this.apiService.getAvailableAPI("historical");
        
        switch (apiProvider) {
            case "tiingo":
                return await this.getTiingoHistoricalData(upperTicker, days);
            case "alphaVantage":
                return await this.getAlphaVantageHistoricalData(upperTicker, days);
            case "polygon":
                return await this.getPolygonHistoricalData(upperTicker, days);
            default:
                console.warn("All historical data APIs are temporarily unavailable");
                throw new Error("Historical data temporarily unavailable. Please try again later.");
        }
    }

    // Tiingo implementation (your current one, but with better error handling)
    async getTiingoHistoricalData(ticker, days) {
        try {
            await this.apiService.enforceRateLimit();
            
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const startDateStr = startDate.toISOString().split("T")[0];
            const endDateStr = endDate.toISOString().split("T")[0];
            
            // Try direct API call first (might work!)
            let tiingoUrl = `https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=${startDateStr}&endDate=${endDateStr}&token=${this.apiService.tiingoApiKey}`;
            
            console.log(`Trying Tiingo direct API for ${ticker}...`);
            let response = await fetch(tiingoUrl);
            
            // If direct fails, try CORS proxy
            if (!response.ok) {
                console.log(`Direct Tiingo failed, trying CORS proxy...`);
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(tiingoUrl)}`;
                response = await fetch(proxyUrl);
                
                if (!response.ok) {
                    throw new Error(`Tiingo proxy failed: ${response.status}`);
                }
                
                const proxyData = await response.json();
                if (!proxyData.contents) {
                    throw new Error("Proxy returned no data");
                }
                const data = JSON.parse(proxyData.contents);
                return this.formatTiingoData(data, ticker, days);
            } else {
                const data = await response.json();
                return this.formatTiingoData(data, ticker, days);
            }
            
        } catch (error) {
            console.error(`Tiingo failed for ${ticker}:`, error);
            this.apiService.handleAPIError(error, "historical", "tiingo");
            throw error; // Let the caller try the next API
        }
    }

    // Alpha Vantage implementation (fallback #1)
    async getAlphaVantageHistoricalData(ticker, days) {
        try {
            await this.apiService.enforceRateLimit();
            
            // Alpha Vantage daily time series (free tier: 500 calls/day)
            const url = `${this.apiService.alphaVantageBaseUrl}?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${this.apiService.alphaVantageApiKey}&outputsize=compact`;
            
            console.log(`Trying Alpha Vantage for ${ticker}...`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Alpha Vantage error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data["Error Message"]) {
                throw new Error(`Alpha Vantage: ${data["Error Message"]}`);
            }
            
            if (data["Note"]) {
                throw new Error(`Alpha Vantage rate limit: ${data["Note"]}`);
            }
            
            const timeSeries = data["Time Series (Daily)"];
            if (!timeSeries) {
                throw new Error("No time series data from Alpha Vantage");
            }
            
            return this.formatAlphaVantageData(timeSeries, ticker, days);
            
        } catch (error) {
            console.error(`Alpha Vantage failed for ${ticker}:`, error);
            this.apiService.handleAPIError(error, "historical", "alphaVantage");
            throw error;
        }
    }

    // Polygon.io implementation (fallback #2)
    async getPolygonHistoricalData(ticker, days) {
        try {
            await this.apiService.enforceRateLimit();
            
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const startDateStr = startDate.toISOString().split("T")[0];
            const endDateStr = endDate.toISOString().split("T")[0];
            
            // Polygon aggregates endpoint (free tier: 5 calls/minute)
            const url = `${this.apiService.polygonBaseUrl}/v2/aggs/ticker/${ticker}/range/1/day/${startDateStr}/${endDateStr}?adjusted=true&sort=asc&apikey=${this.apiService.polygonApiKey}`;
            
            console.log(`Trying Polygon.io for ${ticker}...`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Polygon error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== "OK") {
                throw new Error(`Polygon API status: ${data.status}`);
            }
            
            if (!data.results || data.results.length === 0) {
                throw new Error("No results from Polygon");
            }
            
            return this.formatPolygonData(data.results, ticker, days);
            
        } catch (error) {
            console.error(`Polygon failed for ${ticker}:`, error);
            this.apiService.handleAPIError(error, "historical", "polygon");
            throw error;
        }
    }

    // Data formatting methods
    formatTiingoData(data, _ticker, _days) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error(`No historical data available for ${_ticker}`);
        }

        const timestamps = data.map(d => new Date(d.date).getTime() / 1000);
        const closes = data.map(d => d.adjClose || d.close);
        const opens = data.map(d => d.adjOpen || d.open);
        const highs = data.map(d => d.adjHigh || d.high);
        const lows = data.map(d => d.adjLow || d.low);
        const volumes = data.map(d => d.volume || 0);

        console.log(`Successfully formatted ${data.length} Tiingo data points for ${_ticker}`);
        return { timestamps, closes, opens, highs, lows, volumes };
    }

    formatAlphaVantageData(timeSeries, _ticker, _days) {
        const dates = Object.keys(timeSeries).sort().slice(-30); // Use fixed number instead of days param
        
        const timestamps = dates.map(date => new Date(date).getTime() / 1000);
        const closes = dates.map(date => parseFloat(timeSeries[date]["4. close"]));
        const opens = dates.map(date => parseFloat(timeSeries[date]["1. open"]));
        const highs = dates.map(date => parseFloat(timeSeries[date]["2. high"]));
        const lows = dates.map(date => parseFloat(timeSeries[date]["3. low"]));
        const volumes = dates.map(date => parseInt(timeSeries[date]["5. volume"]));

        console.log(`Successfully formatted ${dates.length} Alpha Vantage data points for ${_ticker}`);
        return { timestamps, closes, opens, highs, lows, volumes };
    }

    formatPolygonData(results, _ticker, _days) {
        const timestamps = results.map(d => d.t / 1000); // Polygon uses milliseconds
        const closes = results.map(d => d.c);
        const opens = results.map(d => d.o);
        const highs = results.map(d => d.h);
        const lows = results.map(d => d.l);
        const volumes = results.map(d => d.v);

        console.log(`Successfully formatted ${results.length} Polygon data points for ${_ticker}`);
        return { timestamps, closes, opens, highs, lows, volumes };
    }

    // Remove mock data generator - we'll use error states instead
}