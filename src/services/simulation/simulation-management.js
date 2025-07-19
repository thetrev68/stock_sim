// file: src/services/simulation/simulation-management.js
// Admin management and lifecycle operations extracted from services/simulation.js
// Phase 3A Step 3: Status management, archiving, extensions, and admin controls

import { getFirestoreDb, getFirebaseAuth } from "../firebase.js";
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { SIMULATION_STATUS } from "../../constants/simulation-status.js";
import { calculateRealTimeStatus } from "./simulation-core.js";

const SIMULATIONS_COLLECTION = "simulations";
const SIMULATION_MEMBERS_COLLECTION = "simulationMembers";
const SIMULATION_ARCHIVES_COLLECTION = "simulationArchives";

/**
 * Utility to get Firestore DB instance.
 */
const getDb = (db) => db || getFirestoreDb();

/**
 * Standardized error handler.
 */
const handleError = (context, error) => {
    console.error(`Error ${context}:`, error);
    throw error;
};

/**
 * Fetches a simulation document and verifies creator permissions.
 * @param {string} simulationId
 * @param {string} adminUserId
 * @param {*} database
 * @returns {Promise<Object>} The simulation data.
 * @throws {Error} If simulation not found or user lacks permission.
 */
async function getVerifiedSimulation(simulationId, adminUserId, database) {
    const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
    const simSnap = await getDoc(simRef);

    if (!simSnap.exists()) {
        throw new Error("Simulation not found");
    }

    const simulation = simSnap.data();
    if (simulation.createdBy !== adminUserId) {
        throw new Error("User does not have permission for this simulation");
    }
    return { simRef, simulation };
}

/**
 * Safely converts a Firestore Timestamp or date string to a Date object.
 */
const toDate = (timestampOrDate) => {
    if (!timestampOrDate) return null;
    return timestampOrDate.toDate ? timestampOrDate.toDate() : new Date(timestampOrDate);
};

/**
 * End a simulation early (admin only) - Enhanced with debugging and activity logging
 */
export async function endSimulationEarly(simulationId, adminUserId, reason = "", db = null) {
    const database = getDb(db);

    try {
        console.log(`Attempting to end simulation ${simulationId} early by ${adminUserId}`);
        const { simRef, simulation } = await getVerifiedSimulation(simulationId, adminUserId, database);

        console.log("Current simulation status:", simulation.status);
        console.log("Simulation creator:", simulation.createdBy);
        console.log("Admin user:", adminUserId);

        if (simulation.status === SIMULATION_STATUS.ENDED) {
            throw new Error("Simulation is already ended");
        }

        console.log("Updating simulation status to ended...");
        const updateData = {
            status: SIMULATION_STATUS.ENDED,
            endedEarly: true,
            endedAt: serverTimestamp(),
            endedBy: adminUserId,
            endReason: reason,
            statusUpdatedAt: serverTimestamp(),
            manualStatusOverride: true
        };

        await updateDoc(simRef, updateData);
        console.log("Simulation status updated successfully");

        // Log admin activity
        try {
            const { ActivityService } = await import("../activity.js");
            const activityService = new ActivityService();
            activityService.initialize();

            const auth = getFirebaseAuth();
            const adminDisplayName = auth.currentUser?.displayName || auth.currentUser?.email || "Admin";

            console.log("Logging admin activity...");
            await activityService.logAchievementActivity(simulationId, adminUserId, adminDisplayName, {
                milestone: "simulation_ended_early",
                value: 0,
                rank: null,
                reason: reason
            });
            console.log("Admin activity logged successfully");
        } catch (activityError) {
            console.error("Error logging admin activity (non-fatal):", activityError);
        }

        console.log(`Simulation ${simulationId} ended early by ${adminUserId} successfully`);
        return { success: true };
    } catch (error) {
        return handleError("ending simulation early", error);
    }
}

/**
 * Extend simulation duration (admin only)
 */
