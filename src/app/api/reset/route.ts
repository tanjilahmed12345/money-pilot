import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { requireAuth } from "@/lib/auth-api";

// POST /api/reset — reset all data for this user
export async function POST() {
  const [session, err] = await requireAuth();
  if (err) return err;
  const userId = session.userId;

  await Promise.all([
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.recurringTransaction.deleteMany({ where: { userId } }),
    prisma.savingsGoal.deleteMany({ where: { userId } }),
    prisma.asset.deleteMany({ where: { userId } }),
    prisma.liability.deleteMany({ where: { userId } }),
    prisma.netWorthSnapshot.deleteMany({ where: { userId } }),
    prisma.merchantMapping.deleteMany({ where: { userId } }),
    prisma.aiSummary.deleteMany({ where: { userId } }),
    prisma.settings.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId } }),
  ]);

  // Re-seed default categories and settings for this user
  await Promise.all([
    prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
    }),
    prisma.settings.create({
      data: { userId, theme: "system", currency: "৳" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
