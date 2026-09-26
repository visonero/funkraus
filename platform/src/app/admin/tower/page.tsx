import { formatPostDate } from "@/components/blog/BlogCard";
import { towerMode } from "@/lib/tower/ai";
import { TOWER, usd } from "@/lib/tower/config";
import { getStore } from "@/lib/tower/store";
import { createAdminClient } from "@/lib/supabase/admin";

const eur = (micro: number) => `$${usd(micro).toFixed(3)}`;

export default async function AdminTowerPage() {
  const store = getStore();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
  const [monthCost, sessions] = await Promise.all([store.totalCostSince(monthStart), store.recent(60)]);

  const ids = [...new Set(sessions.map((s) => s.userId))];
  const { data: profiles } = ids.length ? await createAdminClient().from("profiles").select("id, email").in("id", ids) : { data: [] };
  const emails = new Map((profiles ?? []).map((p) => [p.id as string, p.email as string | null]));

  const finished = sessions.filter((s) => s.turns > 0);
  const avg = finished.length ? finished.reduce((n, s) => n + s.costMicroUsd, 0) / finished.length : 0;
  const share = Math.min(100, Math.round((usd(monthCost) / TOWER.limits.globalMonthlyBudgetUsd) * 100));

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Funktraining: Nutzung und Kosten</h1>
      <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>
        Modus: <strong>{towerMode() === "live" ? "live (echte KI)" : "Entwicklung (vorbereitete Antworten)"}</strong> · Modell: {TOWER.llmModel} · Stimme: {TOWER.ttsModel}
      </p>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
        {[
          { label: "Kosten diesen Monat", value: `$${usd(monthCost).toFixed(2)}`, sub: `${share} % von $${TOWER.limits.globalMonthlyBudgetUsd} Monatsgrenze` },
          { label: "Durchschnitt pro Übung", value: `$${usd(avg).toFixed(3)}`, sub: `aus ${finished.length} Übungen mit Funksprüchen` },
          { label: "Grenze pro Nutzer", value: `$${TOWER.limits.userMonthlyBudgetUsd.toFixed(2)}`, sub: `${TOWER.limits.maxSessionsPerDay} Übungen pro Tag, ${TOWER.limits.maxTurnsPerSession} Funksprüche pro Übung` },
        ].map((c) => (
          <div key={c.label} className="glass" style={{ borderRadius: 16, padding: "16px 18px" }}>
            <p style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 600 }}>{c.label}</p>
            <p style={{ marginTop: 4, fontSize: 24, fontWeight: 800 }}>{c.value}</p>
            <p style={{ marginTop: 2, fontSize: 12.5, color: "var(--text-dim)" }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 32, fontSize: 18, fontWeight: 700 }}>Letzte Übungen</h2>
      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-faint)" }}>
              {["Datum", "Nutzer", "Übung", "Status", "Funksprüche", "Tokens (ein/aus)", "Stimme (Zeichen)", "Sprache (Sek.)", "Kosten"].map((h) => (
                <th key={h} style={{ padding: "8px 10px", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 14, color: "var(--text-faint)" }}>Noch keine Übungen.</td></tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{formatPostDate(s.startedAt)}</td>
                <td style={{ padding: "8px 10px" }}>{emails.get(s.userId) ?? (s.userId.startsWith("0000") ? "Demo" : s.userId.slice(0, 8))}</td>
                <td style={{ padding: "8px 10px" }}>{s.scenarioId}{s.mode === "mock" ? " (Demo)" : ""}</td>
                <td style={{ padding: "8px 10px" }}>{s.status}</td>
                <td style={{ padding: "8px 10px" }}>{s.turns}</td>
                <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{s.usage.inputTokens} / {s.usage.outputTokens}</td>
                <td style={{ padding: "8px 10px" }}>{s.usage.ttsChars}</td>
                <td style={{ padding: "8px 10px" }}>{Math.round(s.usage.sttSeconds)}</td>
                <td style={{ padding: "8px 10px", fontWeight: 700 }}>{eur(s.costMicroUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
