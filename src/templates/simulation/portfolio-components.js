// file: src/templates/simulation/portfolio-components.js
// Portfolio display templates for simulation view
// Focused module: Only portfolio-related display templates (holdings, trades, etc.)

import { 
    formatCurrencyWithCommas,
    formatPrice
} from "../../utils/currency-utils.js";
import { formatSimpleDate } from "../../utils/date-utils.js"

/**
 * Clean holding template - Option 1 implementation
 */
export const getHoldingElementTemplate = (ticker, holding) => {
    const currentValue = holding.quantity * holding.avgPrice;
    
    return `
        <div class="bg-gray-750 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
            <div class="flex items-center justify-between gap-3">
                <!-- Left: Stock Info - FIXED flex layout -->
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span class="text-cyan-400 font-bold text-xs sm:text-sm">${ticker.charAt(0)}</span>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-white font-bold text-base sm:text-lg truncate">${ticker.toUpperCase()}</h4>
                        <p class="text-gray-400 text-xs sm:text-sm truncate">${holding.quantity} @ ${formatPrice(holding.avgPrice)}</p>
                    </div>
                </div>
                
                <!-- Right: Value - FIXED to not wrap -->
                <div class="text-right flex-shrink-0">
                    <div class="text-white font-bold text-base sm:text-xl">${formatCurrencyWithCommas(currentValue)}</div>
                    <div class="text-gray-500 text-xs">Total value</div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Clean trade template - Option 1 implementation
 */
export const getTradeElementTemplate = (trade, tradeConfig) => {
    const tradeTypeClass = tradeConfig?.color || "text-green-400";
    const tradeTime = formatSimpleDate(trade.timestamp);
    const totalCost = trade.quantity * trade.price;
    
    return `
        <div class="bg-gray-750 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
            <div class="flex items-center justify-between gap-3">
                <!-- Left: Trade Info - FIXED flex layout -->
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <div class="px-2 py-1 ${tradeTypeClass === "text-green-400" ? "bg-green-500/20" : "bg-red-500/20"} rounded text-xs font-bold ${tradeTypeClass} flex-shrink-0">
                        ${trade.type.toUpperCase()}
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-white font-bold text-base sm:text-lg truncate">${trade.ticker.toUpperCase()}</h4>
                        <p class="text-gray-400 text-xs sm:text-sm truncate">${trade.quantity} @ ${formatPrice(trade.price)}</p>
                    </div>
                </div>
                
                <!-- Right: Cost & Date - FIXED to not wrap -->
                <div class="text-right flex-shrink-0">
                    <div class="text-white font-bold text-base sm:text-xl">${formatCurrencyWithCommas(totalCost)}</div>
                    <div class="text-gray-500 text-xs">${tradeTime}</div>
                </div>
            </div>
        </div>
    `;
};