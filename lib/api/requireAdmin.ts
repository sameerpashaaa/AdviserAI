import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookiesAsync, SessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type DbUser = typeof users.$inferSelect;

export type AdminContext = {
  session: SessionUser;
  dbUser: DbUser;
};

/**
 * Ensures the caller is authenticated and has admin or super_admin role.
 * Returns AdminContext on success, or a 401/403 NextResponse on failure.
 */
export async function requireAdmin(
  req: NextRequest
): Promise<AdminContext | NextResponse> {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  if (dbUser.role !== "admin" && dbUser.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
  }

  return { session, dbUser };
}

/** Type guard to check if the result is an AdminContext (not a NextResponse). */
export function isAdminContext(
  result: AdminContext | NextResponse
): result is AdminContext {
  return "session" in result;
}
