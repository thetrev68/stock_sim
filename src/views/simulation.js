// src/views/simulation.js - Enhanced with Leaderboards - Session 9
// Simulation view with member management, activity tracking, and leaderboards

// Core Services
import { SimulationService } from "../services/simulation.js";
import { AuthService } from "../services/auth.js";
import { ActivityService } from "../services/activity.js";
import { LeaderboardService } from "../services/leaderboard.js";
import { getPortfolio, initializePortfolio, getRecentTrades } from "../services/trading.js";

// Components
import { LeaderboardOverview } from "../components/simulation/LeaderboardOverview.js";
import { LeaderboardTable } from "../components/simulation/LeaderboardTable.js";

// Constants
import { REFRESH_INTERVALS } from "../constants/app-config.js";
import { SIMULATION_STATUS, MEMBER_STATUS } from "../constants/simulation-status.js";
import { TRADE_TYPE_CONFIG } from "../constants/trade-types.js";
import { SUCCESS_MESSAGES, INFO_MESSAGES } from "../constants/ui-messages.js";

// Utilities
import { formatDateRange, calculateDaysRemaining } from "../utils/date-utils.js";
import { formatCurrencyWithCommas, formatPrice } from "../utils/currency-utils.js";
import { capitalize } from "../utils/string-utils.js";

// Templates
import { getSimulationLoadingTemplate } from "../templates/simulation/ui-messages.js";
import { 
    getSimulationNotFoundTemplate, 
    getSimulationLoadingErrorTemplate,
    getPortfolioErrorTemplate,
    getMembersErrorTemplate,
    getActivitiesErrorTemplate 
} from "../templates/simulation/error-states.js";
import { getMemberCardTemplate } from "../templates/simulation/member-components.js";
import { 
    getTabNavigationAndContentTemplate,
    getSimulationRulesSectionTemplate,
    getHeaderSectionTemplate 
} from "../templates/simulation/simulation-layout.js";
import {
    getMemberManagementModalTemplate,
    getSimulationSettingsModalTemplate
} from "../templates/simulation/simulation-modals.js";
import { getMainStatsCardsTemplate } from "../templates/simulation/simulation-sidebar.js";
import { 
    getActivityElementTemplate, 
    getEmptyActivityFeedTemplate 
} from "../templates/simulation/activity-components.js";
import { 
    getHoldingElementTemplate, 
    getTradeElementTemplate 
} from "../templates/simulation/portfolio-components.js";
import { 
    getArchivePromptBannerTemplate,
    getArchiveSuccessInfoBannerTemplate,
    getShowTemporaryMessageTemplate
} from "../templates/simulation/notification-components.js";

export default class SimulationView {
    constructor() {
        this.name = "simulation";
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.activityService = new ActivityService();
        this.leaderboardService = new LeaderboardService();
        this.leaderboardOverview = new LeaderboardOverview();
        this.leaderboardTable = new LeaderboardTable();
        this.currentSimulation = null;
        this.currentUser = null;
        this.simulationId = null;
        this.simulationPortfolio = null;
        this.simulationMembers = [];
        this.simulationActivities = [];
        this.leaderboardData = null;
        this.refreshInterval = null;
        this.leaderboardRefreshInterval = null;
    }

    async render(container) {
        // Extract simulation ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.simulationId = urlParams.get("sim");

        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
        
        setTimeout(async () => {
            await this.loadData();
            this.startAutoRefresh();
        }, 0);
    }

