import { Auth0Client } from "@auth0/nextjs-auth0/server";

const appBaseUrl = process.env.AUTH0_BASE_URL || process.env.APP_BASE_URL;

if (!appBaseUrl) {
  throw new Error("AUTH0_BASE_URL (or APP_BASE_URL) environment variable is required but missing.");
}

export const auth0 = new Auth0Client({
  appBaseUrl,
});

