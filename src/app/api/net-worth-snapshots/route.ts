import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/net-worth-snapshots — list all snapshots
export async function GET() {
  const snapshots = await prisma.netWorthSnapshot.findMany({
    orderBy: { month: "asc" },
  });
  return NextResponse.json(snapshots);
}

// POST /api/net-worth-snapshots — take a snapshot (upsert by month)
export async function POST(req: NextRequest) {
  const { month, assets, liabilities, netWorth } = await req.json();
  const snapshot = await prisma.netWorthSnapshot.upsert({
    where: { month },
    update: { assets, liabilities, netWorth },
    create: { month, assets, liabilities, netWorth },
  });
  return NextResponse.json(snapshot, { status: 201 });
}
