import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import AppIcon from "@/components/app/AppIcon";
import CompleteButton from "@/components/app/CompleteButton";
import LessonQuiz from "@/components/app/LessonQuiz";
import UpgradeCard from "@/components/app/UpgradeCard";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourseData, getLessonDetail } from "@/lib/course/data";
import { moduleLabel } from "@/lib/course/format";

const TYPE_LABEL = { video: "Video", audio: "Audio", text: "Lesetext", quiz: "Quiz" } as const;

export default async function LessonPage({ params }: PageProps<"/dashboard/course/[lessonId]">) {
  const { lessonId } = await params;
  const user = (await getCurrentUser())!;

  const [lesson, course] = await Promise.all([getLessonDetail(lessonId, user.id), getCourseData(user.id)]);
  if (!lesson) notFound();

  const flat = course.modules.flatMap((m) => m.chapters.map((c) => ({ chapter: c, module: m })));
  const index = flat.findIndex((f) => f.chapter.id === lesson.id);
  const current = index >= 0 ? flat[index] : null;
  const prev = index > 0 ? flat[index - 1] : null;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;
  const hasMedia = Boolean(lesson.mediaUrl || lesson.audioUrl);

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
            text="Modul 0 und 1 gehören dir. Für alles ab Modul 2 schaltest du den Kurs einmalig frei."
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

      {lesson.mediaUrl && (
        <div className="glass" style={{ marginTop: 24, borderRadius: 20, overflow: "hidden" }}>
          <video controls preload="metadata" src={lesson.mediaUrl} style={{ display: "block", width: "100%", aspectRatio: "16 / 9", background: "#0e1a2b" }} />
        </div>
      )}

      {!hasMedia && (lesson.type === "video" || lesson.type === "audio") && (
        <div className="glass" style={{ marginTop: 24, borderRadius: 20, aspectRatio: "16 / 9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-faint)" }}>
          <AppIcon name={lesson.type} size={36} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{lesson.type === "video" ? "Video" : "Audio"} folgt in Kürze</span>
        </div>
      )}

      {lesson.body && (
        <div className="prose" style={{ marginTop: 28 }}>
          <Markdown remarkPlugins={[remarkGfm]}>{lesson.body}</Markdown>
        </div>
      )}

      {lesson.audioUrl && (
        <section className="glass dash-card" style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="dash-icon" style={{ background: "rgba(47,155,234,0.14)", color: "var(--sky)" }}>
              <AppIcon name="audio" size={20} />
            </span>
            <div>
              <p className="dash-card-title">Hörübung</p>
              <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Hör zu und sprich in den Pausen laut mit.</p>
            </div>
          </div>
          <audio controls preload="metadata" src={lesson.audioUrl} style={{ display: "block", width: "100%", marginTop: 16 }} />
        </section>
      )}

      {lesson.questions.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Fragen zum Kapitel</h2>
          <LessonQuiz key={lesson.id} questions={lesson.questions} />
        </section>
      )}

      {lesson.pdfUrl && (
        <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="glass dash-card course-continue" style={{ marginTop: 32, marginBottom: 0 }}>
          <span className="dash-icon" style={{ background: "rgba(47,155,234,0.14)", color: "var(--sky)" }}>
            <AppIcon name="text" size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>PDF zum Ausdrucken</p>
            <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Karte öffnen oder herunterladen</p>
          </div>
          <AppIcon name="arrow" size={22} />
        </a>
      )}

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
    </div>
  );
}
