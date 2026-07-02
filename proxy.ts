import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
  // First, let the SDK handle its internal auth routes/session
  const authResponse = await auth0.middleware(request);

  // Define paths that require authentication
  const protectedPaths = [
    "/dashboard",
    "/adviser",
    "/settings",
    "/research",
    "/strategy",
    "/validate",
    "/trends",
    "/career",
    "/reports",
  ];

  const { pathname } = request.nextUrl;

  // If visiting a protected path, check if the user is authenticated
  if (protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    const session = await auth0.getSession(request);
    if (!session) {
      // Redirect to Auth0 Universal Login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Always return the auth response
  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
