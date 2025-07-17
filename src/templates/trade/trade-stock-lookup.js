// // file: src/templates/trade/trade-stock-lookup.js
// // Stock lookup and quote display templates for trade view
// // Focused module: Stock search and quote display exactly as it exists

// /**
//  * Generate stock quote display template
//  * @returns {string} HTML template string
//  */
// export const getStockQuoteDisplayTemplate = () => {
//     return `
//         <div id="stock-quote-display" class="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
//             <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
//                 <div>
//                     <h3 id="quote-symbol" class="text-2xl font-bold text-white"></h3>
//                     <p id="quote-company" class="text-gray-400"></p>
//                 </div>
//                 <div class="text-right mt-2 lg:mt-0">
//                     <p id="quote-price" class="text-3xl font-bold text-white">$0.00</p>
//                     <p id="quote-change" class="font-semibold">
//                         +$0.00 (+0.00%)
//                     </p>
//                 </div>
//             </div>
            
//             <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
//                 <div>
//                     <p class="text-gray-400">Previous Close</p>
//                     <p id="quote-prev-close" class="text-white font-semibold">$0.00</p>
//                 </div>
//                 <div>
//                     <p class="text-gray-400">Market Cap</p>
//                     <p id="quote-market-cap" class="text-white font-semibold">N/A</p>
//                 </div>
//                 <div>
//                     <p class="text-gray-400">P/E Ratio</p>
//                     <p id="quote-pe-ratio" class="text-white font-semibold">N/A</p>
//                 </div>
//                 <div>
//                     <p class="text-gray-400">Volume</p>
//                     <p id="quote-volume" class="text-white font-semibold">0</p>
//                 </div>
//                 <div>
//                     <p class="text-gray-400">52W High</p>
//                     <p id="quote-52w-high" class="text-white font-semibold">$0.00</p>
//                 </div>
//                 <div>
//                     <p class="text-gray-400">52W Low</p>
//                     <p id="quote-52w-low" class="text-white font-semibold">$0.00</p>
//                 </div>
//                 <div>
//                     <p class="text-gray-400">Avg Volume</p>
//                     <p id="quote-avg-volume" class="text-white font-semibold">0</p>
//                 </div>
//                 <div>
//                     <p class="text-gray-400">Status</p>
//                     <div class="flex items-center gap-2">
//                         <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                         <span class="text-green-400 text-xs">Live</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate stock lookup input template
//  * @returns {string} HTML template string
//  */
// export const getStockLookupInputTemplate = () => {
//     return `
//         <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
//             <h3 class="text-lg font-semibold text-white mb-4">Stock Research</h3>
//             <div class="flex gap-3">
//                 <input 
//                     type="text" 
//                     id="stock-lookup" 
//                     class="flex-1 bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500" 
//                     placeholder="Enter ticker symbol (e.g., AAPL)"
//                     maxlength="6"
//                 >
//                 <button 
//                     id="lookup-btn" 
//                     class="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
//                 >
//                     Lookup
//                 </button>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate stock quote loading template
//  * @returns {string} HTML template string
//  */
// export const getStockQuoteLoadingTemplate = () => {
//     return `
//         <div id="stock-quote-display" class="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
//             <div class="animate-pulse">
//                 <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
//                     <div>
//                         <div class="h-8 bg-gray-700 rounded w-24 mb-2"></div>
//                         <div class="h-4 bg-gray-700 rounded w-32"></div>
//                     </div>
//                     <div class="text-right mt-2 lg:mt-0">
//                         <div class="h-10 bg-gray-700 rounded w-32 mb-2"></div>
//                         <div class="h-6 bg-gray-700 rounded w-24"></div>
//                     </div>
//                 </div>
                
//                 <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                     <div>
//                         <div class="h-4 bg-gray-700 rounded w-20 mb-1"></div>
//                         <div class="h-5 bg-gray-700 rounded w-16"></div>
//                     </div>
//                     <div>
//                         <div class="h-4 bg-gray-700 rounded w-20 mb-1"></div>
//                         <div class="h-5 bg-gray-700 rounded w-16"></div>
//                     </div>
//                     <div>
//                         <div class="h-4 bg-gray-700 rounded w-20 mb-1"></div>
//                         <div class="h-5 bg-gray-700 rounded w-16"></div>
//                     </div>
//                     <div>
//                         <div class="h-4 bg-gray-700 rounded w-20 mb-1"></div>
//                         <div class="h-5 bg-gray-700 rounded w-16"></div>
//                     </div>
//                     <div>
//                         <div class="h-4 bg-gray-700 rounded w-20 mb-1"></div>
//                         <div class="h-5 bg-gray-700 rounded w-16"></div>
//                     </div>
//                     <div>
//                         <div class="h-4 bg-gray-700 rounded w-20 mb-1"></div>
//                         <div class="h-5 bg-gray-700 rounded w-16"></div>
//                     </div>
//                     <div>
//                         <div class="h-4 bg-gray-700 rounded w-20 mb-1"></div>
//                         <div class="h-5 bg-gray-700 rounded w-16"></div>
//                     </div>
//                     <div>
//                         <div class="h-4 bg-gray-700 rounded w-20 mb-1"></div>
//                         <div class="h-5 bg-gray-700 rounded w-16"></div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate stock quote error template
//  * @returns {string} HTML template string
//  */
// export const getStockQuoteErrorTemplate = () => {
//     return `
//         <div id="stock-quote-display" class="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
//             <div class="text-center py-8">
//                 <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                     </svg>
//                 </div>
//                 <h3 class="text-lg font-semibold text-red-400 mb-2">Stock Not Found</h3>
//                 <p class="text-gray-400">Please check the ticker symbol and try again.</p>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate empty stock quote placeholder template
//  * @returns {string} HTML template string
//  */
// export const getEmptyStockQuotePlaceholderTemplate = () => {
//     return `
//         <div id="stock-quote-display" class="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
//             <div class="text-center py-12">
//                 <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
//                     </svg>
//                 </div>
//                 <h3 class="text-xl font-semibold text-gray-300 mb-2">Stock Information</h3>
//                 <p class="text-gray-400 mb-6">Enter a ticker symbol above to view real-time stock data</p>
//                 <div class="text-sm text-gray-500">
//                     <p>Available data includes:</p>
//                     <p>Price, volume, market cap, and more</p>
//                 </div>
//             </div>
//         </div>
//     `;
// };