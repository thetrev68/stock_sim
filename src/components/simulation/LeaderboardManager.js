// src/components/simulation/LeaderboardManager.js
// Unified leaderboard component - replaces LeaderboardOverview.js and LeaderboardTable.js

import { 
    formatCurrencyWithCommas
} from "../../utils/currency-utils.js";
import { getTimeAgoCompact } from "../../utils/date-utils.js";

/**
 * Unified Leaderboard Manager Component
 * Combines overview cards and detailed table functionality
 * Configurable display modes: 'overview', 'table', or 'both'
 */
export class LeaderboardManager {
    constructor() {
        // Container references
        this.container = null;
        this.overviewContainer = null;
        this.tableContainer = null;
        
        // Data properties
        this.leaderboardData = null;
        this.rankings = [];
        this.currentUserId = null;
        
        // Callback functions
        this.onRefresh = null;
        this.onUserClick = null;
        
        // Configuration
        this.displayMode = "both"; // "overview", "table", or "both"
        this.showTopPerformers = true;
        this.showUserRank = true;
        this.showStats = true;
    }

    /**
     * Main render method - maintains backward compatibility
     * Can be called in multiple ways for different use cases
     */
    render(container, data, userId, callbacks = {}) {
        this.container = container;
        this.currentUserId = userId;
        
        // Handle different callback patterns for backward compatibility
        if (typeof callbacks === "function") {
            // Legacy: render(container, data, userId, onRefresh)
            this.onRefresh = callbacks;
            this.onUserClick = null;
        } else if (callbacks && typeof callbacks === "object") {
            // Modern: render(container, data, userId, { onRefresh, onUserClick, mode })
            this.onRefresh = callbacks.onRefresh || null;
            this.onUserClick = callbacks.onUserClick || null;
            this.displayMode = callbacks.mode || "both";
        }
        
        // Set data - handle both leaderboardData (overview) and rankings (table) formats
        if (data && data.rankings) {
            // Overview format: { rankings: [...], totalParticipants: X, ... }
            this.leaderboardData = data;
            this.rankings = data.rankings;
        } else if (Array.isArray(data)) {
            // Table format: [...rankings...]
            this.rankings = data;
            this.leaderboardData = { rankings: data, totalParticipants: data.length };
        } else {
            this.leaderboardData = null;
            this.rankings = [];
        }

        container.innerHTML = this.getTemplate();
        this.attachEventListeners();
    }

    /**
     * Convenience methods for backward compatibility with existing simulation.js
     */
    renderOverview(container, leaderboardData, userId, onRefresh) {
        this.displayMode = "overview";
        this.render(container, leaderboardData, userId, { onRefresh, mode: "overview" });
    }

    renderTable(container, rankings, userId, onUserClick) {
        this.displayMode = "table";
        this.render(container, rankings, userId, { onUserClick, mode: "table" });
    }

    /**
     * Generate the appropriate template based on display mode
     */
    getTemplate() {
        if (!this.rankings || this.rankings.length === 0) {
            return this.getEmptyState();
        }

        switch (this.displayMode) {
            case "overview":
                return this.getOverviewTemplate();
            case "table":
                return this.getTableTemplate();
            case "both":
            default:
                return this.getCombinedTemplate();
        }
    }

    /**
     * Overview-only template (cards and stats)
     */
    getOverviewTemplate() {
        const userRanking = this.getCurrentUserRanking();
        const topPerformers = this.getTopPerformers();
        const stats = this.getOverallStats();

        return `
            <div class="leaderboard-overview space-y-6">
                <!-- Header with Refresh -->
                ${this.getHeaderTemplate()}

                <!-- Your Rank Card -->
                ${userRanking && this.showUserRank ? this.getUserRankCard(userRanking) : ""}

                <!-- Overall Stats -->
                ${this.showStats ? this.getStatsCardsTemplate(stats) : ""}

                <!-- Top Performers -->
                ${this.showTopPerformers ? this.getTopPerformersTemplate(topPerformers) : ""}
            </div>
        `;
    }

