// Enhanced Dashboard view with Email Invite integration - Session 8
import { SimulationService } from '../services/simulation.js';
import { AuthService } from '../services/auth.js';
import { CreateSimulationModal } from '../components/simulation/CreateSimulationModal.js';
import { JoinSimulationModal } from '../components/simulation/JoinSimulationModal.js';
import { EmailInviteModal } from '../components/simulation/EmailInviteModal.js';

export default class DashboardView {
    constructor() {
        this.name = 'dashboard';
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.createSimModal = null;
        this.joinSimModal = null;
        this.emailInviteModal = null;
        this.userSimulations = [];
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
        await this.loadData();
    }

    getTemplate() {
        return `
            <div class="dashboard-view">
                <!-- Quick Stats -->
                <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 class="text-sm font-medium text-gray-400 mb-2">Portfolio Value</h3>
                        <p class="text-2xl font-bold text-white">$10,000.00</p>
                        <p class="text-sm text-gray-500 mt-1">Solo Practice Mode</p>
                    </div>
                    
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 class="text-sm font-medium text-gray-400 mb-2">Active Simulations</h3>
                        <p id="active-sim-count" class="text-2xl font-bold text-white">0</p>
                        <p class="text-sm text-gray-500 mt-1">Competitive trading</p>
                    </div>
                    
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 class="text-sm font-medium text-gray-400 mb-2">Today's P/L</h3>
                        <p class="text-2xl font-bold text-green-400">+$0.00</p>
                        <p class="text-sm text-gray-500 mt-1">All portfolios</p>
                    </div>
                </section>

                <!-- Quick Actions -->
                <section class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 class="text-xl font-semibold text-white mb-4">Quick Trade</h2>
                        <p class="text-gray-400 mb-4">Jump right into trading with your solo portfolio</p>
                        <button 
                            data-navigate="/trade" 
                            class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                        >
                            Start Trading
                        </button>
                    </div>
                    
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 class="text-xl font-semibold text-white mb-4">Research Stocks</h2>
                        <p class="text-gray-400 mb-4">Analyze companies before making your moves</p>
                        <button 
                            data-navigate="/research" 
                            class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                        >
                            Research Market
                        </button>
                    </div>
                </section>

                <!-- Enhanced Simulations Section -->
                <section>
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                        <div>
                            <h2 class="text-2xl font-semibold text-white">My Simulations</h2>
                            <p class="text-gray-400">Compete with friends in trading challenges</p>
                        </div>
                        <div class="flex gap-3">
                            <button 
                                id="join-simulation-btn"
                                class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                Join Simulation
                            </button>
                            <button 
                                id="create-simulation-btn"
                                class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                Create Simulation
                            </button>
                        </div>
                    </div>
                    
                    <!-- Simulations List -->
                    <div id="simulations-list" class="space-y-4">
                        <!-- Loading state -->
                        <div id="simulations-loading" class="bg-gray-800 p-8 rounded-lg text-center">
                            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p class="text-gray-400">Loading simulations...</p>
                        </div>

                        <!-- Empty state -->
                        <div id="simulations-empty" class="bg-gray-800 p-8 rounded-lg text-center hidden">
                            <div class="text-gray-400 mb-4">
                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-300 mb-2">No Simulations Yet</h3>
                            <p class="text-gray-400 mb-4">Create your first simulation or join one to get started</p>
                            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                                <button id="create-sim-cta" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
                                    Create Simulation
                                </button>
                                <button id="join-sim-cta" class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
                                    Join Simulation
                                </button>
                            </div>
                        </div>

                        <!-- Simulations will be rendered here -->
                        <div id="simulations-container"></div>
                    </div>
                </section>
            </div>
        `;
    }

