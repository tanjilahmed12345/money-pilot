import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/liabilities/:id — update a liability
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const liability = await prisma.liability.update({ where: { id }, data: body });
  return NextResponse.json(liability);
}

// DELETE /api/liabilities/:id — delete a liability
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.liability.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
