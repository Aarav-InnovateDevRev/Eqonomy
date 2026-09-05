import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from "../../../../serviceAccountKey.json";

// Initialize Firebase Admin only once
let app: App;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount as any),
  });
} else {
  app = getApps()[0];
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== "eqonomy-daily-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all FCM tokens
    const tokensSnap = await getDocs(collection(db, "fcmTokens"));
    const tokens: string[] = [];

    tokensSnap.forEach((doc) => {
      const data = doc.data();
      if (data.token) tokens.push(data.token);
    });

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No tokens found",
        sent: 0,
      });
    }

    const messaging = getMessaging(app);

    const response = await messaging.sendEachForMulticast({
      notification: {
        title: "Good morning from Eqonomy!",
        body: "New opportunities are waiting for you in Delhi-NCR. Open the app and check them out.",
      },
      tokens: tokens,
    });

    return NextResponse.json({
      success: true,
      message: "Daily notifications sent",
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}