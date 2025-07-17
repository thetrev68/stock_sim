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
