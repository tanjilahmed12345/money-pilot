import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/savings-goals — list all savings goals
export async function GET() {
  const goals = await prisma.savingsGoal.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(goals);
}

// POST /api/savings-goals — create a savings goal
export async function POST(req: NextRequest) {
  const body = await req.json();
  const goal = await prisma.savingsGoal.create({ data: body });
  return NextResponse.json(goal, { status: 201 });
}
