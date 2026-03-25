import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface TransactionSummary {
  category: string;
  amount: number;
  count: number;
}

interface RequestBody {
  weeklySpending: TransactionSummary[];
  priorWeekSpending: TransactionSummary[];
  totalIncome: number;
  totalExpense: number;
  currency: string;
  period: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. Add it to your .env.local file." },
      { status: 500 }
    );
  }

  try {
    const body: RequestBody = await req.json();
    const { weeklySpending, priorWeekSpending, totalIncome, totalExpense, currency, period } = body;

    const prompt = `You are a personal finance advisor analyzing a user's spending data. Give a brief, friendly 3-5 sentence insight about their spending for ${period}.

Current period spending by category:
${weeklySpending.map((s) => `- ${s.category}: ${currency}${s.amount.toFixed(2)} (${s.count} transactions)`).join("\n")}

Total income: ${currency}${totalIncome.toFixed(2)}
Total expenses: ${currency}${totalExpense.toFixed(2)}
Net: ${currency}${(totalIncome - totalExpense).toFixed(2)}

Prior period spending for comparison:
${priorWeekSpending.length > 0
  ? priorWeekSpending.map((s) => `- ${s.category}: ${currency}${s.amount.toFixed(2)} (${s.count} transactions)`).join("\n")
  : "No prior period data available."
}

Instructions:
1. Mention what was spent most on this period
2. Compare to the prior period — what changed (up or down)
3. Give one specific, actionable tip to save money
Keep it concise, warm, and encouraging. Use the currency symbol ${currency} for all amounts. Do not use markdown formatting.`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
