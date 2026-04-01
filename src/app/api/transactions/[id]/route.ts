import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/transactions/:id — update a transaction
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const transaction = await prisma.transaction.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(transaction);
}

// DELETE /api/transactions/:id — delete a transaction
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
