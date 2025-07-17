// templates/archive/archive-leaderboard.js - Leaderboard templates for simulation archive view

import { formatCurrencyWithCommas, formatPercentage, formatCurrency } from "../../utils/currency-utils";

/** TFC Move
 * Generate a ranking row template (ADD THIS TO EXISTING archive-leaderboard.js)
 * @param {Object} ranking - Ranking data
 * @param {number} index - Row index
 * @param {boolean} isWinner - Whether this is the winner row
 * @returns {string} HTML template string
 */
export const getRankingRowTemplate = (ranking, index, isWinner) => {
    const totalReturn = ranking.totalReturn || 0;
    const totalReturnPercent = ranking.totalReturnPercent || 0;
    const returnClass = totalReturn >= 0 ? "text-green-400" : "text-red-400";
    
    const rankDisplay = isWinner ? `
        <div class="flex items-center">
            <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                <span class="text-yellow-900 font-bold text-sm">👑</span>
            </div>
            <span class="text-yellow-400 font-bold text-lg">#1</span>
        </div>
    ` : `
        <div class="flex items-center">
            <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                <span class="text-gray-300 font-bold text-sm">${ranking.rank || (index + 1)}</span>
            </div>
            <span class="text-gray-300 font-semibold text-lg">#${ranking.rank || (index + 1)}</span>
        </div>
    `;

    return `
        <tr class="hover:bg-gray-700/50 transition-colors ${isWinner ? "bg-yellow-900/20" : ""}">
            <td class="px-6 py-4 whitespace-nowrap">
                ${rankDisplay}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white font-bold text-sm">${ranking.displayName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <p class="text-white font-medium">${ranking.displayName}</p>
                        <p class="text-gray-400 text-sm">${ranking.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-white font-semibold">${formatCurrencyWithCommas(ranking.portfolioValue)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="${returnClass} font-semibold">
                    ${totalReturn >= 0 ? "+" : ""}${formatCurrency(Math.abs(totalReturn))}}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="${returnClass} font-semibold">
                    ${totalReturnPercent >= 0 ? "+" : ""}${formatPercentage(totalReturnPercent)}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-white">${ranking.totalTrades || 0}</div>
            </td>
        </tr>
    `;
};

/** TFC Move
 * Generate rank display template (ADD THIS TO EXISTING archive-leaderboard.js)
 * @param {number} rank - Participant rank
 * @param {boolean} isWinner - Whether this is the winner
 * @returns {string} HTML template string
 */
export const getRankDisplayTemplate = (rank, isWinner) => {
    if (isWinner) {
        return `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                    <span class="text-yellow-900 font-bold text-sm">👑</span>
                </div>
                <span class="text-yellow-400 font-bold text-lg">#1</span>
            </div>
        `;
    }
    
    return `
        <div class="flex items-center">
            <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                <span class="text-gray-300 font-bold text-sm">${rank}</span>
            </div>
            <span class="text-gray-300 font-semibold text-lg">#${rank}</span>
        </div>
    `;
};