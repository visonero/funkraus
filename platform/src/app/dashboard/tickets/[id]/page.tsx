import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestionBox, StatusPill, Thread } from "@/components/app/TicketBits";
import TicketReplyForm from "@/components/app/TicketReplyForm";
import { getCurrentUser } from "@/lib/auth/session";
import MarkTicketSeen from "@/components/app/MarkTicketSeen";
import { getTicketThread } from "@/lib/course/study";

export default async function TicketPage({ params }: PageProps<"/dashboard/tickets/[id]">) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const ticket = await getTicketThread(id, user.id);
  if (!ticket) notFound();

  return (
    <div className="app-container" style={{ maxWidth: 760 }}>
      <MarkTicketSeen ticketId={ticket.id} />
      <Link href="/dashboard/tickets" style={{ fontSize: 13, fontWeight: 600, color: "var(--sky-deep)" }}>← Meine Fragen</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0 18px" }}>
        <h1 style={{ fontSize: "clamp(22px,2.6vw,28px)", fontWeight: 800 }}>Deine Frage</h1>
        <StatusPill status={ticket.status} />
      </div>
      <QuestionBox question={ticket.questionText} options={ticket.options} selectedIndex={ticket.selectedIndex} />
      <div style={{ marginTop: 24 }}>
        <Thread messages={ticket.messages} viewer="user" staffLabel="funkraus-Team" userLabel="Du" />
      </div>
      {ticket.status !== "closed" ? (
        <TicketReplyForm ticketId={ticket.id} mode="user" />
      ) : (
        <p style={{ marginTop: 20, fontSize: 13.5, color: "var(--text-faint)" }}>Diese Frage ist abgeschlossen. Wenn noch etwas offen ist, stelle bei der Prüfungsfrage einfach eine neue.</p>
      )}
    </div>
  );
}
