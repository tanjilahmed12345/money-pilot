import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message:
          "If an account with that email exists, a reset link has been generated.",
      });
    }

    // Clean up old tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = uuid();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    // In production you'd send an email here with the reset link
    // For now we log it and return a message
    console.log(`Password reset token for ${email}: ${token}`);

    return NextResponse.json({
      message:
        "If an account with that email exists, a reset link has been generated.",
      // Include token in dev for testing
      ...(process.env.NODE_ENV !== "production" && { resetToken: token }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
