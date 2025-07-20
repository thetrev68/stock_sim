// file: src/services/simulation/simulation-management.js
// ENHANCED: Admin management with creator + system admin support

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
    // limit,
    serverTimestamp
} from "firebase/firestore";
import { SIMULATION_STATUS } from "../../constants/simulation-status.js";
import { calculateRealTimeStatus } from "./simulation-core.js";
import { permissionService } from "../auth/permission-service.js";

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
 * ENHANCED: Fetches a simulation and verifies creator OR admin permissions
 */
async function getVerifiedSimulation(simulationId, userId, database) {
    console.log("Checking permissions for:", { simulationId, userId });
    
    const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
    const simSnap = await getDoc(simRef);

    if (!simSnap.exists()) {
        console.error("Simulation not found:", simulationId);
        throw new Error("Simulation not found");
    }

    const simulation = simSnap.data();
    
    // ENHANCED: Check both creator and admin permissions
    const permissions = await permissionService.getSimulationPermissions(userId, simulation);
    
    console.log("Permission check result:", {
        userId,
        simulationCreator: simulation.createdBy,
        permissions
    });

    if (!permissions.canManage) {
        console.error("Permission denied:", {
            simulationCreator: simulation.createdBy,
            requestingUser: userId,
            isCreator: permissions.isCreator,
            isAdmin: permissions.isAdmin
        });
        throw new Error("You don't have permission to manage this simulation. Only the creator or system administrators can perform this action.");
    }

    console.log(`Permission granted for user ${userId} (${permissions.accessReason})`);
    return { simRef, simulation, permissions };
}

/**
 * ENHANCED: Get member statistics with admin support
 */
export async function getMemberStatistics(simulationId, userId, db = null) {
    const database = getDb(db);

    try {
        console.log("Getting member statistics for:", { simulationId, userId });
        
        // ENHANCED: Support both creator and admin access
        const { simulation, permissions } = await getVerifiedSimulation(simulationId, userId, database);

        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId),
            orderBy("joinedAt", "asc")
        );

        const memberDocs = await getDocs(memberQuery);
        const memberStats = [];

        memberDocs.forEach(doc => {
            const memberData = doc.data();
            memberStats.push({
                id: doc.id,
                userId: memberData.userId,
                displayName: memberData.displayName,
                email: memberData.email,
                joinedAt: memberData.joinedAt,
                status: memberData.status,
                role: memberData.role || (memberData.userId === simulation.createdBy ? "creator" : "member"),
                portfolioValue: memberData.portfolioValue || 0,
                totalTrades: memberData.totalTrades || 0
            });
        });

        console.log(`Member statistics loaded successfully by ${permissions.accessReason}:`, memberStats.length, "members");
        return memberStats;

    } catch (error) {
        console.error("Error in getMemberStatistics:", error);
        throw new Error(`Failed to load member management: ${error.message}`);
    }
}

/**
 * ENHANCED: Update simulation settings with admin support
 */
