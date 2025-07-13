// Firebase configuration and initialization
import { initializeApp as firebaseInitializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config with your actual values
const firebaseConfig = {
  apiKey: "AIzaSyCNEC7CE4Wk1wiELBGBNkfsepL77VahecM",
  authDomain: "stock-sim-e5cbf.firebaseapp.com",
  projectId: "stock-sim-e5cbf",
  storageBucket: "stock-sim-e5cbf.firebasestorage.app",
  messagingSenderId: "166807275805",
  appId: "1:166807275805:web:e5d1382caa8fdda03139f4",
  measurementId: "G-GQQC9QN4YE"
};

// Initialize Firebase services
let app;
let auth;
let db;
let analytics;

export async function initializeApp() {
    try {
        // Initialize Firebase app
        app = firebaseInitializeApp(firebaseConfig);
        
        // Initialize services
        auth = getAuth(app);
        db = getFirestore(app);
        analytics = getAnalytics(app);
        
        console.log('Firebase services initialized successfully');
        return { app, auth, db, analytics };
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

// Export Firebase services with safety checks
export function getFirebaseAuth() {
    if (!auth) {
        throw new Error('Firebase not initialized. Call initializeApp() first.');
    }
    return auth;
}

export function getFirestoreDb() {
    if (!db) {
        throw new Error('Firebase not initialized. Call initializeApp() first.');
    }
    return db;
}

// export function getFirebaseApp() {
//     if (!app) {
//         throw new Error('Firebase not initialized. Call initializeApp() first.');
//     }
//     return app;
// }