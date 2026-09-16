import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, opportunities } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Build a short summary of current opportunities for the AI
    const oppSummary =
      Array.isArray(opportunities) && opportunities.length > 0
        ? opportunities
            .slice(0, 15)
            .map(
              (o: any, i: number) =>
                `${i + 1}. [${o.type}] ${o.title} — ${o.compensation || "N/A"} — ${o.location || (o.isRemote ? "Remote" : "Delhi-NCR")} — Skills: ${(o.skillsRequired || []).join(", ") || "None"}`
            )
            .join("\n")
        : "No opportunities are currently listed.";

    const systemPrompt = `You are Eqonomy AI, a helpful assistant for the Eqonomy opportunity marketplace (Delhi-NCR focused).

Your job:
- Help users find opportunities that match their skills, interests, and goals
- Suggest relevant opportunities from the live list below
- Explain types (Paid Project, Guidance, Internship, Challenge, etc.)
- Be friendly, clear, and concise

Current live opportunities:
${oppSummary}

Formatting rules (important):
- Do NOT use markdown tables
- Do NOT use ** or * for bold/italic
- Use plain text only
- Use short paragraphs
- For lists, use simple lines like:
  1. Title
  2. Title
- When suggesting an opportunity, write it like this:

  Opportunity: [title]
  Type: [type]
  Pay: [compensation]
  Location: [location]
  Why it fits: [one short line]

Rules:
- Do not invent opportunities that are not in the list
- Prefer short, useful answers
- If nothing matches, say so honestly`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Sorry, I could not generate a reply. Please try again.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: err.message || "AI request failed" },
      { status: 500 }
    );
  }
}