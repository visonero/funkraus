"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string) {
  const v = formData.get(key);
  return v ? Number(v) : 0;
}

// ---------- Modules ----------

export async function createModule(formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db.from("course_modules").insert({
    track: str(formData, "track"),
    num: str(formData, "num"),
    title: str(formData, "title"),
    description: str(formData, "description") || null,
    duration_minutes: num(formData, "duration_minutes") || null,
    sort_order: num(formData, "sort_order"),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateModule(id: string, formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db
    .from("course_modules")
    .update({
      track: str(formData, "track"),
      num: str(formData, "num"),
      title: str(formData, "title"),
      description: str(formData, "description") || null,
      duration_minutes: num(formData, "duration_minutes") || null,
      sort_order: num(formData, "sort_order"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/modules/${id}`);
}

export async function deleteModule(id: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("course_modules").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  redirect("/admin");
}

// ---------- Lessons ----------

export async function createLesson(moduleId: string, formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db.from("course_lessons").insert({
    module_id: moduleId,
    title: str(formData, "title"),
    content_type: str(formData, "content_type") || "text",
    body: str(formData, "body") || null,
    media_url: str(formData, "media_url") || null,
    sort_order: num(formData, "sort_order"),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/modules/${moduleId}`);
}

export async function updateLesson(id: string, moduleId: string, formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db
    .from("course_lessons")
    .update({
      title: str(formData, "title"),
      content_type: str(formData, "content_type") || "text",
      body: str(formData, "body") || null,
      media_url: str(formData, "media_url") || null,
      sort_order: num(formData, "sort_order"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath(`/admin/lessons/${id}`);
}

export async function deleteLesson(id: string, moduleId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("course_lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/modules/${moduleId}`);
  redirect(`/admin/modules/${moduleId}`);
}

// ---------- Quiz questions ----------

function optionsFromForm(formData: FormData) {
  return [
    str(formData, "option_0"),
    str(formData, "option_1"),
    str(formData, "option_2"),
    str(formData, "option_3"),
  ];
}

export async function createQuestion(lessonId: string, formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db.from("quiz_questions").insert({
    lesson_id: lessonId,
    question: str(formData, "question"),
    options: optionsFromForm(formData),
    correct_index: num(formData, "correct_index"),
    sort_order: num(formData, "sort_order"),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function updateQuestion(id: string, lessonId: string, formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db
    .from("quiz_questions")
    .update({
      question: str(formData, "question"),
      options: optionsFromForm(formData),
      correct_index: num(formData, "correct_index"),
      sort_order: num(formData, "sort_order"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function deleteQuestion(id: string, lessonId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("quiz_questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/lessons/${lessonId}`);
}
