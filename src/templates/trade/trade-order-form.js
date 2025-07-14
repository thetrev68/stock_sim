// file: src/templates/trade/trade-order-form.js
// Order form templates for trade view
// Focused module: Buy/sell order form templates exactly as they exist

/**
 * Generate main trading form template
 * @returns {string} HTML template string
 */
export const getMainTradingFormTemplate = () => {
    return `
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
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
                <div class="flex gap-4">
                    <label class="flex items-center">
                        <input type="radio" name="trade-type" value="buy" class="sr-only peer">
                        <div class="w-4 h-4 bg-gray-700 border-2 border-gray-600 rounded-full peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors"></div>
                        <span class="ml-2 text-white">Buy</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="trade-type" value="sell" class="sr-only peer">
                        <div class="w-4 h-4 bg-gray-700 border-2 border-gray-600 rounded-full peer-checked:bg-red-500 peer-checked:border-red-500 transition-colors"></div>
                        <span class="ml-2 text-white">Sell</span>
                    </label>
                </div>
            </div>
            
            <div id="price-preview" class="bg-gray-700 p-3 rounded-md hidden">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-300 text-sm">Current Price:</span>
                    <span id="current-price" class="text-white font-semibold">$0.00</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-300 text-sm">Estimated Cost:</span>
                    <span id="estimated-cost" class="text-white font-semibold">$0.00</span>
                </div>
            </div>
            
            <button 
                type="submit" 
                id="submit-trade" 
                class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
            >
                <span id="submit-text">Select ticker and quantity</span>
                <div id="submit-loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto hidden"></div>
            </button>
            
            <button 
                type="button" 
                id="research-stock-btn" 
                class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
            >
                <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Research This Stock
            </button>
        </form>
    `;
};

/**
 * Generate price preview section template
 * @returns {string} HTML template string
 */
export const getPricePreviewTemplate = () => {
    return `
        <div id="price-preview" class="bg-gray-700 p-3 rounded-md hidden">
            <div class="flex justify-between items-center mb-2">
                <span class="text-gray-300 text-sm">Current Price:</span>
                <span id="current-price" class="text-white font-semibold">$0.00</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-300 text-sm">Estimated Cost:</span>
                <span id="estimated-cost" class="text-white font-semibold">$0.00</span>
            </div>
        </div>
    `;
};

/**
 * Generate trade type radio buttons template
 * @returns {string} HTML template string
 */
export const getTradeTypeRadioTemplate = () => {
    return `
        <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
            <div class="flex gap-4">
                <label class="flex items-center">
                    <input type="radio" name="trade-type" value="buy" class="sr-only peer">
                    <div class="w-4 h-4 bg-gray-700 border-2 border-gray-600 rounded-full peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors"></div>
                    <span class="ml-2 text-white">Buy</span>
                </label>
                <label class="flex items-center">
                    <input type="radio" name="trade-type" value="sell" class="sr-only peer">
                    <div class="w-4 h-4 bg-gray-700 border-2 border-gray-600 rounded-full peer-checked:bg-red-500 peer-checked:border-red-500 transition-colors"></div>
                    <span class="ml-2 text-white">Sell</span>
                </label>
            </div>
        </div>
    `;
};

/**
 * Generate submit button template
 * @returns {string} HTML template string
 */
export const getSubmitButtonTemplate = () => {
    return `
        <button 
            type="submit" 
            id="submit-trade" 
            class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
        >
            <span id="submit-text">Select ticker and quantity</span>
            <div id="submit-loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto hidden"></div>
        </button>
    `;
};