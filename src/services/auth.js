// file: src/services/auth.js
// Authentication service
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase.js';

export class AuthService {
    constructor() {
        this.auth = null;
        this.googleProvider = new GoogleAuthProvider();
    }

    // Initialize auth service
    async initialize() {
        this.auth = getFirebaseAuth();
        console.log('AuthService initialized');
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            this.auth = this.auth || getFirebaseAuth();
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Email sign in error:', error);
            throw this.formatAuthError(error);
        }
    }

    // Create account with email and password
    async createAccount(email, password) {
        try {
            this.auth = this.auth || getFirebaseAuth();
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Account creation error:', error);
            throw this.formatAuthError(error);
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            this.auth = this.auth || getFirebaseAuth();
            const result = await signInWithPopup(this.auth, this.googleProvider);
            return result.user;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw this.formatAuthError(error);
        }
    }

    // Sign out
    async signOut() {
        try {
            this.auth = this.auth || getFirebaseAuth();
            await signOut(this.auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Listen for auth state changes
    onAuthStateChanged(callback) {
        this.auth = this.auth || getFirebaseAuth();
        return onAuthStateChanged(this.auth, callback);
    }

    // Get current user
    getCurrentUser() {
        this.auth = this.auth || getFirebaseAuth();
        return this.auth.currentUser;
    }

    // Format Firebase auth errors for user display
    formatAuthError(error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
        };

        return new Error(errorMessages[error.code] || 'An authentication error occurred.');
    }
}