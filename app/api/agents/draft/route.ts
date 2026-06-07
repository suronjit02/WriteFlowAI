import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { groq } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (dbUser.status === "banned") {
      return NextResponse.json({ error: "User is banned" }, { status: 403 });
    }

    const body = await request.json();
    const { topic, tone, audience, wordCount, type } = body;

    if (!topic || !tone || !audience || !wordCount || !type) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const prompt = `You are a professional content writer. Generate a ${tone} ${type} about '${topic}' for ${audience}. Target word count: ${wordCount} words. Return JSON only with this exact structure, no markdown, no code blocks: {"title": "string", "content": "string", "metaDescription": "string", "tags": ["string"]}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a JSON-only response bot. Always respond with valid JSON only. No markdown, no code blocks, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.1-8b-instant",
    });

    const text = completion.choices[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanText = jsonMatch ? jsonMatch[0] : text;

    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", text, parseError);
      data = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} about ${topic}`,
        content: text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim(),
        metaDescription: `An AI-generated ${type} about ${topic} for ${audience}.`,
        tags: [type, tone],
      };
    }

    const tokensUsed =
      completion.usage?.total_tokens ?? Math.round(wordCount * 1.3) ?? 200;
    await supabaseAdmin.from("ai_usage_logs").insert({
      agent_type: "draft",
      prompt_snippet: prompt.substring(0, 100),
      tokens_used: tokensUsed,
      user_id: dbUser.id,
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Draft API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
