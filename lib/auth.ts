import crypto from "node:crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "adviserai_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  organizationId: string | null;
  workspaceId: string | null;
};

export function createDemoSessionCookie(): string {
  const payload: SessionUser = {
    userId: crypto.randomUUID(),
    email: "demo@adviserai.local",
    name: "Demo User",
    organizationId: null,
    workspaceId: null,
  };

  return Buffer.from(JSON.stringify({
    ...payload,
    expiresAt: Date.now() + SESSION_TTL_MS,
  })).toString("base64url");
}

export function readSessionFromCookie(value: string | undefined | null): SessionUser | null {
  if (!value) return null;

  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionUser & { expiresAt?: number };
    if (decoded.expiresAt && decoded.expiresAt < Date.now()) return null;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      organizationId: decoded.organizationId ?? null,
      workspaceId: decoded.workspaceId ?? null,
    };
  } catch {
    return null;
  }
}

export function getSessionFromCookies(): SessionUser | null {
  throw new Error("Use getSessionFromCookiesAsync in route handlers or server components.");
}

import { auth0 } from "./auth0";

export async function getSessionFromCookiesAsync(): Promise<SessionUser | null> {
  try {
    const session = await auth0.getSession();
    if (session?.user) {
      return {
        userId: session.user.sub || "",
        email: session.user.email || "",
        name: session.user.name || session.user.nickname || "",
        organizationId: null,
        workspaceId: null,
      };
    }
  } catch (err) {
    console.error("Error retrieving Auth0 session:", err);
  }

  const cookieStore = await cookies();
  return readSessionFromCookie(cookieStore.get(AUTH_COOKIE)?.value);
}
