// src/views/simulation-archive.js - View archived simulation results

// Core services and constants
import { SimulationService } from "../services/simulation.js";
import { AuthService } from "../services/auth.js";
import { TIMEOUTS } from "../constants/app-config.js";

// Utility functions
import { 
    formatCurrencyWithCommas,
    formatGainLoss
} from "../utils/currency-utils.js";

// Template components
import { 
    getArchivePageLayoutTemplate, 
    getArchiveErrorTemplate 
} from "../templates/archive/archive-layout.js";

import { 
    getRankingRowTemplate, 
    getRankDisplayTemplate 
} from "../templates/archive/archive-leaderboard.js";

import { 
    getTemporaryMessageTemplate,
    getExportButtonLoadingTemplate, 
    getExportButtonDefaultTemplate
} from "../templates/archive/archive-export.js";

export default class SimulationArchiveView {
    constructor() {
        this.name = "simulation-archive";
        this.simulationService = new SimulationService();
        this.authService = new AuthService();
        this.currentUser = null;
        this.archiveId = null;
        this.archiveData = null;
    }

    async render(container) {
        // Extract archive ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.archiveId = urlParams.get("id");

        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
        
        setTimeout(async () => {
            await this.loadArchiveData();
        }, 0);
    }

    getTemplate() {
        return getArchivePageLayoutTemplate();
    }

    attachEventListeners(container) {
        const exportBtn = container.querySelector("#export-archive-btn");
        if (exportBtn) {
            exportBtn.addEventListener("click", this.handleExportArchive.bind(this));
        }
    }

    async loadArchiveData() {
        this.currentUser = this.authService.getCurrentUser();
        
        if (!this.currentUser) {
            console.log("No user signed in for archive view.");
            this.showNotFound();
            return;
        }

        if (!this.archiveId) {
            this.showNotFound();
            return;
        }

        try {
            this.simulationService.initialize();
            
            // Load archive data
            this.archiveData = await this.simulationService.getArchivedSimulation(this.archiveId);
            
            if (!this.archiveData) {
                this.showNotFound();
                return;
            }

            // Display the archive
            this.displayArchive();
            
        } catch (error) {
            console.error("Error loading archive:", error);
            this.showError();
        }
    }

    displayArchive() {
        const loadingEl = document.getElementById("archive-loading");
        const contentEl = document.getElementById("archive-content");
        
        if (loadingEl) loadingEl.classList.add("hidden");
        if (contentEl) contentEl.classList.remove("hidden");

        const sim = this.archiveData.originalSimulation;
        const results = this.archiveData.finalResults;

        // Update header
        this.updateElement("archive-title", sim.name);
        this.updateElement("archive-description", sim.description || "No description provided");

        // Update stats
        this.updateElement("archive-duration", `${this.archiveData.duration || 0} days`);
        this.updateElement("archive-participants", this.archiveData.memberCount);
        this.updateElement("archive-trades", this.archiveData.totalTrades || 0);
        this.updateElement("archive-volume", `$${(this.archiveData.totalVolume || 0).toLocaleString()}`);

        // Show end info if ended early
        if (this.archiveData.endedEarly) {
            const endInfo = document.getElementById("end-info");
            const endReason = document.getElementById("end-reason");
            if (endInfo && endReason) {
                endInfo.classList.remove("hidden");
                endReason.textContent = this.archiveData.endReason || "No reason provided";
            }
        }

        // Display winner
        if (this.archiveData.winner) {
            this.displayWinner(this.archiveData.winner);
        }

        // Display rankings
        if (results && results.rankings) {
            this.displayRankings(results.rankings);
        }

        // Display simulation details
        this.displaySimulationDetails(sim);

        console.log("Archive displayed:", this.archiveData);
    }

    displayWinner(winner) {
        this.updateElement("winner-name", winner.displayName);
        this.updateElement("winner-value", formatCurrencyWithCommas(winner.portfolioValue));
        
        if (winner.totalReturn !== undefined) {
            const returnFormatted = formatGainLoss(winner.totalReturn, winner.totalReturnPercent);
            this.updateElement("winner-return", returnFormatted.amount);
            this.updateElement("winner-percent", returnFormatted.percentage);
        }
    }

