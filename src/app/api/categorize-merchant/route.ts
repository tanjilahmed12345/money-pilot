import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface RequestBody {
  merchant: string;
  categories: { id: string; name: string }[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { merchant, categories }: RequestBody = await req.json();

    if (!merchant || !categories?.length) {
      return NextResponse.json({ error: "Missing merchant or categories" }, { status: 400 });
    }

    const categoryList = categories.map((c) => `- ${c.id}: ${c.name}`).join("\n");

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 50,
      messages: [{
        role: "user",
        content: `What spending category does the merchant "${merchant}" belong to? Reply with ONLY the category ID from this list, nothing else:\n\n${categoryList}`,
      }],
    });

    const text = (message.content[0].type === "text" ? message.content[0].text : "").trim();
    const matched = categories.find((c) => text.includes(c.id));

    return NextResponse.json({ categoryId: matched?.id || null });
  } catch (err) {
    console.error("Categorize error:", err);
    return NextResponse.json({ error: "Failed to categorize" }, { status: 500 });
  }
}
