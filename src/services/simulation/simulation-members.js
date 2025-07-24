// file: src/services/simulation/simulation-members.js
// Member management operations extracted from services/simulation.js
// Phase 3A Step 2: Member CRUD, permissions, and statistics

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
import { logger } from "../../utils/logger.js";

const SIMULATIONS_COLLECTION = "simulations";
const SIMULATION_MEMBERS_COLLECTION = "simulationMembers";

/**
 * Add a member to a simulation
 * EXACT COPY from services/simulation.js
 */
export async function addMemberToSimulation(simulationId, userId, role = "member", userInfo = null, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Check if user is already a member
        const existingMemberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId),
            where("userId", "==", userId),
            where("status", "==", SIMULATION_STATUS.ACTIVE)
        );
        const existingMembers = await getDocs(existingMemberQuery);
        
        if (!existingMembers.empty) {
            throw new Error("User is already a member of this simulation");
        }

        // Get simulation to check member limit
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulation = simSnap.data();
        if (simulation.memberCount >= simulation.maxMembers) {
            throw new Error("Simulation has reached maximum member limit");
        }

        // Add member record
        const memberData = {
            simulationId: simulationId,
            userId: userId,
            joinedAt: serverTimestamp(),
            role: role,
            displayName: userInfo?.displayName || "Anonymous User",
            email: userInfo?.email || "",
            status: SIMULATION_STATUS.ACTIVE
        };

        await addDoc(collection(database, SIMULATION_MEMBERS_COLLECTION), memberData);

        // Update simulation member count
        await updateDoc(simRef, {
            memberCount: simulation.memberCount + 1
        });

        logger.debug(`User ${userId} added to simulation ${simulationId} as ${role}`);
        return { success: true };

    } catch (error) {
        logger.error("Error adding member to simulation:", error);
        throw error;
    }
}

/**
 * Get simulation members
 * EXACT COPY from services/simulation.js
 */
export async function getSimulationMembers(simulationId, db = null) {
    const database = db || getFirestoreDb();

    try {
        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId),
            where("status", "==", SIMULATION_STATUS.ACTIVE),
            orderBy("joinedAt", "asc")
        );
        const memberDocs = await getDocs(memberQuery);

        return memberDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

    } catch (error) {
        logger.error("Error getting simulation members:", error);
        throw error;
    }
}

/**
 * Check if user is member of simulation
 * EXACT COPY from services/simulation.js
 */
export async function isUserMemberOfSimulation(simulationId, userId, db = null) {
    const database = db || getFirestoreDb();

    try {
        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId),
            where("userId", "==", userId),
            where("status", "==", SIMULATION_STATUS.ACTIVE)
        );
        const memberDocs = await getDocs(memberQuery);

        return !memberDocs.empty;

    } catch (error) {
        logger.error("Error checking simulation membership:", error);
        return false;
    }
}

/**
 * Remove a member from a simulation (admin only)
 * EXACT COPY from services/simulation.js
 */
export async function removeMemberFromSimulation(simulationId, userId, adminUserId, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Verify admin is the creator
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulation = simSnap.data();
        if (simulation.createdBy !== adminUserId) {
            throw new Error("Only simulation creator can remove members");
        }

        // Prevent creator from removing themselves
        if (userId === adminUserId) {
            throw new Error("Creator cannot remove themselves from simulation");
        }

        // Find and update the member record
        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId),
            where("userId", "==", userId),
            where("status", "==", SIMULATION_STATUS.ACTIVE)
        );
        const memberDocs = await getDocs(memberQuery);

        if (memberDocs.empty) {
            throw new Error("Member not found in simulation");
        }

        const memberDoc = memberDocs.docs[0];
        
        // Update member status to 'removed'
        await updateDoc(memberDoc.ref, {
            status: "removed",
            removedAt: serverTimestamp(),
            removedBy: adminUserId
        });

        // Update simulation member count
        await updateDoc(simRef, {
            memberCount: simulation.memberCount - 1
        });

        logger.debug(`User ${userId} removed from simulation ${simulationId} by ${adminUserId}`);
        return { success: true };

    } catch (error) {
        logger.error("Error removing member from simulation:", error);
        throw error;
    }
}

/**
 * Helper method to calculate holdings value
 * EXACT COPY from services/simulation.js
 */
export function calculateHoldingsValue(holdings) {
    if (!holdings) return 0;
    
    let total = 0;
    for (const ticker in holdings) {
        if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
            total += holdings[ticker].quantity * holdings[ticker].avgPrice;
        }
    }
    return total;
}

/**
 * Get detailed member statistics for admin view
 * FIXED VERSION - resolves "Cannot access before initialization" error
 */
export async function getMemberStatistics(simulationId, adminUserId, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Verify admin permissions
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);
        
        if (!simSnap.exists()) {
            throw new Error("Simulation not found");
        }

        const simulationData = simSnap.data(); // Changed variable name to avoid conflicts
        
        logger.debug("=== getMemberStatistics DEBUG ===");
        logger.debug("simulationData.createdBy:", simulationData.createdBy);
        logger.debug("adminUserId:", adminUserId);
        logger.debug("Type of simulationData.createdBy:", typeof simulationData.createdBy);
        logger.debug("Type of adminUserId:", typeof adminUserId);
        logger.debug("Are they equal?:", simulationData.createdBy === adminUserId);
        logger.debug("Are they equal (loose)?:", simulationData.createdBy == adminUserId);
        logger.debug("================================");
        
        if (simulationData.createdBy !== adminUserId) {
            throw new Error("Only simulation creator can view detailed statistics");
        }

        // Get all members (active and removed)
        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("simulationId", "==", simulationId),
            orderBy("joinedAt", "asc")
        );
        const memberDocs = await getDocs(memberQuery);

        const memberStats = [];

        for (const memberDoc of memberDocs.docs) {
            const memberData = memberDoc.data(); // Changed variable name to avoid conflicts
            
            // Get portfolio data if member is active
            let portfolioData = null;
            if (memberData.status === SIMULATION_STATUS.ACTIVE) {
                try {
                    const { getPortfolio } = await import("../trading.js");
                    portfolioData = await getPortfolio(memberData.userId, simulationId);
                } catch (error) {
                    console.warn(`Could not load portfolio for ${memberData.userId}:`, error);
                }
            }

            // Get activity count
            let activityCount = 0;
            try {
                const { ActivityService } = await import("../activity.js");
                const activityService = new ActivityService();
                activityService.initialize();
                const activities = await activityService.getUserActivities(simulationId, memberData.userId, 100);
                activityCount = activities.length;
            } catch (error) {
                console.warn(`Could not load activities for ${memberData.userId}:`, error);
            }

            memberStats.push({
                ...memberData,
                memberId: memberDoc.id,
                portfolioValue: portfolioData ? (portfolioData.cash + calculateHoldingsValue(portfolioData.holdings)) : 0,
                totalTrades: portfolioData ? (portfolioData.trades?.length || 0) : 0,
                activityCount,
                portfolioCash: portfolioData?.cash || 0,
                holdingsCount: portfolioData ? Object.keys(portfolioData.holdings || {}).length : 0
            });
        }

        return memberStats;

    } catch (error) {
        logger.error("Error getting member statistics:", error);
        throw error;
    }
}