export async function extendSimulation(simulationId, adminUserId, newEndDate, reason = "", db = null) {
    const database = getDb(db);

    try {
        const { simRef, simulation } = await getVerifiedSimulation(simulationId, adminUserId, database);

        if (simulation.status === SIMULATION_STATUS.ENDED) {
            throw new Error("Cannot extend an ended simulation");
        }

        const currentEndDate = toDate(simulation.endDate);
        const extensionDate = new Date(newEndDate);

        if (extensionDate <= currentEndDate) {
            throw new Error("New end date must be after current end date");
        }
        if (extensionDate <= new Date()) {
            throw new Error("New end date must be in the future");
        }

        await updateDoc(simRef, {
            endDate: extensionDate,
            extendedAt: serverTimestamp(),
            extendedBy: adminUserId,
            extensionReason: reason,
            statusUpdatedAt: serverTimestamp(),
            originalEndDate: simulation.originalEndDate || simulation.endDate
        });

        console.log(`Simulation ${simulationId} extended to ${extensionDate.toISOString()} by ${adminUserId}`);
        return { success: true };
    } catch (error) {
        return handleError("extending simulation", error);
    }
}

/**
 * Update simulation settings (admin only)
 */
export async function updateSimulationSettings(simulationId, adminUserId, settings, db = null) {
    const database = getDb(db);

    try {
        const { simRef, simulation } = await getVerifiedSimulation(simulationId, adminUserId, database);

        const updateData = {
            updatedAt: serverTimestamp(),
            updatedBy: adminUserId
        };

        if (settings.name && settings.name.trim() !== simulation.name) {
            updateData.name = settings.name.trim();
        }

        if (settings.description !== undefined) {
            updateData.description = settings.description.trim();
        }

        if (settings.maxMembers && settings.maxMembers >= simulation.memberCount) {
            updateData.maxMembers = settings.maxMembers;
        } else if (settings.maxMembers && settings.maxMembers < simulation.memberCount) {
            throw new Error(`Cannot reduce max members below current member count (${simulation.memberCount})`);
        }

        if (simulation.status === SIMULATION_STATUS.PENDING && settings.rules) {
            updateData.rules = {
                ...simulation.rules,
                ...settings.rules
            };
        }

        const changes = Object.keys(updateData).filter(k => !k.includes("At") && k !== "updatedBy");
        if (changes.length > 0) {
            await updateDoc(simRef, updateData);
            console.log(`Simulation ${simulationId} settings updated by ${adminUserId}`);
            return { success: true, changes };
        } else {
            return { success: true, changes: [] };
        }
    } catch (error) {
        return handleError("updating simulation settings", error);
    }
}

/**
 * Get simulation management statistics
 */
export async function getSimulationManagementStats(simulationId, adminUserId, db = null) {
    const database = getDb(db);

    try {
        const { simulation } = await getVerifiedSimulation(simulationId, adminUserId, database);

        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId)
        );
        const memberDocs = await getDocs(memberQuery);

        const activeMembers = memberDocs.docs.filter(doc => doc.data().status === SIMULATION_STATUS.ACTIVE).length;
        const removedMembers = memberDocs.docs.filter(doc => doc.data().status === "removed").length;
        const totalJoined = memberDocs.docs.length;

        let totalTrades = 0;
        let totalVolume = 0;
        try {
            const { ActivityService } = await import("../activity.js");
            const activityService = new ActivityService();
            activityService.initialize();
            const activities = await activityService.getSimulationActivities(simulationId, 1000);

            const tradeActivities = activities.filter(a => a.action === "executed_trade");
            totalTrades = tradeActivities.length;
            totalVolume = tradeActivities.reduce((sum, activity) => sum + (activity.data.amount || 0), 0);
        } catch (error) {
            console.warn("Could not load activity stats:", error);
        }

        const _now = new Date();
        const startDate = toDate(simulation.startDate);
        const _endDate = toDate(simulation.endDate);
        const originalEndDate = toDate(simulation.originalEndDate);

        const msInDay = 1000 * 60 * 60 * 24;
        const calculateDays = (start, end) => Math.ceil((end - start) / msInDay);

        const totalDuration = calculateDays(startDate, _endDate);
        const daysElapsed = Math.max(0, calculateDays(startDate, _now));
        const daysRemaining = Math.max(0, calculateDays(_now, _endDate));

        return {
            simulation: {
                ...simulation,
                id: simulationId
            },
            members: {
                active: activeMembers,
                removed: removedMembers,
                totalJoined: totalJoined,
                utilizationPercent: simulation.maxMembers > 0 ? Math.round((activeMembers / simulation.maxMembers) * 100) : 0
            },
            activity: {
                totalTrades,
                totalVolume,
                avgTradesPerMember: activeMembers > 0 ? Math.round(totalTrades / activeMembers) : 0
            },
            timeline: {
                totalDuration,
                daysElapsed,
                daysRemaining,
                progressPercent: totalDuration > 0 ? Math.round((daysElapsed / totalDuration) * 100) : 0,
                wasExtended: !!originalEndDate,
                originalDuration: originalEndDate ? calculateDays(startDate, originalEndDate) : null
            }
        };
    } catch (error) {
        return handleError("getting simulation management stats", error);
    }
}