    /**
     * Table-only template (detailed rankings)
     */
    getTableTemplate() {
        const rankingRows = this.rankings.map(ranking => this.getRankingRow(ranking)).join("");

        return `
            <div class="leaderboard-table-container bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <div class="p-6 border-b border-gray-700">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-semibold text-white">Rankings</h3>
                            <p class="text-gray-400 text-sm mt-1">${this.rankings.length} participants</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-400">Updated</p>
                            <p class="text-white font-medium">${this.getLastUpdatedText()}</p>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-700">
                        <thead class="bg-gray-750">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Rank</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Participant</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Portfolio Value</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Total Return</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Return %</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Trades</th>
                                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Holdings</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            ${rankingRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Combined template (both overview and table)
     */
    getCombinedTemplate() {
        return `
            <div class="leaderboard-manager space-y-8">
                <!-- Overview Section -->
                <div class="leaderboard-overview-section">
                    ${this.getOverviewTemplate()}
                </div>
                
                <!-- Table Section -->
                <div class="leaderboard-table-section">
                    ${this.getTableTemplate()}
                </div>
            </div>
        `;
    }

    /**
     * Shared header template with refresh functionality
     */
    getHeaderTemplate() {
        return `
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-white">Leaderboard</h2>
                    <p class="text-gray-400">Real-time competition rankings</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-right text-sm">
                        <p class="text-gray-400">Last Updated</p>
                        <p class="text-white font-medium">${this.getLastUpdatedText()}</p>
                    </div>
                    <button 
                        id="refresh-leaderboard-btn"
                        class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span id="refresh-text">Refresh</span>
                        <div id="refresh-loading" class="hidden w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Current user ranking card
     */
    getUserRankCard(userRanking) {
        const rankColor = userRanking.rank === 1 ? "border-yellow-500 bg-yellow-500/10" :
                        userRanking.rank === 2 ? "border-gray-400 bg-gray-400/10" :
                        userRanking.rank === 3 ? "border-orange-500 bg-orange-500/10" :
                        "border-cyan-500 bg-cyan-500/10";

        // Handle both nested performance object AND flattened properties from Firestore
        const totalReturn = userRanking.performance?.totalReturn || userRanking.totalReturn || 0;
        const totalReturnPercent = userRanking.performance?.totalReturnPercent || userRanking.totalReturnPercent || 0;
        const totalTrades = userRanking.performance?.totalTrades || userRanking.totalTrades || 0;

        const returnClass = totalReturn >= 0 ? "text-green-400" : "text-red-400";
        const percentile = this.calculatePercentile(userRanking.rank, this.leaderboardData.totalParticipants);

        return `
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg border ${rankColor}">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-white">Your Performance</h3>
                        <p class="text-gray-400 text-sm">Current ranking and stats</p>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-bold text-white">#${userRanking.rank}</p>
                        <p class="text-sm text-gray-400">${percentile} percentile</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Portfolio:</span>
                        <span class="text-white font-semibold">${formatCurrencyWithCommas(userRanking.portfolioValue)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Return:</span>
                        <span class="${returnClass} font-semibold">
                            ${totalReturn >= 0 ? "+" : ""}${formatCurrencyWithCommas(totalReturn)}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Return %:</span>
                        <span class="${returnClass} font-semibold">
                            ${totalReturnPercent >= 0 ? "+" : ""}${totalReturnPercent.toFixed(2)}%
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Trades:</span>
                        <span class="text-white font-semibold">${totalTrades}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Overall statistics cards
     */
    getStatsCardsTemplate(stats) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
                    <p class="text-3xl font-bold text-white mb-1">
                        ${stats.totalParticipants}
                    </p>
                    <p class="text-sm text-gray-400">Total participants</p>
                </div>
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
                    <p class="text-3xl font-bold text-white mb-1">
                        ${formatCurrencyWithCommas(stats.averageReturn)}
                    </p>
                    <p class="text-sm text-gray-400">Average return</p>
                </div>
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
                    <p class="text-3xl font-bold text-white mb-1">
                        ${formatCurrencyWithCommas(stats.highestPortfolio)}
                    </p>
                    <p class="text-sm text-gray-400">Highest portfolio</p>
                </div>
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
                    <p class="text-3xl font-bold text-white mb-1">
                        ${formatCurrencyWithCommas(stats.totalVolume)}
                    </p>
                    <p class="text-sm text-gray-400">Traded by all users</p>
                </div>
            </div>
        `;
    }

    /**
     * Top performers section
     */
    getTopPerformersTemplate(topPerformers) {
        return `
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h3 class="text-xl font-semibold text-white mb-4">Top Performers</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${topPerformers.map((performer, index) => this.getTopPerformerCard(performer, index + 1)).join("")}
                </div>
            </div>
        `;
    }

    /**
     * Individual top performer card
     */
    getTopPerformerCard(performer, position) {
        // Gold/Silver/Bronze colors for top 3
        const rankColors = {
            1: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
            2: { text: "text-gray-300", bg: "bg-gray-400/10", border: "border-gray-400/30" },
            3: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-400/30" }
        };
        
        const colors = rankColors[position];
        
        // Handle both nested performance object AND flattened properties from Firestore
        const totalReturn = performer.performance?.totalReturn || performer.totalReturn || 0;
        const totalReturnPercent = performer.performance?.totalReturnPercent || performer.totalReturnPercent || 0;
        const totalTrades = performer.performance?.totalTrades || performer.totalTrades || 0;
        
        const returnClass = totalReturn >= 0 ? "text-green-400" : "text-red-400";

        return `
            <div class="bg-gray-700 p-4 rounded-lg ${colors.bg} border ${colors.border}">
                <div class="text-center mb-4">
                    <div class="${colors.text} font-bold text-2xl mb-1">#${position}</div>
                    <p class="text-white font-medium text-lg truncate">${performer.displayName}</p>
                    <p class="text-gray-400 text-sm truncate">${performer.email}</p>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Portfolio:</span>
                        <span class="text-white font-semibold">${formatCurrencyWithCommas(performer.portfolioValue)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Return:</span>
                        <span class="${returnClass} font-semibold">
                            ${totalReturnPercent >= 0 ? "+" : ""}${totalReturnPercent.toFixed(2)}%
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Trades:</span>
                        <span class="text-white font-semibold">${totalTrades}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Table ranking row
     */
    getRankingRow(ranking) {
        const isCurrentUser = ranking.userId === this.currentUserId;
        
        // Handle both nested performance object AND flattened properties from Firestore
        const totalReturn = ranking.performance?.totalReturn || ranking.totalReturn || 0;
        const totalReturnPercent = ranking.performance?.totalReturnPercent || ranking.totalReturnPercent || 0;
        const totalTrades = ranking.performance?.totalTrades || ranking.totalTrades || 0;
        const holdingsCount = ranking.performance?.holdingsCount || ranking.holdingsCount || 0;
        
        const returnClass = totalReturn >= 0 ? "text-green-400" : "text-red-400";
        const rowClass = isCurrentUser ? "bg-cyan-900/30 border-l-4 border-cyan-400" : "hover:bg-gray-700/50";
        
        // Rank styling - Gold/Silver/Bronze for top 3
        let rankDisplay;
        if (ranking.rank === 1) {
            rankDisplay = `<div class="text-center"><span class="text-yellow-400 font-bold text-lg">#1</span></div>`;
        } else if (ranking.rank === 2) {
            rankDisplay = `<div class="text-center"><span class="text-gray-300 font-bold text-lg">#2</span></div>`;
        } else if (ranking.rank === 3) {
            rankDisplay = `<div class="text-center"><span class="text-orange-400 font-bold text-lg">#3</span></div>`;
        } else {
            rankDisplay = `<div class="text-center"><span class="text-white font-medium">#${ranking.rank}</span></div>`;
        }

        return `
            <tr class="${rowClass} transition-colors cursor-pointer ranking-row" 
                data-user-id="${ranking.userId}" 
                data-user-name="${ranking.displayName}">
                <td class="px-6 py-4 whitespace-nowrap w-20">
                    ${rankDisplay}
                </td>
                <td class="px-6 py-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="text-white font-medium truncate">${ranking.displayName}</p>
                            ${isCurrentUser ? "<span class=\"bg-cyan-600 text-white text-xs px-2 py-1 rounded-full\">You</span>" : ""}
                        </div>
                        <p class="text-gray-400 text-sm truncate">${ranking.email}</p>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-white font-semibold">${formatCurrencyWithCommas(ranking.portfolioValue)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="${returnClass} font-semibold">
                        ${totalReturn >= 0 ? "+" : ""}${formatCurrencyWithCommas(totalReturn)}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="${returnClass} font-semibold">
                        ${totalReturnPercent >= 0 ? "+" : ""}${totalReturnPercent.toFixed(2)}%
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-white">${totalTrades}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-white">${holdingsCount}</div>
                </td>
            </tr>
        `;
    }

