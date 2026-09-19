import type { ChapterType, LessonDetail, RawCourse, RawLesson, RawModule, RawQuestion, Track } from "./types";

// Local-only sample data for previewing / screenshotting the dashboard before
// real content exists. Enabled by DEMO_DASHBOARD=1 in .env.local and ignored in production builds.
export function isDemoMode() {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_DASHBOARD === "1";
}

export const DEMO_CORRECT_INDEX = 0;

type DemoChapter = [title: string, type: ChapterType, questions: number];
type DemoModule = { track: Track; num: string; title: string; minutes: number; description: string; chapters: DemoChapter[] };

const MODULES: DemoModule[] = [
  {
    track: "bzf2", num: "01", title: "Luftfahrt-Basiswissen für Einsteiger", minutes: 90,
    description: "Luftraumstruktur, Kartenkunde und rechtliche Grundlagen — verständlich erklärt.",
    chapters: [
      ["Luftraumstruktur in Deutschland", "video", 6],
      ["Kartenkunde & Navigation", "text", 5],
      ["Rechtliche Grundlagen", "video", 8],
      ["Flugplatztypen & Verkehrsarten", "text", 6],
      ["Kapitelquiz Grundlagen", "quiz", 12],
    ],
  },
  {
    track: "bzf2", num: "02", title: "Sprechfunk-Grundlagen & Standardphraseologie", minutes: 25,
    description: "Buchstabiertafel, Standardredewendungen und das Kürzelsystem zum Mitschreiben.",
    chapters: [
      ["Die Buchstabiertafel", "audio", 4],
      ["Zahlen und Uhrzeit", "audio", 5],
      ["Standardredewendungen", "video", 8],
      ["Kürzelsystem zum Mitschreiben", "text", 3],
      ["Quiz Standardphraseologie", "quiz", 12],
    ],
  },
  {
    track: "bzf2", num: "03", title: "Platzverkehr — Rollen, Start & Landung", minutes: 30,
    description: "Der komplette Funkablauf beim Rollen, Starten und Landen.",
    chapters: [
      ["Rollen zur Startbahn", "video", 7],
      ["Start & Abflug", "audio", 8],
      ["Anflug & Landung", "video", 9],
      ["Unkontrollierter Platzverkehr", "text", 6],
      ["Funkdrill Platzverkehr", "audio", 5],
      ["Quiz Platzverkehr", "quiz", 12],
    ],
  },
  {
    track: "bzf2", num: "04", title: "Streckenflug & besondere Verfahren", minutes: 25,
    description: "Überlandflug, Kontrollzonen-Durchflug und Sonder-VFR-Anweisungen.",
    chapters: [
      ["Überlandflug & Flugplanung", "video", 7],
      ["Kontrollzonen-Durchflug", "video", 8],
      ["Sonder-VFR", "text", 6],
      ["Flugplatzinformation", "audio", 5],
      ["Quiz Streckenflug", "quiz", 10],
    ],
  },
  {
    track: "bzf2", num: "05", title: "Not- und Dringlichkeitsverfahren", minutes: 20,
    description: "MAYDAY, PAN PAN und Funkausfallverfahren — sicher in jeder Situation.",
    chapters: [
      ["MAYDAY — Notfallmeldung", "video", 6],
      ["PAN PAN — Dringlichkeit", "video", 5],
      ["Funkausfall", "text", 7],
      ["Notfall-Simulation", "audio", 4],
      ["Quiz Notverfahren", "quiz", 8],
    ],
  },
  {
    track: "bzf2", num: "06", title: "BZF II Prüfungssimulation", minutes: 90,
    description: "100 Fragen, 60 Minuten — exakt im Format deiner echten Prüfung.",
    chapters: [
      ["Prüfungssimulation Teil 1", "quiz", 25],
      ["Prüfungssimulation Teil 2", "quiz", 25],
    ],
  },
  {
    track: "bzf1", num: "07", title: "Englischer Sprechfunk — Grundlagen", minutes: 20,
    description: "Buchstabiertafel, Zahlen und Standardphrasen im englischen Funk.",
    chapters: [
      ["Buchstabiertafel & Zahlen", "audio", 4],
      ["Standardphrasen auf Englisch", "video", 6],
      ["Quiz Englische Grundlagen", "quiz", 8],
    ],
  },
  {
    track: "bzf1", num: "08", title: "Englischer Platz- und Streckenverkehr", minutes: 25,
    description: "Dieselben Szenarien wie zuvor — komplett auf Englisch.",
    chapters: [
      ["Englischer Platzverkehr", "video", 7],
      ["Englischer Streckenverkehr", "audio", 6],
      ["Internationale Besonderheiten", "text", 4],
      ["Quiz Englischer Funkverkehr", "quiz", 8],
    ],
  },
  {
    track: "bzf1", num: "09", title: "Textübersetzung & Fachvokabular", minutes: 20,
    description: "Vorbereitung auf den englischen Prüfungsteil mit Original-Übersetzungstexten.",
    chapters: [
      ["Übersetzungstexte Teil 1", "text", 5],
      ["Fachvokabular", "text", 6],
      ["Vokabeltrainer", "quiz", 10],
    ],
  },
  {
    track: "bzf1", num: "10", title: "BZF I Prüfungssimulation", minutes: 90,
    description: "Theorie, Übersetzung und Funkverkehr kombiniert.",
    chapters: [["Prüfungssimulation BZF I", "quiz", 20]],
  },
  {
    track: "bzf1", num: "11", title: "Bonus: Prüfungsanmeldung & Praxistipps", minutes: 10,
    description: "So meldest du dich bei der Bundesnetzagentur an, plus Tipps für den Prüfungstag.",
    chapters: [
      ["Anmeldung bei der Bundesnetzagentur", "text", 0],
      ["Tipps für den Prüfungstag", "video", 0],
    ],
  },
];

