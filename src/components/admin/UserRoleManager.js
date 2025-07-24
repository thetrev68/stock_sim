// file: src/components/admin/UserRoleManager.js
// Admin interface for managing user system roles

import { permissionService, SYSTEM_ROLES } from "../../services/auth/permission-service.js";
import { getFirestoreDb } from "../../services/firebase.js";
import { 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    // updateDoc, doc, serverTimestamp 
} from "firebase/firestore";
import { logger } from "../../utils/logger.js";

export class UserRoleManager {
    constructor() {
        this.db = null;
        this.currentUser = null;
        this.users = [];
    }

    async initialize(currentUser) {
        this.db = getFirestoreDb();
        this.currentUser = currentUser;
        
        // Verify current user has super admin permissions
        const isSuperAdmin = await permissionService.isSuperAdmin(currentUser.uid);
        if (!isSuperAdmin) {
            throw new Error("Only super administrators can manage user roles");
        }
    }

    /**
     * Load users for role management
     */
    async loadUsers() {
        try {
            const usersQuery = query(
                collection(this.db, "users"),
                orderBy("email", "asc"),
                limit(100) // Limit for performance
            );
            
            const userDocs = await getDocs(usersQuery);
            this.users = [];
            
            userDocs.forEach(doc => {
                const userData = doc.data();
                this.users.push({
                    id: doc.id,
                    email: userData.email,
                    displayName: userData.displayName || userData.email,
                    systemRole: userData.systemRole || SYSTEM_ROLES.USER,
                    createdAt: userData.createdAt,
                    lastLoginAt: userData.lastLoginAt
                });
            });
            
            return this.users;
        } catch (error) {
            logger.error("Error loading users:", error);
            throw error;
        }
    }

    /**
     * Update user system role
     */
    async updateUserRole(targetUserId, newRole) {
        try {
            await permissionService.setUserSystemRole(targetUserId, newRole, this.currentUser.uid);
            
            // Update local cache
            const userIndex = this.users.findIndex(u => u.id === targetUserId);
            if (userIndex !== -1) {
                this.users[userIndex].systemRole = newRole;
            }
            
            return { success: true };
        } catch (error) {
            logger.error("Error updating user role:", error);
            throw error;
        }
    }

    /**
     * Get role badge HTML for display
     */
    getRoleBadgeHTML(role) {
        const roleConfig = {
            [SYSTEM_ROLES.USER]: {
                text: "User",
                color: "bg-gray-600 text-gray-100"
            },
            [SYSTEM_ROLES.ADMIN]: {
                text: "Admin",
                color: "bg-blue-600 text-white"
            },
            [SYSTEM_ROLES.SUPER_ADMIN]: {
                text: "Super Admin",
                color: "bg-red-600 text-white"
            }
        };

        const config = roleConfig[role] || roleConfig[SYSTEM_ROLES.USER];
        return `<span class="px-2 py-1 text-xs font-medium rounded-full ${config.color}">${config.text}</span>`;
    }

    /**
     * Render user management interface
     */
    renderInterface(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-6xl mx-auto p-6">
                <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div class="p-6 border-b border-gray-700">
                        <h2 class="text-2xl font-bold text-white mb-2">User Role Management</h2>
                        <p class="text-gray-400">Manage system-wide user permissions and roles</p>
                    </div>
                    
                    <div class="p-6">
                        <div id="users-loading" class="text-center py-8">
                            <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p class="text-gray-400">Loading users...</p>
                        </div>
                        
                        <div id="users-content" class="hidden">
                            <div class="overflow-x-auto">
                                <table class="min-w-full">
                                    <thead>
                                        <tr class="border-b border-gray-700">
                                            <th class="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                                            <th class="text-left py-3 px-4 text-gray-300 font-medium">Current Role</th>
                                            <th class="text-left py-3 px-4 text-gray-300 font-medium">Last Login</th>
                                            <th class="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="users-table-body" class="divide-y divide-gray-700">
                                        <!-- Users will be rendered here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div id="users-error" class="hidden text-center py-8">
                            <p class="text-red-400 mb-4">Failed to load users</p>
                            <button id="retry-users-btn" class="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg">
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners(container);
        this.loadAndDisplayUsers();
    }

