// Research view
export default class ResearchView {
    constructor() {
        this.name = 'research';
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
    }

    getTemplate() {
        return `
            <div class="research-view">
                <!-- Search Section -->
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <h2 class="text-xl font-semibold mb-4">Research a Stock</h2>
                    <div class="flex flex-col sm:flex-row gap-4 mb-4">
                        <input 
                            type="text" 
                            id="research-ticker-input" 
                            placeholder="Enter ticker (e.g., TSLA)" 
                            class="flex-grow bg-gray-700 text-white placeholder-gray-500 rounded-md px-4 py-2 border border-gray-600 uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                            maxlength="6"
                        >
                        <button 
                            id="research-btn" 
                            class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
                        >
                            Get Info
                        </button>
                    </div>
                </div>

                <!-- Results Section -->
                <div id="research-results" class="hidden">
                    <!-- Stock Quote -->
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                        <div id="stock-quote" class="mb-4">
                            <h3 class="text-2xl font-bold text-white mb-2">
                                <span id="company-name">Company Name</span>
                                <span class="text-lg font-normal text-gray-400 ticker-symbol">(<span id="quote-ticker">TICKER</span>)</span>
                            </h3>
                            <div class="flex justify-between items-baseline">
                                <div>
                                    <p class="text-3xl font-bold text-white" id="current-price">$0.00</p>
                                    <p class="font-semibold text-gray-400" id="price-change">$0.00 (0.00%) Today</p>
                                </div>
                                <div class="text-right text-sm text-gray-400">
                                    <p>High: <span id="day-high">$0.00</span></p>
                                    <p>Low: <span id="day-low">$0.00</span></p>
                                    <p>Prev. Close: <span id="prev-close">$0.00</span></p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Chart Placeholder -->
                        <div class="mb-4 h-80 bg-gray-700 rounded-lg flex items-center justify-center">
                            <div class="text-center text-gray-400">
                                <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                <p>Interactive charts coming in Session 10</p>
                            </div>
                        </div>
                        
                        <!-- Chart Range Selector -->
                        <div class="flex justify-center gap-2 flex-wrap">
                            <button class="range-btn px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition">1D</button>
                            <button class="range-btn px-3 py-1 text-sm rounded-md bg-cyan-600 text-white">5D</button>
                            <button class="range-btn px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition">1M</button>
                            <button class="range-btn px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition">6M</button>
                            <button class="range-btn px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition">1Y</button>
                        </div>
                    </div>
                    
                    <!-- Company Profile -->
                    <div id="company-profile" class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                        <h3 class="text-xl font-semibold text-white mb-4">Company Profile</h3>
                        <div class="text-center py-8 text-gray-400">
                            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 011-1h4a2 2 0 011 1v12m-6 0h6"></path>
                            </svg>
                            <p>Company profiles coming in Session 10</p>
                        </div>
                    </div>

                    <!-- News Section -->
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-gray-300">Latest News</h3>
                            <div class="flex items-center">
                                <input type="checkbox" id="free-news-toggle" class="h-4 w-4 rounded border-gray-500 text-cyan-600 focus:ring-cyan-500 bg-gray-700 cursor-pointer" checked>
                                <label for="free-news-toggle" class="ml-2 block text-sm text-gray-300 cursor-pointer">Free articles only</label>
                            </div>
                        </div>
                        <div id="company-news" class="text-center py-8 text-gray-400">
                            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                            </svg>
                            <p>News feeds coming in Session 11</p>
                        </div>
                    </div>
                </div>
                
                <!-- Placeholder State -->
                <div id="research-placeholder" class="text-center text-gray-400 py-12">
                    <div class="mb-6">
                        <svg class="w-20 h-20 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-300 mb-2">Research Any Stock</h3>
                    <p class="text-gray-400 mb-4">Enter a stock ticker above to see company details, charts, and news</p>
                    <p class="text-sm text-gray-500">Full research functionality coming in Sessions 10-11</p>
                </div>
                
                <!-- Loading State -->
                <div id="research-loading" class="text-center text-gray-400 py-12 hidden">
                    <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Fetching data...</p>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        const researchBtn = container.querySelector('#research-btn');
        const tickerInput = container.querySelector('#research-ticker-input');

        // Auto-uppercase ticker input
        tickerInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        // Enter key support
        tickerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleResearch();
            }
        });

        // Research button
        researchBtn.addEventListener('click', this.handleResearch.bind(this));
    }

    handleResearch() {
        const ticker = document.getElementById('research-ticker-input').value.trim();
        
        if (!ticker) {
            this.showError('Please enter a ticker symbol');
            return;
        }

        // Show loading state
        this.showLoading();

        // Simulate API call delay
        setTimeout(() => {
            this.showMockResults(ticker);
        }, 1500);
    }

    showLoading() {
        document.getElementById('research-placeholder').classList.add('hidden');
        document.getElementById('research-results').classList.add('hidden');
        document.getElementById('research-loading').classList.remove('hidden');
    }

    showMockResults(ticker) {
        // Hide loading
        document.getElementById('research-loading').classList.add('hidden');
        
        // Show mock data
        document.getElementById('quote-ticker').textContent = ticker;
        document.getElementById('company-name').textContent = `${ticker} Inc.`;
        document.getElementById('current-price').textContent = '$150.25';
        document.getElementById('price-change').textContent = '+$2.45 (+1.66%) Today';
        document.getElementById('price-change').className = 'font-semibold text-green-400';
        document.getElementById('day-high').textContent = '$152.10';
        document.getElementById('day-low').textContent = '$147.80';
        document.getElementById('prev-close').textContent = '$147.80';
        
        // Show results
        document.getElementById('research-results').classList.remove('hidden');
        
        // Clear input
        document.getElementById('research-ticker-input').value = '';
    }

    showError(message) {
        // For now, just log the error
        // In Session 4, we'll add proper error handling
        console.error('Research error:', message);
    }
}