import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from "../../serviceAccountKey.json";

let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount as any),
  });
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
export const adminMessaging = getMessaging(app);