// file: src/templates/portfolio/portfolio-holdings.js
// Holdings table templates for portfolio view
// Focused module: Holdings display and empty states exactly as they exist

/**
 * Generate holdings table row template (loading state)
 * @param {string} ticker - Stock ticker symbol
 * @param {Object} holding - Holding data
 * @returns {string} HTML template string
 */
export const getHoldingLoadingRowTemplate = (ticker, holding) => {
    return `
        <tr id="holding-${ticker}" class="hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xs font-bold text-cyan-400">${ticker.charAt(0)}</span>
                    </div>
                    <span class="font-semibold text-white">${ticker.toUpperCase()}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${holding.quantity.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">$${holding.avgPrice.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
        </tr>
    `;
};



/**
 * Generate holdings table row template (with live prices)
 * @param {string} ticker - Stock ticker symbol
 * @param {Object} holding - Holding data
 * @param {Object} stockData - Live stock price data
 * @returns {string} HTML template string
 */
export const getHoldingRowTemplate = (ticker, holding, stockData) => {
    const currentPrice = stockData.currentPrice;
    const marketValue = holding.quantity * currentPrice;
    const gainLoss = marketValue - (holding.quantity * holding.avgPrice);
    const gainLossPercent = (gainLoss / (holding.quantity * holding.avgPrice)) * 100;
    
    const gainLossClass = gainLoss >= 0 ? 'text-green-400' : 'text-red-400';
    const gainLossSign = gainLoss >= 0 ? '+' : '';
    const percentSign = gainLossPercent >= 0 ? '+' : '';

    return `
        <tr class="hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xs font-bold text-cyan-400">${ticker.charAt(0)}</span>
                    </div>
                    <span class="font-semibold text-white">${ticker.toUpperCase()}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${holding.quantity.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">$${holding.avgPrice.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">$${currentPrice.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">$${marketValue.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right ${gainLossClass}">
                ${gainLossSign}$${Math.abs(gainLoss).toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right ${gainLossClass}">
                <span>${percentSign}${gainLossPercent.toFixed(2)}%</span>
            </td>
        </tr>
    `;
};

/**
 * Generate holdings table row template (error state)
 * @param {string} ticker - Stock ticker symbol
 * @param {Object} holding - Holding data
 * @returns {string} HTML template string
 */
export const getHoldingErrorRowTemplate = (ticker, holding) => {
    const marketValue = holding.quantity * holding.avgPrice;
    
    return `
        <tr class="hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xs font-bold text-cyan-400">${ticker.charAt(0)}</span>
                    </div>
                    <span class="font-semibold text-white">${ticker.toUpperCase()}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${holding.quantity.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${holding.avgPrice.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <span class="text-gray-500">${holding.avgPrice.toFixed(2)}</span>
                <span class="text-xs text-gray-500 block">estimate</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${marketValue.toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-500">$0.00</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-500">0.00%</td>
        </tr>
    `;
};

/**
 * Generate holdings table header template
 * @returns {string} HTML template string
 */
export const getHoldingsTableHeaderTemplate = () => {
    return `
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
    `;
};

/**
 * Generate complete holdings table template
 * @returns {string} HTML template string
 */
export const getHoldingsTableTemplate = () => {
    return `
        <div id="holdings-table-container" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
                ${getHoldingsTableHeaderTemplate()}
                <tbody id="holdings-tbody" class="divide-y divide-gray-700">
                    <!-- Holdings will be injected here -->
                </tbody>
            </table>
        </div>
    `;
};

/**
 * Generate no holdings message template
 * @returns {string} HTML template string
 */
export const getNoHoldingsMessageTemplate = () => {
    return `
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
    `;
};

/**
 * Generate holdings section header template
 * @returns {string} HTML template string
 */
export const getHoldingsSectionHeaderTemplate = () => {
    return `
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
    `;
};

/**
 * Generate complete holdings section template
 * @returns {string} HTML template string
 */
export const getCompleteHoldingsSectionTemplate = () => {
    return `
        <section class="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-8">
            ${getHoldingsSectionHeaderTemplate()}
            ${getHoldingsTableTemplate()}
            ${getNoHoldingsMessageTemplate()}
        </section>
    `;
};