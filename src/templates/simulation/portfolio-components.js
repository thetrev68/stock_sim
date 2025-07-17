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