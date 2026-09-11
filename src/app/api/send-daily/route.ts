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

let successCount = 0;
let failureCount = 0;

for (const token of tokens) {
  try {
    await adminMessaging.send({
  token,
  notification: {
    title: "Eqonomy Daily · Delhi-NCR",
    body: "Fresh opportunities are live 🔥🔥🌱. Open Eqonomy and find your next project, guidance session or challenge.",
  },
  data: {
    url: "/dashboard",
  },
});
    successCount++;
  } catch (err) {
    console.error("Failed to send to token:", token, err);
    failureCount++;
  }
}

const response = { successCount, failureCount };

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