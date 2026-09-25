import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCourseData } from "./data";
import { isDemoMode } from "./demo";

// Read side for flagged questions and tickets. Reads use the service role and always filter by the caller's id
// (or are admin-only pages), matching how the rest of the dashboard data is loaded.

export type TicketStatus = "open" | "answered" | "closed";
export type TicketSummary = { id: string; questionText: string; status: TicketStatus; userUnread: boolean; updatedAt: string; createdAt: string };
export type TicketMessage = { id: string; author: "user" | "staff"; body: string; createdAt: string };
export type TicketThread = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  questionText: string;
  options: string[];
  selectedIndex: number | null;
  lessonTitle: string | null;
  status: TicketStatus;
  createdAt: string;
  messages: TicketMessage[];
};

export const getFlaggedIds = cache(async (userId: string): Promise<string[]> => {
  if (isDemoMode()) return [];
  const { data } = await createAdminClient().from("flagged_questions").select("question_id").eq("user_id", userId);
  return (data ?? []).map((r) => r.question_id as string);
});

export type FlaggedQuestion = { id: string; question: string; options: string[]; lessonId: string; lessonTitle: string };

// Only questions from chapters the learner can currently open (a lapsed/locked chapter keeps its flags but hides them).
export async function getFlaggedQuestions(userId: string): Promise<FlaggedQuestion[]> {
  if (isDemoMode()) return [];
  const admin = createAdminClient();
  const { data: flags } = await admin.from("flagged_questions").select("question_id, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  const ids = (flags ?? []).map((f) => f.question_id as string);
  if (!ids.length) return [];

  const [{ data: questions }, course] = await Promise.all([
    admin.from("quiz_questions").select("id, lesson_id, question, options").in("id", ids),
    getCourseData(userId),
  ]);
  const chapters = new Map(course.modules.flatMap((m) => m.chapters).map((c) => [c.id, c]));
  const byId = new Map((questions ?? []).map((q) => [q.id as string, q]));
  const result: FlaggedQuestion[] = [];
  for (const id of ids) {
    const q = byId.get(id);
    const chapter = q ? chapters.get(q.lesson_id as string) : undefined;
    if (!q || !chapter || chapter.locked) continue;
    result.push({
      id,
      question: q.question as string,
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      lessonId: chapter.id,
      lessonTitle: chapter.title,
    });
  }
  return result;
}

const toSummary = (t: Record<string, unknown>): TicketSummary => ({
  id: t.id as string,
  questionText: t.question_text as string,
  status: t.status as TicketStatus,
  userUnread: Boolean(t.user_unread),
  updatedAt: t.updated_at as string,
  createdAt: t.created_at as string,
});

export async function getUserTickets(userId: string): Promise<TicketSummary[]> {
  if (isDemoMode()) return [];
  const { data } = await createAdminClient()
    .from("question_tickets")
    .select("id, question_text, status, user_unread, updated_at, created_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return (data ?? []).map(toSummary);
}

export const countUnreadTickets = cache(async (userId: string): Promise<number> => {
  if (isDemoMode()) return 0;
  const { count } = await createAdminClient().from("question_tickets").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("user_unread", true);
  return count ?? 0;
});

// userId = the owner when a learner opens it; null for the admin view (any ticket).
export async function getTicketThread(ticketId: string, userId: string | null): Promise<TicketThread | null> {
  const admin = createAdminClient();
  let query = admin.from("question_tickets").select("*").eq("id", ticketId);
  if (userId) query = query.eq("user_id", userId);
  const { data: t } = await query.maybeSingle();
  if (!t) return null;

  const [{ data: messages }, { data: profile }, lesson] = await Promise.all([
    admin.from("ticket_messages").select("id, author, body, created_at").eq("ticket_id", ticketId).order("created_at"),
    admin.from("profiles").select("email, full_name").eq("id", t.user_id).maybeSingle(),
    t.lesson_id ? admin.from("course_lessons").select("title").eq("id", t.lesson_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  return {
    id: t.id,
    userId: t.user_id,
    userEmail: (profile?.email as string | null) ?? null,
    userName: (profile?.full_name as string | null) ?? null,
    questionText: t.question_text,
    options: Array.isArray(t.options) ? t.options.map(String) : [],
    selectedIndex: t.selected_index,
    lessonTitle: (lesson.data?.title as string | undefined) ?? null,
    status: t.status,
    createdAt: t.created_at,
    messages: (messages ?? []).map((m) => ({ id: m.id, author: m.author, body: m.body, createdAt: m.created_at })),
  };
}

export async function getAdminTickets(): Promise<(TicketSummary & { userEmail: string | null })[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("question_tickets")
    .select("id, question_text, status, user_unread, updated_at, created_at, user_id")
    .order("updated_at", { ascending: false })
    .limit(200);
  const rows = data ?? [];
  const userIds = [...new Set(rows.map((r) => r.user_id as string))];
  const { data: profiles } = userIds.length ? await admin.from("profiles").select("id, email").in("id", userIds) : { data: [] };
  const emails = new Map((profiles ?? []).map((p) => [p.id as string, p.email as string | null]));
  return rows.map((r) => ({ ...toSummary(r), userEmail: emails.get(r.user_id as string) ?? null }));
}
