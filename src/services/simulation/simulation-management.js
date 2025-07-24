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
    writeBatch,
    serverTimestamp
} from "firebase/firestore";
import { SIMULATION_STATUS } from "../../constants/simulation-status.js";
import { calculateRealTimeStatus } from "./simulation-core.js";
import { permissionService } from "../auth/permission-service.js";
import { sortByArchivedDate } from "../../utils/date-utils.js";
import { 
    calculateUtilizationPercent,
    calculateAvgTradesPerMember,
    calculateProgressPercent,
    sumByProperty
} from "../../utils/math-utils.js";
import { logger } from "../../utils/logger.js";

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
    logger.error(`Error ${context}:`, error);
    throw error;
};

/**
 * ENHANCED: Fetches a simulation and verifies creator OR admin permissions
 */
async function getVerifiedSimulation(simulationId, userId, database) {
    logger.debug("Checking permissions for:", { simulationId, userId });
    
    const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
    const simSnap = await getDoc(simRef);

    if (!simSnap.exists()) {
        logger.error("Simulation not found:", simulationId);
        throw new Error("Simulation not found");
    }

    const simulation = simSnap.data();
    
    // ENHANCED: Check both creator and admin permissions
    const permissions = await permissionService.getSimulationPermissions(userId, simulation);
    
    logger.debug("Permission check result:", {
        userId,
        simulationCreator: simulation.createdBy,
        permissions
    });

    if (!permissions.canManage) {
        logger.error("Permission denied:", {
            simulationCreator: simulation.createdBy,
            requestingUser: userId,
            isCreator: permissions.isCreator,
            isAdmin: permissions.isAdmin
        });
        throw new Error("You don't have permission to manage this simulation. Only the creator or system administrators can perform this action.");
    }

    logger.debug(`Permission granted for user ${userId} (${permissions.accessReason})`);
    return { simRef, simulation, permissions };
}

/**
 * ENHANCED: Get member statistics with admin support
 */
export async function getMemberStatistics(simulationId, userId, db = null) {
    const database = getDb(db);

    try {
        logger.debug("Getting member statistics for:", { simulationId, userId });
        
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

        logger.debug(`Member statistics loaded successfully by ${permissions.accessReason}:`, memberStats.length, "members");
        return memberStats;

    } catch (error) {
        logger.error("Error in getMemberStatistics:", error);
        throw new Error(`Failed to load member management: ${error.message}`);
    }
}

/**
 * ENHANCED: Update simulation settings with admin support
 */
export async function updateSimulationSettings(simulationId, userId, settings, db = null) {
    const database = getDb(db);

    try {
        logger.debug("Updating simulation settings:", { simulationId, userId, settings });
        
        // ENHANCED: Support both creator and admin access
        const { simRef, simulation, permissions } = await getVerifiedSimulation(simulationId, userId, database);

        const updateData = {
            updatedAt: serverTimestamp(),
            updatedBy: userId,
            // ENHANCED: Track if update was made by admin vs creator
            updatedByRole: permissions.accessReason
        };

        let nameChanged = false;
        const oldName = simulation.name;

        if (settings.name && settings.name.trim() !== simulation.name) {
            updateData.name = settings.name.trim();
            nameChanged = true;

            logger.debug("🔍 NAME CHANGE DETECTED:");
            logger.debug("  Old name:", simulation.name);
            logger.debug("  New name:", settings.name.trim());
            logger.debug("  nameChanged flag:", nameChanged);
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
            // First update the main simulation document
            await updateDoc(simRef, updateData);
            
            // If name changed, update it everywhere
            if (nameChanged) {
                logger.debug(`🔄 About to update name everywhere: "${oldName}" → "${settings.name.trim()}"`);
                logger.debug("Calling updateSimulationNameEverywhere...");
                await updateSimulationNameEverywhere(simulationId, settings.name.trim(), database);
                logger.debug("✅ updateSimulationNameEverywhere completed");
            }
            
            logger.debug(`Simulation ${simulationId} settings updated by ${userId} (${permissions.accessReason})`);
            return { success: true, changes, updatedBy: permissions.accessReason, nameChanged };
        } else {
            return { success: true, changes: [], updatedBy: permissions.accessReason, nameChanged: false };
        }
    } catch (error) {
        logger.error("Error updating simulation settings:", error);
        throw new Error(`Failed to update settings: ${error.message}`);
    }
}

