// file: src/services/auth.js
// Authentication service
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "./firebase.js";
import { ERROR_MESSAGES } from "../constants/ui-messages.js";
import { logger } from "../utils/logger.js";

const USERS_COLLECTION = "Users";

export class AuthService {
    constructor() {
        this.auth = null;
        this.googleProvider = new GoogleAuthProvider();
    }

    // Initialize auth service
    async initialize() {
        this.auth = getFirebaseAuth();
        logger.info("AuthService initialized");
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            this.auth = this.auth || getFirebaseAuth();
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            logger.error("Email sign in error:", error);
            throw this.formatAuthError(error);
        }
    }

    // Create account with email and password - NOW WITH DISPLAY NAME
    async createAccount(email, password, displayName) {
        try {
            this.auth = this.auth || getFirebaseAuth();
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;

            // Update Firebase Auth profile with display name
            await updateProfile(user, {
                displayName: displayName
            });

            // Create user document in Firestore
            await this.createUserDocument(user, displayName);

            return user;
        } catch (error) {
            logger.error("Account creation error:", error);
            throw this.formatAuthError(error);
        }
    }

    // Sign in with Google - NOW WITH USER DOCUMENT CREATION
    async signInWithGoogle() {
        try {
            this.auth = this.auth || getFirebaseAuth();
            const result = await signInWithPopup(this.auth, this.googleProvider);
            const user = result.user;

            // Check if user document exists, create if not
            await this.ensureUserDocument(user);

            return user;
        } catch (error) {
            logger.error("Google sign in error:", error);
            throw this.formatAuthError(error);
        }
    }

    // Create user document in Firestore Users collection
    async createUserDocument(user, displayName = null) {
        try {
            const db = getFirestoreDb();
            const userRef = doc(db, USERS_COLLECTION, user.uid);

            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: displayName || user.displayName || user.email?.split("@")[0] || "Anonymous User",
                systemRole: "user", // Default role
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(userRef, userData);
            logger.debug("User document created successfully:", user.uid);
            
        } catch (error) {
            logger.error("Error creating user document:", error);
            throw error;
        }
    }

    // Ensure user document exists (for Google sign-in and existing users)
    async ensureUserDocument(user) {
        try {
            const db = getFirestoreDb();
            const userRef = doc(db, USERS_COLLECTION, user.uid);
            const userSnap = await getDoc(userRef);

            // If user document doesn't exist, create it
            if (!userSnap.exists()) {
                await this.createUserDocument(user);
            } else {
                // Optionally update the last login time
                // await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
            }
            
        } catch (error) {
            logger.error("Error ensuring user document:", error);
            // Don't throw error here - auth should still work even if Firestore fails
        }
    }

    // Sign out
    async signOut() {
        try {
            this.auth = this.auth || getFirebaseAuth();
            await signOut(this.auth);
        } catch (error) {
            logger.error("Sign out error:", error);
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