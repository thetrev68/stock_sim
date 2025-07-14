// src/views/simulation-archive.js - View archived simulation results
import { SimulationService } from '../services/simulation.js';
import { AuthService } from '../services/auth.js';

export default class SimulationArchiveView {
    constructor() {
        this.name = 'simulation-archive';
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.currentUser = null;
        this.archiveId = null;
        this.archiveData = null;
    }

    async render(container) {
        // Extract archive ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.archiveId = urlParams.get('id');

        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
        
        setTimeout(async () => {
            await this.loadArchiveData();
        }, 0);
    }

    getTemplate() {
        return `
            <div class="simulation-archive-view">
                <div id="archive-loading" class="flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p class="text-gray-400">Loading archived simulation...</p>
                    </div>
                </div>

                <div id="archive-not-found" class="hidden bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 class="text-xl font-semibold text-red-400 mb-2">Archive Not Found</h2>
                    <p class="text-gray-300 mb-4">The archived simulation you're looking for doesn't exist or you don't have access to it.</p>
                    <button 
                        data-navigate="/" 
                        class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                    >
                        Return to Dashboard
                    </button>
                </div>

                <div id="archive-content" class="hidden">
                    <!-- Archive Header -->
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-16 h-16 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-10 4h4m-4 4h4m6-8v8a2 2 0 01-2 2h-2"></path>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h1 id="archive-title" class="text-3xl font-bold text-white">Archived Simulation</h1>
                                    <span class="bg-yellow-600 text-white text-sm font-medium px-3 py-1 rounded-full">ARCHIVED</span>
                                </div>
                                <p id="archive-description" class="text-gray-400">Simulation archive description</p>
                            </div>
                            <div class="flex gap-3">
                                <button id="export-archive-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    Export Results
                                </button>
                                <button 
                                    data-navigate="/" 
                                    class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>

                        <!-- Archive Stats -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-gray-700 p-3 rounded-lg">
                                <p class="text-sm text-gray-400">Duration</p>
                                <p id="archive-duration" class="text-lg font-semibold text-white">0 days</p>
                            </div>
                            <div class="bg-gray-700 p-3 rounded-lg">
                                <p class="text-sm text-gray-400">Participants</p>
                                <p id="archive-participants" class="text-lg font-semibold text-white">0</p>
                            </div>
                            <div class="bg-gray-700 p-3 rounded-lg">
                                <p class="text-sm text-gray-400">Total Trades</p>
                                <p id="archive-trades" class="text-lg font-semibold text-white">0</p>
                            </div>
                            <div class="bg-gray-700 p-3 rounded-lg">
                                <p class="text-sm text-gray-400">Total Volume</p>
                                <p id="archive-volume" class="text-lg font-semibold text-white">$0</p>
                            </div>
                        </div>

                        <!-- End Info -->
                        <div id="end-info" class="mt-4 p-3 bg-orange-900/20 border border-orange-500 rounded-lg hidden">
                            <div class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span class="text-orange-400 font-medium">Ended Early</span>
                                <span class="text-gray-300">•</span>
                                <span id="end-reason" class="text-gray-300">Reason</span>
                            </div>
                        </div>
                    </div>

                    <!-- Winner Spotlight -->
                    <div id="winner-section" class="bg-gradient-to-r from-yellow-900/20 to-yellow-600/20 border border-yellow-500/50 rounded-lg p-6 mb-8">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <span class="text-yellow-900 font-bold text-2xl">👑</span>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-yellow-400 mb-1">Simulation Winner</h2>
                                    <p id="winner-name" class="text-xl font-semibold text-white">Winner Name</p>
                                    <p class="text-gray-300 text-sm">Final Portfolio Value: <span id="winner-value" class="font-medium">$0</span></p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-yellow-400 font-medium">Total Return</p>
                                <p id="winner-return" class="text-3xl font-bold text-white">+$0</p>
                                <p id="winner-percent" class="text-lg text-yellow-300">+0.00%</p>
                            </div>
                        </div>
                    </div>

                    <!-- Final Rankings -->
                    <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
                        <div class="p-6 border-b border-gray-700">
                            <h3 class="text-xl font-semibold text-white">Final Rankings</h3>
                            <p class="text-gray-400 text-sm mt-1">Complete leaderboard at simulation end</p>
                        </div>
                        
                        <div id="rankings-table-container" class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-700">
                                <thead class="bg-gray-750">
                                    <tr>
                                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Rank</th>
                                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Participant</th>
                                        <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Final Value</th>
                                        <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Total Return</th>
                                        <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Return %</th>
                                        <th class="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Trades</th>
                                    </tr>
                                </thead>
                                <tbody id="rankings-tbody" class="divide-y divide-gray-700">
                                    <!-- Rankings will be populated here -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Simulation Details -->
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 class="text-xl font-semibold text-white mb-4">Simulation Details</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <h4 class="text-white font-medium mb-3">Timeline</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Start Date:</span>
                                        <span id="sim-start-date" class="text-white">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">End Date:</span>
                                        <span id="sim-end-date" class="text-white">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Archived:</span>
                                        <span id="archived-date" class="text-white">--</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h4 class="text-white font-medium mb-3">Settings</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Starting Balance:</span>
                                        <span id="starting-balance" class="text-white">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Short Selling:</span>
                                        <span id="short-selling" class="text-white">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Trading Hours:</span>
                                        <span id="trading-hours" class="text-white">--</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 class="text-white font-medium mb-3">Statistics</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Avg Return:</span>
                                        <span id="avg-return" class="text-white">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Best Performer:</span>
                                        <span id="best-return" class="text-white">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Avg Trades/User:</span>
                                        <span id="avg-trades" class="text-white">--</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        const exportBtn = container.querySelector('#export-archive-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.handleExportArchive.bind(this));
        }
    }

    async loadArchiveData() {
        this.currentUser = this.authService.getCurrentUser();
        
        if (!this.currentUser) {
            console.log('No user signed in for archive view.');
            this.showNotFound();
            return;
        }

        if (!this.archiveId) {
            this.showNotFound();
            return;
        }

        try {
            this.simulationService.initialize();
            
            // Load archive data
            this.archiveData = await this.simulationService.getArchivedSimulation(this.archiveId);
            
            if (!this.archiveData) {
                this.showNotFound();
                return;
            }

            // Display the archive
            this.displayArchive();
            
        } catch (error) {
            console.error('Error loading archive:', error);
            this.showError();
        }
    }

    displayArchive() {
        const loadingEl = document.getElementById('archive-loading');
        const contentEl = document.getElementById('archive-content');
        
        if (loadingEl) loadingEl.classList.add('hidden');
        if (contentEl) contentEl.classList.remove('hidden');

        const sim = this.archiveData.originalSimulation;
        const results = this.archiveData.finalResults;

        // Update header
        this.updateElement('archive-title', sim.name);
        this.updateElement('archive-description', sim.description || 'No description provided');

        // Update stats
        this.updateElement('archive-duration', `${this.archiveData.duration || 0} days`);
        this.updateElement('archive-participants', this.archiveData.memberCount);
        this.updateElement('archive-trades', this.archiveData.totalTrades || 0);
        this.updateElement('archive-volume', `$${(this.archiveData.totalVolume || 0).toLocaleString()}`);

        // Show end info if ended early
        if (this.archiveData.endedEarly) {
            const endInfo = document.getElementById('end-info');
            const endReason = document.getElementById('end-reason');
            if (endInfo && endReason) {
                endInfo.classList.remove('hidden');
                endReason.textContent = this.archiveData.endReason || 'No reason provided';
            }
        }

        // Display winner
        if (this.archiveData.winner) {
            this.displayWinner(this.archiveData.winner);
        }

        // Display rankings
        if (results && results.rankings) {
            this.displayRankings(results.rankings);
        }

        // Display simulation details
        this.displaySimulationDetails(sim);

        console.log('Archive displayed:', this.archiveData);
    }

    displayWinner(winner) {
        this.updateElement('winner-name', winner.displayName);
        this.updateElement('winner-value', `$${winner.portfolioValue.toLocaleString()}`);
        
        if (winner.totalReturn !== undefined) {
            this.updateElement('winner-return', `${winner.totalReturn >= 0 ? '+' : ''}$${Math.abs(winner.totalReturn).toLocaleString()}`);
            this.updateElement('winner-percent', `${winner.totalReturnPercent >= 0 ? '+' : ''}${winner.totalReturnPercent.toFixed(2)}%`);
        }
    }

    displayRankings(rankings) {
        const tbody = document.getElementById('rankings-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        rankings.forEach((ranking, index) => {
            const isWinner = index === 0;
            const rankDisplay = this.getRankDisplay(ranking.rank || (index + 1), isWinner);
            
            const totalReturn = ranking.totalReturn || 0;
            const totalReturnPercent = ranking.totalReturnPercent || 0;
            const returnClass = totalReturn >= 0 ? 'text-green-400' : 'text-red-400';
            const returnIcon = totalReturn >= 0 ? '↗' : '↘';

            const row = `
                <tr class="hover:bg-gray-700/50 transition-colors ${isWinner ? 'bg-yellow-900/20' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${rankDisplay}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                                <span class="text-white font-bold text-sm">${ranking.displayName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <p class="text-white font-medium">${ranking.displayName}</p>
                                <p class="text-gray-400 text-sm">${ranking.email}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                        <div class="text-white font-semibold">$${ranking.portfolioValue.toLocaleString()}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                        <div class="${returnClass} font-semibold">
                            ${returnIcon} $${Math.abs(totalReturn).toLocaleString()}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                        <div class="${returnClass} font-semibold">
                            ${totalReturnPercent >= 0 ? '+' : ''}${totalReturnPercent.toFixed(2)}%
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                        <div class="text-white">${ranking.totalTrades || 0}</div>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }

