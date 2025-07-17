// file: src/templates/research/research-search.js
// Search autocomplete templates for research view
// Focused module: Search dropdown, results, and autocomplete functionality exactly as they exist

/** TFC Moved
 * Generate a single search result item template
 * @param {Object} stock - Stock search result data
 * @param {string} stock.symbol - Stock ticker symbol
 * @param {string} stock.description - Company description
 * @param {string} stock.type - Security type (Common Stock, ETF, etc.)
 * @returns {string} HTML template string
 */
export const getSearchResultItemTemplate = (stock) => {
    return `
        <div class="search-result-item p-3 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors" data-ticker="${stock.symbol}">
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="text-white font-medium">${stock.symbol}</h4>
                    <p class="text-gray-400 text-sm">${stock.description}</p>
                </div>
                <div class="text-right">
                    <span class="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded">${stock.type}</span>
                </div>
            </div>
        </div>
    `;
};

/** TFC Moved
 * Generate search empty state template
 * @returns {string} HTML template string
 */
export const getSearchEmptyStateTemplate = () => {
    return `
        <div class="p-3 text-center text-gray-400">
            <svg class="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-sm">No stocks found</p>
        </div>
    `;
};