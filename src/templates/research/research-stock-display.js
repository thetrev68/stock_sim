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

// /**
//  * Generate stock quote header template (main layout version)
//  * @returns {string} HTML template string
//  */
// export const getStockQuoteHeaderTemplate = () => {
//     return `
//         <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border border-gray-700">
//             <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                 <!-- Company Header Info -->
//                 <div class="flex-1">
//                     <div class="flex items-center gap-3 mb-2">
//                         <h3 id="company-name" class="text-2xl font-bold text-white">Company Name</h3>
//                         <span id="quote-ticker" class="text-lg font-semibold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded">TICKER</span>
//                     </div>
//                     <div class="flex flex-wrap gap-4 text-sm text-gray-400">
//                         <span>Exchange: <span id="company-exchange" class="text-white">--</span></span>
//                         <span>Sector: <span id="company-sector" class="text-white">--</span></span>
//                         <span>Currency: <span id="company-currency" class="text-white">--</span></span>
//                     </div>
//                 </div>
                
//                 <!-- Price Information -->
//                 <div class="text-right">
//                     <div class="text-3xl font-bold text-white mb-1">
//                         $<span id="current-price">0.00</span>
//                     </div>
//                     <div id="price-change" class="text-lg font-semibold text-gray-400">
//                         ↗ 0.00 (0.00%)
//                     </div>
//                 </div>
//             </div>

//             <!-- Quick Stats Row -->
//             <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
//                 <div class="text-center">
//                     <p class="text-gray-400 text-sm">Open</p>
//                     <p class="text-white font-semibold">$<span id="open-price">--</span></p>
//                 </div>
//                 <div class="text-center">
//                     <p class="text-gray-400 text-sm">Day High</p>
//                     <p class="text-white font-semibold">$<span id="day-high">--</span></p>
//                 </div>
//                 <div class="text-center">
//                     <p class="text-gray-400 text-sm">Day Low</p>
//                     <p class="text-white font-semibold">$<span id="day-low">--</span></p>
//                 </div>
//                 <div class="text-center">
//                     <p class="text-gray-400 text-sm">Volume</p>
//                     <p class="text-white font-semibold"><span id="volume">--</span></p>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate alternative stock quote header template (with company logo)
//  * @returns {string} HTML template string
//  */
// export const getAlternativeStockQuoteHeaderTemplate = () => {
//     return `
//         <div class="flex items-center gap-4 mb-6">
//             <div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
//                 <span id="company-initial" class="text-white font-bold text-2xl">A</span>
//             </div>
//             <div>
//                 <h2 class="text-2xl font-bold text-white mb-2">
//                     <span id="company-name">Company Name</span>
//                     <span class="text-lg font-normal text-gray-400 ticker-symbol ml-2">(<span id="quote-ticker">TICKER</span>)</span>
//                 </h2>
//                 <div class="flex items-center gap-4 text-sm text-gray-400">
//                     <span id="company-exchange">NASDAQ</span>
//                     <span>•</span>
//                     <span id="company-sector">Technology</span>
//                     <span>•</span>
//                     <span id="company-currency">USD</span>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate stock price display template
//  * @returns {string} HTML template string
//  */
// export const getStockPriceDisplayTemplate = () => {
//     return `
//         <div class="text-right">
//             <p class="text-4xl font-bold text-white mb-2" id="current-price">$0.00</p>
//             <div class="flex items-center justify-end gap-2">
//                 <span id="price-change" class="text-lg font-semibold">$0.00 (0.00%)</span>
//                 <span class="text-gray-400 text-sm">Today</span>
//             </div>
//             <p class="text-gray-400 text-sm mt-1" id="last-updated">Last updated: --</p>
//         </div>
//     `;
// };

// /**
//  * Generate stock quick stats grid template
//  * @returns {string} HTML template string
//  */
// export const getStockQuickStatsTemplate = () => {
//     return `
//         <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
//             <div>
//                 <span class="text-gray-400 text-sm">Open</span>
//                 <p id="open-price" class="text-white font-semibold">$0.00</p>
//             </div>
//             <div>
//                 <span class="text-gray-400 text-sm">High</span>
//                 <p id="day-high" class="text-white font-semibold">$0.00</p>
//             </div>
//             <div>
//                 <span class="text-gray-400 text-sm">Low</span>
//                 <p id="day-low" class="text-white font-semibold">$0.00</p>
//             </div>
//             <div>
//                 <span class="text-gray-400 text-sm">Volume</span>
//                 <p id="volume" class="text-white font-semibold">0</p>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate company profile loading template
//  * @returns {string} HTML template string
//  */
// export const getProfileLoadingTemplate = () => {
//     return `
//         <div class="text-center py-8">
//             <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p class="text-gray-400">Loading profile...</p>
//         </div>
//     `;
// };

