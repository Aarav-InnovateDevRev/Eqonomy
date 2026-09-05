/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA_WO5oyiQoO5jSjfey5lDgEYTnpURRrqo",
  authDomain: "eqonomy-67xyz.firebaseapp.com",
  projectId: "eqonomy-67xyz",
  storageBucket: "eqonomy-67xyz.firebasestorage.app",
  messagingSenderId: "418191607298",
  appId: "1:418191607298:web:0fa4590e5982c58027c91b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Eqonomy";
  const options = {
    body: payload.notification?.body || "",
    icon: "/logo.png",
    badge: "/logo.png",
  };

  self.registration.showNotification(title, options);
});