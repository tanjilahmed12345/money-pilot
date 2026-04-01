import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/assets/:id — update an asset
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const asset = await prisma.asset.update({ where: { id }, data: body });
  return NextResponse.json(asset);
}

// DELETE /api/assets/:id — delete an asset
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.asset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
