// src/views/simulation.js - Enhanced with Leaderboards - Session 9
// Simulation view with member management, activity tracking, and leaderboards

// Core Services
import { SimulationService } from "../services/simulation.js";
import { AuthService } from "../services/auth.js";
import { ActivityService } from "../services/activity.js";
import { LeaderboardService } from "../services/leaderboard.js";
import { getPortfolio } from "../services/trading.js";

// Components
import { LeaderboardManager } from "../components/simulation/LeaderboardManager.js";
import { SimulationContentManager } from "../components/simulation/SimulationContentManager.js";
import { SimulationMembershipManager } from "../components/simulation/SimulationMembershipManager.js";

// Constants
import { REFRESH_INTERVALS } from "../constants/app-config.js";
import { SIMULATION_STATUS } from "../constants/simulation-status.js";

//Utilities
import { formatCurrencyWithCommas, formatPortfolioChange } from "../utils/currency-utils.js";
import { logger } from "../utils/logger.js";

// Templates
import { getSimulationLoadingTemplate } from "../templates/simulation/ui-messages.js";
import { 
    getSimulationNotFoundTemplate, 
    getSimulationLoadingErrorTemplate,
} from "../templates/simulation/error-states.js";
import { 
    getSimulationRulesSectionTemplate,
    getCleanHeaderSectionTemplate,
    getCleanStatsCardsTemplate,
    getPortfolioSectionTemplate,
    getLeaderboardSectionTemplate,
    getActivitySectionTemplate
} from "../templates/simulation/simulation-layout.js";
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
        // this.leaderboardOverview = new LeaderboardOverview();
        // this.leaderboardTable = new LeaderboardTable();
        this.leaderboardManager = new LeaderboardManager();
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
        this.isDestroyed = false; // Add this line
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
                    ${getCleanHeaderSectionTemplate()}

                    ${getCleanStatsCardsTemplate()}

                    ${getPortfolioSectionTemplate()}

                    ${getLeaderboardSectionTemplate()}

                    ${getActivitySectionTemplate()}

                    ${getSimulationRulesSectionTemplate()}
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        // Initialize tab manager
        this.attachSimplifiedEventListeners();

        // Simulation dropdown handler (ADD THIS)
        const simulationDropdown = container.querySelector("#simulation-dropdown");
        if (simulationDropdown) {
            simulationDropdown.addEventListener("change", (e) => this.handleSimulationSwitch(e.target.value));
        }

        // Refresh button handler (ADD THIS)
        const refreshBtn = container.querySelector("#refresh-simulation-btn");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => this.handleRefresh());
        }

        // Trade button
        const tradeBtn = container.querySelector("#trade-in-sim-btn");
        const startTradingBtn = container.querySelector("#start-trading-btn");
        
        [tradeBtn, startTradingBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener("click", () => this.handleTradeNavigation());
            }
        });

        // Copy invite code button
        const copyInviteBtn = container.querySelector("#copy-invite-code-btn");
        if (copyInviteBtn) {
            copyInviteBtn.addEventListener("click", () => this.handleCopyInviteCode());
        }

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

    attachSimplifiedEventListeners() {
        // Force show all content sections on mobile
        const contentSections = ["content-portfolio", "content-leaderboard", "content-members"];
        contentSections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove("hidden");
            }
        });
        
        // Portfolio & Trades button - scroll to portfolio content
        const portfolioBtn = document.querySelector("#view-members-btn");
        if (portfolioBtn) {
            portfolioBtn.addEventListener("click", () => {
                const portfolioContent = document.getElementById("content-portfolio");
                if (portfolioContent) {
                    portfolioContent.scrollIntoView({ 
                        behavior: "smooth", 
                        block: "start" 
                    });
                }
            });
        }

        // Leaderboard button - scroll to leaderboard content  
        const leaderboardBtn = document.querySelector("#view-leaderboard-btn");
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener("click", () => {
                const leaderboardContent = document.getElementById("content-leaderboard");
                if (leaderboardContent) {
                    leaderboardContent.scrollIntoView({ 
                        behavior: "smooth", 
                        block: "start" 
                    });
                    // Ensure leaderboard data is rendered
                    this.renderLeaderboardComponents();
                }
            });
        }

        // Members & Activity button - scroll to members content
        const activityBtn = document.querySelector("#view-activity-btn");
        if (activityBtn) {
            activityBtn.addEventListener("click", () => {
                const membersContent = document.getElementById("content-members");
                if (membersContent) {
                    membersContent.scrollIntoView({ 
                        behavior: "smooth", 
                        block: "start" 
                    });
                }
            });
        }
    }

    async loadData() {
        this.currentUser = this.authService.getCurrentUser();
        
        if (!this.currentUser) {
            logger.debug("No user signed in for simulation view.");
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
            this.initializeManagers();
            
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
                    logger.debug("Status was updated during load:", statusRefresh);
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

            // UPDATE: Add this call at the end of loadData
            this.updateManageMembersButtonVisibility();
            
        } catch (error) {
            logger.error("❌ Error loading simulation:", error);
            this.showError();
        }

        setTimeout(() => {
            // Force show all content sections after everything loads
            const contentSections = ["content-portfolio", "content-leaderboard", "content-members"];
            contentSections.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.classList.remove("hidden");
                    element.style.display = "block";
                    logger.debug(`Showing ${id}:`, element);
                } else {
                    logger.debug(`Element ${id} not found`);
                }
            });
        }, 1000); // Wait 1 second after page loads
        
        await this.loadUserSimulationsForDropdown();

        // Force a portfolio value refresh to ensure accuracy
        await this.refreshPortfolioValues();
    }

    async loadLeaderboard() {
        try {
            logger.debug("Loading leaderboard...");
            this.leaderboardData = await this.leaderboardService.getLeaderboard(
                this.simulationId, 
                false, // Don't force refresh on initial load
                this.currentSimulation
            );
            
            // Update user rank in header
            this.updateUserRankDisplay();
            
            logger.debug("Leaderboard loaded:", this.leaderboardData);
        } catch (error) {
            logger.error("Error loading leaderboard:", error);
            // Don't fail the entire view if leaderboard fails
        }
    }

    async refreshLeaderboard() {
        try {
            logger.debug("Refreshing leaderboard...");
            this.leaderboardData = await this.leaderboardService.getLeaderboard(
                this.simulationId, 
                true, // Force refresh
                this.currentSimulation
            );
            
            // Update displays
            this.updateUserRankDisplay();
            this.renderLeaderboardComponents();
            
            logger.debug("Leaderboard refreshed successfully");
        } catch (error) {
            logger.error("Error refreshing leaderboard:", error);
            throw error; // Re-throw so UI can handle error state
        }
    }
    
    /**
     * Show/hide manage members and settings buttons based on permissions
     */
    updateManageMembersButtonVisibility() {
        const manageMembersBtn = document.getElementById("manage-members-btn");
        const settingsBtn = document.getElementById("simulation-settings-btn");
        
        const canManage = this.currentUser && this.currentSimulation && (
            this.currentSimulation.createdBy === this.currentUser.uid || 
            this.currentUser.systemRole === "admin" || 
            this.currentUser.systemRole === "super_admin"
        );
        
        // Show/hide manage members button
        if (manageMembersBtn) {
            if (canManage) {
                manageMembersBtn.classList.remove("hidden");
            } else {
                manageMembersBtn.classList.add("hidden");
            }
        }
        
        // Show/hide settings button
        if (settingsBtn) {
            if (canManage) {
                settingsBtn.classList.remove("hidden");
            } else {
                settingsBtn.classList.add("hidden");
            }
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
            this.leaderboardManager.renderOverview(
                overviewContainer,
                this.leaderboardData,
                this.currentUser?.uid,
                () => this.refreshLeaderboard()
            );
        }

        // Render leaderboard table
        const tableContainer = document.getElementById("leaderboard-table-container");
        if (tableContainer && this.leaderboardData.rankings) {
            this.leaderboardManager.renderTable(
                tableContainer,
                this.leaderboardData.rankings,
                this.currentUser?.uid,
                (userId, userName) => {
                    logger.debug(`View details for user: ${userName}`);
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
    
    /**
     * Method 1: Add the missing refreshSimulation method
     */
    async refreshSimulation() {
        logger.debug("Refreshing simulation data...");
        
        try {
            // Reload simulation members
            if (this.memberManager) {
                await this.memberManager.loadSimulationMembers();
            }
            
            // Reload activities
            if (this.activityManager) {
                await this.activityManager.loadSimulationActivities();
            }
            
            logger.debug("Simulation data refreshed");
        } catch (error) {
            logger.error("Error refreshing simulation:", error);
        }
    }

    /**
     * Method 4: Fixed startAutoRefresh with proper constants
     */
    startAutoRefresh() {
        // Import at the top of your file if not already done:
        // import { REFRESH_INTERVALS } from "../constants/app-config.js";
        
        // Clear existing intervals
        this.stopAutoRefresh();

        // Refresh simulation data every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (!this.isDestroyed) {
                this.refreshSimulation();
            }
        }, REFRESH_INTERVALS.SIMULATION_DATA);

        // Refresh portfolio values and leaderboard every 2 minutes
        this.leaderboardRefreshInterval = setInterval(() => {
            if (!this.isDestroyed) {
                this.refreshPortfolioValues();
            }
        }, REFRESH_INTERVALS.LEADERBOARD);

        logger.debug("Auto-refresh started");
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            logger.debug("Stopping simulation data auto-refresh");
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        if (this.leaderboardRefreshInterval) {
            logger.debug("Stopping leaderboard auto-refresh");
            clearInterval(this.leaderboardRefreshInterval);
            this.leaderboardRefreshInterval = null;
        }
    }

    // Clean up when view is destroyed
    destroy() {
        logger.debug("Destroying simulation view");
        this.isDestroyed = true;
        this.stopAutoRefresh();
        
        // Clean up managers
        if (this.memberManager) {
            this.memberManager = null;
        }
        if (this.activityManager) {
            this.activityManager = null;
        }
        if (this.portfolioManager) {
            this.portfolioManager = null;
        }
        if (this.adminManager) {
            this.adminManager = null;
        }
        if (this.tabManager) {
            this.tabManager = null;
        }
        if (this.displayManager) {
            this.displayManager = null;
        }
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
        logger.debug("Member management button clicked");
        
        // ENHANCED: Pre-check permissions on the client side
        if (!this.memberManager || !this.memberManager.isCurrentUserCreator()) {
            logger.debug("User is not creator, denying access");
            this.showTemporaryMessage("Only the simulation creator or system administrators can manage members.", "error");
            return;
        }

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
        
        // Show content and hide loading
        const loadingEl = document.getElementById("simulation-loading");
        const contentEl = document.getElementById("simulation-content");
        
        if (loadingEl) {
            loadingEl.classList.add("hidden");
        }
        if (contentEl) {
            contentEl.classList.remove("hidden");
        }
        
        // Your existing displayManager code...
        if (this.displayManager) {
            
            this.displayManager.updateReferences(this.currentSimulation, this.currentUser, this.leaderboardData);
            this.displayManager.displaySimulation();
        } 

        // Update status badge - THIS WAS MISSING
        const statusBadge = document.getElementById("sim-status-badge");
        if (statusBadge && this.currentSimulation) {
            const status = this.currentSimulation.status || "Active";
            statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            
            // Update colors based on status
            if (status === "active") {
                statusBadge.className = "px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-green-300";
            } else if (status === "ended") {
                statusBadge.className = "px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-red-300";
            } else if (status === "pending") {
                statusBadge.className = "px-3 py-1 rounded-full text-sm font-medium bg-yellow-600 text-yellow-300";
            } else {
                statusBadge.className = "px-3 py-1 rounded-full text-sm font-medium bg-gray-600 text-gray-300";
            }
            
        }
        
        // Update participants count
        const participantsEl = document.getElementById("sim-participants");
        if (participantsEl && this.simulationMembers) {
            participantsEl.textContent = `${this.simulationMembers.length}/5 participants`;
        }
        
        // Update your rank
        const rankEl = document.getElementById("sim-your-rank");
        if (rankEl && this.leaderboardData && this.leaderboardData.rankings) {
            const userRanking = this.leaderboardData.rankings.find(r => r.userId === this.currentUser.uid);
            rankEl.textContent = userRanking ? `#${userRanking.rank}` : "Unranked";
        }
        
        // Add this to render leaderboard components
        this.renderLeaderboardComponents();
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
            logger.error("No simulation ID available for trading");
            return;
        }

        // Update button text to show loading
        const tradeBtns = document.querySelectorAll("#trade-in-sim-btn, #start-trading-btn");
        tradeBtns.forEach(btn => {
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = "Loading...";
                btn.disabled = true;
                
                // Reset after navigation attempt
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 3000);
            }
        });

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
        logger.debug("Simulation settings button clicked");
        
        // ENHANCED: Pre-check permissions on the client side
        if (!this.memberManager || !this.memberManager.isCurrentUserCreator()) {
            logger.debug("User is not creator, denying access to settings");
            this.showTemporaryMessage("Only the simulation creator or system administrators can access settings.", "error");
            return;
        }

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
            logger.error("Error archiving simulation:", error);
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
            logger.debug("Force reloading simulation data...");
            
            // Clear any caches if they exist
            if (this.simulationService.clearCache) {
                this.simulationService.clearCache();
            }
            
            // Force refresh simulation status first
            logger.debug("Refreshing simulation status...");
            const statusRefresh = await this.simulationService.refreshSimulationStatus(this.simulationId);
            logger.debug("Status refresh result:", statusRefresh);
            
            // Reload simulation with fresh data
            logger.debug("Reloading simulation details...");
            this.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            logger.debug("Current simulation after reload:", {
                id: this.currentSimulation.id,
                status: this.currentSimulation.status,
                endedEarly: this.currentSimulation.endedEarly,
                endReason: this.currentSimulation.endReason
            });
            
            // Reload all data components
            logger.debug("Reloading all data components...");
            await Promise.all([
                this.loadSimulationMembers(),
                this.loadSimulationActivities(),
                this.loadSimulationPortfolio(),
                this.loadLeaderboard()
            ]);
            
            // Update the display
            logger.debug("Updating display...");
            this.displaySimulation();
            
            // Check if archive prompt should be shown
            if (this.currentSimulation.status === SIMULATION_STATUS.ENDED && !this.currentSimulation.archived) {
                logger.debug("Showing archive prompt...");
                this.showArchivePrompt();
            }
            
            logger.debug("Force reload completed successfully");
            
        } catch (error) {
            logger.error("Error during force reload:", error);
            this.showTemporaryMessage("Warning: Some data may not have refreshed properly", "error");
        }
    }

    initializeManagers() {
        // Initialize the new consolidated managers
        this.contentManager = new SimulationContentManager(this);
        this.membershipManager = new SimulationMembershipManager(this);
        
        // Initialize activity functionality within content manager
        this.contentManager.initialize(this.simulationId);
        
        // Update simulation reference for membership manager
        if (this.currentSimulation) {
            this.membershipManager.updateSimulationReference(this.currentSimulation);
        }

        // Backward compatibility aliases (optional - remove after testing)
        // These allow existing code to work while you transition
        this.memberManager = this.membershipManager;      // For member operations
        this.adminManager = this.membershipManager;       // For admin operations  
        this.portfolioManager = this.contentManager;      // For portfolio operations
        this.activityManager = this.contentManager;       // For activity operations
        this.displayManager = this.contentManager;        // For display operations
    }

    async handleSimulationSwitch(newSimulationId) {
        if (!newSimulationId || newSimulationId === this.simulationId) {
            return;
        }

        try {
            // Navigate to the new simulation
            const newUrl = `/simulation?id=${newSimulationId}`;
            
            if (window.app && window.app.router) {
                window.app.router.navigate(newUrl);
            } else {
                window.location.href = newUrl;
            }
            
        } catch (error) {
            logger.error("Error switching simulation:", error);
            this.showTemporaryMessage(`Failed to switch simulation: ${error.message}`, "error");
            
            // Reset dropdown to current simulation
            const dropdown = document.querySelector("#simulation-dropdown");
            if (dropdown) {
                dropdown.value = this.simulationId;
            }
        }
    }

    async handleRefresh() {
        try {
            this.showTemporaryMessage("Refreshing simulation data...", "info");
            
            // Reload simulation data
            await this.loadSimulationData();
            
            // Refresh leaderboard using existing method
            await this.refreshLeaderboard();
            
            // Update display
            this.displaySimulation();
            
            this.showTemporaryMessage("Data refreshed successfully!", "success");
            
        } catch (error) {
            logger.error("Error refreshing simulation:", error);
            this.showTemporaryMessage(`Refresh failed: ${error.message}`, "error");
        }
    }

    async loadUserSimulationsForDropdown() {
        try {
            // Get all simulations the user is a member of
            const userSimulations = await this.simulationService.getUserSimulations(this.currentUser.uid);
            this.populateSimulationDropdown(userSimulations);
        } catch (error) {
            logger.error("Error loading user simulations:", error);
        }
    }

    populateSimulationDropdown(userSimulations = []) {
        logger.debug("=== POPULATE DROPDOWN DEBUG ===");
        logger.debug("Current simulation:", this.currentSimulation);
        logger.debug("Current simulation name:", this.currentSimulation?.name);
        logger.debug("User simulations array:", userSimulations);
        
        // The trade page uses #portfolio-selector, not #simulation-dropdown
        const dropdown = document.querySelector("#portfolio-selector");
        if (!dropdown) {
            logger.debug("❌ Portfolio selector dropdown element not found!");
            return;
        }

        logger.debug("✅ Found portfolio selector dropdown");

        // Clear existing options except the first one
        dropdown.innerHTML = "<option value=\"\">Select a portfolio...</option>";

        // Add solo portfolio option first
        const soloOption = document.createElement("option");
        soloOption.value = "solo";
        soloOption.textContent = "Solo Practice Mode";
        dropdown.appendChild(soloOption);

        // Add simulation portfolio options using the updated names
        userSimulations.forEach(sim => {
            logger.debug("✅ Adding simulation to dropdown:", sim.name, "ID:", sim.id);
            const option = document.createElement("option");
            option.value = sim.id;
            option.textContent = sim.name; // This should now have the updated name
            
            // Select the current simulation if we're on its trade page
            if (sim.id === this.simulationId) {
                option.selected = true;
            }
            
            dropdown.appendChild(option);
        });

        logger.debug("📋 Final dropdown options:");
        Array.from(dropdown.options).forEach((option, index) => {
            logger.debug(`  ${index}: value="${option.value}", text="${option.textContent}"`);
        });

        logger.debug("Portfolio selector populated with", userSimulations.length, "simulations");
    }

    // And add this method to your SimulationView class:
    async handleCopyInviteCode() {
        try {
            await navigator.clipboard.writeText(this.currentSimulation.inviteCode);
            this.showTemporaryMessage("Invite code copied to clipboard!", "success");
        } catch (error) {
            // Fallback for older browsers
            alert(`Invite Code: ${this.currentSimulation.inviteCode}`, error.message);
        }
    }

    /**
     * Method 2: Fixed refreshPortfolioValues (without forceRefreshLeaderboard)
     */
    async refreshPortfolioValues() {
        logger.debug("Refreshing portfolio values...");
        
        try {
            // 1. Refresh the portfolio manager data
            if (this.portfolioManager) {
                await this.portfolioManager.refreshPortfolioData();
            }

            // 2. Use generateSimulationLeaderboard to force a fresh calculation
            if (this.simulationId && this.leaderboardService) {
                this.leaderboardData = await this.leaderboardService.generateSimulationLeaderboard(
                    this.simulationId, 
                    this.currentSimulation
                );
                
                // Re-render leaderboard components
                this.renderLeaderboardComponents();
            }

            // 3. Update the stats cards with fresh data
            await this.updatePortfolioStatsCards();
            
            logger.debug("Portfolio values refreshed successfully");
            
        } catch (error) {
            logger.error("Error refreshing portfolio values:", error);
        }
    }

    /**
     * Method 3: Update portfolio stats cards
     */
    async updatePortfolioStatsCards() {
        if (!this.currentUser || !this.simulationId) return;
        
        try {
            // Import required functions at the top of your file if not already done
            // import { formatCurrencyWithCommas, formatPortfolioChange } from "../utils/currency-utils.js";
            // import { getPortfolio } from "../services/trading.js";
            
            // Get fresh portfolio value
            const portfolio = await getPortfolio(this.currentUser.uid, this.simulationId);
            if (!portfolio) return;
            
            // Calculate value with live prices
            const portfolioValue = await this.leaderboardService.calculatePortfolioValue(portfolio);
            
            // Update portfolio value card
            const portfolioValueEl = document.getElementById("portfolio-value");
            if (portfolioValueEl) {
                portfolioValueEl.textContent = formatCurrencyWithCommas(portfolioValue.totalValue);
            }
            
            // Update portfolio change
            const portfolioChangeEl = document.getElementById("portfolio-change");
            if (portfolioChangeEl && this.currentSimulation) {
                const startingBalance = this.currentSimulation.startingBalance || 10000;
                const change = portfolioValue.totalValue - startingBalance;
                const changePercent = (change / startingBalance * 100);
                
                const formatted = formatPortfolioChange(change, changePercent);
                portfolioChangeEl.textContent = formatted.display;
                portfolioChangeEl.className = `text-xs ${formatted.colorClass}`;
            }
            
            // Update rank if we have leaderboard data
            if (this.leaderboardData?.rankings) {
                const userRanking = this.leaderboardData.rankings.find(r => r.userId === this.currentUser.uid);
                if (userRanking) {
                    const userRankEl = document.getElementById("user-rank");
                    if (userRankEl) {
                        userRankEl.textContent = `#${userRanking.rank}`;
                    }
                    
                    const userRankDetailEl = document.getElementById("user-rank-detail");
                    if (userRankDetailEl) {
                        userRankDetailEl.textContent = `of ${this.leaderboardData.totalParticipants} participants`;
                    }
                }
            }
            
        } catch (error) {
            logger.error("Error updating stats cards:", error);
        }
    }

}

