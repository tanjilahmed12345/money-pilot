import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/recurring — list all recurring transactions
export async function GET() {
  const recurring = await prisma.recurringTransaction.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(recurring);
}

// POST /api/recurring — create a recurring transaction
export async function POST(req: NextRequest) {
  const body = await req.json();
  const recurring = await prisma.recurringTransaction.create({ data: body });
  return NextResponse.json(recurring, { status: 201 });
}
