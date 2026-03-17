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

module.exports = async (req, res) => {
    if (!admin.apps.length) {
        return res.status(500).send({ success: false, error: "Firebase Admin not initialized." });
    }
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { token, topic } = req.body;

    if (!token || !topic) {
        return res.status(400).send({ success: false, error: "Missing token or topic" });
    }

    try {
        await admin.messaging().subscribeToTopic(token, topic);
        res.status(200).send({ success: true, message: `Subscribed to ${topic}` });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).send({ success: false, error: error.message });
    }
};
