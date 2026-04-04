import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, getDocs, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove, orderBy, limit, Timestamp, writeBatch, increment } from "./fire-safety.js";
import { startPresenceHeartbeat } from "./presence.js";

// Firebase Config
const cfg = { apiKey: "AIzaSyBPEMno1uZFg4uVXZjz-PbBR37gH6-3t5Y", authDomain: "confe-web.vercel.app", projectId: "confe-web", storageBucket: "confe-web.firebasestorage.app", messagingSenderId: "677778119372", appId: "1:677778119372:web:ee3f1132871332743b0069" };
const app = getApps().length === 0 ? initializeApp(cfg) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const userAction = document.getElementById('userAction');
const topicList = document.getElementById('topicList');
const rankingList = document.getElementById('rankingList');
const fabCreate = document.getElementById('fabCreate');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userAction.innerHTML = `<button id="btnLogout" class="btn-text">Thoát (${user.email.split('@')[0]})</button>`;
        document.getElementById('btnLogout').onclick = () => signOut(auth);
    } else {
        currentUser = null;
        userAction.innerHTML = `<a href="login.html" class="btn-tonal">Đăng nhập</a>`;
    }
});

fabCreate.addEventListener('click', async () => {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    const title = prompt("Nhập tên Topic mới:");
    if (title) {
        await addDoc(collection(db, "topics"), {
            title: title,
            owner: currentUser.email,
            heat: 0,
            createdAt: serverTimestamp()
        });
    }
});

onSnapshot(query(collection(db, "topics"), orderBy("heat", "desc")), (snap) => {
    rankingList.innerHTML = "";
    topicList.innerHTML = "";
    let i = 0;
    snap.forEach(doc => {
        const d = doc.data();
        const html = `
            <div class="topic-item" onclick="localStorage.setItem('tid','${doc.id}');localStorage.setItem('tname','${d.title}');window.location.href='detailv2.html'">
                <span>${d.title}</span>
                <span>🔥 ${d.heat}</span>
            </div>
        `;
        topicList.innerHTML += html;
        if (i < 3) rankingList.innerHTML += html;
        i++;
    });
});