export async function updateSimulationSettings(simulationId, userId, settings, db = null) {
    const database = getDb(db);

    try {
        console.log("Updating simulation settings:", { simulationId, userId, settings });
        
        // ENHANCED: Support both creator and admin access
        const { simRef, simulation, permissions } = await getVerifiedSimulation(simulationId, userId, database);

        const updateData = {
            updatedAt: serverTimestamp(),
            updatedBy: userId,
            // ENHANCED: Track if update was made by admin vs creator
            updatedByRole: permissions.accessReason
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

        const changes = Object.keys(updateData).filter(k => !k.includes("At") && k !== "updatedBy" && k !== "updatedByRole");
        if (changes.length > 0) {
            await updateDoc(simRef, updateData);
            console.log(`Simulation ${simulationId} settings updated by ${userId} (${permissions.accessReason})`);
            return { success: true, changes, updatedBy: permissions.accessReason };
        } else {
            return { success: true, changes: [], updatedBy: permissions.accessReason };
        }
    } catch (error) {
        console.error("Error updating simulation settings:", error);
        throw new Error(`Failed to update settings: ${error.message}`);
    }
}

/**
 * ENHANCED: End simulation early with admin support
 */
export async function endSimulationEarly(simulationId, userId, reason = "", db = null) {
    const database = getDb(db);

    try {
        console.log(`Attempting to end simulation ${simulationId} early by ${userId}`);
        
        // ENHANCED: Support both creator and admin access
        const { simRef, simulation, permissions } = await getVerifiedSimulation(simulationId, userId, database);

        if (simulation.status === SIMULATION_STATUS.ENDED) {
            throw new Error("Simulation is already ended");
        }

        const updateData = {
            status: SIMULATION_STATUS.ENDED,
            endedEarly: true,
            endedAt: serverTimestamp(),
            endedBy: userId,
            endedByRole: permissions.accessReason, // Track if ended by creator or admin
            endReason: reason,
            statusUpdatedAt: serverTimestamp(),
            manualStatusOverride: true
        };

        await updateDoc(simRef, updateData);
        console.log("Simulation status updated successfully");

        // Log admin activity (non-blocking)
        try {
            const { ActivityService } = await import("../activity.js");
            const activityService = new ActivityService();
            activityService.initialize();

            const auth = getFirebaseAuth();
            const userDisplayName = auth.currentUser?.displayName || auth.currentUser?.email || "User";

            await activityService.logAchievementActivity(simulationId, userId, userDisplayName, {
                milestone: "simulation_ended_early",
                value: 0,
                rank: null,
                reason: reason,
                endedByRole: permissions.accessReason
            });
        } catch (activityError) {
            console.error("Error logging admin activity (non-fatal):", activityError);
        }

        console.log(`Simulation ${simulationId} ended early by ${userId} (${permissions.accessReason})`);
        return { success: true, endedBy: permissions.accessReason };
    } catch (error) {
        console.error("Error ending simulation early:", error);
        throw error;
    }
}

/**
 * ENHANCED: Remove member with admin support
 */
export async function removeMemberFromSimulation(simulationId, targetUserId, adminUserId, db = null) {
    const database = getDb(db);

    try {
        console.log("Removing member:", { simulationId, targetUserId, adminUserId });
        
        // ENHANCED: Support both creator and admin access
        const { simulation, permissions } = await getVerifiedSimulation(simulationId, adminUserId, database);

        // Prevent removing the creator (even by admins, unless they're super admin)
        if (targetUserId === simulation.createdBy) {
            const isSuperAdmin = await permissionService.isSuperAdmin(adminUserId);
            if (!isSuperAdmin) {
                throw new Error("Cannot remove the simulation creator");
            }
        }

        // Prevent self-removal by creator
        if (targetUserId === adminUserId && permissions.isCreator) {
            throw new Error("Creator cannot remove themselves from simulation");
        }

        // Find and update the member record
        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId),
            where("userId", "==", targetUserId),
            where("status", "==", "active")
        );
        
        const memberDocs = await getDocs(memberQuery);
        
        if (memberDocs.empty) {
            throw new Error("Member not found or already removed");
        }

        const memberDoc = memberDocs.docs[0];
        await updateDoc(memberDoc.ref, {
            status: "removed",
            removedAt: serverTimestamp(),
            removedBy: adminUserId,
            removedByRole: permissions.accessReason
        });

        // Update simulation member count
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        await updateDoc(simRef, {
            memberCount: simulation.memberCount - 1,
            updatedAt: serverTimestamp()
        });

        console.log(`Member ${targetUserId} removed by ${adminUserId} (${permissions.accessReason})`);
        return { success: true, removedBy: permissions.accessReason };

    } catch (error) {
        console.error("Error removing member:", error);
        throw error;
    }
}

/**
 * ENHANCED: Check if user can manage simulation (public utility)
 */
