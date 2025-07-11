// Simple client-side router
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
        window.history.pushState({}, '', path);
        
        // Handle the route
        this.handleRoute(path);
    }

    handleRoute(path) {
        const handler = this.routes.get(path);
        
        if (handler) {
            this.currentRoute = path;
            handler();
        } else {
            // Default to dashboard for unknown routes
            console.warn(`No handler found for route: ${path}`);
            this.navigate('/');
        }
    }

    start() {
        // Handle initial page load
        const currentPath = window.location.pathname;
        this.handleRoute(currentPath);

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            // Check if clicked element is a navigation link
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                const path = e.target.getAttribute('data-navigate');
                this.navigate(path);
            }
        });
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}