// /**
//  * Generate company profile data template (main layout version)
//  * @returns {string} HTML template string
//  */
// export const getProfileDataTemplate = () => {
//     return `
//         <div class="space-y-4">
//             <div>
//                 <p class="text-gray-400 text-sm mb-1">Market Cap</p>
//                 <p id="market-cap" class="text-white font-semibold">--</p>
//             </div>
//             <div>
//                 <p class="text-gray-400 text-sm mb-1">P/E Ratio</p>
//                 <p id="pe-ratio" class="text-white font-semibold">--</p>
//             </div>
//             <div>
//                 <p class="text-gray-400 text-sm mb-1">52-Week Range</p>
//                 <p id="week-range" class="text-white font-semibold">--</p>
//             </div>
//             <div>
//                 <p class="text-gray-400 text-sm mb-1">Industry</p>
//                 <p id="industry" class="text-white font-semibold">--</p>
//             </div>
//             <div>
//                 <p class="text-gray-400 text-sm mb-1">Description</p>
//                 <p id="company-description" class="text-gray-300 text-sm leading-relaxed">--</p>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate alternative company profile data template (grid layout)
//  * @returns {string} HTML template string
//  */
// export const getAlternativeProfileDataTemplate = () => {
//     return `
//         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div class="space-y-4">
//                 <div>
//                     <h4 class="text-lg font-medium text-white mb-3">Key Information</h4>
//                     <div class="space-y-3">
//                         <div class="flex justify-between">
//                             <span class="text-gray-400">Market Cap</span>
//                             <span id="market-cap" class="text-white font-medium">--</span>
//                         </div>
//                         <div class="flex justify-between">
//                             <span class="text-gray-400">Shares Outstanding</span>
//                             <span id="shares-outstanding" class="text-white font-medium">--</span>
//                         </div>
//                         <div class="flex justify-between">
//                             <span class="text-gray-400">IPO Date</span>
//                             <span id="ipo-date" class="text-white font-medium">--</span>
//                         </div>
//                         <div class="flex justify-between">
//                             <span class="text-gray-400">Country</span>
//                             <span id="company-country" class="text-white font-medium">--</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
            
//             <div class="space-y-4">
//                 <div>
//                     <h4 class="text-lg font-medium text-white mb-3">Links & Resources</h4>
//                     <div class="space-y-3">
//                         <div id="company-website" class="hidden">
//                             <a id="website-link" href="#" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2">
//                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
//                                 </svg>
//                                 Company Website
//                             </a>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate company profile error template
//  * @returns {string} HTML template string
//  */
// export const getProfileErrorTemplate = () => {
//     return `
//         <div class="text-center py-8">
//             <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                 </svg>
//             </div>
//             <p class="text-gray-400">Unable to load profile data</p>
//         </div>
//     `;
// };

// /**
//  * Generate company profile loading template (alternative version)
//  * @returns {string} HTML template string
//  */
// export const getAlternativeProfileLoadingTemplate = () => {
//     return `
//         <div class="text-center py-8">
//             <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p class="text-gray-400">Loading company information...</p>
//         </div>
//     `;
// };

// /**
//  * Generate complete company profile section template
//  * @returns {string} HTML template string
//  */
// export const getCompanyProfileSectionTemplate = () => {
//     return `
//         <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
//             <h4 class="text-xl font-bold text-white mb-4">Company Profile</h4>
            
//             <!-- Profile Loading State -->
//             <div id="profile-loading" class="hidden">
//                 ${getProfileLoadingTemplate()}
//             </div>
            
//             <!-- Profile Data -->
//             <div id="profile-data" class="hidden">
//                 ${getProfileDataTemplate()}
//             </div>
            
//             <!-- Profile Error State -->
//             <div id="profile-error" class="hidden">
//                 ${getProfileErrorTemplate()}
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate alternative company profile section template (with grid layout)
//  * @returns {string} HTML template string
//  */
// export const getAlternativeCompanyProfileSectionTemplate = () => {
//     return `
//         <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
//             <h3 class="text-xl font-semibold text-white mb-4">Company Profile</h3>
            
//             <div id="company-profile-content">
//                 <div id="profile-loading" class="text-center py-8">
//                     <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                     <p class="text-gray-400">Loading company information...</p>
//                 </div>
                
//                 <div id="profile-data" class="hidden">
//                     ${getAlternativeProfileDataTemplate()}
//                 </div>
                
//                 <div id="profile-error" class="text-center py-8 hidden">
//                     <div class="text-gray-400">
//                         <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                         </svg>
//                         <p>Unable to load company profile</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate chart unavailable error template (specific to charts)
//  * @param {string} message - Error message to display
//  * @returns {string} HTML template string
//  */
// export const getChartUnavailableTemplate = (message = "Chart temporarily unavailable") => {
//     return `
//         <div class="text-center py-12">
//             <div class="text-gray-400">
//                 <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
//                 </svg>
//                 <p class="mb-2">${message}</p>
//                 <p class="text-sm text-gray-500">Using mock data due to API rate limits</p>
//             </div>
//         </div>
//     `;
// };