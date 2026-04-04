import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, getDocs, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove, orderBy, limit, Timestamp, writeBatch, increment } from "./fire-safety.js";
import { startPresenceHeartbeat } from "./presence.js";

const cfg = { apiKey: "AIzaSyBPEMno1uZFg4uVXZjz-PbBR37gH6-3t5Y", authDomain: "confe-web.vercel.app", projectId: "confe-web", storageBucket: "confe-web.firebasestorage.app", messagingSenderId: "677778119372", appId: "1:677778119372:web:ee3f1132871332743b0069" };
const app = getApps().length === 0 ? initializeApp(cfg) : getApp();
const db = getFirestore(app);

const tid = localStorage.getItem('tid');
const tname = localStorage.getItem('tname');

if (!tid) window.location.href = 'home.html';
document.getElementById('tTitle').textContent = tname;

const inp = document.getElementById('inpContent');
const btn = document.getElementById('btnSend');
const list = document.getElementById('pList');

btn.addEventListener('click', async () => {
    if (!inp.value.trim()) return;
    try {
        await addDoc(collection(db, "posts"), {
            tid: tid,
            content: inp.value,
            createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, "topics", tid), { heat: increment(1) });
        inp.value = "";
    } catch (e) {
        alert("Lỗi");
    }
});

onSnapshot(query(collection(db, "posts"), where("tid", "==", tid), orderBy("createdAt", "desc")), (snap) => {
    list.innerHTML = "";
    snap.forEach(d => {
        const data = d.data();
        list.innerHTML += `
            <div class="post-card">
                <div style="white-space: pre-wrap;">${window.escapeHTML(data.content)}</div>
                <div class="post-meta">Vừa xong • Ẩn danh</div>
            </div>
        `;
    });
});
