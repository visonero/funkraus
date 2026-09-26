import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import AppIcon from "@/components/app/AppIcon";
import CompleteButton from "@/components/app/CompleteButton";
import ExamSimulation from "@/components/app/ExamSimulation";
import LessonFlow from "@/components/app/LessonFlow";
import UpgradeCard from "@/components/app/UpgradeCard";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourseData, getLessonDetail } from "@/lib/course/data";
import { getExamState } from "@/lib/course/exam";
import { getFlaggedIds } from "@/lib/course/study";
import { moduleLabel } from "@/lib/course/format";
import { splitSections } from "@/lib/course/sections";

const TYPE_LABEL = { video: "Video", audio: "Audio", text: "Lesetext", quiz: "Quiz", exam: "Prüfung" } as const;

export default async function LessonPage({ params, searchParams }: PageProps<"/dashboard/course/[lessonId]">) {
  const { lessonId } = await params;
  const { schritt } = await searchParams;
  const initialStep = Math.max(0, (Number(Array.isArray(schritt) ? schritt[0] : schritt) || 1) - 1);
  const user = (await getCurrentUser())!;

  const [lesson, course] = await Promise.all([getLessonDetail(lessonId, user.id), getCourseData(user.id)]);
  if (!lesson) notFound();
  const examState = lesson.type === "exam" && !lesson.locked ? await getExamState(user.id, lesson.id) : null;
  const flaggedIds = lesson.questions.length > 0 ? await getFlaggedIds(user.id) : [];

  const flat = course.modules.flatMap((m) => m.chapters.map((c) => ({ chapter: c, module: m })));
  const index = flat.findIndex((f) => f.chapter.id === lesson.id);
  const current = index >= 0 ? flat[index] : null;
  const prev = index > 0 ? flat[index - 1] : null;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;

  if (lesson.locked) {
    return (
      <div style={{ maxWidth: 820 }}>
        <nav aria-label="Brotkrumen" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, fontSize: 13, color: "var(--text-faint)", fontWeight: 600 }}>
          <Link href="/dashboard/course" style={{ color: "var(--sky-deep)" }}>Kurs</Link>
          {current && (
            <>
              <span>›</span>
              <span>Modul {moduleLabel(current.module.num)}</span>
            </>
          )}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <span className="module-track" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <AppIcon name="lock" size={14} />
            Vollzugang
          </span>
        </div>
        <h1 style={{ marginTop: 12, fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, lineHeight: 1.2 }}>{lesson.title}</h1>
        {current && <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-faint)" }}>{current.module.title}</p>}

        <div className="glass" style={{ marginTop: 24, borderRadius: 20, aspectRatio: "16 / 9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-faint)", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(47,155,234,0.10), rgba(34,211,238,0.14))" }} />
          <span className="dash-icon" style={{ position: "relative", width: 60, height: 60, background: "rgba(255,255,255,0.8)", color: "var(--sky)" }}>
            <AppIcon name="lock" size={28} />
          </span>
          <span style={{ position: "relative", fontSize: 15, fontWeight: 600, color: "var(--text-dim)" }}>Dieses Kapitel gehört zum vollen Zugang</span>
        </div>

        <div style={{ marginTop: 28 }}>
          <UpgradeCard
            catalog={course.catalog}
            title={<>Bis hierhin war es <span className="grad">kostenlos</span></>}
            text="Die ersten 2 Module gehören dir. Für alles ab Modul 2 schaltest du den Kurs einmalig frei."
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          {prev && !prev.chapter.locked && (
            <Link href={`/dashboard/course/${prev.chapter.id}`} className="btn-ghost" style={{ padding: "11px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600 }}>
              ← Zurück zum letzten Kapitel
            </Link>
          )}
          <Link href="/dashboard/course" className="btn-ghost" style={{ padding: "11px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600 }}>
            Zur Kursübersicht
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <nav aria-label="Brotkrumen" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, fontSize: 13, color: "var(--text-faint)", fontWeight: 600 }}>
        <Link href="/dashboard/course" style={{ color: "var(--sky-deep)" }}>Kurs</Link>
        {current && (
          <>
            <span>›</span>
            <span>Modul {moduleLabel(current.module.num)}</span>
          </>
        )}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <span className="module-track" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <AppIcon name={lesson.type} size={14} />
          {TYPE_LABEL[lesson.type]}
        </span>
        {lesson.completed && (
          <span className="module-track" style={{ background: "rgba(52,211,153,0.16)", color: "#0b7a55" }}>Abgeschlossen</span>
        )}
      </div>
      <h1 style={{ marginTop: 12, fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, lineHeight: 1.2 }}>{lesson.title}</h1>
      {current && <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-faint)" }}>{current.module.title}</p>}

      {lesson.type === "exam" ? (
        <>
          {lesson.body && (
            <div className="prose" style={{ marginTop: 28 }}>
              <Markdown remarkPlugins={[remarkGfm]}>{lesson.body}</Markdown>
            </div>
          )}
          {examState && current && <ExamSimulation lessonId={lesson.id} track={current.module.track} initialState={examState} />}
        </>
      ) : (
        <LessonFlow
          key={lesson.id}
          lessonId={lesson.id}
          completed={lesson.completed}
          mediaUrl={lesson.mediaUrl ?? null}
          audioUrl={lesson.audioUrl ?? null}
          pdfUrl={lesson.pdfUrl ?? null}
          sections={splitSections(lesson.body)}
          questions={lesson.questions}
          flaggedIds={flaggedIds}
          next={next && !next.chapter.locked ? { href: `/dashboard/course/${next.chapter.id}`, title: next.chapter.title } : null}
          initialStep={initialStep}
        />
      )}

      {lesson.type === "exam" && (
        <div className="glass-strong dash-card" style={{ marginTop: 40, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <CompleteButton key={lesson.id} lessonId={lesson.id} completed={lesson.completed} />
          <div style={{ display: "flex", gap: 10 }}>
            {prev && (
              <Link href={`/dashboard/course/${prev.chapter.id}`} className="btn-ghost" style={{ padding: "11px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600 }}>
                ← Zurück
              </Link>
            )}
            {next && (
              <Link href={`/dashboard/course/${next.chapter.id}`} className="btn-ghost" style={{ padding: "11px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600 }}>
                Weiter →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
