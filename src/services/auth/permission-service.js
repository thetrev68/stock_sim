// file: src/services/auth/permission-service.js
// Enhanced permission system supporting creators and system admins

import { getFirestoreDb } from "../firebase.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const USERS_COLLECTION = "Users";

/**
 * User roles in the system
 */
export const SYSTEM_ROLES = {
    USER: "user",           // Regular user
    ADMIN: "admin",         // System administrator
    SUPER_ADMIN: "super_admin" // Super administrator (can manage other admins)
};

/**
 * Simulation-specific roles
 */
export const SIMULATION_ROLES = {
    CREATOR: "creator",     // Created the simulation
    MEMBER: "member"        // Joined the simulation
};

/**
 * Permission service for checking user access rights
 */
export class PermissionService {
    constructor() {
        this.db = null;
        this.userRoleCache = new Map(); // Cache user roles to avoid repeated DB calls
    }

    async initialize() {
        this.db = getFirestoreDb();
    }

    /**
     * Get user's system role from the database
     */
    async getUserSystemRole(userId) {
        if (!userId) return SYSTEM_ROLES.USER;

        // Check cache first
        if (this.userRoleCache.has(userId)) {
            return this.userRoleCache.get(userId);
        }

        try {
            // FIX: Ensure we have a valid database reference
            const database = this.db || getFirestoreDb();
            const userRef = doc(database, USERS_COLLECTION, userId);  // Use 'database' not 'this.db'
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                // User doesn't exist in database, default to regular user
                this.userRoleCache.set(userId, SYSTEM_ROLES.USER);
                return SYSTEM_ROLES.USER;
            }

            const userData = userSnap.data();
            const systemRole = userData.systemRole || SYSTEM_ROLES.USER;
            
            // Cache the result
            this.userRoleCache.set(userId, systemRole);
            return systemRole;

        } catch (error) {
            console.error("Error getting user system role:", error);
            return SYSTEM_ROLES.USER; // Default to regular user on error
        }
    }

    /**
     * Check if user is a system admin
     */
    async isSystemAdmin(userId) {
        const systemRole = await this.getUserSystemRole(userId);
        return systemRole === SYSTEM_ROLES.ADMIN || systemRole === SYSTEM_ROLES.SUPER_ADMIN;
    }

    /**
     * Check if user is a super admin
     */
    async isSuperAdmin(userId) {
        const systemRole = await this.getUserSystemRole(userId);
        return systemRole === SYSTEM_ROLES.SUPER_ADMIN;
    }

    /**
     * Check if user can manage a specific simulation
     * This combines creator permissions + admin permissions
     */
    async canManageSimulation(userId, simulation) {
        if (!userId || !simulation) return false;

        // Check if user is the creator
        const isCreator = simulation.createdBy === userId;
        if (isCreator) return true;

        // Check if user is a system admin
        const isAdmin = await this.isSystemAdmin(userId);
        return isAdmin;
    }

    /**
     * Check if user can view admin features
     */
    async canAccessAdminFeatures(userId) {
        return await this.isSystemAdmin(userId);
    }

    /**
     * Check if user can manage other users (super admin only)
     */
    async canManageUsers(userId) {
        return await this.isSuperAdmin(userId);
    }

    /**
     * Get detailed permission info for a user and simulation
     */
    async getSimulationPermissions(userId, simulation) {
        if (!userId || !simulation) {
            return {
                canView: false,
                canManage: false,
                canManageMembers: false,
                canModifySettings: false,
                canEndEarly: false,
                isCreator: false,
                isAdmin: false,
                accessReason: "no_access"
            };
        }

        const isCreator = simulation.creatorUserId === userId;
        const isAdmin = await this.isSystemAdmin(userId);
        const canManage = isCreator || isAdmin;

        return {
            canView: true, // Anyone can view if they have access to the simulation
            canManage: canManage,
            canManageMembers: canManage,
            canModifySettings: canManage,
            canEndEarly: canManage,
            isCreator: isCreator,
            isAdmin: isAdmin,
            accessReason: isCreator ? "creator" : isAdmin ? "admin" : "member"
        };
    }

    /**
     * Clear role cache (useful after role changes)
     */
    clearCache(userId = null) {
        if (userId) {
            this.userRoleCache.delete(userId);
        } else {
            this.userRoleCache.clear();
        }
    }

    /**
     * Set user system role (for admin management)
     * This would typically be called by super admins
     */
    async setUserSystemRole(targetUserId, newRole, adminUserId) {
        // Verify admin has permission to change roles
        const canManageUsers = await this.canManageUsers(adminUserId);
        if (!canManageUsers) {
            throw new Error("Only super administrators can change user roles");
        }

        if (!Object.values(SYSTEM_ROLES).includes(newRole)) {
            throw new Error("Invalid system role");
        }

        try {
            const userRef = doc(this.db, USERS_COLLECTION, targetUserId);
            await updateDoc(userRef, {
                systemRole: newRole,
                roleUpdatedAt: serverTimestamp(),
                roleUpdatedBy: adminUserId
            });

            // Clear cache for this user
            this.clearCache(targetUserId);
            
            console.log(`User ${targetUserId} role updated to ${newRole} by ${adminUserId}`);
            return { success: true };

        } catch (error) {
            console.error("Error setting user system role:", error);
            throw error;
        }
    }
}

// Export a singleton instance
export const permissionService = new PermissionService();