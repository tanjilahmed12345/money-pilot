import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/assets — list all assets
export async function GET() {
  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(assets);
}

// POST /api/assets — create an asset
export async function POST(req: NextRequest) {
  const body = await req.json();
  const asset = await prisma.asset.create({ data: body });
  return NextResponse.json(asset, { status: 201 });
}
