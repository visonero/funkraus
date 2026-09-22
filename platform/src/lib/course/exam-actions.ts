"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { EXAM_DURATION_SECONDS, EXAM_QUESTION_COUNT, drawQuestionIds, fetchQuestionsInOrder, scoreAttempt } from "./exam";
import { isLessonOpen } from "./data";
import { isDemoMode } from "./demo";
import type { ExamResultDetail, ExamState, Track } from "./types";

const SAVE_ERROR = "Die Prüfung konnte nicht gespeichert werden. Bitte versuch es gleich nochmal.";
const LOCKED_ERROR = "Dieses Kapitel gehört zum vollen Zugang. Schalte den Kurs frei, um weiterzulernen.";
const DEMO_ATTEMPT_ID = "demo";

type StartResult = { ok: true; state: Extract<ExamState, { mode: "in-progress" }> } | { ok: false; error: string };
type SubmitResult = { ok: true; result: ExamResultDetail } | { ok: false; error: string };

async function requireLearner(lessonId: string): Promise<{ userId: string } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  if (!(await isLessonOpen(user.id, lessonId))) return { error: LOCKED_ERROR };
  return { userId: user.id };
}

export async function startExam(lessonId: string, track: Track): Promise<StartResult> {
  const learner = await requireLearner(lessonId);
  if ("error" in learner) return { ok: false, error: learner.error };

  const admin = createAdminClient();
  const questionIds = await drawQuestionIds(admin);
  if (questionIds.length < EXAM_QUESTION_COUNT) return { ok: false, error: "Nicht genug Fragen im Katalog verfügbar." };
  const questions = await fetchQuestionsInOrder(admin, questionIds);
  const startedAtIso = new Date().toISOString();

  if (isDemoMode()) {
    return { ok: true, state: { mode: "in-progress", attemptId: DEMO_ATTEMPT_ID, questions, startedAtIso, durationSeconds: EXAM_DURATION_SECONDS } };
  }

  const { data: inserted, error } = await admin
    .from("exam_attempts")
    .insert({ user_id: learner.userId, lesson_id: lessonId, track, question_ids: questionIds, started_at: startedAtIso, duration_seconds: EXAM_DURATION_SECONDS })
    .select("id")
    .single();
  if (error || !inserted) return { ok: false, error: SAVE_ERROR };

  revalidatePath("/dashboard", "layout");
  return { ok: true, state: { mode: "in-progress", attemptId: inserted.id as string, questions, startedAtIso, durationSeconds: EXAM_DURATION_SECONDS } };
}

// `allQuestionIds` is only consulted for the demo-mode attempt (see below): a real attempt has its
// question set persisted server-side at `startExam` time, so the client can't influence scoring there.
export async function submitExam(attemptId: string, answers: { questionId: string; selectedIndex: number }[], allQuestionIds: string[] = []): Promise<SubmitResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Bitte melde dich erneut an." };
  const admin = createAdminClient();

  if (attemptId === DEMO_ATTEMPT_ID) {
    const { data: questions } = await admin.from("quiz_questions").select("id, question, options, correct_index, explanation").in("id", allQuestionIds);
    const byId = new Map((questions ?? []).map((q) => [q.id as string, q]));
    const ordered = allQuestionIds.map((id) => byId.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
    return { ok: true, result: scoreAttempt(ordered, answers) };
  }

  const { data: attempt } = await admin
    .from("exam_attempts")
    .select("id, user_id, lesson_id, question_ids, submitted_at")
    .eq("id", attemptId)
    .maybeSingle();
  if (!attempt || attempt.user_id !== user.id) return { ok: false, error: "Ungültiger Prüfungsversuch." };
  if (attempt.submitted_at) return { ok: false, error: "Diese Prüfung wurde bereits abgegeben." };

  const questionIds = attempt.question_ids as string[];
  const { data: questions } = await admin.from("quiz_questions").select("id, question, options, correct_index, explanation").in("id", questionIds);
  const byId = new Map((questions ?? []).map((q) => [q.id as string, q]));
  const orderedQuestions = questionIds.map((id) => byId.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
  const result = scoreAttempt(orderedQuestions, answers);

  const { error } = await admin
    .from("exam_attempts")
    .update({
      answers: Object.fromEntries(answers.map((a) => [a.questionId, a.selectedIndex])),
      submitted_at: new Date().toISOString(),
      score: result.score,
      passed: result.passed,
    })
    .eq("id", attemptId);
  if (error) return { ok: false, error: SAVE_ERROR };

  if (result.passed) {
    await admin.from("lesson_progress").upsert({ user_id: user.id, lesson_id: attempt.lesson_id as string }, { onConflict: "user_id,lesson_id" });
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true, result };
}
