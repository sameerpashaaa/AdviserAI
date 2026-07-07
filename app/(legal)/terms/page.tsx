import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Adviser AI",
  description: "Read the Adviser AI Terms of Service governing your use of the platform.",
  alternates: { canonical: "https://adviserai.com/terms" },
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e7eb", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <a href="/" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14 }}>← Back to Adviser AI</a>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Last updated: January 1, 2025</p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 16, color: "#9ca3af", marginBottom: 48, lineHeight: 1.7 }}>
          Please read these Terms carefully before using Adviser AI. By accessing or using the platform, you agree to be bound by these Terms.
        </p>

        {[
          {
            title: "1. Acceptance of Terms",
            content: `By creating an account or using Adviser AI, you confirm that you:

• Are at least 16 years of age.
• Have the legal capacity to enter into a binding agreement.
• Will comply with these Terms and all applicable laws.

If you are using the platform on behalf of an organization, you represent that you have authority to bind that organization to these Terms.`,
          },
          {
            title: "2. Description of Service",
            content: `Adviser AI is an AI-powered strategic advisory platform that provides business research, analysis, validation, and strategy generation. The platform uses multi-agent AI technology to deliver insights.

The service is provided "as is" and is intended for informational and strategic planning purposes. AI-generated content should not be relied upon as professional legal, financial, or medical advice.`,
          },
          {
            title: "3. Account Responsibilities",
            content: `You are responsible for:

• Maintaining the confidentiality of your account credentials.
• All activities that occur under your account.
• Notifying us immediately of any unauthorized use at security@adviserai.com.
• Keeping your account information accurate and up to date.

You may not share your account with others or create multiple accounts to circumvent usage limits.`,
          },
          {
            title: "4. Subscription and Payment",
            content: `Adviser AI offers Free, Pro, Team, and Enterprise subscription plans with different usage limits and features.

**Billing**: Subscriptions are billed in advance on a monthly or annual cycle. Payments are processed via Razorpay.

**Cancellation**: You may cancel at any time from Settings → Subscription. Access continues until the end of the current billing period.

**Refunds**: We offer refunds within 7 days of initial purchase if you are not satisfied, upon request to billing@adviserai.com.

**Price changes**: We will provide 30 days notice before any price increases.`,
          },
          {
            title: "5. Acceptable Use",
            content: `You agree not to use Adviser AI to:

• Violate any applicable laws or regulations.
• Generate content that is harmful, fraudulent, misleading, or illegal.
• Attempt to reverse-engineer, scrape, or compromise the platform's infrastructure.
• Share your account credentials or usage limits with unauthorized parties.
• Use the service for spam, phishing, or other malicious activities.
• Circumvent usage quotas or rate limits through technical means.

We reserve the right to suspend or terminate accounts that violate these terms.`,
          },
          {
            title: "6. Intellectual Property",
            content: `**Your content**: You retain ownership of the queries you submit and reports you generate. By using the platform, you grant us a limited license to process your inputs to provide the service.

**Our content**: The Adviser AI platform, including its design, code, and underlying AI models, is our proprietary property. You may not reproduce, distribute, or create derivative works without written permission.

**AI outputs**: AI-generated outputs are provided under a non-exclusive license for your use. We make no claim of copyright over generated content.`,
          },
          {
            title: "7. Privacy",
            content: `Your use of Adviser AI is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the platform, you consent to the collection and use of your data as described in the Privacy Policy.`,
          },
          {
            title: "8. Disclaimers and Limitations of Liability",
            content: `**AI Disclaimer**: Adviser AI uses artificial intelligence to generate insights. AI outputs may contain inaccuracies, errors, or hallucinations. Always verify important business decisions with qualified professionals.

**No warranties**: The service is provided "as is" without warranties of any kind, express or implied.

**Limitation of liability**: To the maximum extent permitted by law, Adviser AI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.

**Maximum liability**: Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.`,
          },
          {
            title: "9. Termination",
            content: `We may suspend or terminate your access if you:

• Violate these Terms.
• Engage in fraudulent or abusive behavior.
• Fail to pay subscription fees.

You may terminate your account at any time from Settings → Account → Delete Account. Upon termination, your data is soft-deleted and permanently purged within 30 days.`,
          },
          {
            title: "10. Governing Law",
            content: `These Terms are governed by applicable laws. Any disputes shall be resolved through binding arbitration, unless you elect to resolve disputes in small claims court. You waive the right to participate in class action lawsuits.`,
          },
          {
            title: "11. Changes to Terms",
            content: `We may update these Terms at any time. We will provide at least 30 days notice for material changes via email. Continued use of the platform after the effective date constitutes acceptance of the updated Terms.`,
          },
          {
            title: "12. Contact",
            content: `For questions about these Terms:\n\n**Email**: legal@adviserai.com\n**Address**: Adviser AI, [Company Address]`,
          },
        ].map((section) => (
          <section key={section.title} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#f9fafb", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {section.title}
            </h2>
            <div style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {section.content}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
