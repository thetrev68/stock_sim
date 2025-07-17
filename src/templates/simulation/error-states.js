// file: src/templates/simulation/error-states.js
// Error state templates for simulation view
// Focused module: Only error handling templates

/**
 * Generate the simulation not found error template
 * @returns {string} HTML template string
 */
export const getSimulationNotFoundTemplate = () => {
    return `
        <div id="simulation-not-found" class="hidden bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 class="text-xl font-semibold text-red-400 mb-2">Simulation Not Found</h2>
            <p class="text-gray-300 mb-4">The simulation you're looking for doesn't exist or you don't have access to it.</p>
            <button 
                data-navigate="/" 
                class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
                Return to Dashboard
            </button>
        </div>
    `;
};

/** TFC Moved
 * Generate the simulation loading error template (overwrites existing)
 * @returns {string} HTML template string
 */
export const getSimulationLoadingErrorTemplate = () => {
    return `
        <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 class="text-xl font-semibold text-red-400 mb-2">Error Loading Simulation</h2>
            <p class="text-gray-300 mb-4">There was a problem loading the simulation data.</p>
            <button 
                onclick="location.reload()" 
                class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
                Retry
            </button>
        </div>
    `;
};

/** TFC Moved
 * Generate the members loading error template (overwrites existing)
 * @returns {string} HTML template string
 */
export const getMembersErrorTemplate = () => {
    return `
        <div class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h4 class="text-lg font-semibold text-red-400 mb-2">Error Loading Members</h4>
            <p class="text-gray-400">Unable to load member information</p>
        </div>
    `;
};

/** TFC Moved
 * Generate the activities error template (overwrites existing)
 * @returns {string} HTML template string
 */
export const getActivitiesErrorTemplate = () => {
    return `
        <div class="text-center py-6">
            <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h4 class="text-lg font-semibold text-red-400 mb-2">Error Loading Activities</h4>
            <p class="text-gray-400">Unable to load recent activity</p>
        </div>
    `;
};

/** TFC Moved
 * Generate the portfolio error template (overwrites existing) 
 * @returns {string} HTML template string
 */
export const getPortfolioErrorTemplate = () => {
    return `
        <div class="text-center py-8">
            <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h4 class="text-lg font-semibold text-red-400 mb-2">Error Loading Portfolio</h4>
            <p class="text-gray-400">Unable to load portfolio data</p>
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
 * Generate a generic error template with custom message
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {string} buttonText - Button text (default: 'Retry')
 * @param {string} buttonAction - Button action (default: 'location.reload()')
 * @returns {string} HTML template string
 */
export const getGenericErrorTemplate = (
    title = "Error", 
    message = "Something went wrong", 
    buttonText = "Retry",
    buttonAction = "location.reload()"
) => {
    return `
        <div class="text-center py-8">
            <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h4 class="text-lg font-semibold text-red-400 mb-2">${title}</h4>
            <p class="text-gray-400 mb-4">${message}</p>
            <button 
                onclick="${buttonAction}" 
                class="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
                ${buttonText}
            </button>
        </div>
    `;
};

/**
 * Generate a network error template
 * @returns {string} HTML template string
 */
export const getNetworkErrorTemplate = () => {
    return getGenericErrorTemplate(
        "Connection Error",
        "Please check your internet connection and try again.",
        "Retry",
        "location.reload()"
    );
};

/**
 * Generate a permission denied error template
 * @returns {string} HTML template string
 */
export const getPermissionDeniedTemplate = () => {
    return getGenericErrorTemplate(
        "Access Denied",
        "You do not have permission to view this content.",
        "Return to Dashboard",
        "window.location.href = \"/dashboard\""
    );
};

/**
 * Generate a timeout error template
 * @returns {string} HTML template string
 */
export const getTimeoutErrorTemplate = () => {
    return getGenericErrorTemplate(
        "Request Timeout",
        "The request took too long to complete. Please try again.",
        "Try Again",
        "location.reload()"
    );
};

/**
 * Generate loading error template for specific sections
 * @param {string} sectionName - Name of the section that failed to load
 * @returns {string} HTML template string
 */
export const getSectionLoadingErrorTemplate = (sectionName = "content") => {
    return `
        <div class="text-center py-6">
            <svg class="w-8 h-8 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-red-400 font-medium mb-1">Failed to load ${sectionName}</p>
            <p class="text-gray-400 text-sm">Please refresh the page to try again</p>
        </div>
    `;
};