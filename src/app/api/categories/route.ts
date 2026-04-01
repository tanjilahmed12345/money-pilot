import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/categories
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const categories = await prisma.category.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(categories);
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const category = await prisma.category.create({
    data: { ...body, userId: session.userId },
  });
  return NextResponse.json(category, { status: 201 });
}
