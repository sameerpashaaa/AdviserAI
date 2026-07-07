"use client";

import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import RazorpayCheckout from "@/components/payment/RazorpayCheckout";
import { CreditCard, Zap, Users, Building2 } from "lucide-react";
import { useState } from "react";

const PLANS = [
  {
    id: "pro",
    name: "Pro",
    description: "For individual professionals",
    priceInr: 999,
    icon: Zap,
    features: ["200 AI queries/month", "Deep analysis mode", "PDF report export", "Priority support"],
  },
  {
    id: "team",
    name: "Team",
    description: "For growing teams",
    priceInr: 2999,
    icon: Users,
    features: ["1,000 AI queries/month", "Workspace collaboration", "Custom data sources", "Dedicated support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    priceInr: 9999,
    icon: Building2,
    features: ["Unlimited queries", "SSO & audit logs", "On-premise option", "SLA guarantee"],
  },
] as const;

export default function CheckoutPage() {
  const [paid, setPaid] = useState<{ paymentId: string; plan: string; periodEnd: string } | null>(null);

  return (
    <AppShell>
      <Header
        title="Upgrade Plan"
        subtitle="Choose the plan that fits your team"
      />

      <div style={{ padding: 28, flex: 1 }}>
        {paid && (
          <div
            style={{
              marginBottom: 24,
              padding: "14px 20px",
              borderRadius: 12,
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#4ade80",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            ✓ Payment successful! <span style={{ textTransform: "capitalize" }}>{paid.plan}</span> plan
            activated until {new Date(paid.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
            &nbsp;Payment ID: {paid.paymentId}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                {/* Plan header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(124,58,237,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} color="var(--text-accent)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                      {plan.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {plan.description}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    ₹{plan.priceInr.toLocaleString("en-IN")}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginLeft: 4 }}>
                    /month
                  </span>
                </div>

                {/* Features */}
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--text-accent)", flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Checkout button */}
                <RazorpayCheckout
                  amountInr={plan.priceInr}
                  receipt={`plan_${plan.id}`}
                  description={`Adviser AI — ${plan.name} Plan`}
                  label={`Subscribe to ${plan.name}`}
                  className=""
                  onSuccess={(paymentId, _orderId, plan, periodEnd) =>
                    setPaid({ paymentId, plan, periodEnd })
                  }
                  onCancel={() => console.log("User dismissed checkout")}
                />
              </div>
            );
          })}
        </div>

        {/* Test mode notice */}
        <div
          style={{
            marginTop: 32,
            padding: "12px 16px",
            borderRadius: 8,
            background: "rgba(234,179,8,0.08)",
            border: "1px solid rgba(234,179,8,0.25)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <CreditCard size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong style={{ color: "var(--text-secondary)" }}>Test mode active.</strong>{" "}
            Use card <code>4111 1111 1111 1111</code>, any future expiry, and any CVV.
            No real money is charged.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
