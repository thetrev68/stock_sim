// file: src/templates/simulation/simulation-layout.js
// Main page layout templates for simulation view
// Focused module: Only layout and navigation templates

/**
 * Generate the main simulation page layout
 * @param {Object} simulation - Simulation data
 * @param {Object} currentUser - Current user object
 * @param {boolean} isCreator - Whether current user is the simulation creator
 * @returns {string} HTML template string
 */
export const getMainSimulationLayoutTemplate = (simulation, _currentUser, _isCreator) => {
    const isActive = new Date() < new Date(simulation.endDate);
    
    return `
        <div class="min-h-screen bg-gray-900 text-white">
            ${getHeaderSectionTemplate(simulation, isActive)}
            ${getNavigationTabsTemplate()}
            ${getContentAreaTemplate()}
        </div>
    `;
};

/** TFC Moved
 * Generate the header section template (simulation info header)
 * @returns {string} HTML template string
 */
export const getHeaderSectionTemplate = () => {
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 id="sim-name" class="text-3xl font-bold text-white mb-2">Simulation Name</h1>
                    <p id="sim-description" class="text-gray-400">Simulation description will appear here</p>
                    <div class="flex items-center gap-4 mt-3">
                        <span id="sim-status" class="px-3 py-1 rounded-full text-sm font-semibold bg-green-600 text-white">Active</span>
                        <span class="text-gray-400 text-sm">•</span>
                        <span id="sim-participants" class="text-gray-400 text-sm">0/20 participants</span>
                        <span class="text-gray-400 text-sm">•</span>
                        <span id="sim-duration" class="text-gray-400 text-sm">Duration info</span>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button 
                        id="view-members-btn"
                        class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                        <span id="members-btn-text">Members</span>
                    </button>
                    <button 
                        id="view-leaderboard-btn"
                        class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span id="leaderboard-btn-text">Leaderboard</span>
                    </button>
                    <button 
                        id="trade-in-sim-btn"
                        class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                        <span id="trade-btn-text">Trade Now</span>
                    </button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate navigation tabs template
 * @returns {string} HTML template string
 */
export const getNavigationTabsTemplate = () => {
    return `
        <div class="border-b border-gray-700">
            <div class="max-w-6xl mx-auto">
                <nav class="flex space-x-8" aria-label="Tabs">
                    <button id="overview-tab" class="tab-button active py-4 px-1 border-b-2 border-cyan-500 font-medium text-sm text-cyan-400">
                        Overview
                    </button>
                    <button id="portfolio-tab" class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-300 hover:text-white hover:border-gray-300">
                        My Portfolio
                    </button>
                    <button id="trade-tab" class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-300 hover:text-white hover:border-gray-300">
                        Trade
                    </button>
                    <button id="research-tab" class="tab-button py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-300 hover:text-white hover:border-gray-300">
                        Research
                    </button>
                </nav>
            </div>
        </div>
    `;
};

/**
 * Generate the main content area template
 * @returns {string} HTML template string
 */
export const getContentAreaTemplate = () => {
    return `
        <div class="max-w-6xl mx-auto p-6">
            <!-- Overview Tab Content -->
            <div id="overview-content" class="tab-content">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column: Simulation Info -->
                    <div class="lg:col-span-2 space-y-6">
                        ${getMembersAndActivitySectionTemplate()}
                    </div>

                    <!-- Right Column: Simulation Rules & Stats -->
                    <div class="space-y-6" id="simulation-sidebar">
                        <!-- Content will be loaded from simulation-sidebar.js -->
                    </div>
                </div>
            </div>

            <!-- Other Tab Contents -->
            ${getOtherTabContentsTemplate()}
        </div>
    `;
};

/**
 * Generate the members and activity section template
 * @returns {string} HTML template string
 */
export const getMembersAndActivitySectionTemplate = () => {
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div class="flex justify-between items-center mb-6 gap-4">
                <div>
                    <h3 class="text-xl font-semibold text-white">Simulation Members</h3>
                    <p class="text-gray-400 text-sm mt-1">Manage participants and view activity</p>
                </div>
                <div id="creator-actions" class="hidden"> // Changed to only 'hidden'
                    <button id="manage-members-btn" class="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                        Manage Members
                    </button>
                    <button id="simulation-settings-btn" class="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
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
                
                <div id="members-list" class="hidden space-y-3"></div>
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
    `;
};

/**
 * Generate other tab contents template
 * @returns {string} HTML template string
 */
export const getOtherTabContentsTemplate = () => {
    return `
        <!-- Portfolio Tab Content -->
        <div id="portfolio-content" class="tab-content hidden">
            <div class="text-center py-12">
                <p class="text-gray-400">Portfolio content will be loaded here...</p>
            </div>
        </div>

        <!-- Trade Tab Content -->
        <div id="trade-content" class="tab-content hidden">
            <div class="text-center py-12">
                <p class="text-gray-400">Trading interface will be loaded here...</p>
            </div>
        </div>

        <!-- Research Tab Content -->
        <div id="research-content" class="tab-content hidden">
            <div class="text-center py-12">
                <p class="text-gray-400">Research tools will be loaded here...</p>
            </div>
        </div>
    `;
};

/** TFC Moved
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

/**
 * Generate loading state template for page sections
 * @param {string} message - Loading message text
 * @returns {string} HTML template string
 */
export const getLoadingStateTemplate = (message = "Loading...") => {
    return `
        <div class="text-center py-8">
            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-400">${message}</p>
        </div>
    `;
};

/**
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
                                
                                <div id="sim-holdings-list" class="space-y-3 hidden">
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
                                
                                <div id="sim-trades-list" class="space-y-3 hidden">
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
                            <button id="simulation-settings-btn" class="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
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