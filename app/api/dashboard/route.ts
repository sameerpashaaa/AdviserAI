import { NextResponse } from "next/server";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDashboardMetrics, getOrCreateUserByEmail } from "@/lib/db/runtime";

export async function GET() {
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await getOrCreateUserByEmail(session.email, session.name);
  const metrics = await getDashboardMetrics(user.id);
  return NextResponse.json({ metrics, user });
}
