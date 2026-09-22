"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

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

export default function AuthForm({ initialMode = "signin" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName, newsletter_opt_in: newsletterOptIn },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Fast geschafft — bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
        <button
          type="button"
          className={`tab-btn${mode === "signin" ? " is-active" : ""}`}
          onClick={() => {
            setMode("signin");
            setError(null);
            setMessage(null);
          }}
        >
          Anmelden
        </button>
        <button
          type="button"
          className={`tab-btn${mode === "signup" ? " is-active" : ""}`}
          onClick={() => {
            setMode("signup");
            setError(null);
            setMessage(null);
          }}
        >
          Registrieren
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
        {mode === "signup" && (
          <label style={labelStyle}>
            Name
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
            />
          </label>
        )}
        <label style={labelStyle}>
          E-Mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Passwort
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {mode === "signup" && (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text-dim)" }}>
            <input
              type="checkbox"
              checked={newsletterOptIn}
              onChange={(e) => setNewsletterOptIn(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              Ja, ich möchte den funkraus-Newsletter erhalten — Lerntipps, Rabatte und Neuigkeiten rund um BZF I &amp; II.
              Jederzeit abbestellbar.
            </span>
          </label>
        )}

        {error && (
          <p style={{ fontSize: 13.5, color: "#c0334d", background: "rgba(192,51,77,0.08)", padding: "10px 12px", borderRadius: 10 }}>
            {error}
          </p>
        )}
        {message && (
          <p style={{ fontSize: 13.5, color: "var(--sky-deep)", background: "rgba(47,155,234,0.08)", padding: "10px 12px", borderRadius: 10 }}>
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-accent" style={{ padding: 14, borderRadius: 999, fontSize: 15, border: "none", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Einen Moment…" : mode === "signup" ? "Kostenloses Konto erstellen" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
