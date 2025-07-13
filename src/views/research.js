// src/views/research.js - Enhanced Research View - Session 10
import { StockService } from '../services/stocks.js';

export default class ResearchView {
    constructor() {
        this.name = 'research';
        this.stockService = new StockService();
        this.viewContainer = null;
        this.currentStockData = null;
        this.currentChart = null;
        this.searchResults = [];
        this.searchTimeout = null;
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.viewContainer = container;
        this.attachEventListeners(container);
        
        // Load Chart.js dynamically
        await this.loadChartJS();
        
        // Check for pre-filled ticker from URL
        const urlParams = new URLSearchParams(window.location.search);
        const prefilledTicker = urlParams.get('ticker');
        
        if (prefilledTicker) {
            console.log(`Pre-filling research with ticker: ${prefilledTicker}`);
            // Set the input value
            const tickerInput = document.getElementById('research-ticker-input');
            if (tickerInput) {
                tickerInput.value = prefilledTicker.toUpperCase();
            }
            // Automatically research the stock
            setTimeout(() => {
                this.researchStock(prefilledTicker);
            }, 500);
        } else {
            // Show default state
            this.showDefaultState();
        }
    }

    async loadChartJS() {
        // Check if Chart.js is already loaded
        if (typeof Chart !== 'undefined') {
            console.log('Chart.js already loaded');
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
            script.onload = () => {
                console.log('Chart.js loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load Chart.js');
                // Fallback: show static message instead of chart
                resolve(); // Don't reject so the app continues working
            };
            document.head.appendChild(script);
        });
    }

    getTemplate() {
        return `
            <div class="research-view">
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
                    <h2 class="text-2xl font-semibold text-white mb-4">Stock Research</h2>
                    <div class="relative">
                        <div class="flex flex-col sm:flex-row gap-4 mb-4">
                            <div class="flex-grow relative">
                                <input 
                                    type="text" 
                                    id="research-ticker-input" 
                                    placeholder="Search stocks by symbol or company name (e.g., AAPL, Apple)" 
                                    class="w-full bg-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 pr-12 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                    autocomplete="off"
                                >
                                <div class="absolute right-3 top-3">
                                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                                
                                <div id="search-loading" class="absolute right-3 top-3 hidden">
                                    <div class="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            </div>
                            <button 
                                id="research-btn" 
                                class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                                Research
                            </button>
                        </div>
                        
                        <div id="search-results" class="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-50 hidden">
                            <div id="search-results-list" class="p-2">
                                </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 mt-4">
                        <span class="text-gray-400 text-sm mr-2">Popular:</span>
                        <button class="quick-research-btn bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg transition-colors" data-ticker="AAPL">AAPL</button>
                        <button class="quick-research-btn bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg transition-colors" data-ticker="TSLA">TSLA</button>
                        <button class="quick-research-btn bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg transition-colors" data-ticker="MSFT">MSFT</button>
                        <button class="quick-research-btn bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg transition-colors" data-ticker="GOOG">GOOG</button>
                        <button class="quick-research-btn bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg transition-colors" data-ticker="AMZN">AMZN</button>
                        <button class="quick-research-btn bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg transition-colors" data-ticker="NVDA">NVDA</button>
                    </div>
                </div>

                <div id="research-error" class="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-8 hidden">
                    <div class="flex items-center gap-3">
                        <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p id="research-error-text" class="text-red-400"></p>
                    </div>
                </div>

                <div id="research-results" class="hidden space-y-8">
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div class="flex items-center gap-4">
                                <div id="company-logo" class="w-16 h-16 bg-gray-700 rounded-lg items-center justify-center hidden">
                                    <img id="logo-img" src="" alt="" class="w-12 h-12 rounded-lg object-contain">
                                </div>
                                <div id="company-logo-fallback" class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <span id="company-initial" class="text-white font-bold text-2xl">A</span>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-white mb-2">
                                        <span id="company-name">Company Name</span>
                                        <span class="text-lg font-normal text-gray-400 ticker-symbol ml-2">(<span id="quote-ticker">TICKER</span>)</span>
                                    </h2>
                                    <div class="flex items-center gap-4 text-sm text-gray-400">
                                        <span id="company-exchange">NASDAQ</span>
                                        <span>•</span>
                                        <span id="company-sector">Technology</span>
                                        <span>•</span>
                                        <span id="company-currency">USD</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="text-right">
                                <p class="text-4xl font-bold text-white mb-2" id="current-price">$0.00</p>
                                <div class="flex items-center justify-end gap-2">
                                    <span id="price-change" class="text-lg font-semibold">$0.00 (0.00%)</span>
                                    <span class="text-gray-400 text-sm">Today</span>
                                </div>
                                <p class="text-gray-400 text-sm mt-1" id="last-updated">Last updated: --</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
                            <div>
                                <span class="text-gray-400 text-sm">Open</span>
                                <p id="open-price" class="text-white font-semibold">$0.00</p>
                            </div>
                            <div>
                                <span class="text-gray-400 text-sm">High</span>
                                <p id="day-high" class="text-white font-semibold">$0.00</p>
                            </div>
                            <div>
                                <span class="text-gray-400 text-sm">Low</span>
                                <p id="day-low" class="text-white font-semibold">$0.00</p>
                            </div>
                            <div>
                                <span class="text-gray-400 text-sm">Volume</span>
                                <p id="volume" class="text-white font-semibold">0</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div>
                                <h3 class="text-xl font-semibold text-white">Price Chart</h3>
                                <p class="text-gray-400 text-sm mt-1">Historical price movement</p>
                            </div>
                            
                            <div class="flex items-center gap-2">
                                <div class="flex bg-gray-700 rounded-lg p-1">
                                    <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 bg-cyan-600 text-white" data-period="7" data-resolution="D">7D</button>
                                    <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-period="30" data-resolution="D">1M</button>
                                    <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-period="90" data-resolution="D">3M</button>
                                    <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-period="180" data-resolution="D">6M</button>
                                    <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-period="365" data-resolution="D">1Y</button>
                                </div>
                                <button id="refresh-chart-btn" class="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors duration-200">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div class="relative">
                            <div id="chart-loading" class="flex items-center justify-center py-12">
                                <div class="text-center">
                                    <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p class="text-gray-400">Loading chart data...</p>
                                </div>
                            </div>
                            
                            <div id="chart-container" class="hidden">
                                <canvas id="price-chart" width="800" height="400"></canvas>
                            </div>
                            
                            <div id="chart-error" class="text-center py-12 hidden">
                                <div class="text-gray-400">
                                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                    <p>Unable to load chart data</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 class="text-xl font-semibold text-white mb-4">Company Profile</h3>
                        
                        <div id="company-profile-content">
                            <div id="profile-loading" class="text-center py-8">
                                <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p class="text-gray-400">Loading company information...</p>
                            </div>
                            
                            <div id="profile-data" class="hidden">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="space-y-4">
                                        <div>
                                            <h4 class="text-lg font-medium text-white mb-3">Key Information</h4>
                                            <div class="space-y-3">
                                                <div class="flex justify-between">
                                                    <span class="text-gray-400">Market Cap</span>
                                                    <span id="market-cap" class="text-white font-medium">--</span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-400">Shares Outstanding</span>
                                                    <span id="shares-outstanding" class="text-white font-medium">--</span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-400">IPO Date</span>
                                                    <span id="ipo-date" class="text-white font-medium">--</span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-400">Country</span>
                                                    <span id="company-country" class="text-white font-medium">--</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="space-y-4">
                                        <div>
                                            <h4 class="text-lg font-medium text-white mb-3">Links & Resources</h4>
                                            <div class="space-y-3">
                                                <div id="company-website" class="hidden">
                                                    <a id="website-link" href="#" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                        </svg>
                                                        Company Website
                                                    </a>
                                                </div>
                                                
                                                <div class="flex items-center gap-2 text-gray-400">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                                    </svg>
                                                    <span class="text-sm">Live data via Finnhub API</span>
                                                </div>
                                                
                                                <button id="add-to-watchlist-btn" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                    </svg>
                                                    Add to Watchlist
                                                </button>
                                                
                                                <button id="quick-trade-btn" class="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                                    </svg>
                                                    Trade This Stock
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div id="profile-error" class="text-center py-8 text-gray-400 hidden">
                                <svg class="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 011-1h4a2 2 0 011 1v12m-6 0h6"></path>
                                </svg>
                                <p>Company profile unavailable</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-gray-300">Latest News</h3>
                            <div class="flex items-center">
                                <span class="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">Coming in Session 11</span>
                            </div>
                        </div>
                        <div class="text-center py-8 text-gray-400">
                            <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                            </svg>
                            <p>News feeds will be available in Session 11</p>
                        </div>
                    </div>
                </div>
                
                <div id="research-placeholder" class="text-center text-gray-400 py-16">
                    <div class="mb-8">
                        <svg class="w-24 h-24 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-semibold text-gray-300 mb-4">Research Any Stock</h3>
                    <p class="text-gray-400 mb-6 max-w-md mx-auto">Search for a stock symbol or company name to see detailed information, live prices, charts, and company profiles</p>
                    <div class="text-sm text-gray-500 space-y-2">
                        <p>✓ Real-time stock quotes via Finnhub API</p>
                        <p>✓ Interactive price charts</p>
                        <p>✓ Company profiles and key metrics</p>
                        <p>✓ Direct trading integration</p>
                    </div>
                </div>
                
                <div id="research-loading" class="text-center text-gray-400 py-16 hidden">
                    <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-lg">Fetching stock data...</p>
                    <p class="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        const tickerInput = container.querySelector('#research-ticker-input');
        const researchBtn = container.querySelector('#research-btn');
        const quickBtns = container.querySelectorAll('.quick-research-btn');
        const chartPeriodBtns = container.querySelectorAll('.chart-period-btn');
        const refreshChartBtn = container.querySelector('#refresh-chart-btn');
        const addWatchlistBtn = container.querySelector('#add-to-watchlist-btn');
        const quickTradeBtn = container.querySelector('#quick-trade-btn');

        // Search input events
        if (tickerInput) {
            tickerInput.addEventListener('input', this.handleSearchInput.bind(this));
            tickerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleResearch();
                }
            });
            tickerInput.addEventListener('focus', this.showSearchResults.bind(this));
            tickerInput.addEventListener('blur', () => {
                // Delay hiding to allow click on results
                setTimeout(() => this.hideSearchResults(), 200);
            });
        }

        // Research button
        if (researchBtn) {
            researchBtn.addEventListener('click', this.handleResearch.bind(this));
        }

        // Quick research buttons
        quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ticker = e.target.dataset.ticker;
                this.researchStock(ticker);
            });
        });

        // Chart period buttons
        chartPeriodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchChartPeriod(e.target);
            });
        });

        // Refresh chart button
        if (refreshChartBtn) {
            refreshChartBtn.addEventListener('click', this.refreshChart.bind(this));
        }

        // Action buttons
        if (addWatchlistBtn) {
            addWatchlistBtn.addEventListener('click', this.handleAddToWatchlist.bind(this));
        }

        if (quickTradeBtn) {
            quickTradeBtn.addEventListener('click', this.handleQuickTrade.bind(this));
        }

        // Click outside to hide search results
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    async handleSearchInput(e) {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length < 1) {
            this.hideSearchResults();
            return;
        }

        // Show loading
        this.showSearchLoading(true);

        // Debounce search
        this.searchTimeout = setTimeout(async () => {
            try {
                this.searchResults = await this.stockService.searchStocks(query);
                this.displaySearchResults();
            } catch (error) {
                console.error('Search error:', error);
                this.hideSearchResults();
            } finally {
                this.showSearchLoading(false);
            }
        }, 300);
    }

    showSearchLoading(show) {
        const searchIcon = document.querySelector('#research-ticker-input + div svg');
        const loadingIcon = document.getElementById('search-loading');
        
        if (show) {
            if (searchIcon) searchIcon.style.display = 'none';
            if (loadingIcon) loadingIcon.classList.remove('hidden');
        } else {
            if (searchIcon) searchIcon.style.display = 'block';
            if (loadingIcon) loadingIcon.classList.add('hidden');
        }
    }

    displaySearchResults() {
        const resultsContainer = document.getElementById('search-results');
        const resultsList = document.getElementById('search-results-list');
        
        if (!resultsContainer || !resultsList) return;

        if (this.searchResults.length === 0) {
            resultsList.innerHTML = `
                <div class="p-3 text-center text-gray-400">
                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-sm">No stocks found</p>
                </div>
            `;
        } else {
            resultsList.innerHTML = this.searchResults.map(stock => `
                <div class="search-result-item p-3 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors" data-ticker="${stock.symbol}">
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="text-white font-medium">${stock.symbol}</h4>
                            <p class="text-gray-400 text-sm">${stock.description}</p>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-gray-500 bg-gray-600 px-2 py-1 rounded">${stock.type}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            // Attach click events to search results
            resultsList.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const ticker = e.currentTarget.dataset.ticker;
                    this.researchStock(ticker);
                    this.hideSearchResults();
                });
            });
        }

        this.showSearchResults();
    }

    showSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer && this.searchResults.length > 0) {
            resultsContainer.classList.remove('hidden');
        }
    }

    hideSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.classList.add('hidden');
        }
    }

    async handleResearch() {
        const ticker = document.getElementById('research-ticker-input')?.value.trim();
        
        if (!ticker) {
            this.showError('Please enter a stock ticker symbol');
            return;
        }

        await this.researchStock(ticker);
    }

    async researchStock(ticker) {
        const upperTicker = ticker.toUpperCase();
        
        // Update input field
        const tickerInput = document.getElementById('research-ticker-input');
        if (tickerInput) {
            tickerInput.value = upperTicker;
        }

        // Show loading state
        this.showLoading();
        this.hideError();

        try {
            // Fetch stock details
            console.log(`Researching stock: ${upperTicker}`);
            this.currentStockData = await this.stockService.getStockDetails(upperTicker);
            
            if (!this.currentStockData) {
                throw new Error(`Stock data not found for ticker: ${upperTicker}`);
            }

            // Display results
            this.displayStockData();
            await this.loadPriceChart();
            this.displayCompanyProfile();

        } catch (error) {
            console.error('Research error:', error);
            this.showError(error.message || 'Failed to fetch stock data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    displayStockData() {
        if (!this.currentStockData) return;

        const data = this.currentStockData;

        // Update header information
        this.updateElement('company-name', data.companyName);
        this.updateElement('quote-ticker', data.ticker);
        this.updateElement('company-exchange', data.exchange);
        this.updateElement('company-sector', data.sector);
        this.updateElement('company-currency', data.currency);

        // Update price information
        this.updateElement('current-price', `${data.currentPrice.toFixed(2)}`);
        
        // Price change with color
        const changeEl = document.getElementById('price-change');
        if (changeEl && data.priceChange !== undefined) {
            const isPositive = data.priceChange >= 0;
            const changeClass = isPositive ? 'text-green-400' : 'text-red-400';
            const changeIcon = isPositive ? '↗' : '↘';
            
            changeEl.className = `text-lg font-semibold ${changeClass}`;
            changeEl.textContent = `${changeIcon} ${Math.abs(data.priceChange)} (${isPositive ? '+' : ''}${data.priceChangePercent}%)`;
        }

        // Update quick stats
        this.updateElement('open-price', `${data.openPrice?.toFixed(2) || '--'}`);
        this.updateElement('day-high', `${data.dayHigh?.toFixed(2) || '--'}`);
        this.updateElement('day-low', `${data.dayLow?.toFixed(2) || '--'}`);
        this.updateElement('volume', data.volume ? data.volume.toLocaleString() : '--');

        // Update last updated
        this.updateElement('last-updated', `Last updated: ${new Date().toLocaleTimeString()}`);

        // Update company logo
        const logoImg = document.getElementById('logo-img');
        const logoContainer = document.getElementById('company-logo');
        const logoFallback = document.getElementById('company-logo-fallback');
        const companyInitial = document.getElementById('company-initial');

        if (data.logo && logoImg && logoContainer && logoFallback) {
            logoImg.src = data.logo;
            logoImg.onerror = () => {
                logoContainer.classList.add('hidden');
                logoFallback.classList.remove('hidden');
            };
            logoImg.onload = () => {
                logoContainer.classList.remove('hidden');
                logoContainer.classList.add('flex');
                logoFallback.classList.add('hidden');
            };
        }

        if (companyInitial) {
            companyInitial.textContent = data.ticker.charAt(0);
        }

        // Show results
        this.showResults();
    }

    async loadPriceChart(period = 7, resolution = 'D') {
        if (!this.currentStockData) {
            console.warn('No current stock data for chart');
            return;
        }

        this.showChartLoading();

        try {
            // Check if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not available, showing fallback message');
                this.showChartUnavailable();
                return;
            }

            const historicalData = await this.stockService.getHistoricalData(
                this.currentStockData.ticker, 
                resolution, 
                period
            );

            if (historicalData && historicalData.timestamps && historicalData.closes && historicalData.closes.length > 0) {
                await this.renderChart(historicalData);
                this.showChart();
            } else {
                console.warn('No historical data available');
                this.showChartUnavailable('No historical data available');
            }

        } catch (error) {
            console.error('Chart loading error:', error);
            this.showChartUnavailable('Chart temporarily unavailable');
        }
    }

    async renderChart(historicalData) {
        const canvas = document.getElementById('price-chart');
    if (!canvas) {
        console.error('Chart canvas not found');
        return;
    }

    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        this.showChartUnavailable('Chart library not available');
        return;
    }

    // Destroy existing chart
    if (this.currentChart) {
        try {
            this.currentChart.destroy();
        } catch (error) {
            console.warn('Error destroying previous chart:', error);
        }
        this.currentChart = null;
    }

    try {
        const ctx = canvas.getContext('2d');
        
        // Prepare data for Chart.js
        const labels = historicalData.timestamps.map(timestamp => {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString();
        });
        const prices = historicalData.closes;

        // Validate data
        if (!labels.length || !prices.length) {
            throw new Error('No chart data available');
        }

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${this.currentStockData.ticker} Price`,
                    data: prices,
                    borderColor: '#06B6D4',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: '#06B6D4',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#06B6D4',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9CA3AF',
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9CA3AF',
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        };

        this.currentChart = new Chart(ctx, chartConfig);
            console.log('Chart rendered successfully');

        } catch (error) {
            console.error('Error rendering chart:', error);
            this.showChartUnavailable('Unable to render chart');
        }
    }

    // Add this new method to show chart unavailable message
    showChartUnavailable(message = 'Chart temporarily unavailable') {
        const chartContainer = document.getElementById('chart-container');
        const chartLoading = document.getElementById('chart-loading');
        const chartError = document.getElementById('chart-error');
        
        if (chartLoading) chartLoading.classList.add('hidden');
        if (chartContainer) chartContainer.classList.add('hidden');
        
        if (chartError) {
            chartError.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-gray-400">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <p class="mb-2">${message}</p>
                        <p class="text-sm text-gray-500">Using mock data due to API rate limits</p>
                    </div>
                </div>
            `;
            chartError.classList.remove('hidden');
        }
    }

    displayCompanyProfile() {
        if (!this.currentStockData || !this.currentStockData.companyProfile) {
            this.showProfileError();
            return;
        }

        const profile = this.currentStockData.companyProfile;

        this.updateElement('market-cap', profile.marketCapitalization ? this.formatMillionsBillions(profile.marketCapitalization) : '--');
        this.updateElement('shares-outstanding', profile.shareOutstanding ? profile.shareOutstanding.toLocaleString() : '--');
        this.updateElement('ipo-date', profile.ipo ? new Date(profile.ipo).toLocaleDateString() : '--');
        this.updateElement('company-country', profile.country || '--');

        const companyWebsiteDiv = document.getElementById('company-website');
        const websiteLink = document.getElementById('website-link');
        if (profile.weburl && websiteLink && companyWebsiteDiv) {
            websiteLink.href = profile.weburl;
            companyWebsiteDiv.classList.remove('hidden');
        } else if (companyWebsiteDiv) {
            companyWebsiteDiv.classList.add('hidden');
        }

        this.showProfileData();
    }

    formatMillionsBillions(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        return num.toLocaleString();
    }

    switchChartPeriod(targetButton) {
        const period = parseInt(targetButton.dataset.period);
        const resolution = targetButton.dataset.resolution;

        // Update active button style
        document.querySelectorAll('.chart-period-btn').forEach(btn => {
            btn.classList.remove('bg-cyan-600', 'text-white');
            btn.classList.add('text-gray-300', 'hover:text-white');
        });
        targetButton.classList.add('bg-cyan-600', 'text-white');
        targetButton.classList.remove('text-gray-300', 'hover:text-white');

        this.loadPriceChart(period, resolution);
    }

    refreshChart() {
        const activeBtn = document.querySelector('.chart-period-btn.bg-cyan-600');
        if (activeBtn) {
            const period = parseInt(activeBtn.dataset.period);
            const resolution = activeBtn.dataset.resolution;
            this.loadPriceChart(period, resolution);
        } else {
            // Default to 7D if no active button found
            this.loadPriceChart(7, 'D');
        }
    }

    handleAddToWatchlist() {
        if (this.currentStockData) {
            alert(`Added ${this.currentStockData.ticker} to watchlist! (Functionality to be implemented)`);
            // In a real app, you'd integrate with a watchlist service here
        }
    }

    handleQuickTrade() {
        if (this.currentStockData) {
            const ticker = this.currentStockData.ticker;
            const tradeUrl = `/trade?ticker=${ticker}`;
            
            console.log(`Navigating to trade ${ticker}`);
            
            if (window.app && window.app.router) {
                window.app.router.navigate(tradeUrl);
            } else {
                window.location.href = tradeUrl;
            }
        }
    }

    // UI State Management
    showLoading() {
        document.getElementById('research-placeholder')?.classList.add('hidden');
        document.getElementById('research-results')?.classList.add('hidden');
        document.getElementById('research-loading')?.classList.remove('hidden');
        this.hideError();
    }

    hideLoading() {
        document.getElementById('research-loading')?.classList.add('hidden');
    }

    showDefaultState() {
        document.getElementById('research-placeholder')?.classList.remove('hidden');
        document.getElementById('research-results')?.classList.add('hidden');
        document.getElementById('research-loading')?.classList.add('hidden');
        this.hideError();
    }

    showResults() {
        document.getElementById('research-placeholder')?.classList.add('hidden');
        document.getElementById('research-loading')?.classList.add('hidden');
        document.getElementById('research-results')?.classList.remove('hidden');
        this.hideError();
    }

    showError(message) {
        const errorDiv = document.getElementById('research-error');
        const errorText = document.getElementById('research-error-text');
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        }
        document.getElementById('research-placeholder')?.classList.add('hidden');
        document.getElementById('research-results')?.classList.add('hidden');
        document.getElementById('research-loading')?.classList.add('hidden');
    }

    hideError() {
        document.getElementById('research-error')?.classList.add('hidden');
    }

    showChartLoading() {
        document.getElementById('chart-loading')?.classList.remove('hidden');
        document.getElementById('chart-container')?.classList.add('hidden');
        document.getElementById('chart-error')?.classList.add('hidden');
    }

    showChart() {
        document.getElementById('chart-loading')?.classList.add('hidden');
        document.getElementById('chart-container')?.classList.remove('hidden');
        document.getElementById('chart-error')?.classList.add('hidden');
    }

    showChartError() {
        document.getElementById('chart-loading')?.classList.add('hidden');
        document.getElementById('chart-container')?.classList.add('hidden');
        document.getElementById('chart-error')?.classList.remove('hidden');
    }

    showProfileLoading() {
        document.getElementById('profile-loading')?.classList.remove('hidden');
        document.getElementById('profile-data')?.classList.add('hidden');
        document.getElementById('profile-error')?.classList.add('hidden');
    }

    showProfileData() {
        document.getElementById('profile-loading')?.classList.add('hidden');
        document.getElementById('profile-data')?.classList.remove('hidden');
        document.getElementById('profile-error')?.classList.add('hidden');
    }

    showProfileError() {
        document.getElementById('profile-loading')?.classList.add('hidden');
        document.getElementById('profile-data')?.classList.add('hidden');
        document.getElementById('profile-error')?.classList.remove('hidden');
    }

    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
}