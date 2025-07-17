// file: src/templates/trade/trade-main-layout.js
// Main layout templates for trade view
// Focused module: Primary trade page structure exactly as it exists

/** TFC Moved
 * Generate the main trade view template
 * @returns {string} HTML template string
 */
export const getMainTradeLayoutTemplate = () => {
    return `
        <div class="trade-view">
            <!-- Portfolio Context Selector -->
            <div id="portfolio-context-section" class="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 border border-gray-700">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-1">Trading Context</h3>
                        <p class="text-gray-400 text-sm">Choose which portfolio you want to trade with</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <label for="portfolio-selector" class="text-sm font-medium text-gray-300">Portfolio:</label>
                        <select 
                            id="portfolio-selector" 
                            class="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-48"
                        >
                            <option value="">Loading portfolios...</option>
                        </select>
                    </div>
                </div>
                
                <!-- Context Info -->
                <div id="context-info" class="mt-4 p-3 bg-gray-700 rounded-lg hidden">
                    <div class="flex items-center gap-3">
                        <div id="context-indicator" class="w-3 h-3 bg-cyan-400 rounded-full"></div>
                        <div>
                            <p id="context-title" class="text-white font-medium">Solo Practice Mode</p>
                            <p id="context-description" class="text-gray-400 text-sm">Trade with your personal portfolio</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Trading Form -->
                <div class="lg:col-span-1">
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8">
                        <h2 class="text-xl font-semibold mb-4 text-white">Make a Trade</h2>
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
                                    class="w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                    placeholder="Number of shares"
                                    min="1"
                                >
                            </div>
                            
                            <div id="price-preview" class="hidden bg-gray-700 p-3 rounded-md border border-gray-600">
                                <p class="text-sm text-gray-400">Current Price: <span id="current-price" class="font-semibold text-white">$0.00</span></p>
                                <p class="text-sm text-gray-400 mt-1">Estimated Total: <span id="total-cost" class="font-semibold text-cyan-400">$0.00</span></p>
                            </div>

                            <div class="flex gap-4">
                                <button 
                                    type="button" 
                                    id="buy-btn" 
                                    class="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                    disabled
                                >
                                    Buy
                                </button>
                                <button 
                                    type="button" 
                                    id="sell-btn" 
                                    class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                    disabled
                                >
                                    Sell
                                </button>
                            </div>
                            
                            <!-- Research Integration Button -->
                            <button 
                                type="button" 
                                id="research-stock-btn" 
                                class="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                Research This Stock
                            </button>
                            
                            <p id="trade-feedback" class="mt-4 text-sm text-center text-gray-400">&nbsp;</p>
                        </form>
                    </div>
                </div>

                <!-- Portfolio Summary and Recent Trades -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Current Portfolio Summary -->
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 class="text-xl font-semibold mb-4 text-white">Portfolio Summary</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-gray-700 p-4 rounded-md">
                                <p class="text-sm font-medium text-gray-400">Available Cash</p>
                                <p id="portfolio-cash" class="text-2xl font-bold text-green-400">$0.00</p>
                            </div>
                            <div class="bg-gray-700 p-4 rounded-md">
                                <p class="text-sm font-medium text-gray-400">Total Portfolio Value</p>
                                <p id="portfolio-value" class="text-2xl font-bold text-white">$0.00</p>
                                <p class="text-sm text-gray-500 mt-1">(Cash + Holdings)</p>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Trades List -->
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 class="text-xl font-semibold mb-4 text-white">Recent Trades</h3>
                        <div id="recent-trades-list" class="space-y-3 text-sm">
                            <p class="text-gray-500 text-center">No recent trades.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};