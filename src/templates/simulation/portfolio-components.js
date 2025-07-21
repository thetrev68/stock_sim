// file: src/templates/simulation/portfolio-components.js
// Portfolio display templates for simulation view
// Focused module: Only portfolio-related display templates (holdings, trades, etc.)

import { 
    formatCurrencyWithCommas,
    formatPrice
} from "../../utils/currency-utils.js";
// import { getInitial } from "../../utils/string-utils.js";

/**
 * Ultra clean holding template - no backgrounds, just typography
 */
export const getHoldingElementTemplate = (ticker, holding) => {
    const currentValue = holding.quantity * holding.avgPrice;    
    return `
        <div class="flex items-center justify-between py-3 border-b border-gray-600 last:border-b-0">
            <div class="flex items-baseline gap-4">
                <span class="text-white font-bold text-2xl">${ticker.toUpperCase()}</span>
                <span class="text-gray-400">${holding.quantity} shares</span>
            </div>
            <div class="text-right">
                <div class="text-white font-bold text-2xl">${formatCurrencyWithCommas(currentValue)}</div>
                <div class="text-gray-500 text-sm">avg ${formatPrice(holding.avgPrice)}</div>
            </div>
        </div>
    `;
};



/**
 * Ultra clean trade template - no backgrounds, just typography
 */
export const getTradeElementTemplate = (trade, tradeConfig) => {
    const tradeTypeClass = tradeConfig?.color || "text-gray-400";
    const tradeTime = new Date(trade.timestamp).toLocaleDateString();
    
    return `
        <div class="flex items-center justify-between py-3 border-b border-gray-600 last:border-b-0">
            <div class="flex items-baseline gap-4">
                <span class="${tradeTypeClass} font-bold text-sm">${trade.type.toUpperCase()}</span>
                <span class="text-white font-bold text-2xl">${trade.ticker.toUpperCase()}</span>
                <span class="text-gray-400">${trade.quantity} shares</span>
            </div>
            <div class="text-right">
                <div class="text-white font-bold text-2xl">${formatCurrencyWithCommas(trade.tradeCost)}</div>
                <div class="text-gray-500 text-sm">${tradeTime} at ${formatPrice(trade.price)}</div>
            </div>
        </div>
    `;
};