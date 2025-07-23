// file: src/templates/simulation/portfolio-components.js
// Updated portfolio display templates with live price support

import { 
    formatCurrencyWithCommas,
    formatPrice,
} from "../../utils/currency-utils.js";
import { formatSimpleDate } from "../../utils/date-utils.js";

/**
 * Enhanced holding template with live price display
 */
export const getHoldingElementTemplate = (ticker, holding) => {
    const currentValue = holding.quantity * holding.avgPrice;
    
    return `
        <div class="bg-gray-750 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
            <div class="flex items-center justify-between gap-3">
                <!-- Left: Stock Info -->
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span class="text-cyan-400 font-bold text-xs sm:text-sm">${ticker.charAt(0)}</span>
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-white font-bold text-base">${ticker.toUpperCase()}</h4>
                        <p class="text-gray-400 text-xs">
                            ${holding.quantity} @ ${formatPrice(holding.avgPrice)}
                        </p>
                    </div>
                </div>
                
                <!-- Right: Value -->
                <div class="text-right flex-shrink-0">
                    <div class="text-white font-semibold">${formatCurrencyWithCommas(currentValue)}</div>
                    <div class="text-gray-500 text-xs">Total value</div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Loading state for holdings
 */
export const getHoldingLoadingTemplate = (_ticker) => {
    return `
        <div class="bg-gray-750 rounded-lg p-4 border border-gray-600 animate-pulse">
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-lg"></div>
                    <div class="min-w-0">
                        <div class="h-5 bg-gray-600 rounded w-16 mb-2"></div>
                        <div class="h-4 bg-gray-600 rounded w-24"></div>
                    </div>
                </div>
                <div class="text-right flex-shrink-0">
                    <div class="h-6 bg-gray-600 rounded w-20 mb-1"></div>
                    <div class="h-4 bg-gray-600 rounded w-16"></div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Trade template with enhanced styling
 */
export const getTradeElementTemplate = (trade, tradeConfig) => {
    const tradeTypeClass = tradeConfig?.color || "text-green-400";
    const tradeTime = formatSimpleDate(trade.timestamp);
    const totalCost = trade.quantity * trade.price;
    
    return `
        <div class="bg-gray-750 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
            <div class="flex items-center justify-between gap-3">
                <!-- Left: Trade Info -->
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <div class="px-2 py-1 ${tradeTypeClass === "text-green-400" ? 
                        "bg-green-400/10 text-green-400" : 
                        "bg-red-400/10 text-red-400"} rounded text-xs font-medium uppercase">
                        ${trade.type}
                    </div>
                    <div class="min-w-0">
                        <h4 class="text-white font-bold text-base">${trade.ticker.toUpperCase()}</h4>
                        <p class="text-gray-400 text-xs">
                            ${trade.quantity} @ ${formatPrice(trade.price)}
                        </p>
                    </div>
                </div>
                
                <!-- Right: Cost and Time -->
                <div class="text-right flex-shrink-0">
                    <div class="text-white font-semibold">${formatCurrencyWithCommas(totalCost)}</div>
                    <div class="text-gray-500 text-xs">${tradeTime}</div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Portfolio summary header with live values
 */
export const getPortfolioSummaryTemplate = (portfolioData) => {
    const { cash, holdingsValue, totalValue } = portfolioData;
    const cashPercentage = totalValue > 0 ? (cash / totalValue * 100).toFixed(1) : 0;
    
    return `
        <div class="bg-gray-800 rounded-lg p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p class="text-gray-400 text-sm">Total Value</p>
                    <p class="text-2xl font-bold text-white">${formatCurrencyWithCommas(totalValue)}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-sm">Holdings Value</p>
                    <p class="text-xl font-semibold text-white">${formatCurrencyWithCommas(holdingsValue)}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-sm">Cash Available</p>
                    <p class="text-xl font-semibold text-white">${formatCurrencyWithCommas(cash)}</p>
                    <p class="text-xs text-gray-500">${cashPercentage}% of portfolio</p>
                </div>
            </div>
        </div>
    `;
};