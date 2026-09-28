"use server";

import { escapeHtml, sendEmail } from "@/lib/email";

type Result = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PARTNER_INBOX = "h.alkhodour@web.de";

export async function sendPartnerInquiry(formData: FormData): Promise<Result> {
  // Honeypot: a hidden field real visitors never fill in. Bots that fill every field trip it.
  if ((formData.get("website") as string | null)?.trim()) return { ok: true };

  const name = ((formData.get("name") as string | null) ?? "").trim();
  const email = ((formData.get("email") as string | null) ?? "").trim();
  const organisation = ((formData.get("organisation") as string | null) ?? "").trim();
  const message = ((formData.get("message") as string | null) ?? "").trim();

  if (name.length < 2 || name.length > 120) return { ok: false, error: "Bitte gib deinen Namen an." };
  if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false, error: "Bitte gib eine gültige E-Mail-Adresse an." };
  if (organisation.length > 200) return { ok: false, error: "Der Name der Organisation ist zu lang." };
  if (message.length < 10 || message.length > 4000) return { ok: false, error: "Bitte beschreibe dein Vorhaben etwas genauer (mindestens 10 Zeichen)." };

  const sent = await sendEmail({
    to: PARTNER_INBOX,
    subject: `Partneranfrage von ${name}${organisation ? ` (${organisation})` : ""}`,
    replyTo: email,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1c2b3a;">
<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
${organisation ? `<p><strong>Organisation:</strong> ${escapeHtml(organisation)}</p>` : ""}
<p><strong>Nachricht:</strong></p>
<p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
</div>`,
  });

  if (!sent) {
    return { ok: false, error: "Die Nachricht konnte nicht gesendet werden. Bitte versuch es später erneut oder schreib direkt an h.alkhodour@web.de." };
  }
  return { ok: true };
}
