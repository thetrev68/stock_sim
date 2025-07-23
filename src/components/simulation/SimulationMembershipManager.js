// src/components/simulation/SimulationMembershipManager.js
// Consolidated manager for member operations and admin controls
// Replaces: SimulationMemberManager, SimulationAdminManager

import { MEMBER_STATUS } from "../../constants/simulation-status.js";
import { SUCCESS_MESSAGES, INFO_MESSAGES } from "../../constants/ui-messages.js";
// import { formatSimpleDate } from "../../utils/date-utils.js";

// Templates
import { getMemberCardTemplate } from "../../templates/simulation/member-components.js";
import { getMemberManagementModalTemplate, getSimulationSettingsModalTemplate } from "../../templates/simulation/simulation-modals.js";
import { getMembersErrorTemplate } from "../../templates/simulation/error-states.js";

/**
 * SimulationMembershipManager
 * 
 * Consolidates member management and admin functionality into one focused class.
 * This replaces SimulationMemberManager and SimulationAdminManager to eliminate
 * code duplication and provide unified member/admin operations.
 * 
 * Key responsibilities:
 * - Member loading, display, and management operations
 * - Admin controls: settings, member management, simulation controls
 * - Permission checking and access control
 * - Modal management for both member and admin functions
 * - Centralized error handling for membership operations
 */
export class SimulationMembershipManager {
    constructor(simulationView) {
        // Core references
        this.view = simulationView;
        this.simulationService = simulationView.simulationService;
        this.currentUser = simulationView.currentUser;
        this.simulationId = simulationView.simulationId;
        
        // Data storage
        this.simulationMembers = [];
        this.currentSimulation = null;
    }

    // ===========================================
    // MEMBER MANAGEMENT (from SimulationMemberManager)
    // ===========================================

    /**
     * Load and display simulation members
     * Consolidated from SimulationMemberManager.loadSimulationMembers()
     */
    async loadSimulationMembers() {
        try {
            this.simulationMembers = await this.simulationService.getSimulationMembers(this.simulationId);
            
            // Update view's members reference for backward compatibility
            this.view.simulationMembers = this.simulationMembers;
            
            console.log("Loaded simulation members:", this.simulationMembers);
            await this.displayMembers();
        } catch (error) {
            console.error("Error loading simulation members:", error);
            this.showMembersError();
        }
    }

    /**
     * Display members in the UI
     * Consolidated from SimulationMemberManager.displayMembers()
     */
    async displayMembers() {
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
    }

    /**
     * Create individual member card element
     * Consolidated from SimulationMemberManager.createMemberCard()
     */
    createMemberCard(member) {
        const memberDiv = document.createElement("div");
        
        // Use the updated permission checking
        const isCreator = this.isCurrentUserCreator();
        console.log("Creating member card - creator check:", isCreator);
        
        memberDiv.innerHTML = getMemberCardTemplate(member, isCreator);
        return memberDiv.firstElementChild;
    }

    /**
     * Check if current user is the simulation creator
     * Fixed to properly check against the actual simulation data
     */
    isCurrentUserCreator() {
        // Use the view's currentSimulation which should be the most up-to-date
        const simulation = this.view.currentSimulation || this.currentSimulation;
        if (!simulation || !this.currentUser) {
            console.log("Creator check failed: missing simulation or user data", {
                simulation: !!simulation,
                currentUser: !!this.currentUser
            });
            return false;
        }
        
        const isCreator = simulation.createdBy === this.currentUser.uid;
        console.log("Creator permission check:", {
            currentUserId: this.currentUser.uid,
            simulationCreatedBy: simulation.createdBy,
            isCreator: isCreator
        });
        
        return isCreator;
    }

