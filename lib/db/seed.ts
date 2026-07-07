import { getDb } from "./index";
import {
  users,
  organizations,
  workspaces,
  userSettings,
  featureFlags,
  subscriptions,
} from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  // ── Production Safety Guard ────────────────────────────────────────────────
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.APP_ENV === "production";

  if (isProd) {
    console.error("❌ CRITICAL WARNING: Attempted to run seed script in a PRODUCTION environment!");
    throw new Error("Seed script execution aborted. Seeds are not allowed in production.");
  }

  console.log("🌱 Starting database seeding...");
  const db = getDb();

  // 1. Seed Feature Flags
  console.log("-> Seeding feature flags...");
  const flags = [
    { name: "advanced-risk-agent", enabled: true, minimumTier: "pro" as const },
    { name: "deep-research-agent", enabled: true, minimumTier: "pro" as const },
    { name: "financial-forecasting", enabled: true, minimumTier: "team" as const },
    { name: "multi-agent-orchestrator", enabled: true, minimumTier: "team" as const },
    { name: "white-labeling", enabled: true, minimumTier: "enterprise" as const },
    { name: "custom-knowledge-base", enabled: true, minimumTier: "enterprise" as const },
  ];

  for (const flag of flags) {
    const existing = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.name, flag.name))
      .limit(1);

    if (!existing[0]) {
      await db.insert(featureFlags).values(flag);
      console.log(`   Added feature flag: ${flag.name}`);
    } else {
      console.log(`   Feature flag ${flag.name} already exists. Skipping.`);
    }
  }

  // 2. Seed default organization for team/enterprise testing
  console.log("-> Seeding sample organization...");
  const orgSlug = "acme-corp";
  let acmeOrgId: string;
  const existingOrg = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, orgSlug))
    .limit(1);

  if (!existingOrg[0]) {
    const [insertedOrg] = await db
      .insert(organizations)
      .values({
        name: "Acme Corporate Advisory",
        slug: orgSlug,
        plan: "team",
        seatsLimit: 10,
        seatsUsed: 1,
      })
      .returning();
    acmeOrgId = insertedOrg.id;
    console.log(`   Created organization Acme Corp (${acmeOrgId})`);
  } else {
    acmeOrgId = existingOrg[0].id;
    console.log(`   Organization Acme Corp already exists (${acmeOrgId}).`);
  }

  // 3. Seed demo users
  console.log("-> Seeding demo users...");
  const demoUsersList = [
    {
      email: "demo@adviserai.local",
      name: "Demo User",
      role: "user" as const,
      subscriptionTier: "free" as const,
      orgId: null,
    },
    {
      email: "pro-user@adviserai.local",
      name: "Pro Advisor",
      role: "user" as const,
      subscriptionTier: "pro" as const,
      orgId: null,
    },
    {
      email: "admin@adviserai.local",
      name: "Acme Admin",
      role: "admin" as const,
      subscriptionTier: "team" as const,
      orgId: acmeOrgId,
    },
  ];

  for (const demoUser of demoUsersList) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, demoUser.email))
      .limit(1);

    let userId: string;

    if (!existingUser[0]) {
      const [insertedUser] = await db
        .insert(users)
        .values({
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          subscriptionTier: demoUser.subscriptionTier,
          organizationId: demoUser.orgId,
        })
        .returning();
      userId = insertedUser.id;
      console.log(`   Created user ${demoUser.email} (${userId})`);
    } else {
      userId = existingUser[0].id;
      console.log(`   User ${demoUser.email} already exists (${userId}).`);
    }

    // Ensure User Settings exist
    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (!existingSettings[0]) {
      await db.insert(userSettings).values({
        userId,
        fullName: demoUser.name,
        company: demoUser.orgId ? "Acme Corp" : "Self-employed",
        role: demoUser.role === "admin" ? "Advisory Director" : "Business Strategist",
        theme: "dark",
        language: "English",
      });
      console.log(`   Initialized settings for user: ${demoUser.email}`);
    }

    // Ensure Subscriptions exist matching their tier
    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!existingSub[0]) {
      await db.insert(subscriptions).values({
        userId,
        organizationId: demoUser.orgId,
        plan: demoUser.subscriptionTier,
        status: "active",
        limits: {
          queriesPerMonth: demoUser.subscriptionTier === "free" ? 50 : 500,
          reportsPerMonth: demoUser.subscriptionTier === "free" ? 5 : 50,
        },
      });
      console.log(`   Initialized subscription limits for user: ${demoUser.email}`);
    }

    // Ensure default workspace exists
    const existingWorkspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId))
      .limit(1);

    if (!existingWorkspace[0]) {
      await db.insert(workspaces).values({
        userId,
        organizationId: demoUser.orgId,
        title: "My Advisory Workspace",
        description: "Primary workspace for strategic analysis and advisor chat sessions.",
        type: "startup",
        status: "active",
      });
      console.log(`   Created default workspace for user: ${demoUser.email}`);
    }
  }

  console.log("✨ Seeding completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding encountered an error:", err);
    process.exit(1);
  });
