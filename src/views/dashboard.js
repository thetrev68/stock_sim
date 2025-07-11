// Dashboard view
export default class DashboardView {
    constructor() {
        this.name = 'dashboard';
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
                        <p class="text-2xl font-bold text-white">0</p>
                        <p class="text-sm text-gray-500 mt-1">Join or create one</p>
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

                <!-- Simulations Section -->
                <section>
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-semibold text-white">My Simulations</h2>
                        <button 
                            id="create-simulation-btn"
                            class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                        >
                            Create Simulation
                        </button>
                    </div>
                    
                    <div id="simulations-list" class="space-y-4">
                        <!-- Coming in Session 6 -->
                        <div class="bg-gray-800 p-8 rounded-lg text-center">
                            <div class="text-gray-400 mb-4">
                                <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-300 mb-2">No Simulations Yet</h3>
                            <p class="text-gray-400 mb-4">Create your first simulation to compete with friends</p>
                            <p class="text-sm text-gray-500">Multi-user simulations coming in Session 6</p>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    attachEventListeners(container) {
        const createBtn = container.querySelector('#create-simulation-btn');
        if (createBtn) {
            createBtn.addEventListener('click', this.handleCreateSimulation.bind(this));
        }
    }

    async loadData() {
        // For now, this is just a placeholder
        // In Session 5 we'll load real portfolio data
        console.log('Loading dashboard data...');
    }

    handleCreateSimulation() {
        // Placeholder for simulation creation
        // Will be implemented in Session 6
        alert('Simulation creation coming in Session 6! For now, use the solo trading features.');
    }
}