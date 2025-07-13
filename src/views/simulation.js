// src/views/simulation.js - Enhanced with Leaderboards - Session 9
// Simulation view with member management, activity tracking, and leaderboards
import { SimulationService } from '../services/simulation.js';
import { AuthService } from '../services/auth.js';
import { ActivityService } from '../services/activity.js';
import { LeaderboardService } from '../services/leaderboard.js';
import { LeaderboardOverview } from '../components/simulation/LeaderboardOverview.js';
import { LeaderboardTable } from '../components/simulation/LeaderboardTable.js';
import { getPortfolio, initializePortfolio, getRecentTrades } from '../services/trading.js';

export default class SimulationView {
    constructor() {
        this.name = 'simulation';
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.activityService = new ActivityService();
        this.leaderboardService = new LeaderboardService();
        this.leaderboardOverview = new LeaderboardOverview();
        this.leaderboardTable = new LeaderboardTable();
        this.currentSimulation = null;
        this.currentUser = null;
        this.simulationId = null;
        this.simulationPortfolio = null;
        this.simulationMembers = [];
        this.simulationActivities = [];
        this.leaderboardData = null;
        this.refreshInterval = null;
        this.leaderboardRefreshInterval = null;
    }

    async render(container) {
        // Extract simulation ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.simulationId = urlParams.get('sim');

        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
        
        setTimeout(async () => {
            await this.loadData();
            this.startAutoRefresh();
        }, 0);
    }

