// file: src/templates/portfolio/portfolio-errors.js
// Error states and loading templates for portfolio view
// Focused module: All error handling and loading states exactly as they exist

/** TFC Move
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

/** TFC Move
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