import * as firestore from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Rate limit configuration
const ACTION_LIMIT = 50; // Increased to 50 for production safety
const WINDOW_MS = 10000; // per 10 seconds

export function checkRateLimit() {
    try {
        const now = Date.now();
        let lastReset = parseInt(localStorage.getItem('fs_last_reset') || '0');
        let count = parseInt(localStorage.getItem('fs_action_count') || '0');

        if (now - lastReset > WINDOW_MS) {
            count = 1;
            lastReset = now;
        } else {
            count++;
        }

        localStorage.setItem('fs_action_count', count.toString());
        localStorage.setItem('fs_last_reset', lastReset.toString());
        
        console.log(`[FireSafety] Action count: ${count}/${ACTION_LIMIT}`);

        if (count > ACTION_LIMIT) {
            console.warn("[FireSafety] Rate limit exceeded (e-2)");
            if (window.top && typeof window.top.showRateLimitPopup === 'function') {
                console.log("[FireSafety] Successfully using window.top.showRateLimitPopup()");
                window.top.showRateLimitPopup();
            } else if (typeof window.showRateLimitPopup === 'function') {
                console.log("[FireSafety] Successfully using window.showRateLimitPopup()");
                window.showRateLimitPopup();
            } else {
                console.warn("[FireSafety] CRITICAL: showRateLimitPopup is completely undefined. Falling back to alert.");
                alert("Hệ thống: Thao tác quá nhiều lần vui lòng thử lại sau (e-2)");
            }
            return false;
        }
    } catch (e) {
        console.error("[FireSafety] Error checking rate limit:", e);
    }
    return true;
}

// Wrapped functions - READS (No longer limited as per user request "bỏ cơ chế load nhiều data mới hiện popup")
export const getDoc = (...args) => {
    return firestore.getDoc(...args);
};

export const getDocs = (...args) => {
    return firestore.getDocs(...args);
};

export const onSnapshot = (...args) => {
    return firestore.onSnapshot(...args);
};

export const getDocFromServer = (...args) => {
    return firestore.getDocFromServer(...args);
};

// Wrapped functions - WRITES / SPAM (Added limit as per user request "chỉ spam các mục thôi")
export const addDoc = (...args) => {
    if (!checkRateLimit()) return Promise.reject(new Error("Rate limit exceeded (e-2)"));
    return firestore.addDoc(...args);
};

export const setDoc = (...args) => {
    if (!checkRateLimit()) return Promise.reject(new Error("Rate limit exceeded (e-2)"));
    return firestore.setDoc(...args);
};

export const updateDoc = (...args) => {
    if (!checkRateLimit()) return Promise.reject(new Error("Rate limit exceeded (e-2)"));
    return firestore.updateDoc(...args);
};

export const deleteDoc = (...args) => {
    if (!checkRateLimit()) return Promise.reject(new Error("Rate limit exceeded (e-2)"));
    return firestore.deleteDoc(...args);
};

export const runTransaction = (db, updateFunction, ...args) => {
    if (!checkRateLimit()) return Promise.reject(new Error("Rate limit exceeded (e-2)"));
    return firestore.runTransaction(db, updateFunction, ...args);
};

export const writeBatch = (...args) => {
    if (!checkRateLimit()) {
        // We can't easily block the batch creation, but we can return a proxy that blocks commit
        const batch = firestore.writeBatch(...args);
        const originalCommit = batch.commit.bind(batch);
        batch.commit = () => {
            if (!checkRateLimit()) return Promise.reject(new Error("Rate limit exceeded (e-2)"));
            return originalCommit();
        };
        return batch;
    }
    return firestore.writeBatch(...args);
};

// Re-export everything else from firestore
export const {
    getFirestore,
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    limitToLast,
    startAfter,
    getCountFromServer,
    increment,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    Timestamp,
    GeoPoint,
    Bytes,
    FieldPath,
    FieldValue,
    collectionGroup,
    connectFirestoreEmulator,
    disableNetwork,
    enableNetwork,
    enableIndexedDbPersistence,
    enableMultiTabIndexedDbPersistence,
    clearIndexedDbPersistence,
    terminate,
    waitForPendingWrites,
    onSnapshotsInSync,
    CACHE_SIZE_UNLIMITED
} = firestore;

// Default export if needed
export default firestore;
