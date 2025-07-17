// file: src/templates/trade/trade-recent-trades.js
// Recent trades display templates for trade view
// Focused module: Recent trades list exactly as it exists

/** TFC Moved
 * Generate no recent trades placeholder template
 * @returns {string} HTML template string
 */
export const getNoRecentTradesTemplate = () => {
    return `<p class="text-gray-500 text-center">No recent trades.</p>`;
};

/** TFC Moved
 * Generate individual trade item template
 * @param {Object} trade - Trade object
 * @param {string} tradeTypeClass - CSS class for trade type color
 * @param {string} tradeTime - Formatted trade time string
 * @returns {string} HTML template string
 */
export const getTradeItemTemplate = (trade, tradeTypeClass, tradeTime) => {
    return `
        <div class="bg-gray-700 p-3 rounded-md flex justify-between items-center">
            <div>
                <span class="font-semibold ${tradeTypeClass}">${trade.type.toUpperCase()}</span> 
                <span class="text-white">${trade.quantity}</span> shares of 
                <span class="font-bold uppercase text-cyan-300">${trade.ticker}</span> 
                at <span class="text-white">$${trade.price.toFixed(2)}</span>
            </div>
            <div class="text-gray-500 text-xs">${tradeTime}</div>
        </div>
    `;
};