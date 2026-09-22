import { createAdminClient } from "@/lib/supabase/admin";
import type { ExamQuestion, ExamResultDetail, ExamState } from "./types";

export const EXAM_QUESTION_COUNT = 100;
export const EXAM_PASS_THRESHOLD = 75;
export const EXAM_DURATION_SECONDS = 3600;

// Only the official BNetzA catalogue questions belong in the mock exam, not the handful of
// self-authored practice questions some lessons add (those use a "<chapter>-q<n>" external_id).
const CATALOGUE_PREFIX = "bnetza-2024-";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function drawQuestionIds(admin: AdminClient): Promise<string[]> {
  const { data } = await admin.from("quiz_questions").select("id").like("external_id", `${CATALOGUE_PREFIX}%`);
  const ids = (data ?? []).map((row) => row.id as string);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, EXAM_QUESTION_COUNT);
}

// Preserves the order the ids were drawn/stored in, since `in()` does not guarantee row order.
export async function fetchQuestionsInOrder(admin: AdminClient, ids: string[]): Promise<ExamQuestion[]> {
  if (ids.length === 0) return [];
  const { data } = await admin.from("quiz_questions").select("id, question, options").in("id", ids);
  const byId = new Map((data ?? []).map((q) => [q.id as string, { id: q.id as string, question: q.question as string, options: Array.isArray(q.options) ? q.options.map(String) : [] }]));
  return ids.map((id) => byId.get(id)).filter((q): q is ExamQuestion => Boolean(q));
}

type ScoredQuestion = { id: string; question: string; options: unknown; correct_index: number; explanation: string | null };

export function scoreAttempt(questions: ScoredQuestion[], answers: { questionId: string; selectedIndex: number }[]): ExamResultDetail {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));
  const breakdown = questions.map((q) => {
    const selectedIndex = answerMap.get(q.id) ?? null;
    const isCorrect = selectedIndex !== null && selectedIndex === q.correct_index;
    return {
      questionId: q.id,
      question: q.question,
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      selectedIndex,
      correctIndex: q.correct_index,
      explanation: q.explanation ?? null,
      isCorrect,
    };
  });
  const score = breakdown.filter((b) => b.isCorrect).length;
  return { score, passed: score >= EXAM_PASS_THRESHOLD, total: EXAM_QUESTION_COUNT, threshold: EXAM_PASS_THRESHOLD, breakdown };
}

// Finds the learner's current situation for this exam lesson: an unexpired attempt to resume,
// or the start screen (with the last submitted result, if any, to show before retrying).
export async function getExamState(userId: string, lessonId: string): Promise<ExamState> {
  const admin = createAdminClient();
  const [{ data: active }, { data: lastSubmitted }] = await Promise.all([
    admin
      .from("exam_attempts")
      .select("id, question_ids, started_at, duration_seconds")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .is("submitted_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("exam_attempts")
      .select("score, passed, submitted_at")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (active) {
    const endsAt = new Date(active.started_at as string).getTime() + (active.duration_seconds as number) * 1000;
    if (Date.now() < endsAt) {
      const questions = await fetchQuestionsInOrder(admin, active.question_ids as string[]);
      return { mode: "in-progress", attemptId: active.id as string, questions, startedAtIso: active.started_at as string, durationSeconds: active.duration_seconds as number };
    }
  }

  return {
    mode: "start",
    lastResult: lastSubmitted ? { score: lastSubmitted.score as number, passed: lastSubmitted.passed as boolean, submittedAtIso: lastSubmitted.submitted_at as string } : null,
  };
}
