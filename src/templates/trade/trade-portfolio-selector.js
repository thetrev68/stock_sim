// // file: src/templates/trade/trade-portfolio-selector.js
// // Portfolio selector templates for trade view
// // Focused module: Portfolio context selection exactly as it exists

// /** TFC Move
//  * Generate portfolio selector dropdown template
//  * @returns {string} HTML template string
//  */
// export const getPortfolioSelectorTemplate = () => {
//     return `
//         <div class="mb-6">
//             <label for="portfolio-selector" class="block text-sm font-medium text-gray-300 mb-2">Select Portfolio Context</label>
//             <div class="relative">
//                 <select 
//                     id="portfolio-selector" 
//                     class="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-48"
//                 >
//                     <option value="">Loading portfolios...</option>
//                 </select>
//             </div>
//         </div>
//     `;
// };

// /** TFC Move
//  * Generate portfolio selector loading template
//  * @returns {string} HTML template string
//  */
// export const getPortfolioSelectorLoadingTemplate = () => {
//     return `
//         <div class="mb-6">
//             <label for="portfolio-selector" class="block text-sm font-medium text-gray-300 mb-2">Select Portfolio Context</label>
//             <div class="relative">
//                 <select 
//                     id="portfolio-selector" 
//                     class="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-48"
//                     disabled
//                 >
//                     <option value="">Loading portfolios...</option>
//                 </select>
//                 <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
//                     <div class="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /** TFC Move
//  * Generate portfolio selector with options template
//  * @param {Array} portfolios - Array of portfolio options
//  * @returns {string} HTML template string
//  */
// export const getPortfolioSelectorWithOptionsTemplate = (portfolios = []) => {
//     const portfolioOptions = portfolios.map(portfolio => 
//         `<option value="${portfolio.value}">${portfolio.label}</option>`
//     ).join("");

//     return `
//         <div class="mb-6">
//             <label for="portfolio-selector" class="block text-sm font-medium text-gray-300 mb-2">Select Portfolio Context</label>
//             <div class="relative">
//                 <select 
//                     id="portfolio-selector" 
//                     class="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-48"
//                 >
//                     <option value="">Select a portfolio...</option>
//                     ${portfolioOptions}
//                 </select>
//             </div>
//         </div>
//     `;
// };

// /** TFC Move
//  * Generate context info display template
//  * @returns {string} HTML template string
//  */
// export const getContextInfoTemplate = () => {
//     return `
//         <div id="context-info" class="mt-4 p-3 bg-gray-700 rounded-lg hidden">
//             <div class="flex items-center gap-3">
//                 <div id="context-indicator" class="w-3 h-3 bg-cyan-400 rounded-full"></div>
//                 <div>
//                     <p id="context-title" class="text-white font-medium">Solo Practice Mode</p>
//                     <p id="context-description" class="text-gray-400 text-sm">Trade with your personal portfolio</p>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /** TFC Move
//  * Generate solo practice context template
//  * @returns {string} HTML template string
//  */
// export const getSoloPracticeContextTemplate = () => {
//     return `
//         <div id="context-info" class="mt-4 p-3 bg-gray-700 rounded-lg">
//             <div class="flex items-center gap-3">
//                 <div id="context-indicator" class="w-3 h-3 bg-cyan-400 rounded-full"></div>
//                 <div>
//                     <p id="context-title" class="text-white font-medium">Solo Practice Mode</p>
//                     <p id="context-description" class="text-gray-400 text-sm">Trade with your personal portfolio</p>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /** TFC Move
//  * Generate simulation context template
//  * @param {Object} simulation - Simulation data
//  * @returns {string} HTML template string
//  */
// export const getSimulationContextTemplate = (simulation = {}) => {
//     let description = "";
//     if (simulation.status === "active") {
//         const endDate = simulation.endDate && simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
//         const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
//         description = `Active simulation • ${daysRemaining} days remaining`;
//     } else if (simulation.status === "pending") {
//         description = "Simulation starting soon";
//     } else {
//         description = "Simulation ended";
//     }

//     return `
//         <div id="context-info" class="mt-4 p-3 bg-gray-700 rounded-lg">
//             <div class="flex items-center gap-3">
//                 <div id="context-indicator" class="w-3 h-3 bg-purple-400 rounded-full"></div>
//                 <div>
//                     <p id="context-title" class="text-white font-medium">${simulation.name || "Trading Simulation"}</p>
//                     <p id="context-description" class="text-gray-400 text-sm">${description}</p>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// /** TFC Move
//  * Generate portfolio context section template
//  * @returns {string} HTML template string
//  */
// export const getPortfolioContextSectionTemplate = () => {
//     return `
//         <section class="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-8">
//             <div class="p-6">
//                 <h1 class="text-2xl font-bold text-white mb-6">Trading Center</h1>
                
//                 <!-- Portfolio Selection -->
//                 ${getPortfolioSelectorTemplate()}
                
//                 <!-- Context Info -->
//                 ${getContextInfoTemplate()}
//             </div>
//         </section>
//     `;
// };

// /** TFC Move
//  * Generate portfolio selector error template
//  * @returns {string} HTML template string
//  */
// export const getPortfolioSelectorErrorTemplate = () => {
//     return `
//         <div class="mb-6">
//             <label for="portfolio-selector" class="block text-sm font-medium text-gray-300 mb-2">Select Portfolio Context</label>
//             <div class="relative">
//                 <select 
//                     id="portfolio-selector" 
//                     class="bg-gray-700 text-white rounded-lg px-4 py-2 border border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 min-w-48"
//                     disabled
//                 >
//                     <option value="">Error loading portfolios</option>
//                 </select>
//                 <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
//                     <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                     </svg>
//                 </div>
//             </div>
//             <p class="text-red-400 text-sm mt-1">Failed to load portfolio options. Please refresh the page.</p>
//         </div>
//     `;
// };

// /** TFC Move
//  * Generate complete portfolio selector with all states template
//  * @param {Object} options - Configuration options
//  * @returns {string} HTML template string
//  */
// export const getCompletePortfolioSelectorTemplate = (options = {}) => {
//     const { portfolios = [], loading = false, error = false } = options;
    
//     if (error) {
//         return getPortfolioSelectorErrorTemplate();
//     }
    
//     if (loading) {
//         return getPortfolioSelectorLoadingTemplate();
//     }
    
//     if (portfolios.length > 0) {
//         return getPortfolioSelectorWithOptionsTemplate(portfolios);
//     }
    
//     return getPortfolioSelectorTemplate();
// };