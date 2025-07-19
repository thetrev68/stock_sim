/**
 * Stock API Service
 * 
 * Handles core API functionality: rate limiting, error handling, configuration
 * Extracted from services/stocks.js
 */

import { API_LIMITS, API_ERROR_CONFIG } from "../../constants/app-config.js";

export class StockApiService {
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
}