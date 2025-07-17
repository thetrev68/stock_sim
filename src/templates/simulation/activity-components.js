// file: src/templates/simulation/activity-components.js
// Activity feed templates for simulation view
// Focused module: Only activity-related display templates

/** TFC Moved
 * Generate the activity element template (individual activity item) - EXTRACTED FROM simulation.js
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

/** TFC Moved
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