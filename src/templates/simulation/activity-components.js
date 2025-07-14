// file: src/templates/simulation/activity-components.js
// Activity feed templates for simulation view
// Focused module: Only activity-related display templates

/**
 * Generate the activity element template (individual activity item)
 * @param {Object} formattedActivity - Pre-formatted activity data from activityService
 * @returns {string} HTML template string
 */
export const getActivityElementTemplate = (formattedActivity) => {
    return `
        <div class="w-10 h-10 ${formattedActivity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-lg">${formattedActivity.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-white font-medium">${formattedActivity.title}</p>
            <p class="text-gray-400 text-sm mt-1">${formattedActivity.description}</p>
            <p class="text-gray-500 text-xs mt-2">${formattedActivity.timeAgo}</p>
        </div>
    `;
};

/**
 * Generate the empty activity feed template
 * @returns {string} HTML template string
 */
export const getEmptyActivityFeedTemplate = () => {
    return `
        <div class="text-center py-6 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <p>No recent activity</p>
        </div>
    `;
};

/**
 * Generate the activity feed loading template
 * @returns {string} HTML template string
 */
export const getActivityLoadingTemplate = () => {
    return `
        <div class="text-center py-6 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <p>Activity feed loading...</p>
        </div>
    `;
};

/**
 * Generate the activity feed error template
 * @returns {string} HTML template string
 */
export const getActivityErrorTemplate = () => {
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

/**
 * Generate the activity feed section header template
 * @returns {string} HTML template string
 */
export const getActivityFeedHeaderTemplate = () => {
    return `
        <h4 class="text-lg font-semibold text-white mb-4">Recent Activity</h4>
    `;
};

/**
 * Generate the complete activity feed container template
 * @param {Array} activities - Array of activity objects
 * @param {Object} activityService - Activity service instance for formatting
 * @returns {string} HTML template string
 */
export const getActivityFeedContainerTemplate = (activities, activityService) => {
    if (!activities || activities.length === 0) {
        return getEmptyActivityFeedTemplate();
    }

    const activityItems = activities.map(activity => {
        const formattedActivity = activityService.formatActivity(activity);
        return `
            <div class="bg-gray-700 p-4 rounded-lg flex items-start gap-3">
                ${getActivityElementTemplate(formattedActivity)}
            </div>
        `;
    }).join('');

    return `
        <div class="space-y-3">
            ${activityItems}
        </div>
    `;
};

/**
 * Generate the activity feed wrapper with header
 * @param {Array} activities - Array of activity objects  
 * @param {Object} activityService - Activity service instance for formatting
 * @returns {string} HTML template string
 */
export const getActivityFeedWrapperTemplate = (activities, activityService) => {
    return `
        <div class="mt-8">
            ${getActivityFeedHeaderTemplate()}
            <div id="activity-feed" class="space-y-3">
                ${getActivityFeedContainerTemplate(activities, activityService)}
            </div>
        </div>
    `;
};

/**
 * Generate activity feed refresh button template
 * @returns {string} HTML template string
 */
export const getActivityRefreshButtonTemplate = () => {
    return `
        <button id="refresh-activity-btn" class="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
        </button>
    `;
};

/**
 * Generate activity type filter template
 * @param {Array} availableTypes - Array of activity types to filter by
 * @returns {string} HTML template string
 */
export const getActivityFilterTemplate = (availableTypes = ['all', 'trades', 'joins', 'achievements']) => {
    const filterOptions = availableTypes.map(type => {
        const displayName = type === 'all' ? 'All Activities' : 
                           type === 'trades' ? 'Trades' :
                           type === 'joins' ? 'New Members' :
                           type === 'achievements' ? 'Achievements' : type;
        
        return `
            <option value="${type}">${displayName}</option>
        `;
    }).join('');

    return `
        <div class="flex items-center gap-2 mb-4">
            <label for="activity-filter" class="text-gray-400 text-sm">Filter:</label>
            <select id="activity-filter" class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                ${filterOptions}
            </select>
        </div>
    `;
};