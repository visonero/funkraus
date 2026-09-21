import type { RawCourse } from "./types";

// Local-only preview for screenshots and design work. DEMO_DASHBOARD=1 in .env.local shows the dashboard without
// a login, with the REAL course structure from the database and synthetic learning progress.
// DEMO_ACCESS=free shows the free tier (Modules 0 and 1 open), DEMO_ACCESS=paid (default) the full access.
// Ignored in production builds.
export function isDemoMode() {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_DASHBOARD === "1";
}

export function demoAccess(): "free" | "paid" {
  return process.env.DEMO_ACCESS === "free" ? "free" : "paid";
}

export function withDemoProgress(raw: RawCourse, hasFullAccess: boolean): RawCourse {
  const lessonOrder = [...raw.modules]
    .sort((a, b) => a.sort_order - b.sort_order || a.num.localeCompare(b.num))
    .filter((m) => hasFullAccess || m.is_free)
    .flatMap((m) => raw.lessons.filter((l) => l.module_id === m.id).sort((a, b) => a.sort_order - b.sort_order));
  const doneCount = hasFullAccess ? 17 : 7;
  const done = lessonOrder.slice(0, doneCount);
  const partial = lessonOrder[doneCount];
  const day = 24 * 3600 * 1000;
  const now = Date.now();

  const completions = done.map((l, i) => ({ lesson_id: l.id, completed_at: new Date(now - (6 - Math.min(6, Math.floor((i * 7) / doneCount))) * day - i * 60000).toISOString() }));
  const attempts: RawCourse["attempts"] = [];
  let counter = 0;
  for (const lesson of [...done, ...(partial ? [partial] : [])]) {
    const questions = raw.questions.filter((q) => q.lesson_id === lesson.id);
    const limit = lesson === partial ? Math.ceil(questions.length / 2) : questions.length;
    for (const q of questions.slice(0, limit)) {
      counter++;
      attempts.push({ question_id: q.id, is_correct: counter % 7 !== 0, answered_at: new Date(now - (counter % 7) * day - counter * 45000).toISOString() });
    }
  }
  return { ...raw, attempts, completions };
}
