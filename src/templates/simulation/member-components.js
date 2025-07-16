// file: src/templates/simulation/member-components.js
// Member display templates for simulation view
// Focused module: Only member-related display templates

import { 
    formatCurrencyWithCommas,
    formatCashPercentage,
    formatPortfolioChange,
    calculateGainLoss,
    formatPrice,
    formatNumberWithCommas,
    formatGainLoss,
    calculateMarketValue,
    calculateCostBasis,
    getTradeTypeColorClass
} from '../utils/currency-utils.js';

/**
 * Generate the member card template (individual member display)
 * @param {Object} member - Member data object
 * @param {Object} currentUser - Current user object with uid property
 * @param {boolean} isCurrentUserCreator - Whether current user is simulation creator
 * @returns {string} HTML template string
 */
export const getMemberCardTemplate = (member, currentUser, isCurrentUserCreator) => {
    const joinedDate = member.joinedAt.toDate ? member.joinedAt.toDate() : new Date(member.joinedAt);
    const timeAgo = getTimeAgo(joinedDate);

    const roleColor = member.role === 'creator' ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-400 bg-gray-400/10';
    const statusColor = member.status === 'active' ? 'text-green-400' : 'text-red-400';

    return `
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-lg">${member.displayName.charAt(0).toUpperCase()}</span>
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
            ` : member.role === 'creator' ? `
                <span class="text-yellow-400 text-sm font-medium">Creator</span>
            ` : `
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 text-sm">Portfolio Value</span>
                    <span class="text-white font-medium">$10,000</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">Last active: Recently</div>
            `}
            ${isCurrentUserCreator && member.userId !== currentUser.uid ? `
                <button class="kick-member-btn mt-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium py-1 px-2 rounded transition-colors duration-200" data-user-id="${member.userId}" data-display-name="${member.displayName}">
                    Remove
                </button>
            ` : ''}
        </div>
    `;
};

/**
 * Generate the modal member list item template (for member management modal)
 * @param {Object} member - Member data object
 * @param {Object} currentUser - Current user object with uid property
 * @returns {string} HTML template string
 */
export const getModalMemberListTemplate = (member, currentUser) => {
    return `
        <div class="bg-gray-700 p-4 rounded-lg">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">${member.displayName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h4 class="text-white font-medium">${member.displayName}</h4>
                        <p class="text-gray-400 text-sm">${member.role}</p>
                    </div>
                </div>
                ${member.userId !== currentUser.uid ? `
                    <button class="kick-member-btn bg-red-600 hover:bg-red-500 text-white text-xs font-medium py-1 px-3 rounded transition-colors duration-200" data-user-id="${member.userId}" data-display-name="${member.displayName}">
                        Remove
                    </button>
                ` : `
                    <span class="text-cyan-400 text-xs font-medium">You</span>
                `}
            </div>
            <div class="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-gray-400">Portfolio Value:</span>
                    <p class="text-white font-medium">${formatCurrencyWithCommas(member.portfolioValue || 10000)}</p>
                </div>
                <div>
                    <span class="text-gray-400">Total Trades:</span>
                    <p class="text-white font-medium">${member.totalTrades || 0}</p>
                </div>
                <div>
                    <span class="text-gray-400">P&L:</span>
                    <p class="${(member.totalGainLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'} font-medium">
                        ${formatPercentage((member.totalGainLoss || 0) * 100)}
                    </p>
                </div>
                <div>
                    <span class="text-gray-400">Rank:</span>
                    <p class="text-white font-medium">#${member.rank || '-'}</p>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate the members loading state template
 * @returns {string} HTML template string
 */
export const getMembersLoadingTemplate = () => {
    return `
        <div class="text-center py-8">
            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-400">Loading members...</p>
        </div>
    `;
};

/**
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

/**
 * Generate the empty members state template
 * @returns {string} HTML template string
 */
export const getEmptyMembersTemplate = () => {
    return `
        <div class="text-center py-8">
            <div class="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
            </div>
            <p class="text-gray-400 mb-2">No members yet</p>
            <p class="text-gray-500 text-sm">Invite participants to get started</p>
        </div>
    `;
};

/**
 * Helper function to format time ago (extracted from original code)
 * @param {Date} date - Date to format
 * @returns {string} Formatted time string
 */
const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
};