// src/components/simulation/LeaderboardOverview.js
export class LeaderboardOverview {
    constructor() {
        this.container = null;
        this.leaderboardData = null;
        this.currentUserId = null;
        this.onRefresh = null;
    }

    render(container, leaderboardData = null, currentUserId = null, onRefresh = null) {
        this.container = container;
        this.leaderboardData = leaderboardData;
        this.currentUserId = currentUserId;
        this.onRefresh = onRefresh;

        container.innerHTML = this.getTemplate();
        this.attachEventListeners();
    }

    getTemplate() {
        if (!this.leaderboardData || !this.leaderboardData.rankings) {
            return this.getLoadingState();
        }

        const userRanking = this.getCurrentUserRanking();
        const topPerformers = this.getTopPerformers();
        const stats = this.getOverallStats();

        return `
            <div class="leaderboard-overview space-y-6">
                <!-- Header with Refresh -->
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

                <!-- Your Rank Card -->
                ${userRanking ? this.getUserRankCard(userRanking) : ''}

                <!-- Overview Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-sm font-medium text-gray-400">Total Participants</h3>
                            <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-white mb-1">${stats.totalParticipants}</p>
                        <p class="text-sm text-gray-400">Active traders</p>
                    </div>

                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-sm font-medium text-gray-400">Average Return</h3>
                            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-3xl font-bold ${stats.averageReturn >= 0 ? 'text-green-400' : 'text-red-400'} mb-1">
                            ${stats.averageReturn >= 0 ? '+' : ''}${stats.averageReturn.toFixed(2)}%
                        </p>
                        <p class="text-sm text-gray-400">All participants</p>
                    </div>

                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-sm font-medium text-gray-400">Highest Portfolio</h3>
                            <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-white mb-1">
                            $${stats.highestPortfolio.toLocaleString()}
                        </p>
                        <p class="text-sm text-gray-400">${this.leaderboardData.topPerformer?.displayName || 'N/A'}</p>
                    </div>

                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-sm font-medium text-gray-400">Total Volume</h3>
                            <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-white mb-1">
                            $${stats.totalVolume.toLocaleString()}
                        </p>
                        <p class="text-sm text-gray-400">Traded by all users</p>
                    </div>
                </div>

                <!-- Top Performers -->
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h3 class="text-xl font-semibold text-white mb-4">Top Performers</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        ${topPerformers.map((performer, index) => this.getTopPerformerCard(performer, index + 1)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getCurrentUserRanking() {
        if (!this.leaderboardData || !this.currentUserId) return null;
        
        return this.leaderboardData.rankings.find(r => r.userId === this.currentUserId);
    }

    getUserRankCard(userRanking) {
        const rankColor = userRanking.rank === 1 ? 'border-yellow-500 bg-yellow-500/10' :
                         userRanking.rank === 2 ? 'border-gray-400 bg-gray-400/10' :
                         userRanking.rank === 3 ? 'border-orange-500 bg-orange-500/10' :
                         'border-cyan-500 bg-cyan-500/10';

        // Access performance metrics from nested performance object
        const totalReturn = userRanking.performance?.totalReturn || 0;
        const totalReturnPercent = userRanking.performance?.totalReturnPercent || 0;
        const totalTrades = userRanking.performance?.totalTrades || 0;

        const returnClass = totalReturn >= 0 ? 'text-green-400' : 'text-red-400';
        const returnIcon = totalReturn >= 0 ? '↗' : '↘';

        return `
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg border-2 ${rankColor}">
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-xl">${userRanking.displayName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white">Your Performance</h3>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-cyan-400 font-semibold">Rank #${userRanking.rank}</span>
                                <span class="text-gray-400">of ${this.leaderboardData.totalParticipants}</span>
                                <span class="text-gray-500">•</span>
                                <span class="text-gray-400">${this.calculatePercentile(userRanking.rank)}th percentile</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div>
                            <p class="text-2xl font-bold text-white">${userRanking.portfolioValue.toLocaleString()}</p>
                            <p class="text-gray-400 text-sm">Portfolio Value</p>
                        </div>
                        <div>
                            <p class="text-2xl font-bold ${returnClass}">
                                ${returnIcon} ${Math.abs(totalReturn).toLocaleString()}
                            </p>
                            <p class="text-gray-400 text-sm">Total Return</p>
                        </div>
                        <div>
                            <p class="text-2xl font-bold ${returnClass}">
                                ${totalReturnPercent >= 0 ? '+' : ''}${totalReturnPercent.toFixed(2)}%
                            </p>
                            <p class="text-gray-400 text-sm">Return %</p>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-white">${totalTrades}</p>
                            <p class="text-gray-400 text-sm">Total Trades</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getTopPerformers() {
        if (!this.leaderboardData || !this.leaderboardData.rankings) return [];
        
        return this.leaderboardData.rankings.slice(0, 3);
    }

    getTopPerformerCard(performer, position) {
        const medalEmoji = position === 1 ? '🏆' : position === 2 ? '🥈' : '🥉';
        const medalColor = position === 1 ? 'text-yellow-400' : position === 2 ? 'text-gray-400' : 'text-orange-400';
        const bgColor = position === 1 ? 'bg-yellow-500/10' : position === 2 ? 'bg-gray-400/10' : 'bg-orange-500/10';
        
        // Access performance metrics from nested performance object
        const totalReturn = performer.performance?.totalReturn || 0;
        const totalReturnPercent = performer.performance?.totalReturnPercent || 0;
        const totalTrades = performer.performance?.totalTrades || 0;

        const returnClass = totalReturn >= 0 ? 'text-green-400' : 'text-red-400';
        const returnIcon = totalReturn >= 0 ? '↗' : '↘';

        return `
            <div class="bg-gray-700 p-4 rounded-lg ${bgColor} border border-gray-600">
                <div class="flex items-center gap-3 mb-3">
                    <div class="text-2xl">${medalEmoji}</div>
                    <div>
                        <h4 class="${medalColor} font-bold text-lg">#${position}</h4>
                        <p class="text-white font-medium">${performer.displayName}</p>
                    </div>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Portfolio:</span>
                        <span class="text-white font-semibold">${performer.portfolioValue.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Return:</span>
                        <span class="${returnClass} font-semibold">
                            ${returnIcon} ${totalReturnPercent >= 0 ? '+' : ''}${totalReturnPercent.toFixed(2)}%
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Trades:</span>
                        <span class="text-white">${totalTrades}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getOverallStats() {
        if (!this.leaderboardData || !this.leaderboardData.rankings) {
            return {
                totalParticipants: 0,
                averageReturn: 0,
                highestPortfolio: 0,
                totalVolume: 0
            };
        }

        const rankings = this.leaderboardData.rankings;
        const totalVolume = rankings.reduce((sum, r) => sum + (r.totalVolume || 0), 0);
        const highestPortfolio = rankings.length > 0 ? rankings[0].portfolioValue : 0;

        return {
            totalParticipants: rankings.length,
            averageReturn: this.leaderboardData.averageReturn || 0,
            highestPortfolio,
            totalVolume
        };
    }

    calculatePercentile(rank) {
        if (!this.leaderboardData) return 0;
        
        const percentile = Math.round((1 - (rank - 1) / this.leaderboardData.totalParticipants) * 100);
        return percentile;
    }

    getLastUpdatedText() {
        if (!this.leaderboardData || !this.leaderboardData.lastUpdated) {
            return 'Never';
        }

        const lastUpdated = this.leaderboardData.lastUpdated.toDate ? 
            this.leaderboardData.lastUpdated.toDate() : 
            new Date(this.leaderboardData.lastUpdated);
        
        const now = new Date();
        const diffMinutes = Math.floor((now - lastUpdated) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return lastUpdated.toLocaleDateString();
    }

    getLoadingState() {
        return `
            <div class="leaderboard-overview space-y-6">
                <div class="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
                    <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 class="text-lg font-semibold text-white mb-2">Loading Leaderboard</h3>
                    <p class="text-gray-400">Calculating portfolio values and rankings...</p>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (!this.container) return;

        const refreshBtn = this.container.querySelector('#refresh-leaderboard-btn');
        if (refreshBtn && this.onRefresh) {
            refreshBtn.addEventListener('click', async () => {
                await this.handleRefresh();
            });
        }
    }

    async handleRefresh() {
        if (!this.onRefresh) return;

        const refreshText = this.container.querySelector('#refresh-text');
        const refreshLoading = this.container.querySelector('#refresh-loading');
        const refreshBtn = this.container.querySelector('#refresh-leaderboard-btn');

        // Show loading state
        if (refreshText) refreshText.classList.add('hidden');
        if (refreshLoading) refreshLoading.classList.remove('hidden');
        if (refreshBtn) refreshBtn.disabled = true;

        try {
            await this.onRefresh();
        } catch (error) {
            console.error('Error refreshing leaderboard:', error);
        } finally {
            // Reset button state
            if (refreshText) refreshText.classList.remove('hidden');
            if (refreshLoading) refreshLoading.classList.add('hidden');
            if (refreshBtn) refreshBtn.disabled = false;
        }
    }

    // Update data without full re-render
    updateData(newLeaderboardData) {
        this.leaderboardData = newLeaderboardData;
        this.render(this.container, newLeaderboardData, this.currentUserId, this.onRefresh);
    }
}