const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!saRaw) throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is missing!");
        const serviceAccount = JSON.parse(saRaw);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = async (req, res) => {
    // Security: Check for cleanup secret
    const secret = req.headers['x-cleanup-secret'];
    const envSecret = process.env.CLEANUP_SECRET;
    if (envSecret && secret !== envSecret) {
        return res.status(401).send({ success: false, error: "Unauthorized" });
    }

    if (!admin.apps.length) {
        return res.status(500).send({ success: false, error: "Firebase Admin not initialized." });
    }

    try {
        const now = new Date();
        const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));
        
        // Start date for the new verification policy (March 20th 00:00 VN time)
        const policyStartDate = new Date('2026-03-19T17:00:00Z');

        // Note: isVerified is set to false on new registrations.
        // We only cleanup users who were created after the policy started.
        const usersSnap = await db.collection('users')
            .where('isVerified', '==', false)
            .get();

        const deletedUids = [];
        const promises = [];

        usersSnap.forEach(docSnap => {
            const data = docSnap.data();
            const createdAtStr = data.createdAt;
            if (!createdAtStr) return; // Skip legacy users (no createdAt field)

            const createdAt = new Date(createdAtStr);
            
            // Delete if: Created after policy start AND created > 10 days ago
            if (createdAt >= policyStartDate && createdAt < tenDaysAgo) {
                const uid = docSnap.id;
                deletedUids.push(uid);
                
                // 1. Delete from Firebase Auth
                promises.push(auth.deleteUser(uid).catch(e => {
                    if (e.code === 'auth/user-not-found') return;
                    console.error(`Auth delete fail for ${uid}:`, e);
                }));
                
                // 2. Delete from Firestore
                promises.push(docSnap.ref.delete());
            }
        });

        await Promise.all(promises);

        res.status(200).send({
            success: true,
            count: deletedUids.length,
            deletedUids: deletedUids,
            message: `Đã dọn dẹp ${deletedUids.length} tài khoản chưa xác minh sau 10 ngày.`
        });
    } catch (error) {
        console.error('Cleanup process error:', error);
        res.status(500).send({ success: false, error: error.message });
    }
};
