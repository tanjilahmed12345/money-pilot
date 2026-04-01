import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/assets
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const assets = await prisma.asset.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(assets);
}

// POST /api/assets
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const asset = await prisma.asset.create({
    data: { ...body, userId: session.userId },
  });
  return NextResponse.json(asset, { status: 201 });
}
