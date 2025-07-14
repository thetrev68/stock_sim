// file: src/templates/trade/trade-errors.js
// Error states and loading templates for trade view
// Focused module: Error handling and loading states exactly as they exist

/**
 * Generate trade view error template
 * @returns {string} HTML template string
 */
export const getTradeViewErrorTemplate = () => {
    return `
        <div class="trade-view-error">
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-red-400 mb-2">Unable to Load Trading</h3>
                <p class="text-gray-400 mb-6">There was an error loading the trading interface</p>
                <button 
                    onclick="window.location.reload()" 
                    class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    `;
};

/**
 * Generate authentication required template
 * @returns {string} HTML template string
 */
export const getAuthRequiredTemplate = () => {
    return `
        <div class="auth-required">
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-yellow-400 mb-2">Login Required</h3>
                <p class="text-gray-400 mb-6">Please log in to access the trading interface</p>
                <button 
                    data-navigate="/login" 
                    class="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Go to Login
                </button>
            </div>
        </div>
    `;
};

/**
 * Generate network error template
 * @returns {string} HTML template string
 */
export const getNetworkErrorTemplate = () => {
    return `
        <div class="network-error">
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-orange-400 mb-2">Connection Error</h3>
                <p class="text-gray-400 mb-6">Unable to connect to trading services</p>
                <button 
                    onclick="window.location.reload()" 
                    class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    `;
};

/**
 * Generate insufficient funds error template
 * @returns {string} HTML template string
 */
export const getInsufficientFundsTemplate = () => {
    return `
        <div id="feedback-message" class="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span class="font-semibold">Insufficient funds for this trade</span>
            </div>
        </div>
    `;
};

/**
 * Generate invalid ticker error template
 * @returns {string} HTML template string
 */
export const getInvalidTickerTemplate = () => {
    return `
        <div id="feedback-message" class="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-semibold">Invalid ticker symbol</span>
            </div>
        </div>
    `;
};

/**
 * Generate market closed warning template
 * @returns {string} HTML template string
 */
export const getMarketClosedWarningTemplate = () => {
    return `
        <div id="feedback-message" class="bg-yellow-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-semibold">Market is currently closed</span>
            </div>
        </div>
    `;
};