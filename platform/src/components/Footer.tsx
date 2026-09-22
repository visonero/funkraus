import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <div style={{ borderTop: "1px solid var(--line)", padding: "64px 32px 32px", background: "var(--bg-soft)" }}>
      <div className="footer-grid" style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }}>
        <div>
          <Logo size={26} />
          <p style={{ marginTop: 14, fontSize: 13.5, color: "var(--text-faint)", maxWidth: 280 }}>
            Verstanden. Und bestanden. Der Online-Kurs für dein Sprechfunkzeugnis BZF I &amp; II.
          </p>
        </div>
        <div>
          <p className="label" style={{ color: "var(--text-faint)", marginBottom: 14 }}>Kurs</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/#kurs">Kursinhalt</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/kurs">Preis</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/#faq">FAQ</Link>
          </div>
        </div>
        <div>
          <p className="label" style={{ color: "var(--text-faint)", marginBottom: 14 }}>Unternehmen</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a className="nav-link" style={{ fontSize: 13.5 }} href="#">Über uns</a>
            <a className="nav-link" style={{ fontSize: 13.5 }} href="#">Kontakt</a>
          </div>
        </div>
        <div>
          <p className="label" style={{ color: "var(--text-faint)", marginBottom: 14 }}>Rechtliches</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/impressum">Impressum</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/datenschutz">Datenschutz</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/agb">AGB</Link>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "40px auto 0", paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        <p style={{ fontSize: 12, color: "var(--text-faint)", maxWidth: 640 }}>
          funkraus ist kein Teil der Bundesnetzagentur oder des LBA und steht in keiner Verbindung zu diesen Behörden. Alle Prüfungsinhalte basieren auf öffentlich zugänglichen, amtlichen Materialien.
        </p>
        <p style={{ fontSize: 12, color: "var(--text-faint)" }}>© 2026 funkraus</p>
      </div>
    </div>
  );
}
