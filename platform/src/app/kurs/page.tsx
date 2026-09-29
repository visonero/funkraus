import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import CurriculumTabs from "@/components/CurriculumTabs";

const SIGNUP_HREF = "/login?mode=signup";
const DESCRIPTION =
  "Der komplette Kursinhalt für BZF I und BZF II: 12 Module von den Grundlagen bis zur Prüfungssimulation, mit Video, Audio, Text und Quiz in jeder Lektion.";

export const metadata: Metadata = {
  title: "Kursinhalt — Alle Module für BZF I & II | funkraus",
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: "/kurs" },
  openGraph: { type: "website", locale: "de_DE", url: "/kurs", siteName: "funkraus", title: "Kursinhalt — funkraus", description: DESCRIPTION },
};

const FORMAT_STEPS = [
  { title: "Erklärvideo", text: "Kurz und auf den Punkt, ohne Vorwissen vorauszusetzen." },
  { title: "Lesetext", text: "In kleinen Abschnitten, zum eigenen Tempo statt endlosem Scrollen." },
  { title: "Audioübung", text: "Echte Funkbeispiele zum Mithören und Nachsprechen." },
  { title: "Prüfungsfragen", text: "Passend zur Lektion, mit Erklärung zu jeder Antwort." },
  { title: "PDF-Merkblatt", text: "Zum Download, für die Wiederholung ohne Bildschirm." },
];

export default function KursPage() {
  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav />

      <div className="section-pad" style={{ padding: "64px 32px 8px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <span className="label" style={{ color: "var(--sky)" }}>Kursinhalt</span>
        <h1 style={{ marginTop: 14, fontSize: "clamp(30px,4vw,46px)", fontWeight: 800, lineHeight: 1.15 }}>
          Ein Kurs. <span className="grad">BZF I und BZF II.</span>
        </h1>
        <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>
          Du buchst dein BZF II und bekommst das komplette BZF I mit englischem Funk und internationalem Verkehr
          ohne Aufpreis dazu. 12 Module, ein durchgehender Weg, keine zweite Anmeldung.
        </p>
      </div>

      <div className="section-pad" style={{ padding: "32px 32px 40px", maxWidth: 900, margin: "0 auto" }}>
        <CurriculumTabs />
      </div>

      <div className="section-pad" style={{ padding: "20px 32px 60px", maxWidth: 900, margin: "0 auto" }}>
        <div className="reveal" style={{ maxWidth: 640, margin: "0 auto 32px", textAlign: "center" }}>
          <span className="label" style={{ color: "var(--sky)" }}>Aufbau jeder Lektion</span>
          <h2 style={{ marginTop: 12, fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, lineHeight: 1.2 }}>
            Jede Lektion ein <span className="grad">geführter Weg.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {FORMAT_STEPS.map((s, i) => (
            <div key={s.title} className="glass-strong" style={{ borderRadius: 18, padding: "22px 20px" }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30,
                  borderRadius: 999, background: "rgba(47,155,234,0.14)", color: "var(--sky-deep)",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13,
                }}
              >
                {i + 1}
              </span>
              <p style={{ marginTop: 14, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5 }}>{s.title}</p>
              <p style={{ marginTop: 6, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.55 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dark-band bg-hero-dark" style={{ padding: "80px 32px" }}>
        <div className="reveal" style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 800, lineHeight: 1.2 }}>
            Die ersten 2 Module sind <span className="hero-grad">kostenlos.</span>
          </h2>
          <p className="dk-dim" style={{ marginTop: 14, fontSize: 16 }}>Ohne Zahlungsdaten, sofort startklar.</p>
          <Link href={SIGNUP_HREF} className="btn-hero" style={{ marginTop: 28, padding: "16px 32px", fontSize: 16 }}>
            Jetzt kostenlos starten
          </Link>
          <p style={{ marginTop: 18, fontSize: 13.5 }}>
            <Link href="/preis" className="nav-link" style={{ color: "rgba(255,255,255,0.7)" }}>Preise ansehen →</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
