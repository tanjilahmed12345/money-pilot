import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/budgets
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const budgets = await prisma.budget.findMany({ where: { userId: session.userId } });
  return NextResponse.json(budgets);
}

// POST /api/budgets — upsert by user+category+month
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { category, amount, month } = await req.json();
  const budget = await prisma.budget.upsert({
    where: { userId_category_month: { userId: session.userId, category, month } },
    update: { amount },
    create: { userId: session.userId, category, amount, month },
  });
  return NextResponse.json(budget, { status: 201 });
}

// DELETE /api/budgets — clear all for this user
export async function DELETE() {
  const [session, err] = await requireAuth();
  if (err) return err;

  await prisma.budget.deleteMany({ where: { userId: session.userId } });
  return NextResponse.json({ success: true });
}
