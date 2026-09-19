"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { field, label } from "@/lib/form-styles";

const MIN_LENGTH = 8;

export default function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Das Passwort muss mindestens ${MIN_LENGTH} Zeichen lang sein.`);
      return;
    }
    if (password !== confirm) {
      setError("Die beiden Passwörter stimmen nicht überein.");
      return;
    }

    setSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPassword("");
    setConfirm("");
    setMessage("Passwort geändert.");
  }

  return (
    <div className="glass" style={{ borderRadius: 20, padding: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700 }}>Passwort ändern</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 18 }}>
        <label style={label}>
          Neues Passwort
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} style={field} />
        </label>
        <label style={label}>
          Passwort wiederholen
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={field} />
        </label>
        {message && (
          <p style={{ fontSize: 13, color: "var(--sky-deep)", background: "rgba(47,155,234,0.08)", padding: "8px 12px", borderRadius: 8 }}>{message}</p>
        )}
        {error && (
          <p style={{ fontSize: 13, color: "#c0334d", background: "rgba(192,51,77,0.08)", padding: "8px 12px", borderRadius: 8 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-accent"
          style={{ padding: 12, borderRadius: 10, border: "none", justifySelf: "start", paddingLeft: 24, paddingRight: 24 }}
        >
          {saving ? "Speichert…" : "Passwort ändern"}
        </button>
      </form>
    </div>
  );
}
