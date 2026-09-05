import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import app, { db } from "./firebase";

export async function requestNotificationPermission(userId: string) {
  try {
    // Check if browser supports notifications
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("This browser does not support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission not granted");
      return null;
    }

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      // Save the token to Firestore so we can send notifications later
      await setDoc(
        doc(db, "fcmTokens", userId),
        {
          token,
          userId,
          updatedAt: serverTimestamp(),
          platform: "web",
        },
        { merge: true }
      );

      console.log("FCM Token saved:", token);
      return token;
    }

    return null;
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
}

// Listen for foreground messages (when website is open)
export function onForegroundMessage(callback: (payload: any) => void) {
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, callback);
  } catch (error) {
    console.error("Error setting foreground listener:", error);
  }
}