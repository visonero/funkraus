import Link from "next/link";
import { StatusPill, formatDate } from "@/components/app/TicketBits";
import { getAdminTickets } from "@/lib/course/study";

export default async function AdminTicketsPage() {
  const tickets = await getAdminTickets();
  const open = tickets.filter((t) => t.status === "open");
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Fragen von Lernenden</h1>
      <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>
        {open.length} offen, {tickets.length} insgesamt. Offene Fragen stehen oben.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        {tickets.length === 0 && <p style={{ fontSize: 13.5, color: "var(--text-faint)" }}>Noch keine Fragen.</p>}
        {[...open, ...tickets.filter((t) => t.status !== "open")].map((t) => (
          <Link key={t.id} href={`/admin/tickets/${t.id}`} className="glass" style={{ borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.4 }}>{t.questionText}</p>
              <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-faint)" }}>{t.userEmail ?? "unbekannt"} · {formatDate(t.updatedAt)}</p>
            </div>
            <StatusPill status={t.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
