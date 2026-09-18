import Logo from "@/components/Logo";

export default function LoginPage() {
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
      <div className="glass-strong" style={{ borderRadius: 28, padding: 44, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>
          Anmelden <span className="grad">kommt bald</span>
        </h1>
        <p style={{ marginTop: 12, fontSize: 14.5, color: "var(--text-dim)" }}>
          Login und Kontoerstellung werden angebunden, sobald die Authentifizierung (Supabase) eingerichtet ist.
        </p>
        <a href="/" className="btn-ghost" style={{ display: "inline-block", marginTop: 28, padding: "12px 24px", borderRadius: 999, fontSize: 14 }}>
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
}