    getTemplate() {
        return `
            <div class="simulation-view">
                <div id="simulation-loading" class="flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p class="text-gray-400">Loading simulation...</p>
                    </div>
                </div>

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

                <div id="simulation-content" class="hidden">
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
                                    id="view-members-btn"
                                    class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                    </svg>
                                    <span id="members-btn-text">Members</span>
                                </button>
                                <button 
                                    id="view-leaderboard-btn"
                                    class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                    <span id="leaderboard-btn-text">Leaderboard</span>
                                </button>
                                <button 
                                    id="trade-in-sim-btn"
                                    class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                    </svg>
                                    <span id="trade-btn-text">Trade Now</span>
                                </button>
                            </div>
                        </div>
                    </div>

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

                    <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-8">
                        <div class="flex border-b border-gray-700">
                            <button id="tab-portfolio" class="tab-btn flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 border-b-2 border-cyan-500 text-cyan-400 bg-gray-750">
                                Portfolio & Trades
                            </button>
                            <button id="tab-leaderboard" class="tab-btn flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 border-b-2 border-transparent text-gray-400 hover:text-white">
                                Leaderboard
                            </button>
                            <button id="tab-members" class="tab-btn flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 border-b-2 border-transparent text-gray-400 hover:text-white">
                                Members & Activity
                            </button>
                        </div>

                        <div class="p-6">
                            <div id="content-portfolio" class="tab-content">
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h3 class="text-xl font-semibold text-white mb-4">Current Holdings</h3>
                                        <div id="sim-holdings-container">
                                            <div id="sim-holdings-loading" class="text-center py-4">
                                                <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                <p class="text-gray-400 text-sm">Loading holdings...</p>
                                            </div>
                                            
                                            <div id="sim-holdings-empty" class="text-center py-8 hidden">
                                                <svg class="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                                </svg>
                                                <h4 class="text-lg font-semibold text-gray-300 mb-2">No Holdings Yet</h4>
                                                <p class="text-gray-400 mb-4">Start trading to build your portfolio</p>
                                                <button 
                                                    id="start-trading-btn"
                                                    class="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                                                >
                                                    Start Trading
                                                </button>
                                            </div>
                                            
                                            <div id="sim-holdings-list" class="space-y-3 hidden">
                                                </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 class="text-xl font-semibold text-white mb-4">Recent Trades</h3>
                                        <div id="sim-trades-container">
                                            <div id="sim-trades-loading" class="text-center py-4">
                                                <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                <p class="text-gray-400 text-sm">Loading trades...</p>
                                            </div>
                                            
                                            <div id="sim-trades-empty" class="text-center py-8 hidden">
                                                <svg class="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2-2h10a2 2 0 002 2v12a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                                </svg>
                                                <h4 class="text-lg font-semibold text-gray-300 mb-2">No Trades Yet</h4>
                                                <p class="text-gray-400">Your trading history will appear here</p>
                                            </div>
                                            
                                            <div id="sim-trades-list" class="space-y-3 hidden">
                                                </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="content-leaderboard" class="tab-content hidden">
                                <div id="leaderboard-overview-container">
                                    <!-- Leaderboard Overview Component will be rendered here -->
                                </div>
                                
                                <div id="leaderboard-table-container" class="mt-8">
                                    <!-- Leaderboard Table Component will be rendered here -->
                                </div>
                            </div>

                            <div id="content-members" class="tab-content hidden">
                                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                                    <div>
                                        <h3 class="text-xl font-semibold text-white">Simulation Members</h3>
                                        <p class="text-gray-400 text-sm mt-1">Manage participants and view activity</p>
                                    </div>
                                    <div id="creator-actions" class="hidden">
                                        <button id="manage-members-btn" class="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                            Manage Members
                                        </button>
                                    </div>
                                </div>

                                <div id="members-list-container" class="space-y-4">
                                    <div id="members-loading" class="text-center py-8">
                                        <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p class="text-gray-400">Loading members...</p>
                                    </div>
                                    
                                    <div id="members-list" class="hidden space-y-3">
                                        </div>
                                </div>

                                <div class="mt-8">
                                    <h4 class="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                                    <div id="activity-feed" class="space-y-3">
                                        <div class="text-center py-6 text-gray-400">
                                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                            </svg>
                                            <p>Activity feed loading...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 class="text-xl font-semibold text-white mb-4">Simulation Rules</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span class="text-gray-400">Starting Balance</span>
                                <p id="sim-starting-balance" class="text-white font-medium">$10,000</p>
                            </div>
                            <div>
                                <span class="text-gray-400">Short Selling</span>
                                <p id="sim-short-selling" class="text-white font-medium">Not Allowed</p>
                            </div>
                            <div>
                                <span class="text-gray-400">Trading Hours</span>
                                <p id="sim-trading-hours" class="text-white font-medium">Market Hours</p>
                            </div>
                            <div>
                                <span class="text-gray-400">Commission</span>
                                <p id="sim-commission" class="text-white font-medium">$0 per trade</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        // Trade button
        const tradeBtn = container.querySelector('#trade-in-sim-btn');
        const startTradingBtn = container.querySelector('#start-trading-btn');
        
        [tradeBtn, startTradingBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.handleTradeNavigation());
            }
        });

        // Navigation buttons
        const membersBtn = container.querySelector('#view-members-btn');
        const leaderboardBtn = container.querySelector('#view-leaderboard-btn');
        
        if (membersBtn) {
            membersBtn.addEventListener('click', () => this.showMembersTab());
        }

        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => this.showLeaderboardTab());
        }

        // Tab navigation
        const tabBtns = container.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.id));
        });

        // Member management button
        const manageMembersBtn = container.querySelector('#manage-members-btn');
        if (manageMembersBtn) {
            manageMembersBtn.addEventListener('click', () => this.handleMemberManagement());
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
            // Initialize services
            this.simulationService.initialize();
            this.activityService.initialize();
            this.leaderboardService.initialize();
            
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

            // Load all data in parallel for better performance
            await Promise.all([
                this.loadSimulationMembers(),
                this.loadSimulationActivities(),
                this.loadSimulationPortfolio(),
                this.loadLeaderboard()
            ]);

            // Display simulation data
            this.displaySimulation();
            
        } catch (error) {
            console.error('Error loading simulation:', error);
            this.showError();
        }
    }

    async loadLeaderboard() {
        try {
            console.log('Loading leaderboard...');
            this.leaderboardData = await this.leaderboardService.getLeaderboard(
                this.simulationId, 
                false, // Don't force refresh on initial load
                this.currentSimulation
            );
            
            // Update user rank in header
            this.updateUserRankDisplay();
            
            console.log('Leaderboard loaded:', this.leaderboardData);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Don't fail the entire view if leaderboard fails
        }
    }

    async refreshLeaderboard() {
        try {
            console.log('Refreshing leaderboard...');
            this.leaderboardData = await this.leaderboardService.getLeaderboard(
                this.simulationId, 
                true, // Force refresh
                this.currentSimulation
            );
            
            // Update displays
            this.updateUserRankDisplay();
            this.renderLeaderboardComponents();
            
            console.log('Leaderboard refreshed successfully');
        } catch (error) {
            console.error('Error refreshing leaderboard:', error);
            throw error; // Re-throw so UI can handle error state
        }
    }

    updateUserRankDisplay() {
        if (!this.leaderboardData || !this.currentUser) return;

        const userRanking = this.leaderboardData.rankings?.find(r => r.userId === this.currentUser.uid);
        
        // Update rank in header cards
        const yourRankEl = document.getElementById('your-rank');
        const totalParticipantsEl = document.getElementById('total-participants');
        
        if (yourRankEl && userRanking) {
            yourRankEl.textContent = `#${userRanking.rank}`;
        }
        
