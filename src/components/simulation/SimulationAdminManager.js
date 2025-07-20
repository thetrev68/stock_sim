// src/components/simulation/SimulationAdminManager.js
// Admin and settings management for simulation view - extracted from views/simulation.js

import { getSimulationSettingsModalTemplate } from "../../templates/simulation/simulation-modals.js";
import { SUCCESS_MESSAGES, INFO_MESSAGES } from "../../constants/ui-messages.js";

export class SimulationAdminManager {
    constructor(simulationView) {
        this.view = simulationView;
        this.simulationService = simulationView.simulationService;
        this.currentUser = simulationView.currentUser;
        this.simulationId = simulationView.simulationId;
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
            this.view.showTemporaryMessage(`Failed to load settings: ${error.message}`, "error");
        }
    }

    showSimulationSettingsModal(stats) {
        // Remove existing modal if any
        const existingModal = document.getElementById("simulation-settings-modal");
        if (existingModal) {
            existingModal.remove();
        }

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
                
                // Update local simulation data
                this.view.currentSimulation.name = settings.name;
                this.view.currentSimulation.maxMembers = settings.maxMembers;
                this.view.currentSimulation.description = settings.description;
                
                // Update the main simulation display
                this.view.displaySimulation();
                
                if (result.changes.length > 0) {
                    console.log("Settings changes applied:", result.changes);
                }
            }

        } catch (error) {
            console.error("Error saving basic settings:", error);
            this.view.showTemporaryMessage(`Failed to save settings: ${error.message}`, "error");
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
            this.view.showTemporaryMessage("Please select a new end date", "error");
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

            this.view.showTemporaryMessage("Simulation extended successfully!", "success");
            
            // Reload simulation data
            this.view.currentSimulation = await this.simulationService.getSimulation(this.simulationId);
            this.view.displaySimulation();
            
            // Close modal and refresh
            document.getElementById("simulation-settings-modal")?.remove();

        } catch (error) {
            console.error("Error extending simulation:", error);
            this.view.showTemporaryMessage(`Failed to extend simulation: ${error.message}`, "error");
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
            this.view.showTemporaryMessage("Reason is required to end simulation early", "error");
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

            this.view.showTemporaryMessage("Simulation ended successfully", "success");
            
            // Close modal first
            document.getElementById("simulation-settings-modal")?.remove();
            
            // Force complete reload of simulation data
            console.log("Forcing simulation data reload...");
            await this.view.forceReloadSimulationData();
            
            // Show final results message
            setTimeout(() => {
                this.view.showTemporaryMessage("Simulation has ended. Final results are now available.", "info");
            }, 1000);

        } catch (error) {
            console.error("Error ending simulation:", error);
            this.view.showTemporaryMessage(`Failed to end simulation: ${error.message}`, "error");
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
                this.view.showTemporaryMessage("Trading rules updated successfully", "success");
                
                // Update local simulation data
                this.view.currentSimulation.rules = rules;
                this.view.updateSimulationRules();
            }

        } catch (error) {
            console.error("Error saving rules:", error);
            this.view.showTemporaryMessage(`Failed to save rules: ${error.message}`, "error");
        } finally {
            const saveBtn = document.getElementById("save-rules");
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Rule Changes";
            }
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
                originalSimulation: this.view.currentSimulation,
                finalResults: this.view.leaderboardData,
                memberCount: this.view.simulationMembers.length,
                totalTrades: this.view.leaderboardData?.rankings?.reduce((sum, r) => sum + (r.totalTrades || 0), 0) || 0,
                totalVolume: this.view.leaderboardData?.rankings?.reduce((sum, r) => sum + (r.totalVolume || 0), 0) || 0,
                winner: this.view.leaderboardData?.rankings?.[0] || null,
                duration: this.view.currentSimulation.endDate && this.view.currentSimulation.startDate ? 
                    Math.ceil((this.view.currentSimulation.endDate.toDate() - this.view.currentSimulation.startDate.toDate()) / (1000 * 60 * 60 * 24)) : 0,
                endedEarly: this.view.currentSimulation.endedEarly || false,
                endReason: this.view.currentSimulation.endReason || null
            });

            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${this.view.currentSimulation.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_results_${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.view.showTemporaryMessage("Results exported successfully!", "success");

        } catch (error) {
            console.error("Error exporting results:", error);
            this.view.showTemporaryMessage(`Failed to export results: ${error.message}`, "error");
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
}