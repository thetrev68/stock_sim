// src/components/simulation/JoinSimulationModal.js
import { SimulationService } from "../../services/simulation.js";
import { AuthService } from "../../services/auth.js";
import { capitalize } from "../../utils/string-utils.js";
import { logger } from "../../utils/logger.js";
import { validateInviteCode } from "../../utils/validation-utils.js";

export class JoinSimulationModal {
    constructor() {
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.isVisible = false;
        this.onSimulationJoined = null;
    }

    show(onJoinedCallback = null) {
        this.onSimulationJoined = onJoinedCallback;
        this.isVisible = true;
        this.render();
        this.attachEventListeners();
        
        // Focus on invite code input
        setTimeout(() => {
            const codeInput = document.getElementById("invite-code");
            if (codeInput) codeInput.focus();
        }, 100);
    }

    hide() {
        this.isVisible = false;
        const modal = document.getElementById("join-simulation-modal");
        if (modal) {
            modal.remove();
        }
    }

    render() {
        // Remove existing modal if any
        const existingModal = document.getElementById("join-simulation-modal");
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="join-simulation-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                    <!-- Header -->
                    <div class="flex justify-between items-center p-6 border-b border-gray-700">
                        <div>
                            <h2 class="text-xl font-bold text-white">Join Simulation</h2>
                            <p class="text-gray-400 mt-1">Enter the invite code you received</p>
                        </div>
                        <button id="close-join-modal-btn" class="text-gray-400 hover:text-white transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Form -->
                    <form id="join-simulation-form" class="p-6 space-y-6">
                        <div>
                            <label for="invite-code" class="block text-sm font-medium text-gray-300 mb-2">
                                Invite Code
                            </label>
                            <input 
                                type="text" 
                                id="invite-code" 
                                required
                                maxlength="6"
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition uppercase text-center text-2xl font-mono tracking-widest"
                                placeholder="ABC123"
                            >
                            <p class="text-xs text-gray-500 mt-2">6-character code from simulation creator</p>
                        </div>

                        <!-- Preview Area (will show simulation details when code is valid) -->
                        <div id="simulation-preview" class="hidden bg-gray-700 rounded-lg p-4 space-y-3">
                            <h3 class="text-white font-semibold">Simulation Preview</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Name:</span>
                                    <span id="preview-name" class="text-white"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Duration:</span>
                                    <span id="preview-duration" class="text-white"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Starting Balance:</span>
                                    <span id="preview-balance" class="text-white"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Participants:</span>
                                    <span id="preview-members" class="text-white"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Status:</span>
                                    <span id="preview-status" class="text-white"></span>
                                </div>
                            </div>
                            <div id="preview-description" class="text-gray-300 text-sm mt-3 pt-3 border-t border-gray-600"></div>
                        </div>

                        <!-- Error Message -->
                        <div id="join-sim-error" class="hidden bg-red-900/20 border border-red-500 rounded-lg p-3">
                            <p class="text-red-400 text-sm"></p>
                        </div>

                        <!-- Success Message -->
                        <div id="join-sim-success" class="hidden bg-green-900/20 border border-green-500 rounded-lg p-3">
                            <p class="text-green-400 text-sm"></p>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                            <button 
                                type="button" 
                                id="cancel-join-btn"
                                class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                id="join-sim-btn"
                                disabled
                                class="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                            >
                                <span id="join-sim-text">Join Simulation</span>
                                <div id="join-sim-loading" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    attachEventListeners() {
        const modal = document.getElementById("join-simulation-modal");
        const form = document.getElementById("join-simulation-form");
        const closeBtn = document.getElementById("close-join-modal-btn");
        const cancelBtn = document.getElementById("cancel-join-btn");
        const inviteCodeInput = document.getElementById("invite-code");

        // Close modal events
        closeBtn?.addEventListener("click", () => this.hide());
        cancelBtn?.addEventListener("click", () => this.hide());
        
        // Close on outside click
        modal?.addEventListener("click", (e) => {
            if (e.target === modal) this.hide();
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isVisible) this.hide();
        });

        // Form submission
        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleJoinSimulation();
        });

        // Auto-format invite code input
        inviteCodeInput?.addEventListener("input", (e) => {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
            e.target.value = value;
            
            // Preview simulation when code is 6 characters
            if (value.length === 6) {
                this.previewSimulation(value);
            } else {
                this.hidePreview();
                this.disableJoinButton();
            }
        });

        // Paste handling for invite codes
        inviteCodeInput?.addEventListener("paste", (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData("text");
            const cleaned = paste.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
            e.target.value = cleaned;
            
            if (cleaned.length === 6) {
                this.previewSimulation(cleaned);
            }
        });
    }

    async previewSimulation(inviteCodeValue) {
        const codeResult = validateInviteCode(inviteCodeValue);
        if (!codeResult.valid) {
            this.hidePreview();
            this.disableJoinButton();
            this.showError(codeResult.message);
            return;
        }

        try {
            this.simulationService.initialize();
            
            // Find simulation by invite code (we'll need a preview method that doesn't join)
            const simQuery = await this.simulationService.findSimulationByCode(codeResult.code);
            
            if (simQuery) {
                this.showPreview(simQuery);
                this.enableJoinButton();
                this.hideError();
            } else {
                this.hidePreview();
                this.disableJoinButton();
                this.showError("Invalid invite code");
            }
        } catch (error) {
            logger.error("Error previewing simulation:", error);
            this.hidePreview();
            this.disableJoinButton();
            this.showError("Error loading simulation details");
        }
    }

    showPreview(simulation) {
        const preview = document.getElementById("simulation-preview");
        const nameEl = document.getElementById("preview-name");
        const durationEl = document.getElementById("preview-duration");
        const balanceEl = document.getElementById("preview-balance");
        const membersEl = document.getElementById("preview-members");
        const statusEl = document.getElementById("preview-status");
        const descriptionEl = document.getElementById("preview-description");

        if (nameEl) nameEl.textContent = simulation.name;
        if (balanceEl) balanceEl.textContent = `$${simulation.startingBalance.toLocaleString()}`;
        if (membersEl) membersEl.textContent = `${simulation.memberCount}/${simulation.maxMembers}`;
        
        // Format dates
        const startDate = simulation.startDate.toDate ? simulation.startDate.toDate() : new Date(simulation.startDate);
        const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
        const duration = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        if (durationEl) durationEl.textContent = duration;

        // Status with color
        if (statusEl) {
            statusEl.textContent = capitalize(simulation.status)
            statusEl.className = simulation.status === "active" ? "text-green-400" : 
                               simulation.status === "pending" ? "text-yellow-400" : "text-gray-400";
        }

        // Description
        if (descriptionEl) {
            if (simulation.description && simulation.description.trim()) {
                descriptionEl.textContent = simulation.description;
                descriptionEl.style.display = "block";
            } else {
                descriptionEl.style.display = "none";
            }
        }

        if (preview) preview.classList.remove("hidden");
    }

    hidePreview() {
        const preview = document.getElementById("simulation-preview");
        if (preview) preview.classList.add("hidden");
    }

    enableJoinButton() {
        const joinBtn = document.getElementById("join-sim-btn");
        if (joinBtn) joinBtn.disabled = false;
    }

    disableJoinButton() {
        const joinBtn = document.getElementById("join-sim-btn");
        if (joinBtn) joinBtn.disabled = true;
    }

    async handleJoinSimulation() {
        const inviteCodeValue = document.getElementById("invite-code")?.value.trim();

        const codeResult = validateInviteCode(inviteCodeValue);
        if (!codeResult.valid) {
            this.showError(codeResult.message);
            return;
        }

        const inviteCode = codeResult.code; // Use the cleaned/validated code

        this.setLoading(true);
        this.hideError();
        this.hideSuccess();

        try {
            const user = this.authService.getCurrentUser();
            if (!user) {
                throw new Error("You must be signed in to join a simulation");
            }

            const userInfo = {
                displayName: user.displayName || user.email,
                email: user.email
            };

            const result = await this.simulationService.joinSimulationByCode(inviteCode, user.uid, userInfo);
            
            if (result.success) {
                logger.info("Successfully joined simulation:", result.simulation);
                this.showSuccess(`Successfully joined "${result.simulation.name}"!`);
                
                // Call callback if provided
                if (this.onSimulationJoined) {
                    this.onSimulationJoined(result.simulation);
                }
                
                // Close modal after brief delay
                setTimeout(() => {
                    this.hide();
                }, 2000);
            }

        } catch (error) {
            logger.error("Error joining simulation:", error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        const submitBtn = document.getElementById("join-sim-btn");
        const submitText = document.getElementById("join-sim-text");
        const loadingSpinner = document.getElementById("join-sim-loading");
        
        if (submitBtn) submitBtn.disabled = loading;
        if (submitText) {
            if (loading) {
                submitText.classList.add("hidden");
                loadingSpinner?.classList.remove("hidden");
            } else {
                submitText.classList.remove("hidden");
                loadingSpinner?.classList.add("hidden");
            }
        }
    }

    showError(message) {
        const errorDiv = document.getElementById("join-sim-error");
        const errorText = errorDiv?.querySelector("p");
        
        if (errorText) errorText.textContent = message;
        if (errorDiv) errorDiv.classList.remove("hidden");
    }

    hideError() {
        const errorDiv = document.getElementById("join-sim-error");
        if (errorDiv) errorDiv.classList.add("hidden");
    }

    showSuccess(message) {
        const successDiv = document.getElementById("join-sim-success");
        const successText = successDiv?.querySelector("p");
        
        if (successText) successText.textContent = message;
        if (successDiv) successDiv.classList.remove("hidden");
    }

    hideSuccess() {
        const successDiv = document.getElementById("join-sim-success");
        if (successDiv) successDiv.classList.add("hidden");
    }
}