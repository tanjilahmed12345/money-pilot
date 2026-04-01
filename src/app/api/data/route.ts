import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/data — fetch all data for the logged-in user
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;
  const userId = session.userId;

  const [
    transactions,
    categories,
    budgets,
    recurringTransactions,
    savingsGoals,
    assets,
    liabilities,
    netWorthSnapshots,
    merchantMappings,
    settings,
    aiSummary,
  ] = await Promise.all([
    prisma.transaction.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.category.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.recurringTransaction.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.asset.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.liability.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.netWorthSnapshot.findMany({ where: { userId }, orderBy: { month: "asc" } }),
    prisma.merchantMapping.findMany({ where: { userId } }),
    prisma.settings.findUnique({ where: { userId } }),
    prisma.aiSummary.findUnique({ where: { userId } }),
  ]);

  const merchantMap: Record<string, string> = {};
  for (const m of merchantMappings) {
    merchantMap[m.merchant] = m.categoryId;
  }

  return NextResponse.json({
    transactions,
    categories,
    budgets,
    recurringTransactions,
    savingsGoals,
    assets,
    liabilities,
    netWorthSnapshots,
    merchantMap,
    settings: settings ?? { theme: "system", currency: "৳" },
    aiSummary,
  });
}
