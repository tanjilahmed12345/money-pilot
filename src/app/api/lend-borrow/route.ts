import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/lend-borrow
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const items = await prisma.lendBorrowTransaction.findMany({
    where: { userId: session.userId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

// POST /api/lend-borrow
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const item = await prisma.lendBorrowTransaction.create({
    data: { ...body, userId: session.userId },
  });
  return NextResponse.json(item, { status: 201 });
}
