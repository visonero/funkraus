import type { TicketMessage, TicketStatus } from "@/lib/course/study";

export const STATUS_LABEL: Record<TicketStatus, { text: string; bg: string; color: string }> = {
  open: { text: "Offen", bg: "rgba(47,155,234,0.12)", color: "var(--sky-deep)" },
  answered: { text: "Beantwortet", bg: "rgba(52,211,153,0.16)", color: "#0b7a55" },
  closed: { text: "Abgeschlossen", bg: "rgba(30,58,95,0.08)", color: "var(--text-dim)" },
};

export function StatusPill({ status }: { status: TicketStatus }) {
  const s = STATUS_LABEL[status];
  return <span className="module-track" style={{ background: s.bg, color: s.color }}>{s.text}</span>;
}

const dateFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export function QuestionBox({ question, options, selectedIndex }: { question: string; options: string[]; selectedIndex: number | null }) {
  return (
    <div className="glass dash-card">
      <span className="label" style={{ color: "var(--text-faint)" }}>Zur Frage</span>
      <p style={{ marginTop: 8, fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{question}</p>
      {options.length > 0 && (
        <ul style={{ marginTop: 10, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {options.map((o, i) => (
            <li key={i} style={{ fontSize: 13.5, color: i === selectedIndex ? "var(--sky-deep)" : "var(--text-dim)", fontWeight: i === selectedIndex ? 700 : 400 }}>
              {String.fromCharCode(65 + i)}. {o}
              {i === selectedIndex ? "  ← Antwort des Nutzers" : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// asViewer: whose side "you" are; the other party's messages are labelled with theirName.
export function Thread({ messages, viewer, staffLabel, userLabel }: { messages: TicketMessage[]; viewer: "user" | "staff"; staffLabel: string; userLabel: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {messages.map((m) => {
        const mine = m.author === viewer;
        return (
          <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "88%" }}>
            <p style={{ fontSize: 11.5, color: "var(--text-faint)", marginBottom: 4, textAlign: mine ? "right" : "left" }}>
              {m.author === "staff" ? staffLabel : userLabel} · {formatDate(m.createdAt)}
            </p>
            <div style={{ padding: "12px 16px", borderRadius: 16, background: mine ? "rgba(47,155,234,0.12)" : "#fff", border: "1px solid var(--line)", fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.body}</div>
          </div>
        );
      })}
    </div>
  );
}
