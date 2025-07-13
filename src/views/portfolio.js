// Portfolio view
import { getPortfolio, getRecentTrades } from '../services/trading.js';
import { AuthService } from '../services/auth.js';
import { StockService } from '../services/stocks.js'; // Import StockService for mock prices

export default class PortfolioView {
    constructor() {
        this.name = 'portfolio';
        this.authService = new AuthService(); // Use AuthService for current user
        this.stockService = new StockService(); // Initialize StockService
        this.viewContainer = null; // Store the main container element
        this.currentPortfolio = null; // Store portfolio data
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.viewContainer = container; // Store the container
        this.attachEventListeners(container);
        // CRITICAL FIX: Add a small delay to ensure DOM elements are fully parsed and available
        setTimeout(async () => {
            await this.loadData();
        }, 0); 
    }

    getTemplate() {
        return `
            <div class="portfolio-view">
                <!-- Portfolio Summary -->
                <section class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-gray-800 p-5 rounded-lg shadow-md">
                        <h3 class="text-sm font-medium text-gray-400">Portfolio Value</h3>
                        <p id="portfolio-value" class="text-2xl font-semibold text-white">$0.00</p>
                    </div>
                    <div class="bg-gray-800 p-5 rounded-lg shadow-md">
                        <h3 class="text-sm font-medium text-gray-400">Stock Holdings Value</h3>
                        <p id="stock-holdings-value" class="text-2xl font-semibold text-white">$0.00</p>
                    </div>
                    <div class="bg-gray-800 p-5 rounded-lg shadow-md">
                        <h3 class="text-sm font-medium text-gray-400">Available Cash</h3>
                        <p id="available-cash" class="text-2xl font-semibold text-green-400">$0.00</p>
                    </div>
                     <div class="bg-gray-800 p-5 rounded-lg shadow-md">
                        <h3 class="text-sm font-medium text-gray-400">Total Trades</h3>
                        <p id="total-trades" class="text-2xl font-semibold text-white">0</p>
                    </div>
                </section>

                <!-- Holdings Table -->
                <section class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <h2 class="text-xl font-semibold mb-4">Your Holdings</h2>
                    <div id="holdings-table-container" class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-700">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticker</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Cost</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Current Price</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Value</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gain/Loss</th>
                                </tr>
                            </thead>
                            <tbody id="holdings-tbody" class="divide-y divide-gray-800">
                                <!-- Holdings will be injected here -->
                            </tbody>
                        </table>
                    </div>
                     <div id="no-holdings-message" class="text-center py-8 hidden">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <h3 class="text-lg font-semibold text-gray-300 mb-2">No Holdings Yet</h3>
                        <p class="text-gray-400 mb-4">Start trading to build your portfolio</p>
                        <button 
                            data-navigate="/trade" 
                            class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Make a Trade
                        </button>
                    </div>
                </section>

                <!-- Recent Trades Table -->
                <section class="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold mb-4">Recent Trades</h2>
                    <div id="recent-trades-table-container" class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-700">
                            <thead>
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticker</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody id="trades-tbody" class="divide-y divide-gray-800">
                                <!-- Trades will be injected here -->
                            </tbody>
                        </table>
                    </div>
                    <div id="no-trades-message" class="text-center py-8 hidden">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                        <h3 class="text-lg font-semibold text-gray-300 mb-2">No Trades Yet</h3>
                        <p class="text-gray-400 mb-4">Your trade history will appear here</p>
                        <button 
                            data-navigate="/trade" 
                            class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Make a Trade
                        </button>
                    </div>
                </section>
            </div>
        `;
    }

