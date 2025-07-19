// src/views/simulation.js - Enhanced with Leaderboards - Session 9
// Simulation view with member management, activity tracking, and leaderboards

// Core Services
import { SimulationService } from "../services/simulation.js";
import { AuthService } from "../services/auth.js";
import { ActivityService } from "../services/activity.js";
import { LeaderboardService } from "../services/leaderboard.js";

// Components
import { LeaderboardOverview } from "../components/simulation/LeaderboardOverview.js";
import { LeaderboardTable } from "../components/simulation/LeaderboardTable.js";
import { SimulationAdminManager } from "../components/simulation/SimulationAdminManager.js";
import { SimulationPortfolioManager } from "../components/simulation/SimulationPortfolioManager.js";
import { SimulationMemberManager } from "../components/simulation/SimulationMemberManager.js";
import { SimulationActivityManager } from "../components/simulation/SimulationActivityManager.js";
import { SimulationTabManager } from "../components/simulation/SimulationTabManager.js";
import { SimulationDisplayManager } from "../components/simulation/SimulationDisplayManager.js";

// Constants
import { REFRESH_INTERVALS } from "../constants/app-config.js";
import { SIMULATION_STATUS } from "../constants/simulation-status.js";

// Templates
import { getSimulationLoadingTemplate } from "../templates/simulation/ui-messages.js";
import { 
    getSimulationNotFoundTemplate, 
    getSimulationLoadingErrorTemplate,
} from "../templates/simulation/error-states.js";
import { 
    getTabNavigationAndContentTemplate,
    getSimulationRulesSectionTemplate,
    getHeaderSectionTemplate 
} from "../templates/simulation/simulation-layout.js";
import { getMainStatsCardsTemplate } from "../templates/simulation/simulation-sidebar.js";
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
        this.portfolioManager = null; // Will be initialized after data loads
        this.memberManager = null; // Will be initialized after data loads
        this.activityManager = null; // Will be initialized after data loads
        this.tabManager = null; // Will be initialized after render
        this.displayManager = null; // Will be initialized after render
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
        // Initialize tab manager
        this.tabManager = new SimulationTabManager(this);
        this.tabManager.attachTabEventListeners();

        // Initialize display manager
        this.displayManager = new SimulationDisplayManager(this);

        // Trade button
        const tradeBtn = container.querySelector("#trade-in-sim-btn");
        const startTradingBtn = container.querySelector("#start-trading-btn");
        
        [tradeBtn, startTradingBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener("click", () => this.handleTradeNavigation());
            }
        });

        // Member management button
        const manageMembersBtn = container.querySelector("#manage-members-btn");
        if (manageMembersBtn) {
            manageMembersBtn.addEventListener("click", () => this.handleMemberManagement());
        }

        // Simulation settings button
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

            // Initialize managers now that we have data
            this.adminManager = new SimulationAdminManager(this);
            this.portfolioManager = new SimulationPortfolioManager(this);
            this.memberManager = new SimulationMemberManager(this);
            this.activityManager = new SimulationActivityManager(this);
            this.activityManager.initialize(this.simulationId);

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
        if (this.displayManager) {
            this.displayManager.updateReferences(this.currentSimulation, this.currentUser, this.leaderboardData);
            this.displayManager.updateUserRankDisplay();
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
        if (this.memberManager) {
            await this.memberManager.loadSimulationMembers();
        }
    }

    async loadSimulationActivities() {
        if (this.activityManager) {
            await this.activityManager.loadSimulationActivities();
            // Update local reference for backward compatibility
            this.simulationActivities = this.activityManager.getActivities();
        }
    }

    async loadSimulationPortfolio() {
        if (this.portfolioManager) {
            await this.portfolioManager.loadSimulationPortfolio();
        }
    }

    switchTab(tabId) {
        if (this.tabManager) {
            this.tabManager.switchTab(tabId);
        }
    }

    updateNavigationButtonText(activeTabId) {
        if (this.tabManager) {
            this.tabManager.updateNavigationButtonText(activeTabId);
        }
    }

    showLeaderboardTab() {
        if (this.tabManager) {
            this.tabManager.showLeaderboardTab();
        }
    }

    showMembersTab() {
        if (this.tabManager) {
            this.tabManager.showMembersTab();
        }
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
                if (this.tabManager && this.tabManager.isTabActive("tab-leaderboard")) {
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
        if (this.memberManager) {
            this.memberManager.displayMembers();
        }
    }

    createMemberCard(member) {
        if (this.memberManager) {
            return this.memberManager.createMemberCard(member);
        }
        return document.createElement("div");
    }

    isCurrentUserCreator() {
        if (this.memberManager) {
            return this.memberManager.isCurrentUserCreator();
        }
        return false;
    }

    async handleKickMember(userId, userName) {
        if (this.memberManager) {
            await this.memberManager.handleKickMember(userId, userName);
        }
    }

    async handleMemberManagement() {
        if (this.memberManager) {
            await this.memberManager.handleMemberManagement();
        }
    }

    showMemberManagementModal(memberStats) {
        if (this.memberManager) {
            this.memberManager.showMemberManagementModal(memberStats);
        }
    }

    displayActivities() {
        if (this.activityManager) {
            this.activityManager.displayActivities();
        }
    }

    createActivityElement(activity) {
        if (this.activityManager) {
            return this.activityManager.createActivityElement(activity);
        }
        return document.createElement("div");
    }

    showActivitiesError() {
        if (this.activityManager) {
            this.activityManager.showActivitiesError();
        }
    }

    showMembersError() {
        if (this.memberManager) {
            this.memberManager.showMembersError();
        }
    }

    async loadHoldings() {
        if (this.portfolioManager) {
            await this.portfolioManager.loadHoldings();
        }
    }

    createHoldingElement(ticker, holding) {
        if (this.portfolioManager) {
            return this.portfolioManager.createHoldingElement(ticker, holding);
        }
        return document.createElement("div");
    }

    async loadRecentTrades() {
        if (this.portfolioManager) {
            await this.portfolioManager.loadRecentTrades();
        }
    }

    createTradeElement(trade) {
        if (this.portfolioManager) {
            return this.portfolioManager.createTradeElement(trade);
        }
        return document.createElement("div");
    }

    displaySimulation() {
        if (this.displayManager) {
            this.displayManager.updateReferences(this.currentSimulation, this.currentUser, this.leaderboardData);
            this.displayManager.displaySimulation();
        }
    }

    updatePortfolioStats() {
        if (this.displayManager) {
            this.displayManager.updatePortfolioStats();
        }
    }

    updateSimulationRules() {
        if (this.displayManager) {
            this.displayManager.updateSimulationRules();
        }
    }

    showPortfolioError() {
        if (this.portfolioManager) {
            this.portfolioManager.showPortfolioError();
        }
    }

    handleTradeNavigation() {
        if (!this.simulationId) {
            console.error("No simulation ID available for trading");
            return;
        }

        if (this.displayManager) {
            this.displayManager.updateTradeButtonText("Loading...");
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