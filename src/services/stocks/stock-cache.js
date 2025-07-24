// file: src/services/stocks/stock-cache.js

/**
 * Stock Cache Service
 * 
 * Handles all caching logic for stock data
 * Extracted from services/stocks.js
 */

import { CACHE_CONFIG } from "../../constants/app-config.js";

export class StockCacheService {
    constructor() {
        // Client-side cache to minimize API calls
        this.priceCache = new Map();
        this.profileCache = new Map();
        this.searchCache = new Map();
        this.cacheTimeout = CACHE_CONFIG.STOCK_PRICES; // 5 minutes cache
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

    clearCache() {
        this.priceCache.clear();
        this.profileCache.clear();
        this.searchCache.clear();
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
            searches: cacheInfo(this.searchCache, "searches")
        };
    }

    // === Cache Access for Other Services ===

    getPriceCache() {
        return this.priceCache;
    }

    getProfileCache() {
        return this.profileCache;
    }

    getSearchCache() {
        return this.searchCache;
    }
}