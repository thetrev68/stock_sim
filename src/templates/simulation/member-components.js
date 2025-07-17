// file: src/templates/simulation/member-components.js
// Member display templates for simulation view
// Focused module: Only member-related display templates

// import { 
//     formatCurrencyWithCommas,
//     formatPercentage
// } from "../../utils/currency-utils.js";
import { getTimeAgo } from "../../utils/date-utils.js";
import { getInitial } from "../../utils/string-utils.js";

/** TFC Moved
 * Generate the member card template (individual member display) - EXTRACTED FROM simulation.js
 * @param {Object} member - Member data object
 * @param {Object} currentUser - Current user object with uid property
 * @param {boolean} isCurrentUserCreator - Whether current user is simulation creator
 * @returns {string} HTML template string
 */
export const getMemberCardTemplate = (member, currentUser, isCurrentUserCreator) => {
    const joinedDate = member.joinedAt.toDate ? member.joinedAt.toDate() : new Date(member.joinedAt);
    const timeAgo = getTimeAgo(joinedDate);

    const roleColor = member.role === "creator" ? "text-cyan-400 bg-cyan-400/10" : "text-gray-400 bg-gray-400/10";
    const statusColor = member.status === "active" ? "text-green-400" : "text-red-400";

    return `
        <div class="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-lg">${getInitial(member.displayName)}</span>
                </div>
                <div>
                    <h4 class="text-white font-semibold">${member.displayName}</h4>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="${roleColor} text-xs font-medium px-2 py-1 rounded-full">${member.role}</span>
                        <span class="${statusColor} text-xs font-medium">${member.status}</span>
                    </div>
                    <p class="text-gray-400 text-sm">Joined ${timeAgo}</p>
                </div>
            </div>
            <div class="text-right">
                ${member.userId === currentUser.uid ? `
                    <span class="text-cyan-400 text-sm font-medium">You</span>
                ` : member.role === "creator" ? `
                    <span class="text-yellow-400 text-sm font-medium">Creator</span>
                ` : `
                    <div class="flex items-center gap-2">
                        <span class="text-gray-400 text-sm">Portfolio Value</span>
                        <span class="text-white font-medium">$10,000</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">Last active: Recently</div>
                `}
                ${isCurrentUserCreator && member.userId !== currentUser.uid ? `
                    <button class="kick-member-btn mt-2 text-red-400 hover:text-red-300 text-xs font-medium" data-user-id="${member.userId}" data-user-name="${member.displayName}">
                        Remove
                    </button>
                ` : ""}
            </div>
        </div>
    `;
};

/** TFC Moved
 * Generate the members error state template
 * @returns {string} HTML template string
 */
export const getMembersErrorTemplate = () => {
    return `
        <div class="text-center py-8">
            <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            </div>
            <p class="text-gray-400 mb-4">Failed to load simulation members</p>
            <button onclick="location.reload()" class="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Try Again
            </button>
        </div>
    `;
};
