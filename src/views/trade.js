// Trade view
import { StockService } from '../services/stocks.js';
import { initializePortfolio, getPortfolio, executeTrade, getRecentTrades } from '../services/trading.js';
import { AuthService } from '../services/auth.js';

export default class TradeView {
    constructor() {
        this.name = 'trade';
        this.authService = new AuthService();
        this.stockService = new StockService();
        this.currentUser = null;
        this.currentStockPrice = 0;
        this.currentPortfolio = null;
        this.viewContainer = null; // Store the main container element for consistent access
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.viewContainer = container; // Store the container when the view is rendered
        this.attachEventListeners(container);
        // CRITICAL FIX: Add a small delay to ensure DOM elements are fully parsed and available
        setTimeout(async () => {
            await this.loadInitialData(); 
        }, 0); // Use 0ms for immediate execution after current task, allowing DOM to update
    }

    getTemplate() {
        return `
            <div class="trade-view">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Trading Form -->
                    <div class="lg:col-span-1">
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                            <h2 class="text-xl font-semibold mb-4 text-white">Make a Trade</h2>
                            <form id="trade-form" class="space-y-4">
                                <div>
                                    <label for="ticker" class="block text-sm font-medium text-gray-300 mb-1">Ticker Symbol</label>
                                    <input 
                                        type="text" 
                                        id="ticker" 
                                        class="w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                        placeholder="e.g., AAPL, TSLA"
                                        maxlength="6"
                                    >
                                </div>
                                <div>
                                    <label for="quantity" class="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                                    <input 
                                        type="number" 
                                        id="quantity" 
                                        class="w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                        placeholder="Number of shares"
                                        min="1"
                                    >
                                </div>
                                
                                <div id="price-preview" class="hidden bg-gray-700 p-3 rounded-md border border-gray-600">
                                    <p class="text-sm text-gray-400">Current Price: <span id="current-price" class="font-semibold text-white">$0.00</span></p>
                                    <p class="text-sm text-gray-400 mt-1">Estimated Total: <span id="total-cost" class="font-semibold text-cyan-400">$0.00</span></p>
                                </div>

                                <div class="flex gap-4">
                                    <button 
                                        type="button" 
                                        id="buy-btn" 
                                        class="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                                    >
                                        Buy
                                    </button>
                                    <button 
                                        type="button" 
                                        id="sell-btn" 
                                        class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                                    >
                                        Sell
                                    </button>
                                </div>
                                <p id="trade-feedback" class="mt-4 text-sm text-center text-gray-400">&nbsp;</p>
                            </form>
                        </div>
                    </div>

                    <!-- Portfolio Summary and Recent Trades (Holdings moved to PortfolioView) -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Current Cash and Portfolio Value -->
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h3 class="text-xl font-semibold mb-4 text-white">Your Portfolio Summary</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-gray-700 p-4 rounded-md">
                                    <p class="text-sm font-medium text-gray-400">Available Cash</p>
                                    <p id="portfolio-cash" class="text-2xl font-bold text-green-400">$0.00</p>
                                </div>
                                <div class="bg-gray-700 p-4 rounded-md">
                                    <p class="text-sm font-medium text-gray-400">Total Portfolio Value</p>
                                    <p id="portfolio-value" class="text-2xl font-bold text-white">$0.00</p>
                                    <p class="text-sm text-gray-500 mt-1">(Cash + Holdings)</p>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Trades List -->
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h3 class="text-xl font-semibold mb-4 text-white">Recent Trades</h3>
                            <div id="recent-trades-list" class="space-y-3 text-sm">
                                <p class="text-gray-500 text-center">No recent trades.</p>
                                <!-- Trades will be injected here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        const tickerInput = container.querySelector('#ticker');
        const quantityInput = container.querySelector('#quantity');
        const buyBtn = container.querySelector('#buy-btn');
        const sellBtn = container.querySelector('#sell-btn');

        tickerInput.addEventListener('input', this.updatePriceAndCost.bind(this));
        quantityInput.addEventListener('input', this.updatePriceAndCost.bind(this));
        
        buyBtn.addEventListener('click', () => this.handleTrade('buy'));
        sellBtn.addEventListener('click', () => this.handleTrade('sell'));
    }

    async loadInitialData() {
        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser) {
            try {
                await initializePortfolio(this.currentUser.uid);
                this.currentPortfolio = await getPortfolio(this.currentUser.uid);
                if (this.currentPortfolio) {
                    this.updatePortfolioSummary(); // Renamed from updatePortfolioDisplay for clarity
                    await this.updateRecentTrades(); 
                } else {
                    this.showFeedback('Failed to load portfolio data. Please try again.', 'text-red-400');
                }
            } catch (error) {
                console.error('Error loading initial trade data:', error);
                this.showFeedback('Failed to load initial trade data. Please check console.', 'text-red-400');
            }
        } else {
            this.showFeedback('Please sign in to make trades.', 'text-yellow-400');
        }
    }

    // Renamed to updatePortfolioSummary as it now only handles summary, not holdings table
    updatePortfolioSummary() {
        if (!this.currentPortfolio || !this.viewContainer) return;

        const portfolioCashEl = this.viewContainer.querySelector('#portfolio-cash');
        if (portfolioCashEl) {
            portfolioCashEl.textContent = `$${this.currentPortfolio.cash.toFixed(2)}`;
        } else {
            console.warn("Element #portfolio-cash not found in TradeView.");
        }
        
        // Calculate total holdings value for display in summary
        let totalHoldingsValue = 0;
        const holdings = this.currentPortfolio.holdings || {}; 
        for (const ticker in holdings) {
            if (holdings.hasOwnProperty(ticker)) {
                const holding = holdings[ticker];
                const currentPrice = this.stockService.mockPrices[ticker.toUpperCase()] || holding.avgPrice; 
                totalHoldingsValue += holding.quantity * currentPrice;
            }
        }

        // Removed #portfolio-holdings-value as it's no longer a separate element
        // The total portfolio value now combines cash and holdings value
        const portfolioValueEl = this.viewContainer.querySelector('#portfolio-value');
        if (portfolioValueEl) {
            portfolioValueEl.textContent = `$${(this.currentPortfolio.cash + totalHoldingsValue).toFixed(2)}`;
        } else {
            console.warn("Element #portfolio-value not found in TradeView.");
        }
    }

    async updateRecentTrades() { 
        if (!this.currentUser || !this.viewContainer) return;
        const trades = await getRecentTrades(this.currentUser.uid); 
        const tradeListContainer = this.viewContainer.querySelector('#recent-trades-list'); 
        
        if (!tradeListContainer) {
            console.warn("Element #recent-trades-list not found in TradeView.");
            return;
        }

        tradeListContainer.innerHTML = ''; // Clear previous trades

        if (trades.length === 0) {
            tradeListContainer.innerHTML = '<p class="text-gray-500 text-center">No recent trades.</p>';
            return;
        }

        trades.forEach(trade => {
            const tradeItem = document.createElement('div');
            tradeItem.className = 'bg-gray-700 p-3 rounded-md flex justify-between items-center';
            const tradeTypeClass = trade.type === 'buy' ? 'text-green-400' : 'text-red-400';
            const tradeTime = new Date(trade.timestamp).toLocaleString(); // Format date for display

            tradeItem.innerHTML = `
                <div>
                    <span class="font-semibold ${tradeTypeClass}">${trade.type.toUpperCase()}</span> 
                    <span class="text-white">${trade.quantity}</span> shares of 
                    <span class="font-bold uppercase text-cyan-300">${trade.ticker}</span> 
                    at <span class="text-white">$${trade.price.toFixed(2)}</span>
                </div>
                <div class="text-gray-500 text-xs">${tradeTime}</div>
            `;
            tradeListContainer.appendChild(tradeItem);
        });
    }

    async updatePriceAndCost() {
        const ticker = document.getElementById('ticker').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const pricePreview = document.getElementById('price-preview');
        const currentPriceSpan = document.getElementById('current-price');
        const totalCostSpan = document.getElementById('total-cost');

        if (ticker && quantity > 0) {
            this.showFeedback('Fetching price...', 'text-cyan-400');
            try {
                const price = await this.stockService.getQuote(ticker);
                if (price !== null) {
                    this.currentStockPrice = price;
                    const totalCost = price * quantity;
                    currentPriceSpan.textContent = `$${price.toFixed(2)}`;
                    totalCostSpan.textContent = `$${totalCost.toFixed(2)}`;
                    pricePreview.classList.remove('hidden');
                    this.showFeedback('');
                } else {
                    currentPriceSpan.textContent = 'N/A';
                    totalCostSpan.textContent = 'N/A';
                    pricePreview.classList.remove('hidden');
                    this.showFeedback('Could not fetch price for this ticker.', 'text-yellow-400');
                }
            } catch (error) {
                console.error('Error fetching price:', error);
                currentPriceSpan.textContent = 'Error';
                totalCostSpan.textContent = 'Error';
                pricePreview.classList.remove('hidden');
                this.showFeedback('Error fetching price. Try again.', 'text-red-400');
            }
        } else {
            pricePreview.classList.add('hidden');
            this.showFeedback('');
        }
    }

    async handleTrade(type) {
        const tickerInput = document.getElementById('ticker');
        const quantityInput = document.getElementById('quantity');
        const ticker = tickerInput.value.trim();
        const quantity = parseInt(quantityInput.value, 10);

        this.showFeedback('Processing trade...', 'text-cyan-400');

        if (!this.currentUser) {
            this.showFeedback('You must be logged in to make trades.', 'text-red-400');
            return;
        }

        const currentPrice = this.currentStockPrice; 

        if (!ticker || isNaN(quantity) || quantity <= 0 || isNaN(currentPrice) || currentPrice <= 0) {
            this.showFeedback('Please enter a valid ticker and quantity, and ensure a price is available.', 'text-red-400');
            return;
        }

        const tradeDetails = {
            ticker: ticker,
            quantity: quantity,
            price: currentPrice,
            type: type,
        };

        try {
            const result = await executeTrade(this.currentUser.uid, tradeDetails);
            if (result.success) {
                this.showFeedback(`Trade successful! ${type.toUpperCase()} ${quantity} shares of ${ticker.toUpperCase()}.`, 'text-green-400');
                tickerInput.value = '';
                quantityInput.value = '';
                document.getElementById('price-preview').classList.add('hidden');
                this.currentStockPrice = 0;

                await this.loadInitialData(); 
            } else {
                this.showFeedback(`Trade failed: ${result.message}`, 'text-red-400');
            }
        } catch (error) {
            console.error('Trade execution error:', error);
            this.showFeedback(`Trade failed: ${error.message}`, 'text-red-400');
        } finally {
            setTimeout(() => {
                this.showFeedback('');
            }, 3000);
        }
    }

    showFeedback(message, className = '') { 
        const feedback = document.getElementById('trade-feedback');
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `mt-4 text-sm text-center ${className}`.trim(); 
        }
    }
}
