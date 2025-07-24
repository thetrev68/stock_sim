// src/components/simulation/CreateSimulationModal.js
import { SimulationService } from "../../services/simulation.js";
import { AuthService } from "../../services/auth.js";
import { 
    validateSimulationName, 
    validateDateRange, 
    validateStartingBalance 
} from "../../utils/validation-utils.js";

export class CreateSimulationModal {
    constructor() {
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.isVisible = false;
        this.onSimulationCreated = null;
    }

    show(onCreatedCallback = null) {
        this.onSimulationCreated = onCreatedCallback;
        this.isVisible = true;
        this.render();
        this.attachEventListeners();
        
        setTimeout(() => {
            const nameInput = document.getElementById("sim-name");
            if (nameInput) nameInput.focus();
        }, 100);
    }

    hide() {
        this.isVisible = false;
        const modal = document.getElementById("create-simulation-modal");
        if (modal) {
            modal.remove();
        }
    }

    render() {
        const existingModal = document.getElementById("create-simulation-modal");
        if (existingModal) {
            existingModal.remove();
        }

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        
        const defaultEndDate = new Date();
        defaultEndDate.setDate(defaultEndDate.getDate() + 7);
        const defaultEndStr = defaultEndDate.toISOString().split("T")[0];

        const modalHTML = `
            <div id="create-simulation-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center p-6 border-b border-gray-700">
                        <div>
                            <h2 class="text-2xl font-bold text-white">Create New Simulation</h2>
                            <p class="text-gray-400 mt-1">Set up a trading competition with friends</p>
                        </div>
                        <button id="close-modal-btn" class="text-gray-400 hover:text-white transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <form id="create-simulation-form" class="p-6 space-y-6">
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-white">Basic Information</h3>
                            
                            <div>
                                <label for="sim-name" class="block text-sm font-medium text-gray-300 mb-2">
                                    Simulation Name *
                                </label>
                                <input 
                                    type="text" 
                                    id="sim-name" 
                                    required
                                    maxlength="100"
                                    class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                    placeholder="e.g., Q1 Trading Challenge"
                                >
                                <p class="text-xs text-gray-500 mt-1">Choose a memorable name for your simulation</p>
                            </div>

                            <div>
                                <label for="sim-description" class="block text-sm font-medium text-gray-300 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea 
                                    id="sim-description" 
                                    rows="3"
                                    maxlength="500"
                                    class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none"
                                    placeholder="Describe the competition goals or rules..."
                                ></textarea>
                                <p class="text-xs text-gray-500 mt-1">Help participants understand the competition</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-white">Timeline & Budget</h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="sim-start-date" class="block text-sm font-medium text-gray-300 mb-2">
                                        Start Date *
                                    </label>
                                    <input 
                                        type="date" 
                                        id="sim-start-date" 
                                        required
                                        min="${todayStr}"
                                        value="${todayStr}"
                                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                    >
                                </div>

                                <div>
                                    <label for="sim-end-date" class="block text-sm font-medium text-gray-300 mb-2">
                                        End Date *
                                    </label>
                                    <input 
                                        type="date" 
                                        id="sim-end-date" 
                                        required
                                        min="${todayStr}"
                                        value="${defaultEndStr}"
                                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                    >
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="sim-starting-balance" class="block text-sm font-medium text-gray-300 mb-2">
                                        Starting Balance *
                                    </label>
                                    <div class="relative">
                                        <span class="absolute left-4 top-3 text-gray-400">$</span>
                                        <input 
                                            type="number" 
                                            id="sim-starting-balance" 
                                            required
                                            min="1000"
                                            max="1000000"
                                            value="10000"
                                            step="1000"
                                            class="w-full bg-gray-700 text-white rounded-lg pl-8 pr-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                        >
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">Paper money each participant starts with</p>
                                </div>

                                <div>
                                    <label for="sim-max-members" class="block text-sm font-medium text-gray-300 mb-2">
                                        Max Participants
                                    </label>
                                    <input 
                                        type="number" 
                                        id="sim-max-members" 
                                        min="2"
                                        max="100"
                                        value="20"
                                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                    >
                                    <p class="text-xs text-gray-500 mt-1">Maximum number of participants allowed</p>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-white">Advanced Rules</h3>
                            
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                    <div>
                                        <h4 class="text-white font-medium">Short Selling</h4>
                                        <p class="text-sm text-gray-400">Allow participants to sell stocks they don't own</p>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer" style="width: 44px; height: 24px;">
                                        <input type="checkbox" id="sim-short-selling" class="absolute opacity-0" onchange="this.nextElementSibling.querySelector('div').style.transform = this.checked ? 'translateX(20px)' : 'translateX(0)'; this.nextElementSibling.style.backgroundColor = this.checked ? '#06b6d4' : '#4b5563';">
                                        <div class="w-11 h-6 bg-gray-600 rounded-full relative transition-colors duration-200">
                                            <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out"></div>
                                        </div>
                                    </label>
                                </div>

                                <div class="p-4 bg-gray-700 rounded-lg">
                                    <h4 class="text-white font-medium mb-3">Trading Hours</h4>
                                    <div class="space-y-2">
                                        <label class="flex items-center cursor-pointer" style="margin: 4px 0;">
                                            <input type="radio" name="trading-hours" value="market" checked class="text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500" style="width: 16px; height: 16px; margin: 0; cursor: pointer;">
                                            <span class="ml-3 text-white">Market Hours Only</span>
                                        </label>
                                        <label class="flex items-center cursor-pointer" style="margin: 4px 0;">
                                            <input type="radio" name="trading-hours" value="24/7" class="text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500" style="width: 16px; height: 16px; margin: 0; cursor: pointer;">
                                            <span class="ml-3 text-white">24/7 Trading</span>
                                        </label>
                                    </div>
                                    <p class="text-sm text-gray-400 mt-2">When participants can make trades</p>
                                </div>
                            </div>
                        </div>

                        <div id="create-sim-error" class="hidden bg-red-900/20 border border-red-500 rounded-lg p-4">
                            <p class="text-red-400 text-sm"></p>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                            <button 
                                type="button" 
                                id="cancel-create-btn"
                                class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                id="create-sim-btn"
                                class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                            >
                                <span id="create-sim-text">Create Simulation</span>
                                <div id="create-sim-loading" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    attachEventListeners() {
        const modal = document.getElementById("create-simulation-modal");
        const form = document.getElementById("create-simulation-form");
        const closeBtn = document.getElementById("close-modal-btn");
        const cancelBtn = document.getElementById("cancel-create-btn");

        closeBtn?.addEventListener("click", () => this.hide());
        cancelBtn?.addEventListener("click", () => this.hide());
        
        modal?.addEventListener("click", (e) => {
            if (e.target === modal) this.hide();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isVisible) this.hide();
        });

        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleCreateSimulation();
        });

        const startDateInput = document.getElementById("sim-start-date");
        const endDateInput = document.getElementById("sim-end-date");
        
        startDateInput?.addEventListener("change", () => {
            const startDate = startDateInput.value;
            if (startDate) {
                endDateInput.min = startDate;
                if (endDateInput.value && endDateInput.value < startDate) {
                    const newEndDate = new Date(startDate);
                    newEndDate.setDate(newEndDate.getDate() + 7);
                    endDateInput.value = newEndDate.toISOString().split("T")[0];
                }
            }
        });
    }

    async handleCreateSimulation() {
        const formData = this.getFormData();
        
        if (!formData) return;

        this.setLoading(true);
        this.hideError();

        try {
            const user = this.authService.getCurrentUser();
            if (!user) {
                throw new Error("You must be signed in to create a simulation");
            }

            this.simulationService.initialize();

            const result = await this.simulationService.createSimulation(user.uid, formData);
            
            if (result.success) {
                console.log("Simulation created successfully:", result);
                
                this.showSuccess(result.inviteCode);
                
                if (this.onSimulationCreated) {
                    this.onSimulationCreated(result);
                }
                
                setTimeout(() => {
                    this.hide();
                }, 2000);
            }

        } catch (error) {
            console.error("Error creating simulation:", error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    getFormData() {
        const name = document.getElementById("sim-name")?.value.trim();
        const description = document.getElementById("sim-description")?.value.trim();
        const startDate = document.getElementById("sim-start-date")?.value;
        const endDate = document.getElementById("sim-end-date")?.value;
        const startingBalance = parseInt(document.getElementById("sim-starting-balance")?.value);
        const maxMembers = parseInt(document.getElementById("sim-max-members")?.value);
        const allowShortSelling = document.getElementById("sim-short-selling")?.checked;
        const tradingHours = document.querySelector("input[name=\"trading-hours\"]:checked")?.value;

        // Validate simulation name
        const nameResult = validateSimulationName(name);
        if (!nameResult.valid) {
            this.showError(nameResult.message);
            return null;
        }

        // Validate date range
        const dateResult = validateDateRange(startDate, endDate);
        if (!dateResult.valid) {
            this.showError(dateResult.message);
            return null;
        }

        // Validate starting balance
        const balanceResult = validateStartingBalance(startingBalance);
        if (!balanceResult.valid) {
            this.showError(balanceResult.message);
            return null;
        }

        // Validate max members
        if (!maxMembers || maxMembers < 2) {
            this.showError("Maximum members must be at least 2");
            return null;
        }

        if (maxMembers > 500) {
            this.showError("Maximum members cannot exceed 500");
            return null;
        }

        return {
            name: nameResult.name,
            description,
            startDate: dateResult.startDate,
            endDate: dateResult.endDate,
            startingBalance: balanceResult.balance,
            maxMembers,
            allowShortSelling,
            tradingHours: tradingHours || "market"
        };
    }

    setLoading(loading) {
        const submitBtn = document.getElementById("create-sim-btn");
        const submitText = document.getElementById("create-sim-text");
        const loadingSpinner = document.getElementById("create-sim-loading");
        
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
        const errorDiv = document.getElementById("create-sim-error");
        const errorText = errorDiv?.querySelector("p");
        
        if (errorText) errorText.textContent = message;
        if (errorDiv) errorDiv.classList.remove("hidden");
    }

    hideError() {
        const errorDiv = document.getElementById("create-sim-error");
        if (errorDiv) errorDiv.classList.add("hidden");
    }

    showSuccess(inviteCode) {
        const submitBtn = document.getElementById("create-sim-btn");
        if (submitBtn) {
            submitBtn.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Created! Code: ${inviteCode}
            `;
            submitBtn.className = "flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center";
        }
    }
}