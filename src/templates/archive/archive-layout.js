// templates/archive/archive-layout.js - Main layout templates for simulation archive view

import { formatCurrencyWithCommas, formatCurrency, formatPercentage } from "../../utils/currency-utils";

/** TFC Move
 * Generate the complete archive page layout template
 * @returns {string} HTML template string
 */
export const getArchivePageLayoutTemplate = () => {
    return `
        <div class="simulation-archive-view">
            <div id="archive-loading" class="flex items-center justify-center py-12">
                <div class="text-center">
                    <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-gray-400">Loading archived simulation...</p>
                </div>
            </div>

            <div id="archive-not-found" class="hidden bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
                <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 class="text-xl font-semibold text-red-400 mb-2">Archive Not Found</h2>
                <p class="text-gray-300 mb-4">The archived simulation you're looking for doesn't exist or you don't have access to it.</p>
                <button 
                    data-navigate="/" 
                    class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                >
                    Return to Dashboard
                </button>
            </div>

            <div id="archive-content" class="hidden">
                <!-- Archive Header -->
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-16 h-16 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-10 4h4m-4 4h4m6-8v8a2 2 0 01-2 2h-2"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h1 id="archive-title" class="text-3xl font-bold text-white">Archived Simulation</h1>
                                <span class="bg-yellow-600 text-white text-sm font-medium px-3 py-1 rounded-full">ARCHIVED</span>
                            </div>
                            <p id="archive-description" class="text-gray-400">Simulation archive description</p>
                        </div>
                        <div class="flex gap-3">
                            <button id="export-archive-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Export Results
                            </button>
                            <button 
                                data-navigate="/" 
                                class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>

                    <!-- Archive Stats -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gray-700 p-3 rounded-lg">
                            <p class="text-sm text-gray-400">Duration</p>
                            <p id="archive-duration" class="text-lg font-semibold text-white">0 days</p>
                        </div>
                        <div class="bg-gray-700 p-3 rounded-lg">
                            <p class="text-sm text-gray-400">Participants</p>
                            <p id="archive-participants" class="text-lg font-semibold text-white">0</p>
                        </div>
                        <div class="bg-gray-700 p-3 rounded-lg">
                            <p class="text-sm text-gray-400">Total Trades</p>
                            <p id="archive-trades" class="text-lg font-semibold text-white">0</p>
                        </div>
                        <div class="bg-gray-700 p-3 rounded-lg">
                            <p class="text-sm text-gray-400">Total Volume</p>
                            <p id="archive-volume" class="text-lg font-semibold text-white">${formatCurrencyWithCommas(0)}</p>
                        </div>
                    </div>

                    <!-- End Info -->
                    <div id="end-info" class="mt-4 p-3 bg-orange-900/20 border border-orange-500 rounded-lg hidden">
                        <div class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-orange-400 font-medium">Ended Early</span>
                            <span class="text-gray-300">•</span>
                            <span id="end-reason" class="text-gray-300">Reason</span>
                        </div>
                    </div>
                </div>

                <!-- Winner Spotlight -->
                <div id="winner-section" class="bg-gradient-to-r from-yellow-900/20 to-yellow-600/20 border border-yellow-500/50 rounded-lg p-6 mb-8">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span class="text-yellow-900 font-bold text-2xl">👑</span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-yellow-400 mb-1">Simulation Winner</h2>
                                <p id="winner-name" class="text-xl font-semibold text-white">Winner Name</p>
                                <p class="text-gray-300 text-sm">Final Portfolio Value: <span id="winner-value" class="font-medium">${formatCurrencyWithCommas(0)}</span></p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-yellow-400 font-medium">Total Return</p>
                            <p id="winner-return" class="text-3xl font-bold text-white">+${formatCurrency(0)}</p>
                            <p id="winner-percent" class="text-lg text-yellow-300">+${formatPercentage(0)}</p>
                        </div>
                    </div>
                </div>

                <!-- Final Rankings -->
                <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
                    <div class="p-6 border-b border-gray-700">
                        <h3 class="text-xl font-semibold text-white">Final Rankings</h3>
                        <p class="text-gray-400 text-sm mt-1">Complete leaderboard at simulation end</p>
                    </div>
                    
                    <div id="rankings-table-container" class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-700">
                            <thead class="bg-gray-750">
                                <tr>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Rank</th>
                                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Participant</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Final Value</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Total Return</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Return %</th>
                                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Trades</th>
                                </tr>
                            </thead>
                            <tbody id="rankings-tbody" class="divide-y divide-gray-700">
                                <!-- Rankings will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Simulation Details -->
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h3 class="text-xl font-semibold text-white mb-4">Simulation Details</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <h4 class="text-white font-medium mb-3">Timeline</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Start Date:</span>
                                    <span id="sim-start-date" class="text-white">--</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">End Date:</span>
                                    <span id="sim-end-date" class="text-white">--</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Archived:</span>
                                    <span id="archived-date" class="text-white">--</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="text-white font-medium mb-3">Settings</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Starting Balance:</span>
                                    <span id="starting-balance" class="text-white">--</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Short Selling:</span>
                                    <span id="short-selling" class="text-white">--</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Trading Hours:</span>
                                    <span id="trading-hours" class="text-white">--</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-white font-medium mb-3">Statistics</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Avg Return:</span>
                                    <span id="avg-return" class="text-white">--</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Best Performer:</span>
                                    <span id="best-return" class="text-white">--</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Avg Trades/User:</span>
                                    <span id="avg-trades" class="text-white">--</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/** TFC Move
 * Generate archive error state template (ADD THIS TO EXISTING archive-layout.js)
 * @returns {string} HTML template string
 */
export const getArchiveErrorTemplate = () => {
    return `
        <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 class="text-xl font-semibold text-red-400 mb-2">Error Loading Archive</h2>
            <p class="text-gray-300 mb-4">There was a problem loading the archive data.</p>
            <button 
                onclick="location.reload()" 
                class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
                Retry
            </button>
        </div>
    `;
};