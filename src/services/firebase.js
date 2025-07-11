// Firebase configuration and initialization
import { initializeApp as firebaseInitializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
    // You'll need to replace these with your actual Firebase config values
    apiKey: "AIzaSyCNEC7CE4Wk1wiELBGBNkfsepL77VahecM",
    authDomain: "stock-sim-e5cbf.firebaseapp.com",
    projectId: "stock-sim-e5cbf",
    storageBucket: "stock-sim-e5cbf.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "166807275805"
};

// Initialize Firebase
let app;
let auth;
let db;

export async function initializeApp() {
    try {
        app = firebaseInitializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        
        console.log('Firebase services initialized');
        return { app, auth, db };
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

// Export Firebase services
export function getFirebaseAuth() {
    if (!auth) {
        throw new Error('Firebase not initialized. Call initializeApp() first.');
    }
    return auth;
}

export function getFirebaseDb() {
    if (!db) {
        throw new Error('Firebase not initialized. Call initializeApp() first.');
    }
    return db;
}

export function getFirebaseApp() {
    if (!app) {
        throw new Error('Firebase not initialized. Call initializeApp() first.');
    }
    return app;
}