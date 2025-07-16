// file: src/services/auth.js
// Authentication service
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged 
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase.js";
import { ERROR_MESSAGES } from "../constants/ui-messages.js";

export class AuthService {
    constructor() {
        this.auth = null;
        this.googleProvider = new GoogleAuthProvider();
    }

    // Initialize auth service
    async initialize() {
        this.auth = getFirebaseAuth();
        console.log("AuthService initialized");
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            this.auth = this.auth || getFirebaseAuth();
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Email sign in error:", error);
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
            console.error("Account creation error:", error);
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
            console.error("Google sign in error:", error);
            throw this.formatAuthError(error);
        }
    }

    // Sign out
    async signOut() {
        try {
            this.auth = this.auth || getFirebaseAuth();
            await signOut(this.auth);
        } catch (error) {
            console.error("Sign out error:", error);
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
            "auth/user-not-found": ERROR_MESSAGES.AUTH_USER_NOT_FOUND,
            "auth/wrong-password": ERROR_MESSAGES.AUTH_WRONG_PASSWORD,
            "auth/email-already-in-use": ERROR_MESSAGES.AUTH_EMAIL_IN_USE,
            "auth/weak-password": ERROR_MESSAGES.AUTH_WEAK_PASSWORD,
            "auth/invalid-email": ERROR_MESSAGES.AUTH_INVALID_EMAIL,
            "auth/popup-closed-by-user": ERROR_MESSAGES.AUTH_POPUP_CLOSED,
            "auth/network-request-failed": ERROR_MESSAGES.AUTH_NETWORK_ERROR,
        };

        return new Error(errorMessages[error.code] || ERROR_MESSAGES.AUTH_GENERAL);
    }
}