// file: src/templates/portfolio/portfolio-holdings.js
// Holdings table templates for portfolio view
// Focused module: Holdings display and empty states exactly as they exist

import { 
    formatCurrencyWithCommas,
    calculateGainLoss,
    formatGainLoss,
    calculateMarketValue,
    calculateCostBasis,
    formatPrice,
    formatNumberWithCommas
} from "../../utils/currency-utils.js";
import { getInitial, toUpperCase } from "../../utils/string-utils.js";

/** TFC Move
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
                        <span class="text-xs font-bold text-cyan-400">${getInitial(ticker)}</span>
                    </div>
                    <span class="font-semibold text-white">${toUpperCase(ticker)}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatNumberWithCommas(holding.quantity)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${formatPrice(holding.avgPrice)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin ml-auto"></div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-400">Loading...</td>
        </tr>
    `;
};

/** TFC Move
 * Generate holdings table row template (with live prices)
 * @param {string} ticker - Stock ticker symbol
 * @param {Object} holding - Holding data
 * @param {number} currentPrice - Current stock price
 * @returns {string} HTML template string
 */
export const getHoldingRowTemplate = (ticker, holding, currentPrice) => {
    const finalPrice = currentPrice !== null ? currentPrice : holding.avgPrice;
    const marketValue = calculateMarketValue(holding.quantity, finalPrice);
    const costBasis = calculateCostBasis(holding.quantity, holding.avgPrice);
    const gainLossData = calculateGainLoss(marketValue, costBasis);
    const gainLossFormatted = formatGainLoss(gainLossData.amount, gainLossData.percentage);

    return `
        <tr class="hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xs font-bold text-cyan-400">${getInitial(ticker)}</span>
                    </div>
                    <span class="font-semibold text-white">${toUpperCase(ticker)}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatNumberWithCommas(holding.quantity)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${formatPrice(holding.avgPrice)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <span class="text-white">${formatPrice(finalPrice)}</span>
                ${currentPrice === null ? "<span class=\"text-xs text-gray-500 block\">estimate</span>" : ""}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white font-semibold">${formatCurrencyWithCommas(marketValue)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end">
                    <span class="${gainLossFormatted.colorClass} font-semibold">${gainLossFormatted.amount}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <span class="${gainLossFormatted.colorClass} font-semibold">${gainLossFormatted.percentage}</span>
            </td>
        </tr>
    `;
};

/** TFC Move
 * Generate holdings table row template (error state)
 * @param {string} ticker - Stock ticker symbol
 * @param {Object} holding - Holding data
 * @returns {string} HTML template string
 */
export const getHoldingErrorRowTemplate = (ticker, holding) => {
    const marketValue = calculateMarketValue(holding.quantity, holding.avgPrice);
    
    return `
        <tr class="hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xs font-bold text-cyan-400">${getInitial(ticker)}</span>
                    </div>
                    <span class="font-semibold text-white">${toUpperCase(ticker)}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatNumberWithCommas(holding.quantity)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">${formatPrice(holding.avgPrice)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <span class="text-gray-500">${formatPrice(holding.avgPrice)}</span>
                <span class="text-xs text-gray-500 block">estimate</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">${formatCurrencyWithCommas(marketValue)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-500">${formatPrice(0)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-500">0.00%</td>
        </tr>
    `;
};