export async function canUserManageSimulation(userId, simulationId, db = null) {
    const database = getDb(db);
    
    try {
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            return false;
        }
        
        const simulation = simSnap.data();
        const permissions = await permissionService.getSimulationPermissions(userId, simulation);
        
        return permissions.canManage;
        
    } catch (error) {
        console.error("Error checking user permissions:", error);
        return false;
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
 * Get simulation management statistics
 */
export async function getSimulationManagementStats(simulationId, adminUserId, db = null) {
    const database = getDb(db);

    try {
        const { simulation } = await getVerifiedSimulation(simulationId, adminUserId, database);

        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId),
            where("status", "==", "active")
        );

        const memberDocs = await getDocs(memberQuery);
        const activeMembers = memberDocs.size;

        // Calculate timeline information
        const startDate = toDate(simulation.startDate);
        const endDate = toDate(simulation.endDate);
        const now = new Date();
        
        let totalDuration = 0;
        let daysElapsed = 0;
        let daysRemaining = 0;
        
        if (startDate && endDate) {
            totalDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            daysElapsed = Math.max(0, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
            daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
        }

        const originalEndDate = simulation.originalEndDate ? toDate(simulation.originalEndDate) : null;

        // Get basic trading statistics
        let totalTrades = 0;
        try {
            // This would require portfolio data, simplified for now
            totalTrades = 0; 
        } catch (error) {
            console.warn("Could not calculate total trades:", error);
        }

        return {
            basicInfo: {
                name: simulation.name,
                status: simulation.status,
                memberCount: activeMembers,
                maxMembers: simulation.maxMembers || 50,
                isAtCapacity: activeMembers >= (simulation.maxMembers || 50)
            },
            trading: {
                totalTrades,
                avgTradesPerMember: activeMembers > 0 ? Math.round(totalTrades / activeMembers) : 0
            },
            timeline: {
                totalDuration,
                daysElapsed,
                daysRemaining,
                progressPercent: totalDuration > 0 ? Math.round((daysElapsed / totalDuration) * 100) : 0,
                wasExtended: !!originalEndDate,
                originalDuration: originalEndDate ? Math.ceil((originalEndDate - startDate) / (1000 * 60 * 60 * 24)) : null
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
        // Get archives where user was the creator
        const creatorArchivesQuery = query(
            collection(database, SIMULATION_ARCHIVES_COLLECTION),
            where("archivedBy", "==", userId),
            orderBy("archivedAt", "desc")
        );
        const creatorArchives = await getDocs(creatorArchivesQuery);

        // Get simulations where user was a member
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

        // Combine and deduplicate archives
        const allArchives = new Map();
        creatorArchives.docs.forEach(doc => {
            allArchives.set(doc.id, {
                id: doc.id,
                ...doc.data(),
                userRole: "creator"
            });
        });

        participantArchives.forEach(doc => {
            if (!allArchives.has(doc.id)) {
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
            return (bTime?.getTime() || 0) - (aTime?.getTime() || 0);
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
                endedEarly: archivedSimulation.endedEarly,
                endReason: archivedSimulation.endReason,
                totalTrades: archivedSimulation.totalTrades,
                totalVolume: archivedSimulation.totalVolume
            },
            rules: sim.rules || {},
            finalResults: results || {},
            winner: archivedSimulation.winner,
            exportedAt: new Date().toISOString(),
            exportVersion: "1.0"
        };

        return exportData;
    } catch (error) {
        console.error("Error generating simulation export:", error);
        throw new Error("Failed to generate export data");
    }
}

/**
 * Safely converts a Firestore Timestamp or date string to a Date object.
 */
const toDate = (timestampOrDate) => {
    if (!timestampOrDate) return null;
    return timestampOrDate.toDate ? timestampOrDate.toDate() : new Date(timestampOrDate);
}

/**
 * Force refresh simulation status from dates (fixes status sync issues)
 */
export async function refreshSimulationStatus(simulationId, db = null) {
    const database = getDb(db);
    
    try {
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }
        
        const simulation = simSnap.data();
        const currentStatus = calculateRealTimeStatus(simulation);
        
        // Only update if status has changed and no manual override exists
        if (currentStatus !== simulation.status && !simulation.manualStatusOverride) {
            await updateDoc(simRef, {
                status: currentStatus,
                statusUpdatedAt: serverTimestamp()
            });
            
            console.log(`Simulation ${simulationId} status refreshed from ${simulation.status} to ${currentStatus}`);
            return { success: true, oldStatus: simulation.status, newStatus: currentStatus };
        }
        
        return { success: true, statusChanged: false };
        
    } catch (error) {
        return handleError("refreshing simulation status", error);
    }
}

/**
 * Update simulation status (manual override for creators)
 */
export async function updateSimulationStatus(simulationId, newStatus, db = null) {
    const database = getDb(db);
    
    try {
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }
        
        await updateDoc(simRef, {
            status: newStatus,
            statusUpdatedAt: serverTimestamp(),
            manualStatusOverride: true
        });
        
        console.log(`Simulation ${simulationId} status manually updated to ${newStatus}`);
        return { success: true };
        
    } catch (error) {
        return handleError("updating simulation status", error);
    }
};