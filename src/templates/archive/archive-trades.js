// // templates/archive/archive-trades.js - Trade history templates for simulation archive view

// import { getInitial, toUpperCase } from "../../utils/string-utils.js";

// /**
//  * Generate the complete trade history section template
//  * @returns {string} HTML template string
//  */
// export const getArchiveTradeHistoryTemplate = () => {
//     return `
//         <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
//             <!-- Trade History Header -->
//             <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
//                 <div class="flex items-center justify-between">
//                     <div class="flex items-center gap-3">
//                         <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
//                             <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
//                             </svg>
//                         </div>
//                         <div>
//                             <h3 class="text-xl font-bold text-white">Trade History</h3>
//                             <p class="text-blue-200 text-sm">Complete trading activity</p>
//                         </div>
//                     </div>
//                     <div class="text-right">
//                         <p class="text-blue-200 text-sm">Total Trades</p>
//                         <p id="total-trades-count" class="text-2xl font-bold text-white">0</p>
//                     </div>
//                 </div>
//             </div>

//             <!-- Trade Filters -->
//             <div class="p-4 border-b border-gray-700 bg-gray-750">
//                 <div class="flex flex-wrap gap-4 items-center">
//                     <div class="flex-1 min-w-64">
//                         <label class="block text-sm font-medium text-gray-300 mb-1">Filter by Participant</label>
//                         <select id="trade-participant-filter" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
//                             <option value="">All Participants</option>
//                             <!-- Options will be populated dynamically -->
//                         </select>
//                     </div>
//                     <div class="flex-1 min-w-48">
//                         <label class="block text-sm font-medium text-gray-300 mb-1">Filter by Stock</label>
//                         <select id="trade-stock-filter" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
//                             <option value="">All Stocks</option>
//                             <!-- Options will be populated dynamically -->
//                         </select>
//                     </div>
//                     <div class="flex-1 min-w-48">
//                         <label class="block text-sm font-medium text-gray-300 mb-1">Trade Type</label>
//                         <select id="trade-type-filter" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
//                             <option value="">All Types</option>
//                             <option value="buy">Buy Orders</option>
//                             <option value="sell">Sell Orders</option>
//                         </select>
//                     </div>
//                     <div class="flex items-end">
//                         <button id="clear-trade-filters" class="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-200">
//                             Clear Filters
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <!-- Trade History Loading -->
//             <div id="trades-loading" class="p-8 text-center">
//                 <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                 <p class="text-gray-400">Loading trade history...</p>
//             </div>

//             <!-- Trade History Error -->
//             <div id="trades-error" class="hidden p-8 text-center">
//                 <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                 </svg>
//                 <p class="text-red-400 font-medium">Failed to load trade history</p>
//                 <p class="text-gray-400 text-sm mt-1">Please try refreshing the page</p>
//             </div>

//             <!-- Trade History Table -->
//             <div id="trades-table" class="hidden">
//                 <div class="overflow-x-auto">
//                     <table class="w-full">
//                         <thead class="bg-gray-700 border-b border-gray-600">
//                             <tr>
//                                 <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date/Time</th>
//                                 <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Participant</th>
//                                 <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
//                                 <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
//                                 <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
//                                 <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
//                                 <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Total Value</th>
//                             </tr>
//                         </thead>
//                         <tbody id="trades-rows" class="bg-gray-800 divide-y divide-gray-700">
//                             <!-- Trade rows will be inserted here -->
//                         </tbody>
//                     </table>
//                 </div>

//                 <!-- Pagination -->
//                 <div id="trades-pagination" class="p-4 border-t border-gray-700 bg-gray-750">
//                     <div class="flex items-center justify-between">
//                         <div class="text-sm text-gray-400">
//                             Showing <span id="trades-start">0</span> to <span id="trades-end">0</span> of <span id="trades-total">0</span> trades
//                         </div>
//                         <div class="flex gap-2">
//                             <button id="trades-prev" class="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors duration-200" disabled>
//                                 Previous
//                             </button>
//                             <button id="trades-next" class="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors duration-200" disabled>
//                                 Next
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Empty State -->
//             <div id="trades-empty" class="hidden p-8 text-center">
//                 <svg class="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
//                 </svg>
//                 <p class="text-gray-400 font-medium">No trades found</p>
//                 <p class="text-gray-500 text-sm mt-1">No trading activity recorded for this simulation</p>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate a trade history row template
//  * @param {Object} trade - Trade data
//  * @returns {string} HTML template string
//  */
// export const getTradeRowTemplate = (trade) => {
//     const typeClass = trade.type === "buy" ? "text-green-400 bg-green-900/20" : "text-red-400 bg-red-900/20";
//     const typeIcon = trade.type === "buy" ? "↗" : "↘";
//     const formattedDate = new Date(trade.timestamp).toLocaleDateString();
//     const formattedTime = new Date(trade.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
//     return `
//         <tr class="hover:bg-gray-750 transition-colors duration-200">
//             <td class="px-6 py-4 whitespace-nowrap">
//                 <div class="text-sm text-white">${formattedDate}</div>
//                 <div class="text-sm text-gray-400">${formattedTime}</div>
//             </td>
//             <td class="px-6 py-4 whitespace-nowrap">
//                 <div class="flex items-center">
//                     <div class="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                         ${getInitial(trade.userDisplayName)}
//                     </div>
//                     <div class="ml-3">
//                         <div class="text-sm font-medium text-white">${trade.userDisplayName}</div>
//                     </div>
//                 </div>
//             </td>
//             <td class="px-6 py-4 whitespace-nowrap">
//                 <div class="text-sm font-medium text-white">${trade.ticker}</div>
//                 <div class="text-sm text-gray-400">${trade.companyName || ""}</div>
//             </td>
//             <td class="px-6 py-4 whitespace-nowrap">
//                 <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClass}">
//                     ${typeIcon} ${toUpperCase(trade.type)}
//                 </span>
//             </td>
//             <td class="px-6 py-4 whitespace-nowrap text-right">
//                 <div class="text-sm font-medium text-white">${trade.quantity.toLocaleString()}</div>
//             </td>
//             <td class="px-6 py-4 whitespace-nowrap text-right">
//                 <div class="text-sm font-medium text-white">${trade.price.toFixed(2)}</div>
//             </td>
//             <td class="px-6 py-4 whitespace-nowrap text-right">
//                 <div class="text-sm font-medium text-white">${(trade.quantity * trade.price).toLocaleString()}</div>
//             </td>
//         </tr>
//     `;
// };

// /**
//  * Generate trade filter options for participants
//  * @param {Array} participants - Array of participant objects
//  * @returns {string} HTML options string
//  */
// export const getParticipantFilterOptions = (participants) => {
//     return participants.map(participant => 
//         `<option value="${participant.userId}">${participant.displayName}</option>`
//     ).join("");
// };

// /**
//  * Generate trade filter options for stocks
//  * @param {Array} stocks - Array of unique stock tickers
//  * @returns {string} HTML options string
//  */
// export const getStockFilterOptions = (stocks) => {
//     return stocks.map(stock => 
//         `<option value="${stock}">${stock}</option>`
//     ).join("");
// };