// file: src/templates/simulation/simulation-sidebar.js
// Sidebar content templates for simulation view
// Focused module: Only sidebar stats and rules templates

import { 
    formatCurrencyWithCommas,
    formatPortfolioChange,
    formatPrice
} from "../../utils/currency-utils.js";

/**
 * Generate the user rank card template
 * @param {number} rank - User's current rank
 * @param {number} totalParticipants - Total number of participants
 * @returns {string} HTML template string
 */
export const getUserRankCardTemplate = (rank = 1, totalParticipants = 0) => {
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-400">Your Rank</h3>
                <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                </div>
            </div>
            <p id="your-rank" class="text-3xl font-bold text-white mb-2">#${rank}</p>
            <p class="text-sm text-gray-400">of <span id="total-participants">${totalParticipants}</span> participants</p>
        </div>
    `;
};

/**
 * Generate the portfolio value card template
 * @param {number} portfolioValue - Current portfolio value
 * @param {number} change - Portfolio change amount
 * @param {number} changePercent - Portfolio change percentage
 * @returns {string} HTML template string
 */
export const getPortfolioValueCardTemplate = (portfolioValue = 10000, change = 0, changePercent = 0) => {
    const _changeClass = change >= 0 ? "text-green-400" : "text-red-400";
    const _changeSign = change >= 0 ? "+" : "";
    const _percentSign = changePercent >= 0 ? "+" : "";
    const changeFormatted = formatPortfolioChange(change, changePercent);

    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-gray-400">Portfolio Value</h3>
                <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                </div>
            </div>
            <p id="sim-portfolio-value" class="text-3xl font-bold text-white mb-2">${formatCurrencyWithCommas(portfolioValue)}</p>
            <p id="sim-portfolio-change" class="text-sm font-medium ${changeFormatted.colorClass}">${changeFormatted.display}</p>
        </div>
    `;
};

/**
 * Generate the simulation rules card template
 * @param {Object} simulation - Simulation data with rules
 * @returns {string} HTML template string
 */
export const getSimulationRulesCardTemplate = (simulation) => {
    const startingBalance = simulation.startingBalance || 10000;
    const allowShortSelling = simulation.rules?.allowShortSelling ? "Allowed" : "Not Allowed";
    const tradingHours = simulation.rules?.tradingHours === "24/7" ? "24/7" : "Market Hours";
    const commission = simulation.rules?.commissionPerTrade || 0;
    
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-white">Simulation Rules</h3>
                <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.586-4.414A2 2 0 0019 5.586a2 2 0 00-2.828 0L13 9"></path>
                    </svg>
                </div>
            </div>
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Starting Balance:</span>
                    <span id="sim-starting-balance" class="text-white font-medium">${formatCurrencyWithCommas(startingBalance)}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Short Selling:</span>
                    <span id="sim-short-selling" class="text-white font-medium">${allowShortSelling}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Trading Hours:</span>
                    <span id="sim-trading-hours" class="text-white font-medium">${tradingHours}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Commission:</span>
                    <span id="sim-commission" class="text-white font-medium">${formatPrice(commission)}</span>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate the simulation timeline card template
 * @param {Object} simulation - Simulation data with dates
 * @returns {string} HTML template string
 */
export const getSimulationTimelineCardTemplate = (simulation) => {
    const startDate = simulation.startDate.toDate ? simulation.startDate.toDate() : new Date(simulation.startDate);
    const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
    const now = new Date();
    const diffTime = endDate - now;
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-white">Timeline</h3>
                <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Start Date:</span>
                    <span class="text-white font-medium">${startDate.toLocaleDateString()}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">End Date:</span>
                    <span class="text-white font-medium">${endDate.toLocaleDateString()}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-gray-400 text-sm">Days Remaining:</span>
                    <span id="days-remaining" class="text-white font-medium">${daysRemaining}</span>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate the complete simulation sidebar template
 * @param {Object} simulation - Simulation data
 * @param {Object} portfolioData - Portfolio stats (value, change, etc.)
 * @param {Object} leaderboardData - Leaderboard data (rank, participants)
 * @returns {string} HTML template string
 */
export const getSimulationSidebarTemplate = (simulation, portfolioData = {}, leaderboardData = {}) => {
    const { portfolioValue = 10000, change = 0, changePercent = 0 } = portfolioData;
    const { rank = 1, totalParticipants = 0 } = leaderboardData;
    
    return `
        <div class="space-y-6">
            ${getUserRankCardTemplate(rank, totalParticipants)}
            ${getPortfolioValueCardTemplate(portfolioValue, change, changePercent)}
            ${getSimulationRulesCardTemplate(simulation)}
            ${getSimulationTimelineCardTemplate(simulation)}
        </div>
    `;
};

/**
 * Generate the sidebar loading template
 * @returns {string} HTML template string
 */
export const getSidebarLoadingTemplate = () => {
    return `
        <div class="space-y-6">
            ${Array(4).fill(0).map(() => `
                <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 animate-pulse">
                    <div class="flex justify-between items-center mb-4">
                        <div class="h-4 bg-gray-700 rounded w-24"></div>
                        <div class="w-10 h-10 bg-gray-700 rounded-lg"></div>
                    </div>
                    <div class="space-y-3">
                        <div class="h-8 bg-gray-700 rounded w-32"></div>
                        <div class="h-4 bg-gray-700 rounded w-20"></div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
};

/**
 * Generate trade action button template
 * @param {Object} simulation - Simulation data
 * @returns {string} HTML template string
 */
export const getTradeActionButtonTemplate = (simulation) => {
    const isActive = simulation.status === "active";
    const isPending = simulation.status === "pending";
    const _isEnded = simulation.status === "ended";
    
    let buttonText = "View Portfolio";
    let buttonClass = "bg-gray-600 hover:bg-gray-500";
    
    if (isPending) {
        buttonText = "Practice Trade";
        buttonClass = "bg-yellow-600 hover:bg-yellow-500";
    } else if (isActive) {
        buttonText = "Trade Now";
        buttonClass = "bg-cyan-600 hover:bg-cyan-500";
    }
    
    return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <button id="trade-btn" class="${buttonClass} w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                <span id="trade-btn-text">${buttonText}</span>
            </button>
        </div>
    `;
};