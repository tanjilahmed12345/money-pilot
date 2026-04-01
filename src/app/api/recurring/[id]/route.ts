import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/recurring/:id — update a recurring transaction
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const recurring = await prisma.recurringTransaction.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(recurring);
}

// DELETE /api/recurring/:id — delete a recurring transaction
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.recurringTransaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