    displayRankings(rankings) {
        const tbody = document.getElementById("rankings-tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        rankings.forEach((ranking, index) => {
            const isWinner = index === 0;
            const _rankDisplay = this.getRankDisplay(ranking.rank || (index + 1), isWinner);
            
            const totalReturn = ranking.totalReturn || 0;
            const _totalReturnPercent = ranking.totalReturnPercent || 0;
            const _returnClass = totalReturn >= 0 ? "text-green-400" : "text-red-400";
            const _returnIcon = totalReturn >= 0 ? "↗" : "↘";

            const row = getRankingRowTemplate(ranking, index, isWinner);
            tbody.innerHTML += row;
        });
    }

    getRankDisplay(rank, isWinner) {
        return getRankDisplayTemplate(rank, isWinner);
    }

    displaySimulationDetails(sim) {
        // Timeline
        const startDate = sim.startDate.toDate ? sim.startDate.toDate() : new Date(sim.startDate);
        const endDate = sim.endDate.toDate ? sim.endDate.toDate() : new Date(sim.endDate);
        const archivedDate = this.archiveData.archivedAt.toDate ? this.archiveData.archivedAt.toDate() : new Date(this.archiveData.archivedAt);

        this.updateElement("sim-start-date", startDate.toLocaleDateString());
        this.updateElement("sim-end-date", endDate.toLocaleDateString());
        this.updateElement("archived-date", archivedDate.toLocaleDateString());

        // Settings
        this.updateElement("starting-balance", formatCurrencyWithCommas(sim.startingBalance));
        this.updateElement("short-selling", sim.rules?.allowShortSelling ? "Allowed" : "Not Allowed");
        this.updateElement("trading-hours", sim.rules?.tradingHours === "24/7" ? "24/7" : "Market Hours");

        // Statistics
        if (this.archiveData.finalResults) {
            this.updateElement("avg-return", `${(this.archiveData.finalResults.averageReturn || 0).toFixed(2)}%`);
            
            const bestPerformer = this.archiveData.finalResults.rankings?.[0];
            if (bestPerformer) {
                this.updateElement("best-return", `${(bestPerformer.totalReturnPercent || 0).toFixed(2)}%`);
            }
            
            const avgTrades = this.archiveData.memberCount > 0 ? 
                Math.round((this.archiveData.totalTrades || 0) / this.archiveData.memberCount) : 0;
            this.updateElement("avg-trades", avgTrades);
        }
    }

    async handleExportArchive() {
        try {
            const exportBtn = document.getElementById("export-archive-btn");
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = getExportButtonLoadingTemplate();
            }

            // Generate export data
            const exportData = this.simulationService.generateSimulationExport(this.archiveData);

            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${this.archiveData.originalSimulation.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_archive_${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showTemporaryMessage("Archive exported successfully!", "success");

        } catch (error) {
            console.error("Error exporting archive:", error);
            this.showTemporaryMessage(`Failed to export archive: ${error.message}`, "error");
        } finally {
            const exportBtn = document.getElementById("export-archive-btn");
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = getExportButtonDefaultTemplate();
            }
        }
    }

    showNotFound() {
        const loadingEl = document.getElementById("archive-loading");
        const notFoundEl = document.getElementById("archive-not-found");
        
        if (loadingEl) loadingEl.classList.add("hidden");
        if (notFoundEl) notFoundEl.classList.remove("hidden");
    }

    showError() {
        const loadingEl = document.getElementById("archive-loading");
        
        if (loadingEl) {
            loadingEl.innerHTML = getArchiveErrorTemplate();
        }
    }

    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    showTemporaryMessage(message, type = "info") {
        const _colorClasses = {
            success: "bg-green-900/20 border-green-500 text-green-400",
            error: "bg-red-900/20 border-red-500 text-red-400",
            info: "bg-blue-900/20 border-blue-500 text-blue-400"
        };

        const messageHTML = getTemporaryMessageTemplate(message, type);

        const existingMessage = document.getElementById("temp-message");
        if (existingMessage) {
            existingMessage.remove();
        }

        document.body.insertAdjacentHTML("beforeend", messageHTML);

        setTimeout(() => {
            document.getElementById("temp-message")?.remove();
        }, TIMEOUTS.TEMP_MESSAGE_AUTO_HIDE);
    }
}