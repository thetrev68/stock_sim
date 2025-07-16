// file: src/templates/simulation/simulation-modals.js
// Modal dialog templates for simulation management
// Focused module: Only modal-related templates

import { 
    formatCurrencyWithCommas,
    formatGainLoss
} from "../../utils/currency-utils.js";

/**
 * Generate the member management modal template
 * @param {Array} memberStats - Array of member statistics
 * @param {number} activeMemberCount - Count of active members
 * @param {Object} currentUser - Current user object with uid property
 * @returns {string} HTML template string
 */
export const getMemberManagementModalTemplate = (memberStats, activeMemberCount, currentUser) => {
    return `
        <div id="member-management-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl mx-4">
                <div class="flex justify-between items-center p-6 border-b border-gray-700">
                    <div>
                        <h3 class="text-xl font-semibold text-white">Simulation Members</h3>
                        <p class="text-gray-400 text-sm mt-1">Manage participants and view activity</p>
                    </div>
                    <button id="close-management-modal-btn" class="text-gray-400 hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Active Members -->
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-4">Active Members (${activeMemberCount})</h3>
                            <div class="space-y-3">
                                ${memberStats.filter(m => m.status === "active").map(member => `
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
                                                <div class="flex gap-2">
                                                    <button class="kick-member-btn text-red-400 hover:text-red-300 transition-colors" data-user-id="${member.userId}" data-display-name="${member.displayName}">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ` : ""}
                                        </div>
                                        
                                        <div class="mt-3 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span class="text-gray-400">Portfolio Value</span>
                                                <p class="text-white font-medium">${formatCurrencyWithCommas(member.totalValue || 0)}</p>
                                            </div>
                                            <div>
                                                <span class="text-gray-400">Total Trades</span>
                                                <p class="text-white font-medium">${member.totalTrades || 0}</p>
                                            </div>
                                            <div>
                                                <span class="text-gray-400">Gain/Loss</span>
                                                <p class="font-medium ${(member.totalGainLoss || 0) >= 0 ? "text-green-400" : "text-red-400"}">
                                                    ${formatGainLoss(member.totalGainLoss || 0, 0).amount}
                                                </p>
                                            </div>
                                            <div>
                                                <span class="text-gray-400">Joined</span>
                                                <p class="text-white font-medium">${member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>

                        <!-- Removed Members -->
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-4">Removed Members (${memberStats.filter(m => m.status === "removed").length})</h3>
                            <div class="space-y-3">
                                ${memberStats.filter(m => m.status === "removed").length === 0 ? `
                                    <div class="text-center py-8 text-gray-400">
                                        <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                        <p>No removed members</p>
                                    </div>
                                ` : memberStats.filter(m => m.status === "removed").map(member => `
                                    <div class="bg-gray-700 p-4 rounded-lg opacity-75">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                                <span class="text-gray-400 font-bold text-sm">${member.displayName.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <h4 class="text-gray-300 font-medium">${member.displayName}</h4>
                                                <p class="text-gray-500 text-sm">Removed Member</p>
                                            </div>
                                        </div>
                                        
                                        <div class="mt-3 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span class="text-gray-500">Final Portfolio</span>
                                                <p class="text-gray-400 font-medium">${formatCurrencyWithCommas(member.totalValue || 0)}</p>
                                            </div>
                                            <div>
                                                <span class="text-gray-500">Total Trades</span>
                                                <p class="text-gray-400 font-medium">${member.totalTrades || 0}</p>
                                            </div>
                                            <div>
                                                <span class="text-gray-500">Final Gain/Loss</span>
                                                <p class="font-medium ${(member.totalGainLoss || 0) >= 0 ? "text-green-500" : "text-red-500"}">
                                                    ${formatGainLoss(member.totalGainLoss || 0, 0).amount}
                                                </p>
                                            </div>
                                            <div>
                                                <span class="text-gray-500">Removed</span>
                                                <p class="text-gray-400 font-medium">${member.removedAt ? new Date(member.removedAt).toLocaleDateString() : "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 p-6 border-t border-gray-700">
                    <button id="close-management-modal" class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate the simulation settings modal template
 * @param {Object} simulation - Simulation object with settings
 * @param {Object} stats - Simulation statistics
 * @param {boolean} isActive - Whether simulation is currently active
 * @returns {string} HTML template string
 */
export const getSimulationSettingsModalTemplate = (simulation, stats, isActive) => {
    return `
        <div id="simulation-settings-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl mx-4">
                <div class="flex justify-between items-center p-6 border-b border-gray-700">
                    <div>
                        <h3 class="text-xl font-semibold text-white">Simulation Settings</h3>
                        <p class="text-gray-400 text-sm mt-1">Configure simulation parameters</p>
                    </div>
                    <button id="close-settings-modal-btn" class="text-gray-400 hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="p-6">
                    <form id="simulation-settings-form">
                        <div class="space-y-6">
                            <!-- Basic Settings -->
                            <div>
                                <h4 class="text-lg font-medium text-white mb-4">Basic Information</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-300 mb-2">Simulation Name</label>
                                        <input 
                                            type="text" 
                                            id="sim-name-input" 
                                            value="${simulation.name}"
                                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            maxlength="100"
                                        >
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-300 mb-2">Max Participants</label>
                                        <input 
                                            type="number" 
                                            id="max-members-input" 
                                            value="${simulation.maxMembers}"
                                            min="${stats.members.active}"
                                            max="200"
                                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        >
                                        <p class="text-xs text-gray-500 mt-1">Minimum: ${stats.members.active} (current active members)</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea 
                                        id="sim-description-input" 
                                        rows="3"
                                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                        maxlength="500"
                                    >${simulation.description || ""}</textarea>
                                    <p class="text-xs text-gray-500 mt-1">Optional description for participants</p>
                                </div>
                            </div>

                            <!-- Management Actions -->
                            <div>
                                <h4 class="text-lg font-medium text-white mb-4">Simulation Management</h4>
                                ${isActive ? `
                                    <div class="space-y-3">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-300 mb-2">Extend End Date</label>
                                            <input 
                                                type="date" 
                                                id="new-end-date" 
                                                min="${new Date(Date.now() + 24*60*60*1000).toISOString().split("T")[0]}"
                                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            >
                                            <button type="button" id="extend-simulation" class="mt-2 w-full bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                                Extend Simulation
                                            </button>
                                        </div>
                                        
                                        <div class="pt-3 border-t border-gray-600">
                                            <button type="button" id="end-simulation" class="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                                End Simulation Early
                                            </button>
                                            <p class="text-xs text-gray-500 mt-1">This will immediately end the simulation and preserve all results</p>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="text-center py-4 text-gray-400">
                                        <svg class="w-12 h-12 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                                        </svg>
                                        <p>Simulation has ended</p>
                                        ${simulation.endedEarly ? "<p class=\"text-sm text-yellow-400 mt-1\">Ended early by creator</p>" : ""}
                                    </div>
                                `}
                            </div>
                        </div>
                    </form>
                </div>

                <div class="flex justify-end gap-3 p-6 border-t border-gray-700">
                    <button id="close-settings-modal" class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button id="save-simulation-settings" class="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate a reusable modal wrapper template
 * @param {string} id - Modal ID
 * @param {string} title - Modal title
 * @param {string} subtitle - Modal subtitle (optional)
 * @param {string} content - Modal body content
 * @param {string} footer - Modal footer content
 * @param {string} maxWidth - Max width class (default: 'max-w-2xl')
 * @returns {string} HTML template string
 */
export const getModalWrapperTemplate = (id, title, subtitle, content, footer, maxWidth = "max-w-2xl") => {
    return `
        <div id="${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full ${maxWidth} mx-4">
                <div class="flex justify-between items-center p-6 border-b border-gray-700">
                    <div>
                        <h3 class="text-xl font-semibold text-white">${title}</h3>
                        ${subtitle ? `<p class="text-gray-400 text-sm mt-1">${subtitle}</p>` : ""}
                    </div>
                    <button class="modal-close-btn text-gray-400 hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    ${content}
                </div>

                ${footer ? `
                    <div class="flex justify-end gap-3 p-6 border-t border-gray-700">
                        ${footer}
                    </div>
                ` : ""}
            </div>
        </div>
    `;
};