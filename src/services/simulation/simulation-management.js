// file: src/services/simulation/simulation-management.js
// Admin management and lifecycle operations extracted from services/simulation.js
// Phase 3A Step 3: Status management, archiving, extensions, and admin controls

import { getFirestoreDb } from "../firebase.js";
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

/**
 * End a simulation early (admin only) - Enhanced with debugging and activity logging
 * EXACT COPY from services/simulation.js
 */
export async function endSimulationEarly(simulationId, adminUserId, reason = "", db = null) {
    const database = db || getFirestoreDb();

    try {
        console.log(`Attempting to end simulation ${simulationId} early by ${adminUserId}`);
        
        // Verify admin permissions
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulation = simSnap.data();
        console.log("Current simulation status:", simulation.status);
        console.log("Simulation creator:", simulation.createdBy);
        console.log("Admin user:", adminUserId);
        
        if (simulation.createdBy !== adminUserId) {
            throw new Error("Only simulation creator can end simulation");
        }

        if (simulation.status === SIMULATION_STATUS.ENDED) {
            throw new Error("Simulation is already ended");
        }

        console.log("Updating simulation status to ended...");
        
        // Update simulation status
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
            
            // Get admin display name
            const { getFirebaseAuth } = await import("../firebase.js");
            const auth = getFirebaseAuth();
            const adminDisplayName = auth.currentUser?.displayName || auth.currentUser?.email || "Admin";
            
            console.log("Logging admin activity...");
            
            // Log custom admin activity
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
        console.error("Error ending simulation early:", error);
        throw error;
    }
}

/**
 * Extend simulation duration (admin only)
 * EXACT COPY from services/simulation.js
 */
export async function extendSimulation(simulationId, adminUserId, newEndDate, reason = "", db = null) {
    const database = db || getFirestoreDb();

    try {
        // Verify admin permissions
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulation = simSnap.data();
        if (simulation.createdBy !== adminUserId) {
            throw new Error("Only simulation creator can extend simulation");
        }

        if (simulation.status === SIMULATION_STATUS.ENDED) {
            throw new Error("Cannot extend an ended simulation");
        }

        // Validate new end date
        const currentEndDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
        const extensionDate = new Date(newEndDate);
        
        if (extensionDate <= currentEndDate) {
            throw new Error("New end date must be after current end date");
        }

        if (extensionDate <= new Date()) {
            throw new Error("New end date must be in the future");
        }

        // Update simulation
        await updateDoc(simRef, {
            endDate: extensionDate,
            extendedAt: serverTimestamp(),
            extendedBy: adminUserId,
            extensionReason: reason,
            statusUpdatedAt: serverTimestamp(),
            originalEndDate: simulation.originalEndDate || simulation.endDate // Preserve original if first extension
        });

        console.log(`Simulation ${simulationId} extended to ${extensionDate.toISOString()} by ${adminUserId}`);
        return { success: true };

    } catch (error) {
        console.error("Error extending simulation:", error);
        throw error;
    }
}

/**
 * Update simulation settings (admin only)
 * EXACT COPY from services/simulation.js
 */
export async function updateSimulationSettings(simulationId, adminUserId, settings, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Verify admin permissions
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulation = simSnap.data();
        if (simulation.createdBy !== adminUserId) {
            throw new Error("Only simulation creator can update settings");
        }

        // Prepare update object with safe changes only
        const updateData = {
            updatedAt: serverTimestamp(),
            updatedBy: adminUserId
        };

        // Safe to change: name, description, max members (if increasing)
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

        // Only allow rule changes if simulation hasn't started yet
        if (simulation.status === SIMULATION_STATUS.PENDING && settings.rules) {
            updateData.rules = {
                ...simulation.rules,
                ...settings.rules
            };
        }

        // Apply updates
        if (Object.keys(updateData).length > 2) { // More than just timestamps
            await updateDoc(simRef, updateData);
            console.log(`Simulation ${simulationId} settings updated by ${adminUserId}`);
            return { success: true, changes: Object.keys(updateData).filter(k => !k.includes("At") && k !== "updatedBy") };
        } else {
            return { success: true, changes: [] };
        }

    } catch (error) {
        console.error("Error updating simulation settings:", error);
        throw error;
    }
}

/**
 * Get simulation management statistics
 * EXACT COPY from services/simulation.js
 */
