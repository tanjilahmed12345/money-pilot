import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { requireAuth } from "@/lib/auth-api";

// POST /api/categories/reset — reset to default categories for this user
export async function POST() {
  const [session, err] = await requireAuth();
  if (err) return err;

  await prisma.category.deleteMany({ where: { userId: session.userId } });
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: session.userId })),
  });
  const categories = await prisma.category.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(categories);
}
