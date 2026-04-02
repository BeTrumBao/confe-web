/**
 * Presence Heartbeat & Real-time Utility
 * Ensures the user's status is 'online' while browsing and 'offline' when disconnecting.
 */

export function startPresenceHeartbeat(params) {
    const { 
        db, rtdb, uid, 
        serverTimestamp, // Firestore serverTimestamp
        updateDoc, doc, 
        ref, onValue, set, onDisconnect // RTDB functions
    } = params;

    if (!uid || !db || !rtdb) {
        console.warn("[Presence] Missing core dependencies.");
        return;
    }

    // 1. RTDB Presence (Real-time)
    const statusRef = ref(rtdb, `/status/${uid}`);
    const connectedRef = ref(rtdb, ".info/connected");

    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            // We are connected (or reconnected)!
            
            // When I disconnect, update RTDB to offline
            onDisconnect(statusRef).set({
                state: 'offline',
                lastSeen: Date.now() // RTDB uses JS timestamps usually
            }).then(() => {
                // Set online in RTDB
                set(statusRef, {
                    state: 'online',
                    lastSeen: Date.now()
                });
            });

            // Also update Firestore lastSeen immediately on connect
            updateDoc(doc(db, "users", uid), {
                lastSeen: serverTimestamp()
            }).catch(e => console.error("[Presence] Firestore initial update failed:", e));
        }
    });

    // 2. Firestore Heartbeat (Safety Fallback)
    const intervalId = setInterval(async () => {
        try {
            await updateDoc(doc(db, "users", uid), {
                lastSeen: serverTimestamp()
            });
        } catch (e) {
            console.error("[Presence] Firestore heartbeat failed:", e);
        }
    }, 180000);

    return () => clearInterval(intervalId);
}
