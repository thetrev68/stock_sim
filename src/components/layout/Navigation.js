// Navigation component
export class NavigationComponent {
    constructor() {
        this.routes = [
            { path: '/', label: 'Dashboard', route: 'dashboard' },
            { path: '/portfolio', label: 'Portfolio', route: 'portfolio' },
            { path: '/trade', label: 'Trade', route: 'trade' },
            { path: '/research', label: 'Research', route: 'research' }
        ];
    }

    render(container) {
        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
    }

    getTemplate() {
        const navItems = this.routes.map(route => `
            <button 
                class="nav-link py-3 px-6 text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white border-b-2 border-transparent transition-all duration-300 rounded-t-lg"
                data-navigate="${route.path}"
                data-route="${route.route}"
            >
                ${route.label}
            </button>
        `).join('');

        return `
            <nav class="flex border-b border-gray-700 mb-8 overflow-x-auto">
                ${navItems}
            </nav>
        `;
    }

    attachEventListeners(container) {
        // Event delegation is handled by the router in main.js
        // No additional listeners needed here
    }

    setActiveRoute(routeName) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('nav-link-active');
        });

        // Add active class to current route
        const activeLink = document.querySelector(`[data-route="${routeName}"]`);
        if (activeLink) {
            activeLink.classList.add('nav-link-active');
        }
    }
}