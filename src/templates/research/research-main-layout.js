// file: src/templates/research/research-main-layout.js
// Main layout templates for research view
// Focused module: Primary search interface and layout structure

/**
 * Generate the main research view template
 * @returns {string} HTML template string
 */
export const getMainResearchLayoutTemplate = () => {
    return `
        <div class="research-view">
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
                <h2 class="text-2xl font-bold text-white mb-4">Stock Research</h2>
                <p class="text-gray-400 mb-6">Enter a stock ticker symbol to research company information, price data, and recent news.</p>
                
                <!-- Search Interface -->
                <div class="relative">
                    <div class="flex gap-3">
                        <div class="flex-1 relative">
                            <input 
                                type="text" 
                                id="research-ticker-input"
                                placeholder="Enter ticker symbol (e.g., AAPL, TSLA, MSFT)"
                                class="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent uppercase"
                                maxlength="10"
                                autocomplete="off"
                            >
                            
                            <!-- Search Results Dropdown -->
                            <div id="search-results" class="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 hidden max-h-64 overflow-y-auto">
                                <div id="search-results-list" class="py-2">
                                    <!-- Search results will be populated here -->
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            id="research-button"
                            class="px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Research
                        </button>
                    </div>
                </div>
            </div>

            <!-- Research Results Section -->
            <div id="research-results" class="hidden">
                <!-- Stock Quote Header -->
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border border-gray-700">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <!-- Company Header Info -->
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 id="company-name" class="text-2xl font-bold text-white">Company Name</h3>
                                <span id="quote-ticker" class="text-lg font-semibold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded">TICKER</span>
                            </div>
                            <div class="flex flex-wrap gap-4 text-sm text-gray-400">
                                <span>Exchange: <span id="company-exchange" class="text-white">--</span></span>
                                <span>Sector: <span id="company-sector" class="text-white">--</span></span>
                                <span>Currency: <span id="company-currency" class="text-white">--</span></span>
                            </div>
                        </div>
                        
                        <!-- Price Information -->
                        <div class="text-right">
                            <div class="text-3xl font-bold text-white mb-1">
                                $<span id="current-price">0.00</span>
                            </div>
                            <div id="price-change" class="text-lg font-semibold text-gray-400">
                                ↗ 0.00 (0.00%)
                            </div>
                        </div>
                    </div>

                    <!-- Quick Stats Row -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
                        <div class="text-center">
                            <p class="text-gray-400 text-sm">Open</p>
                            <p class="text-white font-semibold">$<span id="open-price">--</span></p>
                        </div>
                        <div class="text-center">
                            <p class="text-gray-400 text-sm">Day High</p>
                            <p class="text-white font-semibold">$<span id="day-high">--</span></p>
                        </div>
                        <div class="text-center">
                            <p class="text-gray-400 text-sm">Day Low</p>
                            <p class="text-white font-semibold">$<span id="day-low">--</span></p>
                        </div>
                        <div class="text-center">
                            <p class="text-gray-400 text-sm">Volume</p>
                            <p class="text-white font-semibold"><span id="volume">--</span></p>
                        </div>
                    </div>
                </div>

                <!-- Chart and Profile Grid -->
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                    <!-- Price Chart -->
                    <div class="xl:col-span-2">
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                            <h4 class="text-xl font-bold text-white mb-4">Price Chart</h4>
                            
                            <!-- Chart Loading State -->
                            <div id="chart-loading" class="text-center py-8 hidden">
                                <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p class="text-gray-400">Loading chart...</p>
                            </div>
                            
                            <!-- Chart Container -->
                            <div id="chart-container" class="hidden">
                                <canvas id="price-chart" width="400" height="200"></canvas>
                            </div>
                            
                            <!-- Chart Error State -->
                            <div id="chart-error" class="text-center py-8 hidden">
                                <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <p class="text-gray-400">Unable to load chart data</p>
                            </div>
                        </div>
                    </div>

                    <!-- Company Profile -->
                    <div class="xl:col-span-1">
                        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                            <h4 class="text-xl font-bold text-white mb-4">Company Profile</h4>
                            
                            <!-- Profile Loading State -->
                            <div id="profile-loading" class="text-center py-8 hidden">
                                <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p class="text-gray-400">Loading profile...</p>
                            </div>
                            
                            <!-- Profile Data -->
                            <div id="profile-data" class="space-y-4 hidden">
                                <div>
                                    <p class="text-gray-400 text-sm mb-1">Market Cap</p>
                                    <p id="market-cap" class="text-white font-semibold">--</p>
                                </div>
                                <div>
                                    <p class="text-gray-400 text-sm mb-1">P/E Ratio</p>
                                    <p id="pe-ratio" class="text-white font-semibold">--</p>
                                </div>
                                <div>
                                    <p class="text-gray-400 text-sm mb-1">52-Week Range</p>
                                    <p id="week-range" class="text-white font-semibold">--</p>
                                </div>
                                <div>
                                    <p class="text-gray-400 text-sm mb-1">Industry</p>
                                    <p id="industry" class="text-white font-semibold">--</p>
                                </div>
                                <div>
                                    <p class="text-gray-400 text-sm mb-1">Description</p>
                                    <p id="company-description" class="text-gray-300 text-sm leading-relaxed">--</p>
                                </div>
                            </div>
                            
                            <!-- Profile Error State -->
                            <div id="profile-error" class="text-center py-8 hidden">
                                <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <p class="text-gray-400">Unable to load profile data</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- News Section -->
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h4 class="text-xl font-bold text-white">Recent News</h4>
                        
                        <!-- News Filters -->
                        <div class="flex flex-col sm:flex-row gap-3">
                            <!-- Filter Dropdown -->
                            <select 
                                id="news-filter" 
                                class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="all">All News</option>
                                <option value="general">General</option>
                                <option value="earnings">Earnings</option>
                                <option value="merger">Mergers</option>
                                <option value="ipo">IPO</option>
                            </select>
                            
                            <!-- Search Input -->
                            <input 
                                type="text" 
                                id="news-search"
                                placeholder="Search news..."
                                class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                        </div>
                    </div>

                    <!-- News Loading State -->
                    <div id="news-loading" class="text-center py-8 hidden">
                        <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p class="text-gray-400">Loading latest news...</p>
                    </div>

                    <!-- News Articles Container -->
                    <div id="news-articles" class="hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- News articles will be populated here -->
                        </div>
                    </div>

                    <!-- Empty News State -->
                    <div id="news-empty" class="text-center py-8 hidden">
                        <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                            </svg>
                        </div>
                        <p class="text-gray-400">No news articles found</p>
                    </div>

                    <!-- News Error State -->
                    <div id="news-error" class="text-center py-8 hidden">
                        <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <p class="text-gray-400">Unable to load news articles</p>
                    </div>
                </div>
            </div>

            <!-- Default/Placeholder State -->
            <div id="research-placeholder" class="text-center py-16">
                <div class="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Research a Stock</h3>
                <p class="text-gray-400 max-w-md mx-auto">Enter a ticker symbol above to get comprehensive stock information, charts, and news.</p>
            </div>

            <!-- Loading State -->
            <div id="research-loading" class="text-center py-16 hidden">
                <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p class="text-gray-400">Researching stock data...</p>
            </div>

            <!-- Error State -->
            <div id="research-error" class="text-center py-16 hidden">
                <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Research Error</h3>
                <p id="research-error-text" class="text-gray-400 max-w-md mx-auto">An error occurred while fetching stock data.</p>
            </div>
        </div>
    `;
};