    getTemplate() {
        return `
            <div class="simulation-view">
                ${getSimulationLoadingTemplate()}

                ${getSimulationNotFoundTemplate()}

                <div id="simulation-content" class="hidden">
                    ${getHeaderSectionTemplate()}

                    ${getMainStatsCardsTemplate()}

                    ${getTabNavigationAndContentTemplate()}

                    ${getSimulationRulesSectionTemplate()}
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        // Trade button
        const tradeBtn = container.querySelector("#trade-in-sim-btn");
        const startTradingBtn = container.querySelector("#start-trading-btn");
        
        [tradeBtn, startTradingBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener("click", () => this.handleTradeNavigation());
            }
        });

        // Navigation buttons
        const membersBtn = container.querySelector("#view-members-btn");
        const leaderboardBtn = container.querySelector("#view-leaderboard-btn");
        
        if (membersBtn) {
            membersBtn.addEventListener("click", () => this.showMembersTab());
        }

        if (leaderboardBtn) {
            leaderboardBtn.addEventListener("click", () => this.showLeaderboardTab());
        }

        // Tab navigation
        const tabBtns = container.querySelectorAll(".tab-btn");
        tabBtns.forEach(btn => {
            btn.addEventListener("click", (e) => this.switchTab(e.target.id));
        });

        // Member management button
        const manageMembersBtn = container.querySelector("#manage-members-btn");
        if (manageMembersBtn) {
            manageMembersBtn.addEventListener("click", () => this.handleMemberManagement());
        }

        // Add this after the existing manageMembersBtn event listener
        const settingsBtn = container.querySelector("#simulation-settings-btn");
        if (settingsBtn) {
            settingsBtn.addEventListener("click", () => this.handleSimulationSettings());
        }
    }

    async loadData() {
        this.currentUser = this.authService.getCurrentUser();
        
        if (!this.currentUser) {
            console.log("No user signed in for simulation view.");
            return;
        }

        if (!this.simulationId) {
            this.showNotFound();
            return;
        }

        try {
            // Initialize services
            this.simulationService.initialize();
            this.activityService.initialize();
            this.leaderboardService.initialize();
            
            // Load simulation details with status refresh
            this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            
            if (!this.currentSimulation) {
                this.showNotFound();
                return;
            }

            // PHASE 3 FIX: Force refresh status to fix sync issues
            try {
                const statusRefresh = await this.simulationService.refreshSimulationStatus(this.simulationId);
                if (statusRefresh.updated) {
                    console.log("Status was updated during load:", statusRefresh);
                    // Reload simulation with fresh status
                    this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
                }
            } catch (error) {
                console.warn("Could not refresh simulation status:", error);
            }

            // Check if user is a member
            const isMember = await this.simulationService.isUserMemberOfSimulation(this.simulationId, this.currentUser.uid);
            
            if (!isMember) {
                this.showNotFound();
                return;
            }

            // Load all data in parallel for better performance
            await Promise.all([
                this.loadSimulationMembers(),
                this.loadSimulationActivities(),
                this.loadSimulationPortfolio(),
                this.loadLeaderboard()
            ]);

            // Display simulation data
            this.displaySimulation();
            
            // PHASE 3 ADDITION: Check if simulation should be archived
            if (this.currentSimulation.status === SIMULATION_STATUS.ENDED && !this.currentSimulation.archived) {
                this.showArchivePrompt();
            }
            
        } catch (error) {
            console.error("Error loading simulation:", error);
            this.showError();
        }
    }

    async loadLeaderboard() {
        try {
            console.log("Loading leaderboard...");
            this.leaderboardData = await this.leaderboardService.getLeaderboard(
                this.simulationId, 
                false, // Don't force refresh on initial load
                this.currentSimulation
            );
            
            // Update user rank in header
            this.updateUserRankDisplay();
            
            console.log("Leaderboard loaded:", this.leaderboardData);
        } catch (error) {
            console.error("Error loading leaderboard:", error);
            // Don't fail the entire view if leaderboard fails
        }
    }

    async refreshLeaderboard() {
        try {
            console.log("Refreshing leaderboard...");
            this.leaderboardData = await this.leaderboardService.getLeaderboard(
                this.simulationId, 
                true, // Force refresh
                this.currentSimulation
            );
            
            // Update displays
            this.updateUserRankDisplay();
            this.renderLeaderboardComponents();
            
            console.log("Leaderboard refreshed successfully");
        } catch (error) {
            console.error("Error refreshing leaderboard:", error);
            throw error; // Re-throw so UI can handle error state
        }
    }

    updateUserRankDisplay() {
        if (!this.leaderboardData || !this.currentUser) return;

        const userRanking = this.leaderboardData.rankings?.find(r => r.userId === this.currentUser.uid);
        
        // Update rank in header cards
        const yourRankEl = document.getElementById("your-rank");
        const totalParticipantsEl = document.getElementById("total-participants");
        
        if (yourRankEl && userRanking) {
            yourRankEl.textContent = `#${userRanking.rank}`;
        }
        
