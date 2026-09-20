import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { demoLessonDetail, demoRaw, isDemoMode } from "./demo";
import type {
  ActivityDay,
  Chapter,
  ChapterType,
  CourseData,
  CourseModule,
  LessonDetail,
  RawCourse,
  Track,
  TrackStats,
} from "./types";

const TIME_ZONE = "Europe/Berlin";
const MEDIA_BUCKET = "course-media";
const MEDIA_URL_TTL_SECONDS = 2 * 60 * 60;
const dayKeyFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE });
const weekdayFormat = new Intl.DateTimeFormat("de-DE", { timeZone: TIME_ZONE, weekday: "short" });

function toChapterType(value: string): ChapterType {
  return value === "video" || value === "audio" || value === "quiz" ? value : "text";
}

export const hasCourseAccess = cache(async (userId: string) => {
  if (isDemoMode()) return true;
  const supabase = await createClient();
  const { data } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid")
    .limit(1);
  return (data?.length ?? 0) > 0;
});

async function fetchRawCourse(userId: string): Promise<RawCourse> {
  const supabase = await createClient();
  // Missing tables (migration not run yet) or empty results both degrade to "no data".
  const [modules, lessons, questions, attempts, completions] = await Promise.all([
    supabase
      .from("course_modules")
      .select("id, track, num, title, description, duration_minutes, sort_order")
      .order("sort_order")
      .order("num"),
    supabase.from("course_lessons").select("id, module_id, title, content_type, sort_order").order("sort_order"),
    supabase.from("quiz_questions").select("id, lesson_id"),
    supabase
      .from("question_attempts")
      .select("question_id, is_correct, answered_at")
      .eq("user_id", userId)
      .order("answered_at", { ascending: false })
      .limit(5000),
    supabase.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", userId),
  ]);

  return {
    modules: (modules.data ?? []) as RawCourse["modules"],
    lessons: (lessons.data ?? []) as RawCourse["lessons"],
    questions: (questions.data ?? []) as RawCourse["questions"],
    attempts: (attempts.data ?? []) as RawCourse["attempts"],
    completions: (completions.data ?? []) as RawCourse["completions"],
  };
}

function percentOf(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function computeCourse(raw: RawCourse): CourseData {
  // Latest attempt per question decides whether it currently counts as right or wrong.
  const latestCorrect = new Map<string, boolean>();
  for (const attempt of [...raw.attempts].sort((a, b) => b.answered_at.localeCompare(a.answered_at))) {
    if (!latestCorrect.has(attempt.question_id)) latestCorrect.set(attempt.question_id, attempt.is_correct);
  }
  const completedIds = new Set(raw.completions.map((c) => c.lesson_id));

  const questionsByLesson = new Map<string, string[]>();
  for (const q of raw.questions) {
    const list = questionsByLesson.get(q.lesson_id) ?? [];
    list.push(q.id);
    questionsByLesson.set(q.lesson_id, list);
  }

  const modules: CourseModule[] = [...raw.modules]
    .sort((a, b) => a.sort_order - b.sort_order || a.num.localeCompare(b.num))
    .map((m) => {
      const chapters: Chapter[] = raw.lessons
        .filter((l) => l.module_id === m.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((l) => {
          const ids = questionsByLesson.get(l.id) ?? [];
          return {
            id: l.id,
            moduleId: m.id,
            title: l.title,
            type: toChapterType(l.content_type),
            questionCount: ids.length,
            questionsAnswered: ids.filter((id) => latestCorrect.has(id)).length,
            completed: completedIds.has(l.id),
          };
        });
      const chaptersDone = chapters.filter((c) => c.completed).length;
      return {
        id: m.id,
        track: m.track,
        num: m.num,
        title: m.title,
        description: m.description,
        durationMinutes: m.duration_minutes,
        chapters,
        chaptersDone,
        questionsTotal: chapters.reduce((sum, c) => sum + c.questionCount, 0),
        questionsAnswered: chapters.reduce((sum, c) => sum + c.questionsAnswered, 0),
        completed: chapters.length > 0 && chaptersDone === chapters.length,
      };
    });

  const allChapters = modules.flatMap((m) => m.chapters);
  const chaptersTotal = allChapters.length;
  const chaptersDone = allChapters.filter((c) => c.completed).length;
  const questionsTotal = modules.reduce((sum, m) => sum + m.questionsTotal, 0);
  const questionIds = new Set(raw.questions.map((q) => q.id));
  let questionsCorrect = 0;
  let questionsWrong = 0;
  for (const [id, correct] of latestCorrect) {
    if (!questionIds.has(id)) continue;
    if (correct) questionsCorrect++;
    else questionsWrong++;
  }
  const questionsAnswered = questionsCorrect + questionsWrong;

  const trackStats = (track: Track): TrackStats => {
    const mods = modules.filter((m) => m.track === track);
    const total = mods.reduce((sum, m) => sum + m.chapters.length, 0);
    const done = mods.reduce((sum, m) => sum + m.chaptersDone, 0);
    return { modules: mods.length, chapters: total, chaptersDone: done, percent: percentOf(done, total) };
  };

  const activity: ActivityDay[] = [];
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 3600 * 1000);
    activity.push({ key: dayKeyFormat.format(date), label: weekdayFormat.format(date), questions: 0, chapters: 0 });
  }
  for (const attempt of raw.attempts) {
    const day = activity.find((d) => d.key === dayKeyFormat.format(new Date(attempt.answered_at)));
    if (day) day.questions++;
  }
  for (const completion of raw.completions) {
    const day = activity.find((d) => d.key === dayKeyFormat.format(new Date(completion.completed_at)));
    if (day) day.chapters++;
  }

  const nextChapter = allChapters.find((c) => !c.completed);
  const nextModule = nextChapter ? modules.find((m) => m.id === nextChapter.moduleId) : undefined;

  return {
    modules,
    totals: {
      modules: modules.length,
      modulesDone: modules.filter((m) => m.completed).length,
      chapters: chaptersTotal,
      chaptersDone,
      questions: questionsTotal,
      questionsAnswered,
      questionsCorrect,
      questionsWrong,
      accuracy: questionsAnswered > 0 ? percentOf(questionsCorrect, questionsAnswered) : null,
      percent: percentOf(chaptersDone + questionsAnswered, chaptersTotal + questionsTotal),
    },
    tracks: { bzf2: trackStats("bzf2"), bzf1: trackStats("bzf1") },
    activity,
    next: nextChapter && nextModule ? { chapter: nextChapter, module: nextModule } : null,
    allDone: chaptersTotal > 0 && chaptersDone === chaptersTotal,
  };
}

