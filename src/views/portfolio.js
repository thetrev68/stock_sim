// Portfolio view
export default class PortfolioView {
    constructor() {
        this.name = 'portfolio';
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
        await this.loadData();
    }

    getTemplate() {
        return `
            <div class="portfolio-view">
                <!-- Portfolio Summary -->
                <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-gray-800 p-5 rounded-lg shadow-md">
                        <h3 class="text-sm font-medium text-gray-400">Portfolio Value</h3>
                        <p class="text-2xl font-semibold text-white">$10,000.00</p>
                    </div>
                    <div class="bg-gray-800 p-5 rounded-lg shadow-md">
                        <h3 class="text-sm font-medium text-gray-400">Stock Holdings</h3>
                        <p class="text-2xl font-semibold text-white">$0.00</p>
                    </div>
                    <div class="bg-gray-800 p-5 rounded-lg shadow-md">
                        <h3 class="text-sm font-medium text-gray-400">Available Cash</h3>
                        <p class="text-2xl font-semibold text-green-400">$10,000.00</p>
                    </div>
                    <div class="bg-gray-800 p-5 rounded-lg shadow-md">
                        <h3 class="text-sm font-medium text-gray-400">Today's P/L</h3>
                        <p class="text-2xl font-semibold text-gray-500">$0.00</p>
                    </div>
                </section>

                <!-- Holdings -->
                <section>
                    <h2 class="text-xl font-semibold mb-4 text-gray-300">My Holdings</h2>
                    <div class="bg-gray-800 p-8 rounded-lg text-center">
                        <div class="text-gray-400 mb-4">
                            <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-300 mb-2">No Holdings Yet</h3>
                        <p class="text-gray-400 mb-4">Start trading to build your portfolio</p>
                        <button 
                            data-navigate="/trade" 
                            class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                        >
                            Make Your First Trade
                        </button>
                        <p class="text-sm text-gray-500 mt-4">Portfolio functionality coming in Session 5</p>
                    </div>
                </section>
            </div>
        `;
    }

    attachEventListeners(container) {
        // Event listeners will be added as we build functionality
    }

    async loadData() {
        console.log('Loading portfolio data...');
        // Portfolio data loading will be implemented in Session 5
    }
}