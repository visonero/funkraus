import Link from "next/link";
import type { ReactNode } from "react";
import AppIcon, { type AppIconName } from "@/components/app/AppIcon";
import PageHeader from "@/components/app/PageHeader";
import { ColumnChart, DonutChart, ProgressBar, ProgressRing } from "@/components/app/charts";
import CheckoutButton from "@/components/CheckoutButton";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { getCourseData, hasCourseAccess } from "@/lib/course/data";

const PRICE = "349";

function StatCard({
  icon,
  label,
  value,
  detail,
  percent,
  tint,
}: {
  icon: AppIconName;
  label: string;
  value: ReactNode;
  detail: string;
  percent: number;
  tint: string;
}) {
  return (
    <div className="glass dash-card">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="dash-icon" style={{ background: `${tint}22`, color: tint }}>
          <AppIcon name={icon} size={20} />
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-dim)" }}>{label}</span>
      </div>
      <p style={{ marginTop: 14, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, lineHeight: 1 }}>{value}</p>
      <p style={{ marginTop: 6, marginBottom: 14, fontSize: 12.5, color: "var(--text-faint)" }}>{detail}</p>
      <ProgressBar percent={percent} color={tint} />
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flex: "none" }} />
      <span style={{ color: "var(--text-dim)" }}>{label}</span>
      <span style={{ marginLeft: "auto", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = (await getCurrentUser())!;
  const [profile, hasAccess, course, params] = await Promise.all([
    getCurrentProfile(user.id),
    hasCourseAccess(user.id),
    getCourseData(user.id),
    searchParams,
  ]);

  const { totals, tracks, activity, next } = course;
  const firstName = (profile?.full_name || "").trim().split(/\s+/)[0];
  const justPaid = params.checkout === "success";
  const questionsOpen = Math.max(0, totals.questions - totals.questionsAnswered);
  const weekQuestions = activity.reduce((sum, d) => sum + d.questions, 0);
  const weekChapters = activity.reduce((sum, d) => sum + d.chapters, 0);

  let heroTitle: ReactNode;
  let heroText: string;
  let heroAction: { href: string; label: string } | null = { href: "/dashboard/course", label: "Zum Kurs" };
  if (!hasAccess) {
    heroTitle = "Schalte deinen Kurs frei";
    heroText = "Sobald dein Zugang aktiv ist, siehst du hier deinen Lernfortschritt und wo du weitermachen kannst.";
  } else if (totals.chapters === 0) {
    heroTitle = "Deine Kursinhalte werden vorbereitet";
    heroText = "Sobald die ersten Module veröffentlicht sind, kannst du hier direkt loslegen.";
    heroAction = null;
  } else if (course.allDone) {
    heroTitle = "Alle Kapitel abgeschlossen";
    heroText = "Stark! Wiederhole schwierige Fragen oder mach noch eine Prüfungssimulation, um sicher in den Prüfungstag zu gehen.";
  } else if (next) {
    heroTitle = next.chapter.title;
    heroText = `Modul ${next.module.num} · ${next.module.title}`;
    heroAction = {
      href: `/dashboard/course/${next.chapter.id}`,
      label: totals.chaptersDone > 0 ? "Weiterlernen" : "Kurs starten",
    };
  } else {
    heroTitle = "Weiterlernen";
    heroText = "";
  }

  return (
    <div className="app-container">
      <PageHeader
        eyebrow="Dashboard"
        title={
          <>
            {firstName ? "Willkommen zurück, " : "Willkommen zurück"}
            {firstName && <span className="grad">{firstName}</span>}
          </>
        }
        subtitle="Hier siehst du auf einen Blick, wie weit du auf dem Weg zu deinem Sprechfunkzeugnis bist."
      />

      {justPaid && (
        <div
          className="dash-banner"
          style={hasAccess ? { background: "rgba(52,211,153,0.14)", color: "#0b7a55" } : { background: "rgba(47,155,234,0.1)", color: "var(--sky-deep)" }}
        >
          <AppIcon name={hasAccess ? "check" : "help"} size={18} />
          <span>
            {hasAccess
              ? "Zahlung erfolgreich — dein Zugang ist freigeschaltet. Viel Erfolg beim Lernen!"
              : "Wir bestätigen gerade deine Zahlung. Lade die Seite in ein paar Sekunden neu, dann ist dein Zugang aktiv."}
          </span>
        </div>
      )}

      {!hasAccess && !justPaid && (
        <div className="glass-strong dash-card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Du hast den Kurs noch nicht freigeschaltet</p>
            <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-dim)" }}>
              Einmal zahlen, sofort starten, lebenslanger Zugriff. Dein Fortschritt wird ab dem ersten Kapitel hier erfasst.
            </p>
          </div>
          <div style={{ width: 300, maxWidth: "100%" }}>
            <CheckoutButton price={PRICE} marginTop={0} />
          </div>
        </div>
      )}

      <div className="dash-grid dash-grid-hero">
        <div className="glass-strong dash-card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 28 }}>
          <ProgressRing id="overall" percent={totals.percent}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38, lineHeight: 1 }}>
              {totals.percent}
              <span style={{ fontSize: 20 }}>%</span>
            </span>
            <span style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>Gesamtfortschritt</span>
          </ProgressRing>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span className="label" style={{ color: "var(--sky)" }}>{next && hasAccess ? "Als Nächstes" : "Dein Kurs"}</span>
            <h2 style={{ marginTop: 8, fontSize: 21, fontWeight: 700, lineHeight: 1.25 }}>{heroTitle}</h2>
            {heroText && <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-dim)" }}>{heroText}</p>}
            {heroAction && (
              <Link
                href={heroAction.href}
                className="btn-accent"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18, padding: "12px 24px", borderRadius: 999, fontSize: 14.5 }}
              >
                {heroAction.label}
                <AppIcon name="arrow" size={17} />
              </Link>
            )}
          </div>
        </div>

        <div className="glass dash-card">
          <p className="dash-card-title">Fragen im Überblick</p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 22, marginTop: 16 }}>
            <DonutChart
              segments={[
                { label: "Richtig", value: totals.questionsCorrect, color: "#34d399" },
                { label: "Falsch", value: totals.questionsWrong, color: "#ff8fb3" },
                { label: "Noch offen", value: questionsOpen, color: "#cfdbe8" },
              ]}
            >
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, lineHeight: 1 }}>
                {totals.accuracy === null ? "–" : `${totals.accuracy}%`}
              </span>
              <span style={{ marginTop: 3, fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>Trefferquote</span>
            </DonutChart>
            <div style={{ flex: 1, minWidth: 130, display: "flex", flexDirection: "column", gap: 10 }}>
              <Legend color="#34d399" label="Richtig" value={totals.questionsCorrect} />
              <Legend color="#ff8fb3" label="Falsch" value={totals.questionsWrong} />
              <Legend color="#cfdbe8" label="Noch offen" value={questionsOpen} />
            </div>
          </div>
        </div>
      </div>

      <div className="dash-grid dash-grid-stats">
        <StatCard
          icon="layers"
          label="Module"
          value={`${totals.modulesDone} / ${totals.modules}`}
          detail="abgeschlossen"
          percent={totals.modules ? (totals.modulesDone / totals.modules) * 100 : 0}
          tint="#2f9bea"
        />
        <StatCard
          icon="course"
          label="Kapitel"
          value={`${totals.chaptersDone} / ${totals.chapters}`}
          detail={`${Math.max(0, totals.chapters - totals.chaptersDone)} noch offen`}
          percent={totals.chapters ? (totals.chaptersDone / totals.chapters) * 100 : 0}
          tint="#22b8cf"
        />
        <StatCard
          icon="quiz"
          label="Fragen beantwortet"
          value={`${totals.questionsAnswered} / ${totals.questions}`}
          detail={`${questionsOpen} noch offen`}
          percent={totals.questions ? (totals.questionsAnswered / totals.questions) * 100 : 0}
          tint="#a78bfa"
        />
        <StatCard
          icon="target"
          label="Trefferquote"
          value={totals.accuracy === null ? "–" : `${totals.accuracy}%`}
          detail="Anteil richtiger Antworten"
          percent={totals.accuracy ?? 0}
          tint="#34d399"
        />
      </div>

      <div className="dash-grid dash-grid-detail">
        <div className="glass dash-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <p className="dash-card-title">Fortschritt pro Modul</p>
            <Link href="/dashboard/course" style={{ fontSize: 13, fontWeight: 600, color: "var(--sky-deep)" }}>
              Zum Kurs →
            </Link>
          </div>
          {course.modules.length === 0 ? (
            <p style={{ marginTop: 18, fontSize: 14, color: "var(--text-faint)" }}>Noch keine Module veröffentlicht.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              {course.modules.map((m) => {
                const pct = m.chapters.length ? (m.chaptersDone / m.chapters.length) * 100 : 0;
                return (
                  <div key={m.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, marginBottom: 7 }}>
                      <span className={`app-num${m.completed ? " is-done" : ""}`}>
                        {m.completed ? <AppIcon name="check" size={13} /> : Number(m.num) || m.num}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                        {m.title}
                      </span>
                      <span style={{ flex: "none", fontSize: 12.5, color: "var(--text-faint)", fontWeight: 600 }}>
                        {m.chaptersDone}/{m.chapters.length}
                      </span>
                    </div>
                    <ProgressBar percent={pct} color={m.completed ? "#34d399" : undefined} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass dash-card">
            <p className="dash-card-title">Aktivität — letzte 7 Tage</p>
            <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-faint)" }}>
              {weekQuestions} Fragen · {weekChapters} Kapitel
            </p>
            <div style={{ marginTop: 18 }}>
              <ColumnChart
                data={activity.map((d) => ({
                  label: d.label.replace(".", ""),
                  values: [
                    { name: "Fragen", value: d.questions, color: "#2f9bea" },
                    { name: "Kapitel", value: d.chapters, color: "#34d399" },
                  ],
                }))}
              />
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 14, fontSize: 12.5, color: "var(--text-dim)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: "#2f9bea" }} /> Fragen
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: "#34d399" }} /> Kapitel
              </span>
            </div>
          </div>

          <div className="glass dash-card">
            <p className="dash-card-title">Deine Prüfungen</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 18 }}>
              {(
                [
                  ["BZF II · Deutscher Luftraum", tracks.bzf2],
                  ["BZF I · Englisch & International", tracks.bzf1],
                ] as const
              ).map(([title, t]) => (
                <div key={title}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 7 }}>
                    <span style={{ fontWeight: 600 }}>{title}</span>
                    <span style={{ color: "var(--text-faint)", fontWeight: 600 }}>{t.percent}%</span>
                  </div>
                  <ProgressBar percent={t.percent} />
                  <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-faint)" }}>
                    {t.chaptersDone} von {t.chapters} Kapiteln · {t.modules} Module
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
