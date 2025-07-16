// Enhanced Portfolio view with UI polish - Session 5
import { getPortfolio, getRecentTrades } from '../services/trading.js';
import { AuthService } from '../services/auth.js';
import { StockService } from '../services/stocks.js';
import { 
    formatCurrencyWithCommas,
    formatCashPercentage,
    formatPortfolioChange,
    calculateGainLoss,
    formatPrice,
    formatNumberWithCommas,
    formatGainLoss,
    calculateMarketValue,
    calculateCostBasis,
    getTradeTypeColorClass
} from '../utils/currency-utils.js';

export default class PortfolioView {
    constructor() {
        this.name = 'portfolio';
        this.authService = new AuthService();
        this.stockService = new StockService();
        this.viewContainer = null;
        this.currentPortfolio = null;
        this.allTrades = [];
        this.sortOrder = { field: 'date', direction: 'desc' };
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.viewContainer = container;
        this.attachEventListeners(container);
        setTimeout(async () => {
            await this.loadData();
        }, 0); 
    }

    getTemplate() {
        return `
            <div class="portfolio-view">
                <!-- Enhanced Portfolio Overview -->
                <section class="mb-8">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                        <div>
                            <h1 class="text-3xl font-bold text-white mb-2">Portfolio Overview</h1>
                            <p class="text-gray-400">Solo Practice Mode</p>
                        </div>
                        <div class="flex gap-3">
                            <button 
                                id="refresh-prices-btn"
                                class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                <span id="refresh-text">Refresh</span>
                                <div id="refresh-loading" class="hidden w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </button>
                            <button 
                                data-navigate="/trade" 
                                class="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                Make Trade
                            </button>
                        </div>
                    </div>

                    <!-- Enhanced Stats Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <!-- Total Portfolio Value -->
                        <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-sm font-medium text-gray-400">Total Portfolio Value</h3>
                                <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                    </svg>
                                </div>
                            </div>
                            <p id="portfolio-value" class="text-3xl font-bold text-white mb-2">$0.00</p>
                            <div class="flex items-center gap-2">
                                <span id="portfolio-change" class="text-sm font-medium">$0.00 (0.00%)</span>
                                <span id="portfolio-change-label" class="text-xs text-gray-500">vs. starting balance</span>
                            </div>
                        </div>

                        <!-- Stock Holdings -->
                        <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-sm font-medium text-gray-400">Stock Holdings</h3>
                                <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                            </div>
                            <p id="stock-holdings-value" class="text-3xl font-bold text-white mb-2">$0.00</p>
                            <div class="flex items-center gap-2">
                                <span id="holdings-count" class="text-sm text-gray-400">0 positions</span>
                            </div>
                        </div>

                        <!-- Available Cash -->
                        <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-sm font-medium text-gray-400">Available Cash</h3>
                                <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                            </div>
                            <p id="available-cash" class="text-3xl font-bold text-green-400 mb-2">$0.00</p>
                            <div class="flex items-center gap-2">
                                <span id="cash-percentage" class="text-sm text-gray-400">0% of portfolio</span>
                            </div>
                        </div>

                        <!-- Trading Stats -->
                        <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-sm font-medium text-gray-400">Trading Activity</h3>
                                <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2-2h10a2 2 0 002 2v12a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                    </svg>
                                </div>
                            </div>
                            <p id="total-trades" class="text-3xl font-bold text-white mb-2">0</p>
                            <div class="flex items-center gap-2">
                                <span id="trade-volume" class="text-sm text-gray-400">$0 volume</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Enhanced Holdings Table -->
                <section class="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-8">
                    <div class="p-6 border-b border-gray-700">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 class="text-xl font-semibold text-white">Current Holdings</h2>
                                <p class="text-sm text-gray-400 mt-1">Real-time market values</p>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-gray-400">
                                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Live prices</span>
                            </div>
                        </div>
                    </div>
                    
                    <div id="holdings-table-container" class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-700">
                            <thead class="bg-gray-750">
                                <tr>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Symbol</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Shares</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Avg Cost</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Current Price</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Market Value</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Gain/Loss</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">% Change</th>
                                </tr>
                            </thead>
                            <tbody id="holdings-tbody" class="divide-y divide-gray-700">
                                <!-- Holdings will be injected here -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div id="no-holdings-message" class="text-center py-12 hidden">
                        <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-300 mb-2">No Holdings Yet</h3>
                        <p class="text-gray-400 mb-6">Start trading to build your portfolio</p>
                        <button 
                            data-navigate="/trade" 
                            class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Make Your First Trade
                        </button>
                    </div>
                </section>

                <!-- Enhanced Trade History -->
                <section class="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                    <div class="p-6 border-b border-gray-700">
                        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h2 class="text-xl font-semibold text-white">Trade History</h2>
                                <p class="text-sm text-gray-400 mt-1">All your trading activity</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <!-- Filter Buttons -->
                                <div class="flex bg-gray-700 rounded-lg p-1">
                                    <button id="filter-all" class="filter-btn px-3 py-1 text-sm rounded-md transition-all duration-200 bg-cyan-600 text-white" data-filter="all">
                                        All
                                    </button>
                                    <button id="filter-buy" class="filter-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-filter="buy">
                                        Buys
                                    </button>
                                    <button id="filter-sell" class="filter-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-filter="sell">
                                        Sells
                                    </button>
                                </div>
                                
                                <!-- Sort Dropdown -->
                                <select id="sort-trades" class="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    <option value="date-desc">Newest First</option>
                                    <option value="date-asc">Oldest First</option>
                                    <option value="ticker-asc">Symbol A-Z</option>
                                    <option value="ticker-desc">Symbol Z-A</option>
                                    <option value="amount-desc">Highest Amount</option>
                                    <option value="amount-asc">Lowest Amount</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div id="recent-trades-table-container" class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-700">
                            <thead class="bg-gray-750">
                                <tr>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date & Time</th>
                                    <th class="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Symbol</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Shares</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Price</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody id="trades-tbody" class="divide-y divide-gray-700">
                                <!-- Trades will be injected here -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div id="no-trades-message" class="text-center py-12 hidden">
                        <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2-2h10a2 2 0 002 2v12a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-300 mb-2">No Trades Yet</h3>
                        <p class="text-gray-400 mb-6">Your trading history will appear here</p>
                        <button 
                            data-navigate="/trade" 
                            class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Start Trading
                        </button>
                    </div>
                </section>
            </div>
        `;
    }

