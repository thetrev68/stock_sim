// PWA utilities for Stock Trading Simulator - Linting fixes applied
export class PWAManager {
    constructor() {
        this.isStandalone = false;
        this.deferredPrompt = null;
        this.serviceWorkerRegistration = null;
        this.autoHideTimer = null; // Add timer property
    }

    async initialize() {
        this.checkStandaloneMode();
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupAppUpdates();
    }

    checkStandaloneMode() {
        // Check if app is running in standalone mode
        this.isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
                           window.navigator.standalone === true;
        
        if (this.isStandalone) {
            console.log("PWA: Running in standalone mode");
            document.body.classList.add("standalone-mode");
        }
    }

    async registerServiceWorker() {
        if ("serviceWorker" in navigator) {
            try {
                console.log("PWA: Registering service worker...");
                
                this.serviceWorkerRegistration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/"
                });
                
                console.log("PWA: Service worker registered successfully");
                
                // Listen for updates
                this.serviceWorkerRegistration.addEventListener("updatefound", () => {
                    console.log("PWA: New service worker version found");
                    this.handleServiceWorkerUpdate();
                });
                
                // Check for existing service worker updates
                if (this.serviceWorkerRegistration.waiting) {
                    this.showUpdateAvailable();
                }
                
            } catch (error) {
                console.error("PWA: Service worker registration failed:", error);
            }
        } else {
            console.log("PWA: Service workers not supported");
        }
    }

    setupInstallPrompt() {
        // Listen for the beforeinstallprompt event
        window.addEventListener("beforeinstallprompt", (event) => {
            console.log("PWA: Install prompt available");
            
            // Prevent the mini-infobar from appearing
            event.preventDefault();
            
            // Save the event for later use
            this.deferredPrompt = event;
            
            // Show custom install button
            this.showInstallButton();
        });

        // Listen for app installation
        window.addEventListener("appinstalled", () => {
            console.log("PWA: App was installed");
            this.hideInstallButton();
            this.deferredPrompt = null;
            
            // Track installation analytics (if gtag is available)
            if (typeof window.gtag === "function") {
                window.gtag("event", "pwa_install", {
                    event_category: "PWA",
                    event_label: "Stock Trading Simulator"
                });
            }
        });
    }

    async showInstallPrompt() {
        if (!this.deferredPrompt) {
            console.log("PWA: No install prompt available");
            return false;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user's response
            const choiceResult = await this.deferredPrompt.userChoice;
            
            console.log("PWA: Install prompt result:", choiceResult.outcome);
            
            if (choiceResult.outcome === "accepted") {
                console.log("PWA: User accepted the install prompt");
            } else {
                console.log("PWA: User dismissed the install prompt");
            }
            
            // Clear the deferredPrompt
            this.deferredPrompt = null;
            this.hideInstallButton();
            
            return choiceResult.outcome === "accepted";
            
        } catch (error) {
            console.error("PWA: Error showing install prompt:", error);
            return false;
        }
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        let installButton = document.getElementById("pwa-install-button");
        
        if (!installButton) {
            installButton = document.createElement("button");
            installButton.id = "pwa-install-button";
            
            // Use inline styles to ensure color override
            installButton.style.cssText = `
                position: fixed;
                bottom: 1rem;
                right: 1rem;
                z-index: 50;
                background: linear-gradient(135deg, #16a34a, #15803d);
                color: white;
                font-weight: bold;
                padding: 0.75rem 1.5rem;
                border-radius: 9999px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                transform: scale(1);
                border: 2px solid #22c55e;
                cursor: pointer;
                font-family: inherit;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            `;
            
            installButton.innerHTML = `
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                </svg>
                Install App
            `;
            
            // Hover effects
            installButton.addEventListener("mouseenter", () => {
                installButton.style.background = "linear-gradient(135deg, #15803d, #166534)";
                installButton.style.transform = "scale(1.05)";
                if (this.autoHideTimer) {
                    clearTimeout(this.autoHideTimer);
                    this.startAutoHideTimer();
                }
            });
            
            installButton.addEventListener("mouseleave", () => {
                installButton.style.background = "linear-gradient(135deg, #16a34a, #15803d)";
                if (installButton.style.opacity !== "0.3") {
                    installButton.style.transform = "scale(1)";
                }
            });
            
            // Auto-hide functionality
            installButton.addEventListener("click", () => {
                this.showInstallPrompt();
            });
            
            // Hide on click outside
            document.addEventListener("click", (event) => {
                if (!installButton.contains(event.target)) {
                    this.startAutoHideTimer();
                }
            });
            
            // Hide on route changes
            window.addEventListener("popstate", () => {
                this.hideInstallButton();
            });
            
            // Hide on hash changes (for SPA navigation)
            window.addEventListener("hashchange", () => {
                this.hideInstallButton();
            });
            
            document.body.appendChild(installButton);
            
            // Auto-hide after 10 seconds
            this.startAutoHideTimer();
        }
        
        installButton.style.display = "flex";
        installButton.style.opacity = "1";
    }

    startAutoHideTimer() {
        // Clear any existing timer
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
        }
        
        // Set new timer to hide after 10 seconds
        this.autoHideTimer = setTimeout(() => {
            this.fadeOutInstallButton();
        }, 10000);
    }

    fadeOutInstallButton() {
        const installButton = document.getElementById("pwa-install-button");
        if (installButton) {
            installButton.style.opacity = "0.3";
            installButton.style.transform = "scale(0.8)";
            
            // Show on hover
            installButton.addEventListener("mouseenter", () => {
                installButton.style.opacity = "1";
                installButton.style.transform = "scale(1.05)";
                this.startAutoHideTimer(); // Restart timer on interaction
            });
            
            installButton.addEventListener("mouseleave", () => {
                installButton.style.opacity = "0.3";
                installButton.style.transform = "scale(0.8)";
            });
        }
    }

    hideInstallButton() {
        const installButton = document.getElementById("pwa-install-button");
        if (installButton) {
            installButton.style.display = "none";
        }
        
        // Clear auto-hide timer
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
    }

    handleServiceWorkerUpdate() {
        const newWorker = this.serviceWorkerRegistration.installing;
        
        newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("PWA: New service worker installed, update available");
                this.showUpdateAvailable();
            }
        });
    }

    showUpdateAvailable() {
        // Don't show if banner already exists
        if (document.getElementById("pwa-update-banner")) {
            return;
        }
        
        // Create update notification
        const updateBanner = document.createElement("div");
        updateBanner.id = "pwa-update-banner";
        updateBanner.className = "fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 transform -translate-y-full transition-transform duration-300";
        updateBanner.innerHTML = `
            <div class="flex items-center justify-between max-w-7xl mx-auto">
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <span>A new version of the app is available!</span>
                </div>
                <div class="flex items-center space-x-4">
                    <button id="pwa-update-button" class="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">
                        Update Now
                    </button>
                    <button id="pwa-dismiss-update" class="text-white hover:text-gray-200 transition">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
        
        // Animate in
        setTimeout(() => {
            updateBanner.classList.remove("-translate-y-full");
        }, 100);
        
        // Setup event listeners
        document.getElementById("pwa-update-button").addEventListener("click", () => {
            this.applyUpdate();
        });
        
        document.getElementById("pwa-dismiss-update").addEventListener("click", () => {
            this.hideUpdateBanner();
        });
        
        // Auto-dismiss after 10 seconds if no action
        setTimeout(() => {
            if (document.getElementById("pwa-update-banner")) {
                this.hideUpdateBanner();
            }
        }, 10000);
    }

    hideUpdateBanner() {
        const banner = document.getElementById("pwa-update-banner");
        if (banner) {
            banner.classList.add("-translate-y-full");
            setTimeout(() => banner.remove(), 300);
        }
    }

    async applyUpdate() {
        if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.waiting) {
            // Tell the waiting service worker to become active
            this.serviceWorkerRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
            
            // Reload the page to get the new version
            window.location.reload();
        } else {
            // No actual update available, just dismiss the banner
            console.log("PWA: No actual update available, dismissing banner");
            this.hideUpdateBanner();
        }
    }

    setupAppUpdates() {
        // Listen for service worker controller changes
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            console.log("PWA: Service worker controller changed, reloading...");
            window.location.reload();
        });
    }

    // Utility methods for app state
    isInstalled() {
        return this.isStandalone;
    }

    canInstall() {
        return this.deferredPrompt !== null;
    }

    // Enable background sync for offline actions
    async requestBackgroundSync(tag) {
        if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register(tag);
                console.log("PWA: Background sync registered:", tag);
                return true;
            } catch (syncError) {
                console.error("PWA: Background sync registration failed:", syncError);
                return false;
            }
        }
        return false;
    }
}

// Export a singleton instance
export const pwaManager = new PWAManager();