    /**
     * Remove a member from the simulation
     * Consolidated from SimulationMemberManager.removeMember()
     */
    async removeMember(userId, userName) {
        try {
            // Update button states
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
            this.view.showTemporaryMessage(`${userName} has been removed from the simulation.`, "success");

            // Reload member data and leaderboard
            await this.loadSimulationMembers();
            if (this.view.loadLeaderboard) {
                await this.view.loadLeaderboard();
            }

        } catch (error) {
            console.error("Error removing member:", error);
            
            // Reset button states
            const kickButtons = document.querySelectorAll(`[data-user-id="${userId}"]`);
            kickButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = "Remove";
            });
            
            // Show error message
            this.view.showTemporaryMessage(`Failed to remove ${userName}: ${error.message}`, "error");
        }
    }

    /**
     * Show members error state
     */
    showMembersError() {
        const membersLoading = document.getElementById("members-loading");
        const membersList = document.getElementById("members-list");
        
        if (membersLoading) membersLoading.classList.add("hidden");
        if (membersList) {
            membersList.innerHTML = getMembersErrorTemplate();
            membersList.classList.remove("hidden");
        }
    }

    // ===========================================
    // MEMBER MANAGEMENT MODAL (from SimulationMemberManager)
    // ===========================================

    /**
     * Handle member management modal display
     * Consolidated from SimulationMemberManager.handleMemberManagement()
     */
    async handleMemberManagement() {
        try {
            console.log("Loading member management...");
            
            // Load detailed member statistics
            const memberStats = await this.simulationService.getMemberStatistics(
                this.simulationId, 
                this.currentUser.uid
            );

            console.log("Member statistics loaded successfully:", memberStats);
            this.showMemberManagementModal(memberStats);

        } catch (error) {
            console.error("Error in handleMemberManagement:", error);
            
            // Enhanced error messages
            if (error.message.includes("permission") || error.message.includes("creator") || error.message.includes("administrator")) {
                alert("You don't have permission to manage members. Only the simulation creator or system administrators can access this feature.");
            } else if (error.message.includes("not found")) {
                alert("Simulation not found or no longer exists.");
            } else {
                alert(`Failed to load member management: ${error.message}`);
            }
        }
    }

    /**
     * Show member management modal
     * Consolidated from SimulationMemberManager.showMemberManagementModal()
     */
    showMemberManagementModal(memberStats) {
        // Remove existing modal if any
        const existingModal = document.getElementById("member-management-modal");
        if (existingModal) existingModal.remove();

        const activeMemberCount = memberStats.filter(m => m.status === MEMBER_STATUS.ACTIVE).length;
        const removedMemberCount = memberStats.filter(m => m.status === MEMBER_STATUS.REMOVED).length;

        const modalHTML = getMemberManagementModalTemplate(memberStats, activeMemberCount, removedMemberCount, this.currentUser);
        document.body.insertAdjacentHTML("beforeend", modalHTML);

        // Attach event listeners
        this.attachMemberManagementListeners();
    }

    /**
     * Attach event listeners for member management modal
     */
    attachMemberManagementListeners() {
        // Close modal handlers
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

        // Member removal handlers (if any kick buttons exist)
        document.querySelectorAll("[data-action='kick-member']").forEach(button => {
            button.addEventListener("click", async (e) => {
                const userId = e.target.dataset.userId;
                const userName = e.target.dataset.userName;
                if (userId && userName) {
                    await this.removeMember(userId, userName);
                }
            });
        });
    }

    // ===========================================
    // ADMIN CONTROLS (from SimulationAdminManager)
    // ===========================================

    /**
     * Handle simulation settings modal
     * Consolidated from SimulationAdminManager.handleSimulationSettings()
     */
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
            this.view.showTemporaryMessage(`Failed to load settings: ${error.message}`, "error");
        }
    }

    /**
     * Show simulation settings modal
     * Consolidated from SimulationAdminManager.showSimulationSettingsModal()
     */
    showSimulationSettingsModal(stats) {
        // Remove existing modal if any
        const existingModal = document.getElementById("simulation-settings-modal");
        if (existingModal) existingModal.remove();

        const modalHTML = getSimulationSettingsModalTemplate(stats);
        document.body.insertAdjacentHTML("beforeend", modalHTML);

        // Attach all event listeners
        this.attachSettingsModalListeners(stats);
    }

    /**
     * Attach event listeners for settings modal
     * Consolidated from SimulationAdminManager.attachSettingsModalListeners()
     */
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
            await this.handleSaveBasicSettings();
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

        // Export results
        document.getElementById("export-results")?.addEventListener("click", async () => {
            await this.handleExportResults();
        });

        // Archive from settings modal
        document.getElementById("archive-simulation")?.addEventListener("click", async () => {
            document.getElementById("simulation-settings-modal")?.remove();
            await this.view.handleArchiveSimulation();
        });
    }

    /**
     * Handle saving basic simulation settings
     * Consolidated from SimulationAdminManager.handleSaveBasicSettings()
     */
    async handleSaveBasicSettings() {
        const nameInput = document.getElementById("sim-name-input");
        const maxMembersInput = document.getElementById("max-members-input");
        const descriptionInput = document.getElementById("sim-description-input");
        
        const settings = {
            name: nameInput.value.trim(),
            maxMembers: parseInt(maxMembersInput.value),
            description: descriptionInput.value.trim()
        };

        if (!settings.name) {
            this.view.showTemporaryMessage("Simulation name cannot be empty", "error");
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
            this.view.showTemporaryMessage(SUCCESS_MESSAGES.SETTINGS_UPDATED, "success");
            
            // CRITICAL FIX: Refresh the current simulation data from Firebase
            await this.view.loadSimulationData();
            
            // CRITICAL FIX: Refresh the dropdown with the new data
            await this.view.loadUserSimulationsForDropdown();
            
            // Update the main simulation display
            if (this.view.displayManager) {
                this.view.displayManager.displaySimulation();
            }
            
            // Close modal after successful save
            setTimeout(() => {
                document.getElementById("simulation-settings-modal")?.remove();
            }, 1500);
        }

        } catch (error) {
            console.error("Error saving settings:", error);
            this.view.showTemporaryMessage(`Failed to save settings: ${error.message}`, "error");
        } finally {
            // Reset button state
            const saveBtn = document.getElementById("save-basic-settings");
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Changes";
            }
        }
    }

    /**
     * Handle extending simulation duration
     * Consolidated from SimulationAdminManager.handleExtendSimulation()
     */
    async handleExtendSimulation() {
        const extensionDays = prompt("How many days would you like to extend the simulation?", "7");
        
        if (!extensionDays || isNaN(extensionDays) || parseInt(extensionDays) <= 0) {
            this.view.showTemporaryMessage("Please enter a valid number of days", "error");
            return;
        }

        try {
            const result = await this.simulationService.extendSimulation(
                this.simulationId,
                this.currentUser.uid,
                parseInt(extensionDays)
            );

            if (result.success) {
                this.view.showTemporaryMessage(`Simulation extended by ${extensionDays} days`, "success");
                
                // Reload simulation data
                this.view.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
                
                // Update display
                if (this.view.displayManager) {
                    this.view.displayManager.updateReferences(this.view.currentSimulation, this.currentUser);
                    this.view.displayManager.displaySimulation();
                }
                
                // Close modal
                document.getElementById("simulation-settings-modal")?.remove();
            }

        } catch (error) {
            console.error("Error extending simulation:", error);
            this.view.showTemporaryMessage(`Failed to extend simulation: ${error.message}`, "error");
        }
    }

    /**
     * Handle ending simulation early
     * Consolidated from SimulationAdminManager.handleEndSimulation()
     */
    async handleEndSimulation() {
        const reason = prompt("Please provide a reason for ending the simulation early (optional):", "");
        
        if (!confirm("Are you sure you want to end this simulation early? This action cannot be undone.")) {
            return;
        }

        try {
            const result = await this.simulationService.endSimulationEarly(
                this.simulationId,
                this.currentUser.uid,
                reason || "Ended early by creator"
            );

            if (result.success) {
                this.view.showTemporaryMessage("Simulation ended successfully", "success");
                
                // Reload simulation data
                this.view.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
                
                // Update display
                if (this.view.displayManager) {
                    this.view.displayManager.updateReferences(this.view.currentSimulation, this.currentUser);
                    this.view.displayManager.displaySimulation();
                }
                
                // Close modal and potentially show archive prompt
                document.getElementById("simulation-settings-modal")?.remove();
                
                // Show archive prompt if simulation is now ended
                if (this.view.showArchivePrompt && !this.view.currentSimulation.archived) {
                    setTimeout(() => this.view.showArchivePrompt(), 1000);
                }
            }

        } catch (error) {
            console.error("Error ending simulation:", error);
            this.view.showTemporaryMessage(`Failed to end simulation: ${error.message}`, "error");
        }
    }

    /**
     * Handle saving simulation rules
     * Consolidated from SimulationAdminManager.handleSaveRules()
     */
    async handleSaveRules(_simulation) {
        // Implementation depends on your rules system
        // This is a placeholder that maintains the existing structure
        console.log("Save rules functionality - to be implemented based on your rules system");
        this.view.showTemporaryMessage("Rules saving functionality is being developed", "info");
    }

    /**
     * Handle exporting simulation results
     * Consolidated from SimulationAdminManager.handleExportResults()
     */
    async handleExportResults() {
        try {
            this.view.showTemporaryMessage("Preparing export...", "info");
            
            // This would typically call a service method to generate and download results
            // Implementation depends on your export requirements
            console.log("Export results functionality - preparing data export");
            
            // Placeholder for actual export functionality
            setTimeout(() => {
                this.view.showTemporaryMessage("Export functionality is being developed", "info");
            }, 1000);

        } catch (error) {
            console.error("Error exporting results:", error);
            this.view.showTemporaryMessage(`Failed to export results: ${error.message}`, "error");
        }
    }

    // ===========================================
    // UTILITY METHODS & BACKWARD COMPATIBILITY
    // ===========================================

    /**
     * Update simulation reference for better permission checking
     * Maintains backward compatibility with existing calls
     */
    updateSimulationReference(simulation) {
        this.currentSimulation = simulation;
        this.view.currentSimulation = simulation;
        
        console.log("Updated simulation reference for membership manager:", {
            simulationId: simulation?.id,
            createdBy: simulation?.createdBy,
            currentUserId: this.currentUser?.uid
        });
    }

    /**
     * Get current members list for external access
     */
    getCurrentMembers() {
        return this.simulationMembers;
    }

    /**
     * Check if current user has creator privileges
     */
    hasCreatorPrivileges() {
        return this.isCurrentUserCreator();
    }

    /**
     * Refresh members data
     */
    async refreshMembers() {
        await this.loadSimulationMembers();
    }

    /**
     * Backward compatibility methods for simulation.js
     * These maintain the existing API so simulation.js doesn't need major changes
     */

    // From SimulationAdminManager - admin functionality access
    async loadManagementData() {
        // This method exists for backward compatibility
        // The actual loading is now handled within handleSimulationSettings()
        console.log("Management data loading handled within settings modal");
    }

    // Unified error handling
    handleMembershipError(error, context = "membership operation") {
        console.error(`Error in ${context}:`, error);
        
        if (error.message.includes("permission")) {
            this.view.showTemporaryMessage("You don't have permission for this action", "error");
        } else if (error.message.includes("not found")) {
            this.view.showTemporaryMessage("Simulation or member not found", "error");
        } else {
            this.view.showTemporaryMessage(`${context} failed: ${error.message}`, "error");
        }
    }
}