/**
 * ENHANCED: End simulation early with admin support
 */
export async function endSimulationEarly(simulationId, userId, reason = "", db = null) {
    const database = getDb(db);

    try {
        logger.debug(`Attempting to end simulation ${simulationId} early by ${userId}`);
        
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
        logger.debug("Simulation status updated successfully");

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
            logger.error("Error logging admin activity (non-fatal):", activityError);
        }

        logger.debug(`Simulation ${simulationId} ended early by ${userId} (${permissions.accessReason})`);
        return { success: true, endedBy: permissions.accessReason };
    } catch (error) {
        logger.error("Error ending simulation early:", error);
        throw error;
    }
}

/**
 * ENHANCED: Remove member with admin support
 */
export async function removeMemberFromSimulation(simulationId, targetUserId, adminUserId, db = null) {
    const database = getDb(db);

    try {
        logger.debug("Removing member:", { simulationId, targetUserId, adminUserId });
        
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

        logger.debug(`Member ${targetUserId} removed by ${adminUserId} (${permissions.accessReason})`);
        return { success: true, removedBy: permissions.accessReason };

    } catch (error) {
        logger.error("Error removing member:", error);
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
        logger.error("Error checking user permissions:", error);
        return false;
    }
}

/**
 * Extend simulation duration (admin only)
 * FIXED: Proper date comparison handling
 */
export async function extendSimulation(simulationId, adminUserId, newEndDate, reason = "", db = null) {
    const database = getDb(db);

    try {
        const { simRef, simulation } = await getVerifiedSimulation(simulationId, adminUserId, database);

        if (simulation.status === SIMULATION_STATUS.ENDED) {
            throw new Error("Cannot extend an ended simulation");
        }

        const currentEndDate = toDate(simulation.endDate);
        
        // FIX: Parse the date string correctly to avoid timezone issues
        // Input format: "2025-07-27" -> parse as local timezone date
        const dateParts = newEndDate.split("-");
        const extensionDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));

        // DEBUG: Log the dates for comparison
        logger.debug("=== EXTEND SIMULATION DEBUG ===");
        logger.debug("Current end date:", currentEndDate);
        logger.debug("New end date input:", newEndDate);
        logger.debug("Extension date object (fixed):", extensionDate);
        logger.debug("Current end date getTime():", currentEndDate.getTime());
        logger.debug("Extension date getTime():", extensionDate.getTime());
        logger.debug("Extension > Current?:", extensionDate.getTime() > currentEndDate.getTime());
        logger.debug("================================");

        // Normalize both dates to start of day for comparison
        const currentEndTime = new Date(currentEndDate.getFullYear(), currentEndDate.getMonth(), currentEndDate.getDate()).getTime();
        const extensionTime = new Date(extensionDate.getFullYear(), extensionDate.getMonth(), extensionDate.getDate()).getTime();

        if (extensionTime <= currentEndTime) {
            throw new Error(`New end date (${extensionDate.toDateString()}) must be after current end date (${currentEndDate.toDateString()})`);
        }
        
        const now = new Date();
        const todayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        if (extensionTime <= todayTime) {
            throw new Error("New end date must be in the future");
        }

        // Set the extension date to end of day (23:59:59) to match original simulation behavior
        const finalExtensionDate = new Date(extensionDate);
        finalExtensionDate.setHours(23, 59, 59, 999);

        await updateDoc(simRef, {
            endDate: finalExtensionDate,
            extendedAt: serverTimestamp(),
            extendedBy: adminUserId,
            extensionReason: reason,
            statusUpdatedAt: serverTimestamp(),
            originalEndDate: simulation.originalEndDate || simulation.endDate
        });

        logger.debug(`Simulation ${simulationId} extended to ${finalExtensionDate.toISOString()} by ${adminUserId}`);
        return { success: true };
    } catch (error) {
        return handleError("extending simulation", error);
    }
}

