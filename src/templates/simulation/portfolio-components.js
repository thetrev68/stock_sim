// file: src/templates/simulation/portfolio-components.js
// Portfolio display templates for simulation view
// Focused module: Only portfolio-related display templates (holdings, trades, etc.)

import { 
    formatCurrencyWithCommas,
    formatPrice
} from "../../utils/currency-utils.js";
import { getInitial } from "../../utils/string-utils.js";

/** TFC Moved
 * Generate the holding element template (individual holding display) - EXTRACTED FROM simulation.js
 * @param {string} ticker - Stock ticker symbol
 * @param {Object} holding - Holding data object with quantity and avgPrice
 * @returns {string} HTML template string
 */
export const getHoldingElementTemplate = (ticker, holding) => {
    const currentValue = holding.quantity * holding.avgPrice;    
    return `
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <span class="text-sm font-bold text-cyan-400">${getInitial(ticker)}</span>
            </div>
            <div>
                <h4 class="font-semibold text-white">${ticker.toUpperCase()}</h4>
                <p class="text-sm text-gray-400">${holding.quantity} shares</p>
            </div>
        </div>
        <div class="text-right">
            <p class="font-semibold text-white">${formatCurrencyWithCommas(currentValue)}</p>
            <p class="text-sm text-gray-400">@${formatPrice(holding.avgPrice)}</p>
        </div>
    `;
};

/** TFC Moved
* Generate the trade element template (individual trade display) - EXTRACTED FROM simulation.js
 * @param {Object} trade - Trade data object
 * @param {Object} tradeConfig - Trade type configuration from TRADE_TYPE_CONFIG
 * @returns {string} HTML template string
 */
export const getTradeElementTemplate = (trade, tradeConfig) => {
    const tradeTypeClass = tradeConfig?.color || "text-gray-400";
    const tradeIcon = tradeConfig?.icon || "•";
    const tradeTime = new Date(trade.timestamp).toLocaleDateString();
    
    return `
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <span class="text-sm font-bold text-cyan-400">${getInitial(trade.ticker)}</span>
            </div>
            <div>
                <h4 class="font-semibold text-white">
                    <span class="${tradeTypeClass}">${tradeIcon} ${trade.type.toUpperCase()}</span>
                    ${trade.ticker.toUpperCase()}
                </h4>
                <p class="text-sm text-gray-400">${trade.quantity} shares • ${tradeTime}</p>
            </div>
        </div>
        <div class="text-right">
            <p class="font-semibold text-white">${formatCurrencyWithCommas(trade.tradeCost)}</p>
            <p class="text-sm text-gray-400">@${formatPrice(trade.price)}</p>
        </div>
    `;
};

/**
 * Generate the holdings loading state template
 * @returns {string} HTML template string
 */
export const getHoldingsLoadingTemplate = () => {
    return `
        <div class="text-center py-4">
            <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p class="text-gray-400 text-sm">Loading holdings...</p>
        </div>
    `;
};

/**
 * Generate the empty holdings state template
 * @returns {string} HTML template string
 */
export const getEmptyHoldingsTemplate = () => {
    return `
        <div class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <h4 class="text-lg font-semibold text-gray-300 mb-2">No Holdings Yet</h4>
            <p class="text-gray-400 mb-4">Start trading to build your portfolio</p>
            <button 
                id="start-trading-btn"
                class="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
                Start Trading
            </button>
        </div>
    `;
};

/** 
 * Generate the holdings error state template
 * @returns {string} HTML template string
 */
export const getHoldingsErrorTemplate = () => {
    return `
        <div class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h4 class="text-lg font-semibold text-red-400 mb-2">Error Loading Holdings</h4>
            <p class="text-gray-400">Unable to load portfolio holdings</p>
        </div>
    `;
};