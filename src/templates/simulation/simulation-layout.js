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
export const getMainSimulationLayoutTemplate = (simulation, currentUser, isCreator) => {
    const isActive = new Date() < new Date(simulation.endDate);
    
    return `
        <div class="min-h-screen bg-gray-900 text-white">
            ${getHeaderSectionTemplate(simulation, isActive)}
            ${getNavigationTabsTemplate()}
            ${getContentAreaTemplate()}
        </div>
    `;
};

/**
 * Generate the header section template
 * @param {Object} simulation - Simulation data
 * @param {boolean} isActive - Whether simulation is active
 * @returns {string} HTML template string
 */
export const getHeaderSectionTemplate = (simulation, isActive) => {
    return `
        <div class="bg-gradient-to-r from-cyan-600 to-purple-600 p-6">
            <div class="max-w-6xl mx-auto">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 id="simulation-title" class="text-3xl font-bold text-white mb-2">${simulation.name}</h1>
                        <div class="flex items-center gap-4 text-cyan-100">
                            <span id="simulation-status" class="text-sm font-medium px-3 py-1 rounded-full ${isActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}">
                                ${isActive ? "Active" : "Ended"}
                            </span>
                            <span class="text-sm">${new Date(simulation.startDate).toLocaleDateString()} - ${new Date(simulation.endDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    ${getHeaderButtonsTemplate()}
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate header action buttons template
 * @returns {string} HTML template string
 */
export const getHeaderButtonsTemplate = () => {
    return `
        <div class="flex items-center gap-3">
            <button id="leaderboard-btn" class="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Leaderboard
            </button>
            
            <button id="invite-btn" class="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Invite
            </button>
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

/**
 * Generate a loading state template for page sections
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