/**
 * Get simulation management statistics
 * RESTORED to original structure with proper date utilities
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

        // Import date utilities properly
        const { 
            calculateTotalDuration, 
            calculateDaysElapsed, 
            calculateDaysRemaining 
        } = await import("../../utils/date-utils.js");

        // Use proper date utility functions
        const totalDuration = calculateTotalDuration(simulation.startDate, simulation.endDate);
        const daysElapsed = calculateDaysElapsed(simulation.startDate);
        const daysRemaining = calculateDaysRemaining(simulation.endDate);
        
        // Calculate original duration if simulation was extended
        const originalDuration = simulation.originalEndDate ? 
            calculateTotalDuration(simulation.startDate, simulation.originalEndDate) : null;

        // RETURN CORRECT STRUCTURE - this is what the modal template expects
        return {
            simulation: {
                ...simulation,
                id: simulationId
            },
            members: {
                active: activeMembers,
                removed: removedMembers,
                totalJoined: totalJoined,
                utilizationPercent: calculateUtilizationPercent(activeMembers, simulation.maxMembers)
            },
            activity: {
                totalTrades,
                totalVolume,
                avgTradesPerMember: calculateAvgTradesPerMember(totalTrades, activeMembers)
            },
            timeline: {
                totalDuration,
                daysElapsed,
                daysRemaining,
                progressPercent: calculateProgressPercent(daysElapsed, totalDuration),
                wasExtended: !!simulation.originalEndDate,
                originalDuration
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
            totalTrades: sumByProperty(finalLeaderboard?.rankings || [], "totalTrades"),
            totalVolume: sumByProperty(finalLeaderboard?.rankings || [], "totalVolume"),
            winner: finalLeaderboard?.rankings?.[0] || null,
            duration: (startDate && endDate) ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) : null
        };

        const archiveRef = await addDoc(collection(database, SIMULATION_ARCHIVES_COLLECTION), archiveData);

        await updateDoc(simRef, {
            archived: true,
            archiveId: archiveRef.id,
            archivedAt: serverTimestamp()
        });

        logger.debug(`Simulation ${simulationId} archived successfully with ID: ${archiveRef.id}`);
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

        const results = sortByArchivedDate(Array.from(allArchives.values()));

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
        logger.error("Error generating simulation export:", error);
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
            
            logger.debug(`Simulation ${simulationId} status refreshed from ${simulation.status} to ${currentStatus}`);
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
        
        logger.debug(`Simulation ${simulationId} status manually updated to ${newStatus}`);
        return { success: true };
        
    } catch (error) {
        return handleError("updating simulation status", error);
    }
};

/**
 * Update simulation name across all collections (denormalized data)
 * Call this after updating the main simulation document
 */
export async function updateSimulationNameEverywhere(simulationId, newName, db = null) {
    const database = getDb(db);
    
    try {
        logger.debug(`Updating simulation name to "${newName}" across all collections...`);
        
        // Use a batch to ensure all updates succeed or fail together
        const batch = writeBatch(database);
        let updateCount = 0;

        // 1. Update portfolios collection
        const portfoliosQuery = query(
            collection(database, "portfolios"),
            where("simulationId", "==", simulationId)
        );
        const portfolioDocs = await getDocs(portfoliosQuery);
        
        portfolioDocs.forEach(docSnap => {
            const portfolioRef = doc(database, "portfolios", docSnap.id);
            batch.update(portfolioRef, { 
                simulationName: newName,
                updatedAt: serverTimestamp()
            });
            updateCount++;
        });

        // 2. Update activities collection (if it exists and has simulationName)
        try {
            const activitiesQuery = query(
                collection(database, "activities"),
                where("simulationId", "==", simulationId)
            );
            const activityDocs = await getDocs(activitiesQuery);
            
            activityDocs.forEach(docSnap => {
                const activityData = docSnap.data();
                // Only update if the document has a simulationName field
                if (activityData.simulationName) {
                    const activityRef = doc(database, "activities", docSnap.id);
                    batch.update(activityRef, { 
                        simulationName: newName,
                        updatedAt: serverTimestamp()
                    });
                    updateCount++;
                }
            });
        } catch (error) {
            console.warn("Activities collection may not exist or have simulationName field:", error.message);
        }

        // 3. Update any other collections that might store simulationName
        // Add more collections here as needed
        
        // Execute all updates as a batch
        if (updateCount > 0) {
            await batch.commit();
            logger.debug(`Successfully updated simulationName in ${updateCount} documents`);
        } else {
            logger.debug("No documents found to update");
        }

        return { success: true, updatedDocuments: updateCount };

    } catch (error) {
        logger.error("Error updating simulation name everywhere:", error);
        throw new Error(`Failed to update simulation name across collections: ${error.message}`);
    }
}