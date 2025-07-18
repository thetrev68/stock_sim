// file: src/services/simulation/simulation-user-operations.js
// User-facing operations extracted from services/simulation.js
// Phase 3A Step 4: Join simulation, get user simulations - orchestration methods

import { getFirestoreDb } from "../firebase.js";
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where 
} from "firebase/firestore";
import { SIMULATION_STATUS } from "../../constants/simulation-status.js";
import { 
    calculateRealTimeStatus 
} from "./simulation-core.js";
import { addMemberToSimulation } from "./simulation-members.js";

const SIMULATIONS_COLLECTION = "simulations";
const SIMULATION_MEMBERS_COLLECTION = "simulationMembers";

/**
 * Update simulation status if it has changed - Enhanced to respect manual endings
 * Helper function for user operations
 * EXACT COPY from services/simulation.js
 */
async function updateSimulationStatusIfNeeded(simulationId, currentStoredStatus, calculatedStatus, db) {
    // CRITICAL FIX: Don't auto-update if simulation was manually ended
    const simRef = doc(db, SIMULATIONS_COLLECTION, simulationId);
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
            const { updateDoc, serverTimestamp } = await import("firebase/firestore");
            
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
 * Join simulation by invite code
 * EXACT COPY from services/simulation.js
 */
export async function joinSimulationByCode(inviteCode, userId, userInfo, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Find simulation by invite code
        const simQuery = query(
            collection(database, SIMULATIONS_COLLECTION),
            where("inviteCode", "==", inviteCode.toUpperCase())
        );
        const simResults = await getDocs(simQuery);

        if (simResults.empty) {
            throw new Error("Invalid invite code. Please check and try again.");
        }

        const simDoc = simResults.docs[0];
        const simulation = simDoc.data();
        const simulationId = simDoc.id;

        // Calculate real-time status
        const realTimeStatus = calculateRealTimeStatus(simulation);
        
        // Update status if needed
        await updateSimulationStatusIfNeeded(simulationId, simulation.status, realTimeStatus, database);

        // Check simulation status (use real-time status)
        if (realTimeStatus === SIMULATION_STATUS.ENDED) {
            throw new Error("This simulation has already ended.");
        }

        // Add user as member
        await addMemberToSimulation(simulationId, userId, "member", userInfo, database);

        return {
            success: true,
            simulation: { 
                ...simulation, 
                id: simulationId,
                status: realTimeStatus // Return updated status
            }
        };

    } catch (error) {
        console.error("Error joining simulation:", error);
        throw error;
    }
}

/**
 * Get simulations for a specific user (with auto status updates)
 * EXACT COPY from services/simulation.js
 */
export async function getUserSimulations(userId, db = null) {
    const database = db || getFirestoreDb();

    try {
        // Get user's simulation memberships
        const memberQuery = query(
            collection(database, SIMULATION_MEMBERS_COLLECTION),
            where("userId", "==", userId),
            where("status", "==", SIMULATION_STATUS.ACTIVE)
        );
        const memberDocs = await getDocs(memberQuery);

        if (memberDocs.empty) {
            return [];
        }

        // Get simulation details for each membership
        const simulationIds = memberDocs.docs.map(doc => doc.data().simulationId);
        const simulations = [];

        for (const simId of simulationIds) {
            const simRef = doc(database, SIMULATIONS_COLLECTION, simId);
            const simSnap = await getDoc(simRef);
            
            if (simSnap.exists()) {
                const simData = simSnap.data();
                const memberData = memberDocs.docs.find(m => m.data().simulationId === simId)?.data();
                
                // Calculate real-time status
                const realTimeStatus = calculateRealTimeStatus(simData);
                
                // Update status in background if needed (don't await to avoid blocking)
                if (simData.status !== realTimeStatus) {
                    updateSimulationStatusIfNeeded(simId, simData.status, realTimeStatus, database)
                        .catch(error => console.error("Background status update failed:", error));
                }
                
                simulations.push({
                    ...simData,
                    id: simId,
                    status: realTimeStatus, // Use real-time status for display
                    userRole: memberData?.role || "member",
                    joinedAt: memberData?.joinedAt
                });
            }
        }

        // Sort by creation date (newest first)
        simulations.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return bTime.getTime() - aTime.getTime();
        });

        return simulations;

    } catch (error) {
        console.error("Error getting user simulations:", error);
        throw error;
    }
}