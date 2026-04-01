import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

// POST /api/reset — reset all data to defaults
export async function POST() {
  await Promise.all([
    prisma.transaction.deleteMany(),
    prisma.budget.deleteMany(),
    prisma.recurringTransaction.deleteMany(),
    prisma.savingsGoal.deleteMany(),
    prisma.asset.deleteMany(),
    prisma.liability.deleteMany(),
    prisma.netWorthSnapshot.deleteMany(),
    prisma.merchantMapping.deleteMany(),
    prisma.aiSummary.deleteMany(),
    prisma.settings.deleteMany(),
    prisma.category.deleteMany(),
  ]);

  // Re-seed default categories and settings
  await Promise.all([
    prisma.category.createMany({ data: DEFAULT_CATEGORIES }),
    prisma.settings.create({
      data: { id: "default", theme: "system", currency: "৳" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
