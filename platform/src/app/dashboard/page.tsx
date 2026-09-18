import Logo from "@/components/Logo";

export default function DashboardPage() {
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
      <div className="glass-strong" style={{ borderRadius: 28, padding: 44, maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Logo />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>
          Dein Kursbereich <span className="grad">kommt bald</span>
        </h1>
        <p style={{ marginTop: 12, fontSize: 14.5, color: "var(--text-dim)" }}>
          Nach dem Kauf landest du hier: dein Profil, Kursfortschritt und alle freigeschalteten Module. Diese Seite wird
          angebunden, sobald Auth, Datenbank und Zahlungsabwicklung stehen.
        </p>
        <a href="/" className="btn-ghost" style={{ display: "inline-block", marginTop: 28, padding: "12px 24px", borderRadius: 999, fontSize: 14 }}>
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
}
