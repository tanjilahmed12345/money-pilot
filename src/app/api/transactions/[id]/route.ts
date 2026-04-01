import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/transactions/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { id } = await params;
  const body = await req.json();
  const transaction = await prisma.transaction.update({
    where: { id, userId: session.userId },
    data: body,
  });
  return NextResponse.json(transaction);
}

// DELETE /api/transactions/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { id } = await params;
  await prisma.transaction.delete({ where: { id, userId: session.userId } });
  return NextResponse.json({ success: true });
}
