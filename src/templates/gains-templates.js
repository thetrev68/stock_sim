/**
 * Simplified Gains/Loss Templates
 * Self-contained with all utility functions included
 * No external dependencies - ready to use immediately
 */

// ============ UTILITY FUNCTIONS ============
const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(value);
};

const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return new Intl.NumberFormat("en-US").format(num);
};

const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0.00%";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
};

const getColorClass = (value) => {
    return value >= 0 ? "text-green-400" : "text-red-400";
};

// ============ TEMPLATE FUNCTIONS ============

/**
 * Basic gains summary section for portfolio page
 */
export const createGainsSummarySection = () => {
    return `
        <section class="gains-summary bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
            <div class="p-4 sm:p-6 border-b border-gray-700">
                <h2 class="text-xl font-semibold text-white">Gains & Losses</h2>
                <p class="text-sm text-gray-400 mt-1">Performance breakdown</p>
            </div>
            
            <div class="p-4 sm:p-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Total Gains -->
                    <div class="bg-gray-750 rounded-lg p-4 border border-gray-600">
                        <h3 class="text-sm font-medium text-gray-300 mb-2">Total Gains/Loss</h3>
                        <div id="total-gains" class="text-xl font-bold text-white">$0.00</div>
                        <div id="total-gains-percent" class="text-sm text-gray-400">0.00%</div>
                    </div>
                    
                    <!-- Realized Gains -->
                    <div class="bg-gray-750 rounded-lg p-4 border border-gray-600">
                        <h3 class="text-sm font-medium text-gray-300 mb-2">Realized</h3>
                        <div id="realized-gains" class="text-xl font-bold text-white">$0.00</div>
                        <div class="text-xs text-gray-400">
                            <span id="realized-st" class="text-blue-400">$0 ST</span> | 
                            <span id="realized-lt" class="text-purple-400">$0 LT</span>
                        </div>
                    </div>
                    
                    <!-- Unrealized Gains -->
                    <div class="bg-gray-750 rounded-lg p-4 border border-gray-600">
                        <h3 class="text-sm font-medium text-gray-300 mb-2">Unrealized</h3>
                        <div id="unrealized-gains" class="text-xl font-bold text-white">$0.00</div>
                        <div class="text-xs text-gray-400">
                            <span id="unrealized-st" class="text-blue-400">$0 ST</span> | 
                            <span id="unrealized-lt" class="text-purple-400">$0 LT</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
};

/**
 * Enhanced holdings table header (add Gain/Loss column)
 */
export const createEnhancedHoldingsHeader = () => {
    return `
        <thead class="bg-gray-750">
            <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Stock</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Shares</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Avg Price</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Current</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Value</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Gain/Loss</th>
            </tr>
        </thead>
    `;
};

/**
 * Create enhanced holding row with gain/loss data
 */
export const createHoldingRowWithGains = (ticker, holding, currentPrice = null, gainData = null) => {
    const finalPrice = currentPrice || holding.avgPrice;
    const marketValue = holding.quantity * finalPrice;
    const costBasis = holding.quantity * holding.avgPrice;
    const gain = marketValue - costBasis;
    const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;
    
    // Use provided gain data or calculate simple version
    const isLongTerm = gainData?.isLongTerm || false;
    const holdingDays = gainData?.avgHoldingDays || 0;
    
    const gainColorClass = getColorClass(gain);
    const termBadge = isLongTerm ? 
        "<span class=\"text-xs bg-purple-400/10 text-purple-400 px-2 py-1 rounded\">LT</span>" :
        "<span class=\"text-xs bg-blue-400/10 text-blue-400 px-2 py-1 rounded\">ST</span>";
    
    return `
        <tr class="hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xs font-bold text-cyan-400">${ticker.charAt(0)}</span>
                    </div>
                    <div>
                        <span class="font-semibold text-white">${ticker.toUpperCase()}</span>
                        ${holdingDays > 0 ? `<div class="text-xs text-gray-500">${holdingDays} days ${termBadge}</div>` : ""}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">
                ${formatNumber(holding.quantity)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                ${formatCurrency(holding.avgPrice)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <span class="text-white">${formatCurrency(finalPrice)}</span>
                ${currentPrice === null ? "<div class=\"text-xs text-yellow-400\">Last known</div>" : ""}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-white font-semibold">${formatCurrency(marketValue)}</div>
                <div class="text-xs text-gray-400">Cost: ${formatCurrency(costBasis)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="${gainColorClass} font-semibold">
                    ${formatCurrency(gain)}
                </div>
                <div class="${gainColorClass} text-sm">
                    ${formatPercent(gainPercent)}
                </div>
            </td>
        </tr>
    `;
};

/**
 * Compact gains display for simulation views
 */
export const createCompactGainsDisplay = () => {
    return `
        <div class="compact-gains bg-gray-750 rounded-lg p-4 border border-gray-600 mb-4">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-white">Performance</h3>
                <button id="toggle-gains-details" class="text-xs text-cyan-400 hover:text-cyan-300">
                    Details
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                    <div class="text-xs text-gray-400 mb-1">Realized</div>
                    <div id="compact-realized" class="text-sm font-semibold text-white">$0.00</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-gray-400 mb-1">Unrealized</div>
                    <div id="compact-unrealized" class="text-sm font-semibold text-white">$0.00</div>
                </div>
            </div>
            
            <div id="gains-details" class="hidden mt-4 pt-3 border-t border-gray-600">
                <div class="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <div class="text-blue-400 mb-1">Short-term</div>
                        <div id="compact-st-realized" class="text-white">$0</div>
                        <div id="compact-st-unrealized" class="text-gray-400">$0 unrealized</div>
                    </div>
                    <div>
                        <div class="text-purple-400 mb-1">Long-term</div>
                        <div id="compact-lt-realized" class="text-white">$0</div>
                        <div id="compact-lt-unrealized" class="text-gray-400">$0 unrealized</div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Realized gains history table
 */
export const createRealizedGainsTable = () => {
    return `
        <div class="realized-gains-section mt-8">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-white">Realized Gains History</h3>
                <select id="gains-filter" class="bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-2">
                    <option value="all">All Trades</option>
                    <option value="gains">Gains Only</option>
                    <option value="losses">Losses Only</option>
                    <option value="short-term">Short-term</option>
                    <option value="long-term">Long-term</option>
                </select>
            </div>
            
            <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-700">
                        <thead class="bg-gray-750">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Stock</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase">Qty</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase">Buy Price</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase">Sell Price</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase">Days Held</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase">Gain/Loss</th>
                            </tr>
                        </thead>
                        <tbody id="realized-gains-tbody" class="divide-y divide-gray-700">
                            <!-- Rows will be inserted here -->
                        </tbody>
                    </table>
                </div>
                
                <div id="no-realized-gains" class="text-center py-12 hidden">
                    <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-300 mb-2">No Realized Gains Yet</h3>
                    <p class="text-gray-400">Realized gains from sold positions will appear here</p>
                </div>
            </div>
        </div>
    `;
};

/**
 * Create realized gain row
 */
export const createRealizedGainRow = (gainRecord) => {
    const gainPercent = gainRecord.costBasis > 0 ? (gainRecord.realizedGain / gainRecord.costBasis) * 100 : 0;
    const gainColorClass = getColorClass(gainRecord.realizedGain);
    const termBadge = gainRecord.isLongTerm ? 
        "<span class=\"text-xs bg-purple-400/10 text-purple-400 px-2 py-1 rounded\">Long-term</span>" :
        "<span class=\"text-xs bg-blue-400/10 text-blue-400 px-2 py-1 rounded\">Short-term</span>";
    
    return `
        <tr class="hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xs font-bold text-cyan-400">${gainRecord.ticker.charAt(0)}</span>
                    </div>
                    <span class="font-semibold text-white">${gainRecord.ticker.toUpperCase()}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-white">
                ${formatNumber(gainRecord.quantity)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                ${formatCurrency(gainRecord.buyPrice)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                ${formatCurrency(gainRecord.sellPrice)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-white">${gainRecord.holdingPeriodDays} days</div>
                <div class="text-xs">${termBadge}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="${gainColorClass} font-semibold">
                    ${formatCurrency(gainRecord.realizedGain)}
                </div>
                <div class="${gainColorClass} text-sm">
                    ${formatPercent(gainPercent)}
                </div>
            </td>
        </tr>
    `;
};

// ============ HELPER FUNCTIONS FOR UPDATING DATA ============

/**
 * Update gains summary display with calculated data
 */
export const updateGainsSummary = (gainsData) => {
    if (!gainsData) return;
    
    const { realized, unrealized, totalGains } = gainsData;
    
    // Update total gains
    const totalGainsEl = document.getElementById("total-gains");
    const totalGainsPercentEl = document.getElementById("total-gains-percent");
    if (totalGainsEl) {
        totalGainsEl.textContent = formatCurrency(totalGains);
        totalGainsEl.className = `text-xl font-bold ${getColorClass(totalGains)}`;
    }
    if (totalGainsPercentEl) {
        // You'll need to calculate percentage based on portfolio value
        totalGainsPercentEl.textContent = "0.00%"; // Placeholder
    }
    
    // Update realized gains
    const realizedEl = document.getElementById("realized-gains");
    const realizedSTEl = document.getElementById("realized-st");
    const realizedLTEl = document.getElementById("realized-lt");
    
    if (realizedEl) {
        realizedEl.textContent = formatCurrency(realized.totalRealized);
        realizedEl.className = `text-xl font-bold ${getColorClass(realized.totalRealized)}`;
    }
    if (realizedSTEl) realizedSTEl.textContent = `${formatCurrency(realized.shortTermGains)} ST`;
    if (realizedLTEl) realizedLTEl.textContent = `${formatCurrency(realized.longTermGains)} LT`;
    
    // Update unrealized gains
    const unrealizedEl = document.getElementById("unrealized-gains");
    const unrealizedSTEl = document.getElementById("unrealized-st");
    const unrealizedLTEl = document.getElementById("unrealized-lt");
    
    if (unrealizedEl) {
        unrealizedEl.textContent = formatCurrency(unrealized.totalUnrealized);
        unrealizedEl.className = `text-xl font-bold ${getColorClass(unrealized.totalUnrealized)}`;
    }
    if (unrealizedSTEl) unrealizedSTEl.textContent = `${formatCurrency(unrealized.shortTermUnrealized)} ST`;
    if (unrealizedLTEl) unrealizedLTEl.textContent = `${formatCurrency(unrealized.longTermUnrealized)} LT`;
};

/**
 * Update compact gains display
 */
export const updateCompactGains = (gainsData) => {
    if (!gainsData) return;
    
    const { realized, unrealized } = gainsData;
    
    // Update main display
    const compactRealizedEl = document.getElementById("compact-realized");
    const compactUnrealizedEl = document.getElementById("compact-unrealized");
    
    if (compactRealizedEl) {
        compactRealizedEl.textContent = formatCurrency(realized.totalRealized);
        compactRealizedEl.className = `text-sm font-semibold ${getColorClass(realized.totalRealized)}`;
    }
    if (compactUnrealizedEl) {
        compactUnrealizedEl.textContent = formatCurrency(unrealized.totalUnrealized);
        compactUnrealizedEl.className = `text-sm font-semibold ${getColorClass(unrealized.totalUnrealized)}`;
    }
    
    // Update details
    const stRealizedEl = document.getElementById("compact-st-realized");
    const stUnrealizedEl = document.getElementById("compact-st-unrealized");
    const ltRealizedEl = document.getElementById("compact-lt-realized");
    const ltUnrealizedEl = document.getElementById("compact-lt-unrealized");
    
    if (stRealizedEl) stRealizedEl.textContent = formatCurrency(realized.shortTermGains);
    if (stUnrealizedEl) stUnrealizedEl.textContent = `${formatCurrency(unrealized.shortTermUnrealized)} unrealized`;
    if (ltRealizedEl) ltRealizedEl.textContent = formatCurrency(realized.longTermGains);
    if (ltUnrealizedEl) ltUnrealizedEl.textContent = `${formatCurrency(unrealized.longTermUnrealized)} unrealized`;
};

/**
 * Setup event listeners for gains components
 */
export const setupGainsEventListeners = () => {
    // Toggle compact gains details
    const toggleBtn = document.getElementById("toggle-gains-details");
    const detailsDiv = document.getElementById("gains-details");
    
    if (toggleBtn && detailsDiv) {
        toggleBtn.addEventListener("click", () => {
            const isHidden = detailsDiv.classList.contains("hidden");
            if (isHidden) {
                detailsDiv.classList.remove("hidden");
                toggleBtn.textContent = "Hide";
            } else {
                detailsDiv.classList.add("hidden");
                toggleBtn.textContent = "Details";
            }
        });
    }
    
    // Filter realized gains
    const filterSelect = document.getElementById("gains-filter");
    if (filterSelect) {
        filterSelect.addEventListener("change", (e) => {
            // You'll implement the filtering logic in your main view
            const event = new CustomEvent("gainsFilterChanged", { 
                detail: { filter: e.target.value } 
            });
            document.dispatchEvent(event);
        });
    }
};