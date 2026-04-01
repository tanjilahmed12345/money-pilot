import { NextResponse } from "next/server";
import { getSession, JWTPayload } from "./auth";

/**
 * Get the authenticated user's session or return a 401 response.
 * Usage in API routes:
 *   const [session, errorRes] = await requireAuth();
 *   if (errorRes) return errorRes;
 *   // session.userId is now available
 */
export async function requireAuth(): Promise<
  [JWTPayload, null] | [null, NextResponse]
> {
  const session = await getSession();
  if (!session) {
    return [
      null,
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    ];
  }
  return [session, null];
}
