// src/services/simulation.js - Enhanced with Auto Status Updates
import { getFirestoreDb } from './firebase.js';
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
    serverTimestamp,
    arrayUnion,
    arrayRemove 
} from 'firebase/firestore';

const SIMULATIONS_COLLECTION = 'simulations';
const SIMULATION_MEMBERS_COLLECTION = 'simulationMembers';

export class SimulationService {
    constructor() {
        this.db = null;
    }

    // Initialize service
    initialize() {
        this.db = getFirestoreDb();
        console.log('SimulationService initialized');
    }

    /**
     * Get current user info from auth
     */
    async getCurrentUserInfo(userId) {
        try {
            // Try to get from Firebase Auth if available
            const { getFirebaseAuth } = await import('./firebase.js');
            const auth = getFirebaseAuth();
            const currentUser = auth.currentUser;
            
            if (currentUser && currentUser.uid === userId) {
                return {
                    displayName: currentUser.displayName || currentUser.email || 'Anonymous User',
                    email: currentUser.email || ''
                };
            }
        } catch (error) {
            console.error('Error getting current user info:', error);
        }
        
        // Fallback
        return {
            displayName: 'Anonymous User',
            email: ''
        };
    }

    /**
     * Calculate real-time status based on dates
     */
    calculateRealTimeStatus(simulation) {
        const now = new Date();
        const startDate = simulation.startDate.toDate ? simulation.startDate.toDate() : new Date(simulation.startDate);
        const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);