export const getCourseData = cache(async (userId: string): Promise<CourseData> => {
  return computeCourse(isDemoMode() ? demoRaw() : await fetchRawCourse(userId));
});

// Files in the private course-media bucket are stored as paths and handed out as short-lived signed
// URLs; full http(s) URLs (e.g. a video CDN) pass through unchanged.
async function resolveMediaUrl(path: string | null, downloadName?: string) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const { data } = await createAdminClient()
    .storage.from(MEDIA_BUCKET)
    .createSignedUrl(path, MEDIA_URL_TTL_SECONDS, downloadName ? { download: downloadName } : undefined);
  return data?.signedUrl ?? null;
}

export async function getLessonDetail(lessonId: string, userId: string): Promise<LessonDetail | null> {
  const course = await getCourseData(userId);
  const completed = course.modules.flatMap((m) => m.chapters).find((c) => c.id === lessonId)?.completed ?? false;

  if (isDemoMode()) return demoLessonDetail(lessonId, completed);

  const supabase = await createClient();
  const lessonQuery = (columns: string) => supabase.from("course_lessons").select(columns).eq("id", lessonId).maybeSingle();
  const [fullLesson, questions] = await Promise.all([
    lessonQuery("id, title, content_type, body, media_url, audio_url, pdf_url"),
    // correct_index and explanation are deliberately not selected — answers are checked server-side.
    supabase.from("quiz_questions").select("id, question, options").eq("lesson_id", lessonId).order("sort_order"),
  ]);
  // Before migration 0005 the audio/pdf columns do not exist yet.
  const lesson = fullLesson.error ? await lessonQuery("id, title, content_type, body, media_url") : fullLesson;
  const row = lesson.data as unknown as Record<string, string | null> | null;
  if (!row) return null;

  const [mediaUrl, audioUrl, pdfUrl] = await Promise.all([
    resolveMediaUrl(row.media_url ?? null),
    resolveMediaUrl(row.audio_url ?? null),
    resolveMediaUrl(row.pdf_url ?? null, `${(row.title ?? "Material").replace(/[^\p{L}\p{N}]+/gu, "-")}.pdf`),
  ]);

  return {
    id: row.id as string,
    title: row.title as string,
    type: toChapterType(row.content_type as string),
    body: row.body ?? null,
    mediaUrl,
    audioUrl,
    pdfUrl,
    questions: (questions.data ?? []).map((q) => ({
      id: q.id,
      question: q.question,
      options: Array.isArray(q.options) ? q.options.map(String) : [],
    })),
    completed,
  };
}
