// Trade view
export default class TradeView {
    constructor() {
        this.name = 'trade';
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
    }

    getTemplate() {
        return `
            <div class="trade-view">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Trading Form -->
                    <div class="lg:col-span-1">
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                            <h2 class="text-xl font-semibold mb-4">Make a Trade</h2>
                            <form id="trade-form" class="space-y-4">
                                <div>
                                    <label for="ticker" class="block text-sm font-medium text-gray-300 mb-1">Ticker Symbol</label>
                                    <input 
                                        type="text" 
                                        id="ticker" 
                                        class="w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                        placeholder="e.g., AAPL, TSLA"
                                        maxlength="6"
                                    >
                                </div>
                                <div>
                                    <label for="quantity" class="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                                    <input 
                                        type="number" 
                                        id="quantity" 
                                        min="1" 
                                        class="w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                        placeholder="e.g., 10"
                                    >
                                </div>
                                
                                <!-- Price Preview -->
                                <div id="price-preview" class="hidden bg-gray-700 p-3 rounded-md">
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-400">Current Price:</span>
                                        <span id="current-price" class="text-white">--</span>
                                    </div>
                                    <div class="flex justify-between text-sm mt-1">
                                        <span class="text-gray-400">Total Cost:</span>
                                        <span id="total-cost" class="text-white">--</span>
                                    </div>
                                </div>
                                
                                <div class="flex gap-4">
                                    <button 
                                        type="button"
                                        id="buy-btn" 
                                        class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-md transition-colors duration-300"
                                    >
                                        Buy
                                    </button>
                                    <button 
                                        type="button"
                                        id="sell-btn" 
                                        class="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-md transition-colors duration-300"
                                    >
                                        Sell
                                    </button>
                                </div>
                            </form>
                            <div id="trade-feedback" class="mt-4 text-sm text-center">&nbsp;</div>
                        </div>
                    </div>
                    
                    <!-- Trading Information -->
                    <div class="lg:col-span-2">
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                            <h2 class="text-xl font-semibold mb-4 text-gray-300">Account Summary</h2>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm text-gray-400">Available Cash</p>
                                    <p class="text-2xl font-bold text-green-400">$10,000.00</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-400">Buying Power</p>
                                    <p class="text-2xl font-bold text-white">$10,000.00</p>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Trades -->
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 class="text-xl font-semibold mb-4 text-gray-300">Recent Trades</h2>
                            <div class="text-center py-8">
                                <div class="text-gray-400 mb-4">
                                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                    </svg>
                                </div>
                                <h3 class="text-lg font-semibold text-gray-300 mb-2">No Trades Yet</h3>
                                <p class="text-gray-400 mb-4">Your trading history will appear here</p>
                                <p class="text-sm text-gray-500">Trading functionality coming in Session 3</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        const form = container.querySelector('#trade-form');
        const tickerInput = container.querySelector('#ticker');
        const quantityInput = container.querySelector('#quantity');
        const buyBtn = container.querySelector('#buy-btn');
        const sellBtn = container.querySelector('#sell-btn');

        // Auto-uppercase ticker input
        tickerInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        // Preview calculations
        [tickerInput, quantityInput].forEach(input => {
            input.addEventListener('input', this.updatePricePreview.bind(this));
        });

        // Trade buttons
        buyBtn.addEventListener('click', () => this.handleTrade('buy'));
        sellBtn.addEventListener('click', () => this.handleTrade('sell'));
    }

    updatePricePreview() {
        // Placeholder for price preview functionality
        // Will be implemented in Session 4 with live prices
        const ticker = document.getElementById('ticker').value;
        const quantity = document.getElementById('quantity').value;
        
        if (ticker && quantity) {
            // Mock price for now
            const mockPrice = 150.00;
            const totalCost = mockPrice * quantity;
            
            document.getElementById('current-price').textContent = `$${mockPrice.toFixed(2)}`;
            document.getElementById('total-cost').textContent = `$${totalCost.toFixed(2)}`;
            document.getElementById('price-preview').classList.remove('hidden');
        } else {
            document.getElementById('price-preview').classList.add('hidden');
        }
    }

    handleTrade(action) {
        const ticker = document.getElementById('ticker').value.trim();
        const quantity = document.getElementById('quantity').value;
        const feedback = document.getElementById('trade-feedback');

        if (!ticker || !quantity) {
            feedback.textContent = 'Please enter both ticker and quantity';
            feedback.className = 'mt-4 text-sm text-center text-red-400';
            return;
        }

        // Placeholder for actual trading functionality
        feedback.textContent = `${action.toUpperCase()} functionality coming in Session 3!`;
        feedback.className = 'mt-4 text-sm text-center text-yellow-400';
        
        // Clear form
        setTimeout(() => {
            document.getElementById('ticker').value = '';
            document.getElementById('quantity').value = '';
            document.getElementById('price-preview').classList.add('hidden');
            feedback.innerHTML = '&nbsp;';
        }, 2000);
    }
}