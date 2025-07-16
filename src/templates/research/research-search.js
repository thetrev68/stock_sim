// file: src/templates/research/research-search.js
// Search autocomplete templates for research view
// Focused module: Search dropdown, results, and autocomplete functionality

/**
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

/**
 * Generate search results list template
 * @param {Array} searchResults - Array of stock search results
 * @returns {string} HTML template string
 */
export const getSearchResultsListTemplate = (searchResults) => {
    if (!searchResults || searchResults.length === 0) {
        return getSearchEmptyStateTemplate();
    }
    
    return searchResults.map(stock => getSearchResultItemTemplate(stock)).join("");
};

/**
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

/**
 * Generate search loading state template
 * @returns {string} HTML template string
 */
export const getSearchLoadingTemplate = () => {
    return `
        <div class="p-3 text-center text-gray-400">
            <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p class="text-sm">Searching...</p>
        </div>
    `;
};

/**
 * Generate search input with autocomplete template
 * @returns {string} HTML template string
 */
export const getSearchInputTemplate = () => {
    return `
        <div class="flex-grow relative">
            <input 
                type="text" 
                id="research-ticker-input" 
                placeholder="Search stocks by symbol or company name (e.g., AAPL, Apple)" 
                class="w-full bg-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 pr-12 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                autocomplete="off"
            >
            <div class="absolute right-3 top-3">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
            
            <div id="search-loading" class="absolute right-3 top-3 hidden">
                <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    `;
};

/**
 * Generate research button template
 * @returns {string} HTML template string
 */
export const getResearchButtonTemplate = () => {
    return `
        <button 
            id="research-btn" 
            class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Research
        </button>
    `;
};

/**
 * Generate search results dropdown container template
 * @returns {string} HTML template string
 */
export const getSearchResultsDropdownTemplate = () => {
    return `
        <div id="search-results" class="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-50 hidden">
            <div id="search-results-list" class="py-2">
                <!-- Search results will be populated here -->
            </div>
        </div>
    `;
};

/**
 * Generate complete search interface template
 * @returns {string} HTML template string
 */
export const getCompleteSearchInterfaceTemplate = () => {
    return `
        <div class="relative">
            <div class="flex flex-col sm:flex-row gap-4 mb-4">
                ${getSearchInputTemplate()}
                ${getResearchButtonTemplate()}
            </div>
            ${getSearchResultsDropdownTemplate()}
        </div>
    `;
};

/**
 * Generate alternative simplified search input template (used in main layout)
 * @returns {string} HTML template string
 */
export const getSimpleSearchInputTemplate = () => {
    return `
        <div class="flex-1 relative">
            <input 
                type="text" 
                id="research-ticker-input"
                placeholder="Enter ticker symbol (e.g., AAPL, TSLA, MSFT)"
                class="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent uppercase"
                maxlength="10"
                autocomplete="off"
            >
            ${getSearchResultsDropdownTemplate()}
        </div>
    `;
};

/**
 * Generate search input with advanced features template
 * @returns {string} HTML template string
 */
export const getAdvancedSearchInputTemplate = () => {
    return `
        <div class="flex-grow relative">
            <input 
                type="text" 
                id="research-ticker-input" 
                placeholder="Search stocks by symbol or company name (e.g., AAPL, Apple)" 
                class="w-full bg-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 pr-12 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                autocomplete="off"
            >
            
            <!-- Search Icon -->
            <div class="absolute right-3 top-3">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
            
            <!-- Loading Spinner -->
            <div id="search-loading" class="absolute right-3 top-3 hidden">
                <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <!-- Results Dropdown -->
            <div id="search-results" class="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-50 hidden">
                <div id="search-results-list" class="py-2">
                    <!-- Search results will be populated here -->
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate search result item with enhanced display template
 * @param {Object} stock - Stock data
 * @param {string} stock.symbol - Stock symbol
 * @param {string} stock.description - Company description  
 * @param {string} stock.type - Security type
 * @param {string} stock.exchange - Exchange name (optional)
 * @returns {string} HTML template string
 */
export const getEnhancedSearchResultItemTemplate = (stock) => {
    return `
        <div class="search-result-item p-3 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors border-l-4 border-transparent hover:border-cyan-500" data-ticker="${stock.symbol}">
            <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <h4 class="text-white font-semibold text-lg">${stock.symbol}</h4>
                        ${stock.exchange ? `<span class="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded">${stock.exchange}</span>` : ""}
                    </div>
                    <p class="text-gray-400 text-sm line-clamp-2">${stock.description}</p>
                </div>
                <div class="flex-shrink-0 ml-3">
                    <span class="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded font-medium">${stock.type}</span>
                </div>
            </div>
        </div>
    `;
};