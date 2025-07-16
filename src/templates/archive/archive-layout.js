// templates/archive/archive-layout.js - Main layout templates for simulation archive view

/**
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
                            <p id="archive-volume" class="text-lg font-semibold text-white">$0</p>
                        </div>
                    </div>

                    <!-- End Info -->
                    <div id="end-info" class="mt-4 p-3 bg-orange-900/20 border border-orange-500 rounded-lg hidden">
                        <div class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-orange-300 font-medium">Simulation ended by creator</span>
                        </div>
                    </div>
                </div>

                <!-- Content Tabs -->
                <div class="border-b border-gray-700 mb-6">
                    <nav class="flex space-x-8">
                        <button id="leaderboard-tab" class="tab-button border-b-2 border-cyan-500 text-cyan-400 py-3 px-1 text-sm font-medium">
                            Final Rankings
                        </button>
                        <button id="trades-tab" class="tab-button border-b-2 border-transparent text-gray-400 hover:text-gray-300 py-3 px-1 text-sm font-medium">
                            Trade History
                        </button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div id="leaderboard-content" class="tab-content">
                    <!-- Leaderboard content will be loaded here -->
                </div>

                <div id="trades-content" class="tab-content hidden">
                    <!-- Trade history content will be loaded here -->
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate archive loading state template
 * @param {string} message - Loading message
 * @returns {string} HTML template string
 */
export const getArchiveLoadingTemplate = (message = "Loading archived simulation...") => {
    return `
        <div class="flex items-center justify-center py-12">
            <div class="text-center">
                <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gray-400">${message}</p>
            </div>
        </div>
    `;
};

/**
 * Generate archive not found error template
 * @returns {string} HTML template string
 */
export const getArchiveNotFoundTemplate = () => {
    return `
        <div class="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
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
    `;
};