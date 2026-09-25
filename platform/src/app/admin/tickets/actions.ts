"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { SITE_URL, emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

export async function adminReply(ticketId: string, message: string, closeAfter: boolean): Promise<Result> {
  await requireAdmin();
  const text = message.trim();
  if (text.length < 2) return { ok: false, error: "Bitte schreibe eine Antwort." };
  if (text.length > 5000) return { ok: false, error: "Die Antwort ist zu lang." };

  const db = createAdminClient();
  const { data: ticket } = await db.from("question_tickets").select("id, user_id, question_text").eq("id", ticketId).maybeSingle();
  if (!ticket) return { ok: false, error: "Ticket nicht gefunden." };

  const { error } = await db.from("ticket_messages").insert({ ticket_id: ticketId, author: "staff", body: text });
  if (error) return { ok: false, error: "Antwort konnte nicht gespeichert werden." };
  await db
    .from("question_tickets")
    .update({ status: closeAfter ? "closed" : "answered", user_unread: true, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  const { data: profile } = await db.from("profiles").select("email").eq("id", ticket.user_id).maybeSingle();
  if (profile?.email) {
    await sendEmail({
      to: profile.email as string,
      subject: "Deine Frage wurde beantwortet – funkraus",
      html: emailLayout({
        heading: "Deine Frage wurde beantwortet",
        body: `Zu deiner Frage „${escapeHtml((ticket.question_text as string).slice(0, 160))}“ haben wir dir geantwortet. Die Antwort findest du in deinem Dashboard.`,
        buttonLabel: "Antwort ansehen",
        buttonUrl: `${SITE_URL}/dashboard/tickets/${ticketId}`,
      }),
    });
  }
  revalidatePath("/admin/tickets", "layout");
  return { ok: true };
}

export async function adminCloseTicket(ticketId: string): Promise<Result> {
  await requireAdmin();
  const { error } = await createAdminClient().from("question_tickets").update({ status: "closed", updated_at: new Date().toISOString() }).eq("id", ticketId);
  if (error) return { ok: false, error: "Ticket konnte nicht geschlossen werden." };
  revalidatePath("/admin/tickets", "layout");
  return { ok: true };
}
