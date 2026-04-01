import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/transactions
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const transaction = await prisma.transaction.create({
    data: { ...body, userId: session.userId },
  });
  return NextResponse.json(transaction, { status: 201 });
}

// DELETE /api/transactions — clear all for this user
export async function DELETE() {
  const [session, err] = await requireAuth();
  if (err) return err;

  await prisma.transaction.deleteMany({ where: { userId: session.userId } });
  return NextResponse.json({ success: true });
}
