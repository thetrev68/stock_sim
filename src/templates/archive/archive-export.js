// templates/archive/archive-export.js - Export and modal templates for simulation archive view

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