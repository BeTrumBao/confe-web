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

// Simple Jaccard similarity for content
function getSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
    const clean = s => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const c1 = clean(s1); const c2 = clean(s2);
    if (c1 === c2) return 1;
    if (c1.length < 5 || c2.length < 5) return c1 === c2 ? 1 : 0;
    
    const w1 = new Set(c1.split(/\s+/));
    const w2 = new Set(c2.split(/\s+/));
    const intersection = new Set([...w1].filter(x => w2.has(x)));
    const union = new Set([...w1, ...w2]);
    return intersection.size / union.size;
}

module.exports = async (req, res) => {
    // ... CORS ...
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send({ success: false, error: "Method not allowed." });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).send({ success: false, error: "Unauthorized." });

    try {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const { content, roomId } = req.body;

        // 1. EXEMPTIONS (Trusted users don't get auto-banned)
        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        const userData = userSnap.data() || {};
        
        if (userData.role === 'admin' || userData.verifiedLevel2 === true) {
            return res.status(200).send({ success: true, exempt: true });
        }

        const now = Date.now();
        const spamTrackingRef = db.collection('spam_tracking').doc(uid);
        const spamDoc = await spamTrackingRef.get();
        let spamData = spamDoc.exists ? spamDoc.data() : { timestamps: [], contents: [] };

        // Clean up tracking (older than 30s for content, 10s for speed)
        const recentTimestamps = (spamData.timestamps || []).filter(ts => now - ts < 10000);
        const recentContents = (spamData.contents || []).slice(-5); // Keep last 5

        recentTimestamps.push(now);
        if (content) recentContents.push(content);

        // 2. INTERACTION CHECK (Is this a monologue?)
        let isMonologue = true;
        if (roomId) {
            try {
                const roomMsgs = await db.collection(roomId).orderBy('createdAt', 'desc').limit(5).get();
                if (!roomMsgs.empty) {
                    const authors = roomMsgs.docs.map(d => d.data().uid);
                    isMonologue = authors.every(a => a === uid);
                }
            } catch (e) {
                console.warn("Room context check failed:", e.message);
                // Fallback to strict if we can't check context
            }
        }

        // 3. DUPLICATE DETECTION
        let duplicateCount = 0;
        if (content && content.length > 3) {
            for (const prev of recentContents.slice(0, -1)) {
                if (getSimilarity(content, prev) > 0.85) duplicateCount++;
            }
        }

        // 4. BAN LOGIC
        const countLast10s = recentTimestamps.length;
        const last3s = recentTimestamps.filter(ts => now - ts < 3000).length;

        let shouldBan = false;
        let reason = "";

        if (duplicateCount >= 2 && last3s >= 2) {
            shouldBan = true;
            reason = "Spam tin nhắn trùng lặp liên tục.";
        } else if (isMonologue) {
            // Strict for monologues
            if (countLast10s > 10 || last3s > 5) {
                shouldBan = true;
                reason = "Gửi tin nhắn quá nhanh khi không có người phản hồi.";
            }
        } else {
            // Relaxed for active discussions
            if (countLast10s > 25 || last3s > 10) {
                shouldBan = true;
                reason = "Spam tin nhắn quá mức ngay cả trong hội thoại.";
            }
        }

        if (shouldBan) {
            const banDuration = 10 * 24 * 60 * 60 * 1000;
            const bannedUntil = now + banDuration;
            const dateUnban = new Date(bannedUntil).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

            await userRef.update({
                isBanned: true,
                banReason: reason,
                bannedUntil: bannedUntil,
                dateUnban: dateUnban + " (Tự động mở sau 10 ngày)"
            });

            await spamTrackingRef.delete();
            return res.status(403).send({ success: false, banned: true, error: "Bạn đã bị khóa tài khoản 10 ngày do " + reason });
        }

        // Update tracking
        await spamTrackingRef.set({ 
            timestamps: recentTimestamps,
            contents: recentContents
        });

        return res.status(200).send({ success: true });
    } catch (error) {
        console.error('Anti-spam API error:', error);
        res.status(500).send({ success: false, error: "Lỗi máy chủ." });
    }
};