/**
 * Archive a completed simulation with final results
 */
export async function archiveSimulation(simulationId, adminUserId, finalLeaderboard = null, db = null) {
    const database = getDb(db);

    try {
        const { simRef, simulation } = await getVerifiedSimulation(simulationId, adminUserId, database);

        if (simulation.status !== SIMULATION_STATUS.ENDED) {
            throw new Error("Only ended simulations can be archived");
        }

        if (!finalLeaderboard) {
            try {
                const { LeaderboardService } = await import("../leaderboard.js");
                const leaderboardService = new LeaderboardService();
                leaderboardService.initialize();
                finalLeaderboard = await leaderboardService.getLeaderboard(simulationId, true, simulation);
            } catch (error) {
                console.warn("Could not generate final leaderboard for archive:", error);
            }
        }

        const startDate = toDate(simulation.startDate);
        const endDate = toDate(simulation.endDate);

        const archiveData = {
            simulationId: simulationId,
            originalSimulation: simulation,
            finalResults: finalLeaderboard,
            archivedAt: serverTimestamp(),
            archivedBy: adminUserId,
            memberCount: simulation.memberCount,
            totalTrades: finalLeaderboard?.rankings?.reduce((sum, r) => sum + (r.totalTrades || 0), 0) || 0,
            totalVolume: finalLeaderboard?.rankings?.reduce((sum, r) => sum + (r.totalVolume || 0), 0) || 0,
            winner: finalLeaderboard?.rankings?.[0] || null,
            duration: (startDate && endDate) ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) : 0,
            endedEarly: simulation.endedEarly || false,
            endReason: simulation.endReason || null
        };

        const archiveRef = await addDoc(collection(database, SIMULATION_ARCHIVES_COLLECTION), archiveData);

        await updateDoc(simRef, {
            archived: true,
            archiveId: archiveRef.id,
            archivedAt: serverTimestamp()
        });

        console.log(`Simulation ${simulationId} archived successfully with ID: ${archiveRef.id}`);
        return { success: true, archiveId: archiveRef.id };
    } catch (error) {
        return handleError("archiving simulation", error);
    }
}

/**
 * Get archived simulation results
 */
export async function getArchivedSimulation(archiveId, db = null) {
    const database = getDb(db);

    try {
        const archiveRef = doc(database, SIMULATION_ARCHIVES_COLLECTION, archiveId);
        const archiveSnap = await getDoc(archiveRef);

        if (!archiveSnap.exists()) {
            return null;
        }

        return {
            id: archiveId,
            ...archiveSnap.data()
        };
    } catch (error) {
        return handleError("getting archived simulation", error);
    }
}

/**
 * Get user's archived simulations
 */
export async function getUserArchivedSimulations(userId, db = null) {
    const database = getDb(db);

    try {
        const creatorArchivesQuery = query(
            collection(database, SIMULATION_ARCHIVES_COLLECTION),
            where("archivedBy", "==", userId),
            orderBy("archivedAt", "desc")
        );
        const creatorArchives = await getDocs(creatorArchivesQuery);

        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("userId", "==", userId)
        );
        const memberDocs = await getDocs(memberQuery);
        const memberSimulationIds = memberDocs.docs.map(doc => doc.data().simulationId);

        const participantArchives = [];
        if (memberSimulationIds.length > 0) {
            // Firestore 'in' query limit is 10
            const batchSize = 10;
            for (let i = 0; i < memberSimulationIds.length; i += batchSize) {
                const batch = memberSimulationIds.slice(i, i + batchSize);
                const batchQuery = query(
                    collection(database, SIMULATION_ARCHIVES_COLLECTION),
                    where("simulationId", "in", batch)
                );
                const batchResults = await getDocs(batchQuery);
                participantArchives.push(...batchResults.docs);
            }
        }

        const allArchives = new Map();
        creatorArchives.docs.forEach(doc => {
            allArchives.set(doc.id, {
                id: doc.id,
                ...doc.data(),
                userRole: "creator"
            });
        });

        participantArchives.forEach(doc => {
            if (!allArchives.has(doc.id)) { // Only add if not already added as creator
                allArchives.set(doc.id, {
                    id: doc.id,
                    ...doc.data(),
                    userRole: "participant"
                });
            }
        });

        const results = Array.from(allArchives.values()).sort((a, b) => {
            const aTime = toDate(a.archivedAt);
            const bTime = toDate(b.archivedAt);
            return (bTime?.getTime() || 0) - (aTime?.getTime() || 0); // Handle potential null dates
        });

        return results;
    } catch (error) {
        return handleError("getting user archived simulations", error);
    }
}

