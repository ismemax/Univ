
/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get, increment } from "firebase/database";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Firebase project configuration
// We use VITE_ environment variables for better security and portability.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDJkH1bcc9w5mfbeabpblfS6x6WgnPSO1s",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "univ-633d8.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://univ-633d8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "univ-633d8",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "univ-633d8.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1043212326820",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1043212326820:web:da8bbe32b37d7c6c5a1331"
};

let db: any;
let app: any;

try {
    // Basic validation to ensure required keys are present
    if (firebaseConfig.apiKey.startsWith('AIza')) {
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);

        // --- App Check Infrastructure ---
        // reCAPTCHA v3 site key from the Firebase/Google console
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        
        if (siteKey) {
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(siteKey),
                isTokenAutoRefreshEnabled: true
            });
        } else if (import.meta.env.DEV) {
            // Enable debug mode for local development to avoid reCAPTCHA blocks
            (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        }
    } else {
        console.error("Critical Security Error: Firebase configuration is invalid or missing.");
    }
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

export { db, ref, onValue, set, update, get, increment };
