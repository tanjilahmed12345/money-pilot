import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// POST /api/transactions/import — bulk import
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const transactions = await req.json();
  if (!Array.isArray(transactions)) {
    return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withUser = transactions.map((t: any) => ({
    ...t,
    userId: session.userId,
  }));
  const created = await prisma.transaction.createMany({ data: withUser });
  return NextResponse.json({ count: created.count }, { status: 201 });
}
