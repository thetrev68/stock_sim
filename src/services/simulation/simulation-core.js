// file: src/services/simulation/simulation-core.js
// Core CRUD operations extracted from YOUR SimulationService
// Phase 3A Step 1: Basic simulation operations with minimal dependencies

import { getFirestoreDb } from "../firebase.js";
import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    // updateDoc, 
    query, 
    where,
    // orderBy, 
    serverTimestamp 
} from "firebase/firestore";
import { SIMULATION_STATUS } from "../../constants/simulation-status.js";

/**
 * Create simulation portfolio automatically
 */
async function createSimulationPortfolio(userId, simulationId, simulation, database) {
    try {
        console.log(`🎯 Creating portfolio for user ${userId} in simulation ${simulationId}`);
        
        // Import what we need inside the function
        const { doc, setDoc } = await import("firebase/firestore");
        
        const portfolioId = `${userId}_${simulationId}`;
        const portfolioRef = doc(database, "portfolios", portfolioId);
        
        const portfolioData = {
            userId: userId,
            simulationId: simulationId,
            cash: simulation.startingBalance || 10000,
            holdings: {},
            trades: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            simulationName: simulation.name,
            startingBalance: simulation.startingBalance || 10000,
            currentRank: null,
            lastRankUpdate: null
        };
        
        await setDoc(portfolioRef, portfolioData);
        console.log(`✅ Portfolio created successfully for ${userId}`);
        
        return portfolioData;
    } catch (error) {
        console.error("❌ Error creating simulation portfolio:", error);
        throw error;
    }
}

const SIMULATIONS_COLLECTION = "simulations";
const SIMULATION_MEMBERS_COLLECTION = "simulationMembers";

/**
 * Get current user info from auth
 * EXACT COPY from your services/simulation.js
 */
export async function getCurrentUserInfo(userId) {
    try {
        // Try to get from Firebase Auth if available
        const { getFirebaseAuth } = await import("../firebase.js");
        const auth = getFirebaseAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser && currentUser.uid === userId) {
            return {
                displayName: currentUser.displayName || currentUser.email || "Anonymous User",
                email: currentUser.email || ""
            };
        }
    } catch (error) {
        console.error("Error getting current user info:", error);
    }
    
    // Fallback
    return {
        displayName: "Anonymous User",
        email: ""
    };
}

/**
 * Calculate real-time status based on dates - Enhanced to respect all manual overrides
 * EXACT COPY from your services/simulation.js
 */
export function calculateRealTimeStatus(simulation) {
    // CRITICAL FIX: Check for admin early ending first
    if (simulation.adminEndedEarly || simulation.endedEarly) {
        return SIMULATION_STATUS.ENDED;
    }

    // Check for manual status override
    if (simulation.manualStatusOverride && simulation.status === SIMULATION_STATUS.ENDED) {
        return SIMULATION_STATUS.ENDED;
    }

    // Only calculate from dates if no manual interventions
    const now = new Date();
    const startDate = simulation.startDate.toDate ? simulation.startDate.toDate() : new Date(simulation.startDate);
    const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);

    if (now < startDate) {
        return SIMULATION_STATUS.PENDING;
    } else if (now >= startDate && now <= endDate) {
        return SIMULATION_STATUS.ACTIVE;
    } else {
        return SIMULATION_STATUS.ENDED;
    }
}

/**
 * Generate a unique 6-character invite code
 * EXACT COPY from your services/simulation.js
 */
