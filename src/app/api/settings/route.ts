import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

// GET /api/settings
export async function GET() {
  const [session, err] = await requireAuth();
  if (err) return err;

  let settings = await prisma.settings.findUnique({
    where: { userId: session.userId },
  });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId: session.userId, theme: "system", currency: "৳" },
    });
  }
  return NextResponse.json(settings);
}

// PATCH /api/settings
export async function PATCH(req: NextRequest) {
  const [session, err] = await requireAuth();
  if (err) return err;

  const body = await req.json();
  const settings = await prisma.settings.upsert({
    where: { userId: session.userId },
    update: body,
    create: { userId: session.userId, ...body },
  });
  return NextResponse.json(settings);
}
