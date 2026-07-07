"use client";

import { useState, useCallback } from "react";

// ── Razorpay global type declarations ────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ── Component props ──────────────────────────────────────────────────────────
export interface RazorpayCheckoutProps {
  /** Amount in INR (rupees). e.g. 999 = ₹999 */
  amountInr: number;
  /** Readable label shown in the receipt (max 40 chars) */
  receipt?: string;
  /** Name of what is being purchased, shown in the Razorpay modal */
  description?: string;
  /** Prefill customer name shown in modal */
  customerName?: string;
  /** Prefill customer email shown in modal */
  customerEmail?: string;
  /** Called when payment is successfully verified on the backend */
  onSuccess?: (paymentId: string, orderId: string, plan: string, periodEnd: string) => void;
  /** Called if the user dismisses the modal or payment fails */
  onCancel?: () => void;
  /** Button label */
  label?: string;
  /** Extra className applied to the button */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
}

// ── Inline script loader ─────────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Component ────────────────────────────────────────────────────────────────
export default function RazorpayCheckout({
  amountInr,
  receipt = "payment",
  description = "Adviser AI",
  customerName,
  customerEmail,
  onSuccess,
  onCancel,
  label = "Pay Now",
  className = "",
  disabled = false,
}: RazorpayCheckoutProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    setStatus("loading");
    setErrorMsg(null);

    // 1. Ensure the Razorpay checkout script is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setStatus("error");
      setErrorMsg("Failed to load payment gateway. Check your internet connection.");
      return;
    }

    // 2. Create an order on our backend
    let order: { order_id: string; amount: number; currency: string };
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr, receipt }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? "Failed to create order.");
      }

      order = await res.json() as typeof order;
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to initiate payment.");
      return;
    }

    // 3. Open the Razorpay checkout modal
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      setStatus("error");
      setErrorMsg("Payment gateway is not configured. Contact support.");
      return;
    }

    const rzp = new window.Razorpay({
      key: keyId,
      amount: order.amount as number,
      currency: order.currency,
      name: "Adviser AI",
      description,
      order_id: order.order_id,
      prefill: {
        name: customerName,
        email: customerEmail,
      },
      theme: { color: "#7c3aed" },

      handler: async (response: RazorpayPaymentResponse) => {
        // 4. Verify payment signature on our backend
        setStatus("verifying");
        try {
          const vRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              // Pass receipt so the backend can resolve the correct plan tier
              receipt,
            }),
          });

          if (!vRes.ok) {
            const errPayload = await vRes.json().catch(() => null) as { error?: string } | null;
            throw new Error(errPayload?.error ?? "Payment verification failed.");
          }

          const verified = await vRes.json() as { payment_id: string; order_id: string; plan: string; period_end: string };
          setStatus("success");
          onSuccess?.(verified.payment_id, verified.order_id, verified.plan, verified.period_end);
        } catch (verifyErr) {
          setStatus("error");
          setErrorMsg(verifyErr instanceof Error ? verifyErr.message : "Payment verification failed.");
        }
      },

      modal: {
        ondismiss: () => {
          setStatus("idle");
          onCancel?.();
        },
      },
    });

    // Listen for payment failure event
    rzp.on("payment.failed", (response: { error: { description: string } }) => {
      setStatus("error");
      setErrorMsg(response.error?.description ?? "Payment failed. Please try again.");
    });

    rzp.open();
  }, [amountInr, receipt, description, customerName, customerEmail, onSuccess, onCancel]);

  // ── Derived button state ──────────────────────────────────────────────────
  const isLoading = status === "loading" || status === "verifying";
  const buttonLabel =
    status === "loading" ? "Preparing…"
    : status === "verifying" ? "Verifying…"
    : status === "success" ? "✓ Payment Successful"
    : label;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <button
        id="razorpay-checkout-btn"
        className={`btn btn-primary ${className}`}
        onClick={handleCheckout}
        disabled={disabled || isLoading || status === "success"}
        style={{
          opacity: disabled || isLoading ? 0.7 : 1,
          cursor: disabled || isLoading ? "not-allowed" : "pointer",
          transition: "opacity 0.2s",
        }}
      >
        {isLoading && (
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              border: "2px solid rgba(255,255,255,0.4)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              marginRight: 8,
            }}
          />
        )}
        {buttonLabel}
      </button>

      {errorMsg && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "#f87171",
            margin: 0,
            maxWidth: 320,
          }}
        >
          {errorMsg}
        </p>
      )}

      {/* CSS for spinner (inline so no extra stylesheet needed) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
