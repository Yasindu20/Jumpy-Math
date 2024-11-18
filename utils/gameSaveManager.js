import { auth, db } from "./firebase.js";
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

export class GameSaveManager {
    constructor() {
        this.currentUser = null;
        this.currentLevel = 1;

        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                this.loadGameState();
            }
        });
    }

    async saveGameState(level) {
        if (!this.currentUser) {
            console.error("No user logged in");
            return false;
        }

        try {
            const userRef = doc(db, "users", this.currentUser.uid);
            await updateDoc(userRef, {
                currentLevel: level,
                lastSaved: new Date().toISOString()
            });
            console.log("Game progress saved successfully");
            return true;
        } catch (error) {
            console.error("Error saving game progress:", error);
            return false;
        }
    }

    async loadGameState() {
        if (!this.currentUser) {
            console.error("No user logged in");
            return null;
        }

        try {
            const userDoc = await getDoc(doc(db, "users", this.currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                this.currentLevel = data.currentLevel || 1;
                return data;
            }
            return null;
        } catch (error) {
            console.error("Error loading game state:", error);
            return null;
        }
    }

    isLoggedIn() {
        return !!this.currentUser;
    }
}

export const gameSaveManager = new GameSaveManager();