import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// This is a simple version. Later we will make it more powerful.
export async function GET(request: NextRequest) {
  // Secret key so random people cannot trigger it
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== "eqonomy-daily-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all saved FCM tokens
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

    // For now we just return the count.
    // Real sending needs Firebase Admin SDK (we will add it next).
    return NextResponse.json({
      success: true,
      message: "Daily job triggered",
      tokensFound: tokens.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}