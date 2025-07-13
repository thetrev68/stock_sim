// src/services/stocks.js
/**
 * Provides mock stock price data for testing purposes.
 * In Session 4, this will be replaced with real API calls.
 */
export class StockService {
    constructor() {
        this.mockPrices = {
            'AAPL': 170.50,
            'GOOG': 1500.25,
            'MSFT': 420.00,
            'TSLA': 180.75,
            'AMZN': 185.30,
            'NVDA': 1000.00,
            'SMCI': 800.00,
            'AMD': 160.00,
            'NFLX': 600.00,
            'KO': 62.50,
            // Add more mock prices as needed
        };
    }

    /**
     * Fetches a mock current price for a given ticker.
     * Simulates network delay.
     * @param {string} ticker - The stock ticker symbol.
     * @returns {Promise<number|null>} The mock price or null if not found.
     */
    async getQuote(ticker) {
        return new Promise(resolve => {
            setTimeout(() => {
                const price = this.mockPrices[ticker.toUpperCase()];
                if (price) {
                    console.log(`Mock price for ${ticker}: $${price}`);
                    resolve(price);
                } else {
                    console.warn(`Mock price not found for ${ticker}`);
                    resolve(null);
                }
            }, 500); // Simulate 500ms network delay
        });
    }

    /**
     * Fetches mock detailed stock info for a given ticker.
     * (Currently just returns the price, will be expanded later)
     * @param {string} ticker - The stock ticker symbol.
     * @returns {Promise<object|null>} Mock detailed info or null if not found.
     */
    async getStockDetails(ticker) {
        const price = await this.getQuote(ticker);
        if (price) {
            return {
                ticker: ticker.toUpperCase(),
                companyName: `${ticker.toUpperCase()} Corporation`,
                currentPrice: price,
                previousClose: price * (1 - 0.005 + Math.random() * 0.01), // Simulate small variation
                dayHigh: price * (1 + Math.random() * 0.01),
                dayLow: price * (1 - Math.random() * 0.01),
                priceChange: (price * (0.01 - Math.random() * 0.02)).toFixed(2), // Random change
                priceChangePercent: ((price * (0.01 - Math.random() * 0.02)) / price * 100).toFixed(2),
                // ... other mock details
            };
        }
        return null;
    }
}