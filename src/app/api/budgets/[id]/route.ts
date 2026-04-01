import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/budgets/:id — delete a budget
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