export function generateSimulationInviteCode() {
    // Generate 6-character alphanumeric invite code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Get simulation details by ID (with auto status update)
 * EXACT COPY from your services/simulation.js
 */
export async function getSimulation(simulationId, db = null) {
    const database = db || getFirestoreDb();

    try {
        const simRef = doc(database, SIMULATIONS_COLLECTION, simulationId);
        const simSnap = await getDoc(simRef);

        if (!simSnap.exists()) {
            return null;
        }

        const simulation = simSnap.data();
        
        // Calculate real-time status
        const realTimeStatus = calculateRealTimeStatus(simulation);
        
        // Update status if needed (NOTE: This calls a method that's still in main service)
        // await this.updateSimulationStatusIfNeeded(simulationId, simulation.status, realTimeStatus);

        return {
            ...simulation,
            id: simulationId,
            status: realTimeStatus // Return real-time status
        };

    } catch (error) {
        console.error("Error getting simulation:", error);
        throw error;
    }
}

/**
 * Create a new simulation with automatic portfolio creation
 * ENHANCED: Now automatically creates creator's portfolio
 */
export async function createSimulation(simulationData, creatorUserId, db = null) {
    const database = db || getFirestoreDb();

    try {
        console.log("Creating simulation for user:", creatorUserId);

        // Generate unique invite code
        const inviteCode = generateSimulationInviteCode();

        // Validate required fields
        if (!simulationData.name || simulationData.name.trim() === "") {
            throw new Error("Simulation name is required. Please try again.");
        }

        // Parse dates correctly
        const startDate = new Date(simulationData.startDate);
        const endDate = new Date(simulationData.endDate);

        // Calculate initial status based on start date
        const now = new Date();
        const initialStatus = now < startDate ? SIMULATION_STATUS.PENDING : SIMULATION_STATUS.ACTIVE;

        // Prepare simulation document
        const simulation = {
            name: simulationData.name,
            description: simulationData.description || "",
            createdBy: creatorUserId,
            startDate: startDate,
            endDate: endDate,
            startingBalance: simulationData.startingBalance || 10000,
            maxMembers: simulationData.maxMembers || 50,
            allowShortSelling: simulationData.allowShortSelling || false,
            tradingHours: simulationData.tradingHours || "market",
            status: initialStatus,
            inviteCode: inviteCode,
            createdAt: serverTimestamp(),
            memberCount: 1 // Creator is first member
        };

        // Create simulation document
        const simRef = await addDoc(collection(database, SIMULATIONS_COLLECTION), simulation);
        const simulationId = simRef.id;

        // Get user info for member creation
        const userInfo = await getCurrentUserInfo(creatorUserId);

        // Add creator as first member
        await addDoc(collection(database, SIMULATION_MEMBERS_COLLECTION), {
            simulationId: simulationId,
            userId: creatorUserId,
            role: "creator",
            status: SIMULATION_STATUS.ACTIVE,
            joinedAt: serverTimestamp(),
            displayName: userInfo.displayName,
            email: userInfo.email
        });

        // 🚀 NEW: Create portfolio for the creator automatically
        const simulationWithId = { ...simulation, id: simulationId };
        await createSimulationPortfolio(creatorUserId, simulationId, simulationWithId, database);

        console.log(`Simulation created: ${simulationId} with status: ${initialStatus} and invite code: ${inviteCode}`);
        console.log(`✅ Portfolio automatically created for creator ${creatorUserId}`);
        
        return {
            success: true,
            simulationId: simulationId,
            inviteCode: inviteCode,
            simulation: simulationWithId
        };

    } catch (error) {
        console.error("Error creating simulation:", error);
        throw error;
    }
}

/**
 * Find simulation by invite code (for preview without joining)
 * EXACT COPY from your services/simulation.js
 */
export async function findSimulationByCode(inviteCode, db = null) {
    const database = db || getFirestoreDb();

    try {
        const simQuery = query(
            collection(database, SIMULATIONS_COLLECTION),
            where("inviteCode", "==", inviteCode.toUpperCase())
        );
        const simResults = await getDocs(simQuery);

        if (simResults.empty) {
            return null;
        }

        const simDoc = simResults.docs[0];
        const simulation = simDoc.data();
        
        // Calculate real-time status for preview
        const realTimeStatus = calculateRealTimeStatus(simulation);
        
        return {
            ...simulation,
            id: simDoc.id,
            status: realTimeStatus // Show real-time status in preview
        };

    } catch (error) {
        console.error("Error finding simulation by code:", error);
        throw error;
    }
}