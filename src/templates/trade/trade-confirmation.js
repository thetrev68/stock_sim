// // file: src/templates/trade/trade-confirmation.js
// // Trade confirmation and feedback templates for trade view
// // Focused module: Trade confirmation modal and feedback exactly as it exists

// /**
//  * Generate trade confirmation modal template
//  * @returns {string} HTML template string
//  */
// export const getTradeConfirmationModalTemplate = () => {
//     return `
//         <div id="confirmation-modal" class="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 hidden">
//             <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
//                 <h3 class="text-xl font-semibold text-white mb-4">Confirm Trade</h3>
                
//                 <div class="space-y-3 mb-6">
//                     <div class="flex justify-between">
//                         <span class="text-gray-400">Action:</span>
//                         <span id="confirm-action" class="text-white font-semibold"></span>
//                     </div>
//                     <div class="flex justify-between">
//                         <span class="text-gray-400">Symbol:</span>
//                         <span id="confirm-symbol" class="text-white font-semibold"></span>
//                     </div>
//                     <div class="flex justify-between">
//                         <span class="text-gray-400">Quantity:</span>
//                         <span id="confirm-quantity" class="text-white font-semibold"></span>
//                     </div>
//                     <div class="flex justify-between">
//                         <span class="text-gray-400">Price:</span>
//                         <span id="confirm-price" class="text-white font-semibold"></span>
//                     </div>
//                     <div class="flex justify-between border-t border-gray-700 pt-3">
//                         <span class="text-gray-400">Total:</span>
//                         <span id="confirm-total" class="text-white font-bold text-lg"></span>
//                     </div>
//                 </div>
                
//                 <div class="flex gap-3">
//                     <button 
//                         id="cancel-trade" 
//                         class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
//                     >
//                         Cancel
//                     </button>
//                     <button 
//                         id="confirm-trade" 
//                         class="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
//                     >
//                         Confirm Trade
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate trade success feedback template
//  * @returns {string} HTML template string
//  */
// export const getTradeSuccessFeedbackTemplate = () => {
//     return `
//         <div id="feedback-message" class="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
//             <div class="flex items-center gap-3">
//                 <svg class="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
//                 </svg>
//                 <span class="font-semibold">Trade successful!</span>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate trade error feedback template
//  * @returns {string} HTML template string
//  */
// export const getTradeErrorFeedbackTemplate = () => {
//     return `
//         <div id="feedback-message" class="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
//             <div class="flex items-center gap-3">
//                 <svg class="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                 </svg>
//                 <span class="font-semibold">Trade failed. Please try again.</span>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate general feedback message template
//  * @returns {string} HTML template string
//  */
// export const getFeedbackMessageTemplate = () => {
//     return `
//         <div id="feedback-message" class="px-4 py-3 rounded-lg shadow-lg max-w-sm">
//             <div class="flex items-center gap-3">
//                 <svg id="feedback-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                 </svg>
//                 <span id="feedback-text" class="font-semibold"></span>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate processing trade modal template
//  * @returns {string} HTML template string
//  */
// export const getProcessingTradeModalTemplate = () => {
//     return `
//         <div id="processing-modal" class="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 hidden">
//             <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
//                 <div class="text-center">
//                     <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                     <h3 class="text-xl font-semibold text-white mb-2">Processing Trade</h3>
//                     <p class="text-gray-400">Please wait while we execute your trade...</p>
//                 </div>
//             </div>
//         </div>
//     `;
// };