"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { germanAuthError } from "@/lib/auth/errors";

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

export default function AuthForm({ initialMode = "signin", callbackError = false }: { initialMode?: Mode; callbackError?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError ? "Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an." : null,
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (forgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        setError(germanAuthError(error));
      } else {
        // Same message whether or not the address has an account, so this can't be used to probe for registered emails.
        setMessage("Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen Link zum Zurücksetzen geschickt.");
      }
      setLoading(false);
      return;
    }

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
        setError(germanAuthError(error));
      } else {
        setMessage("Fast geschafft — bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(germanAuthError(error));
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
          className={`tab-btn${mode === "signin" && !forgot ? " is-active" : ""}`}
          onClick={() => {
            setMode("signin");
            setForgot(false);
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
            setForgot(false);
            setError(null);
            setMessage(null);
          }}
        >
          Registrieren
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
        {forgot && (
          <p style={{ fontSize: 13.5, color: "var(--text-dim)" }}>
            Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegen kannst.
          </p>
        )}
        {mode === "signup" && !forgot && (
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
        {!forgot && (
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
        )}
        {mode === "signin" && !forgot && (
          <button
            type="button"
            onClick={() => {
              setForgot(true);
              setError(null);
              setMessage(null);
            }}
            className="nav-link"
            style={{ alignSelf: "flex-end", background: "transparent", border: "none", padding: 0, fontSize: 13, marginTop: -6 }}
          >
            Passwort vergessen?
          </button>
        )}

        {mode === "signup" && !forgot && (
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
          {loading ? "Einen Moment…" : forgot ? "Link zum Zurücksetzen senden" : mode === "signup" ? "Kostenloses Konto erstellen" : "Anmelden"}
        </button>
        {forgot && (
          <button
            type="button"
            onClick={() => {
              setForgot(false);
              setError(null);
              setMessage(null);
            }}
            className="nav-link"
            style={{ background: "transparent", border: "none", padding: 0, fontSize: 13.5, textAlign: "center" }}
          >
            ← Zurück zur Anmeldung
          </button>
        )}
      </form>
    </div>
  );
}
