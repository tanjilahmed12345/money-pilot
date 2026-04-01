import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/assets/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { id } = await params;
  const body = await req.json();
  const asset = await prisma.asset.update({
    where: { id, userId: session.userId },
    data: body,
  });
  return NextResponse.json(asset);
}

// DELETE /api/assets/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { id } = await params;
  await prisma.asset.delete({ where: { id, userId: session.userId } });
  return NextResponse.json({ success: true });
}
