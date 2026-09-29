import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import ShowcaseSection from "@/components/ShowcaseSection";
import { MicOverlay } from "@/components/landing/Overlays";

const SIGNUP_HREF = "/login?mode=signup";
const DESCRIPTION =
  "Der KI-Tower von funkraus: Sprich live per Stimme mit einer KI, die wie eine Bodenfunkstelle antwortet. Übe Rollen, Start, Platzrunde und Landung auf Deutsch und Englisch, mit sofortigem Feedback.";

export const metadata: Metadata = {
  title: "KI-Tower — live Sprechfunk üben mit KI | funkraus",
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: "/ki-tower" },
  openGraph: { type: "website", locale: "de_DE", url: "/ki-tower", siteName: "funkraus", title: "KI-Tower — funkraus", description: DESCRIPTION },
};

const STEPS = [
  { n: "1", title: "Sprechtaste halten und sprechen", text: "Du bekommst ein Szenario mit Rufzeichen, Flugzeug und Flugplatz, dann sprichst du deinen Funkspruch, genau wie im Cockpit." },
  { n: "2", title: "Der Tower antwortet mit Stimme", text: "Eine KI erkennt deine Sprache und antwortet dir als Bodenfunkstelle, mit einer eigenen, computergenerierten Stimme." },
  { n: "3", title: "Du bestätigst durch Rückbestätigung", text: "Wie in der echten Prüfung liest du Freigaben wörtlich zurück, statt nur die Sprechtaste zu drücken." },
  { n: "4", title: "Feedback zu Ablauf und Phraseologie", text: "Am Ende siehst du, was gestimmt hat und was gefehlt hat, mit dem korrekten Funkspruch zum Vergleich." },
];

const LIMITS = [
  "Ein KI-System, kein echter Fluglotse — es ersetzt nicht die praktische BZF-Prüfung bei der Bundesnetzagentur.",
  "Aussprache und Akzent werden nicht bewertet, nur Inhalt, Ablauf und Rückbestätigungen.",
  "Die Spracherkennung versteht Eigennamen und manche Akzente nicht immer perfekt — das zählt nicht gegen dich.",
  "Das Feature ist neu und befindet sich in der Beta-Phase.",
];

export default function KiTowerPage() {
  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav />

      <div className="section-pad" style={{ padding: "64px 32px 8px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <span className="label" style={{ color: "var(--sky)" }}>KI-Tower</span>
        <h1 style={{ marginTop: 14, fontSize: "clamp(30px,4vw,46px)", fontWeight: 800, lineHeight: 1.15 }}>
          Sprich live mit dem <span className="grad">KI-Tower.</span>
        </h1>
        <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>
          Kein Quiz, kein Lückentext: Du hältst die Sprechtaste, sprichst deinen Funkspruch per Stimme, und eine
          KI antwortet dir wie eine echte Bodenfunkstelle — auf Deutsch für BZF II, auf Englisch für BZF I.
        </p>
      </div>

      <ShowcaseSection
        eyebrow="NEU · Beta"
        title={<>Genau wie im <span className="grad">echten Funkverkehr.</span></>}
        text="Jedes Mal ein anderes Flugzeug, ein anderes Rufzeichen, ein anderer Flugplatz — du übst Rollen, Start, Platzrunde und Landung, nicht nur eine einzelne Frage."
        bullets={[
          "Sprechen per Mikrofon oder Funksprüche eintippen, beides funktioniert",
          "Übungen auf Deutsch (BZF II) und Englisch (BZF I)",
          "Sofortiges Feedback zu Ablauf, Phraseologie und Rückbestätigungen",
        ]}
        image={{ src: "/screens/tower-desktop.webp", alt: "KI-Funktraining: Sprechfunk mit dem KI-Tower per Sprechtaste üben", width: 2880, height: 2020 }}
        overlay={<MicOverlay />}
        cta={
          <Link href={SIGNUP_HREF} className="btn-accent" style={{ display: "inline-block", padding: "14px 26px", borderRadius: 999, fontSize: 15 }}>
            1 Probe-Übung kostenlos testen
          </Link>
        }
      />

      <div className="section-pad" style={{ padding: "40px 32px 20px", maxWidth: 980, margin: "0 auto" }}>
        <div className="reveal" style={{ maxWidth: 640, margin: "0 auto 32px", textAlign: "center" }}>
          <span className="label" style={{ color: "var(--sky)" }}>So läuft eine Übung ab</span>
          <h2 style={{ marginTop: 12, fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, lineHeight: 1.2 }}>
            Vier Schritte, <span className="grad">jedes Mal neu.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="glass-strong" style={{ borderRadius: 18, padding: "22px 20px" }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30,
                  borderRadius: 999, background: "rgba(47,155,234,0.14)", color: "var(--sky-deep)",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13,
                }}
              >
                {s.n}
              </span>
              <p style={{ marginTop: 14, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5 }}>{s.title}</p>
              <p style={{ marginTop: 6, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.55 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section-pad" style={{ padding: "40px 32px 100px", maxWidth: 720, margin: "0 auto" }}>
        <div className="glass" style={{ borderRadius: 20, padding: "28px 30px", borderLeft: "4px solid var(--sky)" }}>
          <p className="label" style={{ color: "var(--sky-deep)" }}>Ehrlich gesagt</p>
          <ul style={{ marginTop: 14, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
            {LIMITS.map((l) => (
              <li key={l} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.55 }}>
                <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>·</span>
                {l}
              </li>
            ))}
          </ul>
        </div>
        <p style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
          <Link href="/blog/ki-im-bzf-training" className="nav-link">Wie die Spracherkennung und der KI-Tower technisch funktionieren →</Link>
        </p>
      </div>

      <div className="dark-band bg-hero-dark" style={{ padding: "80px 32px" }}>
        <div className="reveal" style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", fontWeight: 800, lineHeight: 1.2 }}>
            Teste den KI-Tower <span className="hero-grad">kostenlos.</span>
          </h2>
          <p className="dk-dim" style={{ marginTop: 14, fontSize: 16 }}>Mit dem kostenlosen Konto bekommst du eine Probe-Übung, ohne Zahlungsdaten.</p>
          <Link href={SIGNUP_HREF} className="btn-hero" style={{ marginTop: 28, padding: "16px 32px", fontSize: 16 }}>
            Jetzt kostenlos starten
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