    /**
     * Load and display users
     */
    async loadAndDisplayUsers() {
        const loadingEl = document.getElementById("users-loading");
        const contentEl = document.getElementById("users-content");
        const errorEl = document.getElementById("users-error");

        try {
            if (loadingEl) loadingEl.classList.remove("hidden");
            if (contentEl) contentEl.classList.add("hidden");
            if (errorEl) errorEl.classList.add("hidden");

            await this.loadUsers();
            this.renderUsersTable();

            if (loadingEl) loadingEl.classList.add("hidden");
            if (contentEl) contentEl.classList.remove("hidden");

        } catch (error) {
            logger.error("Error loading users:", error);
            
            if (loadingEl) loadingEl.classList.add("hidden");
            if (errorEl) errorEl.classList.remove("hidden");
        }
    }

    /**
     * Render users table
     */
    renderUsersTable() {
        const tbody = document.getElementById("users-table-body");
        if (!tbody) return;

        tbody.innerHTML = "";

        this.users.forEach(user => {
            const row = document.createElement("tr");
            row.className = "hover:bg-gray-700/50";
            
            const lastLogin = user.lastLoginAt ? 
                new Date(user.lastLoginAt.toDate()).toLocaleDateString() : 
                "Never";

            row.innerHTML = `
                <td class="py-3 px-4">
                    <div>
                        <div class="text-white font-medium">${user.displayName}</div>
                        <div class="text-gray-400 text-sm">${user.email}</div>
                    </div>
                </td>
                <td class="py-3 px-4">
                    ${this.getRoleBadgeHTML(user.systemRole)}
                </td>
                <td class="py-3 px-4 text-gray-300">${lastLogin}</td>
                <td class="py-3 px-4">
                    <select 
                        class="role-select bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-1"
                        data-user-id="${user.id}"
                        ${user.id === this.currentUser.uid ? "disabled" : ""}
                    >
                        <option value="${SYSTEM_ROLES.USER}" ${user.systemRole === SYSTEM_ROLES.USER ? "selected" : ""}>User</option>
                        <option value="${SYSTEM_ROLES.ADMIN}" ${user.systemRole === SYSTEM_ROLES.ADMIN ? "selected" : ""}>Admin</option>
                        <option value="${SYSTEM_ROLES.SUPER_ADMIN}" ${user.systemRole === SYSTEM_ROLES.SUPER_ADMIN ? "selected" : ""}>Super Admin</option>
                    </select>
                    ${user.id === this.currentUser.uid ? "<span class=\"text-gray-500 text-xs ml-2\">(You)</span>" : ""}
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners(container) {
        // Retry button
        const retryBtn = container.querySelector("#retry-users-btn");
        if (retryBtn) {
            retryBtn.addEventListener("click", () => this.loadAndDisplayUsers());
        }

        // Role select changes (use delegation since rows are added dynamically)
        container.addEventListener("change", async (e) => {
            if (e.target.classList.contains("role-select")) {
                const userId = e.target.dataset.userId;
                const newRole = e.target.value;
                const originalRole = this.users.find(u => u.id === userId)?.systemRole;

                if (newRole !== originalRole) {
                    await this.handleRoleChange(userId, newRole, originalRole, e.target);
                }
            }
        });
    }

    /**
     * Handle role change
     */
    async handleRoleChange(userId, newRole, originalRole, selectElement) {
        const confirmed = confirm(
            `Are you sure you want to change this user's role to ${newRole}?\n\n` +
            `This will ${newRole === SYSTEM_ROLES.ADMIN ? "grant admin access to all simulations" : 
             newRole === SYSTEM_ROLES.SUPER_ADMIN ? "grant super admin access (can manage other admins)" : 
             "remove admin privileges"}.`
        );


        if (!confirmed) {
            selectElement.value = originalRole;
            return;
        }

        try {
            selectElement.disabled = true;
            
            await this.updateUserRole(userId, newRole);
            
            // Update the role badge
            const row = selectElement.closest("tr");
            const roleBadgeCell = row.querySelector("td:nth-child(2)");
            if (roleBadgeCell) {
                roleBadgeCell.innerHTML = this.getRoleBadgeHTML(newRole);
            }

            // Show success message
            this.showMessage(`User role updated to ${newRole}`, "success");

        } catch (error) {
            // Revert the select value
            selectElement.value = originalRole;
            this.showMessage(`Failed to update role: ${error.message}`, "error");
        } finally {
            selectElement.disabled = false;
        }
    }

    /**
     * Show temporary message
     */
    showMessage(message, type = "info") {
        const messageEl = document.createElement("div");
        messageEl.className = `fixed top-4 right-4 z-50 p-4 rounded-lg max-w-md ${
            type === "error" ? "bg-red-600 text-white" : 
            type === "success" ? "bg-green-600 text-white" : 
            "bg-blue-600 text-white"
        }`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }
}