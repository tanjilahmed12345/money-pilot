import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/ai-summary
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const summary = await prisma.aiSummary.findUnique({
    where: { userId: session.userId },
  });
  return NextResponse.json(summary);
}

// POST /api/ai-summary
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { text, generatedAt, transactionCount } = await req.json();
  const summary = await prisma.aiSummary.upsert({
    where: { userId: session.userId },
    update: { text, generatedAt, transactionCount },
    create: { userId: session.userId, text, generatedAt, transactionCount },
  });
  return NextResponse.json(summary, { status: 201 });
}

// DELETE /api/ai-summary
export async function DELETE() {
  const [session, err] = await requireAuth();
  if (err) return err;

  await prisma.aiSummary.deleteMany({ where: { userId: session.userId } });
  return NextResponse.json({ success: true });
}
