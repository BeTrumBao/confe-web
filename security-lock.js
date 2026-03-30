import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- TÍNH NĂNG CHẶN TRUY CẬP TỪ MẠNG CỤ THỂ ---
(async function checkBlockedNetwork() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        if (!response.ok) return;
        const data = await response.json();
        const isp = (data.org || "").toLowerCase();

        console.log("Tên Trạm Mạng (ISP) hiện tại:", data.org || "Không rõ");
        console.log("Địa chỉ IP hiện tại:", data.ip);

        // --- ĐỊA CHỈ IP HOẶC TỪ KHÓA TÊN MẠNG MUỐN CHẶN ---
        const blockedNetworks = ["nha phuong", "nha phuong 5g"];
        const blockedIPs = ["58.187.188.149"];

        const isNetworkBlocked = blockedNetworks.some(net => isp.includes(net.toLowerCase()));
        const isIPBlocked = blockedIPs.includes(data.ip);

        if (isNetworkBlocked || isIPBlocked) {
            document.body.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#0f172a; color:white; font-family:sans-serif; text-align:center; padding:20px; z-index:99999; position:fixed; inset:0;">
                    <div style="font-size:64px; margin-bottom:20px;">🚫</div>
                    <h1 style="margin-bottom:10px;">Truy cập bị từ chối</h1>
                    <p style="color:#94a3b8; max-width:400px; line-height:1.6;">
                        Lý Do : Không thể lấy địa chỉ máy chủ ?  (<b>Code : 2</b>). 
                        Hãy thủ lại sau giây lát !
                    </p>
                </div>
            `;
            window.stop(); // Dừng tải trang ngay lập tức
        }
    } catch (e) {
        // Lỗi lấy thông tin IP (do adblock hoặc CORS) thì bỏ qua để web vẫn chạy bình thường
        console.warn("SecurityLock: Could not fetch network info (CORS or Adblock):", e.message);
    }
})();
// ----------------------------------------------

const firebaseConfig = {
    apiKey: "AIzaSyBPEMno1uZFg4uVXZjz-PbBR37gH6-3t5Y",
    authDomain: "confe-web.firebaseapp.com",
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
    // Current page path for context
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('login.html');
    const isIndexPage = path.endsWith('index.html') || path.endsWith('/') || path === '';
    const isVerifyPage = path.endsWith('verify-user.html');
    const isHomePage = path.endsWith('home.html');

    const isSetupPage = path.endsWith('setup-user-data.html');
    const isPublicPage = isLoginPage || isIndexPage || isVerifyPage || isHomePage || isSetupPage ||
        path.includes('privacy') || path.includes('terms') || path.includes('profile') ||
        path.includes('community-rules') || path.includes('deauthorize') || path.includes('404');

    // Check if running as standalone
    const isStandalone = window.self === window.top;

    if (!user) {
        // If not logged in, redirect to login unless already on a public page
        if (!isPublicPage) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.top.location.href = 'login.html?redirect=' + currentUrl;
        }
        return;
    }

    // Subscribe to user changes to redirect immediately if verification is updated or revoked
    onSnapshot(doc(db, "users", user.uid), (uSnap) => {
        if (uSnap.exists()) {
            const data = uSnap.data();

            // Bypass for Admin
            if (data.role === 'admin') return;

            // 1. Check if user has completed setup (Priority Step)
            const isSetup = data.is_setup === true || data.is_setup === "true";

            // Redirect un-setup users to setup page (unless on public/setup pages)
            if (!isSetup && !isPublicPage && !isIndexPage && !isSetupPage) {
                window.top.location.href = 'setup-user-data.html';
                return;
            }

            // 2. Check if user is verified
            const isVerified = data.isVerified === true || data.isVerified === "true";

            // If not verified and trying to access protected sub-pages, redirect to index.html
            // After setup is complete, verification becomes the next gate.
            if (!isVerified && !isPublicPage) {
                console.log("[SecurityLock] Unverified user detected on sub-page, redirecting to index.html. Verification Data:", data.isVerified);
                window.top.location.href = 'index.html?reason=unverified';
                return;
            }
        } else {
            // User doc doesn't exist? (new user)
            if (!isPublicPage) {
                window.top.location.href = 'index.html?reason=no_profile';
            }
        }
    });

    // Standalone check for protected pages 
    const isStandaloneExempt = path.includes('chat') || path.includes('caro-game') || path.includes('rps-game') || path.includes('admin') || path.includes('profile');
    if (window.self === window.top && !isPublicPage && !isStandaloneExempt) {
        window.location.href = 'index.html';
    }
});
