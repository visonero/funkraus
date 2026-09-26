import { createAdminClient } from "@/lib/supabase/admin";
import { getStore } from "@/lib/tower/store";
import { TOWER, usd } from "@/lib/tower/config";

type Db = ReturnType<typeof createAdminClient>;

const DAY = 86_400_000;
const PAGE = 1000;

// Reads a whole table page by page (Supabase returns at most 1000 rows per request).
async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null }>, maxPages = 60): Promise<T[]> {
  const rows: T[] = [];
  for (let i = 0; i < maxPages; i++) {
    const { data } = await page(i * PAGE, i * PAGE + PAGE - 1);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

async function listUsers(db: Db) {
  const users: { id: string; created_at: string; last_sign_in_at: string | null; email_confirmed_at: string | null }[] = [];
  for (let page = 1; page <= 60; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: PAGE });
    const batch = data?.users ?? [];
    users.push(...batch.map((u) => ({ id: u.id, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at ?? null, email_confirmed_at: u.email_confirmed_at ?? null })));
    if (batch.length < PAGE) break;
  }
  return users;
}

const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

export type AdminStats = Awaited<ReturnType<typeof loadAdminStats>>;

export async function loadAdminStats() {
  const db = createAdminClient();
  const now = Date.now();
  const since = (days: number) => new Date(now - days * DAY).toISOString();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

  const [users, profiles, purchases, progress, modules, lessons] = await Promise.all([
    listUsers(db),
    fetchAll<{ id: string; is_admin: boolean; newsletter_opt_in: boolean }>((a, b) => db.from("profiles").select("id, is_admin, newsletter_opt_in").order("id").range(a, b)),
    fetchAll<{ user_id: string; status: string; amount_cents: number | null; created_at: string }>((a, b) => db.from("purchases").select("user_id, status, amount_cents, created_at").order("created_at").range(a, b)),
    fetchAll<{ user_id: string; lesson_id: string }>((a, b) => db.from("lesson_progress").select("user_id, lesson_id").order("completed_at").range(a, b)),
    db.from("course_modules").select("id, num, title, is_free").then((r) => r.data ?? []),
    db.from("course_lessons").select("id, module_id, title").then((r) => r.data ?? []),
  ]);

  // Your own accounts (admins) never count as customers.
  const admins = new Set(profiles.filter((p) => p.is_admin).map((p) => p.id));
  const real = users.filter((u) => !admins.has(u.id));
  const realIds = new Set(real.map((u) => u.id));
  const createdAt = new Map(real.map((u) => [u.id, u.created_at]));

  const paid = purchases.filter((p) => p.status === "paid" && realIds.has(p.user_id));
  const refunded = purchases.filter((p) => p.status === "refunded" && realIds.has(p.user_id));
  const payingIds = new Set(paid.map((p) => p.user_id));
  const revenueCents = paid.reduce((n, p) => n + (p.amount_cents ?? 0), 0);
  const revenueMonthCents = paid.filter((p) => p.created_at >= monthStart).reduce((n, p) => n + (p.amount_cents ?? 0), 0);

  // Funnel: registered -> e-mail confirmed -> first lesson done -> free modules done -> paid
  const progressReal = progress.filter((p) => realIds.has(p.user_id));
  const learners = new Set(progressReal.map((p) => p.user_id));
  const freeModuleIds = new Set(modules.filter((m) => m.is_free).map((m) => m.id));
  const freeLessonIds = lessons.filter((l) => freeModuleIds.has(l.module_id)).map((l) => l.id);
  const doneByUser = new Map<string, Set<string>>();
  for (const p of progressReal) (doneByUser.get(p.user_id) ?? doneByUser.set(p.user_id, new Set()).get(p.user_id)!).add(p.lesson_id);
  const freeDone = freeLessonIds.length ? [...doneByUser].filter(([, set]) => freeLessonIds.every((id) => set.has(id))).length : 0;

  const daysToBuy = paid
    .map((p) => (createdAt.has(p.user_id) ? (new Date(p.created_at).getTime() - new Date(createdAt.get(p.user_id)!).getTime()) / DAY : null))
    .filter((d): d is number => d !== null);

  // Signups and purchases per day, last 30 days
  const days: { key: string; label: string; signups: number; purchases: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * DAY);
    days.push({ key: dayKey(d), label: i % 5 === 0 ? `${d.getUTCDate()}.${d.getUTCMonth() + 1}.` : "", signups: 0, purchases: 0 });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const u of real) {
    const d = byKey.get(u.created_at.slice(0, 10));
    if (d) d.signups++;
  }
  for (const p of paid) {
    const d = byKey.get(p.created_at.slice(0, 10));
    if (d) d.purchases++;
  }

  const newIn = (from: number, to: number) => real.filter((u) => u.created_at >= since(from) && u.created_at < since(to)).length;
  const activeIn = (d: number) => real.filter((u) => u.last_sign_in_at && u.last_sign_in_at >= since(d)).length;

  // Most completed lessons (where do people actually learn?)
  const doneCount = new Map<string, number>();
  for (const p of progressReal) doneCount.set(p.lesson_id, (doneCount.get(p.lesson_id) ?? 0) + 1);
  const moduleOf = new Map(modules.map((m) => [m.id, m]));
  const topLessons = lessons
    .map((l) => ({ title: l.title, module: moduleOf.get(l.module_id)?.num ?? "", done: doneCount.get(l.id) ?? 0 }))
    .filter((l) => l.done > 0)
    .sort((a, b) => b.done - a.done)
    .slice(0, 6);

  const [answers, correct, answers7, examSubmitted, examPassed, openTickets, flagged, posts, exams] = await Promise.all([
    count(db.from("question_attempts").select("id", { count: "exact", head: true })),
    count(db.from("question_attempts").select("id", { count: "exact", head: true }).eq("is_correct", true)),
    count(db.from("question_attempts").select("id", { count: "exact", head: true }).gte("answered_at", since(7))),
    count(db.from("exam_attempts").select("id", { count: "exact", head: true }).not("submitted_at", "is", null)),
    count(db.from("exam_attempts").select("id", { count: "exact", head: true }).eq("passed", true)),
    count(db.from("question_tickets").select("id", { count: "exact", head: true }).eq("status", "open")),
    count(db.from("flagged_questions").select("user_id", { count: "exact", head: true })),
    count(db.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published")),
    db.from("exam_attempts").select("score").not("submitted_at", "is", null).limit(1000).then((r) => r.data ?? []),
  ]);
  const avgExamScore = exams.length ? Math.round(exams.reduce((n, e) => n + (e.score ?? 0), 0) / exams.length) : null;

  // KI-Funktraining
  const store = getStore();
  const [towerMonthCost, towerRecent] = await Promise.all([store.totalCostSince(monthStart), store.recent(500)]);
  const towerReal = towerRecent.filter((s) => realIds.has(s.userId) || s.userId.startsWith("0000"));
  const towerMonth = towerReal.filter((s) => s.startedAt >= monthStart && s.turns > 0);
  const towerUsers = new Set(towerReal.filter((s) => s.turns > 0).map((s) => s.userId));

  return {
    generatedAt: new Date().toISOString(),
    users: { total: real.length, free: real.length - payingIds.size, paying: payingIds.size, confirmed: real.filter((u) => u.email_confirmed_at).length, newsletter: profiles.filter((p) => p.newsletter_opt_in && realIds.has(p.id)).length },
    conversion: real.length ? payingIds.size / real.length : 0,
    revenue: { totalCents: revenueCents, withoutAmount: paid.filter((p) => !p.amount_cents).length, monthCents: revenueMonthCents, refunds: refunded.length, medianDaysToBuy: median(daysToBuy) },
    growth: { new7: newIn(7, -1), newPrev7: newIn(14, 7), new30: newIn(30, -1), active7: activeIn(7), active30: activeIn(30) },
    funnel: [
      { label: "Registriert", value: real.length },
      { label: "E-Mail bestätigt", value: real.filter((u) => u.email_confirmed_at).length },
      { label: "Erste Lektion abgeschlossen", value: learners.size },
      { label: "Beide Gratis-Module abgeschlossen", value: freeDone },
      { label: "Gekauft", value: payingIds.size },
    ],
    days,
    topLessons,
    learning: { answers, correctRate: answers ? correct / answers : 0, answers7, lessonsDone: progressReal.length, examSubmitted, examPassed, avgExamScore },
    tower: { monthPractices: towerMonth.length, users: towerUsers.size, monthCostUsd: usd(towerMonthCost), budgetUsd: TOWER.limits.globalMonthlyBudgetUsd },
    support: { openTickets, flagged, posts },
  };
}
