import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/savings-goals
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(goals);
}

// POST /api/savings-goals
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const goal = await prisma.savingsGoal.create({
    data: { ...body, userId: session.userId },
  });
  return NextResponse.json(goal, { status: 201 });
}
