// src/views/simulation.js - Enhanced with Leaderboards - Session 9
// Simulation view with member management, activity tracking, and leaderboards

// Core Services
import { SimulationService } from "../services/simulation.js";
import { AuthService } from "../services/auth.js";
import { ActivityService } from "../services/activity.js";
import { LeaderboardService } from "../services/leaderboard.js";
import { getPortfolio } from "../services/trading.js";

// Components
import { LeaderboardOverview } from "../components/simulation/LeaderboardOverview.js";
import { LeaderboardTable } from "../components/simulation/LeaderboardTable.js";
import { SimulationAdminManager } from "../components/simulation/SimulationAdminManager.js";
import { SimulationPortfolioManager } from "../components/simulation/SimulationPortfolioManager.js";
import { SimulationMemberManager } from "../components/simulation/SimulationMemberManager.js";
import { SimulationActivityManager } from "../components/simulation/SimulationActivityManager.js";
import { SimulationDisplayManager } from "../components/simulation/SimulationDisplayManager.js";

// Constants
import { REFRESH_INTERVALS } from "../constants/app-config.js";
import { SIMULATION_STATUS } from "../constants/simulation-status.js";

//Utilities
import { formatCurrencyWithCommas, formatPortfolioChange } from "../utils/currency-utils.js";

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

        // Initialize display manager
        this.displayManager = new SimulationDisplayManager(this);

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

            // UPDATE: Add this call at the end of loadData
            this.updateManageMembersButtonVisibility();
            
        } catch (error) {
            console.error("❌ Error loading simulation:", error);
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
                    console.log(`Showing ${id}:`, element);
                } else {
                    console.log(`Element ${id} not found`);
                }
            });
        }, 1000); // Wait 1 second after page loads
        
        await this.loadUserSimulationsForDropdown();

        // Force a portfolio value refresh to ensure accuracy
        await this.refreshPortfolioValues();
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
    
    /**
     * Method 1: Add the missing refreshSimulation method
     */
    async refreshSimulation() {
        console.log("Refreshing simulation data...");
        
        try {
            // Reload simulation members
            if (this.memberManager) {
                await this.memberManager.loadSimulationMembers();
            }
            
            // Reload activities
            if (this.activityManager) {
                await this.activityManager.loadSimulationActivities();
            }
            
            console.log("Simulation data refreshed");
        } catch (error) {
            console.error("Error refreshing simulation:", error);
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

        console.log("Auto-refresh started");
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            console.log("Stopping simulation data auto-refresh");
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        if (this.leaderboardRefreshInterval) {
            console.log("Stopping leaderboard auto-refresh");
            clearInterval(this.leaderboardRefreshInterval);
            this.leaderboardRefreshInterval = null;
        }
    }

    // Clean up when view is destroyed
    destroy() {
        console.log("Destroying simulation view");
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
        console.log("Member management button clicked");
        
        // ENHANCED: Pre-check permissions on the client side
        if (!this.memberManager || !this.memberManager.isCurrentUserCreator()) {
            console.log("User is not creator, denying access");
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
            console.error("No simulation ID available for trading");
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
        console.log("Simulation settings button clicked");
        
        // ENHANCED: Pre-check permissions on the client side
        if (!this.memberManager || !this.memberManager.isCurrentUserCreator()) {
            console.log("User is not creator, denying access to settings");
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

    initializeManagers() {
        // Initialize member manager with simulation reference
        this.memberManager = new SimulationMemberManager(this);
        if (this.currentSimulation) {
            this.memberManager.updateSimulationReference(this.currentSimulation);
        }

        // Initialize other managers
        this.activityManager = new SimulationActivityManager(this);
        this.activityManager.initialize(this.simulationId);

        // FIX: Remove the initialize call for portfolioManager
        this.portfolioManager = new SimulationPortfolioManager(this);
        // this.portfolioManager.initialize(this.simulationId); // REMOVE THIS LINE

        // FIX: Remove the initialize call for adminManager  
        this.adminManager = new SimulationAdminManager(this);
        // this.adminManager.initialize(this.simulationId, this.currentUser); // REMOVE THIS LINE
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
            console.error("Error switching simulation:", error);
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
            console.error("Error refreshing simulation:", error);
            this.showTemporaryMessage(`Refresh failed: ${error.message}`, "error");
        }
    }

    async loadUserSimulationsForDropdown() {
        try {
            // Get all simulations the user is a member of
            const userSimulations = await this.simulationService.getUserSimulations(this.currentUser.uid);
            this.populateSimulationDropdown(userSimulations);
        } catch (error) {
            console.error("Error loading user simulations:", error);
        }
    }

    populateSimulationDropdown(userSimulations = []) {
        const dropdown = document.querySelector("#simulation-dropdown");
        if (!dropdown) return;

        // Clear existing options except the first one
        dropdown.innerHTML = "<option value=\"\">Switch Simulation...</option>";

        // Add current simulation first
        if (this.currentSimulation) {
            const currentOption = document.createElement("option");
            currentOption.value = this.currentSimulation.id;
            currentOption.textContent = `${this.currentSimulation.name} (Current)`;
            currentOption.selected = true;
            dropdown.appendChild(currentOption);
        }

        // Add other simulations
        userSimulations.forEach(sim => {
            if (sim.id !== this.simulationId) {
                const option = document.createElement("option");
                option.value = sim.id;
                option.textContent = sim.name;
                dropdown.appendChild(option);
            }
        });

        console.log("Simulation dropdown populated with", userSimulations.length, "simulations");
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
        console.log("Refreshing portfolio values...");
        
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
            
            console.log("Portfolio values refreshed successfully");
            
        } catch (error) {
            console.error("Error refreshing portfolio values:", error);
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
            console.error("Error updating stats cards:", error);
        }
    }

}

