import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Register a new user and set the initial level to 1
export async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), { currentLevel: 1 });
        return userCredential.user;
    } catch (error) {
        console.error("Error creating account:", error.message);
        return null;
    }
}

// Log in an existing user
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error logging in:", error.message);
        return null;
    }
}

// Log out the current user
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("User logged out successfully.");
    } catch (error) {
        console.error("Error logging out:", error.message);
    }
}

// Retrieve user data (current level) from Firestore
export async function getUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error("Error fetching user data:", error.message);
        return null;
    }
}

// Save game progress (current level) to Firestore
export async function saveProgress(uid, level) {
    try {
        await setDoc(doc(db, "users", uid), { currentLevel: level }, { merge: true });
        console.log(`Progress saved: Level ${level}`);
    } catch (error) {
        console.error("Error saving progress:", error.message);
    }
}

// Load game progress (current level) from Firestore
export async function loadGame() {
    const user = auth.currentUser;
    if (user) {
        try {
            const userData = await getUserData(user.uid);
            return userData ? userData.currentLevel || 1 : 1; // Default to level 1 if no data found
        } catch (error) {
            console.error("Error loading game:", error.message);
        }
    } else {
        console.log("No user is logged in.");
        return null;
    }
}