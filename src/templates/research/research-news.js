// file: src/templates/research/research-news.js
// News article templates for research view
// Focused module: News display, filtering, and article cards

/**
 * Generate a single news article card template
 * @param {Object} article - News article data
 * @param {string} article.headline - Article headline
 * @param {string} article.summary - Article summary
 * @param {string} article.source - News source
 * @param {string} article.datetime - Publication date
 * @param {string} article.image - Article image URL
 * @param {string} article.url - Article URL
 * @returns {string} HTML template string
 */
export const getNewsArticleCardTemplate = (article) => {
    const hasImage = article.image && article.image !== 'https://via.placeholder.com/400x200/1f2937/ffffff?text=News';
    
    return `
        <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200 cursor-pointer border border-gray-600">
            <div class="flex gap-4">
                ${hasImage ? `
                    <div class="flex-shrink-0">
                        <img 
                            src="${article.image}" 
                            alt="News image" 
                            class="w-24 h-16 object-cover rounded-lg"
                            onerror="this.style.display='none'"
                        >
                    </div>
                ` : ''}
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-4 mb-2">
                        <h4 class="text-white font-semibold text-lg leading-tight line-clamp-2">${article.headline}</h4>
                        <div class="flex-shrink-0 text-right">
                            <span class="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-full">${article.source}</span>
                        </div>
                    </div>
                    
                    <p class="text-gray-300 text-sm line-clamp-2 mb-3">${article.summary}</p>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-400">${article.formattedDate || article.datetime}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Read more</span>
                            <svg class="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate news filter buttons template
 * @returns {string} HTML template string
 */
export const getNewsFilterButtonsTemplate = () => {
    return `
        <div class="flex flex-wrap gap-2">
            <button 
                class="news-filter-btn bg-cyan-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                data-filter="all"
            >
                All News
            </button>
            <button 
                class="news-filter-btn text-gray-300 hover:text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                data-filter="today"
            >
                Today
            </button>
            <button 
                class="news-filter-btn text-gray-300 hover:text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                data-filter="week"
            >
                This Week
            </button>
        </div>
    `;
};

/**
 * Generate news search input template
 * @returns {string} HTML template string
 */
export const getNewsSearchInputTemplate = () => {
    return `
        <div class="relative">
            <input 
                type="text" 
                id="news-search-input"
                placeholder="Search news articles..." 
                class="w-full bg-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 pr-10 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            >
            <div class="absolute right-3 top-2.5">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
        </div>
    `;
};

/**
 * Generate news loading state template
 * @returns {string} HTML template string
 */
export const getNewsLoadingTemplate = () => {
    return `
        <div class="text-center py-8">
            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-400">Loading latest news...</p>
        </div>
    `;
};

/**
 * Generate news empty state template
 * @returns {string} HTML template string
 */
export const getNewsEmptyTemplate = () => {
    return `
        <div class="text-center py-8">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
            </svg>
            <h4 class="text-lg font-semibold text-gray-300 mb-2">No News Found</h4>
            <p class="text-gray-400">No recent news articles for this stock</p>
        </div>
    `;
};

/**
 * Generate news error state template
 * @returns {string} HTML template string
 */
export const getNewsErrorTemplate = () => {
    return `
        <div class="text-center py-8">
            <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h4 class="text-lg font-semibold text-red-400 mb-2">Error Loading News</h4>
            <p class="text-gray-400">Unable to load news articles at this time</p>
        </div>
    `;
};

/**
 * Generate news refresh button template
 * @returns {string} HTML template string
 */
export const getNewsRefreshButtonTemplate = () => {
    return `
        <button 
            id="refresh-news-btn"
            class="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors text-sm border border-gray-600"
            title="Refresh news articles"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Refresh</span>
        </button>
    `;
};

/**
 * Generate complete news section header template
 * @returns {string} HTML template string
 */
export const getNewsSectionHeaderTemplate = () => {
    return `
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div class="flex items-center gap-3">
                <h4 class="text-xl font-bold text-white">Recent News</h4>
                ${getNewsRefreshButtonTemplate()}
            </div>
            
            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <!-- Filter Buttons -->
                ${getNewsFilterButtonsTemplate()}
                
                <!-- Search Input -->
                <div class="lg:w-64">
                    ${getNewsSearchInputTemplate()}
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate news container template with all states
 * @returns {string} HTML template string
 */
export const getNewsContainerTemplate = () => {
    return `
        <div id="news-content">
            <!-- Loading State -->
            <div id="news-loading" class="hidden">
                ${getNewsLoadingTemplate()}
            </div>
            
            <!-- Articles Container -->
            <div id="news-articles" class="hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- News articles will be populated here -->
                </div>
            </div>
            
            <!-- Empty State -->
            <div id="news-empty" class="hidden">
                ${getNewsEmptyTemplate()}
            </div>
            
            <!-- Error State -->
            <div id="news-error" class="hidden">
                ${getNewsErrorTemplate()}
            </div>
        </div>
    `;
};

/**
 * Generate complete news section template
 * @returns {string} HTML template string
 */
export const getCompletNewseSectionTemplate = () => {
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            ${getNewsSectionHeaderTemplate()}
            ${getNewsContainerTemplate()}
        </div>
    `;
};