// templates/archive/archive-export.js - Export and modal templates for simulation archive view

// /**
//  * Generate export confirmation modal template
//  * @returns {string} HTML template string
//  */
// export const getExportConfirmationModalTemplate = () => {
//     return `
//         <div id="export-modal" class="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 hidden">
//             <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
//                 <div class="flex items-center gap-3 mb-4">
//                     <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
//                         <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                         </svg>
//                     </div>
//                     <h3 class="text-xl font-bold text-white">Export Archive Results</h3>
//                 </div>
                
//                 <p class="text-gray-300 mb-6">
//                     Choose what data to include in your export file. The results will be downloaded as a CSV file.
//                 </p>
                
//                 <div class="space-y-3 mb-6">
//                     <label class="flex items-center gap-3">
//                         <input type="checkbox" id="export-leaderboard" checked class="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500">
//                         <span class="text-white">Final Rankings & Performance</span>
//                     </label>
//                     <label class="flex items-center gap-3">
//                         <input type="checkbox" id="export-trades" checked class="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500">
//                         <span class="text-white">Complete Trade History</span>
//                     </label>
//                     <label class="flex items-center gap-3">
//                         <input type="checkbox" id="export-holdings" checked class="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500">
//                         <span class="text-white">Final Portfolio Holdings</span>
//                     </label>
//                     <label class="flex items-center gap-3">
//                         <input type="checkbox" id="export-summary" checked class="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500">
//                         <span class="text-white">Simulation Summary</span>
//                     </label>
//                 </div>
                
//                 <div class="flex gap-3">
//                     <button id="confirm-export" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
//                         Export Data
//                     </button>
//                     <button id="cancel-export" class="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
//                         Cancel
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate export progress modal template
//  * @returns {string} HTML template string
//  */
// export const getExportProgressModalTemplate = () => {
//     return `
//         <div id="export-progress-modal" class="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 hidden">
//             <div class="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 border border-gray-700">
//                 <div class="text-center">
//                     <div class="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
//                         <svg class="w-8 h-8 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a8 8 0 110 15.292V15.5a5.5 5.5 0 000-7.043z"></path>
//                         </svg>
//                     </div>
//                     <h3 class="text-lg font-bold text-white mb-2">Preparing Export</h3>
//                     <p class="text-gray-300 mb-4">Please wait while we generate your archive data...</p>
                    
//                     <div class="w-full bg-gray-700 rounded-full h-2">
//                         <div id="export-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
//                     </div>
//                     <p id="export-progress-text" class="text-sm text-gray-400 mt-2">Initializing...</p>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate export success notification template
//  * @param {string} fileName - Name of the exported file
//  * @returns {string} HTML template string
//  */
// export const getExportSuccessTemplate = (fileName) => {
//     return `
//         <div id="export-success" class="fixed top-4 right-4 bg-green-900/20 border border-green-500 rounded-lg p-4 max-w-sm z-50">
//             <div class="flex items-center gap-3">
//                 <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
//                     <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                 </div>
//                 <div class="flex-1">
//                     <h4 class="text-green-400 font-semibold">Export Complete!</h4>
//                     <p class="text-gray-300 text-sm">${fileName} has been downloaded</p>
//                 </div>
//                 <button id="dismiss-export-success" class="text-gray-400 hover:text-white transition-colors">
//                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
//                     </svg>
//                 </button>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate export error notification template
//  * @param {string} errorMessage - Error message to display
//  * @returns {string} HTML template string
//  */
// export const getExportErrorTemplate = (errorMessage = "Failed to export data") => {
//     return `
//         <div id="export-error" class="fixed top-4 right-4 bg-red-900/20 border border-red-500 rounded-lg p-4 max-w-sm z-50">
//             <div class="flex items-center gap-3">
//                 <div class="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
//                     <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                     </svg>
//                 </div>
//                 <div class="flex-1">
//                     <h4 class="text-red-400 font-semibold">Export Failed</h4>
//                     <p class="text-gray-300 text-sm">${errorMessage}</p>
//                 </div>
//                 <button id="dismiss-export-error" class="text-gray-400 hover:text-white transition-colors">
//                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
//                     </svg>
//                 </button>
//             </div>
//         </div>
//     `;
// };

// /**
//  * Generate archive action buttons template
//  * @returns {string} HTML template string
//  */
// export const getArchiveActionButtonsTemplate = () => {
//     return `
//         <div class="flex gap-3">
//             <button id="export-archive-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
//                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                 </svg>
//                 Export Results
//             </button>
//             <button 
//                 data-navigate="/" 
//                 class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
//             >
//                 Back to Dashboard
//             </button>
//         </div>
//     `;
// };

// /**
//  * Generate archive statistics template
//  * @param {Object} stats - Archive statistics data
//  * @returns {string} HTML template string
//  */
// export const getArchiveStatsTemplate = (stats = {}) => {
//     return `
//         <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div class="bg-gray-700 p-3 rounded-lg">
//                 <p class="text-sm text-gray-400">Duration</p>
//                 <p id="archive-duration" class="text-lg font-semibold text-white">${stats.duration || "0 days"}</p>
//             </div>
//             <div class="bg-gray-700 p-3 rounded-lg">
//                 <p class="text-sm text-gray-400">Participants</p>
//                 <p id="archive-participants" class="text-lg font-semibold text-white">${stats.participants || "0"}</p>
//             </div>
//             <div class="bg-gray-700 p-3 rounded-lg">
//                 <p class="text-sm text-gray-400">Total Trades</p>
//                 <p id="archive-trades" class="text-lg font-semibold text-white">${stats.totalTrades || "0"}</p>
//             </div>
//             <div class="bg-gray-700 p-3 rounded-lg">
//                 <p class="text-sm text-gray-400">Total Volume</p>
//                 <p id="archive-volume" class="text-lg font-semibold text-white">${stats.totalVolume || "$0"}</p>
//             </div>
//         </div>
//     `;
// };

/** TFC Move
 * Generate temporary message notification template (ADD THIS TO EXISTING archive-export.js)
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success', 'error', 'info')
 * @returns {string} HTML template string
 */
export const getTemporaryMessageTemplate = (message, type = "info") => {
    const colorClasses = {
        success: "bg-green-900/20 border-green-500 text-green-400",
        error: "bg-red-900/20 border-red-500 text-red-400",
        info: "bg-blue-900/20 border-blue-500 text-blue-400"
    };

    return `
        <div id="temp-message" class="fixed top-4 right-4 ${colorClasses[type]} border rounded-lg p-4 z-50 max-w-sm">
            <div class="flex items-center gap-3">
                <div class="flex-1">
                    <p class="font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-current opacity-70 hover:opacity-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
};

/** TFC Move
 * Generate export button loading state template (ADD THIS TO EXISTING archive-export.js)
 * @returns {string} HTML template string
 */
export const getExportButtonLoadingTemplate = () => {
    return `
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Exporting...
    `;
};

/** TFC Move
 * Generate export button default state template (ADD THIS TO EXISTING archive-export.js)
 * @returns {string} HTML template string
 */
export const getExportButtonDefaultTemplate = () => {
    return `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Export Results
    `;
};