// file: src/templates/research/research-errors.js
// Error states and loading templates for research view
// Focused module: All error handling and state management templates exactly as they exist

/** TFC Moved
 * Generate chart unavailable error template
 * @param {string} message - Error message to display
 * @returns {string} HTML template string
 */
export const getChartUnavailableTemplate = (message = "Chart temporarily unavailable") => {
    return `
        <div class="text-center py-12">
            <div class="text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p class="mb-2">${message}</p>
                <p class="text-sm text-gray-500">Using mock data due to API rate limits</p>
            </div>
        </div>
    `;
};