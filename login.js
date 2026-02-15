import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

const emailIn = document.getElementById('email');
const passIn = document.getElementById('password');
const btnSubmit = document.getElementById('btnSubmit');
const btnSwitch = document.getElementById('btnSwitch');

let isLogin = true;

btnSwitch.addEventListener('click', () => {
    isLogin = !isLogin;
    btnSubmit.textContent = isLogin ? "Đăng nhập" : "Đăng ký";
    btnSwitch.textContent = isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập";
});

btnSubmit.addEventListener('click', () => {
    const email = emailIn.value;
    const pass = passIn.value;

    if (isLogin) {
        signInWithEmailAndPassword(auth, email, pass)
            .then(() => window.top.location.href = 'index.html')
            .catch(e => alert("Lỗi: " + e.message));
    } else {
        createUserWithEmailAndPassword(auth, email, pass)
            .then(() => {
                alert("Đăng ký thành công!");
                window.top.location.href = 'index.html';
            })
            .catch(e => alert("Lỗi: " + e.message));
    }
});