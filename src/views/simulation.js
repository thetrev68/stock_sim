// src/views/simulation.js - Enhanced with Leaderboards - Session 9
// Simulation view with member management, activity tracking, and leaderboards
import { SimulationService } from '../services/simulation.js';
import { AuthService } from '../services/auth.js';
import { ActivityService } from '../services/activity.js';
import { LeaderboardService } from '../services/leaderboard.js';
import { LeaderboardOverview } from '../components/simulation/LeaderboardOverview.js';
import { LeaderboardTable } from '../components/simulation/LeaderboardTable.js';
import { getPortfolio, initializePortfolio, getRecentTrades } from '../services/trading.js';
import { REFRESH_INTERVALS } from '../constants/app-config.js';
import { SIMULATION_STATUS, STATUS_CONFIG, MEMBER_STATUS } from '../constants/simulation-status.js';
import { TRADE_TYPES, TRADE_TYPE_CONFIG } from '../constants/trade-types.js';
import { LOADING_MESSAGES } from '../constants/ui-messages.js';
import { SUCCESS_MESSAGES, INFO_MESSAGES } from '../constants/ui-messages.js';
import { 
    convertFirebaseDate, 
    formatDateRange, 
    calculateDaysRemaining, 
    calculateDaysUntilStart,
    calculateDaysElapsed,
    calculateTotalDuration,
    calculateDaysAgo,
    getTimeAgo,
    getTimeAgoCompact,
    formatNewsDate,
    getTomorrowISO,
    filterByDateRange,
    sortByDateDesc
} from '../utils/date-utils.js';
import { 
    formatCurrencyWithCommas,
    formatCashPercentage,
    formatPortfolioChange,
    calculateGainLoss,
    formatPrice,
    formatNumberWithCommas,
    formatGainLoss,
    calculateMarketValue,
    calculateCostBasis,
    getTradeTypeColorClass
} from '../utils/currency-utils.js';

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
                        <p class="text-gray-400">${LOADING_MESSAGES.SIMULATION}</p>
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
                                    <div id="creator-actions" class="hidden"> <button id="manage-members-btn" class="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                            </svg>
                                            Manage Members
                                        </button>
                                        <button id="simulation-settings-btn" class="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                            Settings
                                        </button>
                                    </div>
                                </div>

                                <div id="members-list-container" class="space-y-4">
                                    <div id="members-loading" class="text-center py-8">
                                        <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p class="text-gray-400">${LOADING_MESSAGES.MEMBERS}</p>
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
                                            <p>${LOADING_MESSAGES.ACTIVITIES}</p>
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

        // Add this after the existing manageMembersBtn event listener
        const settingsBtn = container.querySelector('#simulation-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.handleSimulationSettings());
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
            
            // Load simulation details with status refresh
            this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            
            if (!this.currentSimulation) {
                this.showNotFound();
                return;
            }

            // PHASE 3 FIX: Force refresh status to fix sync issues
            try {
                const statusRefresh = await this.simulationService.refreshSimulationStatus(this.simulationId);
                if (statusRefresh.updated) {
                    console.log('Status was updated during load:', statusRefresh);
                    // Reload simulation with fresh status
                    this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
                }
            } catch (error) {
                console.warn('Could not refresh simulation status:', error);
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
            
            // PHASE 3 ADDITION: Check if simulation should be archived
            if (this.currentSimulation.status === SIMULATION_STATUS.ENDED && !this.currentSimulation.archived) {
                this.showArchivePrompt();
            }
            
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
        }, REFRESH_INTERVALS.SIMULATION_DATA);

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
        }, REFRESH_INTERVALS.LEADERBOARD);
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
        const timeAgo = getTimeAgo(joinedDate);

        const roleColor = member.role === 'creator' ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-400 bg-gray-400/10';
        const statusColor = member.status === MEMBER_STATUS.ACTIVE ? 'text-green-400' : 'text-red-400';

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

    isCurrentUserCreator() {
        return this.simulationMembers.some(member => 
            member.userId === this.currentUser.uid && member.role === 'creator'
        );
    }

    async handleKickMember(userId, userName) {
        const confirmed = confirm(`Are you sure you want to remove ${userName} from this simulation?\n\nThis will:\n• Remove them from the leaderboard\n• Preserve their trading history\n• Prevent them from rejoining\n\nThis action cannot be undone.`);
        
        if (!confirmed) return;

        try {
            // Show loading state
            const kickButtons = document.querySelectorAll(`[data-user-id="${userId}"]`);
            kickButtons.forEach(btn => {
                btn.disabled = true;
                btn.textContent = 'Removing...';
            });

            // Remove member via simulation service
            await this.simulationService.removeMemberFromSimulation(
                this.simulationId, 
                userId, 
                this.currentUser.uid
            );

            // Show success message
            this.showTemporaryMessage(`${userName} has been removed from the simulation.`, 'success');

            // Reload member data
            await this.loadSimulationMembers();
            
            // Also reload leaderboard since member count changed
            await this.loadLeaderboard();

        } catch (error) {
            console.error('Error removing member:', error);
            
            // Reset button states
            const kickButtons = document.querySelectorAll(`[data-user-id="${userId}"]`);
            kickButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = 'Remove';
            });
            
            // Show error message
            this.showTemporaryMessage(`Failed to remove ${userName}: ${error.message}`, 'error');
        }
    }

    async handleMemberManagement() {
        try {
            // Load detailed member statistics
            const memberStats = await this.simulationService.getMemberStatistics(
                this.simulationId, 
                this.currentUser.uid
            );

            this.showMemberManagementModal(memberStats);

        } catch (error) {
            console.error('Error loading member statistics:', error);
            alert(`Failed to load member management: ${error.message}`);
        }
    }

    showMemberManagementModal(memberStats) {
        // Remove existing modal if any
        const existingModal = document.getElementById('member-management-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const activeMemberCount = memberStats.filter(m => m.status === MEMBER_STATUS.ACTIVE).length;
        const removedMemberCount = memberStats.filter(m => m.status === MEMBER_STATUS.REMOVED).length;

        const modalHTML = `
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
                                    ${memberStats.filter(m => m.status === MEMBER_STATUS.ACTIVE).map(member => `
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
                                                ${member.userId !== this.currentUser.uid ? `
                                                    <button class="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 rounded border border-red-500 hover:bg-red-500/10 transition" onclick="window.app.router.currentView.handleKickMember('${member.userId}', '${member.displayName}')">
                                                        Remove
                                                    </button>
                                                ` : '<span class="text-cyan-400 text-xs font-medium">You</span>'}
                                            </div>
                                            <div class="grid grid-cols-3 gap-2 mt-3 text-xs">
                                                <div>
                                                    <span class="text-gray-500">Portfolio</span>
                                                    <p class="text-white font-medium">${formatCurrencyWithCommas(member.portfolioValue)}</p>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500">Trades</span>
                                                    <p class="text-white font-medium">${member.totalTrades}</p>
                                                </div>
                                                <div>
                                                    <span class="text-gray-500">Holdings</span>
                                                    <p class="text-white font-medium">${member.holdingsCount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Removed Members -->
                            <div>
                                <h3 class="text-lg font-semibold text-white mb-4">Removed Members (${removedMemberCount})</h3>
                                ${removedMemberCount > 0 ? `
                                    <div class="space-y-3">
                                        ${memberStats.filter(m => m.status === MEMBER_STATUS.REMOVED).map(member => `
                                            <div class="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                                        <span class="text-gray-400 font-bold text-sm">${member.displayName.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <h4 class="text-gray-300 font-medium">${member.displayName}</h4>
                                                        <p class="text-gray-500 text-sm">Removed ${member.removedAt ? new Date(member.removedAt.toDate()).toLocaleDateString() : 'recently'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
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

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Attach event listeners
        document.getElementById('close-management-modal')?.addEventListener('click', () => {
            document.getElementById('member-management-modal')?.remove();
        });
        
        document.getElementById('close-management-modal-btn')?.addEventListener('click', () => {
            document.getElementById('member-management-modal')?.remove();
        });

        // Close on outside click
        document.getElementById('member-management-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'member-management-modal') {
                e.target.remove();
            }
        });
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
                <p class="font-semibold text-white">${formatCurrencyWithCommas(currentValue)}</p>
                <p class="text-sm text-gray-400">@${formatPrice(holding.avgPrice)}</p>
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
        
        const tradeConfig = TRADE_TYPE_CONFIG[trade.type];
        const tradeTypeClass = tradeConfig?.color || 'text-gray-400';
        const tradeIcon = tradeConfig?.icon || '•';
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
                <p class="font-semibold text-white">${formatCurrencyWithCommas(trade.tradeCost)}</p>
                <p class="text-sm text-gray-400">@${formatPrice(trade.price)}</p>
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
            const statusClass = this.currentSimulation.status === SIMULATION_STATUS.ACTIVE ? 'bg-green-600 text-white' :
                               this.currentSimulation.status === SIMULATION_STATUS.PENDING ? 'bg-yellow-600 text-white' :
                               'bg-gray-600 text-gray-300';
            statusEl.className = `px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`;
        }

        // Update trade button text based on status
        if (tradeBtnTextEl) {
            if (this.currentSimulation.status === SIMULATION_STATUS.PENDING) {
                tradeBtnTextEl.textContent = 'Practice Trade';
            } else if (this.currentSimulation.status === SIMULATION_STATUS.ACTIVE) {
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
           durationEl.textContent = formatDateRange(this.currentSimulation.startDate, this.currentSimulation.endDate);
        }

        // Update portfolio stats
        this.updatePortfolioStats();

        // Update simulation rules
        this.updateSimulationRules();

        // Calculate days remaining
        const daysRemainingEl = document.getElementById('days-remaining');
        if (daysRemainingEl) {
            const diffDays = calculateDaysRemaining(this.currentSimulation.endDate);
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
            portfolioValueEl.textContent = formatCurrencyWithCommas(totalValue);
            
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
            startingBalanceEl.textContent = formatCurrencyWithCommas(this.currentSimulation.startingBalance);
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

    showTemporaryMessage(message, type = 'info') {
        // Remove existing message if any
        const existingMessage = document.getElementById('temp-message');
        if (existingMessage) {
            existingMessage.remove();
        }

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

        document.body.insertAdjacentHTML('beforeend', messageHTML);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            document.getElementById('temp-message')?.remove();
        }, 5000);
    }

    async handleSimulationSettings() {
        try {
            // Load management statistics
            const managementStats = await this.simulationService.getSimulationManagementStats(
                this.simulationId, 
                this.currentUser.uid
            );

            this.showSimulationSettingsModal(managementStats);

        } catch (error) {
            console.error('Error loading simulation settings:', error);
            this.showTemporaryMessage(`Failed to load settings: ${error.message}`, 'error');
        }
    }

    showSimulationSettingsModal(stats) {
        // Remove existing modal if any
        const existingModal = document.getElementById('simulation-settings-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const simulation = stats.simulation;
        const canModifyRules = simulation.status === SIMULATION_STATUS.PENDING;
        const isActive = simulation.status === SIMULATION_STATUS.ACTIVE;
        const isEnded = simulation.status === SIMULATION_STATUS.ENDED;

        const modalHTML = `
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
                                    >${simulation.description || ''}</textarea>
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
                                            <span class="text-white">${convertFirebaseDate(simulation.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-400">End Date:</span>
                                            <span class="text-white">${convertFirebaseDate(simulation.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-400">Duration:</span>
                                            <span class="text-white">${stats.timeline.totalDuration} days</span>
                                        </div>
                                        ${stats.timeline.wasExtended ? `
                                            <div class="flex justify-between">
                                                <span class="text-gray-400">Original End:</span>
                                                <span class="text-yellow-400">${convertFirebaseDate(simulation.originalEndDate).toLocaleDateString()}</span>
                                            </div>
                                        ` : ''}
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
                                                    min="${getTomorrowISO()}"
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
                                            ${simulation.endedEarly ? '<p class="text-sm">Ended early by admin</p>' : ''}
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
                                            <input type="checkbox" id="short-selling-toggle" ${simulation.rules?.allowShortSelling ? 'checked' : ''} class="sr-only peer">
                                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                        </label>
                                    </div>

                                    <div class="p-4 bg-gray-700 rounded-lg">
                                        <h4 class="text-white font-medium mb-3">Trading Hours</h4>
                                        <div class="space-y-2">
                                            <label class="flex items-center">
                                                <input type="radio" name="trading-hours" value="market" ${simulation.rules?.tradingHours !== '24/7' ? 'checked' : ''} class="w-4 h-4 text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500">
                                                <span class="ml-3 text-white">Market Hours Only</span>
                                            </label>
                                            <label class="flex items-center">
                                                <input type="radio" name="trading-hours" value="24/7" ${simulation.rules?.tradingHours === '24/7' ? 'checked' : ''} class="w-4 h-4 text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500">
                                                <span class="ml-3 text-white">24/7 Trading</span>
                                            </label>
                                        </div>
                                    </div>

                                    <button type="button" id="save-rules" class="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                        Save Rule Changes
                                    </button>
                                </div>
                            </div>
                        ` : ''}
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

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Attach all event listeners
        this.attachSettingsModalListeners(stats);
    }

    attachSettingsModalListeners(stats) {
        const modal = document.getElementById('simulation-settings-modal');
        
        // Close modal handlers
        document.getElementById('close-settings-modal')?.addEventListener('click', () => {
            modal?.remove();
        });
        
        document.getElementById('close-settings-modal-btn')?.addEventListener('click', () => {
            modal?.remove();
        });

        // Close on outside click
        modal?.addEventListener('click', (e) => {
            if (e.target.id === 'simulation-settings-modal') {
                modal.remove();
            }
        });

        // Save basic settings
        document.getElementById('save-basic-settings')?.addEventListener('click', async () => {
            await this.handleSaveBasicSettings(stats.simulation);
        });

        // Reset basic settings
        document.getElementById('reset-basic-settings')?.addEventListener('click', () => {
            document.getElementById('sim-name-input').value = stats.simulation.name;
            document.getElementById('max-members-input').value = stats.simulation.maxMembers;
            document.getElementById('sim-description-input').value = stats.simulation.description || '';
        });

        // Extend simulation
        document.getElementById('extend-simulation')?.addEventListener('click', async () => {
            await this.handleExtendSimulation();
        });

        // End simulation early
        document.getElementById('end-simulation')?.addEventListener('click', async () => {
            await this.handleEndSimulation();
        });

        // Save rules (if available)
        document.getElementById('save-rules')?.addEventListener('click', async () => {
            await this.handleSaveRules(stats.simulation);
        });
        }

        async handleSaveBasicSettings(originalSimulation) {
        const nameInput = document.getElementById('sim-name-input');
        const maxMembersInput = document.getElementById('max-members-input');
        const descriptionInput = document.getElementById('sim-description-input');
        
        const settings = {
            name: nameInput.value.trim(),
            maxMembers: parseInt(maxMembersInput.value),
            description: descriptionInput.value.trim()
        };

        if (!settings.name) {
            this.showTemporaryMessage('Simulation name cannot be empty', 'error');
            return;
        }

        try {
            const saveBtn = document.getElementById('save-basic-settings');
            saveBtn.disabled = true;
            saveBtn.textContent = INFO_MESSAGES.SAVING_SETTINGS;

            const result = await this.simulationService.updateSimulationSettings(
                this.simulationId,
                this.currentUser.uid,
                settings
            );

            if (result.success) {
                this.showTemporaryMessage(SUCCESS_MESSAGES.SETTINGS_UPDATED, 'success');
                
                // Update local simulation data
                this.currentSimulation.name = settings.name;
                this.currentSimulation.maxMembers = settings.maxMembers;
                this.currentSimulation.description = settings.description;
                
                // Update the main simulation display
                this.displaySimulation();
                
                if (result.changes.length > 0) {
                    console.log('Settings changes applied:', result.changes);
                }
            }

        } catch (error) {
            console.error('Error saving basic settings:', error);
            this.showTemporaryMessage(`Failed to save settings: ${error.message}`, 'error');
        } finally {
            const saveBtn = document.getElementById('save-basic-settings');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Changes';
            }
        }
        }

        async handleExtendSimulation() {
        const newEndDateInput = document.getElementById('new-end-date');
        const newEndDate = newEndDateInput.value;

        if (!newEndDate) {
            this.showTemporaryMessage('Please select a new end date', 'error');
            return;
        }

        const confirmMessage = `Extend simulation until ${new Date(newEndDate).toLocaleDateString()}?\n\nThis will:\n• Give participants more time to trade\n• Update the leaderboard timeline\n• Notify all members\n\nContinue?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        const reason = prompt('Optional: Reason for extension (will be visible to participants):') || 'Extended by admin';

        try {
            const extendBtn = document.getElementById('extend-simulation');
            extendBtn.disabled = true;
            extendBtn.textContent = 'Extending...';

            await this.simulationService.extendSimulation(
                this.simulationId,
                this.currentUser.uid,
                newEndDate,
                reason
            );

            this.showTemporaryMessage('Simulation extended successfully!', 'success');
            
            // Reload simulation data
            this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            this.displaySimulation();
            
            // Close modal and refresh
            document.getElementById('simulation-settings-modal')?.remove();

        } catch (error) {
            console.error('Error extending simulation:', error);
            this.showTemporaryMessage(`Failed to extend simulation: ${error.message}`, 'error');
        } finally {
            const extendBtn = document.getElementById('extend-simulation');
            if (extendBtn) {
                extendBtn.disabled = false;
                extendBtn.textContent = 'Extend Simulation';
            }
        }
        }

        async handleEndSimulation() {
            const confirmMessage = `End this simulation immediately?\n\n⚠️ WARNING: This action cannot be undone!\n\nThis will:\n• Stop all trading immediately\n• Finalize the leaderboard\n• Archive all results\n• Notify all participants\n\nAre you absolutely sure?`;
            
            if (!confirm(confirmMessage)) {
                return;
            }

            const reason = prompt('Reason for ending early (required - will be visible to all participants):');
            
            if (!reason || reason.trim() === '') {
                this.showTemporaryMessage('Reason is required to end simulation early', 'error');
                return;
            }

            try {
                const endBtn = document.getElementById('end-simulation');
                endBtn.disabled = true;
                endBtn.textContent = 'Ending Simulation...';

                console.log('Calling endSimulationEarly...');
                
                await this.simulationService.endSimulationEarly(
                    this.simulationId,
                    this.currentUser.uid,
                    reason.trim()
                );

                console.log('endSimulationEarly completed, refreshing view...');

                this.showTemporaryMessage('Simulation ended successfully', 'success');
                
                // Close modal first
                document.getElementById('simulation-settings-modal')?.remove();
                
                // Force complete reload of simulation data
                console.log('Forcing simulation data reload...');
                await this.forceReloadSimulationData();
                
                // Show final results message
                setTimeout(() => {
                    this.showTemporaryMessage('Simulation has ended. Final results are now available.', 'info');
                }, 1000);

            } catch (error) {
                console.error('Error ending simulation:', error);
                this.showTemporaryMessage(`Failed to end simulation: ${error.message}`, 'error');
            } finally {
                const endBtn = document.getElementById('end-simulation');
                if (endBtn) {
                    endBtn.disabled = false;
                    endBtn.textContent = 'End Simulation Early';
                }
            }
        }

        async handleSaveRules(originalSimulation) {
        const allowShortSelling = document.getElementById('short-selling-toggle')?.checked || false;
        const tradingHours = document.querySelector('input[name="trading-hours"]:checked')?.value || 'market';

        const rules = {
            allowShortSelling,
            tradingHours,
            commissionPerTrade: originalSimulation.rules?.commissionPerTrade || 0
        };

        try {
            const saveBtn = document.getElementById('save-rules');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving Rules...';

            const result = await this.simulationService.updateSimulationSettings(
                this.simulationId,
                this.currentUser.uid,
                { rules }
            );

            if (result.success) {
                this.showTemporaryMessage('Trading rules updated successfully', 'success');
                
                // Update local simulation data
                this.currentSimulation.rules = rules;
                this.updateSimulationRules();
            }

        } catch (error) {
            console.error('Error saving rules:', error);
            this.showTemporaryMessage(`Failed to save rules: ${error.message}`, 'error');
        } finally {
            const saveBtn = document.getElementById('save-rules');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Rule Changes';
            }
        }

        // Add these at the end of the attachSettingsModalListeners method:

        // Export results
        document.getElementById('export-results')?.addEventListener('click', async () => {
            await this.handleExportResults();
        });

        // Archive from settings modal
        document.getElementById('archive-simulation')?.addEventListener('click', async () => {
            document.getElementById('simulation-settings-modal')?.remove();
            await this.handleArchiveSimulation();
        });
    }

    showArchivePrompt() {
        // Only show to creators
        const isCreator = this.simulationMembers.some(member => 
            member.userId === this.currentUser.uid && member.role === 'creator'
        );
        
        if (!isCreator) return;

        // Show archive suggestion banner
        const existingBanner = document.getElementById('archive-banner');
        if (existingBanner) return; // Don't show multiple times

        const bannerHTML = `
            <div id="archive-banner" class="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-10 4h4m-4 4h4m6-8v8a2 2 0 01-2 2h-2"></path>
                            </svg>
                        </div>
                        <div>
                            <h4 class="text-yellow-400 font-semibold">Simulation Complete - Archive Results?</h4>
                            <p class="text-gray-300 text-sm">Archive this simulation to preserve final rankings and make results downloadable.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="archive-now-btn" class="bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                            Archive Now
                        </button>
                        <button id="dismiss-archive-btn" class="text-gray-400 hover:text-white transition-colors p-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insert banner at top of simulation content
        const simulationContent = document.getElementById('simulation-content');
        if (simulationContent) {
            simulationContent.insertAdjacentHTML('afterbegin', bannerHTML);

            // Attach event listeners
            document.getElementById('archive-now-btn')?.addEventListener('click', () => {
                this.handleArchiveSimulation();
            });

            document.getElementById('dismiss-archive-btn')?.addEventListener('click', () => {
                document.getElementById('archive-banner')?.remove();
            });
        }
    }

    async handleArchiveSimulation() {
        const confirmed = confirm(`Archive this simulation?\n\nThis will:\n• Preserve all final results permanently\n• Generate downloadable reports\n• Add to simulation history\n• Free up active simulation space\n\nArchive results cannot be modified after creation.\n\nContinue?`);
        
        if (!confirmed) return;

        try {
            const archiveBtn = document.getElementById('archive-now-btn');
            if (archiveBtn) {
                archiveBtn.disabled = true;
                archiveBtn.textContent = 'Archiving...';
            }

            // Archive the simulation with current leaderboard
            const result = await this.simulationService.archiveSimulation(
                this.simulationId,
                this.currentUser.uid,
                this.leaderboardData
            );

            if (result.success) {
                this.showTemporaryMessage('Simulation archived successfully!', 'success');
                
                // Update local simulation data
                this.currentSimulation.archived = true;
                this.currentSimulation.archiveId = result.archiveId;
                
                // Remove archive banner
                document.getElementById('archive-banner')?.remove();
                
                // Show archive access info
                this.showArchiveSuccessInfo(result.archiveId);
            }

        } catch (error) {
            console.error('Error archiving simulation:', error);
            this.showTemporaryMessage(`Failed to archive simulation: ${error.message}`, 'error');
        } finally {
            const archiveBtn = document.getElementById('archive-now-btn');
            if (archiveBtn) {
                archiveBtn.disabled = false;
                archiveBtn.textContent = 'Archive Now';
            }
        }
    }

    showArchiveSuccessInfo(archiveId) {
        const infoHTML = `
            <div id="archive-success-banner" class="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div>
                            <h4 class="text-green-400 font-semibold">Simulation Archived Successfully!</h4>
                            <p class="text-gray-300 text-sm">Results are now preserved and available in your simulation history.</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="view-archive-btn" class="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm" data-archive-id="${archiveId}">
                            View Archive
                        </button>
                        <button id="dismiss-success-btn" class="text-gray-400 hover:text-white transition-colors p-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const simulationContent = document.getElementById('simulation-content');
        if (simulationContent) {
            simulationContent.insertAdjacentHTML('afterbegin', infoHTML);

            // Attach event listeners
            document.getElementById('view-archive-btn')?.addEventListener('click', (e) => {
                const archiveId = e.target.dataset.archiveId;
                this.navigateToArchive(archiveId);
            });

            document.getElementById('dismiss-success-btn')?.addEventListener('click', () => {
                document.getElementById('archive-success-banner')?.remove();
            });

            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                document.getElementById('archive-success-banner')?.remove();
            }, 10000);
        }
    }

    navigateToArchive(archiveId) {
        const archiveUrl = `/simulation/archive?id=${archiveId}`;
        
        if (window.app && window.app.router) {
            window.app.router.navigate(archiveUrl);
        } else {
            window.location.href = archiveUrl;
        }
    }

    async handleExportResults() {
        try {
            const exportBtn = document.getElementById('export-results');
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = `
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating Export...
                `;
            }

            // Create mock archive data for export
            const exportData = this.simulationService.generateSimulationExport({
                originalSimulation: this.currentSimulation,
                finalResults: this.leaderboardData,
                memberCount: this.simulationMembers.length,
                totalTrades: this.leaderboardData?.rankings?.reduce((sum, r) => sum + (r.totalTrades || 0), 0) || 0,
                totalVolume: this.leaderboardData?.rankings?.reduce((sum, r) => sum + (r.totalVolume || 0), 0) || 0,
                winner: this.leaderboardData?.rankings?.[0] || null,
                duration: this.currentSimulation.endDate && this.currentSimulation.startDate ? 
                    Math.ceil((this.currentSimulation.endDate.toDate() - this.currentSimulation.startDate.toDate()) / (1000 * 60 * 60 * 24)) : 0,
                endedEarly: this.currentSimulation.endedEarly || false,
                endReason: this.currentSimulation.endReason || null
            });

            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentSimulation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showTemporaryMessage('Results exported successfully!', 'success');

        } catch (error) {
            console.error('Error exporting results:', error);
            this.showTemporaryMessage(`Failed to export results: ${error.message}`, 'error');
        } finally {
            const exportBtn = document.getElementById('export-results');
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download Results (JSON)
                `;
            }
        }
    }

    async forceReloadSimulationData() {
        try {
            console.log('Force reloading simulation data...');
            
            // Clear any caches if they exist
            if (this.simulationService.clearCache) {
                this.simulationService.clearCache();
            }
            
            // Force refresh simulation status first
            console.log('Refreshing simulation status...');
            const statusRefresh = await this.simulationService.refreshSimulationStatus(this.simulationId);
            console.log('Status refresh result:', statusRefresh);
            
            // Reload simulation with fresh data
            console.log('Reloading simulation details...');
            this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            console.log('Current simulation after reload:', {
                id: this.currentSimulation.id,
                status: this.currentSimulation.status,
                endedEarly: this.currentSimulation.endedEarly,
                endReason: this.currentSimulation.endReason
            });
            
            // Reload all data components
            console.log('Reloading all data components...');
            await Promise.all([
                this.loadSimulationMembers(),
                this.loadSimulationActivities(),
                this.loadSimulationPortfolio(),
                this.loadLeaderboard()
            ]);
            
            // Update the display
            console.log('Updating display...');
            this.displaySimulation();
            
            // Check if archive prompt should be shown
            if (this.currentSimulation.status === SIMULATION_STATUS.ENDED && !this.currentSimulation.archived) {
                console.log('Showing archive prompt...');
                this.showArchivePrompt();
            }
            
            console.log('Force reload completed successfully');
            
        } catch (error) {
            console.error('Error during force reload:', error);
            this.showTemporaryMessage('Warning: Some data may not have refreshed properly', 'error');
        }
    }

    // TEMPORARY DEBUG METHOD - Remove after testing
    async debugFirestoreUpdate() {
        try {
            console.log('Testing direct Firestore update...');
            
            const { getFirestoreDb } = await import('../services/firebase.js');
            const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
            
            const db = getFirestoreDb();
            const simRef = doc(db, 'simulations', this.simulationId);
            
            await updateDoc(simRef, {
                debugTest: 'test_value',
                debugTimestamp: serverTimestamp()
            });
            
            console.log('Direct Firestore update succeeded');
            this.showTemporaryMessage('Firestore update test succeeded', 'success');
            
        } catch (error) {
            console.error('Direct Firestore update failed:', error);
            this.showTemporaryMessage(`Firestore test failed: ${error.message}`, 'error');
        }
    }
}