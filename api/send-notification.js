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
        // We can't return here yet, but we'll check apps.length in the handler
    }
}

module.exports = async (req, res) => {
    if (!admin.apps.length) {
        return res.status(500).send({ success: false, error: "Firebase Admin not initialized. Check Vercel logs." });
    }
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { token, title, body, icon } = req.body;

    if (!token || !title || !body) {
        return res.status(400).send('Missing required fields');
    }

    const message = {
        notification: {
            title: title,
            body: body,
        },
        token: token,
    };

    try {
        const response = await admin.messaging().send(message);
        res.status(200).send({ success: true, messageId: response });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ success: false, error: error.message });
    }
};
