// file: src/templates/research/research-stock-display.js
// Stock quote and company profile display templates for research view
// Focused module: Stock information display exactly as it exists

/** TFC Moved
 * Generate refresh news button template with loading state
 * @param {boolean} isLoading - Whether to show loading state
 * @returns {string} HTML template string
 */
export const getRefreshNewsButtonTemplate = (isLoading = false) => {
    if (isLoading) {
        return `
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        `;
    }
    
    return `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
    `;
};