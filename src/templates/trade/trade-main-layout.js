// file: src/templates/trade/trade-main-layout.js
// Main layout templates for trade view
// Focused module: Trade page structure and main layout exactly as it exists

/**
 * Generate main trade layout template
 * @returns {string} HTML template string
 */
export const getMainTradeLayoutTemplate = () => {
    return `
        <div class="min-h-screen bg-gray-900 text-white">
            <div class="max-w-7xl mx-auto p-6">
                <!-- Portfolio Context Selector -->
                <div id="portfolio-context" class="mb-8">
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-lg font-semibold text-white">Trading Context</h3>
                        </div>
                        <div class="flex items-center gap-4">
                            <label for="portfolio-selector" class="text-sm font-medium text-gray-300">Select Portfolio:</label>
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

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Trading Form -->
                    <div class="lg:col-span-1">
                        <div id="trade-form-container" class="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                            <!-- Trade form will be injected here -->
                        </div>
                    </div>

                    <!-- Stock Research & Quote Display -->
                    <div class="lg:col-span-2">
                        <div id="stock-research-container" class="space-y-6">
                            <!-- Stock research content will be injected here -->
                        </div>
                    </div>
                </div>

                <!-- Trade Confirmation & Status -->
                <div id="trade-status-container" class="mt-8">
                    <!-- Trade confirmation and status messages will be injected here -->
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate portfolio context selector template
 * @returns {string} HTML template string
 */
export const getPortfolioContextSelectorTemplate = () => {
    return `
        <div id="portfolio-context" class="mb-8">
            <div class="bg-gray-800 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold text-white">Trading Context</h3>
                </div>
                <div class="flex items-center gap-4">
                    <label for="portfolio-selector" class="text-sm font-medium text-gray-300">Select Portfolio:</label>
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
    `;
};

/**
 * Generate context info template
 * @param {Object} context - Context information
 * @returns {string} HTML template string
 */
export const getContextInfoTemplate = (context = {}) => {
    const {
        title = 'Solo Practice Mode',
        description = 'Trade with your personal portfolio',
        indicator = 'bg-cyan-400'
    } = context;

    return `
        <div id="context-info" class="mt-4 p-3 bg-gray-700 rounded-lg">
            <div class="flex items-center gap-3">
                <div id="context-indicator" class="w-3 h-3 ${indicator} rounded-full"></div>
                <div>
                    <p id="context-title" class="text-white font-medium">${title}</p>
                    <p id="context-description" class="text-gray-400 text-sm">${description}</p>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate trade page grid layout template
 * @returns {string} HTML template string
 */
export const getTradePageGridTemplate = () => {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Trading Form -->
            <div class="lg:col-span-1">
                <div id="trade-form-container" class="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                    <!-- Trade form will be injected here -->
                </div>
            </div>

            <!-- Stock Research & Quote Display -->
            <div class="lg:col-span-2">
                <div id="stock-research-container" class="space-y-6">
                    <!-- Stock research content will be injected here -->
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate trade status container template
 * @returns {string} HTML template string
 */
export const getTradeStatusContainerTemplate = () => {
    return `
        <div id="trade-status-container" class="mt-8">
            <!-- Trade confirmation and status messages will be injected here -->
        </div>
    `;
};