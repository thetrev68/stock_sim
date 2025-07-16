// templates/archive/archive-leaderboard.js - Leaderboard templates for simulation archive view

/**
 * Generate the complete leaderboard table template
 * @returns {string} HTML template string
 */
export const getArchiveLeaderboardTemplate = () => {
    return `
        <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
            <!-- Leaderboard Header -->
            <div class="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white">Final Rankings</h3>
                            <p class="text-yellow-200 text-sm">Complete performance results</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-yellow-200 text-sm">Total Participants</p>
                        <p id="total-participants" class="text-2xl font-bold text-white">0</p>
                    </div>
                </div>
            </div>

            <!-- Leaderboard Loading -->
            <div id="leaderboard-loading" class="p-8 text-center">
                <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gray-400">Loading final rankings...</p>
            </div>

            <!-- Leaderboard Error -->
            <div id="leaderboard-error" class="hidden p-8 text-center">
                <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-red-400 font-medium">Failed to load rankings</p>
                <p class="text-gray-400 text-sm mt-1">Please try refreshing the page</p>
            </div>

            <!-- Leaderboard Table -->
            <div id="leaderboard-table" class="hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700 border-b border-gray-600">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                                <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Participant</th>
                                <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Portfolio Value</th>
                                <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Total Return</th>
                                <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Return %</th>
                                <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Trades</th>
                                <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Best Stock</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboard-rows" class="bg-gray-800 divide-y divide-gray-700">
                            <!-- Leaderboard rows will be inserted here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Empty State -->
            <div id="leaderboard-empty" class="hidden p-8 text-center">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p class="text-gray-400 font-medium">No participants found</p>
                <p class="text-gray-500 text-sm mt-1">This simulation had no active participants</p>
            </div>
        </div>
    `;
};

/**
 * Generate a leaderboard row template
 * @param {Object} participant - Participant data
 * @param {number} rank - Participant rank
 * @returns {string} HTML template string
 */
export const getLeaderboardRowTemplate = (participant, rank) => {
    const rankDisplay = getRankDisplay(rank);
    const returnClass = participant.totalReturn >= 0 ? "text-green-400" : "text-red-400";
    const returnIcon = participant.totalReturn >= 0 ? "↗" : "↘";
    
    return `
        <tr class="hover:bg-gray-750 transition-colors duration-200">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    ${rankDisplay}
                    <span class="ml-3 text-sm font-medium text-white">${rank}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        ${participant.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div class="ml-3">
                        <div class="text-sm font-medium text-white">${participant.displayName}</div>
                        <div class="text-sm text-gray-400">${participant.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-medium text-white">$${participant.portfolioValue.toLocaleString()}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-medium ${returnClass}">
                    ${returnIcon} $${Math.abs(participant.totalReturn).toLocaleString()}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-medium ${returnClass}">
                    ${participant.returnPercentage > 0 ? "+" : ""}${participant.returnPercentage.toFixed(2)}%
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm text-white">${participant.totalTrades}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm text-white">${participant.bestStock || "-"}</div>
            </td>
        </tr>
    `;
};

/**
 * Generate rank display with medal/trophy icons for top positions
 * @param {number} rank - Participant rank
 * @returns {string} HTML for rank display
 */
function getRankDisplay(rank) {
    switch (rank) {
        case 1:
            return `
                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </div>
            `;
        case 2:
            return `
                <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </div>
            `;
        case 3:
            return `
                <div class="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-orange-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </div>
            `;
        default:
            return `<div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">${rank}</div>`;
    }
}