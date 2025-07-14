// file: src/templates/research/research-charts.js
// Chart container templates for research view
// Focused module: Chart loading, containers, and error states exactly as they exist

/**
 * Generate chart loading state template
 * @returns {string} HTML template string
 */
export const getChartLoadingTemplate = () => {
    return `
        <div class="text-center py-8">
            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-400">Loading chart...</p>
        </div>
    `;
};

/**
 * Generate chart container template
 * @returns {string} HTML template string
 */
export const getChartContainerTemplate = () => {
    return `
        <div>
            <canvas id="price-chart" width="400" height="200"></canvas>
        </div>
    `;
};

/**
 * Generate chart error state template
 * @returns {string} HTML template string
 */
export const getChartErrorTemplate = () => {
    return `
        <div class="text-center py-8">
            <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <p class="text-gray-400">Unable to load chart data</p>
        </div>
    `;
};

/**
 * Generate alternative chart loading template (from different section)
 * @returns {string} HTML template string
 */
export const getAlternativeChartLoadingTemplate = () => {
    return `
        <div class="flex items-center justify-center py-12">
            <div class="text-center">
                <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gray-400">Loading chart data...</p>
            </div>
        </div>
    `;
};

/**
 * Generate alternative chart container template (larger canvas)
 * @returns {string} HTML template string
 */
export const getAlternativeChartContainerTemplate = () => {
    return `
        <div>
            <canvas id="price-chart" width="800" height="400"></canvas>
        </div>
    `;
};

/**
 * Generate alternative chart error template (larger icon)
 * @returns {string} HTML template string
 */
export const getAlternativeChartErrorTemplate = () => {
    return `
        <div class="text-center py-12">
            <div class="text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p>Unable to load chart data</p>
            </div>
        </div>
    `;
};

/**
 * Generate chart period buttons template
 * @returns {string} HTML template string
 */
export const getChartPeriodButtonsTemplate = () => {
    return `
        <div class="flex bg-gray-700 rounded-lg p-1">
            <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 bg-cyan-600 text-white" data-period="7" data-resolution="D">7D</button>
            <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-period="30" data-resolution="D">1M</button>
            <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-period="90" data-resolution="D">3M</button>
            <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-period="180" data-resolution="D">6M</button>
            <button class="chart-period-btn px-3 py-1 text-sm rounded-md transition-all duration-200 text-gray-300 hover:text-white" data-period="365" data-resolution="D">1Y</button>
        </div>
    `;
};

/**
 * Generate chart refresh button template
 * @returns {string} HTML template string
 */
export const getChartRefreshButtonTemplate = () => {
    return `
        <button id="refresh-chart-btn" class="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors duration-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
        </button>
    `;
};

/**
 * Generate chart header with controls template
 * @returns {string} HTML template string
 */
export const getChartHeaderTemplate = () => {
    return `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h3 class="text-xl font-semibold text-white">Price Chart</h3>
                <p class="text-gray-400 text-sm mt-1">Historical price movement</p>
            </div>
            
            <div class="flex items-center gap-2">
                ${getChartPeriodButtonsTemplate()}
                ${getChartRefreshButtonTemplate()}
            </div>
        </div>
    `;
};

/**
 * Generate simple chart header template (from main layout)
 * @returns {string} HTML template string
 */
export const getSimpleChartHeaderTemplate = () => {
    return `
        <h4 class="text-xl font-bold text-white mb-4">Price Chart</h4>
    `;
};

/**
 * Generate chart section with all states template
 * @returns {string} HTML template string
 */
export const getChartSectionTemplate = () => {
    return `
        <div class="relative">
            <!-- Chart Loading State -->
            <div id="chart-loading" class="hidden">
                ${getChartLoadingTemplate()}
            </div>
            
            <!-- Chart Container -->
            <div id="chart-container" class="hidden">
                ${getChartContainerTemplate()}
            </div>
            
            <!-- Chart Error State -->
            <div id="chart-error" class="hidden">
                ${getChartErrorTemplate()}
            </div>
        </div>
    `;
};

/**
 * Generate alternative chart section template (different layout)
 * @returns {string} HTML template string
 */
export const getAlternativeChartSectionTemplate = () => {
    return `
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
    `;
};

/**
 * Generate complete chart card template (with header and controls)
 * @returns {string} HTML template string
 */
export const getCompleteChartCardTemplate = () => {
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            ${getChartHeaderTemplate()}
            ${getAlternativeChartSectionTemplate()}
        </div>
    `;
};

/**
 * Generate simple chart card template (main layout version)
 * @returns {string} HTML template string
 */
export const getSimpleChartCardTemplate = () => {
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            ${getSimpleChartHeaderTemplate()}
            ${getChartSectionTemplate()}
        </div>
    `;
};