    /**
     * Empty state template
     */
    getEmptyState() {
        return `
            <div class="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
                <div class="text-gray-400 mb-4">
                    <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">No Rankings Available</h3>
                <p class="text-gray-400 mb-4">Leaderboard data is being calculated...</p>
                <div class="text-gray-500 text-sm">
                    <p>• Make trades to build your portfolio</p>
                    <p>• Rankings update automatically every few minutes</p>
                    <p>• Portfolio value determines your rank</p>
                </div>
            </div>
        `;
    }

    // ========================================
    // UTILITY METHODS (SHARED FUNCTIONALITY)
    // ========================================

    /**
     * Get current user's ranking data
     */
    getCurrentUserRanking() {
        if (!this.leaderboardData || !this.currentUserId) return null;
        return this.rankings.find(r => r.userId === this.currentUserId);
    }

    /**
     * Get top 3 performers
     */
    getTopPerformers() {
        if (!this.rankings) return [];
        return this.rankings.slice(0, 3);
    }

    /**
     * Calculate overall statistics
     */
    getOverallStats() {
        if (!this.rankings || this.rankings.length === 0) {
            return {
                totalParticipants: 0,
                averageReturn: 0,
                highestPortfolio: 0,
                totalVolume: 0
            };
        }

        const totalVolume = this.rankings.reduce((sum, ranking) => {
            const volume = ranking.performance?.totalVolume || ranking.totalVolume || 0;
            return sum + volume;
        }, 0);
        
        const highestPortfolio = this.rankings.length > 0 ? 
            Math.max(...this.rankings.map(r => r.portfolioValue || 0)) : 0;
        
        const totalReturns = this.rankings.reduce((sum, ranking) => {
            const totalReturn = ranking.performance?.totalReturn || ranking.totalReturn || 0;
            return sum + totalReturn;
        }, 0);
        
        const averageReturn = this.rankings.length > 0 ? totalReturns / this.rankings.length : 0;

        return {
            totalParticipants: this.rankings.length,
            averageReturn,
            highestPortfolio,
            totalVolume
        };
    }

