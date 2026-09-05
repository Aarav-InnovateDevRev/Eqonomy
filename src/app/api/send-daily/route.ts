import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== "eqonomy-daily-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tokensSnap = await adminDb.collection("fcmTokens").get();
    const tokens: string[] = [];

    tokensSnap.forEach((doc: any) => {
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

    const response = await (adminMessaging as any).sendEachForMulticast({
      notification: {
        title: "Good morning from Eqonomy!",
        body: "New opportunities are waiting for you in Delhi-NCR. Open the app and check them out.",
      },
      tokens,
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