// file: src/templates/trade/trade-main-layout.js
// Main layout templates for trade view
// Focused module: Primary trade page structure exactly as it exists

/**
 * Generate the main trade view template
 * @returns {string} HTML template string
 */
export const getMainTradeLayoutTemplate = () => {
    return `
        <div class="trade-view">
            <!-- Portfolio Context Section -->
            <section class="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-8">
                <div class="p-6">
                    <h1 class="text-2xl font-bold text-white mb-6">Trading Center</h1>
                    
                    <!-- Portfolio Selection -->
                    <div class="mb-6">
                        <label for="portfolio-selector" class="block text-sm font-medium text-gray-300 mb-2">Select Portfolio Context</label>
                        <div class="relative">
                            <select 
                                id="portfolio-selector" 
                                class="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-48"
                            >
                                <option value="">Loading portfolios...</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Context Info -->
                    <div id="context-info" class="mt-4 p-3 bg-gray-700 rounded-lg hidden">
                        <div class="flex items-center gap-3">
                            <div id="context-indicator" class="w-3 h-3 bg-cyan-400 rounded-full"></div>
                            <div>
                                <p id="context-title" class="text-white font-medium">Solo Practice Mode</p>
                                <p id="context-description" class="text-gray-400 text-sm">Trade with your personal portfolio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Trading Form Column -->
                <div class="lg:col-span-1">
                    <div id="trading-form-container" class="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                        <!-- Trading form will be inserted here -->
                    </div>
                </div>

                <!-- Stock Information & Quote Display Column -->
                <div class="lg:col-span-2">
                    <div id="stock-info-container" class="space-y-6">
                        <!-- Stock lookup and quote display will be inserted here -->
                    </div>
                </div>
            </div>

            <!-- Confirmation Modal Container -->
            <div id="confirmation-modal-container">
                <!-- Trade confirmation modal will be inserted here -->
            </div>

            <!-- Error/Feedback Container -->
            <div id="feedback-container" class="fixed bottom-4 right-4 z-50">
                <!-- Feedback messages will be inserted here -->
            </div>
        </div>
    `;
};

/**
 * Generate the trade page header template
 * @returns {string} HTML template string
 */
export const getTradePageHeaderTemplate = () => {
    return `
        <div class="p-6">
            <h1 class="text-2xl font-bold text-white mb-6">Trading Center</h1>
        </div>
    `;
};

/**
 * Generate the main content grid template
 * @returns {string} HTML template string
 */
export const getTradeContentGridTemplate = () => {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Trading Form Column -->
            <div class="lg:col-span-1">
                <div id="trading-form-container" class="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                    <!-- Trading form will be inserted here -->
                </div>
            </div>

            <!-- Stock Information & Quote Display Column -->
            <div class="lg:col-span-2">
                <div id="stock-info-container" class="space-y-6">
                    <!-- Stock lookup and quote display will be inserted here -->
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate the trade view loading template
 * @returns {string} HTML template string
 */
export const getTradeLoadingTemplate = () => {
    return `
        <div class="trade-view-loading">
            <section class="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-8">
                <div class="p-6">
                    <div class="animate-pulse">
                        <div class="h-8 bg-gray-700 rounded mb-6 w-48"></div>
                        <div class="h-4 bg-gray-700 rounded mb-2 w-32"></div>
                        <div class="h-10 bg-gray-700 rounded mb-4"></div>
                        <div class="h-16 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </section>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1">
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div class="animate-pulse space-y-4">
                            <div class="h-6 bg-gray-700 rounded w-32"></div>
                            <div class="h-10 bg-gray-700 rounded"></div>
                            <div class="h-10 bg-gray-700 rounded"></div>
                            <div class="h-10 bg-gray-700 rounded"></div>
                            <div class="h-12 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
                
                <div class="lg:col-span-2">
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div class="animate-pulse space-y-4">
                            <div class="h-6 bg-gray-700 rounded w-48"></div>
                            <div class="h-32 bg-gray-700 rounded"></div>
                            <div class="h-20 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};