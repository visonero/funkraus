import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Anmelden — funkraus",
  description: "Melde dich bei funkraus an oder erstelle ein kostenloses Konto.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { mode, error } = await searchParams;
  const signup = mode === "signup";
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: "var(--bg)",
      }}
    >
      <div className="glass-strong" style={{ borderRadius: 28, padding: 44, maxWidth: 420, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: "center" }}>
          {signup ? (
            <>
              Heute <span className="grad">kostenlos</span> starten
            </>
          ) : (
            <>
              Willkommen bei <span className="grad">funkraus</span>
            </>
          )}
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-dim)", textAlign: "center" }}>
          {signup
            ? "Konto erstellen und sofort mit Modul 0 und 1 loslegen. Keine Zahlungsdaten nötig."
            : "Melde dich an oder erstelle ein kostenloses Konto."}
        </p>
        <div style={{ marginTop: 28 }}>
          <AuthForm initialMode={signup ? "signup" : "signin"} callbackError={error === "auth_callback_failed"} />
        </div>
        <Link
          href="/"
          className="nav-link"
          style={{ display: "block", textAlign: "center", marginTop: 24, fontSize: 13.5 }}
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
