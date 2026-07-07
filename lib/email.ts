import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "your-resend-api-key") {
    return null;
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Core sendEmail helper. Gracefully logs to console in development
 * if RESEND_API_KEY is not configured, ensuring the application remains robust.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = "Adviser AI <no-reply@adviserai.local>",
}: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: unknown }> {
  const resend = getResend();
  const recipients = Array.isArray(to) ? to : [to];

  if (!resend) {
    console.info(
      `[Email Fallback Log] (No RESEND_API_KEY configured)\n` +
        `To: ${recipients.join(", ")}\n` +
        `From: ${from}\n` +
        `Subject: ${subject}\n` +
        `Body:\n${text || html.replace(/<[^>]*>/g, "")}\n`
    );
    return { success: true, id: "mock-email-id-" + Math.random().toString(36).substr(2, 9) };
  }

  try {
    const response = await resend.emails.send({
      from,
      to: recipients,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    if (response.error) {
      console.error("[Resend Error]", response.error);
      return { success: false, error: response.error };
    }

    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error("[sendEmail exception]", error);
    return { success: false, error };
  }
}

/**
 * Welcome Email Template helper
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const subject = "Welcome to Adviser AI! 🚀";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #7c3aed;">Welcome to Adviser AI, ${name}! 🎯</h2>
      <p>We are thrilled to have you join our multi-agent strategic advisory platform.</p>
      <p>Here is what you can do right now to get started:</p>
      <ul>
        <li>📊 <strong>Run a Market Analysis</strong> using our Chief Adviser chat.</li>
        <li>💡 <strong>Validate a Startup Idea</strong> using the Business Validator tool.</li>
        <li>⚠️ <strong>Create a Risk Assessment</strong> to spot opportunities and weaknesses.</li>
      </ul>
      <p>If you have any questions or feedback, simply reply to this email.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">This is an automated email from Adviser AI. Verify strategic advice before execution.</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
}

/**
 * Settings Change Digest notification helper
 */
export async function sendSettingsChangeEmail(to: string, name: string) {
  const subject = "Your Adviser AI settings have been updated";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h3 style="color: #1e1b4b;">Hello ${name},</h3>
      <p>We wanted to let you know that your Adviser AI profile or AI preferences settings were successfully updated on <strong>${new Date().toLocaleDateString()}</strong>.</p>
      <p>If you did not authorize this change, please contact support immediately or reset your credentials.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Security team, Adviser AI</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
}
