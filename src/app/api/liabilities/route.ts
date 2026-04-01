import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/liabilities — list all liabilities
export async function GET() {
  const liabilities = await prisma.liability.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(liabilities);
}

// POST /api/liabilities — create a liability
export async function POST(req: NextRequest) {
  const body = await req.json();
  const liability = await prisma.liability.create({ data: body });
  return NextResponse.json(liability, { status: 201 });
}