    attachEventListeners(container) {
        // Event listeners for navigation buttons (e.g., "Make a Trade" button)
        const makeTradeButtons = container.querySelectorAll('[data-navigate="/trade"]');
        makeTradeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // Assuming you have a router instance available in the global scope or passed down
                // For now, this will rely on the main.js router handling clicks on data-navigate attributes
                // If not, you'd need to import Router and navigate directly: new Router().navigate('/trade');
                console.log('Navigating to trade page...');
            });
        });
    }

    async loadData() {
        console.log('Loading portfolio data...');
        const user = this.authService.getCurrentUser(); // Use authService
        if (!user) {
            console.log('No user signed in for portfolio.');
            // Display message or redirect if no user
            return;
        }

        try {
            const userId = user.uid;
            this.currentPortfolio = await getPortfolio(userId); // Store portfolio data
            const recentTrades = await getRecentTrades(userId);

            if (this.currentPortfolio) {
                // Update summary cards
                const portfolioValueEl = this.viewContainer.querySelector('#portfolio-value');
                if (portfolioValueEl) portfolioValueEl.textContent = `$${this.currentPortfolio.cash.toFixed(2)}`;
                
                const availableCashEl = this.viewContainer.querySelector('#available-cash');
                if (availableCashEl) availableCashEl.textContent = `$${this.currentPortfolio.cash.toFixed(2)}`;

                const totalTradesEl = this.viewContainer.querySelector('#total-trades');
                if (totalTradesEl) totalTradesEl.textContent = recentTrades.length;

                let totalHoldingsValue = 0;
                const holdings = this.currentPortfolio.holdings || {};

                // Populate holdings table
                const holdingsTbody = this.viewContainer.querySelector('#holdings-tbody');
                const noHoldingsMessage = this.viewContainer.querySelector('#no-holdings-message');
                const holdingsTableContainer = this.viewContainer.querySelector('#holdings-table-container');

                if (holdingsTbody) holdingsTbody.innerHTML = ''; // Clear previous holdings

                if (Object.keys(holdings).length > 0) {
                    if (noHoldingsMessage) noHoldingsMessage.classList.add('hidden');
                    if (holdingsTableContainer) holdingsTableContainer.classList.remove('hidden');
                    for (const ticker in holdings) {
                        if (holdings.hasOwnProperty(ticker)) {
                            const holding = holdings[ticker];
                            // Use StockService to get a mock current price for display
                            const currentPrice = this.stockService.mockPrices[ticker.toUpperCase()] || holding.avgPrice; 
                            const marketValue = holding.quantity * currentPrice;
                            totalHoldingsValue += marketValue; // Sum up market value

                            const gainLoss = marketValue - (holding.quantity * holding.avgPrice);
                            const gainLossClass = gainLoss >= 0 ? 'text-green-400' : 'text-red-400';

                            const row = `
                                <tr class="hover:bg-gray-700">
                                    <td class="px-4 py-2 whitespace-nowrap text-cyan-400 font-semibold">${ticker.toUpperCase()}</td>
                                    <td class="px-4 py-2 whitespace-nowrap">${holding.quantity}</td>
                                    <td class="px-4 py-2 whitespace-nowrap">$${holding.avgPrice.toFixed(2)}</td>
                                    <td class="px-4 py-2 whitespace-nowrap">$${currentPrice.toFixed(2)}</td>
                                    <td class="px-4 py-2 whitespace-nowrap">$${marketValue.toFixed(2)}</td>
                                    <td class="px-4 py-2 whitespace-nowrap ${gainLossClass}">${gainLoss.toFixed(2)} (${(gainLoss / (holding.quantity * holding.avgPrice) * 100).toFixed(2)}%)</td>
                                </tr>
                            `;
                            if (holdingsTbody) holdingsTbody.innerHTML += row;
                        }
                    }
                } else {
                    if (noHoldingsMessage) noHoldingsMessage.classList.remove('hidden');
                    if (holdingsTableContainer) holdingsTableContainer.classList.add('hidden');
                }

                const stockHoldingsValueEl = this.viewContainer.querySelector('#stock-holdings-value');
                if (stockHoldingsValueEl) stockHoldingsValueEl.textContent = `$${totalHoldingsValue.toFixed(2)}`;
                if (portfolioValueEl) portfolioValueEl.textContent = `$${(this.currentPortfolio.cash + totalHoldingsValue).toFixed(2)}`;


                // Populate recent trades table
                const tradesTbody = this.viewContainer.querySelector('#trades-tbody');
                const noTradesMessage = this.viewContainer.querySelector('#no-trades-message');
                const recentTradesTableContainer = this.viewContainer.querySelector('#recent-trades-table-container');

                if (tradesTbody) tradesTbody.innerHTML = ''; // Clear previous trades

                if (recentTrades.length > 0) {
                    if (noTradesMessage) noTradesMessage.classList.add('hidden');
                    if (recentTradesTableContainer) recentTradesTableContainer.classList.remove('hidden');
                    recentTrades.forEach(trade => {
                        const tradeDate = new Date(trade.timestamp).toLocaleDateString();
                        const tradeTypeClass = trade.type === 'buy' ? 'text-green-400' : 'text-red-400';
                        const row = `
                            <tr class="hover:bg-gray-700">
                                <td class="px-4 py-2 whitespace-nowrap">${tradeDate}</td>
                                <td class="px-4 py-2 whitespace-nowrap ${tradeTypeClass}">${trade.type.toUpperCase()}</td>
                                <td class="px-4 py-2 whitespace-nowrap font-semibold text-cyan-400">${trade.ticker.toUpperCase()}</td>
                                <td class="px-4 py-2 whitespace-nowrap">${trade.quantity}</td>
                                <td class="px-4 py-2 whitespace-nowrap">$${trade.price.toFixed(2)}</td>
                                <td class="px-4 py-2 whitespace-nowrap">$${trade.tradeCost.toFixed(2)}</td>
                            </tr>
                        `;
                        if (tradesTbody) tradesTbody.innerHTML += row;
                    });
                } else {
                    if (noTradesMessage) noTradesMessage.classList.remove('hidden');
                    if (recentTradesTableContainer) recentTradesTableContainer.classList.add('hidden');
                }

            } else {
                console.log('Portfolio not found for user. Initializing...');
                // Default to initial balance and empty states if portfolio not found
                const portfolioValueEl = this.viewContainer.querySelector('#portfolio-value');
                if (portfolioValueEl) portfolioValueEl.textContent = `$10,000.00`;
                const availableCashEl = this.viewContainer.querySelector('#available-cash');
                if (availableCashEl) availableCashEl.textContent = `$10,000.00`;
                const stockHoldingsValueEl = this.viewContainer.querySelector('#stock-holdings-value');
                if (stockHoldingsValueEl) stockHoldingsValueEl.textContent = `$0.00`;
                const totalTradesEl = this.viewContainer.querySelector('#total-trades');
                if (totalTradesEl) totalTradesEl.textContent = `0`;
                
                const noHoldingsMessage = this.viewContainer.querySelector('#no-holdings-message');
                if (noHoldingsMessage) noHoldingsMessage.classList.remove('hidden');
                const holdingsTableContainer = this.viewContainer.querySelector('#holdings-table-container');
                if (holdingsTableContainer) holdingsTableContainer.classList.add('hidden');
                const noTradesMessage = this.viewContainer.querySelector('#no-trades-message');
                if (noTradesMessage) noTradesMessage.classList.remove('hidden');
                const recentTradesTableContainer = this.viewContainer.querySelector('#recent-trades-table-container');
                if (recentTradesTableContainer) recentTradesTableContainer.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            // Display an error message to the user
            const portfolioValueEl = this.viewContainer.querySelector('#portfolio-value');
            if (portfolioValueEl) portfolioValueEl.textContent = `$Error`;
            const stockHoldingsValueEl = this.viewContainer.querySelector('#stock-holdings-value');
            if (stockHoldingsValueEl) stockHoldingsValueEl.textContent = `$Error`;
            const availableCashEl = this.viewContainer.querySelector('#available-cash');
            if (availableCashEl) availableCashEl.textContent = `$Error`;
            const totalTradesEl = this.viewContainer.querySelector('#total-trades');
            if (totalTradesEl) totalTradesEl.textContent = `Error`;
        }
    }
}
