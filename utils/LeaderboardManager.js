import { db } from "./firebase.js";
import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

class LeaderboardManager {
    constructor() {
        this.leaderboardData = [];
        this.unsubscribe = null;
    }

    // Start listening to real-time leaderboard updates
    initializeLeaderboard() {
        const leaderboardRef = collection(db, "leaderboard");
        const leaderboardQuery = query(
            leaderboardRef,
            orderBy("levelCompleted", "desc"),
            orderBy("completionTime", "asc"),
            limit(10)
        );

        this.unsubscribe = onSnapshot(leaderboardQuery, (snapshot) => {
            this.leaderboardData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        });
    }

    // Update player's progress in leaderboard
    async updateLeaderboard(userId, username, levelCompleted) {
        try {
            const leaderboardRef = doc(db, "leaderboard", userId);
            await setDoc(leaderboardRef, {  // Use setDoc instead of updateDoc
                username,
                levelCompleted,
                completionTime: serverTimestamp(),
                lastUpdated: serverTimestamp()
            }, { merge: true });  // This allows updating existing documents
            return true;
        } catch (error) {
            console.error("Error updating leaderboard:", error);
            return false;
        }
    }

    // Stop listening to updates when not needed
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    getLeaderboardData() {
        return this.leaderboardData;
    }
}

export const leaderboardManager = new LeaderboardManager();