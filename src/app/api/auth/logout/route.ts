import { NextResponse } from "next/server";
import { getLogoutCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set(getLogoutCookieOptions());
  return response;
}