export async function getSimulationManagementStats(simulationId, adminUserId, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Verify admin permissions
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulation = simSnap.data();
        if (simulation.createdBy !== adminUserId) {
            throw new Error("Only simulation creator can view management stats");
        }

        // Get member statistics
        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId)
        );
        const memberDocs = await getDocs(memberQuery);

        const activeMembers = memberDocs.docs.filter(doc => doc.data().status === SIMULATION_STATUS.ACTIVE).length;
        const removedMembers = memberDocs.docs.filter(doc => doc.data().status === "removed").length;
        const totalJoined = memberDocs.docs.length;

        // Get activity statistics
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

        // Calculate time statistics
        const _now = new Date();
        const startDate = simulation.startDate.toDate ? simulation.startDate.toDate() : new Date(simulation.startDate);
        const _endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
        const originalEndDate = simulation.originalEndDate ? (simulation.originalEndDate.toDate ? simulation.originalEndDate.toDate() : new Date(simulation.originalEndDate)) : null;

        const totalDuration = Math.ceil((_endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysElapsed = Math.max(0, Math.ceil((_now - startDate) / (1000 * 60 * 60 * 24)));
        const daysRemaining = Math.max(0, Math.ceil((_endDate - _now) / (1000 * 60 * 60 * 24)));

        return {
            simulation: {
                ...simulation,
                id: simulationId
            },
            members: {
                active: activeMembers,
                removed: removedMembers,
                totalJoined: totalJoined,
                utilizationPercent: Math.round((activeMembers / simulation.maxMembers) * 100)
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
                progressPercent: Math.round((daysElapsed / totalDuration) * 100),
                wasExtended: !!originalEndDate,
                originalDuration: originalEndDate ? Math.ceil((originalEndDate - startDate) / (1000 * 60 * 60 * 24)) : null
            }
        };

    } catch (error) {
        console.error("Error getting simulation management stats:", error);
        throw error;
    }
}

/**
 * Archive a completed simulation with final results
 * EXACT COPY from services/simulation.js
 */
export async function archiveSimulation(simulationId, adminUserId, finalLeaderboard = null, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Verify admin permissions and get simulation
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulation = simSnap.data();
        if (simulation.createdBy !== adminUserId) {
            throw new Error("Only simulation creator can archive simulation");
        }

        if (simulation.status !== SIMULATION_STATUS.ENDED) {
            throw new Error("Only ended simulations can be archived");
        }

        // Get final leaderboard if not provided
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

        // Create archive document
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
            duration: simulation.endDate && simulation.startDate ? 
                Math.ceil((simulation.endDate.toDate() - simulation.startDate.toDate()) / (1000 * 60 * 60 * 24)) : 0,
            endedEarly: simulation.endedEarly || false,
            endReason: simulation.endReason || null
        };

        // Save to archives collection
        const archiveRef = await addDoc(collection(database, "simulationArchives"), archiveData);

        // Update original simulation with archive reference
        await updateDoc(simRef, {
            archived: true,
            archiveId: archiveRef.id,
            archivedAt: serverTimestamp()
        });

        console.log(`Simulation ${simulationId} archived successfully with ID: ${archiveRef.id}`);
        return { success: true, archiveId: archiveRef.id };

    } catch (error) {
        console.error("Error archiving simulation:", error);
        throw error;
    }
}

/**
 * Get archived simulation results
 * EXACT COPY from services/simulation.js
 */
export async function getArchivedSimulation(archiveId, db = null) {
    const database = db || getFirestoreDb();

    try {
        const archiveRef = doc(database, "simulationArchives", archiveId);
        const archiveSnap = await getDoc(archiveRef);

        if (!archiveSnap.exists()) {
            return null;
        }

        return {
            id: archiveId,
            ...archiveSnap.data()
        };

    } catch (error) {
        console.error("Error getting archived simulation:", error);
        throw error;
    }
}

/**
 * Get user's archived simulations
 * EXACT COPY from services/simulation.js
 */
