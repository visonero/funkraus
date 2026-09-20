"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasCourseAccess } from "./data";
import { DEMO_CORRECT_INDEX, DEMO_EXPLANATION, isDemoMode } from "./demo";

type ActionResult = { ok: true } | { ok: false; error: string };
type AnswerResult =
  | { ok: true; correct: boolean; correctIndex: number; explanation: string | null }
  | { ok: false; error: string };

const SAVE_ERROR = "Fortschritt konnte nicht gespeichert werden. Bitte versuch es gleich nochmal.";

async function requireLearner(): Promise<{ userId: string } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Bitte melde dich erneut an." };
  if (!(await hasCourseAccess(user.id))) return { error: "Für diese Aktion brauchst du den freigeschalteten Kurs." };
  return { userId: user.id };
}

export async function setChapterCompleted(lessonId: string, completed: boolean): Promise<ActionResult> {
  const learner = await requireLearner();
  if ("error" in learner) return { ok: false, error: learner.error };
  if (isDemoMode()) return { ok: true };

  const admin = createAdminClient();
  const { error } = completed
    ? await admin
        .from("lesson_progress")
        .upsert({ user_id: learner.userId, lesson_id: lessonId }, { onConflict: "user_id,lesson_id" })
    : await admin.from("lesson_progress").delete().eq("user_id", learner.userId).eq("lesson_id", lessonId);

  if (error) return { ok: false, error: SAVE_ERROR };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function submitAnswer(questionId: string, selectedIndex: number): Promise<AnswerResult> {
  const learner = await requireLearner();
  if ("error" in learner) return { ok: false, error: learner.error };
  if (isDemoMode()) {
    return { ok: true, correct: selectedIndex === DEMO_CORRECT_INDEX, correctIndex: DEMO_CORRECT_INDEX, explanation: DEMO_EXPLANATION };
  }

  const admin = createAdminClient();
  const questionQuery = (columns: string) => admin.from("quiz_questions").select(columns).eq("id", questionId).maybeSingle();
  // Before migration 0005 the explanation column does not exist yet.
  let found = await questionQuery("id, correct_index, options, explanation");
  if (found.error) found = await questionQuery("id, correct_index, options");
  const question = found.data as unknown as { correct_index: number; options: unknown; explanation?: string | null } | null;

  const optionCount = Array.isArray(question?.options) ? question.options.length : 0;
  if (!question || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= optionCount) {
    return { ok: false, error: "Ungültige Antwort." };
  }

  const correct = selectedIndex === question.correct_index;
  const { error } = await admin.from("question_attempts").insert({
    user_id: learner.userId,
    question_id: questionId,
    selected_index: selectedIndex,
    is_correct: correct,
  });

  if (error) return { ok: false, error: SAVE_ERROR };
  revalidatePath("/dashboard", "layout");
  return { ok: true, correct, correctIndex: question.correct_index, explanation: question.explanation ?? null };
}
