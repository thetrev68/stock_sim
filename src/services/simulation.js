// src/services/simulation.js - Enhanced with Auto Status Updates

import { getFirestoreDb } from "./firebase.js";
import { 
    getCurrentUserInfo as coreGetCurrentUserInfo,
    calculateRealTimeStatus as coreCalculateRealTimeStatus,
    generateSimulationInviteCode,
    getSimulation as coreGetSimulation,
    createSimulation as coreCreateSimulation,
    findSimulationByCode as coreFindSimulationByCode
} from "./simulation/simulation-core.js";
import {
    addMemberToSimulation as coreAddMemberToSimulation,
    getSimulationMembers as coreGetSimulationMembers,
    isUserMemberOfSimulation as coreIsUserMemberOfSimulation,
    removeMemberFromSimulation as coreRemoveMemberFromSimulation,
    getMemberStatistics as coreGetMemberStatistics,
    calculateHoldingsValue as coreCalculateHoldingsValue
} from "./simulation/simulation-members.js";
import {
    endSimulationEarly as coreEndSimulationEarly,
    extendSimulation as coreExtendSimulation,
    updateSimulationSettings as coreUpdateSimulationSettings,
    getSimulationManagementStats as coreGetSimulationManagementStats,
    archiveSimulation as coreArchiveSimulation,
    getArchivedSimulation as coreGetArchivedSimulation,
    getUserArchivedSimulations as coreGetUserArchivedSimulations,
    generateSimulationExport as coreGenerateSimulationExport,
    refreshSimulationStatus as coreRefreshSimulationStatus,
    updateSimulationStatus as coreUpdateSimulationStatus
} from "./simulation/simulation-management.js";
import {
    joinSimulationByCode as coreJoinSimulationByCode,
    getUserSimulations as coreGetUserSimulations
} from "./simulation/simulation-user-operations.js";

export class SimulationService {
    constructor() {
        this.db = null;
    }

    // Initialize service
    initialize() {
        this.db = getFirestoreDb();
        console.log("SimulationService initialized");
    }

    /**
     * Get current user info from auth
     */
    async getCurrentUserInfo(userId) {
        return coreGetCurrentUserInfo(userId);
    }

    /**
     * Calculate real-time status based on dates - Enhanced to respect all manual overrides
     */
    calculateRealTimeStatus(simulation) {
        return coreCalculateRealTimeStatus(simulation);
    }

    /**
     * End a simulation early (admin only) - Enhanced with debugging and activity logging
     */
    async endSimulationEarly(simulationId, adminUserId, reason = "") {
        return coreEndSimulationEarly(simulationId, adminUserId, reason, this.db);
    }

    /**
     * Extend simulation duration (admin only)
     */
    async extendSimulation(simulationId, adminUserId, newEndDate, reason = "") {
        return coreExtendSimulation(simulationId, adminUserId, newEndDate, reason, this.db);
    }

    /**
     * Update simulation settings (admin only)
     */
    async updateSimulationSettings(simulationId, adminUserId, settings) {
        return coreUpdateSimulationSettings(simulationId, adminUserId, settings, this.db);
    }

    /**
     * Get simulation management statistics
     */
    async getSimulationManagementStats(simulationId, adminUserId) {
        return coreGetSimulationManagementStats(simulationId, adminUserId, this.db);
    }

    /**
     * Archive a completed simulation with final results
     */
    async archiveSimulation(simulationId, adminUserId, finalLeaderboard = null) {
        return coreArchiveSimulation(simulationId, adminUserId, finalLeaderboard, this.db);
    }

    /**
     * Get archived simulation results
     */
    async getArchivedSimulation(archiveId) {
        return coreGetArchivedSimulation(archiveId, this.db);
    }

    /**
     * Get user's archived simulations
     */
    async getUserArchivedSimulations(userId) {
        return coreGetUserArchivedSimulations(userId, this.db);
    }

    /**
     * Export simulation results to downloadable format
     */
    generateSimulationExport(archivedSimulation) {
        return coreGenerateSimulationExport(archivedSimulation);
    }

    /**
     * Force refresh simulation status from dates (fixes status sync issues) - Enhanced debugging
     */
    async refreshSimulationStatus(simulationId) {
        return coreRefreshSimulationStatus(simulationId, this.db);
    }

    // /**
    //  * Update simulation status if it has changed - Enhanced to respect manual endings
    //  */
    // async updateSimulationStatusIfNeeded(simulationId, currentStoredStatus, calculatedStatus) {
    //     return coreUpdateSimulationStatusIfNeeded(simulationId, currentStoredStatus, calculatedStatus, this.db);
    // }

    /**
     * Generate a unique 6-character invite code
     */
    generateInviteCode() {
        return generateSimulationInviteCode();
    }

    /**
     * Create a new simulation
     */
    async createSimulation(creatorUserId, simulationData) {
        return coreCreateSimulation(creatorUserId, simulationData, this.db);
    }

    /**
     * Add a member to a simulation
     */
    async addMemberToSimulation(simulationId, userId, role = "member", userInfo = null) {
        return coreAddMemberToSimulation(simulationId, userId, role, userInfo, this.db);
    }

    /**
     * Join simulation by invite code
     */
    async joinSimulationByCode(inviteCode, userId, userInfo) {
        return coreJoinSimulationByCode(inviteCode, userId, userInfo, this.db);
    }

    /**
     * Get simulations for a specific user (with auto status updates)
     */
    async getUserSimulations(userId) {
        return coreGetUserSimulations(userId, this.db);
    }

    /**
     * Get simulation details by ID (with auto status update)
     */
    async getSimulation(simulationId) {
        return coreGetSimulation(simulationId, this.db);
    }

    /**
     * Get simulation members
     */
    async getSimulationMembers(simulationId) {
        return coreGetSimulationMembers(simulationId, this.db);
    }

    /**
     * Check if user is member of simulation
     */
    async isUserMemberOfSimulation(simulationId, userId) {
        return coreIsUserMemberOfSimulation(simulationId, userId, this.db);
    }

    /**
     * Remove a member from a simulation (admin only)
     */
    async removeMemberFromSimulation(simulationId, userId, adminUserId) {
        return coreRemoveMemberFromSimulation(simulationId, userId, adminUserId, this.db);
    }

    /**
     * Get detailed member statistics for admin view
     */
    async getMemberStatistics(simulationId, adminUserId) {
        return coreGetMemberStatistics(simulationId, adminUserId, this.db);
    }

    /**
     * Helper method to calculate holdings value
     */
    calculateHoldingsValue(holdings) {
        return coreCalculateHoldingsValue(holdings);
    }

    /**
     * Find simulation by invite code (for preview without joining)
     */
    async findSimulationByCode(inviteCode) {
        return coreFindSimulationByCode(inviteCode, this.db);
    }

    /**
     * Update simulation status (manual override for creators)
     */
    async updateSimulationStatus(simulationId, newStatus) {
        return coreUpdateSimulationStatus(simulationId, newStatus, this.db);
    }
}