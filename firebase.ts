
/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get } from "firebase/database";

// Firebase project configuration
// Note: In this browser-based environment, environment variables are not supported.
const firebaseConfig = {
    apiKey: "AIzaSyDJkH1bcc9w5mfbeabpblfS6x6WgnPSO1s",
    authDomain: "univ-633d8.firebaseapp.com",
    databaseURL: "https://univ-633d8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "univ-633d8",
    storageBucket: "univ-633d8.firebasestorage.app",
    messagingSenderId: "1043212326820",
    appId: "1:1043212326820:web:da8bbe32b37d7c6c5a1331"
};

let db: any;
let app: any;

try {
    if (!firebaseConfig.apiKey) {
        console.warn("Firebase API Key is missing. Check your .env.local file.");
    }
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

export { db, ref, onValue, set, update, get };
