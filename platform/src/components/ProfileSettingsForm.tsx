"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { field, label } from "@/lib/form-styles";

type Props = {
  userId: string;
  initialFullName: string;
  initialEmail: string;
  initialNewsletterOptIn: boolean;
};

export default function ProfileSettingsForm({
  userId,
  initialFullName,
  initialEmail,
  initialNewsletterOptIn,
}: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [newsletterOptIn, setNewsletterOptIn] = useState(initialNewsletterOptIn);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNewsletter, setSavingNewsletter] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    setError(null);

    const supabase = createClient();
    const emailChanged = email !== initialEmail;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, email })
      .eq("id", userId);

    if (profileError) {
      setError(profileError.message);
      setSavingProfile(false);
      return;
    }

    if (emailChanged) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) {
        setError(authError.message);
        setSavingProfile(false);
        return;
      }
      setProfileMessage(
        "Name gespeichert. Für die neue E-Mail-Adresse haben wir dir einen Bestätigungslink geschickt — sie wird erst danach aktiv.",
      );
    } else {
      setProfileMessage("Gespeichert.");
    }

    router.refresh();
    setSavingProfile(false);
  }

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingNewsletter(true);
    setNewsletterMessage(null);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ newsletter_opt_in: newsletterOptIn })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setNewsletterMessage(newsletterOptIn ? "Newsletter aktiviert." : "Vom Newsletter abgemeldet.");
    }
    setSavingNewsletter(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="glass" style={{ borderRadius: 20, padding: 28, textAlign: "left" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Persönliche Daten</h2>
        <form onSubmit={handleProfileSubmit} style={{ display: "grid", gap: 14, marginTop: 18 }}>
          <label style={label}>
            Name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={field} />
          </label>
          <label style={label}>
            E-Mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={field} />
          </label>
          {profileMessage && (
            <p style={{ fontSize: 13, color: "var(--sky-deep)", background: "rgba(47,155,234,0.08)", padding: "8px 12px", borderRadius: 8 }}>
              {profileMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={savingProfile}
            className="btn-accent"
            style={{ padding: 12, borderRadius: 10, border: "none", alignSelf: "flex-start", paddingLeft: 24, paddingRight: 24 }}
          >
            {savingProfile ? "Speichert…" : "Speichern"}
          </button>
        </form>
      </div>

      <div className="glass" style={{ borderRadius: 20, padding: 28, textAlign: "left" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Newsletter &amp; Rabatte</h2>
        <form onSubmit={handleNewsletterSubmit} style={{ marginTop: 14 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--text-dim)" }}>
            <input
              type="checkbox"
              checked={newsletterOptIn}
              onChange={(e) => setNewsletterOptIn(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>Ich möchte den funkraus-Newsletter erhalten (Lerntipps, Rabatte, Neuigkeiten).</span>
          </label>
          {newsletterMessage && (
            <p style={{ marginTop: 10, fontSize: 13, color: "var(--sky-deep)" }}>{newsletterMessage}</p>
          )}
          <button
            type="submit"
            disabled={savingNewsletter}
            className="btn-ghost"
            style={{ marginTop: 14, padding: "10px 20px", borderRadius: 999, fontSize: 13.5 }}
          >
            {savingNewsletter ? "Speichert…" : "Einstellung speichern"}
          </button>
        </form>
      </div>

      {error && (
        <p style={{ fontSize: 13.5, color: "#c0334d", background: "rgba(192,51,77,0.08)", padding: "10px 14px", borderRadius: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
}
