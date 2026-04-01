import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/budgets — list all budgets
export async function GET() {
  const budgets = await prisma.budget.findMany();
  return NextResponse.json(budgets);
}

// POST /api/budgets — create or update a budget (upsert by category+month)
export async function POST(req: NextRequest) {
  const { category, amount, month } = await req.json();
  const budget = await prisma.budget.upsert({
    where: { category_month: { category, month } },
    update: { amount },
    create: { category, amount, month },
  });
  return NextResponse.json(budget, { status: 201 });
}

// DELETE /api/budgets — clear all budgets
export async function DELETE() {
  await prisma.budget.deleteMany();
  return NextResponse.json({ success: true });
}