        if (totalParticipantsEl && this.leaderboardData.totalParticipants) {
            totalParticipantsEl.textContent = this.leaderboardData.totalParticipants;
        }
    }

    renderLeaderboardComponents() {
        if (!this.leaderboardData) return;

        // Render leaderboard overview
        const overviewContainer = document.getElementById("leaderboard-overview-container");
        if (overviewContainer) {
            this.leaderboardOverview.render(
                overviewContainer,
                this.leaderboardData,
                this.currentUser?.uid,
                () => this.refreshLeaderboard()
            );
        }

        // Render leaderboard table
        const tableContainer = document.getElementById("leaderboard-table-container");
        if (tableContainer && this.leaderboardData.rankings) {
            this.leaderboardTable.render(
                tableContainer,
                this.leaderboardData.rankings,
                this.currentUser?.uid,
                (userId, userName) => {
                    console.log(`View details for user: ${userName}`);
                    // Could show user detail modal here
                }
            );
        }
    }

    async loadSimulationMembers() {
        try {
            this.simulationMembers = await this.simulationService.getSimulationMembers(this.simulationId);
            console.log("Loaded simulation members:", this.simulationMembers);
            this.displayMembers();
        } catch (error) {
            console.error("Error loading simulation members:", error);
            this.showMembersError();
        }
    }

    async loadSimulationActivities() {
        try {
            this.simulationActivities = await this.activityService.getSimulationActivities(this.simulationId, 15);
            console.log("Loaded simulation activities:", this.simulationActivities);
            this.displayActivities();
        } catch (error) {
            console.error("Error loading simulation activities:", error);
            this.showActivitiesError();
        }
    }

    async loadSimulationPortfolio() {
        try {
            // Initialize portfolio if it doesn't exist
            await initializePortfolio(
                this.currentUser.uid, 
                this.currentSimulation.startingBalance, 
                this.simulationId, 
                this.currentSimulation
            );

            // Load portfolio data
            this.simulationPortfolio = await getPortfolio(this.currentUser.uid, this.simulationId);
            
            // Load UI components
            setTimeout(() => {
                this.loadHoldings();
                this.loadRecentTrades();
            }, 0);
            
        } catch (error) {
            console.error("Error loading simulation portfolio:", error);
            this.showPortfolioError();
        }
    }

    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.classList.remove("border-cyan-500", "text-cyan-400", "bg-gray-750");
            btn.classList.add("border-transparent", "text-gray-400");
        });

        // Hide all tab content
        document.querySelectorAll(".tab-content").forEach(content => {
            content.classList.add("hidden");
        });

        // Show selected tab
        const activeBtn = document.getElementById(tabId);
        const contentId = tabId.replace("tab-", "content-");
        const activeContent = document.getElementById(contentId);

        if (activeBtn) {
            activeBtn.classList.add("border-cyan-500", "text-cyan-400", "bg-gray-750");
            activeBtn.classList.remove("border-transparent", "text-gray-400");
        }

        if (activeContent) {
            activeContent.classList.remove("hidden");
        }

        // Render leaderboard components when tab is shown
        if (tabId === "tab-leaderboard") {
            this.renderLeaderboardComponents();
        }

        // Update button text based on active tab
        this.updateNavigationButtonText(tabId);
    }

    updateNavigationButtonText(activeTabId) {
        const membersBtnText = document.getElementById("members-btn-text");
        const leaderboardBtnText = document.getElementById("leaderboard-btn-text");
        
        if (membersBtnText && leaderboardBtnText) {
            // Reset to default text
            membersBtnText.textContent = "Members";
            leaderboardBtnText.textContent = "Leaderboard";
            
            // Update based on current tab
            if (activeTabId === "tab-members") {
                membersBtnText.textContent = "Portfolio";
            } else if (activeTabId === "tab-leaderboard") {
                leaderboardBtnText.textContent = "Portfolio";
            }
        }
    }

    showLeaderboardTab() {
        this.switchTab("tab-leaderboard");
    }

    showMembersTab() {
        this.switchTab("tab-members");
    }

    startAutoRefresh() {
        // Refresh member data and activities every 30 seconds
        this.refreshInterval = setInterval(async () => {
            try {
                await Promise.all([
                    this.loadSimulationMembers(),
                    this.loadSimulationActivities()
                ]);
            } catch (error) {
                console.error("Auto-refresh error:", error);
            }
        }, REFRESH_INTERVALS.SIMULATION_DATA);

        // Refresh leaderboard every 2 minutes (less frequent since it's more expensive)
        this.leaderboardRefreshInterval = setInterval(async () => {
            try {
                await this.loadLeaderboard();
                
                // Re-render if leaderboard tab is active
                const activeTab = document.querySelector(".tab-btn.border-cyan-500");
                if (activeTab && activeTab.id === "tab-leaderboard") {
                    this.renderLeaderboardComponents();
                }
            } catch (error) {
                console.error("Leaderboard auto-refresh error:", error);
            }
        }, REFRESH_INTERVALS.LEADERBOARD);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        if (this.leaderboardRefreshInterval) {
            clearInterval(this.leaderboardRefreshInterval);
            this.leaderboardRefreshInterval = null;
        }
    }

    // Clean up when view is destroyed
    destroy() {
        this.stopAutoRefresh();
    }

    // [Include all the existing methods from the original simulation.js file]
    // displayMembers, createMemberCard, getTimeAgo, isCurrentUserCreator, 
    // handleKickMember, handleMemberManagement, displayActivities, createActivityElement,
    // showActivitiesError, showMembersError, loadHoldings, createHoldingElement,
    // loadRecentTrades, createTradeElement, displaySimulation, updatePortfolioStats,
    // updateSimulationRules, showPortfolioError, handleTradeNavigation, showNotFound, showError

    // [Copy all existing methods here - keeping them exactly the same]
    
    displayMembers() {
        const membersLoading = document.getElementById("members-loading");
        const membersList = document.getElementById("members-list");
        
        if (membersLoading) membersLoading.classList.add("hidden");
        if (membersList) {
            membersList.classList.remove("hidden");
            membersList.innerHTML = "";

            this.simulationMembers.forEach(member => {
                const memberCard = this.createMemberCard(member);
                membersList.appendChild(memberCard);
            });
        }

        // Show creator actions if current user is creator
        const isCreator = this.simulationMembers.some(member => 
            member.userId === this.currentUser.uid && member.role === "creator"
        );
        
        const creatorActions = document.getElementById("creator-actions");
        if (creatorActions && isCreator) {
            creatorActions.classList.remove("hidden");
        }
    }

    createMemberCard(member) {
        const memberDiv = document.createElement("div");
        memberDiv.className = "bg-gray-700 p-4 rounded-lg flex justify-between items-center";
        
        const isCreator = this.isCurrentUserCreator();
        memberDiv.innerHTML = getMemberCardTemplate(member, this.currentUser, isCreator);

        // Attach kick member event listener (existing code stays the same)
        const kickBtn = memberDiv.querySelector(".kick-member-btn");
        if (kickBtn) {
            kickBtn.addEventListener("click", (e) => {
                const userId = e.target.dataset.userId;
                const userName = e.target.dataset.userName;
                this.handleKickMember(userId, userName);
            });
        }

        return memberDiv;
    }

    isCurrentUserCreator() {
        return this.simulationMembers.some(member => 
            member.userId === this.currentUser.uid && member.role === "creator"
        );
    }

    async handleKickMember(userId, userName) {
        const confirmed = confirm(`Are you sure you want to remove ${userName} from this simulation?\n\nThis will:\n• Remove them from the leaderboard\n• Preserve their trading history\n• Prevent them from rejoining\n\nThis action cannot be undone.`);
        
        if (!confirmed) return;

        try {
            // Show loading state
            const kickButtons = document.querySelectorAll(`[data-user-id="${userId}"]`);
            kickButtons.forEach(btn => {
                btn.disabled = true;
                btn.textContent = "Removing...";
            });

            // Remove member via simulation service
            await this.simulationService.removeMemberFromSimulation(
                this.simulationId, 
                userId, 
                this.currentUser.uid
            );

            // Show success message
            this.showTemporaryMessage(`${userName} has been removed from the simulation.`, "success");

            // Reload member data
            await this.loadSimulationMembers();
            
            // Also reload leaderboard since member count changed
            await this.loadLeaderboard();

        } catch (error) {
            console.error("Error removing member:", error);
            
            // Reset button states
            const kickButtons = document.querySelectorAll(`[data-user-id="${userId}"]`);
            kickButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = "Remove";
            });
            
            // Show error message
            this.showTemporaryMessage(`Failed to remove ${userName}: ${error.message}`, "error");
        }
    }

    async handleMemberManagement() {
        try {
            // Load detailed member statistics
            const memberStats = await this.simulationService.getMemberStatistics(
                this.simulationId, 
                this.currentUser.uid
            );

            this.showMemberManagementModal(memberStats);

        } catch (error) {
            console.error("Error loading member statistics:", error);
            alert(`Failed to load member management: ${error.message}`);
        }
    }

    showMemberManagementModal(memberStats) {
        // Remove existing modal if any
        const existingModal = document.getElementById("member-management-modal");
        if (existingModal) {
            existingModal.remove();
        }

        const activeMemberCount = memberStats.filter(m => m.status === MEMBER_STATUS.ACTIVE).length;
        const removedMemberCount = memberStats.filter(m => m.status === MEMBER_STATUS.REMOVED).length;

        const modalHTML = getMemberManagementModalTemplate(memberStats, activeMemberCount, removedMemberCount, this.currentUser);

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        // Attach event listeners
        document.getElementById("close-management-modal")?.addEventListener("click", () => {
            document.getElementById("member-management-modal")?.remove();
        });
        
        document.getElementById("close-management-modal-btn")?.addEventListener("click", () => {
            document.getElementById("member-management-modal")?.remove();
        });

        // Close on outside click
        document.getElementById("member-management-modal")?.addEventListener("click", (e) => {
            if (e.target.id === "member-management-modal") {
                e.target.remove();
            }
        });
    }

    displayActivities() {
        const activityFeed = document.getElementById("activity-feed");
        
        if (!activityFeed) return;

        if (this.simulationActivities.length === 0) {
            activityFeed.innerHTML = getEmptyActivityFeedTemplate();
        } else {
            activityFeed.innerHTML = "";
            this.simulationActivities.forEach(activity => {
                const activityElement = this.createActivityElement(activity);
                activityFeed.appendChild(activityElement);
            });
        }
    }

    createActivityElement(activity) {
        const formattedActivity = this.activityService.formatActivity(activity);
        const element = document.createElement("div");
        element.className = "bg-gray-700 p-4 rounded-lg flex items-start gap-3";
        
        element.innerHTML = getActivityElementTemplate(formattedActivity);
        
        return element;
    }

    showActivitiesError() {
        const activityFeed = document.getElementById("activity-feed");
        if (activityFeed) {
            activityFeed.innerHTML = getActivitiesErrorTemplate();
        }
    }

    showMembersError() {
        const membersLoading = document.getElementById("members-loading");
        const membersList = document.getElementById("members-list");
        
        if (membersLoading) membersLoading.classList.add("hidden");
        if (membersList) {
            membersList.innerHTML = getMembersErrorTemplate();
            membersList.classList.remove("hidden");
        }
    }

    async loadHoldings() {
        const holdingsLoading = document.getElementById("sim-holdings-loading");
        const holdingsEmpty = document.getElementById("sim-holdings-empty");
        const holdingsList = document.getElementById("sim-holdings-list");

        if (!this.simulationPortfolio || !this.simulationPortfolio.holdings) {
            if (holdingsLoading) holdingsLoading.classList.add("hidden");
            if (holdingsEmpty) holdingsEmpty.classList.remove("hidden");
            if (holdingsList) holdingsList.classList.add("hidden");
            return;
        }

        const holdings = this.simulationPortfolio.holdings;
        
        if (Object.keys(holdings).length === 0) {
            if (holdingsLoading) holdingsLoading.classList.add("hidden");
            if (holdingsEmpty) holdingsEmpty.classList.remove("hidden");
            if (holdingsList) holdingsList.classList.add("hidden");
        } else {
            if (holdingsLoading) holdingsLoading.classList.add("hidden");
            if (holdingsEmpty) holdingsEmpty.classList.add("hidden");
            if (holdingsList) {
                holdingsList.classList.remove("hidden");
                holdingsList.innerHTML = "";

                for (const ticker in holdings) {
                    const holding = holdings[ticker];
                    const holdingElement = this.createHoldingElement(ticker, holding);
                    holdingsList.appendChild(holdingElement);
                }
            }
        }
    }

    createHoldingElement(ticker, holding) {
        const element = document.createElement("div");
        element.className = "bg-gray-700 p-4 rounded-lg flex justify-between items-center";
        
        element.innerHTML = getHoldingElementTemplate(ticker, holding);
        
        return element;
    }

    async loadRecentTrades() {
        const tradesLoading = document.getElementById("sim-trades-loading");
        const tradesEmpty = document.getElementById("sim-trades-empty");
        const tradesList = document.getElementById("sim-trades-list");

        try {
            const trades = await getRecentTrades(this.currentUser.uid, 5, this.simulationId);
            
            if (tradesLoading) tradesLoading.classList.add("hidden");
            
            if (trades.length === 0) {
                if (tradesEmpty) tradesEmpty.classList.remove("hidden");
                if (tradesList) tradesList.classList.add("hidden");
            } else {
                if (tradesEmpty) tradesEmpty.classList.add("hidden");
                if (tradesList) {
                    tradesList.classList.remove("hidden");
                    tradesList.innerHTML = "";

                    trades.forEach(trade => {
                        const tradeElement = this.createTradeElement(trade);
                        tradesList.appendChild(tradeElement);
                    });
                }
            }
        } catch (error) {
            console.error("Error loading recent trades:", error);
            if (tradesLoading) tradesLoading.classList.add("hidden");
            if (tradesEmpty) tradesEmpty.classList.remove("hidden");
        }
    }

    createTradeElement(trade) {
        const element = document.createElement("div");
        element.className = "bg-gray-700 p-4 rounded-lg flex justify-between items-center";
        
        const tradeConfig = TRADE_TYPE_CONFIG[trade.type];
        element.innerHTML = getTradeElementTemplate(trade, tradeConfig);
        
        return element;
    }

    displaySimulation() {
        const loadingEl = document.getElementById("simulation-loading");
        const contentEl = document.getElementById("simulation-content");
        
        if (loadingEl) loadingEl.classList.add("hidden");
        if (contentEl) contentEl.classList.remove("hidden");

        // Update header
        const nameEl = document.getElementById("sim-name");
        const descEl = document.getElementById("sim-description");
        const statusEl = document.getElementById("sim-status");
        const participantsEl = document.getElementById("sim-participants");
        const durationEl = document.getElementById("sim-duration");
        const tradeBtnTextEl = document.getElementById("trade-btn-text");

        if (nameEl) nameEl.textContent = this.currentSimulation.name;
        if (descEl) {
            if (this.currentSimulation.description) {
                descEl.textContent = this.currentSimulation.description;
                descEl.style.display = "block";
            } else {
                descEl.style.display = "none";
            }
        }

        // Status
        if (statusEl) {
            statusEl.textContent = capitalize(this.currentSimulation.status)
            const statusClass = this.currentSimulation.status === SIMULATION_STATUS.ACTIVE ? "bg-green-600 text-white" :
                               this.currentSimulation.status === SIMULATION_STATUS.PENDING ? "bg-yellow-600 text-white" :
                               "bg-gray-600 text-gray-300";
            statusEl.className = `px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`;
        }

        // Update trade button text based on status
        if (tradeBtnTextEl) {
            if (this.currentSimulation.status === SIMULATION_STATUS.PENDING) {
                tradeBtnTextEl.textContent = "Practice Trade";
            } else if (this.currentSimulation.status === SIMULATION_STATUS.ACTIVE) {
                tradeBtnTextEl.textContent = "Trade Now";
            } else {
                tradeBtnTextEl.textContent = "View Portfolio";
            }
        }

        // Participants
        if (participantsEl) {
            participantsEl.textContent = `${this.currentSimulation.memberCount}/${this.currentSimulation.maxMembers} participants`;
        }

        // Duration
        if (durationEl) {
           durationEl.textContent = formatDateRange(this.currentSimulation.startDate, this.currentSimulation.endDate);
        }

        // Update portfolio stats
        this.updatePortfolioStats();

        // Update simulation rules
        this.updateSimulationRules();

        // Calculate days remaining
        const daysRemainingEl = document.getElementById("days-remaining");
        if (daysRemainingEl) {
            const diffDays = calculateDaysRemaining(this.currentSimulation.endDate);
            daysRemainingEl.textContent = diffDays;
        }

        console.log("Simulation displayed:", this.currentSimulation);
    }

    updatePortfolioStats() {
        if (!this.simulationPortfolio) return;

        const portfolioValueEl = document.getElementById("sim-portfolio-value");
        const portfolioChangeEl = document.getElementById("sim-portfolio-change");
        
        if (portfolioValueEl) {
            const cash = this.simulationPortfolio.cash;
            let holdingsValue = 0;
            
            const holdings = this.simulationPortfolio.holdings || {};
            for (const ticker in holdings) {
                if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                    holdingsValue += holdings[ticker].quantity * holdings[ticker].avgPrice;
                }
            }
            
            const totalValue = cash + holdingsValue;
            portfolioValueEl.textContent = formatCurrencyWithCommas(totalValue);
            
            if (portfolioChangeEl) {
                const startingBalance = this.currentSimulation.startingBalance;
                const change = totalValue - startingBalance;
                const changePercent = (change / startingBalance * 100);
                
                const changeClass = change >= 0 ? "text-green-400" : "text-red-400";
                portfolioChangeEl.className = `text-sm font-medium ${changeClass}`;
                portfolioChangeEl.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)`;
            }
        }
    }

    updateSimulationRules() {
        const startingBalanceEl = document.getElementById("sim-starting-balance");
        const shortSellingEl = document.getElementById("sim-short-selling");
        const tradingHoursEl = document.getElementById("sim-trading-hours");
        const commissionEl = document.getElementById("sim-commission");

        if (startingBalanceEl) {
            startingBalanceEl.textContent = formatCurrencyWithCommas(this.currentSimulation.startingBalance);
        }

        if (shortSellingEl) {
            shortSellingEl.textContent = this.currentSimulation.rules?.allowShortSelling ? "Allowed" : "Not Allowed";
        }

        if (tradingHoursEl) {
            const hours = this.currentSimulation.rules?.tradingHours === "24/7" ? "24/7" : "Market Hours";
            tradingHoursEl.textContent = hours;
        }

        if (commissionEl) {
            const commission = this.currentSimulation.rules?.commissionPerTrade || 0;
            commissionEl.textContent = `${commission} per trade`;
        }
    }

    showPortfolioError() {
        const holdingsContainer = document.getElementById("sim-holdings-container");
        const tradesContainer = document.getElementById("sim-trades-container");
        
        const errorContent = getPortfolioErrorTemplate();
        
        if (holdingsContainer) holdingsContainer.innerHTML = errorContent;
        if (tradesContainer) tradesContainer.innerHTML = errorContent;
    }

    handleTradeNavigation() {
        if (!this.simulationId) {
            console.error("No simulation ID available for trading");
            return;
        }

        const tradeBtnTextEl = document.getElementById("trade-btn-text");
        if (tradeBtnTextEl) {
            tradeBtnTextEl.textContent = "Loading...";
        }

        const tradeUrl = `/trade?sim=${this.simulationId}`;
        
        requestAnimationFrame(() => {
            if (window.app && window.app.router) {
                window.app.router.navigate(tradeUrl);
            } else {
                window.location.href = tradeUrl;
            }
        });
    }

    showNotFound() {
        const loadingEl = document.getElementById("simulation-loading");
        const notFoundEl = document.getElementById("simulation-not-found");
        
        if (loadingEl) loadingEl.classList.add("hidden");
        if (notFoundEl) notFoundEl.classList.remove("hidden");
    }

    showError() {
        const loadingEl = document.getElementById("simulation-loading");
        
        if (loadingEl) {
            loadingEl.innerHTML = getSimulationLoadingErrorTemplate();
        }
    }

    showTemporaryMessage(message, type = "info") {
        // Remove existing message if any
        const existingMessage = document.getElementById("temp-message");
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageHTML = getShowTemporaryMessageTemplate(message, type);

        document.body.insertAdjacentHTML("beforeend", messageHTML);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            document.getElementById("temp-message")?.remove();
        }, 5000);
    }

    async handleSimulationSettings() {
        try {
            // Load management statistics
            const managementStats = await this.simulationService.getSimulationManagementStats(
                this.simulationId, 
                this.currentUser.uid
            );

            this.showSimulationSettingsModal(managementStats);

        } catch (error) {
            console.error("Error loading simulation settings:", error);
            this.showTemporaryMessage(`Failed to load settings: ${error.message}`, "error");
        }
    }

    showSimulationSettingsModal(stats) {
        // Remove existing modal if any
        const existingModal = document.getElementById("simulation-settings-modal");
        if (existingModal) {
            existingModal.remove();
        }

        const simulation = stats.simulation;
        const canModifyRules = simulation.status === SIMULATION_STATUS.PENDING;
        const isActive = simulation.status === SIMULATION_STATUS.ACTIVE;
        const isEnded = simulation.status === SIMULATION_STATUS.ENDED;

        const modalHTML = getSimulationSettingsModalTemplate(stats);

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        // Attach all event listeners
        this.attachSettingsModalListeners(stats);
    }

    attachSettingsModalListeners(stats) {
        const modal = document.getElementById("simulation-settings-modal");
        
        // Close modal handlers
        document.getElementById("close-settings-modal")?.addEventListener("click", () => {
            modal?.remove();
        });
        
        document.getElementById("close-settings-modal-btn")?.addEventListener("click", () => {
            modal?.remove();
        });

        // Close on outside click
        modal?.addEventListener("click", (e) => {
            if (e.target.id === "simulation-settings-modal") {
                modal.remove();
            }
        });

        // Save basic settings
        document.getElementById("save-basic-settings")?.addEventListener("click", async () => {
            await this.handleSaveBasicSettings(stats.simulation);
        });

        // Reset basic settings
        document.getElementById("reset-basic-settings")?.addEventListener("click", () => {
            document.getElementById("sim-name-input").value = stats.simulation.name;
            document.getElementById("max-members-input").value = stats.simulation.maxMembers;
            document.getElementById("sim-description-input").value = stats.simulation.description || "";
        });

        // Extend simulation
        document.getElementById("extend-simulation")?.addEventListener("click", async () => {
            await this.handleExtendSimulation();
        });

        // End simulation early
        document.getElementById("end-simulation")?.addEventListener("click", async () => {
            await this.handleEndSimulation();
        });

        // Save rules (if available)
        document.getElementById("save-rules")?.addEventListener("click", async () => {
            await this.handleSaveRules(stats.simulation);
        });
        }

        async handleSaveBasicSettings(_originalSimulation) {
        const nameInput = document.getElementById("sim-name-input");
        const maxMembersInput = document.getElementById("max-members-input");
        const descriptionInput = document.getElementById("sim-description-input");
        
        const settings = {
            name: nameInput.value.trim(),
            maxMembers: parseInt(maxMembersInput.value),
            description: descriptionInput.value.trim()
        };

        if (!settings.name) {
            this.showTemporaryMessage("Simulation name cannot be empty", "error");
            return;
        }

        try {
            const saveBtn = document.getElementById("save-basic-settings");
            saveBtn.disabled = true;
            saveBtn.textContent = INFO_MESSAGES.SAVING_SETTINGS;

            const result = await this.simulationService.updateSimulationSettings(
                this.simulationId,
                this.currentUser.uid,
                settings
            );

            if (result.success) {
                this.showTemporaryMessage(SUCCESS_MESSAGES.SETTINGS_UPDATED, "success");
                
                // Update local simulation data
                this.currentSimulation.name = settings.name;
                this.currentSimulation.maxMembers = settings.maxMembers;
                this.currentSimulation.description = settings.description;
                
                // Update the main simulation display
                this.displaySimulation();
                
                if (result.changes.length > 0) {
                    console.log("Settings changes applied:", result.changes);
                }
            }

        } catch (error) {
            console.error("Error saving basic settings:", error);
            this.showTemporaryMessage(`Failed to save settings: ${error.message}`, "error");
        } finally {
            const saveBtn = document.getElementById("save-basic-settings");
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Changes";
            }
        }
        }

        async handleExtendSimulation() {
        const newEndDateInput = document.getElementById("new-end-date");
        const newEndDate = newEndDateInput.value;

        if (!newEndDate) {
            this.showTemporaryMessage("Please select a new end date", "error");
            return;
        }

        const confirmMessage = `Extend simulation until ${new Date(newEndDate).toLocaleDateString()}?\n\nThis will:\n• Give participants more time to trade\n• Update the leaderboard timeline\n• Notify all members\n\nContinue?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        const reason = prompt("Optional: Reason for extension (will be visible to participants):") || "Extended by admin";

        try {
            const extendBtn = document.getElementById("extend-simulation");
            extendBtn.disabled = true;
            extendBtn.textContent = "Extending...";

            await this.simulationService.extendSimulation(
                this.simulationId,
                this.currentUser.uid,
                newEndDate,
                reason
            );

            this.showTemporaryMessage("Simulation extended successfully!", "success");
            
            // Reload simulation data
            this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            this.displaySimulation();
            
            // Close modal and refresh
            document.getElementById("simulation-settings-modal")?.remove();

        } catch (error) {
            console.error("Error extending simulation:", error);
            this.showTemporaryMessage(`Failed to extend simulation: ${error.message}`, "error");
        } finally {
            const extendBtn = document.getElementById("extend-simulation");
            if (extendBtn) {
                extendBtn.disabled = false;
                extendBtn.textContent = "Extend Simulation";
            }
        }
        }

        async handleEndSimulation() {
            const confirmMessage = `End this simulation immediately?\n\n⚠️ WARNING: This action cannot be undone!\n\nThis will:\n• Stop all trading immediately\n• Finalize the leaderboard\n• Archive all results\n• Notify all participants\n\nAre you absolutely sure?`;
            
            if (!confirm(confirmMessage)) {
                return;
            }

            const reason = prompt("Reason for ending early (required - will be visible to all participants):");
            
            if (!reason || reason.trim() === "") {
                this.showTemporaryMessage("Reason is required to end simulation early", "error");
                return;
            }

            try {
                const endBtn = document.getElementById("end-simulation");
                endBtn.disabled = true;
                endBtn.textContent = "Ending Simulation...";

                console.log("Calling endSimulationEarly...");
                
                await this.simulationService.endSimulationEarly(
                    this.simulationId,
                    this.currentUser.uid,
                    reason.trim()
                );

                console.log("endSimulationEarly completed, refreshing view...");

                this.showTemporaryMessage("Simulation ended successfully", "success");
                
                // Close modal first
                document.getElementById("simulation-settings-modal")?.remove();
                
                // Force complete reload of simulation data
                console.log("Forcing simulation data reload...");
                await this.forceReloadSimulationData();
                
                // Show final results message
                setTimeout(() => {
                    this.showTemporaryMessage("Simulation has ended. Final results are now available.", "info");
                }, 1000);

            } catch (error) {
                console.error("Error ending simulation:", error);
                this.showTemporaryMessage(`Failed to end simulation: ${error.message}`, "error");
            } finally {
                const endBtn = document.getElementById("end-simulation");
                if (endBtn) {
                    endBtn.disabled = false;
                    endBtn.textContent = "End Simulation Early";
                }
            }
        }

        async handleSaveRules(originalSimulation) {
        const allowShortSelling = document.getElementById("short-selling-toggle")?.checked || false;
        const tradingHours = document.querySelector("input[name=\"trading-hours\"]:checked")?.value || "market";

        const rules = {
            allowShortSelling,
            tradingHours,
            commissionPerTrade: originalSimulation.rules?.commissionPerTrade || 0
        };

        try {
            const saveBtn = document.getElementById("save-rules");
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving Rules...";

            const result = await this.simulationService.updateSimulationSettings(
                this.simulationId,
                this.currentUser.uid,
                { rules }
            );

            if (result.success) {
                this.showTemporaryMessage("Trading rules updated successfully", "success");
                
                // Update local simulation data
                this.currentSimulation.rules = rules;
                this.updateSimulationRules();
            }

        } catch (error) {
            console.error("Error saving rules:", error);
            this.showTemporaryMessage(`Failed to save rules: ${error.message}`, "error");
        } finally {
            const saveBtn = document.getElementById("save-rules");
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Rule Changes";
            }
        }

        // Add these at the end of the attachSettingsModalListeners method:

        // Export results
        document.getElementById("export-results")?.addEventListener("click", async () => {
            await this.handleExportResults();
        });

        // Archive from settings modal
        document.getElementById("archive-simulation")?.addEventListener("click", async () => {
            document.getElementById("simulation-settings-modal")?.remove();
            await this.handleArchiveSimulation();
        });
    }

    showArchivePrompt() {
        // Only show to creators
        const isCreator = this.simulationMembers.some(member => 
            member.userId === this.currentUser.uid && member.role === "creator"
        );
        
        if (!isCreator) return;

        // Show archive suggestion banner
        const existingBanner = document.getElementById("archive-banner");
        if (existingBanner) return; // Don't show multiple times

        const bannerHTML = getArchivePromptBannerTemplate();

        // Insert banner at top of simulation content
        const simulationContent = document.getElementById("simulation-content");
        if (simulationContent) {
            simulationContent.insertAdjacentHTML("afterbegin", bannerHTML);

            // Attach event listeners
            document.getElementById("archive-now-btn")?.addEventListener("click", () => {
                this.handleArchiveSimulation();
            });

            document.getElementById("dismiss-archive-btn")?.addEventListener("click", () => {
                document.getElementById("archive-banner")?.remove();
            });
        }
    }

    async handleArchiveSimulation() {
        const confirmed = confirm(`Archive this simulation?\n\nThis will:\n• Preserve all final results permanently\n• Generate downloadable reports\n• Add to simulation history\n• Free up active simulation space\n\nArchive results cannot be modified after creation.\n\nContinue?`);
        
        if (!confirmed) return;

        try {
            const archiveBtn = document.getElementById("archive-now-btn");
            if (archiveBtn) {
                archiveBtn.disabled = true;
                archiveBtn.textContent = "Archiving...";
            }

            // Archive the simulation with current leaderboard
            const result = await this.simulationService.archiveSimulation(
                this.simulationId,
                this.currentUser.uid,
                this.leaderboardData
            );

            if (result.success) {
                this.showTemporaryMessage("Simulation archived successfully!", "success");
                
                // Update local simulation data
                this.currentSimulation.archived = true;
                this.currentSimulation.archiveId = result.archiveId;
                
                // Remove archive banner
                document.getElementById("archive-banner")?.remove();
                
                // Show archive access info
                this.showArchiveSuccessInfo(result.archiveId);
            }

        } catch (error) {
            console.error("Error archiving simulation:", error);
            this.showTemporaryMessage(`Failed to archive simulation: ${error.message}`, "error");
        } finally {
            const archiveBtn = document.getElementById("archive-now-btn");
            if (archiveBtn) {
                archiveBtn.disabled = false;
                archiveBtn.textContent = "Archive Now";
            }
        }
    }

    showArchiveSuccessInfo(archiveId) {
        const infoHTML = getArchiveSuccessInfoBannerTemplate(archiveId);

        const simulationContent = document.getElementById("simulation-content");
        if (simulationContent) {
            simulationContent.insertAdjacentHTML("afterbegin", infoHTML);

            // Attach event listeners
            document.getElementById("view-archive-btn")?.addEventListener("click", (e) => {
                const archiveId = e.target.dataset.archiveId;
                this.navigateToArchive(archiveId);
            });

            document.getElementById("dismiss-success-btn")?.addEventListener("click", () => {
                document.getElementById("archive-success-banner")?.remove();
            });

            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                document.getElementById("archive-success-banner")?.remove();
            }, 10000);
        }
    }

    navigateToArchive(archiveId) {
        const archiveUrl = `/simulation/archive?id=${archiveId}`;
        
        if (window.app && window.app.router) {
            window.app.router.navigate(archiveUrl);
        } else {
            window.location.href = archiveUrl;
        }
    }

    async handleExportResults() {
        try {
            const exportBtn = document.getElementById("export-results");
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = `
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating Export...
                `;
            }

            // Create mock archive data for export
            const exportData = this.simulationService.generateSimulationExport({
                originalSimulation: this.currentSimulation,
                finalResults: this.leaderboardData,
                memberCount: this.simulationMembers.length,
                totalTrades: this.leaderboardData?.rankings?.reduce((sum, r) => sum + (r.totalTrades || 0), 0) || 0,
                totalVolume: this.leaderboardData?.rankings?.reduce((sum, r) => sum + (r.totalVolume || 0), 0) || 0,
                winner: this.leaderboardData?.rankings?.[0] || null,
                duration: this.currentSimulation.endDate && this.currentSimulation.startDate ? 
                    Math.ceil((this.currentSimulation.endDate.toDate() - this.currentSimulation.startDate.toDate()) / (1000 * 60 * 60 * 24)) : 0,
                endedEarly: this.currentSimulation.endedEarly || false,
                endReason: this.currentSimulation.endReason || null
            });

            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${this.currentSimulation.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_results_${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showTemporaryMessage("Results exported successfully!", "success");

        } catch (error) {
            console.error("Error exporting results:", error);
            this.showTemporaryMessage(`Failed to export results: ${error.message}`, "error");
        } finally {
            const exportBtn = document.getElementById("export-results");
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download Results (JSON)
                `;
            }
        }
    }

    async forceReloadSimulationData() {
        try {
            console.log("Force reloading simulation data...");
            
            // Clear any caches if they exist
            if (this.simulationService.clearCache) {
                this.simulationService.clearCache();
            }
            
            // Force refresh simulation status first
            console.log("Refreshing simulation status...");
            const statusRefresh = await this.simulationService.refreshSimulationStatus(this.simulationId);
            console.log("Status refresh result:", statusRefresh);
            
            // Reload simulation with fresh data
            console.log("Reloading simulation details...");
            this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            console.log("Current simulation after reload:", {
                id: this.currentSimulation.id,
                status: this.currentSimulation.status,
                endedEarly: this.currentSimulation.endedEarly,
                endReason: this.currentSimulation.endReason
            });
            
            // Reload all data components
            console.log("Reloading all data components...");
            await Promise.all([
                this.loadSimulationMembers(),
                this.loadSimulationActivities(),
                this.loadSimulationPortfolio(),
                this.loadLeaderboard()
            ]);
            
            // Update the display
            console.log("Updating display...");
            this.displaySimulation();
            
            // Check if archive prompt should be shown
            if (this.currentSimulation.status === SIMULATION_STATUS.ENDED && !this.currentSimulation.archived) {
                console.log("Showing archive prompt...");
                this.showArchivePrompt();
            }
            
            console.log("Force reload completed successfully");
            
        } catch (error) {
            console.error("Error during force reload:", error);
            this.showTemporaryMessage("Warning: Some data may not have refreshed properly", "error");
        }
    }

    // TEMPORARY DEBUG METHOD - Remove after testing
    async debugFirestoreUpdate() {
        try {
            console.log("Testing direct Firestore update...");
            
            const { getFirestoreDb } = await import("../services/firebase.js");
            const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
            
            const db = getFirestoreDb();
            const simRef = doc(db, "simulations", this.simulationId);
            
            await updateDoc(simRef, {
                debugTest: "test_value",
                debugTimestamp: serverTimestamp()
            });
            
            console.log("Direct Firestore update succeeded");
            this.showTemporaryMessage("Firestore update test succeeded", "success");
            
        } catch (error) {
            console.error("Direct Firestore update failed:", error);
            this.showTemporaryMessage(`Firestore test failed: ${error.message}`, "error");
        }
    }
}