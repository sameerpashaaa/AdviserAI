import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { getSessionFromCookiesAsync } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users, subscriptions, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  /** e.g. "plan_pro", "plan_team", "plan_enterprise" — matches the receipt prefix sent from create-order */
  receipt: z.string().optional(),
});

// ── Map receipt prefix → subscription tier ────────────────────────────────────
const RECEIPT_TO_TIER: Record<string, "pro" | "team" | "enterprise"> = {
  plan_pro: "pro",
  plan_team: "team",
  plan_enterprise: "enterprise",
};

// ── 30-day billing cycle ──────────────────────────────────────────────────────
const PLAN_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  // ── Auth check ───────────────────────────────────────────────────────────
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ── Parse & validate body ────────────────────────────────────────────────
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature." },
      { status: 400 }
    );
  }

  // ── Verify HMAC-SHA256 signature ─────────────────────────────────────────
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error("[Razorpay] RAZORPAY_KEY_SECRET is not set.");
    return NextResponse.json({ error: "Payment verification is not configured." }, { status: 500 });
  }

  const message = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(message)
    .digest("hex");

  if (expectedSignature !== body.razorpay_signature) {
    console.warn("[Razorpay] Signature mismatch for order", body.razorpay_order_id);
    return NextResponse.json(
      { error: "Payment signature verification failed." },
      { status: 400 }
    );
  }

  // ── Signature valid — activate subscription ───────────────────────────────
  const db = getDb();
  const userId = session.userId;

  // Resolve purchased tier from receipt prefix; default to "pro" if unrecognised
  const receiptPrefix = Object.keys(RECEIPT_TO_TIER).find(
    (k) => body.receipt?.startsWith(k)
  );
  const newTier: "pro" | "team" | "enterprise" = receiptPrefix
    ? RECEIPT_TO_TIER[receiptPrefix]
    : "pro";

  const now = new Date();
  const periodEnd = new Date(now.getTime() + PLAN_DURATION_MS);

  try {
    // Snapshot current tier for audit log
    const [currentUser] = await db
      .select({ subscriptionTier: users.subscriptionTier })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const oldTier = currentUser?.subscriptionTier ?? "free";

    await db.transaction(async (tx) => {
      // 1. Cancel any existing active subscriptions for this user
      const existingSubs = await tx
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));

      for (const sub of existingSubs) {
        await tx
          .update(subscriptions)
          .set({ status: "cancelled" })
          .where(eq(subscriptions.id, sub.id));
      }

      // 2. Insert new active subscription row
      await tx.insert(subscriptions).values({
        userId,
        plan: newTier,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        // Store Razorpay reference IDs inside the limits jsonb column
        limits: {
          razorpay_payment_id: body.razorpay_payment_id,
          razorpay_order_id: body.razorpay_order_id,
        },
      });

      // 3. Upgrade the user's subscriptionTier column
      await tx
        .update(users)
        .set({ subscriptionTier: newTier, updatedAt: now })
        .where(eq(users.id, userId));

      // 4. Write an immutable audit log entry
      await tx.insert(auditLogs).values({
        userId,
        action: "subscription.activated",
        resourceType: "subscription",
        oldValue: { tier: oldTier },
        newValue: {
          tier: newTier,
          razorpay_payment_id: body.razorpay_payment_id,
          razorpay_order_id: body.razorpay_order_id,
          period_start: now.toISOString(),
          period_end: periodEnd.toISOString(),
        },
      });
    });

    console.info(
      `[Razorpay] Subscription activated: user=${userId} tier=${newTier} payment=${body.razorpay_payment_id}`
    );

    return NextResponse.json({
      success: true,
      payment_id: body.razorpay_payment_id,
      order_id: body.razorpay_order_id,
      plan: newTier,
      period_end: periodEnd.toISOString(),
    });
  } catch (err) {
    console.error("[Razorpay] Failed to activate subscription:", err);
    return NextResponse.json(
      { error: "Payment received but subscription activation failed. Contact support." },
      { status: 500 }
    );
  }
}