// Progress: modules 01–03 done, 04 partly done, everything else untouched.
const DONE_MODULES = 3;
const PARTIAL_MODULE_INDEX = 3;
const PARTIAL_CHAPTERS = 2;
const HOUR = 3600 * 1000;
const DAYS_AGO_PATTERN = [6, 6, 5, 5, 5, 4, 3, 3, 2, 2, 2, 1, 1, 0];

export function demoRaw(): RawCourse {
  const now = Date.now();
  const modules: RawModule[] = [];
  const lessons: RawLesson[] = [];
  const questions: RawQuestion[] = [];
  const attempts: RawCourse["attempts"] = [];
  const completions: RawCourse["completions"] = [];
  let answeredCounter = 0;

  MODULES.forEach((m, mi) => {
    const moduleId = `demo-m-${mi + 1}`;
    modules.push({
      id: moduleId, track: m.track, num: m.num, title: m.title,
      description: m.description, duration_minutes: m.minutes, sort_order: mi,
    });

    m.chapters.forEach(([title, type, qCount], ci) => {
      const lessonId = `demo-l-${mi + 1}-${ci + 1}`;
      lessons.push({ id: lessonId, module_id: moduleId, title, content_type: type, sort_order: ci });

      const chapterDone = mi < DONE_MODULES || (mi === PARTIAL_MODULE_INDEX && ci < PARTIAL_CHAPTERS);
      const chapterStarted = chapterDone || (mi === PARTIAL_MODULE_INDEX && ci === PARTIAL_CHAPTERS);

      for (let q = 0; q < qCount; q++) {
        const questionId = `demo-q-${mi + 1}-${ci + 1}-${q + 1}`;
        questions.push({ id: questionId, lesson_id: lessonId });

        const answered = chapterDone || (chapterStarted && q < Math.ceil(qCount / 2));
        if (answered) {
          const k = answeredCounter++;
          const daysAgo = DAYS_AGO_PATTERN[k % DAYS_AGO_PATTERN.length];
          attempts.push({
            question_id: questionId,
            is_correct: k % 5 !== 0 && k % 9 !== 4,
            answered_at: new Date(now - daysAgo * 24 * HOUR - (k % 5) * HOUR).toISOString(),
          });
        }
      }

      if (chapterDone) {
        const k = completions.length;
        completions.push({
          lesson_id: lessonId,
          completed_at: new Date(now - Math.min(6, Math.floor(k / 3)) * 24 * HOUR - HOUR).toISOString(),
        });
      }
    });
  });

  return { modules, lessons, questions, attempts, completions };
}

export function demoLessonDetail(lessonId: string, completed: boolean): LessonDetail | null {
  const match = /^demo-l-(\d+)-(\d+)$/.exec(lessonId);
  if (!match) return null;
  const chapter = MODULES[Number(match[1]) - 1]?.chapters[Number(match[2]) - 1];
  if (!chapter) return null;
  const [title, type, qCount] = chapter;

  return {
    id: lessonId,
    title,
    type,
    body:
      "Dies ist ein Platzhaltertext für die Vorschau. Hier erscheint später der Lehrtext dieses Kapitels.\n\n" +
      "Ein zweiter Absatz zeigt, wie längere Inhalte im Kursbereich dargestellt werden: gut lesbar, mit viel Weißraum.",
    mediaUrl: null,
    questions: Array.from({ length: Math.min(qCount, 3) }, (_, i) => ({
      id: `demo-q-${match[1]}-${match[2]}-${i + 1}`,
      question: `Beispielfrage ${i + 1}: Welche Antwort ist die korrekte Standardphrase?`,
      options: ["Richtige Antwort", "Falsche Antwort A", "Falsche Antwort B", "Falsche Antwort C"],
    })),
    completed,
  };
}
