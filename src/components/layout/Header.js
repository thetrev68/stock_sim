// Header component
import { logger } from "../../utils/logger.js";

export class HeaderComponent {
    constructor() {
        this.currentUser = null;
    }

    render(container) {
        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
    }

    getTemplate() {
        return `
            <div class="header-component flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4 px-4 sm:px-0">
                <div>
                    <h1 class="text-3xl font-bold text-cyan-400">Stock Trading Simulator</h1>
                    <p class="text-gray-400">Master the markets with zero risk</p>
                </div>
                
                <div class="flex items-center space-x-4">
                    <!-- Connection status -->
                    <div id="status-indicator" class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                        <span class="text-gray-400 text-sm">Connected</span>
                    </div>
                    
                    <!-- User menu (shown when logged in) -->
                    <div id="user-menu" class="hidden">
                        <div class="flex items-center space-x-3">
                            <span id="user-email" class="text-sm text-gray-300"></span>
                            <button id="sign-out-btn" class="text-sm text-red-500 hover:text-red-400 transition font-medium">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        const signOutBtn = container.querySelector("#sign-out-btn");
        if (signOutBtn) {
            signOutBtn.addEventListener("click", this.handleSignOut.bind(this));
        }
    }

    async handleSignOut() {
        try {
            // Import auth service dynamically to avoid circular dependencies
            const { AuthService } = await import("../../services/auth.js");
            const authService = new AuthService();
            await authService.signOut();
        } catch (error) {
            logger.error("Sign out error:", error);
        }
    }

    updateAuthState(user) {
        this.currentUser = user;
        const userMenu = document.getElementById("user-menu");
        const userEmail = document.getElementById("user-email");

        if (user && userMenu && userEmail) {
            userEmail.textContent = user.email;
            userMenu.classList.remove("hidden");
        } else if (userMenu) {
            userMenu.classList.add("hidden");
        }
    }

    updateStatus(text, colorClass = "bg-green-500") {
        const statusIndicator = document.getElementById("status-indicator");
        if (statusIndicator) {
            const dot = statusIndicator.querySelector("div");
            const span = statusIndicator.querySelector("span");
            
            if (dot) dot.className = `w-3 h-3 rounded-full ${colorClass}`;
            if (span) span.textContent = text;
        }
    }
}