import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestionBox, StatusPill, Thread } from "@/components/app/TicketBits";
import TicketReplyForm from "@/components/app/TicketReplyForm";
import { getTicketThread } from "@/lib/course/study";

export default async function AdminTicketPage({ params }: PageProps<"/admin/tickets/[id]">) {
  const { id } = await params;
  const ticket = await getTicketThread(id, null);
  if (!ticket) notFound();

  return (
    <div style={{ maxWidth: 760 }}>
      <Link href="/admin/tickets" style={{ fontSize: 13, fontWeight: 600, color: "var(--sky-deep)" }}>← Alle Fragen</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0 6px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{ticket.userName || ticket.userEmail || "Lernende/r"}</h1>
        <StatusPill status={ticket.status} />
      </div>
      <p style={{ fontSize: 13.5, color: "var(--text-faint)", marginBottom: 18 }}>
        {ticket.userEmail}
        {ticket.lessonTitle ? ` · ${ticket.lessonTitle}` : ""}
      </p>
      <QuestionBox question={ticket.questionText} options={ticket.options} selectedIndex={ticket.selectedIndex} />
      <div style={{ marginTop: 24 }}>
        <Thread messages={ticket.messages} viewer="staff" staffLabel="Du" userLabel={ticket.userName || "Nutzer"} />
      </div>
      <TicketReplyForm ticketId={ticket.id} mode="staff" />
    </div>
  );
}
