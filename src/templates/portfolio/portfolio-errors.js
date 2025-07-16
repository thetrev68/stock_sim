// file: src/templates/portfolio/portfolio-errors.js
// Error states and loading templates for portfolio view
// Focused module: All error handling and loading states exactly as they exist

/**
 * Generate portfolio loading state template
 * @returns {string} HTML template string
 */
export const getPortfolioLoadingTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p class="text-gray-400">Loading portfolio data...</p>
        </div>
    `;
};

/**
 * Generate portfolio error state template
 * @returns {string} HTML template string
 */
export const getPortfolioErrorTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Portfolio Error</h3>
            <p class="text-gray-400 max-w-md mx-auto">Unable to load portfolio data. Please try refreshing the page.</p>
        </div>
    `;
};

/**
 * Generate default portfolio state template (new user)
 * @returns {string} HTML template string
 */
export const getPortfolioDefaultStateTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Welcome to Your Portfolio</h3>
            <p class="text-gray-400 max-w-md mx-auto mb-6">You're starting with $10,000 in practice money. Make your first trade to begin building your portfolio.</p>
            <button 
                data-navigate="/trade" 
                class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Start Trading
            </button>
        </div>
    `;
};

/**
 * Generate holdings loading state template
 * @returns {string} HTML template string
 */
export const getHoldingsLoadingTemplate = () => {
    return `
        <div class="text-center py-8">
            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-400">Loading holdings...</p>
        </div>
    `;
};

/**
 * Generate holdings error template
 * @returns {string} HTML template string
 */
export const getHoldingsErrorTemplate = () => {
    return `
        <div class="text-center py-8">
            <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <p class="text-gray-400">Unable to load holdings data</p>
        </div>
    `;
};

/**
 * Generate price refresh error template
 * @returns {string} HTML template string
 */
export const getPriceRefreshErrorTemplate = () => {
    return `
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <h4 class="text-red-400 font-medium">Price Refresh Failed</h4>
                    <p class="text-gray-300 text-sm">Unable to update prices. Please try again later.</p>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate connection error template
 * @returns {string} HTML template string
 */
export const getConnectionErrorTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Connection Error</h3>
            <p class="text-gray-400 max-w-md mx-auto">Unable to connect to the server. Please check your internet connection and try again.</p>
        </div>
    `;
};

/**
 * Generate authentication required template
 * @returns {string} HTML template string
 */
export const getAuthRequiredTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Login Required</h3>
            <p class="text-gray-400 max-w-md mx-auto mb-6">You need to be logged in to view your portfolio.</p>
            <button 
                data-navigate="/auth" 
                class="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
                Login or Sign Up
            </button>
        </div>
    `;
};

/**
 * Generate portfolio initialization template
 * @returns {string} HTML template string
 */
export const getPortfolioInitializationTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Initializing Portfolio</h3>
            <p class="text-gray-400 max-w-md mx-auto">Setting up your trading account with $10,000 starting balance...</p>
            <div class="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mt-6"></div>
        </div>
    `;
};

/**
 * Generate generic section loading template
 * @param {string} sectionName - Name of the section loading
 * @returns {string} HTML template string
 */
export const getSectionLoadingTemplate = (sectionName = "data") => {
    return `
        <div class="text-center py-8">
            <div class="w-6 h-6 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-gray-400 text-sm">Loading ${sectionName}...</p>
        </div>
    `;
};

/**
 * Generate generic section error template
 * @param {string} sectionName - Name of the section that failed
 * @returns {string} HTML template string
 */
export const getSectionErrorTemplate = (sectionName = "data") => {
    return `
        <div class="text-center py-8">
            <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <p class="text-gray-400 text-sm">Unable to load ${sectionName}</p>
        </div>
    `;
};

/**
 * Generate retry button template
 * @param {string} buttonText - Button text
 * @param {string} onClick - JavaScript code to execute
 * @returns {string} HTML template string
 */
export const getRetryButtonTemplate = (buttonText = "Try Again", onClick = "location.reload()") => {
    return `
        <button 
            onclick="${onClick}" 
            class="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
            ${buttonText}
        </button>
    `;
};