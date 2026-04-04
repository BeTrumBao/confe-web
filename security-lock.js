import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, EmailAuthProvider, GoogleAuthProvider, FacebookAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, onSnapshot, getDocFromServer, updateDoc, serverTimestamp } from "./fire-safety.js";

function showReverifyModal(user, auth, db) {
    const topDoc = window.top.document;
    if (topDoc.getElementById('reverifyOverlay')) return;

    // Robust provider detection
    const providers = user.providerData.map(p => p.providerId);
    const isGoogle = providers.includes('google.com');
    const isFacebook = providers.includes('facebook.com');
    const isSocial = isGoogle || isFacebook;
    const providerId = isGoogle ? 'google.com' : (isFacebook ? 'facebook.com' : 'password');
    const providerName = isGoogle ? 'Google' : (isFacebook ? 'Facebook' : 'Mật khẩu');

    const overlay = topDoc.createElement('div');
    overlay.id = 'reverifyOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Be Vietnam Pro",sans-serif;animation:fadeInReverify 0.4s ease;';

    const styleTag = topDoc.createElement('style');
    styleTag.textContent = `
        @keyframes fadeInReverify { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `;
    topDoc.head.appendChild(styleTag);

    overlay.innerHTML = `
        <div style="background:white;width:100%;max-width:400px;border-radius:32px;padding:40px;text-align:center;box-shadow:0 25px 60px -12px rgba(0,0,0,0.5);animation:modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="width:80px;height:80px;background:#e0f2fe;border-radius:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 28px;">
                <span class="material-symbols-rounded" style="font-size:42px;color:#0ea5e9;">${isSocial ? 'verified_user' : 'lock_reset'}</span>
            </div>
            <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:12px;">Xác minh bảo mật</h2>
            <p style="color:#64748b;font-size:15px;line-height:1.6;margin-bottom:32px;">
                Để giúp bạn nhớ mât khẩu ở phương thức đăng nhập <b> ${providerName}</b> hay nhập mật khẩu / đăng nhập lại để tiếp tục. 
                <br><span style="font-size:12px;opacity:0.8;">(Yêu cầu định kỳ hàng tuần giúp bạn nhớ mật khẩu)</span>
            </p>
            
            ${!isSocial ? `
                <div style="text-align:left;margin-bottom:24px;">
                    <label style="display:block;font-size:13px;font-weight:700;color:#0f172a;margin-bottom:10px;margin-left:4px;">Mật khẩu hiện tại</label>
                    <input type="password" id="reverifyPass" placeholder="••••••••" style="width:100%;padding:16px;background:#f8fafc;border:2px solid #f1f5f9;border-radius:18px;font-size:16px;outline:none;transition:all 0.3s;" onfocus="this.style.borderColor='#0ea5e9';this.style.background='white';" onblur="this.style.borderColor='#f1f5f9';this.style.background='#f8fafc';">
                    <div id="reverifyError" style="color:#ef4444;font-size:13px;margin-top:10px;font-weight:600;display:none;text-align:center;">Mật khẩu không chính xác!</div>
                </div>
            ` : `<div id="reverifyError" style="color:#ef4444;font-size:13px;margin-bottom:20px;font-weight:600;display:none;text-align:center;">Xác minh thất bại. Vui lòng thử lại!</div>`}
            
            <button id="btnConfirmReverify" style="width:100%;padding:18px;background:${isSocial ? (providerId === 'google.com' ? '#ffffff' : '#1877F2') : '#0ea5e9'};color:${isSocial && providerId === 'google.com' ? '#0f172a' : 'white'};border:${isSocial && providerId === 'google.com' ? '1px solid #e2e8f0' : 'none'};border-radius:20px;font-weight:700;font-size:16px;cursor:pointer;margin-bottom:16px;transition:0.3s;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:${isSocial && providerId === 'google.com' ? '0 2px 4px rgba(0,0,0,0.05)' : '0 10px 15px -3px rgba(14, 165, 233, 0.3)'};">
                ${isSocial && providerId === 'google.com' ? '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:20px;">' : ''}
                ${isSocial && providerId === 'facebook.com' ? '<i class="bx bxl-facebook" style="font-size:24px;"></i>' : ''}
                Tiếp tục với ${providerName}
            </button>
            <button id="btnReverifyLogout" style="width:100%;padding:14px;background:white;color:#64748b;border:none;border-radius:18px;font-weight:600;font-size:14px;cursor:pointer;">Đăng xuất khỏi thiết bị</button>
        </div>
    `;

    topDoc.body.appendChild(overlay);

    const inp = topDoc.getElementById('reverifyPass');
    const btn = topDoc.getElementById('btnConfirmReverify');
    const err = topDoc.getElementById('reverifyError');
    const btnLogout = topDoc.getElementById('btnReverifyLogout');

    btn.onclick = async () => {
        btn.textContent = "";
        btn.disabled = true;
        btn.style.opacity = '0.7';
        try {
            if (isSocial) {
                const provider = providerId === 'google.com' ? new GoogleAuthProvider() : new FacebookAuthProvider();
                await reauthenticateWithPopup(user, provider);
            } else {
                const pass = inp.value;
                if (!pass) {
                    btn.textContent = "Xác minh";
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    return;
                }
                const credential = EmailAuthProvider.credential(user.email, pass);
                await reauthenticateWithCredential(user, credential);
            }

            await updateDoc(doc(db, "users", user.uid), {
                lastPasswordVerifiedAt: serverTimestamp()
            });

            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 400);
        } catch (e) {
            console.error("Re-verification failed:", e);
            err.style.display = 'block';
            btn.innerHTML = isSocial && providerId === 'google.com' ? `<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:20px;"> Tiếp tục với Google` : `Tiếp tục với ${providerName}`;
            btn.disabled = false;
            btn.style.opacity = '1';
            if (inp) inp.style.borderColor = '#ef4444';
        }
    };

    btnLogout.onclick = () => {
        signOut(auth).then(() => {
            window.top.location.href = 'login.html';
        });
    };

    if (inp) {
        inp.oninput = () => {
            err.style.display = 'none';
            inp.style.borderColor = '#0ea5e9';
        };
    }

    btn.onmouseover = () => { if (!btn.disabled) btn.style.transform = 'translateY(-2px)'; };
    btn.onmouseout = () => { if (!btn.disabled) btn.style.transform = 'translateY(0)'; };
}