    attachEventListeners(container) {
        // Navigation buttons
        const makeTradeButtons = container.querySelectorAll('[data-navigate="/trade"]');
        makeTradeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Navigating to trade page...');
            });
        });

        // Refresh prices button
        const refreshBtn = container.querySelector('#refresh-prices-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshPrices();
            });
        }

        // Trade filter buttons
        const filterButtons = container.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        // Sort dropdown
        const sortSelect = container.querySelector('#sort-trades');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }
    }

    async loadData() {
        console.log('Loading portfolio data...');
        const user = this.authService.getCurrentUser();
        if (!user) {
            console.log('No user signed in for portfolio.');
            return;
        }

        try {
            const userId = user.uid;
            this.currentPortfolio = await getPortfolio(userId);
            this.allTrades = await getRecentTrades(userId, 100); // Get more trades for filtering

            if (this.currentPortfolio) {
                // Update basic stats first
                this.updateBasicStats();
                
                // Load holdings with live prices
                await this.loadHoldingsWithLivePrices();

                // Load and display trade history
                this.displayTrades();

            } else {
                this.showDefaultState();
            }
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.showErrorState();
        }
    }

    updateBasicStats() {
        const availableCashEl = this.viewContainer.querySelector('#available-cash');
        if (availableCashEl) availableCashEl.textContent = formatCurrencyWithCommas(this.currentPortfolio.cash);

        const totalTradesEl = this.viewContainer.querySelector('#total-trades');
        if (totalTradesEl) totalTradesEl.textContent = this.allTrades.length;

        // Calculate total trade volume
        const totalVolume = this.allTrades.reduce((sum, trade) => sum + trade.tradeCost, 0);
        const tradeVolumeEl = this.viewContainer.querySelector('#trade-volume');
        if (tradeVolumeEl) tradeVolumeEl.textContent = `$${totalVolume.toFixed(0)} volume`;
    }

    async loadHoldingsWithLivePrices() {
        const holdings = this.currentPortfolio.holdings || {};
        const holdingsTbody = this.viewContainer.querySelector('#holdings-tbody');
        const noHoldingsMessage = this.viewContainer.querySelector('#no-holdings-message');
        const holdingsTableContainer = this.viewContainer.querySelector('#holdings-table-container');

        if (holdingsTbody) holdingsTbody.innerHTML = '';

        if (Object.keys(holdings).length === 0) {
            if (noHoldingsMessage) noHoldingsMessage.classList.remove('hidden');
            if (holdingsTableContainer) holdingsTableContainer.classList.add('hidden');
            this.updatePortfolioSummary(0);
            return;
        }

        // Show table, hide no holdings message
        if (noHoldingsMessage) noHoldingsMessage.classList.add('hidden');
        if (holdingsTableContainer) holdingsTableContainer.classList.remove('hidden');

        let totalHoldingsValue = 0;
        const holdingsCount = Object.keys(holdings).length;

        // Update holdings count
        const holdingsCountEl = this.viewContainer.querySelector('#holdings-count');
        if (holdingsCountEl) holdingsCountEl.textContent = `${holdingsCount} position${holdingsCount !== 1 ? 's' : ''}`;

        // Process each holding with live price lookup
        for (const ticker in holdings) {
            if (holdings.hasOwnProperty(ticker)) {
                const holding = holdings[ticker];
                
                // Show loading row first
                const loadingRow = `
                    <tr id="holding-${ticker}" class="hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-xs font-bold text-cyan-400">${ticker.charAt(0)}</span>
                                </div>
                                <span class="font-semibold text-white">${ticker.toUpperCase()}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatNumberWithCommas(holding.quantity)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${formatPrice(holding.avgPrice)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                            <div class="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin ml-auto"></div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
                    </tr>
                `;
                if (holdingsTbody) holdingsTbody.innerHTML += loadingRow;

                try {
                    // Get live price
                    const currentPrice = await this.stockService.getQuote(ticker);
                    const finalPrice = currentPrice !== null ? currentPrice : holding.avgPrice;
                    
                    const marketValue = calculateMarketValue(holding.quantity, finalPrice);
                    totalHoldingsValue += marketValue;

                    const costBasis = calculateCostBasis(holding.quantity, holding.avgPrice);
                    const gainLossData = calculateGainLoss(marketValue, costBasis);
                    const gainLossFormatted = formatGainLoss(gainLossData.amount, gainLossData.percentage);

                    // Update the row with real data
                    const updatedRow = `
                        <tr class="hover:bg-gray-700/50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                                        <span class="text-xs font-bold text-cyan-400">${ticker.charAt(0)}</span>
                                    </div>
                                    <span class="font-semibold text-white">${ticker.toUpperCase()}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatNumberWithCommas(holding.quantity)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${formatPrice(holding.avgPrice)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <span class="text-white">${formatPrice(finalPrice)}</span>
                                ${currentPrice === null ? '<span class="text-xs text-gray-500 block">estimate</span>' : ''}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-white font-semibold">${formatCurrencyWithCommas(marketValue)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <div class="flex items-center justify-end">
                                    <span class="${gainLossFormatted.colorClass} font-semibold">${gainLossFormatted.amount}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <span class="${gainLossFormatted.colorClass} font-semibold">${gainLossFormatted.percentage}</span>
                            </td>
                        </tr>
                    `;

                    // Replace loading row
                    const existingRow = document.getElementById(`holding-${ticker}`);
                    if (existingRow) {
                        existingRow.outerHTML = updatedRow;
                    }
                } catch (error) {
                    console.error(`Error loading price for ${ticker}:`, error);
                    // Fallback to average price if API fails
                    const marketValue = calculateMarketValue(holding.quantity, holding.avgPrice);
                    totalHoldingsValue += marketValue;

                    const errorRow = `
                        <tr class="hover:bg-gray-700/50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                                        <span class="text-xs font-bold text-cyan-400">${ticker.charAt(0)}</span>
                                    </div>
                                    <span class="font-semibold text-white">${ticker.toUpperCase()}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatNumberWithCommas(holding.quantity)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${formatPrice(holding.avgPrice)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <span class="text-gray-500">${formatPrice(holding.avgPrice)}</span>
                                <span class="text-xs text-gray-500 block">estimate</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatCurrencyWithCommas(marketValue)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-500">${formatPrice(0)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-500">0.00%</td>
                        </tr>
                    `;

                    // Replace loading row with error row
                    const existingRow = document.getElementById(`holding-${ticker}`);
                    if (existingRow) {
                        existingRow.outerHTML = errorRow;
                    }
                }
            }
        }

        // Update portfolio summary with final totals
        this.updatePortfolioSummary(totalHoldingsValue);
    }

    updatePortfolioSummary(totalHoldingsValue) {
        const stockHoldingsValueEl = this.viewContainer.querySelector('#stock-holdings-value');
        if (stockHoldingsValueEl) stockHoldingsValueEl.textContent = formatCurrencyWithCommas(totalHoldingsValue);

        const portfolioValueEl = this.viewContainer.querySelector('#portfolio-value');
        const totalValue = this.currentPortfolio.cash + totalHoldingsValue;
        if (portfolioValueEl) {
            portfolioValueEl.textContent = formatCurrencyWithCommas(totalValue);
        }

        // Calculate portfolio change vs starting balance (assuming $10,000 start)
        const startingBalance = 10000;
        const gainLossData = calculateGainLoss(totalValue, startingBalance);
        const changeFormatted = formatPortfolioChange(gainLossData.amount, gainLossData.percentage);
        
        const portfolioChangeEl = this.viewContainer.querySelector('#portfolio-change');
        if (portfolioChangeEl) {
            portfolioChangeEl.className = `text-sm font-medium ${changeFormatted.colorClass}`;
            portfolioChangeEl.textContent = changeFormatted.display;
        }

        // Calculate cash percentage
        const cashPercentage = (this.currentPortfolio.cash / totalValue * 100);
        const cashPercentageEl = this.viewContainer.querySelector('#cash-percentage');
        if (cashPercentageEl) {
            cashPercentageEl.textContent = `${formatCashPercentage(this.currentPortfolio.cash, totalValue)} of portfolio`;
        }
    }

    displayTrades() {
        const tradesTbody = this.viewContainer.querySelector('#trades-tbody');
        const noTradesMessage = this.viewContainer.querySelector('#no-trades-message');
        const recentTradesTableContainer = this.viewContainer.querySelector('#recent-trades-table-container');

        if (tradesTbody) tradesTbody.innerHTML = '';

        if (this.allTrades.length > 0) {
            if (noTradesMessage) noTradesMessage.classList.add('hidden');
            if (recentTradesTableContainer) recentTradesTableContainer.classList.remove('hidden');
            
            // Sort and filter trades
            const filteredTrades = this.getFilteredAndSortedTrades();
            
            filteredTrades.forEach(trade => {
                const tradeDate = new Date(trade.timestamp);
                const tradeDateStr = tradeDate.toLocaleDateString();
                const tradeTimeStr = tradeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const tradeTypeClass = getTradeTypeColorClass(trade.type);
                const tradeIcon = trade.type === 'buy' ? '↗' : '↘';
                
                const row = `
                    <tr class="hover:bg-gray-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-white font-medium">${tradeDateStr}</div>
                            <div class="text-sm text-gray-400">${tradeTimeStr}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span class="${tradeTypeClass} px-3 py-1 rounded-full text-sm font-semibold">
                                ${tradeIcon} ${trade.type.toUpperCase()}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-xs font-bold text-cyan-400">${trade.ticker.charAt(0)}</span>
                                </div>
                                <span class="font-semibold text-white">${trade.ticker.toUpperCase()}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-white">${trade.quantity.toLocaleString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${formatPrice(trade.price)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-white font-semibold">${formatPrice(trade.tradeCost)}</td>
                    </tr>
                `;
                if (tradesTbody) tradesTbody.innerHTML += row;
            });
        } else {
            if (noTradesMessage) noTradesMessage.classList.remove('hidden');
            if (recentTradesTableContainer) recentTradesTableContainer.classList.add('hidden');
        }
    }

    getFilteredAndSortedTrades() {
        let trades = [...this.allTrades];
        
        // Apply filter
        const activeFilter = this.viewContainer.querySelector('.filter-btn.bg-cyan-600');
        if (activeFilter) {
            const filter = activeFilter.dataset.filter;
            if (filter !== 'all') {
                trades = trades.filter(trade => trade.type === filter);
            }
        }
        
        // Apply sort
        const sortSelect = this.viewContainer.querySelector('#sort-trades');
        if (sortSelect) {
            const [field, direction] = sortSelect.value.split('-');
            
            trades.sort((a, b) => {
                let aVal, bVal;
                
                switch (field) {
                    case 'date':
                        aVal = new Date(a.timestamp);
                        bVal = new Date(b.timestamp);
                        break;
                    case 'ticker':
                        aVal = a.ticker.toLowerCase();
                        bVal = b.ticker.toLowerCase();
                        break;
                    case 'amount':
                        aVal = a.tradeCost;
                        bVal = b.tradeCost;
                        break;
                    default:
                        return 0;
                }
                
                if (direction === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        return trades;
    }

    handleFilterChange(filter) {
        // Update active filter button
        this.viewContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('bg-cyan-600', 'text-white');
            btn.classList.add('text-gray-300', 'hover:text-white');
        });
        
        const activeBtn = this.viewContainer.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('bg-cyan-600', 'text-white');
            activeBtn.classList.remove('text-gray-300', 'hover:text-white');
        }
        
        // Refresh trade display
        this.displayTrades();
    }

    handleSortChange(sortValue) {
        // Refresh trade display with new sort
        this.displayTrades();
    }

    async refreshPrices() {
        const refreshBtn = this.viewContainer.querySelector('#refresh-prices-btn');
        const refreshText = this.viewContainer.querySelector('#refresh-text');
        const refreshLoading = this.viewContainer.querySelector('#refresh-loading');

        if (refreshText) refreshText.classList.add('hidden');
        if (refreshLoading) refreshLoading.classList.remove('hidden');
        if (refreshBtn) refreshBtn.disabled = true;

        try {
            // Clear cache to force fresh API calls
            this.stockService.clearCache();
            
            // Reload holdings with fresh prices
            await this.loadHoldingsWithLivePrices();
            
            console.log('Prices refreshed successfully');
        } catch (error) {
            console.error('Error refreshing prices:', error);
        } finally {
            if (refreshText) refreshText.classList.remove('hidden');
            if (refreshLoading) refreshLoading.classList.add('hidden');
            if (refreshBtn) refreshBtn.disabled = false;
        }
    }

    showDefaultState() {
        const portfolioValueEl = this.viewContainer.querySelector('#portfolio-value');
        if (portfolioValueEl) portfolioValueEl.textContent = `$10,000`;
        
        const availableCashEl = this.viewContainer.querySelector('#available-cash');
        if (availableCashEl) availableCashEl.textContent = `$10,000`;
        
        const stockHoldingsValueEl = this.viewContainer.querySelector('#stock-holdings-value');
        if (stockHoldingsValueEl) stockHoldingsValueEl.textContent = `$0`;
        
        const totalTradesEl = this.viewContainer.querySelector('#total-trades');
        if (totalTradesEl) totalTradesEl.textContent = `0`;
        
        const portfolioChangeEl = this.viewContainer.querySelector('#portfolio-change');
        if (portfolioChangeEl) {
            portfolioChangeEl.className = 'text-sm font-medium text-gray-400';
            portfolioChangeEl.textContent = '$0.00 (0.00%)';
        }
        
        const cashPercentageEl = this.viewContainer.querySelector('#cash-percentage');
        if (cashPercentageEl) cashPercentageEl.textContent = '100% of portfolio';
        
        const holdingsCountEl = this.viewContainer.querySelector('#holdings-count');
        if (holdingsCountEl) holdingsCountEl.textContent = '0 positions';
        
        const tradeVolumeEl = this.viewContainer.querySelector('#trade-volume');
        if (tradeVolumeEl) tradeVolumeEl.textContent = '$0 volume';
        
        const noHoldingsMessage = this.viewContainer.querySelector('#no-holdings-message');
        if (noHoldingsMessage) noHoldingsMessage.classList.remove('hidden');
        
        const holdingsTableContainer = this.viewContainer.querySelector('#holdings-table-container');
        if (holdingsTableContainer) holdingsTableContainer.classList.add('hidden');
        
        const noTradesMessage = this.viewContainer.querySelector('#no-trades-message');
        if (noTradesMessage) noTradesMessage.classList.remove('hidden');
        
        const recentTradesTableContainer = this.viewContainer.querySelector('#recent-trades-table-container');
        if (recentTradesTableContainer) recentTradesTableContainer.classList.add('hidden');
    }

    showErrorState() {
        const portfolioValueEl = this.viewContainer.querySelector('#portfolio-value');
        if (portfolioValueEl) portfolioValueEl.textContent = `Error`;
        
        const stockHoldingsValueEl = this.viewContainer.querySelector('#stock-holdings-value');
        if (stockHoldingsValueEl) stockHoldingsValueEl.textContent = `Error`;
        
        const availableCashEl = this.viewContainer.querySelector('#available-cash');
        if (availableCashEl) availableCashEl.textContent = `Error`;
        
        const totalTradesEl = this.viewContainer.querySelector('#total-trades');
        if (totalTradesEl) totalTradesEl.textContent = `Error`;
    }
}