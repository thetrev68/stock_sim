// file: src/templates/simulation/simulation-layout.js
// Main page layout templates for simulation view
// Focused module: Only layout and navigation templates



/** TFC Keep
 * Generate the simulation rules section template (main content, not sidebar)
 * @returns {string} HTML template string
 */
export const getSimulationRulesSectionTemplate = () => {
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 class="text-xl font-semibold text-white mb-4">Simulation Rules</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                    <span class="text-gray-400">Starting Balance</span>
                    <p id="sim-starting-balance" class="text-white font-medium">$10,000</p>
                </div>
                <div>
                    <span class="text-gray-400">Short Selling</span>
                    <p id="sim-short-selling" class="text-white font-medium">Not Allowed</p>
                </div>
                <div>
                    <span class="text-gray-400">Trading Hours</span>
                    <p id="sim-trading-hours" class="text-white font-medium">Market Hours</p>
                </div>
                <div>
                    <span class="text-gray-400">Commission</span>
                    <p id="sim-commission" class="text-white font-medium">$0 per trade</p>
                </div>
            </div>
        </div>
    `;
};

/** TFC Moved
 * Generate the tab navigation and content template
 * @returns {string} HTML template string
 */
export const getTabNavigationAndContentTemplate = () => {
    return `
        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
            <div class="flex border-b border-gray-700">
                <button id="tab-portfolio" class="tab-btn flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 border-b-2 border-cyan-500 text-cyan-400 bg-gray-750">
                    Portfolio & Trades
                </button>
                <button id="tab-leaderboard" class="tab-btn flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 border-b-2 border-transparent text-gray-400 hover:text-white">
                    Leaderboard
                </button>
                <button id="tab-members" class="tab-btn flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 border-b-2 border-transparent text-gray-400 hover:text-white">
                    Members & Activity
                </button>
            </div>

            <div class="p-6">
                <div id="content-portfolio" class="tab-content">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 class="text-xl font-semibold text-white mb-4">Current Holdings</h3>
                            <div id="sim-holdings-container">
                                <div id="sim-holdings-loading" class="text-center py-4">
                                    <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p class="text-gray-400 text-sm">Loading holdings...</p>
                                </div>
                                
                                <div id="sim-holdings-empty" class="text-center py-8 hidden">
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
                                
                                <div id="sim-holdings-list" class="space-y-0 hidden">
                                    </div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-xl font-semibold text-white mb-4">Recent Trades</h3>
                            <div id="sim-trades-container">
                                <div id="sim-trades-loading" class="text-center py-4">
                                    <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p class="text-gray-400 text-sm">Loading trades...</p>
                                </div>
                                
                                <div id="sim-trades-empty" class="text-center py-8 hidden">
                                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2-2h10a2 2 0 002 2v12a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                    </svg>
                                    <h4 class="text-lg font-semibold text-gray-300 mb-2">No Trades Yet</h4>
                                    <p class="text-gray-400">Your trading history will appear here</p>
                                </div>
                                
                                <div id="sim-trades-list" class="space-y-0 hidden">
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="content-leaderboard" class="tab-content hidden">
                    <div id="leaderboard-overview-container">
                        <!-- Leaderboard Overview Component will be rendered here -->
                    </div>
                    
                    <div id="leaderboard-table-container" class="mt-8">
                        <!-- Leaderboard Table Component will be rendered here -->
                    </div>
                </div>

                <div id="content-members" class="tab-content hidden">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                        <div>
                            <h3 class="text-xl font-semibold text-white">Simulation Members</h3>
                            <p class="text-gray-400 text-sm mt-1">Manage participants and view activity</p>
                        </div>
                        <div id="creator-actions" class="hidden"> <button id="manage-members-btn" class="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                </svg>
                                Manage Members
                            </button>
                            <button id="simulation-settings-btn" class="hidden bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Settings
                            </button>
                        </div>
                    </div>

                    <div id="members-list-container" class="space-y-4">
                        <div id="members-loading" class="text-center py-8">
                            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p class="text-gray-400">Loading members...</p>
                        </div>
                        
                        <div id="members-list" class="hidden space-y-3">
                            </div>
                    </div>

                    <div class="mt-8">
                        <h4 class="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                        <div id="activity-feed" class="space-y-3">
                            <div class="text-center py-6 text-gray-400">
                                <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                                <p>Activity feed loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Add these new template functions to simulation-layout.js (remove old above once confirmed working)

/**
 * FIXED: getCleanHeaderSectionTemplate() - Better responsive layout
 */
export const getCleanHeaderSectionTemplate = () => {
    return `
        <!-- Main Simulation Header Card with Proper Container -->
        <div class="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-6 overflow-hidden">
            <!-- Header Section -->
            <div class="p-4 sm:p-6 border-b border-gray-700">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <!-- Title and Status -->
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h1 id="sim-name" class="text-2xl sm:text-3xl font-bold text-white truncate">
                                Loading...
                            </h1>
                            <span id="sim-status-badge" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-600 text-gray-300 w-fit">
                                Loading...
                            </span>
                        </div>
                        <p id="sim-description" class="text-gray-400 text-sm sm:text-base">
                            Loading simulation details...
                        </p>
                    </div>
                    
                    <!-- Primary Action Button (Trade Now) -->
                    <div class="flex-shrink-0 w-full sm:w-auto">
                        <button id="trade-now-btn" class="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            <span id="trade-btn-text">Trade Now</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Simulation Stats Grid -->
            <div class="p-4 sm:p-6">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div class="bg-gray-750 rounded-lg p-3 sm:p-4">
                        <div class="text-xs sm:text-sm text-gray-400 mb-1">Duration</div>
                        <div id="sim-duration" class="text-sm sm:text-base font-semibold text-white">
                            Loading...
                        </div>
                    </div>
                    <div class="bg-gray-750 rounded-lg p-3 sm:p-4">
                        <div class="text-xs sm:text-sm text-gray-400 mb-1">Participants</div>
                        <div id="sim-participants" class="text-sm sm:text-base font-semibold text-white">
                            Loading...
                        </div>
                    </div>
                    <div class="bg-gray-750 rounded-lg p-3 sm:p-4">
                        <div class="text-xs sm:text-sm text-gray-400 mb-1">Starting Balance</div>
                        <div id="sim-starting-balance" class="text-sm sm:text-base font-semibold text-white">
                            Loading...
                        </div>
                    </div>
                    <div class="bg-gray-750 rounded-lg p-3 sm:p-4">
                        <div class="text-xs sm:text-sm text-gray-400 mb-1">Your Rank</div>
                        <div id="sim-your-rank" class="text-sm sm:text-base font-semibold text-white">
                            Loading...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * FIXED: getCleanStatsCardsTemplate() - Better responsive and proper button text
 */
export const getCleanStatsCardsTemplate = () => {
    return `
        <!-- Stats Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <!-- Your Rank Card -->
            <div class="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-400">Your Rank</h3>
                    <div class="p-2 bg-purple-500/20 rounded-lg">
                        <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex items-end gap-2">
                    <span id="user-rank" class="text-2xl sm:text-3xl font-bold text-white">#1</span>
                    <span id="user-rank-detail" class="text-xs text-gray-400 mb-1">of 1 participants</span>
                </div>
            </div>

            <!-- Portfolio Value Card -->
            <div class="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-400">Portfolio Value</h3>
                    <div class="p-2 bg-green-500/20 rounded-lg">
                        <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex flex-col">
                    <span id="portfolio-value" class="text-2xl sm:text-3xl font-bold text-white">$10,000.00</span>
                    <span id="portfolio-change" class="text-xs text-green-400">+0.00 (+0.00%)</span>
                </div>
            </div>

            <!-- Time Remaining Card -->
            <div class="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-colors sm:col-span-2 lg:col-span-1">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-400">Time Remaining</h3>
                    <div class="p-2 bg-yellow-500/20 rounded-lg">
                        <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex flex-col">
                    <span id="time-remaining-number" class="text-2xl sm:text-3xl font-bold text-white">7</span>
                    <span id="time-remaining-subtitle" class="text-xs text-gray-400">days left</span>
                </div>
            </div>
        </div>

        <!-- Action Buttons Section -->
        <div class="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mb-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Simulation Management
            </h3>
            
            <!-- Mobile: Stack vertically, Desktop: Side by side -->
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <!-- Manage Members Button - FIXED TEXT -->
                <button id="manage-members-btn" class="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                    <span>Manage Members</span>
                </button>
                
                <!-- Settings Button - FIXED TEXT -->
                <button id="simulation-settings-btn" class="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>Settings</span>
                </button>
            </div>
        </div>
    `;
};

/**
 * UPDATE: getPortfolioSectionTemplate() - Add consistent container
 */
export const getPortfolioSectionTemplate = () => {
    return `
        <section class="portfolio-section bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
            <div class="p-4 sm:p-6 border-b border-gray-700">
                <div>
                    <h2 class="text-xl font-semibold text-white">Your Simulation Portfolio</h2>
                    <p class="text-sm text-gray-400 mt-1">Current holdings and recent trades</p>
                </div>
            </div>
            
            <!-- MOBILE: Single column, DESKTOP: Two columns -->
            <div class="p-2 sm:p-4 lg:p-6">
                <div class="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
                    <!-- Current Holdings -->
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-3 px-2 sm:px-0">Current Holdings</h3>
                        <div id="sim-holdings-container">
                            <div id="sim-holdings-loading" class="text-center py-4 hidden">
                                <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p class="text-gray-400 text-sm">Loading holdings...</p>
                            </div>
                            
                            <div id="sim-holdings-list" class="space-y-3">
                                <!-- Holdings will be populated here -->
                            </div>
                            
                            <div id="sim-holdings-empty" class="hidden text-center py-8 text-gray-500">
                                <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                                <p class="text-sm">No holdings yet</p>
                                <p class="text-xs text-gray-600 mt-1">Make your first trade to see positions here</p>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Trades -->
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-3 px-2 sm:px-0">Recent Trades</h3>
                        <div id="sim-recent-trades-container">
                            <div id="sim-trades-loading" class="text-center py-4 hidden">
                                <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p class="text-gray-400 text-sm">Loading trades...</p>
                            </div>
                            
                            <div id="sim-trades-list" class="space-y-3">
                                <!-- Recent trades will be populated here -->
                            </div>
                            
                            <div id="sim-trades-empty" class="hidden text-center py-8 text-gray-500">
                                <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                <p class="text-sm">No recent trades</p>
                                <p class="text-xs text-gray-600 mt-1">Trade history will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
};

/**
 * UPDATE: getLeaderboardSectionTemplate() - Add consistent container
 */
export const getLeaderboardSectionTemplate = () => {
    return `
        <section class="leaderboard-section bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
            <div class="p-6 border-b border-gray-700">
                <div>
                    <h2 class="text-xl font-semibold text-white">Leaderboard</h2>
                    <p class="text-sm text-gray-400 mt-1">All participants ranked by portfolio value</p>
                </div>
            </div>
            
            <div class="p-6">
                <div id="leaderboard-overview-container">
                    <!-- Leaderboard Overview Component will be rendered here -->
                </div>
                
                <div id="leaderboard-table-container" class="mt-8">
                    <!-- Leaderboard Table Component will be rendered here -->
                </div>
            </div>
        </section>
    `;
};

/**
 * UPDATE: getActivitySectionTemplate() - Add consistent container
 */
export const getActivitySectionTemplate = () => {
    return `
        <section class="activity-section bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
            <div class="p-6 border-b border-gray-700">
                <div>
                    <h2 class="text-xl font-semibold text-white">Recent Activity</h2>
                    <p class="text-sm text-gray-400 mt-1">Latest trades and member activity</p>
                </div>
            </div>
            
            <div class="p-6">
                <div id="activity-feed-container">
                    <div id="activity-loading" class="text-center py-8">
                        <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p class="text-gray-400 text-sm">Loading activity...</p>
                    </div>
                    
                    <div id="activity-feed" class="space-y-3">
                        <!-- Activity feed will be populated here -->
                    </div>
                </div>
            </div>
        </section>
    `;
};