// file: src/templates/simulation/notification-components.js
// Notification and banner templates for simulation view
// Focused module: Only notification-related display templates (banners, alerts, etc.)

/** TFC Moved
 * Generate the archive prompt banner template - EXTRACTED FROM simulation.js
 * @returns {string} HTML template string
 */
export const getArchivePromptBannerTemplate = () => {
    return `
        <div id="archive-banner" class="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-10 4h4m-4 4h4m6-8v8a2 2 0 01-2 2h-2"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-yellow-400 font-semibold">Simulation Complete - Archive Results?</h4>
                        <p class="text-gray-300 text-sm">Archive this simulation to preserve final rankings and make results downloadable.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button id="archive-now-btn" class="bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                        Archive Now
                    </button>
                    <button id="dismiss-archive-btn" class="text-gray-400 hover:text-white transition-colors p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
};

/** TFC Moved
 * Generate the archive success info banner template
 * @param {string} archiveId - Archive ID for the view archive button
 * @returns {string} HTML template string
 */
export const getArchiveSuccessInfoBannerTemplate = (archiveId) => {
    return `
        <div id="archive-success-banner" class="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-green-400 font-semibold">Simulation Archived Successfully!</h4>
                        <p class="text-gray-300 text-sm">Results are now preserved and available in your simulation history.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button id="view-archive-btn" class="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm" data-archive-id="${archiveId}">
                        View Archive
                    </button>
                    <button id="dismiss-success-btn" class="text-gray-400 hover:text-white transition-colors p-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    </div>
            </div>
        </div>
    `;
};

/** TFC Moved
 * Generate the temporary message template (for notifications) - extracted from showTemporaryMessage method
 * @param {string} message - Message text to display
 * @param {string} type - Message type ('success', 'error', 'info')
 * @returns {string} HTML template string
 */
export const getShowTemporaryMessageTemplate = (message, type = "info") => {
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