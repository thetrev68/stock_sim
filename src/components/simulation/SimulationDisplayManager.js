// src/components/simulation/SimulationDisplayManager.js
// Manages all display updates and template rendering for simulation view

import { SIMULATION_STATUS } from "../../constants/simulation-status.js";
import { formatDateRange, calculateDaysRemaining } from "../../utils/date-utils.js";
import { formatCurrencyWithCommas } from "../../utils/currency-utils.js";
import { capitalize } from "../../utils/string-utils.js";

export class SimulationDisplayManager {
    constructor(simulationView) {
        this.simulationView = simulationView;
        this.currentSimulation = null;
        this.currentUser = null;
        this.leaderboardData = null;
    }

    // Update references to current data
    updateReferences(currentSimulation, currentUser, leaderboardData = null) {
        this.currentSimulation = currentSimulation;
        this.currentUser = currentUser;
        this.leaderboardData = leaderboardData;
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
        if (this.simulationView.portfolioManager) {
            this.simulationView.portfolioManager.updatePortfolioStats();
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

    // Show/hide loading states
    showLoadingState() {
        const loadingEl = document.getElementById("simulation-loading");
        const contentEl = document.getElementById("simulation-content");
        
        if (loadingEl) loadingEl.classList.remove("hidden");
        if (contentEl) contentEl.classList.add("hidden");
    }

    hideLoadingState() {
        const loadingEl = document.getElementById("simulation-loading");
        const contentEl = document.getElementById("simulation-content");
        
        if (loadingEl) loadingEl.classList.add("hidden");
        if (contentEl) contentEl.classList.remove("hidden");
    }

    // Update specific UI elements
    updateTradeButtonText(text) {
        const tradeBtnTextEl = document.getElementById("trade-btn-text");
        if (tradeBtnTextEl) {
            tradeBtnTextEl.textContent = text;
        }
    }

    updateSimulationName(name) {
        const nameEl = document.getElementById("sim-name");
        if (nameEl) nameEl.textContent = name;
    }

    updateSimulationStatus(status) {
        const statusEl = document.getElementById("sim-status");
        if (statusEl) {
            statusEl.textContent = capitalize(status);
            const statusClass = status === SIMULATION_STATUS.ACTIVE ? "bg-green-600 text-white" :
                               status === SIMULATION_STATUS.PENDING ? "bg-yellow-600 text-white" :
                               "bg-gray-600 text-gray-300";
            statusEl.className = `px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`;
        }
    }
}