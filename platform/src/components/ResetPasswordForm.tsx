"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Die beiden Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
      <label style={labelStyle}>
        Neues Passwort
        <input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Passwort wiederholen
        <input type="password" required minLength={6} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
      </label>
      {error && (
        <p style={{ fontSize: 13.5, color: "#c0334d", background: "rgba(192,51,77,0.08)", padding: "10px 12px", borderRadius: 10 }}>{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-accent" style={{ padding: 14, borderRadius: 999, fontSize: 15, border: "none", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Einen Moment…" : "Passwort speichern"}
      </button>
    </form>
  );
}
