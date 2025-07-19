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
import { SimulationAdminManager } from "../components/simulation/SimulationAdminManager.js";

// Constants
import { REFRESH_INTERVALS } from "../constants/app-config.js";
import { SIMULATION_STATUS, MEMBER_STATUS } from "../constants/simulation-status.js";
import { TRADE_TYPE_CONFIG } from "../constants/trade-types.js";

// Utilities
import { formatDateRange, calculateDaysRemaining } from "../utils/date-utils.js";
import { formatCurrencyWithCommas } from "../utils/currency-utils.js";
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
import { getMemberManagementModalTemplate } from "../templates/simulation/simulation-modals.js";
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
        this.adminManager = null; // Will be initialized after data loads
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

            // Initialize admin manager now that we have data
            this.adminManager = new SimulationAdminManager(this);
            
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
        if (this.adminManager) {
            await this.adminManager.handleSimulationSettings();
        }
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
}