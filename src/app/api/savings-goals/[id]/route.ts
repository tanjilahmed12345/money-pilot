import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/savings-goals/:id — update a savings goal
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(goal);
}

// DELETE /api/savings-goals/:id — delete a savings goal
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.savingsGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
