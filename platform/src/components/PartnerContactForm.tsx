"use client";

import { useState } from "react";
import { sendPartnerInquiry } from "@/app/partner/actions";

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--line-strong)",
  background: "rgba(255,255,255,0.6)",
  fontSize: 15,
  fontFamily: "var(--font-body)",
  color: "var(--text)",
};

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--text-dim)" };

export default function PartnerContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    const result = await sendPartnerInquiry(new FormData(form));
    if (result.ok) {
      setSent(true);
      form.reset();
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "24px 8px" }}>
        <p style={{ fontSize: 17, fontWeight: 700 }}>Danke für deine Nachricht!</p>
        <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>Wir melden uns so schnell wie möglich bei dir.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        <label style={labelStyle}>
          Name
          <input type="text" name="name" required maxLength={120} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          E-Mail
          <input type="email" name="email" required maxLength={200} style={inputStyle} />
        </label>
      </div>
      <label style={labelStyle}>
        Verein, Flugschule oder Unternehmen (optional)
        <input type="text" name="organisation" maxLength={200} style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Dein Vorhaben
        <textarea
          name="message"
          required
          rows={5}
          maxLength={4000}
          placeholder="Erzähl uns kurz, worum es geht: Partnerschaft mit deinem Verein oder deiner Flugschule, Investment, Kooperation — oder etwas ganz anderes."
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>
      {error && (
        <p style={{ fontSize: 13.5, color: "#c0334d", background: "rgba(192,51,77,0.08)", padding: "10px 12px", borderRadius: 10 }}>{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-accent" style={{ padding: 14, borderRadius: 999, fontSize: 15, border: "none", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Wird gesendet…" : "Nachricht senden"}
      </button>
    </form>
  );
}
