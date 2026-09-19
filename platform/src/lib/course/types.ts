export type Track = "bzf1" | "bzf2";
export type ChapterType = "video" | "audio" | "text" | "quiz";

export type RawModule = {
  id: string;
  track: Track;
  num: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  sort_order: number;
};
export type RawLesson = {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
  sort_order: number;
};
export type RawQuestion = { id: string; lesson_id: string };
export type RawAttempt = { question_id: string; is_correct: boolean; answered_at: string };
export type RawCompletion = { lesson_id: string; completed_at: string };

export type RawCourse = {
  modules: RawModule[];
  lessons: RawLesson[];
  questions: RawQuestion[];
  attempts: RawAttempt[];
  completions: RawCompletion[];
};

export type Chapter = {
  id: string;
  moduleId: string;
  title: string;
  type: ChapterType;
  questionCount: number;
  questionsAnswered: number;
  completed: boolean;
};

export type CourseModule = {
  id: string;
  track: Track;
  num: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  chapters: Chapter[];
  chaptersDone: number;
  questionsTotal: number;
  questionsAnswered: number;
  completed: boolean;
};

export type ActivityDay = { key: string; label: string; questions: number; chapters: number };

export type TrackStats = { modules: number; chapters: number; chaptersDone: number; percent: number };

export type CourseData = {
  modules: CourseModule[];
  totals: {
    modules: number;
    modulesDone: number;
    chapters: number;
    chaptersDone: number;
    questions: number;
    questionsAnswered: number;
    questionsCorrect: number;
    questionsWrong: number;
    accuracy: number | null;
    percent: number;
  };
  tracks: Record<Track, TrackStats>;
  activity: ActivityDay[];
  next: { chapter: Chapter; module: CourseModule } | null;
  allDone: boolean;
};

export type LessonDetail = {
  id: string;
  title: string;
  type: ChapterType;
  body: string | null;
  mediaUrl: string | null;
  questions: { id: string; question: string; options: string[] }[];
  completed: boolean;
};
