// file: src/templates/portfolio/portfolio-trade-history.js
// Trade history templates for portfolio view
// Focused module: Trade history display and filtering exactly as they exist

/**
 * Generate trade history item template
 * @param {Object} trade - Trade data object
 * @returns {string} HTML template string
 */
export const getTradeHistoryItemTemplate = (trade) => {
    const tradeTypeClass = trade.type === 'buy' ? 'text-green-400' : 'text-red-400';
    const tradeTypeIcon = trade.type === 'buy' ? '↗' : '↘';
    const formattedDate = new Date(trade.timestamp.toDate()).toLocaleDateString();
    const formattedTime = new Date(trade.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `
        <div class="trade-item bg-gray-700 rounded-lg p-4 mb-3 hover:bg-gray-600 transition-colors duration-200">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <span class="text-xs font-bold text-cyan-400">${trade.ticker.charAt(0)}</span>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-white">${trade.ticker.toUpperCase()}</span>
                            <span class="${tradeTypeClass} font-semibold text-sm">${tradeTypeIcon} ${trade.type.toUpperCase()}</span>
                        </div>
                        <div class="flex items-center gap-4 text-sm text-gray-400">
                            <span>${trade.quantity} shares</span>
                            <span>@$${trade.price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="text-right">
                    <p class="text-white font-semibold">$${trade.tradeCost.toFixed(2)}</p>
                    <div class="text-sm text-gray-400">
                        <span>${formattedDate}</span>
                        <span class="ml-2">${formattedTime}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate trade history filters template
 * @returns {string} HTML template string
 */
export const getTradeHistoryFiltersTemplate = () => {
    return `
        <div class="flex flex-col sm:flex-row gap-3">
            <select 
                id="trade-filter"
                class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <option value="all">All Trades</option>
                <option value="buy">Buy Orders</option>
                <option value="sell">Sell Orders</option>
            </select>
            
            <select 
                id="sort-filter"
                class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Value</option>
                <option value="amount-asc">Lowest Value</option>
            </select>
        </div>
    `;
};

/**
 * Generate trade history section header template
 * @returns {string} HTML template string
 */
export const getTradeHistorySectionHeaderTemplate = () => {
    return `
        <div class="p-6 border-b border-gray-700">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 class="text-xl font-semibold text-white">Trade History</h2>
                    <p class="text-sm text-gray-400 mt-1">Your trading activity</p>
                </div>
                
                <!-- Trade History Filters -->
                ${getTradeHistoryFiltersTemplate()}
            </div>
        </div>
    `;
};

/**
 * Generate no trades message template
 * @returns {string} HTML template string
 */
export const getNoTradesMessageTemplate = () => {
    return `
        <div id="no-trades-message" class="text-center py-12 hidden">
            <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    `;
};

/**
 * Generate trades container template
 * @returns {string} HTML template string
 */
export const getTradesContainerTemplate = () => {
    return `
        <div id="trades-container" class="p-6">
            <!-- Trade history items will be injected here -->
        </div>
    `;
};

/**
 * Generate trade loading item template
 * @returns {string} HTML template string
 */
export const getTradeLoadingItemTemplate = () => {
    return `
        <div class="trade-item bg-gray-700 rounded-lg p-4 mb-3">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
                    <div>
                        <div class="w-24 h-4 bg-gray-600 rounded animate-pulse mb-2"></div>
                        <div class="w-32 h-3 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="w-20 h-4 bg-gray-600 rounded animate-pulse mb-2"></div>
                    <div class="w-24 h-3 bg-gray-600 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate trade history loading state template
 * @returns {string} HTML template string
 */
export const getTradeHistoryLoadingTemplate = () => {
    return `
        <div class="p-6">
            ${getTradeLoadingItemTemplate()}
            ${getTradeLoadingItemTemplate()}
            ${getTradeLoadingItemTemplate()}
        </div>
    `;
};

/**
 * Generate trade history error template
 * @returns {string} HTML template string
 */
export const getTradeHistoryErrorTemplate = () => {
    return `
        <div class="text-center py-12">
            <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-red-400 mb-2">Error Loading Trades</h3>
            <p class="text-gray-400">Unable to load your trading history</p>
        </div>
    `;
};

/**
 * Generate complete trade history section template
 * @returns {string} HTML template string
 */
export const getCompleteTradeHistorySectionTemplate = () => {
    return `
        <section class="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            ${getTradeHistorySectionHeaderTemplate()}
            ${getTradesContainerTemplate()}
            ${getNoTradesMessageTemplate()}
        </section>
    `;
};

/**
 * Generate trade summary stats template
 * @param {Object} stats - Trade statistics
 * @returns {string} HTML template string
 */
export const getTradeSummaryStatsTemplate = (stats = {}) => {
    const {
        totalTrades = 0,
        totalVolume = 0,
        buyTrades = 0,
        sellTrades = 0,
        avgTradeSize = 0
    } = stats;

    return `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-t border-gray-700">
            <div class="text-center">
                <p class="text-gray-400 text-sm">Total Trades</p>
                <p class="text-white font-semibold text-lg">${totalTrades}</p>
            </div>
            <div class="text-center">
                <p class="text-gray-400 text-sm">Total Volume</p>
                <p class="text-white font-semibold text-lg">$${totalVolume.toLocaleString()}</p>
            </div>
            <div class="text-center">
                <p class="text-gray-400 text-sm">Buy / Sell</p>
                <p class="text-white font-semibold text-lg">${buyTrades} / ${sellTrades}</p>
            </div>
            <div class="text-center">
                <p class="text-gray-400 text-sm">Avg Trade Size</p>
                <p class="text-white font-semibold text-lg">$${avgTradeSize.toFixed(0)}</p>
            </div>
        </div>
    `;
};