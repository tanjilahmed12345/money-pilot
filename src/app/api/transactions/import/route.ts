import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/transactions/import — bulk import transactions
export async function POST(req: NextRequest) {
  const transactions = await req.json();

  if (!Array.isArray(transactions)) {
    return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  }

  const created = await prisma.transaction.createMany({ data: transactions });
  return NextResponse.json({ count: created.count }, { status: 201 });
}
