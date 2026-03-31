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
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).send({ success: false, error: "Method not allowed. Use POST." });
    }

    const { targetUid } = req.body;
    const authHeader = req.headers.authorization;

    if (!targetUid || !authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).send({ success: false, error: "Missing targetUid or Authorization token." });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // 1. Verify the Verifier's token
        const decodedToken = await auth.verifyIdToken(idToken);
        const verifierUid = decodedToken.uid;

        if (verifierUid === targetUid) {
            return res.status(400).send({ success: false, error: "Bạn không thể tự xác minh cho chính mình!" });
        }

        // 2. Fetch Verifier's data
        const verifierDoc = await db.collection('users').doc(verifierUid).get();
        if (!verifierDoc.exists) {
            return res.status(404).send({ success: false, error: "Không tìm thấy dữ liệu người xác nhận." });
        }

        const vData = verifierDoc.data();
        const isAdmin = vData.role === 'admin';

        // 3. Validation Logic
        if (!isAdmin) {
            if (vData.isVerified !== true) {
                return res.status(403).send({ success: false, error: "Tài khoản của bạn chưa được xác minh nên không thể xác minh cho người khác!" });
            }

            // Check Account Age (90 days)
            const createdAt = vData.createdAt ? new Date(vData.createdAt) : new Date(decodedToken.auth_time * 1000);
            const now = new Date();
            const ageDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
            if (ageDays < 90) {
                return res.status(403).send({ success: false, error: "Tài khoản của bạn phải tham gia trên 90 ngày mới có thể xác minh!" });
            }

            // Check Cooldown (30 days)
            if (vData.lastVerifiedOthersAt) {
                const lastVerify = new Date(vData.lastVerifiedOthersAt);
                const diffDays = Math.floor((now - lastVerify) / (1000 * 60 * 60 * 24));
                if (diffDays < 30) {
                    return res.status(403).send({ success: false, error: `Bạn cần chờ thêm ${30 - diffDays} ngày nữa mới có thể xác minh tiếp!` });
                }
            }

            // Check if Banned
            if (vData.isBanned === true) {
                return res.status(403).send({ success: false, error: "Tài khoản của bạn đang bị khóa, không thể thực hiện hành động này." });
            }
        }

        // 4. Update Target User
        const targetRef = db.collection('users').doc(targetUid);
        const targetDoc = await targetRef.get();
        if (!targetDoc.exists) {
            return res.status(404).send({ success: false, error: "Không tìm thấy tài khoản cần xác minh." });
        }

        const reqLevel = req.body.level === 2 ? 2 : 1;

        if (reqLevel === 1) {
            if (targetDoc.data().isVerified === true) {
                return res.status(200).send({ success: true, message: "Tài khoản này đã được xác minh rồi." });
            }

            const batch = db.batch();
            batch.update(targetRef, {
                isVerified: true,
                verifiedBy: verifierUid,
                verifiedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            batch.update(db.collection('users').doc(verifierUid), {
                lastVerifiedOthersAt: new Date().toISOString()
            });
            await batch.commit();
            return res.status(200).send({ success: true, message: "Xác minh thành công cho người dùng!" });

        } else if (reqLevel === 2) {
            if (targetDoc.data().isVerified !== true) {
                 return res.status(400).send({ success: false, error: "Tài khoản này chưa xác minh cấp 1." });
            }
            if (targetDoc.data().verifiedLevel2 === true) {
                 return res.status(200).send({ success: true, message: "Tài khoản này đã hoàn thành xác minh tính toàn vẹn của bạn đối với cộng đồng !." });
            }
            const level2Verifiers = targetDoc.data().level2Verifiers || [];
            if (level2Verifiers.includes(verifierUid)) {
                 return res.status(400).send({ success: false, error: "Bạn đã xác minh tính toàn vẹn của bạn đối với cộng đồng ! cho người này rồi!" });
            }
            
            level2Verifiers.push(verifierUid);
            const updates = { level2Verifiers };
            let msg = "Đã xác minh 1 lượt! Người dùng có thể gửi yêu cầu duyệt ngay bây giờ.";
            
            if (isAdmin) {
                 updates.verifiedLevel2 = true;
                 updates.level2VerifiedAt = admin.firestore.FieldValue.serverTimestamp();
                 msg = "Xác minh tính toàn vẹn của bạn đối với cộng đồng ! thành công dưới quyền Admin!";
            }
            
            const batch = db.batch();
            batch.update(targetRef, updates);
            batch.update(db.collection('users').doc(verifierUid), {
                lastVerifiedOthersAt: new Date().toISOString()
            });
            await batch.commit();
            
            return res.status(200).send({ success: true, message: msg });
        }

    } catch (error) {
        console.error('Verify-user API error:', error);
        res.status(500).send({ success: false, error: error.message });
    }
};
