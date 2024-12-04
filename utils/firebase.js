//This codes are taken from firebase console: https://console.firebase.google.com/
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBSTS9PmO_R0U9JNUDFsR20enWdQ0FW_oY",
    authDomain: "jumpy-math.firebaseapp.com",
    projectId: "jumpy-math",
    storageBucket: "jumpy-math.firebasestorage.app",
    messagingSenderId: "161719785553",
    appId: "1:161719785553:web:60e1f5b052d5778d5ec070",
    measurementId: "G-18R43K6421"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);