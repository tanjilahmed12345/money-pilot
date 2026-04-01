import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/liabilities
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const liabilities = await prisma.liability.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(liabilities);
}

// POST /api/liabilities
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const liability = await prisma.liability.create({
    data: { ...body, userId: session.userId },
  });
  return NextResponse.json(liability, { status: 201 });
}
