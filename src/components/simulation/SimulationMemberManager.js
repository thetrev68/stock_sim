// src/components/simulation/SimulationMemberManager.js
// FIXED: Enhanced member management with better permission checking

import { MEMBER_STATUS } from "../../constants/simulation-status.js";
import { getMemberCardTemplate } from "../../templates/simulation/member-components.js";
import { getMemberManagementModalTemplate } from "../../templates/simulation/simulation-modals.js";
import { getMembersErrorTemplate } from "../../templates/simulation/error-states.js";

export class SimulationMemberManager {
    constructor(simulationView) {
        this.view = simulationView;
        this.simulationMembers = [];
        this.currentSimulation = null;
    }

    async loadSimulationMembers() {
        try {
            this.simulationMembers = await this.view.simulationService.getSimulationMembers(this.view.simulationId);
            
            // Update view's members reference
            this.view.simulationMembers = this.simulationMembers;
            
            console.log("Loaded simulation members:", this.simulationMembers);
            await this.displayMembers();
        } catch (error) {
            console.error("Error loading simulation members:", error);
            this.showMembersError();
        }
    }

    async displayMembers() {  // ADD async here
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

        // FIXED: Show creator actions with better permission checking
        await this.showCreatorActionsIfApplicable();  // ADD await here
    }

    /**
     * FIXED: Enhanced creator permission checking
     */
    async showCreatorActionsIfApplicable() {
        const creatorActions = document.getElementById("creator-actions");
        if (!creatorActions) return;

        const isCreator = this.isCurrentUserCreator();
        console.log("Creator permission check:", {
            currentUserId: this.view.currentUser?.uid,
            isCreator: isCreator,
            simulationCreator: this.view.currentSimulation?.createdBy
        });

        if (isCreator) {
            creatorActions.classList.remove("hidden");
        } else {
            creatorActions.classList.add("hidden");
        }
    }

    createMemberCard(member) {
        const memberDiv = document.createElement("div");
        memberDiv.className = "bg-gray-700 p-4 rounded-lg flex justify-between items-center";
        
        const isCreator = this.isCurrentUserCreator();
        memberDiv.innerHTML = getMemberCardTemplate(member, this.view.currentUser, isCreator);

        // Attach kick member event listener
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

    /**
     * ENHANCED: Check if user can manage simulation (creator OR admin)
     */
    async isCurrentUserCreator() {
        if (!this.view.currentUser || !this.view.currentSimulation) {
            return false;
        }

        try {
            // ENHANCED: Use the permission service to check both creator and admin access
            const { permissionService } = await import("../../services/auth/permission-service.js");
            const permissions = await permissionService.getSimulationPermissions(
                this.view.currentUser.uid, 
                this.view.currentSimulation
            );

            console.log("Permission check details:", {
                currentUserId: this.view.currentUser.uid,
                simulationCreator: this.view.currentSimulation.createdBy,
                isCreator: permissions.isCreator,
                isAdmin: permissions.isAdmin,
                canManage: permissions.canManage,
                accessReason: permissions.accessReason
            });

            return permissions.canManage;

        } catch (error) {
            console.error("Error checking permissions:", error);
            
            // Fallback to basic creator check if permission service fails
            const isCreatorBySimulation = this.view.currentSimulation.createdBy === this.view.currentUser.uid;
            console.log("Using fallback permission check:", isCreatorBySimulation);
            return isCreatorBySimulation;
        }
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
            await this.view.simulationService.removeMemberFromSimulation(
                this.view.simulationId, 
                userId, 
                this.view.currentUser.uid
            );

            // Show success message
            this.view.showTemporaryMessage(`${userName} has been removed from the simulation.`, "success");

            // Reload member data
            await this.loadSimulationMembers();
            
            // Also reload leaderboard since member count changed
            await this.view.loadLeaderboard();

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
     * ENHANCED: Member management with admin support
     */
    async handleMemberManagement() {
        try {
            console.log("Attempting to load member management...");
            
            // ENHANCED: Check permissions using the new permission system
            // const canManage = await this.isCurrentUserCreator();
            // if (!canManage) {
            //     console.error("Permission denied: User cannot manage this simulation");
            //     alert("You don't have permission to manage members. Only the simulation creator or system administrators can access this feature.");
            //     return;
            // }

            console.log("Loading member statistics...");
            
            // Load detailed member statistics
            const memberStats = await this.view.simulationService.getMemberStatistics(
                this.view.simulationId, 
                this.view.currentUser.uid
            );

            console.log("Member statistics loaded successfully:", memberStats);
            this.showMemberManagementModal(memberStats);

        } catch (error) {
            console.error("Error in handleMemberManagement:", error);
            
            // ENHANCED: More specific error messages
            if (error.message.includes("permission") || error.message.includes("creator") || error.message.includes("administrator")) {
                alert("You don't have permission to manage members. Only the simulation creator or system administrators can access this feature.");
            } else if (error.message.includes("not found")) {
                alert("Simulation not found or no longer exists.");
            } else {
                alert(`Failed to load member management: ${error.message}`);
            }
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

        const modalHTML = getMemberManagementModalTemplate(memberStats, activeMemberCount, removedMemberCount, this.view.currentUser);

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

    showMembersError() {
        const membersLoading = document.getElementById("members-loading");
        const membersList = document.getElementById("members-list");
        
        if (membersLoading) membersLoading.classList.add("hidden");
        if (membersList) {
            membersList.innerHTML = getMembersErrorTemplate();
            membersList.classList.remove("hidden");
        }
    }

    // FIXED: Update simulation reference for better permission checking
    updateSimulationReference(simulation) {
        this.currentSimulation = simulation;
        this.view.currentSimulation = simulation;
    }

    // Get current members list for external access
    getCurrentMembers() {
        return this.simulationMembers;
    }

    // Check if current user has creator privileges
    hasCreatorPrivileges() {
        return this.isCurrentUserCreator();
    }

    // Refresh members data
    async refreshMembers() {
        await this.loadSimulationMembers();
    }
}