    getRankDisplay(rank, isWinner) {
        if (isWinner) {
            return `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                        <span class="text-yellow-900 font-bold text-sm">👑</span>
                    </div>
                    <span class="text-yellow-400 font-bold text-lg">#1</span>
                </div>
            `;
        }
        
        return `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                    <span class="text-gray-300 font-bold text-sm">${rank}</span>
                </div>
                <span class="text-gray-300 font-semibold text-lg">#${rank}</span>
            </div>
        `;
    }

    displaySimulationDetails(sim) {
        // Timeline
        const startDate = sim.startDate.toDate ? sim.startDate.toDate() : new Date(sim.startDate);
        const endDate = sim.endDate.toDate ? sim.endDate.toDate() : new Date(sim.endDate);
        const archivedDate = this.archiveData.archivedAt.toDate ? this.archiveData.archivedAt.toDate() : new Date(this.archiveData.archivedAt);

        this.updateElement('sim-start-date', startDate.toLocaleDateString());
        this.updateElement('sim-end-date', endDate.toLocaleDateString());
        this.updateElement('archived-date', archivedDate.toLocaleDateString());

        // Settings
        this.updateElement('starting-balance', `$${sim.startingBalance.toLocaleString()}`);
        this.updateElement('short-selling', sim.rules?.allowShortSelling ? 'Allowed' : 'Not Allowed');
        this.updateElement('trading-hours', sim.rules?.tradingHours === '24/7' ? '24/7' : 'Market Hours');

        // Statistics
        if (this.archiveData.finalResults) {
            this.updateElement('avg-return', `${(this.archiveData.finalResults.averageReturn || 0).toFixed(2)}%`);
            
            const bestPerformer = this.archiveData.finalResults.rankings?.[0];
            if (bestPerformer) {
                this.updateElement('best-return', `${(bestPerformer.totalReturnPercent || 0).toFixed(2)}%`);
            }
            
            const avgTrades = this.archiveData.memberCount > 0 ? 
                Math.round((this.archiveData.totalTrades || 0) / this.archiveData.memberCount) : 0;
            this.updateElement('avg-trades', avgTrades);
        }
    }

