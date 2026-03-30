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
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { deviceId } = req.query;

    if (!deviceId) {
        return res.status(400).send({ success: false, error: "Missing deviceId" });
    }

    try {
        const usersSnap = await db.collection('users')
            .where('deviceId', '==', deviceId)
            .get();

        const count = usersSnap.size;
        const allowed = count < 3;

        res.status(200).send({
            success: true,
            count: count,
            allowed: allowed,
            message: allowed ? "Device is allowed to register." : "Mỗi thiết bị chỉ được tạo tối đa 3 tài khoản."
        });
    } catch (error) {
        console.error('Check device error:', error);
        res.status(500).send({ success: false, error: error.message });
    }
};
