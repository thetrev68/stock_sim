// file: src/templates/portfolio/portfolio-overview.js
// Portfolio overview and stats templates for portfolio view
// Focused module: Stats cards and overview section exactly as they exist

/**
 * Generate portfolio value card template
 * @returns {string} HTML template string
 */
export const getPortfolioValueCardTemplate = () => {
    return `
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-400">Portfolio Value</h3>
                <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
            </div>
            <p id="portfolio-value" class="text-3xl font-bold text-white mb-2">$0.00</p>
            <div class="flex items-center gap-2">
                <span id="portfolio-change" class="text-sm font-medium text-gray-400">$0.00 (0.00%)</span>
            </div>
        </div>
    `;
};

/**
 * Generate stock holdings value card template
 * @returns {string} HTML template string
 */
export const getStockHoldingsCardTemplate = () => {
    return `
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-400">Stock Holdings</h3>
                <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
            </div>
            <p id="stock-holdings-value" class="text-3xl font-bold text-white mb-2">$0.00</p>
            <div class="flex items-center gap-2">
                <span id="holdings-count" class="text-sm text-gray-400">0 positions</span>
            </div>
        </div>
    `;
};

/**
 * Generate available cash card template
 * @returns {string} HTML template string
 */
export const getAvailableCashCardTemplate = () => {
    return `
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-400">Available Cash</h3>
                <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <p id="available-cash" class="text-3xl font-bold text-green-400 mb-2">$0.00</p>
            <div class="flex items-center gap-2">
                <span id="cash-percentage" class="text-sm text-gray-400">0% of portfolio</span>
            </div>
        </div>
    `;
};

/**
 * Generate trading activity card template
 * @returns {string} HTML template string
 */
export const getTradingActivityCardTemplate = () => {
    return `
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
    `;
};

/**
 * Generate portfolio stats grid template
 * @returns {string} HTML template string
 */
export const getPortfolioStatsGridTemplate = () => {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            ${getPortfolioValueCardTemplate()}
            ${getStockHoldingsCardTemplate()}
            ${getAvailableCashCardTemplate()}
            ${getTradingActivityCardTemplate()}
        </div>
    `;
};

/**
 * Generate portfolio header template
 * @returns {string} HTML template string
 */
export const getPortfolioHeaderTemplate = () => {
    return `
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
                <h1 class="text-3xl font-bold text-white mb-2">Portfolio Overview</h1>
                <p class="text-gray-400">Solo Practice Mode</p>
            </div>
            <div class="flex gap-3">
                <button 
                    id="refresh-prices-btn"
                    class="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    <svg id="refresh-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span id="refresh-text">Refresh Prices</span>
                    <div id="refresh-loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin hidden"></div>
                </button>
                <button 
                    data-navigate="/trade" 
                    class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Make Trade
                </button>
            </div>
        </div>
    `;
};

/**
 * Generate complete portfolio overview section template
 * @returns {string} HTML template string
 */
export const getCompletePortfolioOverviewTemplate = () => {
    return `
        <section class="mb-8">
            ${getPortfolioHeaderTemplate()}
            ${getPortfolioStatsGridTemplate()}
        </section>
    `;
};

/**
 * Generate refresh button template (standalone)
 * @returns {string} HTML template string
 */
export const getRefreshPricesButtonTemplate = () => {
    return `
        <button 
            id="refresh-prices-btn"
            class="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
            <svg id="refresh-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span id="refresh-text">Refresh Prices</span>
            <div id="refresh-loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin hidden"></div>
        </button>
    `;
};

/**
 * Generate make trade button template (standalone)
 * @returns {string} HTML template string
 */
export const getMakeTradeButtonTemplate = () => {
    return `
        <button 
            data-navigate="/trade" 
            class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Make Trade
        </button>
    `;
};