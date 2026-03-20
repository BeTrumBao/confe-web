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

module.exports = async (req, res) => {
    // Security check
    const secret = req.headers['x-cleanup-secret'] || req.query.secret;
    const envSecret = process.env.CLEANUP_SECRET;
    if (envSecret && secret !== envSecret) {
        return res.status(401).send({ success: false, error: "Unauthorized" });
    }

    if (!admin.apps.length) {
        return res.status(500).send({ success: false, error: "Firebase Admin not initialized." });
    }

    try {
        const usersSnap = await db.collection('users').get();
        let count = 0;

        // Batch size limit is 500 in Firestore
        const chunks = [];
        let currentBatch = db.batch();
        let batchCount = 0;

        usersSnap.forEach(docSnap => {
            if (!docSnap.data().isVerified) {
                currentBatch.update(docSnap.ref, { isVerified: true });
                count++;
                batchCount++;
                if (batchCount === 499) {
                    chunks.push(currentBatch.commit());
                    currentBatch = db.batch();
                    batchCount = 0;
                }
            }
        });

        if (batchCount > 0) {
            chunks.push(currentBatch.commit());
        }

        await Promise.all(chunks);

        res.status(200).send({
            success: true,
            message: `Migration completed. Marked ${count} users as verified.`,
            total: usersSnap.size,
            updated: count
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).send({ success: false, error: error.message });
    }
};
