// file: src/templates/research/research-main-layout.js
// Main layout templates for research view
// Focused module: Primary search interface and layout structure exactly as it exists

/** TFC Moved
 * Generate the main research view template
 * @returns {string} HTML template string
 */
export const getMainResearchLayoutTemplate = () => {
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
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 class="text-xl font-semibold text-white">Latest News</h3>
                            <p class="text-gray-400 text-sm mt-1">Recent news and updates</p>
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <div class="flex bg-gray-700 rounded-lg p-1">
                                <button class="news-filter-btn px-3 py-1 text-sm rounded-md transition-all duration-200 bg-cyan-600 text-white" data-filter="all">All</button>
                                <button class="news-filter-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-filter="today">Today</button>
                                <button class="news-filter-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-filter="week">This Week</button>
                            </div>
                            <button id="refresh-news-btn" class="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors duration-200">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <div class="relative">
                            <input 
                                type="text" 
                                id="news-search-input" 
                                placeholder="Search news articles..." 
                                class="w-full bg-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 pr-10 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                            >
                            <div class="absolute right-3 top-2.5">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div id="news-content">
                        <div id="news-loading" class="text-center py-8">
                            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p class="text-gray-400">Loading latest news...</p>
                        </div>
                        
                        <div id="news-articles" class="space-y-4 hidden">
                            <!-- News articles will be rendered here -->
                        </div>
                        
                        <div id="news-empty" class="text-center py-8 hidden">
                            <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                            </svg>
                            <h4 class="text-lg font-semibold text-gray-300 mb-2">No News Found</h4>
                            <p class="text-gray-400">No recent news articles for this stock</p>
                        </div>
                        
                        <div id="news-error" class="text-center py-8 hidden">
                            <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h4 class="text-lg font-semibold text-red-400 mb-2">Unable to Load News</h4>
                            <p class="text-gray-400">There was an error loading news articles</p>
                        </div>
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
};