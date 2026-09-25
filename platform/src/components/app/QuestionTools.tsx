"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import AppIcon from "./AppIcon";
import { createTicket, toggleFlag } from "@/lib/course/study-actions";

const toolBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 999,
  border: "1.5px solid var(--line-strong)",
  background: "rgba(255,255,255,0.6)",
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--text-dim)",
  cursor: "pointer",
};

// "Merken" (save for later) and "Frage stellen" (ticket to a real person) for one quiz question.
export default function QuestionTools({
  questionId,
  initialFlagged,
  selectedIndex = null,
  onFlagChange,
}: {
  questionId: string;
  initialFlagged: boolean;
  selectedIndex?: number | null;
  onFlagChange?: (flagged: boolean) => void;
}) {
  const [flagged, setFlagged] = useState(initialFlagged);
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function flag() {
    const next = !flagged;
    setFlagged(next);
    setError(null);
    startTransition(async () => {
      const res = await toggleFlag(questionId, next);
      if (!res.ok) {
        setFlagged(!next);
        setError(res.error);
      } else {
        onFlagChange?.(next);
      }
    });
  }

  function send() {
    setError(null);
    startTransition(async () => {
      const res = await createTicket(questionId, message, selectedIndex);
      if (res.ok) {
        setSent(true);
        setMessage("");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={flag}
          disabled={pending}
          aria-pressed={flagged}
          style={{ ...toolBtn, ...(flagged ? { background: "rgba(47,155,234,0.14)", borderColor: "rgba(47,155,234,0.5)", color: "var(--sky-deep)" } : {}) }}
        >
          <AppIcon name="bookmark" size={15} />
          {flagged ? "Gemerkt" : "Merken"}
        </button>
        <button type="button" onClick={() => setAsking((v) => !v)} aria-expanded={asking} style={toolBtn}>
          <AppIcon name="chat" size={15} />
          Frage stellen
        </button>
      </div>

      {asking && (
        <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: "rgba(47,155,234,0.06)", border: "1px solid var(--line)" }}>
          {sent ? (
            <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.55 }}>
              Danke, deine Frage ist bei uns angekommen. Wir antworten in der Regel innerhalb von 48 Stunden. Die Antwort findest du unter{" "}
              <Link href="/dashboard/tickets" style={{ color: "var(--sky-deep)", fontWeight: 600 }}>Meine Fragen</Link>.
            </p>
          ) : (
            <>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dim)" }}>
                Was ist dir bei dieser Frage unklar?
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Beschreibe kurz, was du nicht verstehst. Deine Frage und deine Antwort schicken wir automatisch mit."
                  style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 12, border: "1.5px solid var(--line-strong)", background: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "var(--font-body)", color: "var(--text)", resize: "vertical" }}
                />
              </label>
              <button type="button" onClick={send} disabled={pending} className="btn-accent" style={{ marginTop: 10, padding: "10px 20px", borderRadius: 999, fontSize: 13.5, border: "none", opacity: pending ? 0.7 : 1 }}>
                {pending ? "Wird gesendet…" : "Frage absenden"}
              </button>
            </>
          )}
        </div>
      )}
      {error && <p style={{ marginTop: 8, fontSize: 13, color: "#c0334d" }}>{error}</p>}
    </div>
  );
}
