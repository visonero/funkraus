"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { SITE_URL, emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { isLessonOpen } from "./data";
import { isDemoMode } from "./demo";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const MAX_OPEN_TICKETS = 5;
const MIN_LEN = 10;
const MAX_LEN = 2000;
const GENERIC = "Das hat leider nicht geklappt. Bitte versuch es gleich nochmal.";

async function questionForLearner(questionId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Bitte melde dich erneut an." } as const;
  const admin = createAdminClient();
  const { data: q } = await admin.from("quiz_questions").select("id, lesson_id, question, options").eq("id", questionId).maybeSingle();
  if (!q) return { ok: false, error: "Frage nicht gefunden." } as const;
  if (!(await isLessonOpen(user.id, q.lesson_id as string))) return { ok: false, error: "Diese Frage gehört zum vollen Zugang." } as const;
  return { ok: true, user, admin, question: q } as const;
}

export async function toggleFlag(questionId: string, flagged: boolean): Promise<Result<{ flagged: boolean }>> {
  const ctx = await questionForLearner(questionId);
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (isDemoMode()) return { ok: true, flagged };

  const { admin, user } = ctx;
  const { error } = flagged
    ? await admin.from("flagged_questions").upsert({ user_id: user.id, question_id: questionId }, { onConflict: "user_id,question_id" })
    : await admin.from("flagged_questions").delete().eq("user_id", user.id).eq("question_id", questionId);
  if (error) return { ok: false, error: GENERIC };
  revalidatePath("/dashboard/flagged");
  return { ok: true, flagged };
}

function validMessage(body: string) {
  const text = body.trim();
  if (text.length < MIN_LEN) return { ok: false, error: `Bitte beschreibe deine Frage etwas genauer (mindestens ${MIN_LEN} Zeichen).` } as const;
  if (text.length > MAX_LEN) return { ok: false, error: `Deine Nachricht ist zu lang (höchstens ${MAX_LEN} Zeichen).` } as const;
  return { ok: true, text } as const;
}

export async function createTicket(questionId: string, message: string, selectedIndex: number | null): Promise<Result<{ ticketId: string }>> {
  const msg = validMessage(message);
  if (!msg.ok) return { ok: false, error: msg.error };
  const ctx = await questionForLearner(questionId);
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (isDemoMode()) return { ok: true, ticketId: "demo" };

  const { admin, user, question } = ctx;
  const { count } = await admin.from("question_tickets").select("id", { count: "exact", head: true }).eq("user_id", user.id).neq("status", "closed");
  if ((count ?? 0) >= MAX_OPEN_TICKETS) {
    return { ok: false, error: `Du hast schon ${MAX_OPEN_TICKETS} offene Fragen. Sobald wir geantwortet haben, kannst du weitere stellen.` };
  }

  const options = Array.isArray(question.options) ? question.options.map(String) : [];
  const safeSelected = Number.isInteger(selectedIndex) && selectedIndex! >= 0 && selectedIndex! < options.length ? selectedIndex : null;
  const { data: ticket, error } = await admin
    .from("question_tickets")
    .insert({
      user_id: user.id,
      question_id: questionId,
      lesson_id: question.lesson_id,
      question_text: question.question,
      options,
      selected_index: safeSelected,
    })
    .select("id")
    .single();
  if (error || !ticket) return { ok: false, error: GENERIC };
  const { error: msgError } = await admin.from("ticket_messages").insert({ ticket_id: ticket.id, author: "user", body: msg.text });
  if (msgError) return { ok: false, error: GENERIC };

  await notifyStaff(ticket.id, user.email ?? "", question.question as string, msg.text, true);
  revalidatePath("/dashboard/tickets");
  return { ok: true, ticketId: ticket.id };
}

export async function replyToTicket(ticketId: string, message: string): Promise<Result> {
  const msg = validMessage(message);
  if (!msg.ok) return { ok: false, error: msg.error };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Bitte melde dich erneut an." };
  if (isDemoMode()) return { ok: true };

  const admin = createAdminClient();
  const { data: ticket } = await admin.from("question_tickets").select("id, question_text, status").eq("id", ticketId).eq("user_id", user.id).maybeSingle();
  if (!ticket) return { ok: false, error: "Frage nicht gefunden." };
  if (ticket.status === "closed") return { ok: false, error: "Diese Frage ist abgeschlossen. Stelle bei Bedarf eine neue." };

  const { error } = await admin.from("ticket_messages").insert({ ticket_id: ticketId, author: "user", body: msg.text });
  if (error) return { ok: false, error: GENERIC };
  await admin.from("question_tickets").update({ status: "open", user_unread: false, updated_at: new Date().toISOString() }).eq("id", ticketId);
  await notifyStaff(ticketId, user.email ?? "", ticket.question_text as string, msg.text, false);
  revalidatePath("/dashboard/tickets", "layout");
  return { ok: true };
}

export async function markTicketSeen(ticketId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || isDemoMode()) return;
  await createAdminClient().from("question_tickets").update({ user_unread: false }).eq("id", ticketId).eq("user_id", user.id).eq("user_unread", true);
  revalidatePath("/dashboard", "layout");
}

async function notifyStaff(ticketId: string, userEmail: string, questionText: string, message: string, isNew: boolean) {
  const to = process.env.TICKET_NOTIFY_EMAIL;
  if (!to) return console.warn("[tickets] TICKET_NOTIFY_EMAIL not set, no staff notification sent");
  await sendEmail({
    to,
    replyTo: userEmail || undefined,
    subject: `${isNew ? "Neue Frage" : "Neue Nachricht"} von ${userEmail || "einem Nutzer"}`,
    html: emailLayout({
      heading: isNew ? "Neue Frage zu einer Prüfungsfrage" : "Neue Nachricht zu einer Frage",
      body: `<strong>${escapeHtml(userEmail)}</strong> schreibt:<br><br><em>${escapeHtml(message).replace(/\n/g, "<br>")}</em><br><br>Zur Frage: ${escapeHtml(questionText)}`,
      buttonLabel: "Im Admin-Bereich antworten",
      buttonUrl: `${SITE_URL}/admin/tickets/${ticketId}`,
    }),
  });
}
