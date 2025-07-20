// file: src/templates/simulation/simulation-modals.js
// Modal dialog templates for simulation management
// Focused module: Only modal-related templates

// import { 
//     formatCurrencyWithCommas,
//     formatGainLoss
// } from "../../utils/currency-utils.js";
// import { getInitial } from "../../utils/string-utils.js";

/** TFC Moved
 * Generate the member management modal template
 * @param {Array} memberStats - Array of member statistics
 * @param {number} activeMemberCount - Count of active members
 * @param {number} removedMemberCount - Count of removed members
 * @param {Object} currentUser - Current user object with uid property
 * @returns {string} HTML template string
 */
export const getMemberManagementModalTemplate = (memberStats, activeMemberCount, removedMemberCount, currentUser) => {
    return `
        <div id="member-management-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
                <div class="flex justify-between items-center p-6 border-b border-gray-700">
                    <div>
                        <h2 class="text-2xl font-bold text-white">Member Management</h2>
                        <p class="text-gray-400 mt-1">${activeMemberCount} active • ${removedMemberCount} removed</p>
                    </div>
                    <button id="close-management-modal" class="text-gray-400 hover:text-white transition-colors">
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
                                                <button class="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 rounded border border-red-500 hover:bg-red-500/10 transition" onclick="window.app.router.currentView.handleKickMember('${member.userId}', '${member.displayName}')">
                                                    Remove
                                                </button>
                                            ` : "<span class=\"text-cyan-400 text-xs font-medium\">You</span>"}
                                        </div>
                                        <div class="grid grid-cols-3 gap-2 mt-3 text-xs">
                                            <div>
                                                <span class="text-gray-500">Portfolio</span>
                                                <p class="text-white font-medium">${member.portfolioValue ? `$${member.portfolioValue.toLocaleString()}` : "$10,000"}</p>
                                            </div>
                                            <div>
                                                <span class="text-gray-500">Trades</span>
                                                <p class="text-white font-medium">${member.totalTrades || 0}</p>
                                            </div>
                                            <div>
                                                <span class="text-gray-500">Holdings</span>
                                                <p class="text-white font-medium">${member.holdingsCount || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>

                        <!-- Removed Members -->
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-4">Removed Members (${removedMemberCount})</h3>
                            ${removedMemberCount > 0 ? `
                                <div class="space-y-3">
                                    ${memberStats.filter(m => m.status === "removed").map(member => `
                                        <div class="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                                    <span class="text-gray-400 font-bold text-sm">${member.displayName.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <h4 class="text-gray-300 font-medium">${member.displayName}</h4>
                                                    <p class="text-gray-500 text-sm">Removed ${member.removedAt ? new Date(member.removedAt.toDate()).toLocaleDateString() : "recently"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join("")}
                                </div>
                            ` : `
                                <div class="text-center py-8 text-gray-500">
                                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                    </svg>
                                    <p>No removed members</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <div class="p-6 border-t border-gray-700">
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-400">
                            <p>💡 Removed members preserve their trading history but can't rejoin</p>
                        </div>
                        <button id="close-management-modal-btn" class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate the simulation settings modal template
 * @param {Object} stats - Simulation management statistics
 * @returns {string} HTML template string
 */
export const getSimulationSettingsModalTemplate = (stats) => {
    // Safety check - ensure we have required data
    if (!stats || !stats.simulation) {
        console.error("Invalid stats object passed to modal template:", stats);
        return `
            <div id="simulation-settings-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 p-6">
                    <h2 class="text-xl font-bold text-white mb-4">Error</h2>
                    <p class="text-gray-400 mb-4">Unable to load simulation settings. Missing simulation data.</p>
                    <button onclick="this.parentElement.parentElement.remove()" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded">
                        Close
                    </button>
                </div>
            </div>
        `;
    }
    
    const simulation = stats.simulation;
    const canModifyRules = simulation.status === "pending";
    const isEnded = simulation.status === "ended";

    return `
        <div id="simulation-settings-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-700">
                <div class="flex justify-between items-center p-6 border-b border-gray-700">
                    <div>
                        <h2 class="text-2xl font-bold text-white">Simulation Settings</h2>
                        <p class="text-gray-400 mt-1">${simulation.name}</p>
                    </div>
                    <button id="close-settings-modal" class="text-gray-400 hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="overflow-y-auto max-h-[calc(95vh-200px)]">
                    <!-- Statistics Overview -->
                    <div class="p-6 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white mb-4">Simulation Overview</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-gray-700 p-3 rounded-lg">
                                <p class="text-sm text-gray-400">Status</p>
                                <p class="text-lg font-semibold text-white capitalize">${simulation.status}</p>
                            </div>
                            <div class="bg-gray-700 p-3 rounded-lg">
                                <p class="text-sm text-gray-400">Active Members</p>
                                <p class="text-lg font-semibold text-white">${stats.members.active}/${simulation.maxMembers}</p>
                            </div>
                            <div class="bg-gray-700 p-3 rounded-lg">
                                <p class="text-sm text-gray-400">Total Trades</p>
                                <p class="text-lg font-semibold text-white">${stats.activity.totalTrades}</p>
                            </div>
                            <div class="bg-gray-700 p-3 rounded-lg">
                                <p class="text-sm text-gray-400">Days Remaining</p>
                                <p class="text-lg font-semibold text-white">${stats.timeline.daysRemaining}</p>
                            </div>
                        </div>
                        
                        <!-- Progress Bar -->
                        <div class="mt-4">
                            <div class="flex justify-between text-sm text-gray-400 mb-2">
                                <span>Progress</span>
                                <span>${stats.timeline.progressPercent}% complete</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-cyan-400 h-2 rounded-full transition-all duration-300" style="width: ${Math.min(stats.timeline.progressPercent, 100)}%"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Basic Settings -->
                    <div class="p-6 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white mb-4">Basic Settings</h3>
                        <form id="settings-form" class="space-y-4">
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
                            </div>

                            <div class="flex gap-3">
                                <button type="button" id="save-basic-settings" class="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                    Save Changes
                                </button>
                                <button type="button" id="reset-basic-settings" class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Timeline Management -->
                    <div class="p-6 border-b border-gray-700">
                        <h3 class="text-lg font-semibold text-white mb-4">Timeline Management</h3>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Current Timeline -->
                            <div>
                                <h4 class="text-white font-medium mb-3">Current Timeline</h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Start Date:</span>
                                        <span class="text-white">${new Date(simulation.startDate.toDate()).toLocaleDateString()}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">End Date:</span>
                                        <span class="text-white">${new Date(simulation.endDate.toDate()).toLocaleDateString()}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Duration:</span>
                                        <span class="text-white">${stats.timeline.totalDuration} days</span>
                                    </div>
                                    ${stats.timeline.wasExtended ? `
                                        <div class="flex justify-between">
                                            <span class="text-gray-400">Original End:</span>
                                            <span class="text-yellow-400">${new Date(simulation.originalEndDate.toDate()).toLocaleDateString()}</span>
                                        </div>
                                    ` : ""}
                                </div>
                            </div>

                            <!-- Timeline Actions -->
                            <div>
                                <h4 class="text-white font-medium mb-3">Timeline Actions</h4>
                                ${!isEnded ? `
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
                                        ${simulation.endedEarly ? "<p class=\"text-sm\">Ended early by admin</p>" : ""}
                                    </div>
                                `}
                            </div>
                        </div>
                        <!-- Export & Archive -->
                        <div class="mt-6 pt-4 border-t border-gray-600">
                            <h4 class="text-white font-medium mb-3">Export & Archive</h4>
                            ${isEnded ? `
                                <div class="space-y-3">
                                    <button type="button" id="export-results" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        Download Results (JSON)
                                    </button>
                                    ${!simulation.archived ? `
                                        <button type="button" id="archive-simulation" class="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-10 4h4m-4 4h4m6-8v8a2 2 0 01-2 2h-2"></path>
                                            </svg>
                                            Archive Simulation
                                        </button>
                                    ` : `
                                        <div class="text-center py-2 text-green-400 text-sm">
                                            ✓ Simulation already archived
                                        </div>
                                    `}
                                </div>
                            ` : `
                                <div class="text-center py-4 text-gray-400">
                                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                    <p class="text-sm">Export options available after simulation ends</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Trading Rules (only editable if pending) -->
                    ${canModifyRules ? `
                        <div class="p-6">
                            <h3 class="text-lg font-semibold text-white mb-4">Trading Rules</h3>
                            <p class="text-yellow-400 text-sm mb-4">⚠️ Rules can only be changed before the simulation starts</p>
                            
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                    <div>
                                        <h4 class="text-white font-medium">Short Selling</h4>
                                        <p class="text-sm text-gray-400">Allow participants to sell stocks they don't own</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="short-selling-toggle" ${simulation.rules?.allowShortSelling ? "checked" : ""} class="sr-only peer">
                                        <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                    </label>
                                </div>

                                <div class="p-4 bg-gray-700 rounded-lg">
                                    <h4 class="text-white font-medium mb-3">Trading Hours</h4>
                                    <div class="space-y-2">
                                        <label class="flex items-center">
                                            <input type="radio" name="trading-hours" value="market" ${simulation.rules?.tradingHours !== "24/7" ? "checked" : ""} class="w-4 h-4 text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500">
                                            <span class="ml-3 text-white">Market Hours Only</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="radio" name="trading-hours" value="24/7" ${simulation.rules?.tradingHours === "24/7" ? "checked" : ""} class="w-4 h-4 text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500">
                                            <span class="ml-3 text-white">24/7 Trading</span>
                                        </label>
                                    </div>
                                </div>

                                <button type="button" id="save-rules" class="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                    Save Rule Changes
                                </button>
                            </div>
                        </div>
                    ` : ""}
                </div>

                <div class="p-6 border-t border-gray-700">
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-400">
                            <p>💡 Changes are saved immediately and affect all participants</p>
                        </div>
                        <button id="close-settings-modal-btn" class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// /**
//  * Generate a reusable modal wrapper template
//  * @param {string} id - Modal ID
//  * @param {string} title - Modal title
//  * @param {string} subtitle - Modal subtitle (optional)
//  * @param {string} content - Modal body content
//  * @param {string} footer - Modal footer content
//  * @param {string} maxWidth - Max width class (default: 'max-w-2xl')
//  * @returns {string} HTML template string
//  */
// export const getModalWrapperTemplate = (id, title, subtitle, content, footer, maxWidth = "max-w-2xl") => {
//     return `
//         <div id="${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div class="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full ${maxWidth} mx-4">
//                 <div class="flex justify-between items-center p-6 border-b border-gray-700">
//                     <div>
//                         <h3 class="text-xl font-semibold text-white">${title}</h3>
//                         ${subtitle ? `<p class="text-gray-400 text-sm mt-1">${subtitle}</p>` : ""}
//                     </div>
//                     <button class="modal-close-btn text-gray-400 hover:text-white transition-colors">
//                         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
//                         </svg>
//                     </button>
//                 </div>

//                 <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
//                     ${content}
//                 </div>

//                 ${footer ? `
//                     <div class="flex justify-end gap-3 p-6 border-t border-gray-700">
//                         ${footer}
//                     </div>
//                 ` : ""}
//             </div>
//         </div>
//     `;
// };