        if (totalParticipantsEl && this.leaderboardData.totalParticipants) {
            totalParticipantsEl.textContent = this.leaderboardData.totalParticipants;
        }
    }

    renderLeaderboardComponents() {
        if (!this.leaderboardData) return;

        // Render leaderboard overview
        const overviewContainer = document.getElementById('leaderboard-overview-container');
        if (overviewContainer) {
            this.leaderboardOverview.render(
                overviewContainer,
                this.leaderboardData,
                this.currentUser?.uid,
                () => this.refreshLeaderboard()
            );
        }

        // Render leaderboard table
        const tableContainer = document.getElementById('leaderboard-table-container');
        if (tableContainer && this.leaderboardData.rankings) {
            this.leaderboardTable.render(
                tableContainer,
                this.leaderboardData.rankings,
                this.currentUser?.uid,
                (userId, userName) => {
                    console.log(`View details for user: ${userName}`);
                    // Could show user detail modal here
                }
            );
        }
    }

    async loadSimulationMembers() {
        try {
            this.simulationMembers = await this.simulationService.getSimulationMembers(this.simulationId);
            console.log('Loaded simulation members:', this.simulationMembers);
            this.displayMembers();
        } catch (error) {
            console.error('Error loading simulation members:', error);
            this.showMembersError();
        }
    }

    async loadSimulationActivities() {
        try {
            this.simulationActivities = await this.activityService.getSimulationActivities(this.simulationId, 15);
            console.log('Loaded simulation activities:', this.simulationActivities);
            this.displayActivities();
        } catch (error) {
            console.error('Error loading simulation activities:', error);
            this.showActivitiesError();
        }
    }

    async loadSimulationPortfolio() {
        try {
            // Initialize portfolio if it doesn't exist
            await initializePortfolio(
                this.currentUser.uid, 
                this.currentSimulation.startingBalance, 
                this.simulationId, 
                this.currentSimulation
            );

            // Load portfolio data
            this.simulationPortfolio = await getPortfolio(this.currentUser.uid, this.simulationId);
            
            // Load UI components
            setTimeout(() => {
                this.loadHoldings();
                this.loadRecentTrades();
            }, 0);
            
        } catch (error) {
            console.error('Error loading simulation portfolio:', error);
            this.showPortfolioError();
        }
    }

    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('border-cyan-500', 'text-cyan-400', 'bg-gray-750');
            btn.classList.add('border-transparent', 'text-gray-400');
        });

        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Show selected tab
        const activeBtn = document.getElementById(tabId);
        const contentId = tabId.replace('tab-', 'content-');
        const activeContent = document.getElementById(contentId);

        if (activeBtn) {
            activeBtn.classList.add('border-cyan-500', 'text-cyan-400', 'bg-gray-750');
            activeBtn.classList.remove('border-transparent', 'text-gray-400');
        }

        if (activeContent) {
            activeContent.classList.remove('hidden');
        }

        // Render leaderboard components when tab is shown
        if (tabId === 'tab-leaderboard') {
            this.renderLeaderboardComponents();
        }

        // Update button text based on active tab
        this.updateNavigationButtonText(tabId);
    }

    updateNavigationButtonText(activeTabId) {
        const membersBtnText = document.getElementById('members-btn-text');
        const leaderboardBtnText = document.getElementById('leaderboard-btn-text');
        
        if (membersBtnText && leaderboardBtnText) {
            // Reset to default text
            membersBtnText.textContent = 'Members';
            leaderboardBtnText.textContent = 'Leaderboard';
            
            // Update based on current tab
            if (activeTabId === 'tab-members') {
                membersBtnText.textContent = 'Portfolio';
            } else if (activeTabId === 'tab-leaderboard') {
                leaderboardBtnText.textContent = 'Portfolio';
            }
        }
    }

    showLeaderboardTab() {
        this.switchTab('tab-leaderboard');
    }

    showMembersTab() {
        this.switchTab('tab-members');
    }

    startAutoRefresh() {
        // Refresh member data and activities every 30 seconds
        this.refreshInterval = setInterval(async () => {
            try {
                await Promise.all([
                    this.loadSimulationMembers(),
                    this.loadSimulationActivities()
                ]);
            } catch (error) {
                console.error('Auto-refresh error:', error);
            }
        }, 30000);

        // Refresh leaderboard every 2 minutes (less frequent since it's more expensive)
        this.leaderboardRefreshInterval = setInterval(async () => {
            try {
                await this.loadLeaderboard();
                
                // Re-render if leaderboard tab is active
                const activeTab = document.querySelector('.tab-btn.border-cyan-500');
                if (activeTab && activeTab.id === 'tab-leaderboard') {
                    this.renderLeaderboardComponents();
                }
            } catch (error) {
                console.error('Leaderboard auto-refresh error:', error);
            }
        }, 120000); // 2 minutes
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        if (this.leaderboardRefreshInterval) {
            clearInterval(this.leaderboardRefreshInterval);
            this.leaderboardRefreshInterval = null;
        }
    }

    // Clean up when view is destroyed
    destroy() {
        this.stopAutoRefresh();
    }

    // [Include all the existing methods from the original simulation.js file]
    // displayMembers, createMemberCard, getTimeAgo, isCurrentUserCreator, 
    // handleKickMember, handleMemberManagement, displayActivities, createActivityElement,
    // showActivitiesError, showMembersError, loadHoldings, createHoldingElement,
    // loadRecentTrades, createTradeElement, displaySimulation, updatePortfolioStats,
    // updateSimulationRules, showPortfolioError, handleTradeNavigation, showNotFound, showError

    // [Copy all existing methods here - keeping them exactly the same]
    
    displayMembers() {
        const membersLoading = document.getElementById('members-loading');
        const membersList = document.getElementById('members-list');
        
        if (membersLoading) membersLoading.classList.add('hidden');
        if (membersList) {
            membersList.classList.remove('hidden');
            membersList.innerHTML = '';

            this.simulationMembers.forEach(member => {
                const memberCard = this.createMemberCard(member);
                membersList.appendChild(memberCard);
            });
        }

        // Show creator actions if current user is creator
        const isCreator = this.simulationMembers.some(member => 
            member.userId === this.currentUser.uid && member.role === 'creator'
        );
        
        const creatorActions = document.getElementById('creator-actions');
        if (creatorActions && isCreator) {
            creatorActions.classList.remove('hidden');
        }
    }

    createMemberCard(member) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';

        const joinedDate = member.joinedAt.toDate ? member.joinedAt.toDate() : new Date(member.joinedAt);
        const timeAgo = this.getTimeAgo(joinedDate);

        const roleColor = member.role === 'creator' ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-400 bg-gray-400/10';
        const statusColor = member.status === 'active' ? 'text-green-400' : 'text-red-400';

        memberDiv.innerHTML = `
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
                ${member.userId === this.currentUser.uid ? `
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
                ${this.isCurrentUserCreator() && member.userId !== this.currentUser.uid ? `
                    <button class="kick-member-btn mt-2 text-red-400 hover:text-red-300 text-xs font-medium" data-user-id="${member.userId}" data-user-name="${member.displayName}">
                        Remove
                    </button>
                ` : ''}
            </div>
        `;

        // Attach kick member event listener
        const kickBtn = memberDiv.querySelector('.kick-member-btn');
        if (kickBtn) {
            kickBtn.addEventListener('click', (e) => {
                const userId = e.target.dataset.userId;
                const userName = e.target.dataset.userName;
                this.handleKickMember(userId, userName);
            });
        }

        return memberDiv;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString();
    }

    isCurrentUserCreator() {
        return this.simulationMembers.some(member => 
            member.userId === this.currentUser.uid && member.role === 'creator'
        );
    }

    async handleKickMember(userId, userName) {
        const confirmed = confirm(`Are you sure you want to remove ${userName} from this simulation? This action cannot be undone.`);
        
        if (!confirmed) return;

        try {
            alert(`Feature coming soon: Remove ${userName} from simulation`);
            await this.loadSimulationMembers();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member. Please try again.');
        }
    }

    handleMemberManagement() {
        alert('Advanced member management features coming soon!\n\n• Bulk member actions\n• Member statistics\n• Invitation history\n• Activity logs');
    }

    displayActivities() {
        const activityFeed = document.getElementById('activity-feed');
        
        if (!activityFeed) return;

        if (this.simulationActivities.length === 0) {
            activityFeed.innerHTML = `
                <div class="text-center py-6 text-gray-400">
                    <svg class="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <p>No recent activity</p>
                </div>
            `;
        } else {
            activityFeed.innerHTML = '';
            this.simulationActivities.forEach(activity => {
                const activityElement = this.createActivityElement(activity);
                activityFeed.appendChild(activityElement);
            });
        }
    }

    createActivityElement(activity) {
        const formattedActivity = this.activityService.formatActivity(activity);
        const element = document.createElement('div');
        element.className = 'bg-gray-700 p-4 rounded-lg flex items-start gap-3';
        
        element.innerHTML = `
            <div class="w-10 h-10 ${formattedActivity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-lg">${formattedActivity.icon}</span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-white font-medium">${formattedActivity.title}</p>
                <p class="text-gray-400 text-sm mt-1">${formattedActivity.description}</p>
                <p class="text-gray-500 text-xs mt-2">${formattedActivity.timeAgo}</p>
            </div>
        `;
        
        return element;
    }

    showActivitiesError() {
        const activityFeed = document.getElementById('activity-feed');
        if (activityFeed) {
            activityFeed.innerHTML = `
                <div class="text-center py-6">
                    <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h4 class="text-lg font-semibold text-red-400 mb-2">Error Loading Activities</h4>
                    <p class="text-gray-400">Unable to load recent activity</p>
                </div>
            `;
        }
    }

    showMembersError() {
        const membersLoading = document.getElementById('members-loading');
        const membersList = document.getElementById('members-list');
        
        if (membersLoading) membersLoading.classList.add('hidden');
        if (membersList) {
            membersList.innerHTML = `
                <div class="text-center py-8">
                    <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h4 class="text-lg font-semibold text-red-400 mb-2">Error Loading Members</h4>
                    <p class="text-gray-400">Unable to load member information</p>
                </div>
            `;
            membersList.classList.remove('hidden');
        }
    }

    async loadHoldings() {
        const holdingsLoading = document.getElementById('sim-holdings-loading');
        const holdingsEmpty = document.getElementById('sim-holdings-empty');
        const holdingsList = document.getElementById('sim-holdings-list');

        if (!this.simulationPortfolio || !this.simulationPortfolio.holdings) {
            if (holdingsLoading) holdingsLoading.classList.add('hidden');
            if (holdingsEmpty) holdingsEmpty.classList.remove('hidden');
            if (holdingsList) holdingsList.classList.add('hidden');
            return;
        }

        const holdings = this.simulationPortfolio.holdings;
        
        if (Object.keys(holdings).length === 0) {
            if (holdingsLoading) holdingsLoading.classList.add('hidden');
            if (holdingsEmpty) holdingsEmpty.classList.remove('hidden');
            if (holdingsList) holdingsList.classList.add('hidden');
        } else {
            if (holdingsLoading) holdingsLoading.classList.add('hidden');
            if (holdingsEmpty) holdingsEmpty.classList.add('hidden');
            if (holdingsList) {
                holdingsList.classList.remove('hidden');
                holdingsList.innerHTML = '';

                for (const ticker in holdings) {
                    const holding = holdings[ticker];
                    const holdingElement = this.createHoldingElement(ticker, holding);
                    holdingsList.appendChild(holdingElement);
                }
            }
        }
    }

    createHoldingElement(ticker, holding) {
        const element = document.createElement('div');
        element.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';
        
        const currentValue = holding.quantity * holding.avgPrice;
        
        element.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span class="text-sm font-bold text-cyan-400">${ticker.charAt(0)}</span>
                </div>
                <div>
                    <h4 class="font-semibold text-white">${ticker.toUpperCase()}</h4>
                    <p class="text-sm text-gray-400">${holding.quantity} shares</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-semibold text-white">${currentValue.toLocaleString()}</p>
                <p class="text-sm text-gray-400">@${holding.avgPrice.toFixed(2)}</p>
            </div>
        `;
        
        return element;
    }

    async loadRecentTrades() {
        const tradesLoading = document.getElementById('sim-trades-loading');
        const tradesEmpty = document.getElementById('sim-trades-empty');
        const tradesList = document.getElementById('sim-trades-list');

        try {
            const trades = await getRecentTrades(this.currentUser.uid, 5, this.simulationId);
            
            if (tradesLoading) tradesLoading.classList.add('hidden');
            
            if (trades.length === 0) {
                if (tradesEmpty) tradesEmpty.classList.remove('hidden');
                if (tradesList) tradesList.classList.add('hidden');
            } else {
                if (tradesEmpty) tradesEmpty.classList.add('hidden');
                if (tradesList) {
                    tradesList.classList.remove('hidden');
                    tradesList.innerHTML = '';

                    trades.forEach(trade => {
                        const tradeElement = this.createTradeElement(trade);
                        tradesList.appendChild(tradeElement);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading recent trades:', error);
            if (tradesLoading) tradesLoading.classList.add('hidden');
            if (tradesEmpty) tradesEmpty.classList.remove('hidden');
        }
    }

    createTradeElement(trade) {
        const element = document.createElement('div');
        element.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center';
        
        const tradeTypeClass = trade.type === 'buy' ? 'text-green-400' : 'text-red-400';
        const tradeIcon = trade.type === 'buy' ? '↗' : '↘';
        const tradeTime = new Date(trade.timestamp).toLocaleDateString();
        
        element.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span class="text-sm font-bold text-cyan-400">${trade.ticker.charAt(0)}</span>
                </div>
                <div>
                    <h4 class="font-semibold text-white">
                        <span class="${tradeTypeClass}">${tradeIcon} ${trade.type.toUpperCase()}</span>
                        ${trade.ticker.toUpperCase()}
                    </h4>
                    <p class="text-sm text-gray-400">${trade.quantity} shares • ${tradeTime}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-semibold text-white">${trade.tradeCost.toLocaleString()}</p>
                <p class="text-sm text-gray-400">@${trade.price.toFixed(2)}</p>
            </div>
        `;
        
        return element;
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
        const tradeBtnTextEl = document.getElementById('trade-btn-text');

        if (nameEl) nameEl.textContent = this.currentSimulation.name;
        if (descEl) {
            if (this.currentSimulation.description) {
                descEl.textContent = this.currentSimulation.description;
                descEl.style.display = 'block';
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

        // Update trade button text based on status
        if (tradeBtnTextEl) {
            if (this.currentSimulation.status === 'pending') {
                tradeBtnTextEl.textContent = 'Practice Trade';
            } else if (this.currentSimulation.status === 'active') {
                tradeBtnTextEl.textContent = 'Trade Now';
            } else {
                tradeBtnTextEl.textContent = 'View Portfolio';
            }
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

        // Update portfolio stats
        this.updatePortfolioStats();

        // Update simulation rules
        this.updateSimulationRules();

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

    updatePortfolioStats() {
        if (!this.simulationPortfolio) return;

        const portfolioValueEl = document.getElementById('sim-portfolio-value');
        const portfolioChangeEl = document.getElementById('sim-portfolio-change');
        
        if (portfolioValueEl) {
            const cash = this.simulationPortfolio.cash;
            let holdingsValue = 0;
            
            const holdings = this.simulationPortfolio.holdings || {};
            for (const ticker in holdings) {
                if (holdings.hasOwnProperty(ticker)) {
                    holdingsValue += holdings[ticker].quantity * holdings[ticker].avgPrice;
                }
            }
            
            const totalValue = cash + holdingsValue;
            portfolioValueEl.textContent = `${totalValue.toLocaleString()}`;
            
            if (portfolioChangeEl) {
                const startingBalance = this.currentSimulation.startingBalance;
                const change = totalValue - startingBalance;
                const changePercent = (change / startingBalance * 100);
                
                const changeClass = change >= 0 ? 'text-green-400' : 'text-red-400';
                portfolioChangeEl.className = `text-sm font-medium ${changeClass}`;
                portfolioChangeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
            }
        }
    }

    updateSimulationRules() {
        const startingBalanceEl = document.getElementById('sim-starting-balance');
        const shortSellingEl = document.getElementById('sim-short-selling');
        const tradingHoursEl = document.getElementById('sim-trading-hours');
        const commissionEl = document.getElementById('sim-commission');

        if (startingBalanceEl) {
            startingBalanceEl.textContent = `${this.currentSimulation.startingBalance.toLocaleString()}`;
        }

        if (shortSellingEl) {
            shortSellingEl.textContent = this.currentSimulation.rules?.allowShortSelling ? 'Allowed' : 'Not Allowed';
        }

        if (tradingHoursEl) {
            const hours = this.currentSimulation.rules?.tradingHours === '24/7' ? '24/7' : 'Market Hours';
            tradingHoursEl.textContent = hours;
        }

        if (commissionEl) {
            const commission = this.currentSimulation.rules?.commissionPerTrade || 0;
            commissionEl.textContent = `${commission} per trade`;
        }
    }

    showPortfolioError() {
        const holdingsContainer = document.getElementById('sim-holdings-container');
        const tradesContainer = document.getElementById('sim-trades-container');
        
        const errorContent = `
            <div class="text-center py-8">
                <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h4 class="text-lg font-semibold text-red-400 mb-2">Error Loading Portfolio</h4>
                <p class="text-gray-400">Unable to load portfolio data</p>
            </div>
        `;
        
        if (holdingsContainer) holdingsContainer.innerHTML = errorContent;
        if (tradesContainer) tradesContainer.innerHTML = errorContent;
    }

    handleTradeNavigation() {
        if (!this.simulationId) {
            console.error('No simulation ID available for trading');
            return;
        }

        const tradeBtnTextEl = document.getElementById('trade-btn-text');
        if (tradeBtnTextEl) {
            tradeBtnTextEl.textContent = 'Loading...';
        }

        const tradeUrl = `/trade?sim=${this.simulationId}`;
        
        requestAnimationFrame(() => {
            if (window.app && window.app.router) {
                window.app.router.navigate(tradeUrl);
            } else {
                window.location.href = tradeUrl;
            }
        });
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