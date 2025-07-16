// Simple client-side router with query parameter support
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
    }

    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(path) {
        // Update browser history
        window.history.pushState({}, "", path);
        
        // Handle the route
        this.handleRoute(path);
    }

    handleRoute(path) {
        // Extract the base path without query parameters
        const basePath = path.split("?")[0];
        const handler = this.routes.get(basePath);
        
        if (handler) {
            this.currentRoute = basePath;
            handler();
        } else {
            // Default to dashboard for unknown routes
            console.warn(`No handler found for route: ${path} (base path: ${basePath})`);
            this.navigate("/");
        }
    }

    start() {
        // Handle initial page load
        const currentPath = window.location.pathname + window.location.search;
        this.handleRoute(currentPath);

        // Handle browser back/forward buttons
        window.addEventListener("popstate", () => {
            const currentPath = window.location.pathname + window.location.search;
            this.handleRoute(currentPath);
        });

        // Handle navigation clicks
        document.addEventListener("click", (e) => {
            // Check if clicked element is a navigation link
            if (e.target.matches("[data-navigate]")) {
                e.preventDefault();
                const path = e.target.getAttribute("data-navigate");
                this.navigate(path);
            }
        });
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}