/**
 * Export simulation results to downloadable format
 */
export function generateSimulationExport(archivedSimulation) {
    try {
        const sim = archivedSimulation.originalSimulation;
        const results = archivedSimulation.finalResults;

        const exportData = {
            simulationInfo: {
                name: sim.name,
                description: sim.description || "",
                startDate: toDate(sim.startDate)?.toISOString() || sim.startDate,
                endDate: toDate(sim.endDate)?.toISOString() || sim.endDate,
                duration: archivedSimulation.duration,
                startingBalance: sim.startingBalance,
                memberCount: archivedSimulation.memberCount,
                totalTrades: archivedSimulation.totalTrades,
                totalVolume: archivedSimulation.totalVolume,
                endedEarly: archivedSimulation.endedEarly,
                endReason: archivedSimulation.endReason,
                rules: sim.rules || {}
            },
            finalRankings: results?.rankings || [],
            winner: archivedSimulation.winner,
            exportedAt: new Date().toISOString(),
            exportVersion: "1.0"
        };
        return exportData;
    } catch (error) {
        return handleError("generating simulation export", error);
    }
}

/**
 * Force refresh simulation status from dates (fixes status sync issues) - Enhanced debugging
 */
export async function refreshSimulationStatus(simulationId, db = null) {
    const database = getDb(db);

    try {
        console.log(`Refreshing status for simulation ${simulationId}...`);
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);

        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulation = simSnap.data();
        console.log("Current stored status:", simulation.status);
        console.log("Manual status override:", simulation.manualStatusOverride);

        if (simulation.manualStatusOverride && simulation.status === SIMULATION_STATUS.ENDED) {
            console.log("Manual override detected, keeping ended status");
            return { updated: false, status: simulation.status, reason: "manual_override" };
        }

        const realTimeStatus = calculateRealTimeStatus(simulation);
        console.log("Calculated real-time status:", realTimeStatus);

        if (simulation.status !== realTimeStatus) {
            console.log(`Updating status from ${simulation.status} to ${realTimeStatus}`);
            await updateDoc(simRef, {
                status: realTimeStatus,
                statusUpdatedAt: serverTimestamp(),
                statusRefreshedAt: serverTimestamp()
            });
            console.log(`Simulation ${simulationId} status updated: ${simulation.status} → ${realTimeStatus}`);
            return { updated: true, oldStatus: simulation.status, newStatus: realTimeStatus };
        }

        console.log("No status update needed");
        return { updated: false, status: realTimeStatus };
    } catch (error) {
        return handleError("refreshing simulation status", error);
    }
}

/**
 * Update simulation status if it has changed - Enhanced to respect manual endings
 */
export async function updateSimulationStatusIfNeeded(simulationId, currentStoredStatus, calculatedStatus, db = null) {
    const database = getDb(db);

    try {
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);

        if (simSnap.exists()) {
            const simData = simSnap.data();
            if (simData.endedEarly || simData.adminEndedEarly) {
                console.log(`Simulation ${simulationId} was manually ended - skipping auto status update`);
                return false;
            }
        }

        if (currentStoredStatus !== calculatedStatus) {
            await updateDoc(simRef, {
                status: calculatedStatus,
                statusUpdatedAt: serverTimestamp()
            });
            console.log(`Auto-updated simulation ${simulationId} status: ${currentStoredStatus} → ${calculatedStatus}`);
            return true;
        }
        return false;
    } catch (error) {
        return handleError("auto-updating simulation status", error);
    }
}

/**
 * Update simulation status (manual override for creators)
 */
export async function updateSimulationStatus(simulationId, newStatus, db = null) {
    const database = getDb(db);

    try {
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        await updateDoc(simRef, {
            status: newStatus,
            statusUpdatedAt: serverTimestamp(),
            manualStatusOverride: true
        });

        console.log(`Simulation ${simulationId} status manually updated to: ${newStatus}`);
        return { success: true };
    } catch (error) {
        return handleError("updating simulation status", error);
    }
}