    /**
     * Calculate percentile for ranking
     */
    calculatePercentile(rank, totalParticipants) {
        if (!rank || !totalParticipants || totalParticipants === 0) return "N/A";
        const percentile = Math.round(((totalParticipants - rank + 1) / totalParticipants) * 100);
        return `${percentile}${this.getOrdinalSuffix(percentile)}`;
    }

    /**
     * Get ordinal suffix (1st, 2nd, 3rd, 4th...)
     */
    getOrdinalSuffix(num) {
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return "th";
        if (lastDigit === 1) return "st";
        if (lastDigit === 2) return "nd";
        if (lastDigit === 3) return "rd";
        return "th";
    }

    /**
     * Get formatted last updated text
     */
    getLastUpdatedText() {
        if (!this.leaderboardData || !this.leaderboardData.lastUpdated) {
            return "Just now";
        }

        try {
            const lastUpdated = this.leaderboardData.lastUpdated.toDate ? 
                this.leaderboardData.lastUpdated.toDate() : 
                new Date(this.leaderboardData.lastUpdated);
            return getTimeAgoCompact(lastUpdated);
        } catch (error) {
            console.warn("Error formatting last updated time:", error);
            return "Recently";
        }
    }

    // ========================================
    // EVENT HANDLING
    // ========================================

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        if (!this.container) return;

        // Refresh button
        this.attachRefreshHandler();
        
