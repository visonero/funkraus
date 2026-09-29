import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import FaqAccordion from "@/components/FaqAccordion";
import { ORIGINAL_PRICE, PRICE } from "@/lib/pricing";

const SIGNUP_HREF = "/login?mode=signup";
const DESCRIPTION = `Was der funkraus-Kurs kostet: kostenlos starten mit den ersten 2 Modulen, danach €${PRICE} einmalig für BZF I & II komplett. Kein Abo, 12 Monate Zugriff.`;

export const metadata: Metadata = {
  title: `Preise — €${PRICE} einmalig für BZF I & II | funkraus`,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: "/preis" },
  openGraph: { type: "website", locale: "de_DE", url: "/preis", siteName: "funkraus", title: "Preise — funkraus", description: DESCRIPTION },
};

const FREE_FEATURES = [
  "Kostenloses Konto mit persönlichem Dashboard",
  "Die ersten 2 Module komplett: Videos, Lesetexte, PDF-Merkblätter",
  "Rund 80 offizielle Prüfungsfragen mit Erklärung",
  "1 Probe-Übung im KI-Funktraining",
  "Keine Zahlungsdaten nötig, kein Ablaufdatum",
];

const PRICE_FEATURES = [
  "BZF I & BZF II komplett, ein Kurs",
  "KI-Funktraining: live mit dem Tower sprechen (Beta)",
  "Kompletter offizieller Fragenkatalog als Übungsquiz",
  "Über 40 Audio-Funkbeispiele & interaktive Simulationen",
  "Vollständige Prüfungssimulationen (BZF I & II)",
  "PDF-Merkblätter & Spickzettel zum Download",
  "12 Monate Zugriff, kein Abo",
];

const PRICE_FAQ = [
  { q: "Ist das ein Abo?", a: "Nein. Du zahlst einmalig, danach hast du 12 Monate Zugriff auf den kompletten Kurs. Es gibt keine automatische Verlängerung und keine versteckten Folgekosten." },
  { q: "Was passiert, wenn ich die BZF-Prüfung nicht auf Anhieb bestehe?", a: "Dein Kurszugang bleibt für die vollen 12 Monate bestehen, du kannst also so oft üben und die Prüfungssimulation wiederholen, wie du möchtest." },
  { q: "Ist die Prüfungsgebühr der Bundesnetzagentur im Preis enthalten?", a: "Nein, die amtliche Prüfungsgebühr zahlst du separat direkt an die Bundesnetzagentur. funkraus bereitet dich auf die Prüfung vor, meldet dich aber nicht an." },
  { q: "Warum ist der Preis für BZF I und BZF II gleich?", a: "Weil es technisch ein einziger Kurs ist: Du bekommst mit dem BZF-II-Kauf automatisch das komplette BZF-I-Material (englischer Funk, internationaler Verkehr) ohne Aufpreis dazu." },
];

export default function PreisPage() {
  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav />

      <div className="section-pad" style={{ padding: "64px 32px 8px", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <span className="label" style={{ color: "var(--sky)" }}>Preis</span>
        <h1 style={{ marginTop: 14, fontSize: "clamp(30px,4vw,46px)", fontWeight: 800, lineHeight: 1.15 }}>
          Ein Preis. <span className="grad">Keine Überraschungen.</span>
        </h1>
        <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>
          Du siehst den Preis von Anfang an und musst nichts bezahlen, um den Kurs kennenzulernen. Kein
          Verkaufsgespräch, kein Abo — du entscheidest erst nach den ersten 2 kostenlosen Modulen.
        </p>
      </div>

      <div className="section-pad" style={{ padding: "32px 32px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 28, maxWidth: 900, margin: "0 auto", alignItems: "stretch" }}>
          <div className="glass-strong" style={{ borderRadius: 24, padding: 32, textAlign: "center", display: "flex", flexDirection: "column" }}>
            <span style={{ display: "inline-block", alignSelf: "center", padding: "5px 14px", borderRadius: 999, background: "rgba(52,211,153,0.16)", color: "#0b7a55", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11.5, marginBottom: 12 }}>
              🎁 Für alle mit Konto
            </span>
            <span className="label" style={{ color: "var(--text-faint)" }}>Kostenlos starten</span>
            <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 5 }}>
              <span className="grad" style={{ fontSize: 20, fontWeight: 800 }}>€</span>
              <span className="grad" style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 800 }}>0</span>
            </div>
            <p style={{ marginTop: 2, fontSize: 12.5, color: "var(--text-faint)" }}>ohne Zahlungsdaten · ohne Ablaufdatum</p>
            <div style={{ textAlign: "left", marginTop: 24, display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
              {FREE_FEATURES.map((text) => (
                <div key={text} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>✓</span>
                  <span style={{ fontSize: 13.5, color: "var(--text-dim)" }}>{text}</span>
                </div>
              ))}
            </div>
            <Link href={SIGNUP_HREF} className="btn-accent" style={{ display: "block", marginTop: 26, padding: 15, borderRadius: 999, fontSize: 15 }}>
              Kostenlos registrieren
            </Link>
          </div>

          <div className="glass-strong" style={{ borderRadius: 24, padding: 32, textAlign: "center", display: "flex", flexDirection: "column", border: "2px solid rgba(47,155,234,0.35)" }}>
            <span style={{ display: "inline-block", alignSelf: "center", padding: "5px 14px", borderRadius: 999, background: "rgba(255,143,179,0.16)", color: "#c0447a", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11.5, marginBottom: 12 }}>
              🔥 Zeitlich begrenztes Angebot
            </span>
            <span className="label" style={{ color: "var(--text-faint)" }}>Vollzugang · BZF I &amp; II komplett</span>
            <div style={{ marginTop: 8, fontSize: 16, color: "var(--text-faint)", textDecoration: "line-through" }}>€{ORIGINAL_PRICE}</div>
            <div style={{ marginTop: 2, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 5 }}>
              <span className="grad" style={{ fontSize: 20, fontWeight: 800 }}>€</span>
              <span className="grad" style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 800 }}>{PRICE}</span>
            </div>
            <p style={{ marginTop: 2, fontSize: 12.5, color: "var(--text-faint)" }}>einmalig · kein Abo · 12 Monate Zugriff</p>
            <div style={{ textAlign: "left", marginTop: 24, display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
              {PRICE_FEATURES.map((text) => (
                <div key={text} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>✓</span>
                  <span style={{ fontSize: 13.5, color: "var(--text-dim)" }}>{text}</span>
                </div>
              ))}
            </div>
            <Link href={SIGNUP_HREF} className="btn-ghost" style={{ display: "block", marginTop: 26, padding: 15, borderRadius: 999, fontSize: 15 }}>
              Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>

      <div className="section-pad" style={{ padding: "40px 32px 100px", maxWidth: 760, margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="label" style={{ color: "var(--sky)" }}>Häufige Fragen zum Preis</span>
          <h2 style={{ fontSize: "clamp(24px,3vw,32px)", marginTop: 14, fontWeight: 800 }}>
            Kurz erklärt, <span className="grad">bevor du fragst.</span>
          </h2>
        </div>
        <FaqAccordion items={PRICE_FAQ} />
        <p style={{ marginTop: 24, textAlign: "center", fontSize: 14 }}>
          <Link href="/#faq" className="nav-link">Weitere Fragen zum Kurs findest du in der allgemeinen FAQ →</Link>
        </p>
      </div>

      <Footer />
    </div>
  );
}
