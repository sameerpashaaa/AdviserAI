import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { getSessionFromCookiesAsync } from "@/lib/auth";

const bodySchema = z.object({
  /** Amount in INR (rupees). We convert to paise internally. */
  amountInr: z.number().positive(),
  currency: z.string().length(3).default("INR"),
  /** Human-readable receipt label — e.g. "plan_pro" or "upgrade_team". */
  receipt: z.string().max(40).default("receipt"),
});

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(req: Request) {
  // ── Auth check ──────────────────────────────────────────────────────────
  const session = await getSessionFromCookiesAsync();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ── Validate body ────────────────────────────────────────────────────────
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected { amountInr, currency?, receipt? }." },
      { status: 400 }
    );
  }

  // ── Convert to paise and enforce minimum ─────────────────────────────────
  const amountPaise = Math.round(body.amountInr * 100);
  if (amountPaise < 100) {
    return NextResponse.json(
      { error: "Amount must be at least ₹1 (100 paise)." },
      { status: 400 }
    );
  }

  // ── Create Razorpay order ─────────────────────────────────────────────────
  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: body.currency,
      receipt: `${body.receipt}_${Date.now()}`,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("[Razorpay] Create order error:", err);
    return NextResponse.json(
      { error: "Failed to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
