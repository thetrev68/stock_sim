// file: src/templates/research/research-errors.js
// Error states and loading templates for research view
// Focused module: All error handling and state management templates exactly as they exist

/**
 * Generate main research loading state template
 * @returns {string} HTML template string
 */
export const getResearchLoadingTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p class="text-gray-400">Researching stock data...</p>
        </div>
    `;
};

/**
 * Generate main research error state template
 * @returns {string} HTML template string
 */
export const getResearchErrorTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Research Error</h3>
            <p id="research-error-text" class="text-gray-400 max-w-md mx-auto">An error occurred while fetching stock data.</p>
        </div>
    `;
};

/**
 * Generate research placeholder/default state template
 * @returns {string} HTML template string
 */
export const getResearchPlaceholderTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Research a Stock</h3>
            <p class="text-gray-400 max-w-md mx-auto">Enter a ticker symbol above to get comprehensive stock information, charts, and news.</p>
        </div>
    `;
};

/**
 * Generate stock data not found error template
 * @param {string} ticker - Stock ticker that was not found
 * @returns {string} HTML template string
 */
export const getStockNotFoundErrorTemplate = (ticker = '') => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Stock Not Found</h3>
            <p class="text-gray-400 max-w-md mx-auto">
                ${ticker ? `No stock data found for "${ticker}".` : 'Stock data not found.'} 
                Please check the ticker symbol and try again.
            </p>
        </div>
    `;
};

/**
 * Generate API rate limit error template
 * @returns {string} HTML template string
 */
export const getApiRateLimitErrorTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">API Rate Limit Reached</h3>
            <p class="text-gray-400 max-w-md mx-auto">Too many requests. Please wait a moment before trying again.</p>
        </div>
    `;
};

/**
 * Generate network error template
 * @returns {string} HTML template string
 */
export const getNetworkErrorTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Connection Error</h3>
            <p class="text-gray-400 max-w-md mx-auto">Unable to connect to the server. Please check your internet connection and try again.</p>
        </div>
    `;
};

/**
 * Generate search loading indicator template
 * @returns {string} HTML template string
 */
export const getSearchLoadingIndicatorTemplate = () => {
    return `
        <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
    `;
};

/**
 * Generate generic section error template
 * @param {string} sectionName - Name of the section that failed
 * @returns {string} HTML template string
 */
export const getSectionErrorTemplate = (sectionName = 'data') => {
    return `
        <div class="text-center py-8">
            <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <p class="text-gray-400">Unable to load ${sectionName}</p>
        </div>
    `;
};

/**
 * Generate generic loading template
 * @param {string} message - Loading message
 * @returns {string} HTML template string
 */
export const getGenericLoadingTemplate = (message = 'Loading...') => {
    return `
        <div class="text-center py-8">
            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-400">${message}</p>
        </div>
    `;
};

/**
 * Generate timeout error template
 * @returns {string} HTML template string
 */
export const getTimeoutErrorTemplate = () => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l4 4m6-4a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Request Timeout</h3>
            <p class="text-gray-400 max-w-md mx-auto">The request took too long to complete. Please try again.</p>
        </div>
    `;
};

/**
 * Generate retry action button template
 * @param {string} buttonText - Text for the retry button
 * @param {string} onClick - JavaScript code to execute on click
 * @returns {string} HTML template string
 */
export const getRetryButtonTemplate = (buttonText = 'Try Again', onClick = 'location.reload()') => {
    return `
        <button 
            onclick="${onClick}" 
            class="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
            ${buttonText}
        </button>
    `;
};

/**
 * Generate complete error state with retry button template
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {string} buttonText - Retry button text
 * @param {string} onClick - Retry button action
 * @returns {string} HTML template string
 */
export const getCompleteErrorStateTemplate = (
    title = 'Error',
    message = 'Something went wrong. Please try again.',
    buttonText = 'Try Again',
    onClick = 'location.reload()'
) => {
    return `
        <div class="text-center py-16">
            <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">${title}</h3>
            <p class="text-gray-400 max-w-md mx-auto mb-6">${message}</p>
            ${getRetryButtonTemplate(buttonText, onClick)}
        </div>
    `;
};

/**
 * Generate empty state template
 * @param {string} title - Empty state title
 * @param {string} message - Empty state message
 * @param {string} iconPath - SVG path for the icon
 * @returns {string} HTML template string
 */
export const getEmptyStateTemplate = (
    title = 'No Data Available',
    message = 'There is currently no data to display.',
    iconPath = 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
) => {
    return `
        <div class="text-center py-12">
            <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">${title}</h3>
            <p class="text-gray-400">${message}</p>
        </div>
    `;
};