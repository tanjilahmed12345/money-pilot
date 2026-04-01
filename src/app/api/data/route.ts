import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/data — fetch all data in one request (used for initial hydration)
export async function GET() {
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
    prisma.transaction.findMany({ orderBy: { date: "desc" } }),
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.budget.findMany(),
    prisma.recurringTransaction.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.savingsGoal.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.asset.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.liability.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.netWorthSnapshot.findMany({ orderBy: { month: "asc" } }),
    prisma.merchantMapping.findMany(),
    prisma.settings.findUnique({ where: { id: "default" } }),
    prisma.aiSummary.findUnique({ where: { id: "default" } }),
  ]);

  // Convert merchant mappings array to record
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
