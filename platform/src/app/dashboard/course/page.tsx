import Link from "next/link";
import AppIcon from "@/components/app/AppIcon";
import PageHeader from "@/components/app/PageHeader";
import { ProgressBar } from "@/components/app/charts";
import CheckoutButton from "@/components/CheckoutButton";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourseData, hasCourseAccess } from "@/lib/course/data";

const PRICE = "349";
const TRACK_LABEL = { bzf2: "BZF II", bzf1: "BZF I" } as const;

export default async function CoursePage() {
  const user = (await getCurrentUser())!;
  const [course, hasAccess] = await Promise.all([getCourseData(user.id), hasCourseAccess(user.id)]);

  if (!hasAccess) {
    return (
      <div>
        <PageHeader eyebrow="Kurs" title={<>Dein Kurs wartet auf <span className="grad">dich</span></>} />
        <div className="glass-strong dash-card" style={{ maxWidth: 520 }}>
          <span className="dash-icon" style={{ background: "rgba(47,155,234,0.14)", color: "var(--sky)" }}>
            <AppIcon name="lock" size={22} />
          </span>
          <h2 style={{ marginTop: 16, fontSize: 19, fontWeight: 700 }}>Kurs noch nicht freigeschaltet</h2>
          <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>
            In der Kursübersicht siehst du schon die Struktur des Kurses. Mit deinem Zugang öffnest du alle Module, Kapitel und Quizfragen —
            einmal zahlen, lebenslang lernen.
          </p>
          <CheckoutButton price={PRICE} marginTop={22} />
        </div>
      </div>
    );
  }

  if (course.modules.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Kurs" title={<>Dein <span className="grad">Kurs</span></>} />
        <div className="glass dash-card" style={{ maxWidth: 520 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Die Kursinhalte werden vorbereitet</h2>
          <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>
            Dein Zugang ist aktiv. Sobald die ersten Module veröffentlicht sind, findest du sie hier und in der Kursübersicht.
          </p>
        </div>
      </div>
    );
  }

  const { next, totals } = course;

  return (
    <div>
      <PageHeader
        eyebrow="Kurs"
        title={<>Dein <span className="grad">Kurs</span></>}
        subtitle={`${totals.modules} Module · ${totals.chapters} Kapitel · ${totals.questions} Fragen. Öffne ein Kapitel aus der Kursübersicht oder mach dort weiter, wo du aufgehört hast.`}
      />

      {next && (
        <Link
          href={`/dashboard/course/${next.chapter.id}`}
          className="glass-strong dash-card course-continue"
        >
          <span className="dash-icon" style={{ background: "rgba(47,155,234,0.14)", color: "var(--sky)" }}>
            <AppIcon name={next.chapter.type} size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="label" style={{ color: "var(--sky)" }}>{totals.chaptersDone > 0 ? "Weiterlernen" : "Hier starten"}</span>
            <p style={{ marginTop: 4, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>{next.chapter.title}</p>
            <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Modul {Number(next.module.num) || next.module.num} · {next.module.title}</p>
          </div>
          <AppIcon name="arrow" size={22} />
        </Link>
      )}

      <div className="module-grid">
        {course.modules.map((m) => {
          const pct = m.chapters.length ? (m.chaptersDone / m.chapters.length) * 100 : 0;
          const target = m.chapters.find((c) => !c.completed) ?? m.chapters[0];
          return (
            <div key={m.id} className="glass dash-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`app-num${m.completed ? " is-done" : ""}`} style={{ width: 30, height: 30, fontSize: 13 }}>
                  {m.completed ? <AppIcon name="check" size={15} /> : Number(m.num) || m.num}
                </span>
                <span className="module-track">{TRACK_LABEL[m.track]}</span>
                {m.durationMinutes ? (
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>
                    ~{m.durationMinutes} Min.
                  </span>
                ) : null}
              </div>
              <h3 style={{ marginTop: 14, fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{m.title}</h3>
              {m.description && <p style={{ marginTop: 6, fontSize: 13.5, color: "var(--text-dim)" }}>{m.description}</p>}
              <p style={{ marginTop: 12, fontSize: 12.5, color: "var(--text-faint)" }}>
                {m.chapters.length} Kapitel · {m.questionsTotal} Fragen
              </p>
              <div style={{ marginTop: "auto", paddingTop: 16 }}>
                <ProgressBar percent={pct} color={m.completed ? "#34d399" : undefined} />
                {target ? (
                  <Link
                    href={`/dashboard/course/${target.id}`}
                    className="btn-ghost"
                    style={{ display: "inline-block", marginTop: 14, padding: "9px 20px", borderRadius: 999, fontSize: 13.5, fontWeight: 600 }}
                  >
                    {m.completed ? "Wiederholen" : m.chaptersDone > 0 ? "Fortsetzen" : "Starten"}
                  </Link>
                ) : (
                  <span style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: "var(--text-faint)" }}>Kapitel folgen</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
