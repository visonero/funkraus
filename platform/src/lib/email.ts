// Sends transactional email through Resend's HTTP API. Needs RESEND_API_KEY and EMAIL_FROM (a sender on a domain
// verified in Resend, e.g. "funkraus <support@funkraus.de>"). Without them nothing is sent and a warning is logged,
// so features keep working (tickets are always stored) before email is set up.
export const SITE_URL = "https://www.funkraus.de";

export function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sendEmail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[email] RESEND_API_KEY/EMAIL_FROM not set, skipping email "${subject}"`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) console.error(`[email] Resend ${res.status}: ${await res.text()}`);
    return res.ok;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

// Same look as the Supabase auth emails (see supabase/email-templates).
export function emailLayout({ heading, body, buttonLabel, buttonUrl }: { heading: string; body: string; buttonLabel: string; buttonUrl: string }) {
  return `<!doctype html><html lang="de"><body style="margin:0;padding:0;background:#f6f9fd;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9fd;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;border:1px solid #e3ebf5;">
<tr><td style="padding:32px 36px 8px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#1c2b3a;">funkraus</td></tr>
<tr><td style="padding:8px 36px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#1c2b3a;">${heading}</td></tr>
<tr><td style="padding:12px 36px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#51677c;">${body}</td></tr>
<tr><td style="padding:24px 36px 32px;"><a href="${buttonUrl}" style="display:inline-block;background:#1c7fd0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;">${buttonLabel}</a></td></tr>
</table></td></tr></table></body></html>`;
}