// --- TÍNH NĂNG CHẶN TRUY CẬP TỪ MẠNG CỤ THỂ ---
// ... existing checkBlockedNetwork ...
(async function checkBlockedNetwork() {
    // ...
})();

// ... existing firebaseConfig ...
const firebaseConfig = {
    apiKey: "AIzaSyBPEMno1uZFg4uVXZjz-PbBR37gH6-3t5Y",
    authDomain: "confe-web.vercel.app",
    projectId: "confe-web",
    storageBucket: "confe-web.firebasestorage.app",
    messagingSenderId: "677778119372",
    appId: "1:677778119372:web:ee3f1132871332743b0069"
};

// Initialize or get existing app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('login.html');
    const isIndexPage = path.endsWith('index.html') || path.endsWith('/') || path === '';
    const isVerifyPage = path.endsWith('verify-user.html');
    const isHomePage = path.endsWith('home.html');

    const isSetupPage = path.endsWith('setup-user-data.html');
    const isPublicPage = isLoginPage || isIndexPage || isVerifyPage || isHomePage || isSetupPage ||
        path.includes('privacy') || path.includes('terms') || path.includes('profile') ||
        path.includes('community-rules') || path.includes('deauthorize') || path.includes('404');

    if (!user) {
        // Clear any existing reverify modal on logout/anonymous
        const existingOverlay = window.top.document.getElementById('reverifyOverlay');
        if (existingOverlay) {
            console.log("[Auth] Clearing reverify overlay on logout");
            existingOverlay.remove();
        }

        if (!isPublicPage) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.top.location.href = 'login.html?redirect=' + currentUrl;
        }
        return;
    }

    // Weekly Re-verification Logic for all supported providers
    const checkUserReverify = (data) => {
        // Robust provider detection
        const providers = user.providerData.map(p => p.providerId);
        const isSocial = providers.includes('google.com') || providers.includes('facebook.com');
        const isPassword = providers.includes('password');

        console.log("[Auth] Checking reverify for user:", user.uid, "Providers:", providers);

        if (isSocial || isPassword) {
            const lastVerified = data.lastPasswordVerifiedAt;
            const now = Date.now();
            const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

            // Safely convert Firestore Timestamp or number to milliseconds
            const lastVerifiedMillis = (lastVerified && typeof lastVerified.toMillis === 'function')
                ? lastVerified.toMillis()
                : (typeof lastVerified === 'number' ? lastVerified : 0);

            console.log("[Auth] Last verified:", lastVerifiedMillis, "Now:", now, "Diff:", now - lastVerifiedMillis);

            if (lastVerifiedMillis === 0 || (now - lastVerifiedMillis > SEVEN_DAYS)) {
                // If it's a new account and timestamp is not set, set it now to avoid immediate prompt
                if (lastVerifiedMillis === 0 && data.createdAt) {
                    const createdMillis = typeof data.createdAt.toMillis === 'function' ? data.createdAt.toMillis() : data.createdAt;
                    const accountAge = now - createdMillis;
                    if (accountAge < SEVEN_DAYS) {
                        console.log("[Auth] New account detected (<7d), setting initial verified timestamp");
                        updateDoc(doc(db, "users", user.uid), { lastPasswordVerifiedAt: serverTimestamp() });
                        return;
                    }
                }
                console.log("[Auth] Triggering reverify modal");
                showReverifyModal(user, auth, db);
            }
        }
    };

    getDocFromServer(doc(db, "users", user.uid)).then((uSnapServer) => {
        if (uSnapServer.exists()) {
            const sData = uSnapServer.data();
            console.log("[Auth] User data loaded for reverify check");
            checkUserReverify(sData);

            if (sData.role === 'admin') return;
            const isSetup = sData.is_setup === true || sData.is_setup === "true";
            if (!isSetup && !isPublicPage && !isIndexPage && !isSetupPage) {
                window.top.location.href = 'setup-user-data.html';
                return;
            }
            const isVerified = sData.isVerified === true || sData.isVerified === "true";
            if (!isVerified && !isPublicPage) {
                const topUrl = window.top.location.href;
                if (!topUrl.includes('index.html') && !topUrl.includes('login.html')) {
                    window.top.location.href = 'index.html?reason=unverified';
                }
                return;
            }
        }
    }).catch(e => console.warn("SecurityLock: Initial server fetch failed, falling back to snapshot.", e));

    onSnapshot(doc(db, "users", user.uid), { includeMetadataChanges: true }, (uSnap) => {
        if (uSnap.exists()) {
            const data = uSnap.data();

            // Also run in snapshot for real-time compliance if needed, but mainly server fetch covers it
            checkUserReverify(data);

            const isVerified = (data.isVerified === true || data.isVerified === "true");

            if (uSnap.metadata.fromCache && !isVerified) return;
            if (data.role === 'admin') return;
            const isSetup = data.is_setup === true || data.is_setup === "true";

            if (!isVerified && !isPublicPage) {
                const topUrl = window.top.location.href;
                if (!topUrl.includes('index.html') && !topUrl.includes('login.html')) {
                    window.top.location.href = 'index.html?reason=unverified';
                }
                return;
            }
        } else {
            if (!isPublicPage) {
                const topUrl = window.top.location.href;
                if (!topUrl.includes('index.html') && !topUrl.includes('login.html')) {
                    window.top.location.href = 'index.html?reason=no_profile';
                }
            }
        }
    });

    const isStandaloneExempt = path.includes('chat') || path.includes('caro-game') || path.includes('rps-game') || path.includes('admin') || path.includes('profile');
    if (window.self === window.top && !isPublicPage && !isStandaloneExempt) {
        window.location.href = 'index.html';
    }
});
