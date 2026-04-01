import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/recurring
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const recurring = await prisma.recurringTransaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(recurring);
}

// POST /api/recurring
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const recurring = await prisma.recurringTransaction.create({
    data: { ...body, userId: session.userId },
  });
  return NextResponse.json(recurring, { status: 201 });
}
