import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  merchant: string;
  categories: { id: string; name: string }[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { merchant, categories }: RequestBody = await req.json();

    if (!merchant || !categories?.length) {
      return NextResponse.json({ error: "Missing merchant or categories" }, { status: 400 });
    }

    const categoryList = categories.map((c) => `- ${c.id}: ${c.name}`).join("\n");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `What spending category does the merchant "${merchant}" belong to? Reply with ONLY the category ID from this list, nothing else:\n\n${categoryList}`,
        }],
        max_tokens: 50,
      }),
    });

    if (!res.ok) {
      console.error("Groq API error:", await res.text());
      return NextResponse.json({ categoryId: null });
    }

    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content || "").trim();
    const matched = categories.find((c) => text.includes(c.id));

    return NextResponse.json({ categoryId: matched?.id || null });
  } catch (err) {
    console.error("Categorize error:", err);
    return NextResponse.json({ error: "Failed to categorize" }, { status: 500 });
  }
}
