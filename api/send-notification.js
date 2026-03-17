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

    const { token, topic, title, body, tag, senderUid } = req.body;

    if ((!token && !topic) || !title || !body) {
        return res.status(400).send({ success: false, error: "Missing required fields: (token or topic), title, body" });
    }

    const message = {
        notification: { title, body },
        data: senderUid ? { senderUid: String(senderUid) } : {},
        webpush: {
            notification: {
                icon: 'https://confe-web.vercel.app/assets/favicon.png',
                click_action: 'https://confe-web.vercel.app/chat.html',
                tag: tag ? String(tag) : undefined
            }
        }
    };

    if (token) {
        message.token = token;
    } else {
        message.topic = topic;
    }

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        res.status(200).send({ success: true, messageId: response });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ success: false, error: error.message });
    }
};
