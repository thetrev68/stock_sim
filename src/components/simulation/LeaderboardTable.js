// src/components/simulation/LeaderboardTable.js

import { 
    formatCurrencyWithCommas,
    formatPrice
} from "../../utils/currency-utils.js";

export class LeaderboardTable {
    constructor() {
        this.container = null;
        this.rankings = [];
        this.currentUserId = null;
        this.onUserClick = null;
    }

    render(container, rankings = [], currentUserId = null, onUserClick = null) {
        this.container = container;
        this.rankings = rankings;
        this.currentUserId = currentUserId;
        this.onUserClick = onUserClick;

        container.innerHTML = this.getTemplate();
        this.attachEventListeners();
    }

    getTemplate() {
        if (!this.rankings || this.rankings.length === 0) {
            return this.getEmptyState();
        }

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

    getRankingRow(ranking) {
        const isCurrentUser = ranking.userId === this.currentUserId;
        const totalReturn = ranking.performance?.totalReturn || 0;
        const totalReturnPercent = ranking.performance?.totalReturnPercent || 0;
        const totalTrades = ranking.performance?.totalTrades || 0;
        const totalVolume = ranking.performance?.totalVolume || 0;
        const holdingsCount = ranking.performance?.holdingsCount || 0;
        const winRate = ranking.performance?.winRate || 0;
        
        const returnClass = totalReturn >= 0 ? "text-green-400" : "text-red-400";
        const rowClass = isCurrentUser ? "bg-cyan-900/30 border-l-4 border-cyan-400" : "hover:bg-gray-700/50";
        
        // UPDATED RANK STYLING - Gold/Silver/Bronze for top 3, white for rest, NO ICONS
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
                <!-- MAX SPACE FOR NAME/EMAIL - Removed avatar icons completely -->
                <td class="px-6 py-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="text-white font-medium truncate">${ranking.displayName}</p>
                            ${isCurrentUser ? "<span class=\"text-cyan-400 text-xs font-medium whitespace-nowrap\">(You)</span>" : ""}
                            ${ranking.role === "creator" ? "<span class=\"text-yellow-400 text-xs font-medium whitespace-nowrap\">(Creator)</span>" : ""}
                        </div>
                        <p class="text-gray-400 text-sm truncate">${this.formatEmail(ranking.email)}</p>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="text-white font-semibold">${formatCurrencyWithCommas(ranking.portfolioValue)}</span>
                    <div class="text-gray-400 text-sm">
                        Cash: ${formatCurrencyWithCommas(ranking.cash)} • 
                        Holdings: ${formatCurrencyWithCommas(ranking.holdingsValue)}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="${returnClass} font-semibold">
                        ${formatPrice(Math.abs(totalReturn))}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="${returnClass} font-semibold">
                        ${totalReturnPercent >= 0 ? "+" : ""}${totalReturnPercent.toFixed(2)}%
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-white">${totalTrades}</div>
                    <div class="text-gray-400 text-sm">${formatCurrencyWithCommas(totalVolume, false)} vol</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-white">${holdingsCount}</div>
                    <div class="text-gray-400 text-sm">${winRate.toFixed(0)}% wins</div>
                </td>
            </tr>
        `;
    }

    getRankDisplay(rank) {
        if (rank === 1) {
            return `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                        <span class="text-yellow-900 font-bold text-sm">👑</span>
                    </div>
                    <span class="text-yellow-400 font-bold text-lg">#1</span>
                </div>
            `;
        } else if (rank === 2) {
            return `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mr-2">
                        <span class="text-gray-900 font-bold text-sm">🥈</span>
                    </div>
                    <span class="text-gray-300 font-bold text-lg">#2</span>
                </div>
            `;
        } else if (rank === 3) {
            return `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mr-2">
                        <span class="text-orange-900 font-bold text-sm">🥉</span>
                    </div>
                    <span class="text-orange-400 font-bold text-lg">#3</span>
                </div>
            `;
        } else {
            return `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                        <span class="text-gray-300 font-bold text-sm">${rank}</span>
                    </div>
                    <span class="text-gray-300 font-semibold text-lg">#${rank}</span>
                </div>
            `;
        }
    }

    formatEmail(email) {
        if (!email) return "";
        // Truncate long emails
        if (email.length > 20) {
            return email.substring(0, 17) + "...";
        }
        return email;
    }

    getLastUpdatedText() {
        // This would be passed in with the rankings data
        return "Just now";
    }

    getEmptyState() {
        return `
            <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-12 text-center">
                <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-300 mb-2">No Rankings Available</h3>
                <p class="text-gray-400 mb-6">Rankings will appear once participants start trading</p>
                <div class="text-gray-500 text-sm">
                    <p>• Make trades to build your portfolio</p>
                    <p>• Rankings update automatically every few minutes</p>
                    <p>• Portfolio value determines your rank</p>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (!this.container) return;

        // Handle row clicks for user details
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

    // Update rankings without full re-render
    updateRankings(newRankings) {
        this.rankings = newRankings;
        this.render(this.container, newRankings, this.currentUserId, this.onUserClick);
    }

    // Highlight specific user
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
}