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
import { SIMULATION_STATUS } from '../constants/simulation-status.js';

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
     * Calculate real-time status based on dates - Enhanced to respect all manual overrides
     */
    calculateRealTimeStatus(simulation) {
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

        if (now > endDate) {
            return SIMULATION_STATUS.ENDED;
        } else if (now >= startDate) {
            return SIMULATION_STATUS.ACTIVE;
        } else {
            return SIMULATION_STATUS.PENDING;
        }
    }

    /**
     * End a simulation early (admin only) - Enhanced with debugging and activity logging
     */
    async endSimulationEarly(simulationId, adminUserId, reason = '') {
        this.db = this.db || getFirestoreDb();

        try {
            console.log(`Attempting to end simulation ${simulationId} early by ${adminUserId}`);
            
            // Verify admin permissions
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            console.log('Current simulation status:', simulation.status);
            console.log('Simulation creator:', simulation.createdBy);
            console.log('Admin user:', adminUserId);
            
            if (simulation.createdBy !== adminUserId) {
                throw new Error('Only simulation creator can end simulation');
            }

            if (simulation.status === SIMULATION_STATUS.ENDED) {
                throw new Error('Simulation is already ended');
            }

            console.log('Updating simulation status to ended...');
            
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
            console.log('Simulation status updated successfully');

            // Log admin activity
            try {
                const { ActivityService } = await import('./activity.js');
                const activityService = new ActivityService();
                activityService.initialize();
                
                // Get admin display name
                const { getFirebaseAuth } = await import('./firebase.js');
                const auth = getFirebaseAuth();
                const adminDisplayName = auth.currentUser?.displayName || auth.currentUser?.email || 'Admin';
                
                console.log('Logging admin activity...');
                
                // Log custom admin activity
                await activityService.logAchievementActivity(simulationId, adminUserId, adminDisplayName, {
                    milestone: 'simulation_ended_early',
                    value: 0,
                    rank: null,
                    reason: reason
                });
                
                console.log('Admin activity logged successfully');
                
            } catch (activityError) {
                console.error('Error logging admin activity (non-fatal):', activityError);
            }

            console.log(`Simulation ${simulationId} ended early by ${adminUserId} successfully`);
            return { success: true };

        } catch (error) {
            console.error('Error ending simulation early:', error);
            throw error;
        }
    }

    /**
     * Extend simulation duration (admin only)
     */
    async extendSimulation(simulationId, adminUserId, newEndDate, reason = '') {
        this.db = this.db || getFirestoreDb();

        try {
            // Verify admin permissions
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            if (simulation.createdBy !== adminUserId) {
                throw new Error('Only simulation creator can extend simulation');
            }

            if (simulation.status === SIMULATION_STATUS.ENDED) {
                throw new Error('Cannot extend an ended simulation');
            }

            // Validate new end date
            const currentEndDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
            const extensionDate = new Date(newEndDate);
            
            if (extensionDate <= currentEndDate) {
                throw new Error('New end date must be after current end date');
            }

            if (extensionDate <= new Date()) {
                throw new Error('New end date must be in the future');
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
            console.error('Error extending simulation:', error);
            throw error;
        }
    }

    /**
     * Update simulation settings (admin only)
     */
    async updateSimulationSettings(simulationId, adminUserId, settings) {
        this.db = this.db || getFirestoreDb();

        try {
            // Verify admin permissions
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            if (simulation.createdBy !== adminUserId) {
                throw new Error('Only simulation creator can update settings');
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
                return { success: true, changes: Object.keys(updateData).filter(k => !k.includes('At') && k !== 'updatedBy') };
            } else {
                return { success: true, changes: [] };
            }

        } catch (error) {
            console.error('Error updating simulation settings:', error);
            throw error;
        }
    }

    /**
     * Get simulation management statistics
     */
    async getSimulationManagementStats(simulationId, adminUserId) {
        this.db = this.db || getFirestoreDb();

        try {
            // Verify admin permissions
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            if (simulation.createdBy !== adminUserId) {
                throw new Error('Only simulation creator can view management stats');
            }

            // Get member statistics
            const memberQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where('simulationId', '==', simulationId)
            );
            const memberDocs = await getDocs(memberQuery);

            const activeMembers = memberDocs.docs.filter(doc => doc.data().status === SIMULATION_STATUS.ACTIVE).length;
            const removedMembers = memberDocs.docs.filter(doc => doc.data().status === 'removed').length;
            const totalJoined = memberDocs.docs.length;

            // Get activity statistics
            let totalTrades = 0;
            let totalVolume = 0;
            
            try {
                const { ActivityService } = await import('./activity.js');
                const activityService = new ActivityService();
                activityService.initialize();
                const activities = await activityService.getSimulationActivities(simulationId, 1000);
                
                const tradeActivities = activities.filter(a => a.action === 'executed_trade');
                totalTrades = tradeActivities.length;
                totalVolume = tradeActivities.reduce((sum, activity) => sum + (activity.data.amount || 0), 0);
            } catch (error) {
                console.warn('Could not load activity stats:', error);
            }

            // Calculate time statistics
            const now = new Date();
            const startDate = simulation.startDate.toDate ? simulation.startDate.toDate() : new Date(simulation.startDate);
            const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
            const originalEndDate = simulation.originalEndDate ? 
                (simulation.originalEndDate.toDate ? simulation.originalEndDate.toDate() : new Date(simulation.originalEndDate)) : 
                null;

            const totalDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const daysElapsed = Math.max(0, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
            const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

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
            console.error('Error getting simulation management stats:', error);
            throw error;
        }
    }

    /**
     * Archive a completed simulation with final results
     */
    async archiveSimulation(simulationId, adminUserId, finalLeaderboard = null) {
        this.db = this.db || getFirestoreDb();

        try {
            // Verify admin permissions and get simulation
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            if (simulation.createdBy !== adminUserId) {
                throw new Error('Only simulation creator can archive simulation');
            }

            if (simulation.status !== SIMULATION_STATUS.ENDED) {
                throw new Error('Only ended simulations can be archived');
            }

            // Get final leaderboard if not provided
            if (!finalLeaderboard) {
                try {
                    const { LeaderboardService } = await import('./leaderboard.js');
                    const leaderboardService = new LeaderboardService();
                    leaderboardService.initialize();
                    finalLeaderboard = await leaderboardService.getLeaderboard(simulationId, true, simulation);
                } catch (error) {
                    console.warn('Could not generate final leaderboard for archive:', error);
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
            const archiveRef = await addDoc(collection(this.db, 'simulationArchives'), archiveData);

            // Update original simulation with archive reference
            await updateDoc(simRef, {
                archived: true,
                archiveId: archiveRef.id,
                archivedAt: serverTimestamp()
            });

            console.log(`Simulation ${simulationId} archived successfully with ID: ${archiveRef.id}`);
            return { success: true, archiveId: archiveRef.id };

        } catch (error) {
            console.error('Error archiving simulation:', error);
            throw error;
        }
    }

    /**
     * Get archived simulation results
     */
    async getArchivedSimulation(archiveId) {
        this.db = this.db || getFirestoreDb();

        try {
            const archiveRef = doc(this.db, 'simulationArchives', archiveId);
            const archiveSnap = await getDoc(archiveRef);

            if (!archiveSnap.exists()) {
                return null;
            }

            return {
                id: archiveId,
                ...archiveSnap.data()
            };

        } catch (error) {
            console.error('Error getting archived simulation:', error);
            throw error;
        }
    }

    /**
     * Get user's archived simulations
     */
    async getUserArchivedSimulations(userId) {
        this.db = this.db || getFirestoreDb();

        try {
            // Get archives where user was the creator
            const creatorArchivesQuery = query(
                collection(this.db, 'simulationArchives'),
                where('archivedBy', '==', userId),
                orderBy('archivedAt', 'desc')
            );
            const creatorArchives = await getDocs(creatorArchivesQuery);

            // Get simulations where user was a member (check original member records)
            const memberQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where('userId', '==', userId)
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
                        collection(this.db, 'simulationArchives'),
                        where('simulationId', 'in', batch)
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
                    userRole: 'creator'
                });
            });

            // Add participant archives (mark role appropriately)
            participantArchives.forEach(doc => {
                const existing = allArchives.get(doc.id);
                if (!existing) {
                    allArchives.set(doc.id, {
                        id: doc.id,
                        ...doc.data(),
                        userRole: 'participant'
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
            console.error('Error getting user archived simulations:', error);
            throw error;
        }
    }

    /**
     * Export simulation results to downloadable format
     */
    generateSimulationExport(archivedSimulation) {
        try {
            const sim = archivedSimulation.originalSimulation;
            const results = archivedSimulation.finalResults;
            
            const exportData = {
                simulationInfo: {
                    name: sim.name,
                    description: sim.description || '',
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
                exportVersion: '1.0'
            };

            return exportData;

        } catch (error) {
            console.error('Error generating simulation export:', error);
            throw error;
        }
    }

    /**
     * Force refresh simulation status from dates (fixes status sync issues) - Enhanced debugging
     */
    async refreshSimulationStatus(simulationId) {
        this.db = this.db || getFirestoreDb();

        try {
            console.log(`Refreshing status for simulation ${simulationId}...`);
            
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            console.log('Current stored status:', simulation.status);
            console.log('Manual status override:', simulation.manualStatusOverride);
            
            // If there's a manual override (like admin ending early), respect it
            if (simulation.manualStatusOverride && simulation.status === SIMULATION_STATUS.ENDED) {
                console.log('Manual override detected, keeping ended status');
                return { updated: false, status: simulation.status, reason: 'manual_override' };
            }
            
            // Calculate what the status should be based on current time
            const realTimeStatus = this.calculateRealTimeStatus(simulation);
            console.log('Calculated real-time status:', realTimeStatus);
            
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
            
            console.log('No status update needed');
            return { updated: false, status: realTimeStatus };

        } catch (error) {
            console.error('Error refreshing simulation status:', error);
            throw error;
        }
    }

    /**
     * Update simulation status if it has changed - Enhanced to respect manual endings
     */
    async updateSimulationStatusIfNeeded(simulationId, currentStoredStatus, calculatedStatus) {
        // CRITICAL FIX: Don't auto-update if simulation was manually ended
        const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
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
                status: initialStatus, // Use calculated status instead of hardcoded SIMULATION_STATUS.PENDING
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
                where('status', '==', SIMULATION_STATUS.ACTIVE)
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
                status: SIMULATION_STATUS.ACTIVE
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
            if (realTimeStatus === SIMULATION_STATUS.ENDED) {
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
                where('status', '==', SIMULATION_STATUS.ACTIVE)
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
                where('status', '==', SIMULATION_STATUS.ACTIVE),
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
                where('status', '==', SIMULATION_STATUS.ACTIVE)
            );
            const memberDocs = await getDocs(memberQuery);

            return !memberDocs.empty;

        } catch (error) {
            console.error('Error checking simulation membership:', error);
            return false;
        }
    }

    /**
     * Remove a member from a simulation (admin only)
     */
    async removeMemberFromSimulation(simulationId, userId, adminUserId) {
        this.db = this.db || getFirestoreDb();

        try {
            // Verify admin is the creator
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            if (simulation.createdBy !== adminUserId) {
                throw new Error('Only simulation creator can remove members');
            }

            // Prevent creator from removing themselves
            if (userId === adminUserId) {
                throw new Error('Creator cannot remove themselves from simulation');
            }

            // Find and update the member record
            const memberQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where('simulationId', '==', simulationId),
                where('userId', '==', userId),
                where('status', '==', SIMULATION_STATUS.ACTIVE)
            );
            const memberDocs = await getDocs(memberQuery);

            if (memberDocs.empty) {
                throw new Error('Member not found in simulation');
            }

            const memberDoc = memberDocs.docs[0];
            
            // Update member status to 'removed'
            await updateDoc(memberDoc.ref, {
                status: 'removed',
                removedAt: serverTimestamp(),
                removedBy: adminUserId
            });

            // Update simulation member count
            await updateDoc(simRef, {
                memberCount: simulation.memberCount - 1
            });

            console.log(`User ${userId} removed from simulation ${simulationId} by ${adminUserId}`);
            return { success: true };

        } catch (error) {
            console.error('Error removing member from simulation:', error);
            throw error;
        }
    }

    /**
     * Get detailed member statistics for admin view
     */
    async getMemberStatistics(simulationId, adminUserId) {
        this.db = this.db || getFirestoreDb();

        try {
            // Verify admin permissions
            const simRef = doc(this.db, SIMULATIONS_COLLECTION, simulationId);
            const simSnap = await getDoc(simRef);
            
            if (!simSnap.exists()) {
                throw new Error('Simulation not found');
            }

            const simulation = simSnap.data();
            if (simulation.createdBy !== adminUserId) {
                throw new Error('Only simulation creator can view detailed statistics');
            }

            // Get all members (active and removed)
            const memberQuery = query(
                collection(this.db, SIMULATION_MEMBERS_COLLECTION),
                where('simulationId', '==', simulationId),
                orderBy('joinedAt', 'asc')
            );
            const memberDocs = await getDocs(memberQuery);

            const memberStats = [];

            for (const memberDoc of memberDocs.docs) {
                const member = memberDoc.data();
                
                // Get portfolio data if member is active
                let portfolioData = null;
                if (member.status === SIMULATION_STATUS.ACTIVE) {
                    try {
                        const { getPortfolio } = await import('./trading.js');
                        portfolioData = await getPortfolio(member.userId, simulationId);
                    } catch (error) {
                        console.warn(`Could not load portfolio for ${member.userId}:`, error);
                    }
                }

                // Get activity count
                let activityCount = 0;
                try {
                    const { ActivityService } = await import('./activity.js');
                    const activityService = new ActivityService();
                    activityService.initialize();
                    const activities = await activityService.getUserActivities(simulationId, member.userId, 100);
                    activityCount = activities.length;
                } catch (error) {
                    console.warn(`Could not load activities for ${member.userId}:`, error);
                }

                memberStats.push({
                    ...member,
                    memberId: memberDoc.id,
                    portfolioValue: portfolioData ? (portfolioData.cash + this.calculateHoldingsValue(portfolioData.holdings)) : 0,
                    totalTrades: portfolioData ? (portfolioData.trades?.length || 0) : 0,
                    activityCount,
                    portfolioCash: portfolioData?.cash || 0,
                    holdingsCount: portfolioData ? Object.keys(portfolioData.holdings || {}).length : 0
                });
            }

            return memberStats;

        } catch (error) {
            console.error('Error getting member statistics:', error);
            throw error;
        }
    }

    /**
     * Helper method to calculate holdings value
     */
    calculateHoldingsValue(holdings) {
        if (!holdings) return 0;
        
        let total = 0;
        for (const ticker in holdings) {
            if (holdings.hasOwnProperty(ticker)) {
                total += holdings[ticker].quantity * holdings[ticker].avgPrice;
            }
        }
        return total;
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