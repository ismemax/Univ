
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get } from "firebase/database";

// USER: Please replace this with your actual Firebase project configuration from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyDJkH1bcc9w5mfbeabpblfS6x6WgnPSO1s",
    authDomain: "univ-633d8.firebaseapp.com",
    databaseURL: "https://univ-633d8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "univ-633d8",
    storageBucket: "univ-633d8.firebasestorage.app",
    messagingSenderId: "1043212326820",
    appId: "1:1043212326820:web:da8bbe32b37d7c6c5a1331"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set, update, get };
