// Main application entry point
import './style.css'; // Import global styles
import { initializeApp } from './services/firebase.js';
import { Router } from './utils/router.js';
import { AuthService } from './services/auth.js';
import { HeaderComponent } from './components/layout/Header.js';
import { NavigationComponent } from './components/layout/Navigation.js';

class App {
    constructor() {
        this.router = new Router();
        this.authService = new AuthService();
        this.currentUser = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Initialize Firebase
            await initializeApp();
            console.log('Firebase initialized');

            // Initialize components
            this.setupComponents();

            // Setup auth state listener
            this.authService.onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });

            // Setup router
            this.setupRouting();

            // Hide loading, show app
            this.showApp();

            this.isInitialized = true;
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application');
        }
    }

    setupComponents() {
        // Initialize header component
        const header = new HeaderComponent();
        header.render(document.getElementById('header'));

        // Initialize navigation component
        const navigation = new NavigationComponent();
        navigation.render(document.getElementById('navigation'));
    }

    setupRouting() {
        // Define routes
        this.router.addRoute('/', () => this.loadView('dashboard'));
        this.router.addRoute('/trade', () => this.loadView('trade'));
        this.router.addRoute('/portfolio', () => this.loadView('portfolio'));
        this.router.addRoute('/research', () => this.loadView('research'));
        this.router.addRoute('/auth', () => this.loadView('auth'));

        // Start router
        this.router.start();
    }

    async loadView(viewName) {
        try {
            const mainContent = document.getElementById('main-content');
            
            // Show loading in main content
            mainContent.innerHTML = `
                <div class="flex items-center justify-center py-12">
                    <div class="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            `;

            // Dynamically import and render view
            const viewModule = await import(`./views/${viewName}.js`);
            const ViewClass = viewModule.default;
            const view = new ViewClass();
            
            await view.render(mainContent);
            
            // Update navigation active state
            this.updateNavigationActive(viewName);
            
        } catch (error) {
            console.error(`Failed to load view ${viewName}:`, error);
            document.getElementById('main-content').innerHTML = `
                <div class="bg-red-900/20 border border-red-500 rounded-lg p-6">
                    <h2 class="text-xl font-semibold text-red-400 mb-2">Error Loading View</h2>
                    <p class="text-gray-300">Failed to load ${viewName}. Please try again.</p>
                </div>
            `;
        }
    }

    updateNavigationActive(viewName) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('nav-link-active');
        });

        // Add active class to current view
        const activeLink = document.querySelector(`[data-route="${viewName}"]`);
        if (activeLink) {
            activeLink.classList.add('nav-link-active');
        }
    }

    handleAuthStateChange(user) {
        this.currentUser = user;
        
        if (!this.isInitialized) return;

        if (user) {
            console.log('User signed in:', user.email);
            // Redirect to dashboard if on auth page
            if (window.location.pathname === '/auth') {
                this.router.navigate('/');
            }
        } else {
            console.log('User signed out');
            // Redirect to auth page if not already there
            if (window.location.pathname !== '/auth') {
                this.router.navigate('/auth');
            }
        }

        // Update header to show/hide user info
        const headerComponent = document.querySelector('#header .header-component');
        if (headerComponent) {
            headerComponent.updateAuthState(user);
        }
    }

    showApp() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
    }

    showError(message) {
        document.getElementById('loading').innerHTML = `
            <div class="text-center">
                <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <p class="text-red-400 font-semibold">${message}</p>
                <button onclick="window.location.reload()" class="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition">
                    Retry
                </button>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
    
    // Make app globally available for debugging
    window.app = app;
});