    attachEventListeners(container) {
        // Primary action buttons
        const createBtn = container.querySelector('#create-simulation-btn');
        const joinBtn = container.querySelector('#join-simulation-btn');
        
        // CTA buttons in empty state
        const createCTA = container.querySelector('#create-sim-cta');
        const joinCTA = container.querySelector('#join-sim-cta');

        // Create simulation handlers
        [createBtn, createCTA].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.handleCreateSimulation());
            }
        });

        // Join simulation handlers
        [joinBtn, joinCTA].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.handleJoinSimulation());
            }
        });
    }

    async loadData() {
        console.log('Loading dashboard data...');
        
        const user = this.authService.getCurrentUser();
        if (!user) {
            console.log('No user signed in for dashboard.');
            return;
        }

        try {
            // Initialize simulation service
            this.simulationService.initialize();
            
            // Load user's simulations
            this.userSimulations = await this.simulationService.getUserSimulations(user.uid);
            console.log('Loaded simulations:', this.userSimulations);
            
            // Update UI
            this.updateSimulationStats();
            this.renderSimulations();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showSimulationsError();
        }
    }

    updateSimulationStats() {
        const activeSimCount = this.userSimulations.filter(sim => sim.status === 'active').length;
        const activeSimCountEl = document.getElementById('active-sim-count');
        if (activeSimCountEl) {
            activeSimCountEl.textContent = activeSimCount;
        }
    }

    renderSimulations() {
        const loadingEl = document.getElementById('simulations-loading');
        const emptyEl = document.getElementById('simulations-empty');
        const containerEl = document.getElementById('simulations-container');

        // Hide loading
        if (loadingEl) loadingEl.classList.add('hidden');

        if (this.userSimulations.length === 0) {
            // Show empty state
            if (emptyEl) emptyEl.classList.remove('hidden');
            if (containerEl) containerEl.innerHTML = '';
        } else {
            // Show simulations
            if (emptyEl) emptyEl.classList.add('hidden');
            if (containerEl) {
                containerEl.innerHTML = '';
                
                this.userSimulations.forEach(simulation => {
                    const simCard = this.createSimulationCard(simulation);
                    containerEl.appendChild(simCard);
                });
            }
        }
    }

    createSimulationCard(simulation) {
        const card = document.createElement('div');
        card.className = 'bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200';
        
        // Format dates
        const startDate = simulation.startDate.toDate ? simulation.startDate.toDate() : new Date(simulation.startDate);
        const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
        const now = new Date();
        
        // Determine status and color
        let statusText = simulation.status;
        let statusColor = 'text-gray-400';
        let statusBg = 'bg-gray-600';
        
        if (simulation.status === 'active') {
            statusText = 'Active';
            statusColor = 'text-green-400';
            statusBg = 'bg-green-600';
        } else if (simulation.status === 'pending') {
            if (startDate > now) {
                statusText = 'Upcoming';
                statusColor = 'text-yellow-400';
                statusBg = 'bg-yellow-600';
            } else {
                statusText = 'Starting Soon';
                statusColor = 'text-cyan-400';
                statusBg = 'bg-cyan-600';
            }
        } else if (simulation.status === 'ended') {
            statusText = 'Ended';
            statusColor = 'text-red-400';
            statusBg = 'bg-red-600';
        }

        // Calculate time remaining or elapsed
        let timeInfo = '';
        if (simulation.status === 'pending' && startDate > now) {
            const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
            timeInfo = `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`;
        } else if (simulation.status === 'active') {
            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            if (daysRemaining > 0) {
                timeInfo = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
            } else {
                timeInfo = 'Ending soon';
            }
        } else if (simulation.status === 'ended') {
            const daysAgo = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
            timeInfo = `Ended ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
        }

        // Role badge
        const roleText = simulation.userRole === 'creator' ? 'Creator' : 'Member';
        const roleColor = simulation.userRole === 'creator' ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-400 bg-gray-400/10';

        // Creator action buttons for pending simulations
        const creatorButtons = simulation.userRole === 'creator' && simulation.status === 'pending' ? `
            <div class="flex flex-wrap gap-2 mb-3">
                <button class="invite-code-btn bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center gap-1.5" data-invite-code="${simulation.inviteCode}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Copy Code
                </button>
                <button class="email-invite-btn bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center gap-1.5" data-sim-id="${simulation.id}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Invite Friends
                </button>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div class="flex-1">
                    <div class="flex items-start gap-3 mb-3">
                        <div>
                            <h3 class="text-xl font-semibold text-white">${simulation.name}</h3>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="${statusColor} text-sm font-medium px-2 py-1 ${statusBg}/20 rounded-full">${statusText}</span>
                                <span class="${roleColor} text-xs font-medium px-2 py-1 rounded-full">${roleText}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${simulation.description ? `<p class="text-gray-400 text-sm mb-3">${simulation.description}</p>` : ''}
                    
                    <!-- Creator Actions -->
                    ${creatorButtons}
                    
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span class="text-gray-500">Duration</span>
                            <p class="text-white font-medium">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">Starting Balance</span>
                            <p class="text-white font-medium">$${simulation.startingBalance.toLocaleString()}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">Participants</span>
                            <p class="text-white font-medium">${simulation.memberCount}/${simulation.maxMembers}</p>
                        </div>
                        <div>
                            <span class="text-gray-500">Status</span>
                            <p class="${statusColor} font-medium">${timeInfo}</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-col gap-2">
                    <button class="view-sim-btn bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2" data-sim-id="${simulation.id}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        View Details
                    </button>
                </div>
            </div>
        `;

        // Attach event listeners to this card
        this.attachCardEventListeners(card, simulation);

        return card;
    }

    attachCardEventListeners(card, simulation) {
        // Copy invite code button
        const inviteBtn = card.querySelector('.invite-code-btn');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', async (e) => {
                const inviteCode = e.currentTarget.dataset.inviteCode;
                try {
                    await navigator.clipboard.writeText(inviteCode);
                    
                    // Visual feedback
                    const originalText = inviteBtn.innerHTML;
                    inviteBtn.innerHTML = `
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Copied!
                    `;
                    inviteBtn.className = 'invite-code-btn bg-green-600 text-white text-xs font-medium py-1.5 px-3 rounded-md flex items-center gap-1.5';
                    
                    setTimeout(() => {
                        inviteBtn.innerHTML = originalText;
                        inviteBtn.className = 'invite-code-btn bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-200 flex items-center gap-1.5';
                    }, 2000);
                    
                } catch (err) {
                    console.error('Failed to copy invite code:', err);
                    // Fallback: show the code in an alert
                    alert(`Invite Code: ${inviteCode}`);
                }
            });
        }

        // Email invite button
        const emailInviteBtn = card.querySelector('.email-invite-btn');
        if (emailInviteBtn) {
            emailInviteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEmailInvite(simulation);
            });
        }

        // View simulation button
        const viewBtn = card.querySelector('.view-sim-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                const simId = e.currentTarget.dataset.simId;
                console.log(`Viewing simulation: ${simId}`);
                this.navigateToSimulation(simId);
            });
        }
    }

    navigateToSimulation(simulationId) {
        // Navigate to simulation view with the simulation ID
        const simulationUrl = `/simulation?sim=${simulationId}`;
        
        // Check if we have access to the app router
        if (window.app && window.app.router) {
            window.app.router.navigate(simulationUrl);
        } else {
            // Fallback to direct navigation
            window.location.href = simulationUrl;
        }
    }

    showSimulationsError() {
        const loadingEl = document.getElementById('simulations-loading');
        const containerEl = document.getElementById('simulations-container');
        
        if (loadingEl) loadingEl.classList.add('hidden');
        
        if (containerEl) {
            containerEl.innerHTML = `
                <div class="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
                    <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-lg font-semibold text-red-400 mb-2">Error Loading Simulations</h3>
                    <p class="text-gray-300 mb-4">Unable to load your simulations. Please try again.</p>
                    <button onclick="window.location.reload()" class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    handleCreateSimulation() {
        if (!this.createSimModal) {
            this.createSimModal = new CreateSimulationModal();
        }
        
        this.createSimModal.show((result) => {
            console.log('Simulation created:', result);
            // Refresh the simulations list
            this.loadData();
        });
    }

    handleJoinSimulation() {
        if (!this.joinSimModal) {
            this.joinSimModal = new JoinSimulationModal();
        }
        
        this.joinSimModal.show((simulation) => {
            console.log('Joined simulation:', simulation);
            // Refresh the simulations list
            this.loadData();
            
            // Optional: Navigate to the simulation after joining
            if (simulation && simulation.id) {
                setTimeout(() => {
                    this.navigateToSimulation(simulation.id);
                }, 1500); // Give time for success message to show
            }
        });
    }

    handleEmailInvite(simulation) {
        if (!this.emailInviteModal) {
            this.emailInviteModal = new EmailInviteModal();
        }
        
        this.emailInviteModal.show(simulation, (invitationData) => {
            console.log('Email invitations sent:', invitationData);
            
            // Show success notification (optional)
            console.log(`Invitations prepared for ${invitationData.recipients.length} recipients`);
            
            // Optionally refresh simulation data to show updated member counts
            this.loadData();
        });
    }
}