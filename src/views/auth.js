// Authentication view
import { AuthService } from '../services/auth.js';

export default class AuthView {
    constructor() {
        this.name = 'auth';
        this.authService = new AuthService();
        this.isSignUp = false;
    }

    async render(container) {
        container.innerHTML = this.getTemplate();
        this.attachEventListeners(container);
    }

    getTemplate() {
        return `
            <div class="auth-view min-h-screen flex items-center justify-center">
                <div class="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-bold text-cyan-400 mb-2">Paper Trading Simulator</h1>
                        <p class="text-gray-400">Sign in to start trading</p>
                    </div>

                    <!-- Auth Form -->
                    <form id="auth-form" class="space-y-6">
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                required
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder="Enter your email"
                            >
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                required
                                minlength="6"
                                class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                                placeholder="Enter your password"
                            >
                        </div>

                        <!-- Error message -->
                        <div id="auth-error" class="hidden bg-red-900/20 border border-red-500 rounded-lg p-3">
                            <p class="text-red-400 text-sm"></p>
                        </div>

                        <!-- Submit button -->
                        <button 
                            type="submit" 
                            id="auth-submit-btn"
                            class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                        >
                            <span id="auth-submit-text">Sign In</span>
                            <div id="auth-loading" class="hidden">
                                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        </button>
                    </form>

                    <!-- Divider -->
                    <div class="my-6 flex items-center">
                        <div class="flex-1 border-t border-gray-600"></div>
                        <span class="px-4 text-gray-400 text-sm">or</span>
                        <div class="flex-1 border-t border-gray-600"></div>
                    </div>

                    <!-- Google Sign In -->
                    <button 
                        id="google-signin-btn"
                        class="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                    >
                        <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>

                    <!-- Toggle Sign Up / Sign In -->
                    <div class="mt-6 text-center">
                        <button 
                            id="toggle-auth-mode" 
                            class="text-cyan-400 hover:text-cyan-300 text-sm transition"
                        >
                            <span id="toggle-text">Don't have an account? Sign up</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        const form = container.querySelector('#auth-form');
        const googleBtn = container.querySelector('#google-signin-btn');
        const toggleBtn = container.querySelector('#toggle-auth-mode');

        form.addEventListener('submit', this.handleEmailAuth.bind(this));
        googleBtn.addEventListener('click', this.handleGoogleAuth.bind(this));
        toggleBtn.addEventListener('click', this.toggleAuthMode.bind(this));
    }

    async handleEmailAuth(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        this.setLoading(true);
        this.hideError();

        try {
            if (this.isSignUp) {
                await this.authService.createAccount(email, password);
            } else {
                await this.authService.signInWithEmail(email, password);
            }
            // Success! Auth state change will handle navigation
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async handleGoogleAuth() {
        this.setLoading(true, 'google');
        this.hideError();

        try {
            await this.authService.signInWithGoogle();
            // Success! Auth state change will handle navigation
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false, 'google');
        }
    }

    toggleAuthMode() {
        this.isSignUp = !this.isSignUp;
        
        const submitText = document.getElementById('auth-submit-text');
        const toggleText = document.getElementById('toggle-text');
        
        if (this.isSignUp) {
            submitText.textContent = 'Create Account';
            toggleText.textContent = 'Already have an account? Sign in';
        } else {
            submitText.textContent = 'Sign In';
            toggleText.textContent = "Don't have an account? Sign up";
        }
        
        this.hideError();
    }

    setLoading(loading, button = 'email') {
        if (button === 'email') {
            const submitBtn = document.getElementById('auth-submit-btn');
            const submitText = document.getElementById('auth-submit-text');
            const loadingSpinner = document.getElementById('auth-loading');
            
            if (loading) {
                submitBtn.disabled = true;
                submitText.classList.add('hidden');
                loadingSpinner.classList.remove('hidden');
            } else {
                submitBtn.disabled = false;
                submitText.classList.remove('hidden');
                loadingSpinner.classList.add('hidden');
            }
        } else if (button === 'google') {
            const googleBtn = document.getElementById('google-signin-btn');
            googleBtn.disabled = loading;
            
            if (loading) {
                googleBtn.innerHTML = `
                    <div class="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-3"></div>
                    Signing in...
                `;
            } else {
                // Reset to original content
                googleBtn.innerHTML = `
                    <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                `;
            }
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        const errorText = errorDiv.querySelector('p');
        
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    hideError() {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.classList.add('hidden');
    }
}