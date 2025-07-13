// src/views/simulation.js - Enhanced for Session 7
// Simulation view with trading integration
import { SimulationService } from '../services/simulation.js';
import { AuthService } from '../services/auth.js';
import { getPortfolio, initializePortfolio, getRecentTrades } from '../services/trading.js';

export default class SimulationView {
    constructor() {
        this.name = 'simulation';
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.currentSimulation = null;
        this.currentUser = null;
        this.simulationId = null;
        this.simulationPortfolio = null;
    }

    async render(container) {
        // Extract simulation ID from URL parameters
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
                                    <span id="trade-btn-text">Trade Now</span>
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

                    <!-- Portfolio Holdings and Recent Trades -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <!-- Current Holdings -->
                        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                            <div class="p-6 border-b border-gray-700">
                                <h3 class="text-xl font-semibold text-white">Current Holdings</h3>
                                <p class="text-sm text-gray-400 mt-1">Your positions in this simulation</p>
                            </div>
                            
                            <div id="sim-holdings-container" class="p-6">
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
                                    <!-- Holdings will be rendered here -->
                                </div>
                            </div>
                        </div>

                        <!-- Recent Trades -->
                        <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                            <div class="p-6 border-b border-gray-700">
                                <h3 class="text-xl font-semibold text-white">Recent Trades</h3>
                                <p class="text-sm text-gray-400 mt-1">Your trading activity in this simulation</p>
                            </div>
                            
                            <div id="sim-trades-container" class="p-6">
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
                                    <!-- Trades will be rendered here -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Simulation Rules & Info -->
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

        // Leaderboard button (placeholder for Session 9)
        const leaderboardBtn = container.querySelector('#view-leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
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

            // Initialize and load simulation portfolio
            await this.loadSimulationPortfolio();

            // Display simulation data
            this.displaySimulation();
            
        } catch (error) {
            console.error('Error loading simulation:', error);
            this.showError();
        }
    }

    async loadSimulationPortfolio() {
        try {
            // Initialize portfolio if it doesn't exist (non-blocking)
            const initPromise = initializePortfolio(
                this.currentUser.uid, 
                this.currentSimulation.startingBalance, 
                this.simulationId, 
                this.currentSimulation
            );

            // Load portfolio data (can run in parallel)
            const portfolioPromise = getPortfolio(this.currentUser.uid, this.simulationId);

            // Wait for both operations
            await initPromise;
            this.simulationPortfolio = await portfolioPromise;
            
            // Load UI components asynchronously to avoid blocking
            setTimeout(() => {
                this.loadHoldings();
            }, 0);
            
            setTimeout(() => {
                this.loadRecentTrades();
            }, 0);
            
        } catch (error) {
            console.error('Error loading simulation portfolio:', error);
            this.showPortfolioError();
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
        
        // Calculate current value (using avg price as fallback)
        const currentValue = holding.quantity * holding.avgPrice;
        const costBasis = holding.quantity * holding.avgPrice;
        
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

        // Update other stats
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

    updatePortfolioStats() {
        if (!this.simulationPortfolio) return;

        // Portfolio value
        const portfolioValueEl = document.getElementById('sim-portfolio-value');
        const portfolioChangeEl = document.getElementById('sim-portfolio-change');
        
        if (portfolioValueEl) {
            const cash = this.simulationPortfolio.cash;
            let holdingsValue = 0;
            
            // Calculate holdings value (using avg price as estimate)
            const holdings = this.simulationPortfolio.holdings || {};
            for (const ticker in holdings) {
                if (holdings.hasOwnProperty(ticker)) {
                    holdingsValue += holdings[ticker].quantity * holdings[ticker].avgPrice;
                }
            }
            
            const totalValue = cash + holdingsValue;
            portfolioValueEl.textContent = `${totalValue.toLocaleString()}`;
            
            // Calculate change from starting balance
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

        // Show immediate feedback
        const tradeBtnTextEl = document.getElementById('trade-btn-text');
        if (tradeBtnTextEl) {
            tradeBtnTextEl.textContent = 'Loading...';
        }

        // Navigate to trade view with simulation context (non-blocking)
        const tradeUrl = `/trade?sim=${this.simulationId}`;
        
        // Use requestAnimationFrame to ensure smooth UI transition
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