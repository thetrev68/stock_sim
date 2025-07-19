// src/components/simulation/SimulationMemberManager.js
// Member management for simulation view - extracted from simulation.js

import { MEMBER_STATUS } from "../../constants/simulation-status.js";
import { getMemberCardTemplate } from "../../templates/simulation/member-components.js";
import { getMemberManagementModalTemplate } from "../../templates/simulation/simulation-modals.js";
import { getMembersErrorTemplate } from "../../templates/simulation/error-states.js";

export class SimulationMemberManager {
    constructor(simulationView) {
        this.view = simulationView;
        this.simulationMembers = [];
    }

    async loadSimulationMembers() {
        try {
            this.simulationMembers = await this.view.simulationService.getSimulationMembers(this.view.simulationId);
            
            // Update view's members reference
            this.view.simulationMembers = this.simulationMembers;
            
            console.log("Loaded simulation members:", this.simulationMembers);
            this.displayMembers();
        } catch (error) {
            console.error("Error loading simulation members:", error);
            this.showMembersError();
        }
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
            member.userId === this.view.currentUser.uid && member.role === "creator"
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
        memberDiv.innerHTML = getMemberCardTemplate(member, this.view.currentUser, isCreator);

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
            member.userId === this.view.currentUser.uid && member.role === "creator"
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

    async handleMemberManagement() {
        try {
            // Load detailed member statistics
            const memberStats = await this.view.simulationService.getMemberStatistics(
                this.view.simulationId, 
                this.view.currentUser.uid
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