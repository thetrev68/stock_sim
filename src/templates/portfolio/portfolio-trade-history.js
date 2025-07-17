// file: src/templates/portfolio/portfolio-trade-history.js
// Trade history templates for portfolio view
// Focused module: Trade history display and filtering exactly as they exist

import {
    getTradeTypeColorClass,
    formatNumberWithCommas,
    formatCurrencyWithCommas
} from "../../utils/currency-utils.js";
import { getInitial, toUpperCase } from "../../utils/string-utils.js";

/** TFC Move
 * Generate trade history row template for the table
 * @param {Object} trade - Trade data object
 * @returns {string} HTML template string
 */
export const getTradeHistoryRowTemplate = (trade) => {
    const tradeDate = new Date(trade.timestamp);
    const tradeDateStr = tradeDate.toLocaleDateString();
    const tradeTimeStr = tradeDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const tradeTypeClass = getTradeTypeColorClass(trade.type);
    const tradeIcon = trade.type === "buy" ? "↗" : "↘";
    
    return `
        <tr class="hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-white font-medium">${tradeDateStr}</div>
                <div class="text-sm text-gray-400">${tradeTimeStr}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="${tradeTypeClass} px-3 py-1 rounded-full text-sm font-semibold">
                    ${tradeIcon} ${toUpperCase(trade.type)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xs font-bold text-cyan-400">${getInitial(trade.ticker)}</span>
                    </div>
                    <span class="font-semibold text-white">${toUpperCase(trade.ticker)}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatNumberWithCommas(trade.quantity)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${formatCurrencyWithCommas(trade.price)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white font-semibold">$${formatCurrencyWithCommas(trade.tradeCost)}</td>
        </tr>
    `;
};