    async handleExportArchive() {
        try {
            const exportBtn = document.getElementById('export-archive-btn');
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = `
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Exporting...
                `;
            }

            // Generate export data
            const exportData = this.simulationService.generateSimulationExport(this.archiveData);

            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.archiveData.originalSimulation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_archive_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showTemporaryMessage('Archive exported successfully!', 'success');

        } catch (error) {
            console.error('Error exporting archive:', error);
            this.showTemporaryMessage(`Failed to export archive: ${error.message}`, 'error');
        } finally {
            const exportBtn = document.getElementById('export-archive-btn');
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export Results
                `;
            }
        }
    }

    showNotFound() {
        const loadingEl = document.getElementById('archive-loading');
        const notFoundEl = document.getElementById('archive-not-found');
        
        if (loadingEl) loadingEl.classList.add('hidden');
        if (notFoundEl) notFoundEl.classList.remove('hidden');
    }

    showError() {
        const loadingEl = document.getElementById('archive-loading');
        
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 class="text-xl font-semibold text-red-400 mb-2">Error Loading Archive</h2>
                    <p class="text-gray-300 mb-4">There was a problem loading the archive data.</p>
                    <button 
                        onclick="location.reload()" 
                        class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                    >
                        Retry
                    </button>
                </div>
            `;
        }
    }

    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    showTemporaryMessage(message, type = 'info') {
        const colorClasses = {
            success: 'bg-green-900/20 border-green-500 text-green-400',
            error: 'bg-red-900/20 border-red-500 text-red-400',
            info: 'bg-blue-900/20 border-blue-500 text-blue-400'
        };

        const messageHTML = `
            <div id="temp-message" class="fixed top-4 right-4 ${colorClasses[type]} border rounded-lg p-4 z-50 max-w-sm">
                <div class="flex items-center gap-3">
                    <div class="flex-1">
                        <p class="font-medium">${message}</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="text-current opacity-70 hover:opacity-100">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        const existingMessage = document.getElementById('temp-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        document.body.insertAdjacentHTML('beforeend', messageHTML);

        setTimeout(() => {
            document.getElementById('temp-message')?.remove();
        }, 5000);
    }
}