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

export async function getUsername(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            // Assuming the email is stored or can be retrieved
            return userDoc.data().email || auth.currentUser?.email;
        }
        return null;
    } catch (error) {
        console.error("Error fetching username:", error.message);
        return null;
    }
}