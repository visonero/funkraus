"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasCourseAccess } from "./data";
import { DEMO_CORRECT_INDEX, isDemoMode } from "./demo";

type ActionResult = { ok: true } | { ok: false; error: string };
type AnswerResult = { ok: true; correct: boolean; correctIndex: number } | { ok: false; error: string };

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
    return { ok: true, correct: selectedIndex === DEMO_CORRECT_INDEX, correctIndex: DEMO_CORRECT_INDEX };
  }

  const admin = createAdminClient();
  const { data: question } = await admin
    .from("quiz_questions")
    .select("id, correct_index, options")
    .eq("id", questionId)
    .maybeSingle();

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
  return { ok: true, correct, correctIndex: question.correct_index };
}
