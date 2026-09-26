import type { ReactNode } from "react";
import { ColumnChart, ProgressBar } from "@/components/app/charts";
import { loadAdminStats } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

const num = (n: number) => n.toLocaleString("de-DE");
const eur = (cents: number) => (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const pct = (x: number, digits = 1) => `${(x * 100).toLocaleString("de-DE", { maximumFractionDigits: digits })} %`;

function Card({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: ReactNode; accent?: boolean }) {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: "16px 18px", ...(accent ? { border: "1.5px solid rgba(47,155,234,0.45)" } : {}) }}>
      <p style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 600 }}>{label}</p>
      <p style={{ marginTop: 4, fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-dim)" }}>{sub}</p>}
    </div>
  );
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 } as const;
const h2 = { marginTop: 36, fontSize: 18, fontWeight: 700 } as const;

export default async function AdminStatsPage() {
  const s = await loadAdminStats();
  const trend = s.growth.newPrev7 ? (s.growth.new7 - s.growth.newPrev7) / s.growth.newPrev7 : null;
  const top = s.funnel[0].value || 1;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Übersicht</h1>
      <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>
        Nutzer, Umsatz und Nutzung auf einen Blick. Deine eigenen Admin-Konten sind nicht mitgezählt. Stand: {new Date(s.generatedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}
      </p>

      <div style={{ ...grid, marginTop: 22 }}>
        <Card accent label="Registrierte Nutzer" value={num(s.users.total)} sub={`${num(s.growth.new7)} neu in 7 Tagen · ${num(s.growth.new30)} in 30 Tagen`} />
        <Card label="Kostenlos (nicht bezahlt)" value={num(s.users.free)} sub="nutzen die ersten 2 Module" />
        <Card accent label="Zahlende Nutzer" value={num(s.users.paying)} sub={`Umsatz gesamt ${eur(s.revenue.totalCents)}${s.revenue.withoutAmount ? ` · ${s.revenue.withoutAmount} ohne Betrag (z. B. von Hand freigeschaltet)` : ""}`} />
        <Card label="Conversion" value={pct(s.conversion)} sub="Anteil der Registrierten, die gekauft haben" />
      </div>

      <div style={{ ...grid, marginTop: 14 }}>
        <Card label="Umsatz diesen Monat" value={eur(s.revenue.monthCents)} sub={s.revenue.refunds ? `${s.revenue.refunds} Rückerstattung(en)` : "keine Rückerstattungen"} />
        <Card
          label="Neue Nutzer, letzte 7 Tage"
          value={num(s.growth.new7)}
          sub={trend === null ? `Vorwoche: ${num(s.growth.newPrev7)}` : `${trend >= 0 ? "▲" : "▼"} ${pct(Math.abs(trend), 0)} zur Vorwoche (${num(s.growth.newPrev7)})`}
        />
        <Card label="Aktiv (Login) in 7 / 30 Tagen" value={`${num(s.growth.active7)} / ${num(s.growth.active30)}`} sub="letzte Anmeldung" />
        <Card label="Kaufentscheidung" value={s.revenue.medianDaysToBuy === null ? "–" : `${s.revenue.medianDaysToBuy.toLocaleString("de-DE", { maximumFractionDigits: 1 })} Tage`} sub="Median von der Registrierung bis zum Kauf" />
      </div>

      <h2 style={h2}>Registrierungen und Käufe, letzte 30 Tage</h2>
      <div className="glass" style={{ marginTop: 12, borderRadius: 18, padding: "20px 22px" }}>
        <ColumnChart
          data={s.days.map((d) => ({
            label: d.label,
            values: [
              { name: "Registrierungen", value: d.signups, color: "var(--sky)" },
              { name: "Käufe", value: d.purchases, color: "#34d399" },
            ],
          }))}
        />
        <p style={{ marginTop: 12, fontSize: 12.5, color: "var(--text-faint)" }}>
          <span style={{ color: "var(--sky)" }}>■</span> Registrierungen · <span style={{ color: "#34d399" }}>■</span> Käufe (Balken übereinander gestapelt)
        </p>
      </div>

      <h2 style={h2}>Weg vom Besucher zum Kunden</h2>
      <div className="glass" style={{ marginTop: 12, borderRadius: 18, padding: "8px 22px 14px" }}>
        {s.funnel.map((step, i) => (
          <div key={step.label} style={{ padding: "12px 0", borderTop: i ? "1px solid var(--line)" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
              <span style={{ fontWeight: 600 }}>{step.label}</span>
              <span>
                <strong>{num(step.value)}</strong>
                <span style={{ color: "var(--text-faint)" }}> · {pct(step.value / top, 0)} der Registrierten</span>
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar percent={(step.value / top) * 100} height={8} />
            </div>
          </div>
        ))}
        <p style={{ marginTop: 6, fontSize: 12.5, color: "var(--text-faint)" }}>
          Hier siehst du, wo Leute abspringen: vor der E-Mail-Bestätigung, vor der ersten Lektion oder vor dem Kauf.
        </p>
      </div>

      <h2 style={h2}>Lernaktivität</h2>
      <div style={{ ...grid, marginTop: 12 }}>
        <Card label="Beantwortete Fragen" value={num(s.learning.answers)} sub={`${num(s.learning.answers7)} in den letzten 7 Tagen`} />
        <Card label="Richtig beantwortet" value={pct(s.learning.correctRate, 0)} sub="Anteil aller Antworten" />
        <Card label="Abgeschlossene Lektionen" value={num(s.learning.lessonsDone)} />
        <Card
          label="Prüfungssimulationen"
          value={num(s.learning.examSubmitted)}
          sub={s.learning.examSubmitted ? `${num(s.learning.examPassed)} bestanden · Ø ${s.learning.avgExamScore} von 100` : "noch keine abgegeben"}
        />
      </div>

      {s.topLessons.length > 0 && (
        <div className="glass" style={{ marginTop: 14, borderRadius: 18, padding: "8px 22px" }}>
          <p style={{ padding: "12px 0 4px", fontSize: 13, fontWeight: 700, color: "var(--text-faint)" }}>Am häufigsten abgeschlossene Lektionen</p>
          {s.topLessons.map((l, i) => (
            <div key={l.title + i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--line)", fontSize: 14 }}>
              <span>
                <span style={{ color: "var(--text-faint)" }}>Modul {l.module} · </span>
                {l.title}
              </span>
              <strong>{num(l.done)}</strong>
            </div>
          ))}
        </div>
      )}

      <h2 style={h2}>KI-Funktraining</h2>
      <div style={{ ...grid, marginTop: 12 }}>
        <Card label="Übungen diesen Monat" value={num(s.tower.monthPractices)} sub="mit mindestens einem Funkspruch" />
        <Card label="Nutzer, die es probiert haben" value={num(s.tower.users)} sub="aus den letzten 500 Übungen" />
        <Card label="Kosten diesen Monat" value={`$${s.tower.monthCostUsd.toFixed(2)}`} sub={`von $${s.tower.budgetUsd} Monatsgrenze`} />
      </div>
      <p style={{ marginTop: 10, fontSize: 13 }}>
        <a href="/admin/tower" className="nav-link">Alle Übungen und Kosten im Detail →</a>
      </p>

      <h2 style={h2}>Weiteres</h2>
      <div style={{ ...grid, marginTop: 12 }}>
        <Card label="Offene Rückfragen" value={num(s.support.openTickets)} sub="Fragen von Nutzern, die auf Antwort warten" />
        <Card label="Gemerkte Fragen" value={num(s.support.flagged)} sub="insgesamt bei allen Nutzern" />
        <Card label="Newsletter-Anmeldungen" value={num(s.users.newsletter)} sub={`${pct(s.users.total ? s.users.newsletter / s.users.total : 0, 0)} der Registrierten`} />
        <Card label="Veröffentlichte Blogartikel" value={num(s.support.posts)} />
      </div>
    </div>
  );
}
