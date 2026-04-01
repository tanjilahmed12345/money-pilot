import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

// POST /api/categories/reset — reset to default categories
export async function POST() {
  await prisma.category.deleteMany();
  await prisma.category.createMany({ data: DEFAULT_CATEGORIES });
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(categories);
}
