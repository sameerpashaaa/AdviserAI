import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Adviser AI",
  description: "Learn how Adviser AI collects, uses, and protects your personal information.",
  alternates: { canonical: "https://adviserai.com/privacy" },
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: 16, color: "#9ca3af", marginBottom: 48, lineHeight: 1.7 }}>
          Your privacy is important to us. This policy explains what data we collect, why we collect it, and how we protect it.
        </p>

        {[
          {
            title: "1. Information We Collect",
            content: `We collect information you provide directly to us when you create an account, use our services, or contact us for support. This includes:
            
• **Account information**: Email address, name, and profile picture.
• **Usage data**: Conversations, reports, and queries you create within the platform.
• **Payment information**: Processed securely through Razorpay — we never store full card numbers.
• **Technical data**: IP address, browser type, device identifiers, and usage logs for security and performance.`,
          },
          {
            title: "2. How We Use Your Information",
            content: `We use the information we collect to:
            
• Provide, maintain, and improve our services.
• Personalize your experience and deliver relevant AI-powered insights.
• Process transactions and send related information such as receipts.
• Send transactional emails (account activity, security alerts).
• Monitor and analyze usage patterns to improve the platform.
• Comply with legal obligations and enforce our Terms of Service.`,
          },
          {
            title: "3. Data Storage and Security",
            content: `Your data is stored on Supabase (PostgreSQL) servers hosted in secure data centers. We implement industry-standard security measures including:
            
• Encrypted connections (TLS 1.3) for all data in transit.
• Database-level encryption at rest.
• Role-based access controls limiting who can access your data.
• Regular security audits and vulnerability assessments.
• Soft-delete policies — deleted data is retained for 30 days before permanent removal.`,
          },
          {
            title: "4. Cookies and Tracking",
            content: `We use cookies and similar technologies for:
            
• **Session management**: Keeping you logged in securely (Auth0 session cookie).
• **Preferences**: Remembering your theme and language settings.
• **Analytics**: Aggregated, anonymized usage statistics to improve the product.

You can control cookie preferences through your browser settings. Disabling cookies may affect platform functionality.`,
          },
          {
            title: "5. Data Sharing",
            content: `We do not sell, trade, or rent your personal information. We may share data with:
            
• **Service providers**: Auth0 (authentication), Supabase (database), Vercel (hosting), Resend (email), Razorpay (payments). Each is bound by strict data processing agreements.
• **Google Gemini API**: Your queries are processed by Google's AI API. No personally identifiable information beyond the query content is sent.
• **Legal requirements**: If required by law, court order, or to protect the rights and safety of users.`,
          },
          {
            title: "6. Your Rights",
            content: `You have the right to:
            
• **Access**: Request a copy of your personal data via Settings → Export Data.
• **Correction**: Update your profile information at any time in Settings.
• **Deletion**: Delete your account from Settings → Account → Delete Account (30-day grace period applies).
• **Portability**: Export your conversations, reports, and usage history as JSON.
• **Opt-out**: Unsubscribe from non-essential emails at any time.

For requests that cannot be completed within the platform, contact us at privacy@adviserai.com.`,
          },
          {
            title: "7. Data Retention",
            content: `We retain your data for as long as your account is active. After account deletion:
            
• Personal data is soft-deleted immediately (access removed within 24 hours).
• Data is permanently purged within 30 days.
• Anonymized aggregated analytics may be retained indefinitely.
• Legal holds may extend retention periods as required by applicable law.`,
          },
          {
            title: "8. Children's Privacy",
            content: `Adviser AI is not directed to children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.`,
          },
          {
            title: "9. Changes to This Policy",
            content: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you via email and update the "Last updated" date above. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: "10. Contact Us",
            content: `For privacy-related questions or requests:\n\n**Email**: privacy@adviserai.com\n**Address**: Adviser AI, [Company Address]`,
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
