// src/views/simulation.js
// Basic simulation view - foundation for Session 7
import { SimulationService } from '../services/simulation.js';
import { AuthService } from '../services/auth.js';

export default class SimulationView {
    constructor() {
        this.name = 'simulation';
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.currentSimulation = null;
        this.currentUser = null;
        this.simulationId = null;
    }

    async render(container) {
        // Extract simulation ID from URL parameters (if any)
        const urlParams = new URLSearchParams(window.location.search);
        this.simulationId = urlParams.get('sim');

        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
        
        setTimeout(async () => {
            await this.loadData();
        }, 0);
    }

    getTemplate() {
        return `
            <div class="simulation-view">
                <!-- Loading State -->
                <div id="simulation-loading" class="flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p class="text-gray-400">Loading simulation...</p>
                    </div>
                </div>

                <!-- Simulation Not Found -->
                <div id="simulation-not-found" class="hidden bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 class="text-xl font-semibold text-red-400 mb-2">Simulation Not Found</h2>
                    <p class="text-gray-300 mb-4">The simulation you're looking for doesn't exist or you don't have access to it.</p>
                    <button 
                        data-navigate="/" 
                        class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                    >
                        Return to Dashboard
                    </button>
                </div>

                <!-- Main Simulation Content -->
                <div id="simulation-content" class="hidden">
                    <!-- Simulation Header -->
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
                        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h1 id="sim-name" class="text-3xl font-bold text-white mb-2">Simulation Name</h1>
                                <p id="sim-description" class="text-gray-400">Simulation description will appear here</p>
                                <div class="flex items-center gap-4 mt-3">
                                    <span id="sim-status" class="px-3 py-1 rounded-full text-sm font-semibold bg-green-600 text-white">Active</span>
                                    <span class="text-gray-400 text-sm">•</span>
                                    <span id="sim-participants" class="text-gray-400 text-sm">0/20 participants</span>
                                    <span class="text-gray-400 text-sm">•</span>
                                    <span id="sim-duration" class="text-gray-400 text-sm">Duration info</span>
                                </div>
                            </div>
                            <div class="flex gap-3">
                                <button 
                                    id="view-leaderboard-btn"
                                    class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                    Leaderboard
                                </button>
                                <button 
                                    id="trade-in-sim-btn"
                                    class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                    </svg>
                                    Trade
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Simulation Overview Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <!-- Your Rank -->
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

                        <!-- Portfolio Value -->
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

                        <!-- Days Remaining -->
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

                    <!-- Placeholder for Future Features -->
                    <div class="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 text-center">
                        <div class="text-gray-400 mb-4">
                            <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-300 mb-2">Advanced Features Coming Soon</h3>
                        <p class="text-gray-400 mb-4">Simulation-specific trading, leaderboards, and portfolio management will be available in Sessions 7-9</p>
                        <div class="flex flex-col sm:flex-row gap-3 justify-center">
                            <button 
                                data-navigate="/trade" 
                                class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                            >
                                Trade in Solo Mode
                            </button>
                            <button 
                                data-navigate="/portfolio" 
                                class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                            >
                                View Solo Portfolio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        // Navigation buttons for future features
        const tradeBtn = container.querySelector('#trade-in-sim-btn');
        const leaderboardBtn = container.querySelector('#view-leaderboard-btn');

        if (tradeBtn) {
            tradeBtn.addEventListener('click', () => {
                // For now, just show a placeholder message
                alert('Simulation trading will be available in Session 7!');
            });
        }

        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                // For now, just show a placeholder message
                alert('Leaderboards will be available in Session 9!');
            });
        }
    }

    async loadData() {
        this.currentUser = this.authService.getCurrentUser();
        
        if (!this.currentUser) {
            console.log('No user signed in for simulation view.');
            return;
        }

        if (!this.simulationId) {
            this.showNotFound();
            return;
        }

        try {
            this.simulationService.initialize();
            
            // Load simulation details
            this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            
            if (!this.currentSimulation) {
                this.showNotFound();
                return;
            }

            // Check if user is a member
            const isMember = await this.simulationService.isUserMemberOfSimulation(this.simulationId, this.currentUser.uid);
            
            if (!isMember) {
                this.showNotFound();
                return;
            }

            // Display simulation data
            this.displaySimulation();
            
        } catch (error) {
            console.error('Error loading simulation:', error);
            this.showError();
        }
    }

    displaySimulation() {
        const loadingEl = document.getElementById('simulation-loading');
        const contentEl = document.getElementById('simulation-content');
        
        if (loadingEl) loadingEl.classList.add('hidden');
        if (contentEl) contentEl.classList.remove('hidden');

        // Update header
        const nameEl = document.getElementById('sim-name');
        const descEl = document.getElementById('sim-description');
        const statusEl = document.getElementById('sim-status');
        const participantsEl = document.getElementById('sim-participants');
        const durationEl = document.getElementById('sim-duration');

        if (nameEl) nameEl.textContent = this.currentSimulation.name;
        if (descEl) {
            if (this.currentSimulation.description) {
                descEl.textContent = this.currentSimulation.description;
            } else {
                descEl.style.display = 'none';
            }
        }

        // Status
        if (statusEl) {
            statusEl.textContent = this.currentSimulation.status.charAt(0).toUpperCase() + this.currentSimulation.status.slice(1);
            const statusClass = this.currentSimulation.status === 'active' ? 'bg-green-600 text-white' :
                               this.currentSimulation.status === 'pending' ? 'bg-yellow-600 text-white' :
                               'bg-gray-600 text-gray-300';
            statusEl.className = `px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`;
        }

        // Participants
        if (participantsEl) {
            participantsEl.textContent = `${this.currentSimulation.memberCount}/${this.currentSimulation.maxMembers} participants`;
        }

        // Duration
        if (durationEl) {
            const startDate = this.currentSimulation.startDate.toDate ? this.currentSimulation.startDate.toDate() : new Date(this.currentSimulation.startDate);
            const endDate = this.currentSimulation.endDate.toDate ? this.currentSimulation.endDate.toDate() : new Date(this.currentSimulation.endDate);
            durationEl.textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        }

        // Update stats (placeholder values for now)
        const totalParticipantsEl = document.getElementById('total-participants');
        if (totalParticipantsEl) {
            totalParticipantsEl.textContent = this.currentSimulation.memberCount;
        }

        // Calculate days remaining
        const daysRemainingEl = document.getElementById('days-remaining');
        if (daysRemainingEl) {
            const endDate = this.currentSimulation.endDate.toDate ? this.currentSimulation.endDate.toDate() : new Date(this.currentSimulation.endDate);
            const now = new Date();
            const diffTime = endDate - now;
            const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            daysRemainingEl.textContent = diffDays;
        }

        console.log('Simulation displayed:', this.currentSimulation);
    }

    showNotFound() {
        const loadingEl = document.getElementById('simulation-loading');
        const notFoundEl = document.getElementById('simulation-not-found');
        
        if (loadingEl) loadingEl.classList.add('hidden');
        if (notFoundEl) notFoundEl.classList.remove('hidden');
    }

    showError() {
        const loadingEl = document.getElementById('simulation-loading');
        
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 class="text-xl font-semibold text-red-400 mb-2">Error Loading Simulation</h2>
                    <p class="text-gray-300 mb-4">There was a problem loading the simulation data.</p>
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
}