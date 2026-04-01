import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ai-summary — get cached AI summary
export async function GET() {
  const summary = await prisma.aiSummary.findUnique({ where: { id: "default" } });
  return NextResponse.json(summary);
}

// POST /api/ai-summary — save AI summary
export async function POST(req: NextRequest) {
  const { text, generatedAt, transactionCount } = await req.json();
  const summary = await prisma.aiSummary.upsert({
    where: { id: "default" },
    update: { text, generatedAt, transactionCount },
    create: { id: "default", text, generatedAt, transactionCount },
  });
  return NextResponse.json(summary, { status: 201 });
}

// DELETE /api/ai-summary — clear AI summary
export async function DELETE() {
  await prisma.aiSummary.deleteMany();
  return NextResponse.json({ success: true });
}
