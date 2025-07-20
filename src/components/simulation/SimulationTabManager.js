// src/components/simulation/SimulationTabManager.js
// Manages tab navigation and content switching for simulation view

export class SimulationTabManager {
    constructor(simulationView) {
        this.simulationView = simulationView;
        this.currentTab = "tab-portfolio"; // Default active tab
    }

    // Initialize tab event listeners
    attachTabEventListeners() {
        // Tab navigation
        const tabBtns = document.querySelectorAll(".tab-btn");
        tabBtns.forEach(btn => {
            btn.addEventListener("click", (e) => this.switchTab(e.target.id));
        });

        // Navigation buttons
        const membersBtn = document.querySelector("#view-members-btn");
        const leaderboardBtn = document.querySelector("#view-leaderboard-btn");
        
        if (membersBtn) {
            membersBtn.addEventListener("click", () => this.showMembersTab());
        }

        if (leaderboardBtn) {
            leaderboardBtn.addEventListener("click", () => this.showLeaderboardTab());
        }
    }

    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.classList.remove("border-cyan-500", "text-cyan-400", "bg-gray-750");
            btn.classList.add("border-transparent", "text-gray-400");
        });

        // Hide all tab content
        document.querySelectorAll(".tab-content").forEach(content => {
            content.classList.add("hidden");
        });

        // Show selected tab
        const activeBtn = document.getElementById(tabId);
        const contentId = tabId.replace("tab-", "content-");
        const activeContent = document.getElementById(contentId);

        if (activeBtn) {
            activeBtn.classList.add("border-cyan-500", "text-cyan-400", "bg-gray-750");
            activeBtn.classList.remove("border-transparent", "text-gray-400");
        }

        if (activeContent) {
            activeContent.classList.remove("hidden");
        }

        // Store current tab
        this.currentTab = tabId;

        // Render leaderboard components when tab is shown
        if (tabId === "tab-leaderboard") {
            this.simulationView.renderLeaderboardComponents();
        }

        // Update button text based on active tab
        // this.updateNavigationButtonText(tabId);
    }

    // updateNavigationButtonText(activeTabId) {
    //     const membersBtnText = document.getElementById("members-btn-text");
    //     const leaderboardBtnText = document.getElementById("leaderboard-btn-text");
        
    //     if (membersBtnText && leaderboardBtnText) {
    //         // Reset to default text
    //         membersBtnText.textContent = "Members";
    //         leaderboardBtnText.textContent = "Leaderboard";
            
    //         // Update based on current tab
    //         if (activeTabId === "tab-members") {
    //             membersBtnText.textContent = "Portfolio";
    //         } else if (activeTabId === "tab-leaderboard") {
    //             leaderboardBtnText.textContent = "Portfolio";
    //         }
    //     }
    // }

    showLeaderboardTab() {
        this.switchTab("tab-leaderboard");
    }

    showMembersTab() {
        this.switchTab("tab-members");
    }

    // Get current active tab
    getCurrentTab() {
        return this.currentTab;
    }

    // Check if specific tab is active
    isTabActive(tabId) {
        return this.currentTab === tabId;
    }

    // Switch to default tab (portfolio)
    showDefaultTab() {
        this.switchTab("tab-portfolio");
    }
}