// file: src/templates/research/research-news.js
// News article templates for research view
// Focused module: News display, filtering, and article cards

/** TFC Moved
 * Generate a single news article card template
 * @param {Object} article - News article data
 * @param {string} article.headline - Article headline
 * @param {string} article.summary - Article summary
 * @param {string} article.source - News source
 * @param {string} article.datetime - Publication date
 * @param {string} article.image - Article image URL
 * @param {string} article.url - Article URL
 * @param {string} formattedDate - Formatted date string
 * @returns {string} HTML template string
 */
export const getNewsArticleCardTemplate = (article, formattedDate) => {
    const hasImage = article.image && article.image !== "https://via.placeholder.com/400x200/1f2937/ffffff?text=News";
    
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
                ` : ""}
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-4 mb-2">
                        <h4 class="text-white font-semibold text-lg leading-tight line-clamp-2">${article.headline}</h4>
                        <div class="flex-shrink-0 text-right">
                            <span class="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-full">${article.source}</span>
                        </div>
                    </div>
                    
                    <p class="text-gray-300 text-sm line-clamp-2 mb-3">${article.summary}</p>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-400">${formattedDate}</span>
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