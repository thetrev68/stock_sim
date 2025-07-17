// file: src/templates/simulation/notification-components.js
// Notification and banner templates for simulation view
// Focused module: Only notification-related display templates (banners, alerts, etc.)

/**
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

/**
 * Generate the temporary message template (for notifications)
 * @param {string} message - Message text to display
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

/**
 * Generate a generic notification banner template
 * @param {string} id - Banner ID
 * @param {string} type - Banner type ('success', 'warning', 'error', 'info')
 * @param {string} title - Banner title
 * @param {string} message - Banner message
 * @param {string} actionButtons - HTML for action buttons
 * @returns {string} HTML template string
 */
export const getGenericNotificationBannerTemplate = (id, type, title, message, actionButtons = "") => {
    const typeClasses = {
        success: "bg-green-900/20 border-green-500 text-green-400",
        warning: "bg-yellow-900/20 border-yellow-500 text-yellow-400",
        error: "bg-red-900/20 border-red-500 text-red-400",
        info: "bg-blue-900/20 border-blue-500 text-blue-400"
    };

    const iconPaths = {
        success: "M5 13l4 4L19 7",
        warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
        error: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    };

    return `
        <div id="${id}" class="${typeClasses[type]} border rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-${type === 'warning' ? 'yellow' : type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-${type === 'warning' ? 'yellow' : type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPaths[type]}"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-${type === 'warning' ? 'yellow' : type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-400 font-semibold">${title}</h4>
                        <p class="text-gray-300 text-sm">${message}</p>
                    </div>
                </div>
                ${actionButtons ? `
                    <div class="flex items-center gap-2">
                        ${actionButtons}
                    </div>
                ` : `
                    <button class="dismiss-banner-btn text-gray-400 hover:text-white transition-colors p-2" onclick="this.closest('[id]').remove()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                `}
            </div>
        </div>
    `;
};