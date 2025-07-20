// src/components/simulation/SimulationActivityManager.js
// Manages activity feed loading, display, and formatting for simulation view

import { 
    getActivityElementTemplate, 
    getEmptyActivityFeedTemplate 
} from "../../templates/simulation/activity-components.js";
import { getActivitiesErrorTemplate } from "../../templates/simulation/error-states.js";

export class SimulationActivityManager {
    constructor(simulationView) {
        this.simulationView = simulationView;
        this.activityService = simulationView.activityService;
        this.simulationId = null;
        this.simulationActivities = [];
    }

    // Initialize with simulation ID
    initialize(simulationId) {
        this.simulationId = simulationId;
        this.simulationActivities = [];
    }

    async loadSimulationActivities() {
        try {
            this.simulationActivities = await this.activityService.getSimulationActivities(this.simulationId, 15);
            console.log("Loaded simulation activities:", this.simulationActivities);
            this.displayActivities();
        } catch (error) {
            console.error("Error loading simulation activities:", error);
            this.showActivitiesError();
        }
    }

    displayActivities() {
        const activityFeed = document.getElementById("activity-feed");
        const activityLoading = document.getElementById("activity-loading");
        
        // Hide loading state and show activity feed
        if (activityLoading) {
            activityLoading.classList.add("hidden");
        }
        if (activityFeed) {
            activityFeed.classList.remove("hidden");
        }
        
        if (!activityFeed) return;

        if (this.simulationActivities.length === 0) {
            activityFeed.innerHTML = getEmptyActivityFeedTemplate();
        } else {
            activityFeed.innerHTML = "";
            this.simulationActivities.forEach(activity => {
                const activityElement = this.createActivityElement(activity);
                activityFeed.appendChild(activityElement);
            });
        }
    }

    createActivityElement(activity) {
        const formattedActivity = this.activityService.formatActivity(activity);
        const element = document.createElement("div");
        element.className = "bg-gray-700 p-4 rounded-lg flex items-start gap-3";
        
        element.innerHTML = getActivityElementTemplate(formattedActivity);
        
        return element;
    }

    showActivitiesError() {
        const activityFeed = document.getElementById("activity-feed");
        if (activityFeed) {
            activityFeed.innerHTML = getActivitiesErrorTemplate();
        }
    }

    // Getter for external access to activities data
    getActivities() {
        return this.simulationActivities;
    }

    // Method to refresh activities (for auto-refresh functionality)
    async refreshActivities() {
        await this.loadSimulationActivities();
    }
}