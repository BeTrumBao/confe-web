importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBPEMno1uZFg4uVXZjz-PbBR37gH6-3t5Y",
    authDomain: "confe-web.vercel.app",
    projectId: "confe-web",
    storageBucket: "confe-web.firebasestorage.app",
    messagingSenderId: "677778119372",
    appId: "1:677778119372:web:ee3f1132871332743b0069"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received: ', payload);
    
    // If we want to show it manually to ensure it appears:
    if (payload.notification) {
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/assets/favicon.png',
            tag: payload.notification.tag || payload.data?.tag || 'default-tag',
            data: payload.data
        };
        // Note: Browsers usually handle "notification" payload automatically.
        // We only call this if we suspect it's not happening.
        // To fix DUPLICATES, we should check if the browser already showed it.
        // But for "No Notifications", calling it manually is safer.
        self.registration.showNotification(notificationTitle, notificationOptions);
    }
});
