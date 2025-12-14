import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
      apiKey: "AIzaSyBPEMno1uZFg4uVXZjz-PbBR37gH6-3t5Y",
  authDomain: "confe-web.firebaseapp.com",
  projectId: "confe-web",
  storageBucket: "confe-web.firebasestorage.app",
  messagingSenderId: "677778119372",
  appId: "1:677778119372:web:ee3f1132871332743b0069"
};

const app = initializeApp(firebaseConfig);
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
            <div class="topic-item" onclick="localStorage.setItem('tid','${doc.id}');localStorage.setItem('tname','${d.title}');window.location.href='detail.html'">
                <span>${d.title}</span>
                <span>🔥 ${d.heat}</span>
            </div>
        `;
        topicList.innerHTML += html;
        if (i < 3) rankingList.innerHTML += html;
        i++;
    });
});