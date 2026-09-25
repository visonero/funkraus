import Link from "next/link";
import PageHeader from "@/components/app/PageHeader";
import { StatusPill, formatDate } from "@/components/app/TicketBits";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTickets } from "@/lib/course/study";

export default async function TicketsPage() {
  const user = (await getCurrentUser())!;
  const tickets = await getUserTickets(user.id);

  return (
    <div className="app-container" style={{ maxWidth: 860 }}>
      <PageHeader
        eyebrow="Konto"
        title={<>Meine <span className="grad">Fragen</span></>}
        subtitle="Deine Fragen an uns zu einzelnen Prüfungsfragen und unsere Antworten. Wir antworten in der Regel innerhalb von 48 Stunden."
      />
      {tickets.length === 0 ? (
        <div className="glass dash-card">
          <p style={{ fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Du hast noch keine Frage gestellt. Wenn dir bei einer Übungsfrage etwas unklar ist, klicke dort auf „Frage stellen“.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tickets.map((t) => (
            <Link key={t.id} href={`/dashboard/tickets/${t.id}`} className="glass dash-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.questionText}</p>
                <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-faint)" }}>Aktualisiert {formatDate(t.updatedAt)}</p>
              </div>
              {t.userUnread && <span className="module-track" style={{ background: "var(--sky)", color: "#fff" }}>Neu</span>}
              <StatusPill status={t.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
