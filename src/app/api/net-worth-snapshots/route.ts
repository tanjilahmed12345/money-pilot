import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/net-worth-snapshots
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { userId: session.userId },
    orderBy: { month: "asc" },
  });
  return NextResponse.json(snapshots);
}

// POST /api/net-worth-snapshots — upsert by user+month
export async function POST(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const { month, assets, liabilities, netWorth } = await req.json();
  const snapshot = await prisma.netWorthSnapshot.upsert({
    where: { userId_month: { userId: session.userId, month } },
    update: { assets, liabilities, netWorth },
    create: { userId: session.userId, month, assets, liabilities, netWorth },
  });
  return NextResponse.json(snapshot, { status: 201 });
}
