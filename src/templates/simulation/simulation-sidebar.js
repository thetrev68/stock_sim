// file: src/templates/simulation/simulation-sidebar.js
// Sidebar content templates for simulation view
// Focused module: Only sidebar stats and rules templates

/** TFC Moved
 * Generate the main stats cards template (rank, portfolio value, time remaining)
 * @returns {string} HTML template string
 */
export const getMainStatsCardsTemplate = () => {
    return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-400">Your Rank</h3>
                    <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                        </svg>
                    </div>
                </div>
                <p id="your-rank" class="text-3xl font-bold text-white mb-2">#1</p>
                <p class="text-sm text-gray-400">of <span id="total-participants">0</span> participants</p>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-400">Portfolio Value</h3>
                    <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                    </div>
                </div>
                <p id="sim-portfolio-value" class="text-3xl font-bold text-white mb-2">$10,000</p>
                <p id="sim-portfolio-change" class="text-sm font-medium text-gray-400">$0.00 (0.00%)</p>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-400">Time Remaining</h3>
                    <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p id="days-remaining" class="text-3xl font-bold text-white mb-2">30</p>
                <p class="text-sm text-gray-400">days left</p>
            </div>
        </div>
    `;
};