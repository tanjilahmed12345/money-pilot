import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions — list all transactions
export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

// POST /api/transactions — create a transaction
export async function POST(req: NextRequest) {
  const body = await req.json();
  const transaction = await prisma.transaction.create({ data: body });
  return NextResponse.json(transaction, { status: 201 });
}

// DELETE /api/transactions — clear all transactions
export async function DELETE() {
  await prisma.transaction.deleteMany();
  return NextResponse.json({ success: true });
}
