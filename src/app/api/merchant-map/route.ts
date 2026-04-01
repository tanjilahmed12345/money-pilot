import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/merchant-map — get all merchant mappings as a record
export async function GET() {
  const mappings = await prisma.merchantMapping.findMany();
  const map: Record<string, string> = {};
  for (const m of mappings) {
    map[m.merchant] = m.categoryId;
  }
  return NextResponse.json(map);
}

// POST /api/merchant-map — set a merchant→category mapping
export async function POST(req: NextRequest) {
  const { merchant, categoryId } = await req.json();
  const key = merchant.toLowerCase().trim();
  const mapping = await prisma.merchantMapping.upsert({
    where: { merchant: key },
    update: { categoryId },
    create: { merchant: key, categoryId },
  });
  return NextResponse.json(mapping, { status: 201 });
}

// DELETE /api/merchant-map — delete a merchant mapping
export async function DELETE(req: NextRequest) {
  const { merchant } = await req.json();
  const key = merchant.toLowerCase().trim();
  await prisma.merchantMapping.delete({ where: { merchant: key } });
  return NextResponse.json({ success: true });
}