export async function getUserArchivedSimulations(userId, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Get archives where user was the creator
        const creatorArchivesQuery = query(
            collection(database, "simulationArchives"),
            where("archivedBy", "==", userId),
            orderBy("archivedAt", "desc")
        );
        const creatorArchives = await getDocs(creatorArchivesQuery);

        // Get simulations where user was a member (check original member records)
        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("userId", "==", userId)
        );
        const memberDocs = await getDocs(memberQuery);
        
        const memberSimulationIds = memberDocs.docs.map(doc => doc.data().simulationId);
        
        // Get archived simulations for member participation
        const participantArchives = [];
        if (memberSimulationIds.length > 0) {
            // Note: Firestore doesn't support 'in' with more than 10 items
            // For simplicity, we'll check each simulation individually if needed
            const batchSize = 10;
            for (let i = 0; i < memberSimulationIds.length; i += batchSize) {
                const batch = memberSimulationIds.slice(i, i + batchSize);
                const batchQuery = query(
                    collection(database, "simulationArchives"),
                    where("simulationId", "in", batch)
                );
                const batchResults = await getDocs(batchQuery);
                participantArchives.push(...batchResults.docs);
            }
        }

        // Combine and deduplicate results
        const allArchives = new Map();
        
        // Add creator archives
        creatorArchives.docs.forEach(doc => {
            allArchives.set(doc.id, {
                id: doc.id,
                ...doc.data(),
                userRole: "creator"
            });
        });

        // Add participant archives (mark role appropriately)
        participantArchives.forEach(doc => {
            const existing = allArchives.get(doc.id);
            if (!existing) {
                allArchives.set(doc.id, {
                    id: doc.id,
                    ...doc.data(),
                    userRole: "participant"
                });
            }
        });

        // Convert to array and sort by archive date (newest first)
        const results = Array.from(allArchives.values()).sort((a, b) => {
            const aTime = a.archivedAt?.toDate?.() || new Date(a.archivedAt);
            const bTime = b.archivedAt?.toDate?.() || new Date(b.archivedAt);
            return bTime.getTime() - aTime.getTime();
        });

        return results;

    } catch (error) {
        console.error("Error getting user archived simulations:", error);
        throw error;
    }
}

/**
 * Export simulation results to downloadable format
 * EXACT COPY from services/simulation.js
 */
export function generateSimulationExport(archivedSimulation) {
    try {
        const sim = archivedSimulation.originalSimulation;
        const results = archivedSimulation.finalResults;
        
        const exportData = {
            simulationInfo: {
                name: sim.name,
                description: sim.description || "",
                startDate: sim.startDate.toDate ? sim.startDate.toDate().toISOString() : sim.startDate,
                endDate: sim.endDate.toDate ? sim.endDate.toDate().toISOString() : sim.endDate,
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
        console.error("Error generating simulation export:", error);
        throw error;
    }
}

/**
 * Force refresh simulation status from dates (fixes status sync issues) - Enhanced debugging
 * EXACT COPY from services/simulation.js
 */
export async function refreshSimulationStatus(simulationId, db = null) {
    const database = db || getFirestoreDb();

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
        
        // If there's a manual override (like admin ending early), respect it
        if (simulation.manualStatusOverride && simulation.status === SIMULATION_STATUS.ENDED) {
            console.log("Manual override detected, keeping ended status");
            return { updated: false, status: simulation.status, reason: "manual_override" };
        }
        
        // Calculate what the status should be based on current time
        const realTimeStatus = calculateRealTimeStatus(simulation);
        console.log("Calculated real-time status:", realTimeStatus);
        
        // Update if status is different
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
        console.error("Error refreshing simulation status:", error);
        throw error;
    }
}

/**
 * Update simulation status if it has changed - Enhanced to respect manual endings
 * EXACT COPY from services/simulation.js
 */
export async function updateSimulationStatusIfNeeded(simulationId, currentStoredStatus, calculatedStatus, db = null) {
    const database = db || getFirestoreDb();
    
    // CRITICAL FIX: Don't auto-update if simulation was manually ended
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
        try {
            await updateDoc(simRef, {
                status: calculatedStatus,
                statusUpdatedAt: serverTimestamp()
            });
            
            console.log(`Auto-updated simulation ${simulationId} status: ${currentStoredStatus} → ${calculatedStatus}`);
            return true;
        } catch (error) {
            console.error("Error auto-updating simulation status:", error);
            return false;
        }
    }
    return false;
}

/**
 * Update simulation status (manual override for creators)
 * EXACT COPY from services/simulation.js
 */
export async function updateSimulationStatus(simulationId, newStatus, db = null) {
    const database = db || getFirestoreDb();

    try {
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        await updateDoc(simRef, {
            status: newStatus,
            statusUpdatedAt: serverTimestamp(),
            manualStatusOverride: true // Flag for manual overrides
        });

        console.log(`Simulation ${simulationId} status manually updated to: ${newStatus}`);
        return { success: true };

    } catch (error) {
        console.error("Error updating simulation status:", error);
        throw error;
    }
}