        // User row clicks (for table mode)
        this.attachUserClickHandlers();
    }

    /**
     * Handle refresh button clicks
     */
    attachRefreshHandler() {
        const refreshBtn = this.container.querySelector("#refresh-leaderboard-btn");
        if (refreshBtn && this.onRefresh) {
            refreshBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                await this.handleRefresh();
            });
        }
    }

    /**
     * Handle user row clicks in table
     */
    attachUserClickHandlers() {
        const rankingRows = this.container.querySelectorAll(".ranking-row");
        rankingRows.forEach(row => {
            row.addEventListener("click", (e) => {
                const userId = e.currentTarget.dataset.userId;
                const userName = e.currentTarget.dataset.userName;
                
                if (this.onUserClick && typeof this.onUserClick === "function") {
                    this.onUserClick(userId, userName);
                } else {
                    console.log(`Clicked on user: ${userName} (${userId})`);
                }
            });
        });
    }

    /**
     * Handle refresh with loading states
     */
    async handleRefresh() {
        const refreshBtn = this.container.querySelector("#refresh-leaderboard-btn");
        const refreshText = this.container.querySelector("#refresh-text");
        const refreshLoading = this.container.querySelector("#refresh-loading");
        
        if (!refreshBtn || !this.onRefresh) return;

        try {
            // Show loading state
            refreshBtn.disabled = true;
            refreshText.classList.add("hidden");
            refreshLoading.classList.remove("hidden");

            // Call the refresh callback
            await this.onRefresh();

        } catch (error) {
            console.error("Error refreshing leaderboard:", error);
        } finally {
            // Reset button state
            refreshBtn.disabled = false;
            refreshText.classList.remove("hidden");
            refreshLoading.classList.add("hidden");
        }
    }

    // ========================================
    // PUBLIC API METHODS
    // ========================================

    /**
     * Update rankings without full re-render (for real-time updates)
     */
    updateRankings(newData) {
        // Handle different data formats
        if (newData && newData.rankings) {
            this.leaderboardData = newData;
            this.rankings = newData.rankings;
        } else if (Array.isArray(newData)) {
            this.rankings = newData;
            this.leaderboardData = { rankings: newData, totalParticipants: newData.length };
        }

        // Re-render with current settings
        this.render(this.container, this.leaderboardData || this.rankings, this.currentUserId, {
            onRefresh: this.onRefresh,
            onUserClick: this.onUserClick,
            mode: this.displayMode
        });
    }

    /**
     * Highlight specific user in table
     */
    highlightUser(userId) {
        if (!this.container) return;

        // Remove existing highlights
        const rows = this.container.querySelectorAll(".ranking-row");
        rows.forEach(row => {
            row.classList.remove("ring-2", "ring-cyan-400");
        });

        // Add highlight to specific user
        const userRow = this.container.querySelector(`[data-user-id="${userId}"]`);
        if (userRow) {
            userRow.classList.add("ring-2", "ring-cyan-400");
            userRow.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    /**
     * Configure display options
     */
    configure(options = {}) {
        if (options.mode) this.displayMode = options.mode;
        if (options.showTopPerformers !== undefined) this.showTopPerformers = options.showTopPerformers;
        if (options.showUserRank !== undefined) this.showUserRank = options.showUserRank;
        if (options.showStats !== undefined) this.showStats = options.showStats;
        
        // Re-render if container exists
        if (this.container) {
            this.render(this.container, this.leaderboardData || this.rankings, this.currentUserId, {
                onRefresh: this.onRefresh,
                onUserClick: this.onUserClick,
                mode: this.displayMode
            });
        }
    }

    /**
     * Get current user's rank info
     */
    getUserRankInfo() {
        const userRanking = this.getCurrentUserRanking();
        if (!userRanking) return null;

        return {
            rank: userRanking.rank,
            totalParticipants: this.leaderboardData?.totalParticipants || this.rankings.length,
            portfolioValue: userRanking.portfolioValue,
            totalReturn: userRanking.performance?.totalReturn || userRanking.totalReturn || 0,
            totalReturnPercent: userRanking.performance?.totalReturnPercent || userRanking.totalReturnPercent || 0,
            percentile: this.calculatePercentile(userRanking.rank, this.leaderboardData?.totalParticipants || this.rankings.length)
        };
    }

    /**
     * Scroll to user's position in table
     */
    scrollToUser(userId = null) {
        const targetUserId = userId || this.currentUserId;
        if (!targetUserId || !this.container) return;

        const userRow = this.container.querySelector(`[data-user-id="${targetUserId}"]`);
        if (userRow) {
            userRow.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    // ========================================
    // BACKWARD COMPATIBILITY HELPERS
    // ========================================

    /**
     * Legacy method for overview component compatibility
     */
    getLoadingState() {
        return this.getEmptyState();
    }
}