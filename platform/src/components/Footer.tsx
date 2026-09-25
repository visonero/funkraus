import Link from "next/link";
import Logo from "./Logo";
import CookieSettingsLink from "./CookieSettingsLink";

export default function Footer() {
  return (
    <div style={{ borderTop: "1px solid var(--line)", padding: "64px 32px 32px", background: "var(--bg-soft)" }}>
      <div className="footer-grid" style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }}>
        <div>
          <Logo size={26} />
          <p style={{ marginTop: 14, fontSize: 13.5, color: "var(--text-faint)", maxWidth: 280 }}>
            Verstanden. Und bestanden. Der Online-Kurs für dein Sprechfunkzeugnis BZF I &amp; II.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <a
              href="https://wa.me/?text=Schau%20dir%20den%20BZF-Online-Kurs%20von%20funkraus%20an%3A%20https%3A%2F%2Fwww.funkraus.de"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Auf WhatsApp teilen"
              className="nav-link"
              style={{ fontSize: 13 }}
            >
              WhatsApp
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.funkraus.de"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Auf Facebook teilen"
              className="nav-link"
              style={{ fontSize: 13 }}
            >
              Facebook
            </a>
            <a
              href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.funkraus.de&text=BZF-Online-Kurs%20von%20funkraus"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Auf X teilen"
              className="nav-link"
              style={{ fontSize: 13 }}
            >
              X
            </a>
            <a
              href="mailto:?subject=BZF-Online-Kurs%20von%20funkraus&body=Schau%20dir%20das%20mal%20an%3A%20https%3A%2F%2Fwww.funkraus.de"
              aria-label="Per E-Mail teilen"
              className="nav-link"
              style={{ fontSize: 13 }}
            >
              E-Mail
            </a>
          </div>
        </div>
        <div>
          <p className="label" style={{ color: "var(--text-faint)", marginBottom: 14 }}>Kurs</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/#kurs">Kursinhalt</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/#preis">Preise</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/#faq">Häufige Fragen</Link>
          </div>
        </div>
        <div>
          <p className="label" style={{ color: "var(--text-faint)", marginBottom: 14 }}>Unternehmen</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/#vorteile">Über uns</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/blog">Blog</Link>
            <a className="nav-link" style={{ fontSize: 13.5 }} href="mailto:h.alkhodour@web.de">Kontakt</a>
          </div>
        </div>
        <div>
          <p className="label" style={{ color: "var(--text-faint)", marginBottom: 14 }}>Rechtliches</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/impressum">Impressum</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/datenschutz">Datenschutz</Link>
            <Link className="nav-link" style={{ fontSize: 13.5 }} href="/agb">AGB</Link>
            <CookieSettingsLink />
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "40px auto 0", paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        <p style={{ fontSize: 12, color: "var(--text-faint)", maxWidth: 640 }}>
          funkraus ist kein Teil der Bundesnetzagentur oder des LBA und steht in keiner Verbindung zu diesen Behörden. Alle Prüfungsinhalte basieren auf öffentlich zugänglichen, amtlichen Materialien.
        </p>
        <div className="footer-credit" style={{ textAlign: "right" }}>
          <p style={{ fontSize: 12, color: "var(--text-faint)" }}>© 2026 funkraus</p>
          <p style={{ marginTop: 4, fontSize: 11, color: "var(--text-faint)" }}>
            Website &amp; Entwicklung von{" "}
            <a href="https://www.visonero.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--sky-deep)", textDecoration: "underline" }}>
              Visonero
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
