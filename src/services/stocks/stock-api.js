// file: src/services/stocks/stock-api.js

/**
 * Stock API Service
 * 
 * Handles core API functionality: rate limiting, error handling, configuration
 * Extracted from services/stocks.js
 */

import { API_LIMITS, API_ERROR_CONFIG } from "../../constants/app-config.js";

export class StockApiService {
    constructor() {
        // Primary APIs (current)
        this.apiKey = "d1n5qs9r01qlvnp5lkugd1n5qs9r01qlvnp5lkv0";
        this.baseUrl = "https://finnhub.io/api/v1";
        this.tiingoApiKey = "5630214e66cda21e12a6a1bcee38baa31eee76f3";
        this.tiingoBaseUrl = "https://api.tiingo.com/tiingo";

        // Fallback APIs (ADD THESE)
        this.alphaVantageApiKey = "FUBGE11HDHIW3Q2R"; // Get from alphavantage.co
        this.alphaVantageBaseUrl = "https://www.alphavantage.co/query";
        
        this.polygonApiKey = "N7prgzMP4gh00AKRVAAahn1s43zAf4zv"; // Get from polygon.io
        this.polygonBaseUrl = "https://api.polygon.io";

        // API status tracking for each service
        this.apiStatus = {
            finnhub: { isDown: false, lastFailureTime: 0 },
            tiingo: { isDown: false, lastFailureTime: 0 },
            alphaVantage: { isDown: false, lastFailureTime: 0 },
            polygon: { isDown: false, lastFailureTime: 0 }
        };

        // NEW: Add this line - automatically detects development environment
        this.useMockDataFallback = false; // Set to false for production

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
    }

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

    // Enhanced error handling for specific APIs
    handleAPIError(error, endpoint, apiName) {
        console.error(`${apiName} API Error at ${endpoint}:`, error.message);
        
        if (error.message.includes("403") || error.message.includes("429")) {
            this.apiStatus[apiName].isDown = true;
            this.apiStatus[apiName].lastFailureTime = Date.now();
            console.warn(`${apiName} API marked as down. Will try fallback APIs.`);
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

    // Add method to check which APIs are available
    getAvailableAPI(apiType) {
        const now = Date.now();
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes

        if (apiType === "quotes") {
            // Try Finnhub first, then Alpha Vantage
            if (!this.apiStatus.finnhub.isDown || 
                (now - this.apiStatus.finnhub.lastFailureTime) > cooldownPeriod) {
                return "finnhub";
            }
            if (!this.apiStatus.alphaVantage.isDown || 
                (now - this.apiStatus.alphaVantage.lastFailureTime) > cooldownPeriod) {
                return "alphaVantage";
            }
        }

        if (apiType === "historical") {
            // Try Tiingo first, then Alpha Vantage, then Polygon
            if (!this.apiStatus.tiingo.isDown || 
                (now - this.apiStatus.tiingo.lastFailureTime) > cooldownPeriod) {
                return "tiingo";
            }
            if (!this.apiStatus.alphaVantage.isDown || 
                (now - this.apiStatus.alphaVantage.lastFailureTime) > cooldownPeriod) {
                return "alphaVantage";
            }
            if (!this.apiStatus.polygon.isDown || 
                (now - this.apiStatus.polygon.lastFailureTime) > cooldownPeriod) {
                return "polygon";
            }
        }

        return null; // All APIs are down
    }
}