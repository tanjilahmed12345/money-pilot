import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/merchant-map
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const mappings = await prisma.merchantMapping.findMany({
    where: { userId: session.userId },
  });
  const map: Record<string, string> = {};
  for (const m of mappings) {
    map[m.merchant] = m.categoryId;
  }
  return NextResponse.json(map);
}

// POST /api/merchant-map — upsert by user+merchant
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { merchant, categoryId } = await req.json();
  const key = merchant.toLowerCase().trim();
  const mapping = await prisma.merchantMapping.upsert({
    where: { userId_merchant: { userId: session.userId, merchant: key } },
    update: { categoryId },
    create: { userId: session.userId, merchant: key, categoryId },
  });
  return NextResponse.json(mapping, { status: 201 });
}

// DELETE /api/merchant-map
export async function DELETE(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { merchant } = await req.json();
  const key = merchant.toLowerCase().trim();
  await prisma.merchantMapping.delete({
    where: { userId_merchant: { userId: session.userId, merchant: key } },
  });
  return NextResponse.json({ success: true });
}