        if (now > endDate) {
            return 'ended';
        } else if (now >= startDate) {
            return 'active';
        } else {
            return 'pending';
        }
    }

    /**
     * Update simulation status if it has changed
     */
    async updateSimulationStatusIfNeeded(simulationId, currentStoredStatus, calculatedStatus) {
        if (currentStoredStatus !== calculatedStatus) {
            try {
                this.db = this.db || getFirestoreDb();
                const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
                
                await updateDoc(simRef, {
                    status: calculatedStatus,
                    statusUpdatedAt: serverTimestamp()
                });
                
                console.log(`Auto-updated simulation ${simulationId} status: ${currentStoredStatus} → ${calculatedStatus}`);
                return true;
            } catch (error) {
                console.error('Error auto-updating simulation status:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Generate a unique 6-character invite code
     */
    generateInviteCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Create a new simulation
     */
    async createSimulation(creatorUserId, simulationData) {
        this.db = this.db || getFirestoreDb();
        
        try {
            // Validate required fields
            if (!simulationData.name || !simulationData.startDate || !simulationData.endDate) {
                throw new Error('Missing required simulation data: name, startDate, or endDate');
            }

            // Generate unique invite code
            let inviteCode;
            let codeExists = true;
            let attempts = 0;
            
            while (codeExists && attempts < 10) {
                inviteCode = this.generateInviteCode();
                const existingSimQuery = query(
                    collection(this.db, SIMULATIONS_COLLECTION),
                    where('inviteCode', '==', inviteCode)
                );
                const existingSims = await getDocs(existingSimQuery);
                codeExists = !existingSims.empty;
                attempts++;
            }

            if (codeExists) {
                throw new Error('Unable to generate unique invite code. Please try again.');
            }

            // Calculate initial status based on dates
            const initialStatus = this.calculateRealTimeStatus(simulationData);

            // Create simulation document
            const simulation = {
                name: simulationData.name.trim(),
                description: simulationData.description?.trim() || '',
                createdBy: creatorUserId,
                createdAt: serverTimestamp(),
                startDate: simulationData.startDate,
                endDate: simulationData.endDate,
                startingBalance: simulationData.startingBalance || 10000,
                inviteCode: inviteCode,
                status: initialStatus, // Use calculated status instead of hardcoded 'pending'
                statusUpdatedAt: serverTimestamp(),
                memberCount: 1, // Creator is first member
                maxMembers: simulationData.maxMembers || 50,
                isPublic: false,
                rules: {
                    allowShortSelling: simulationData.allowShortSelling || false,
                    tradingHours: simulationData.tradingHours || 'market',
                    commissionPerTrade: simulationData.commissionPerTrade || 0
                }
            };

            // Add simulation to Firestore
            const simRef = await addDoc(collection(this.db, SIMULATIONS_COLLECTION), simulation);
            const simulationId = simRef.id;

            // Add creator as first member
            const user = await this.getCurrentUserInfo(creatorUserId);
            await this.addMemberToSimulation(simulationId, creatorUserId, 'creator', {
                displayName: user.displayName,
                email: user.email
            });

            console.log(`Simulation created: ${simulationId} with status: ${initialStatus} and invite code: ${inviteCode}`);
            
            return {
                success: true,
                simulationId: simulationId,
                inviteCode: inviteCode,
                simulation: { ...simulation, id: simulationId }
            };

        } catch (error) {
            console.error('Error creating simulation:', error);
            throw error;
        }
    }

    /**
     * Add a member to a simulation
     */
    async addMemberToSimulation(simulationId, userId, role = 'member', userInfo = null) {
        this.db = this.db || getFirestoreDb();

        try {
            // Check if user is already a member
            const existingMemberQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where('simulationId', '==', simulationId),
                where('userId', '==', userId),
                where('status', '==', 'active')
            );
            const existingMembers = await getDocs(existingMemberQuery);
            
            if (!existingMembers.empty) {
                throw new Error('User is already a member of this simulation');
            }

            // Get simulation to check member limit
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            if (simulation.memberCount >= simulation.maxMembers) {
                throw new Error('Simulation has reached maximum member limit');
            }

            // Add member record
            const memberData = {
                simulationId: simulationId,
                userId: userId,
                joinedAt: serverTimestamp(),
                role: role,
                displayName: userInfo?.displayName || 'Anonymous User',
                email: userInfo?.email || '',
                status: 'active'
            };

            await addDoc(collection(this.db, SIMULATION_MEMBERS_COLLECTION), memberData);

            // Update simulation member count
            await updateDoc(simRef, {
                memberCount: simulation.memberCount + 1
            });

            console.log(`User ${userId} added to simulation ${simulationId} as ${role}`);
            return { success: true };

        } catch (error) {
            console.error('Error adding member to simulation:', error);
            throw error;
        }
    }

    /**
     * Join simulation by invite code
     */
    async joinSimulationByCode(inviteCode, userId, userInfo) {
        this.db = this.db || getFirestoreDb();

        try {
            // Find simulation by invite code
            const simQuery = query(
                collection(this.db, SIMULATIONS_COLLECTION),
                where('inviteCode', '==', inviteCode.toUpperCase())
            );
            const simResults = await getDocs(simQuery);

            if (simResults.empty) {
                throw new Error('Invalid invite code. Please check and try again.');
            }

            const simDoc = simResults.docs[0];
            const simulation = simDoc.data();
            const simulationId = simDoc.id;

            // Calculate real-time status
            const realTimeStatus = this.calculateRealTimeStatus(simulation);
            
            // Update status if needed
            await this.updateSimulationStatusIfNeeded(simulationId, simulation.status, realTimeStatus);

            // Check simulation status (use real-time status)
            if (realTimeStatus === 'ended') {
                throw new Error('This simulation has already ended.');
            }

            // Add user as member
            await this.addMemberToSimulation(simulationId, userId, 'member', userInfo);

            return {
                success: true,
                simulation: { 
                    ...simulation, 
                    id: simulationId,
                    status: realTimeStatus // Return updated status
                }
            };

        } catch (error) {
            console.error('Error joining simulation:', error);
            throw error;
        }
    }

    /**
     * Get simulations for a specific user (with auto status updates)
     */
    async getUserSimulations(userId) {
        this.db = this.db || getFirestoreDb();

        try {
            // Get user's simulation memberships
            const memberQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where('userId', '==', userId),
                where('status', '==', 'active')
            );
            const memberDocs = await getDocs(memberQuery);

            if (memberDocs.empty) {
                return [];
            }

            // Get simulation details for each membership
            const simulationIds = memberDocs.docs.map(doc => doc.data().simulationId);
            const simulations = [];

            for (const simId of simulationIds) {
                const simRef = doc(this.db, SIMULATIONS_COLLECTION, simId);
                const simSnap = await getDoc(simRef);
                
                if (simSnap.exists()) {
                    const simData = simSnap.data();
                    const memberData = memberDocs.docs.find(m => m.data().simulationId === simId)?.data();
                    
                    // Calculate real-time status
                    const realTimeStatus = this.calculateRealTimeStatus(simData);
                    
                    // Update status in background if needed (don't await to avoid blocking)
                    if (simData.status !== realTimeStatus) {
                        this.updateSimulationStatusIfNeeded(simId, simData.status, realTimeStatus)
                            .catch(error => console.error('Background status update failed:', error));
                    }
                    
                    simulations.push({
                        ...simData,
                        id: simId,
                        status: realTimeStatus, // Use real-time status for display
                        userRole: memberData?.role || 'member',
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
            console.error('Error getting user simulations:', error);
            throw error;
        }
    }

    /**
     * Get simulation details by ID (with auto status update)
     */
    async getSimulation(simulationId) {
        this.db = this.db || getFirestoreDb();

        try {
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);

            if (!simSnap.exists()) {
                return null;
            }

            const simulation = simSnap.data();
            
            // Calculate real-time status
            const realTimeStatus = this.calculateRealTimeStatus(simulation);
            
            // Update status if needed
            await this.updateSimulationStatusIfNeeded(simulationId, simulation.status, realTimeStatus);

            return {
                ...simulation,
                id: simulationId,
                status: realTimeStatus // Return real-time status
            };

        } catch (error) {
            console.error('Error getting simulation:', error);
            throw error;
        }
    }

    /**
     * Get simulation members
     */
    async getSimulationMembers(simulationId) {
        this.db = this.db || getFirestoreDb();

        try {
            const memberQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where('simulationId', '==', simulationId),
                where('status', '==', 'active'),
                orderBy('joinedAt', 'asc')
            );
            const memberDocs = await getDocs(memberQuery);

            return memberDocs.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error getting simulation members:', error);
            throw error;
        }
    }

    /**
     * Check if user is member of simulation
     */
    async isUserMemberOfSimulation(simulationId, userId) {
        this.db = this.db || getFirestoreDb();

        try {
            const memberQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where('simulationId', '==', simulationId),
                where('userId', '==', userId),
                where('status', '==', 'active')
            );
            const memberDocs = await getDocs(memberQuery);

            return !memberDocs.empty;

        } catch (error) {
            console.error('Error checking simulation membership:', error);
            return false;
        }
    }

    /**
     * Find simulation by invite code (for preview without joining)
     */
    async findSimulationByCode(inviteCode) {
        this.db = this.db || getFirestoreDb();

        try {
            const simQuery = query(
                collection(this.db, SIMULATIONS_COLLECTION),
                where('inviteCode', '==', inviteCode.toUpperCase())
            );
            const simResults = await getDocs(simQuery);

            if (simResults.empty) {
                return null;
            }

            const simDoc = simResults.docs[0];
            const simulation = simDoc.data();
            
            // Calculate real-time status for preview
            const realTimeStatus = this.calculateRealTimeStatus(simulation);
            
            return {
                ...simulation,
                id: simDoc.id,
                status: realTimeStatus // Show real-time status in preview
            };

        } catch (error) {
            console.error('Error finding simulation by code:', error);
            throw error;
        }
    }

    /**
     * Update simulation status (manual override for creators)
     */
    async updateSimulationStatus(simulationId, newStatus) {
        this.db = this.db || getFirestoreDb();

        try {
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            await updateDoc(simRef, {
                status: newStatus,
                statusUpdatedAt: serverTimestamp(),
                manualStatusOverride: true // Flag for manual overrides
            });

            console.log(`Simulation ${simulationId} status manually updated to: ${newStatus}`);
            return { success: true };

        } catch (error) {
            console.error('Error updating simulation status:', error);
            throw error;
        }
    }
}