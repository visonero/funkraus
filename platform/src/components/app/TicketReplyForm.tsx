"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { replyToTicket } from "@/lib/course/study-actions";
import { adminReply } from "@/app/admin/tickets/actions";

const area: React.CSSProperties = { display: "block", width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid var(--line-strong)", background: "rgba(255,255,255,0.8)", fontSize: 14.5, fontFamily: "var(--font-body)", color: "var(--text)", resize: "vertical" };

export default function TicketReplyForm({ ticketId, mode }: { ticketId: string; mode: "user" | "staff" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [close, setClose] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = mode === "staff" ? await adminReply(ticketId, message, close) : await replyToTicket(ticketId, message);
      if (res.ok) {
        setMessage("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div style={{ marginTop: 20 }}>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={mode === "staff" ? 5000 : 2000} placeholder={mode === "staff" ? "Deine Antwort…" : "Nachricht schreiben…"} style={area} />
      {mode === "staff" && (
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13.5, color: "var(--text-dim)" }}>
          <input type="checkbox" checked={close} onChange={(e) => setClose(e.target.checked)} />
          Ticket nach der Antwort abschließen
        </label>
      )}
      {error && <p style={{ marginTop: 10, fontSize: 13.5, color: "#c0334d" }}>{error}</p>}
      <button type="button" onClick={submit} disabled={pending} className="btn-accent" style={{ marginTop: 12, padding: "12px 24px", borderRadius: 999, fontSize: 14.5, border: "none", opacity: pending ? 0.7 : 1 }}>
        {pending ? "Wird gesendet…" : mode === "staff" ? "Antwort senden" : "Senden"}
      </button>
    </div>
  );
}
