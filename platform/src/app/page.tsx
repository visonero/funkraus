import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ScrollRevealInit from "@/components/ScrollRevealInit";
import HighlightsCounters from "@/components/HighlightsCounters";
import FeaturesShowcase from "@/components/FeaturesShowcase";
import CurriculumTabs from "@/components/CurriculumTabs";
import HowItWorksTimeline from "@/components/HowItWorksTimeline";
import TrustStamps from "@/components/TrustStamps";
import FaqAccordion from "@/components/FaqAccordion";
import PlatformShowcase from "@/components/PlatformShowcase";
import Footer from "@/components/Footer";
import { ORIGINAL_PRICE, PRICE } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";

const SIGNUP_HREF = "/login?mode=signup";
const FREE_CTA = "Heute kostenlos starten";

const PROBLEMS = [
  {
    icon: "💸",
    title: "Der Preis bleibt ein Geheimnis",
    desc: "Viele Anbieter zeigen dir erst nach einem 30-minütigen Verkaufsgespräch, was du eigentlich zahlst.",
  },
  {
    icon: "🎥",
    title: "Stundenlange Videos, wenig Übung",
    desc: "Sprechfunk ist eine Hörfähigkeit — trotzdem bestehen viele Kurse aus reinem Zusehen statt Zuhören und Antworten.",
  },
  {
    icon: "⏰",
    title: "Starre Kurstermine",
    desc: "Feste Zoom-Slots mehrmals die Woche passen selten in einen vollen Alltag neben Job oder Studium.",
  },
  {
    icon: "🧩",
    title: "Fragenkatalog irgendwo, Kurs woanders",
    desc: "Die offiziellen Prüfungsfragen und die eigentliche Lernstrecke sind selten wirklich miteinander verzahnt.",
  },
];

const COMPARE_ROWS = [
  { label: "Ausprobieren", them: "Erst zahlen oder ein Verkaufsgespräch führen", us: "Kostenloses Konto: Modul 0 und 1 sofort offen, ohne Zahlungsdaten" },
  { label: "Preis", them: "Erst nach Beratungsgespräch, oft vierstellig", us: `Sofort sichtbar, €${PRICE} einmalig für den Rest` },
  { label: "Zugang", them: "Wartezeit bis zum nächsten Kurstermin", us: "Sofort nach der Registrierung" },
  { label: "Lernformat", them: "Überwiegend Video", us: "Video, Audio-Funkübungen, interaktive Quizze" },
  { label: "Prüfungsfragen", them: "Separat zu besorgen", us: "Vollständig integriert, offizieller Fragenkatalog" },
  { label: "Tempo", them: "Feste Gruppentermine", us: "Komplett selbstbestimmt" },
];

const FREE_FEATURES = [
  "Kostenloses Konto mit persönlichem Dashboard",
  "Modul 0 und 1 komplett: Videos, Lesetexte, PDF-Merkblätter",
  "Rund 80 offizielle Prüfungsfragen mit Erklärung",
  "Fortschritt und Trefferquote werden gespeichert",
  "Keine Zahlungsdaten nötig, kein Ablaufdatum",
];

const PRICE_FEATURES = [
  "Alles aus dem kostenlosen Start, plus:",
  "BZF I & BZF II komplett, ein Kurs",
  "Kompletter offizieller Fragenkatalog als Übungsquiz",
  "Über 40 Audio-Funkbeispiele & interaktive Simulationen",
  "Vollständige Prüfungssimulationen (BZF I & II)",
  "PDF-Merkblätter & Spickzettel zum Download",
  "Lebenslanger Zugriff, kein Abo",
];

const MARQUEE_ITEMS = [
  "🎁 Modul 0 & 1 kostenlos",
  "☁️ §5 UrhG geprüft",
  "📘 Offizieller Fragenkatalog",
  "💶 Fester Preis",
  "⚡ Sofortiger Zugang",
  "🎧 Audio-first Training",
  "🧑‍✈️ Fachlich geprüft",
];

function Cloud({ style, duration = "22s", direction = "alternate" }: { style: React.CSSProperties; duration?: string; direction?: string }) {
  return (
    <svg
      className="deco cloud"
      style={{ ...style, animationDuration: duration, animationDirection: direction as React.CSSProperties["animationDirection"] }}
      viewBox="0 0 200 90"
      fill="none"
    >
      <ellipse cx="60" cy="55" rx="55" ry="28" fill="#ffffff" opacity="0.8" />
      <ellipse cx="110" cy="40" rx="45" ry="30" fill="#ffffff" opacity="0.85" />
      <ellipse cx="150" cy="58" rx="38" ry="22" fill="#ffffff" opacity="0.75" />
    </svg>
  );
}

function Blob({ style, color }: { style: React.CSSProperties; color: string }) {
  return <div className="deco blob hide-mobile" style={{ ...style, background: color }} />;
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden", position: "relative" }}>
      <ScrollRevealInit />
      <SiteNav email={user?.email ?? null} />

      {/* HERO */}
      <div style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", overflow: "hidden", isolation: "isolate" }}>
        <div className="deco sky-wash" style={{ inset: 0 }} />

        <Cloud style={{ top: "12%", left: "-5%", width: 220 }} duration="22s" direction="alternate" />
        <Cloud style={{ top: "55%", right: "-8%", width: 280 }} duration="28s" direction="alternate-reverse" />
        <svg className="deco cloud hide-mobile" style={{ top: "3%", left: "38%", width: 160, animationDuration: "18s", animationDirection: "alternate" }} viewBox="0 0 200 90" fill="none">
          <ellipse cx="60" cy="55" rx="55" ry="28" fill="#ffffff" opacity="0.6" />
          <ellipse cx="110" cy="40" rx="45" ry="30" fill="#ffffff" opacity="0.65" />
        </svg>

        <Blob style={{ top: "8%", left: "8%", width: 220, height: 220, animationDelay: "0s" }} color="var(--sky)" />
        <Blob style={{ bottom: "6%", right: "10%", width: 260, height: 260, animationDelay: "-4s" }} color="var(--sky-2)" />
        <Blob style={{ top: "40%", right: "28%", width: 140, height: 140, animationDelay: "-8s", opacity: 0.3 }} color="var(--violet)" />

        <div
          className="deco plane hide-mobile"
          style={{ offsetPath: "path('M -40 420 C 240 120, 640 560, 1120 90')", fontSize: 30, filter: "drop-shadow(0 6px 10px rgba(30,58,95,0.25))" } as React.CSSProperties}
        >
          ✈️
        </div>

        <div className="deco glass float hide-mobile" style={{ top: "16%", right: "9%", "--rot": "-4deg", borderRadius: 16, padding: "14px 18px", animationDelay: "-1s" } as React.CSSProperties}>
          <p className="label" style={{ color: "var(--sky-deep)", marginBottom: 4 }}>Turm</p>
          <p style={{ fontSize: 13, color: "var(--text-dim)", maxWidth: 180 }}>&quot;Startbahn 27, Startfreigabe.&quot;</p>
        </div>
        <div className="deco glass float hide-mobile" style={{ bottom: "14%", left: "7%", "--rot": "3deg", borderRadius: 16, padding: "16px 20px", animationDelay: "-3s" } as React.CSSProperties}>
          <p className="grad" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>261</p>
          <p className="label" style={{ color: "var(--text-dim)" }}>offizielle Fragen</p>
        </div>
        <div className="deco glass float hide-mobile" style={{ top: "64%", left: "16%", "--rot": "-2deg", borderRadius: 14, padding: "10px 16px", animationDelay: "-5s", display: "flex", alignItems: "center", gap: 8 } as React.CSSProperties}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>BZF bestanden</span>
        </div>

        <div className="section-pad" style={{ position: "relative", zIndex: 2, maxWidth: 820, margin: "0 auto", padding: "40px 32px", width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.7)", marginBottom: 26 } as React.CSSProperties}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sky)" }} />
            <span className="label" style={{ color: "var(--sky-deep)" }}>BZF I &amp; BZF II · Online-Kurs</span>
          </div>
          <h1 className="h1-hero" style={{ fontSize: "clamp(40px,6.4vw,74px)", lineHeight: 1.05, fontWeight: 800, textShadow: "0 2px 30px rgba(255,255,255,0.9)" }}>
            Verstanden.<br />Und <span className="grad">bestanden.</span>
          </h1>
          <p style={{ marginTop: 26, fontSize: 19, color: "var(--text-dim)", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
            Der komplette Kurs für dein Sprechfunkzeugnis. Starte heute kostenlos mit Modul 0 und 1, ganz ohne Zahlungsdaten, und schalte den Rest später einmalig frei.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 22, padding: "8px 16px", borderRadius: 999, background: "rgba(52,211,153,0.16)", border: "1px solid rgba(52,211,153,0.4)" }}>
            <span style={{ fontSize: 13 }}>🎁</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0b7a55" }}>Konto erstellen · Modul 0 und 1 sofort kostenlos nutzen</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 22, justifyContent: "center" }}>
            <Link href={SIGNUP_HREF} className="btn-accent" style={{ padding: "17px 30px", borderRadius: 999, fontSize: 16, display: "inline-block" }}>
              {FREE_CTA}
            </Link>
            <a href="#einblick" className="btn-ghost" style={{ padding: "17px 30px", borderRadius: 999, fontSize: 16, display: "inline-block" }}>
              So sieht der Kurs aus ↓
            </a>
          </div>
          <p style={{ marginTop: 24, fontSize: 12.5, color: "var(--text-faint)", fontWeight: 600 }}>
            Kostenlos starten · Vollzugang später einmalig €{PRICE} statt €{ORIGINAL_PRICE} · Basierend auf dem offiziellen Fragenkatalog der Bundesnetzagentur
          </p>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="marquee-outer" style={{ padding: "22px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "rgba(255,255,255,0.5)" }}>
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, i) => (
            <span
              key={i}
              className="glass"
              aria-hidden={i >= MARQUEE_ITEMS.length}
              style={{ borderRadius: 999, padding: "8px 18px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12.5, color: "var(--sky-deep)", whiteSpace: "nowrap" }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      <HighlightsCounters />

      {/* PLATFORM SHOWCASE */}
      <div id="einblick" style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "6%", left: "-6%", width: 280, height: 280, opacity: 0.2 }} color="var(--sky-2)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "90px 32px 40px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <span className="label" style={{ color: "var(--sky)" }}>Einblick</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              So sieht deine <span className="grad">Lernplattform</span> von innen aus.
            </h2>
            <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>
              Keine Attrappe: Das sind echte Ansichten aus dem Kurs. Am Laptop, am Tablet und am Handy, mit Video, Quiz und Fortschritt.
            </p>
            <Link href={SIGNUP_HREF} className="btn-accent" style={{ display: "inline-block", marginTop: 26, padding: "15px 30px", borderRadius: 999, fontSize: 15.5 }}>
              {FREE_CTA}
            </Link>
          </div>
          <PlatformShowcase />
        </div>
      </div>

      {/* PROBLEM */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "10%", right: "-6%", width: 300, height: 300, opacity: 0.25 }} color="var(--pink)" />
        <svg className="deco cloud hide-mobile" style={{ bottom: "-2%", left: "-6%", width: 220, animationDuration: "24s" } as React.CSSProperties} viewBox="0 0 200 90" fill="none">
          <ellipse cx="60" cy="55" rx="55" ry="28" fill="#ffffff" />
          <ellipse cx="110" cy="40" rx="45" ry="30" fill="#ffffff" />
        </svg>
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "100px 32px", maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
            <div className="reveal" style={{ maxWidth: 640 }}>
              <span className="label" style={{ color: "var(--sky)" }}>Die Realität</span>
              <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
                Sprechfunk lernen fühlt sich oft <span className="grad">komplizierter</span> an, als es sein müsste.
              </h2>
              <p style={{ marginTop: 18, fontSize: 17, color: "var(--text-dim)" }}>
                Die meisten BZF-Vorbereitungen scheitern nicht an der Prüfung selbst — sondern daran, wie sie unterrichtet wird.
              </p>
            </div>
            <div className="hide-mobile reveal" style={{ position: "relative", width: 160, height: 160, flex: "none" }}>
              <div className="radar-sweep" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(47,155,234,0.55), transparent 35%)", animation: "radarspin 3.4s linear infinite" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px dashed var(--line-strong)" }} />
              <div style={{ position: "absolute", inset: 16, borderRadius: "50%", border: "1px dashed var(--line)" }} />
              <div style={{ position: "absolute", inset: 42, borderRadius: "50%", border: "1px dashed var(--line)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", width: 9, height: 9, background: "var(--sky)", borderRadius: "50%", transform: "translate(-50%,-50%)", boxShadow: "0 0 14px var(--sky)" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 22, marginTop: 52 }}>
            {PROBLEMS.map((p) => (
              <div key={p.title} className="card glass reveal" style={{ borderRadius: 20, padding: 30 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(47,155,234,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 18 }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{p.title}</h3>
                <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--text-dim)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIFFERENTIATION / COMPARE */}
      <div id="vorteile" style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "0%", left: "-8%", width: 280, height: 280, opacity: 0.22 }} color="var(--sky-2)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "40px 32px 100px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 640 }}>
            <span className="label" style={{ color: "var(--sky)" }}>Der Unterschied</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Ein Kurs, der genauso funktioniert, wie <span className="grad">die Prüfung klingt.</span>
            </h2>
          </div>
          <div className="compare-grid reveal">
            <div className="compare-left">
              <p className="label" style={{ color: "var(--text-faint)", marginBottom: 18 }}>Typischer Ablauf am Markt</p>
              {COMPARE_ROWS.map((row) => (
                <div key={row.label} className="compare-row-them">
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 6 }}>
                    {row.label}
                  </p>
                  <p style={{ fontSize: 14.5, color: "var(--text-dim)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#c65b6b", flex: "none" }}>✕</span>
                    {row.them}
                  </p>
                </div>
              ))}
            </div>
            <div className="glass-strong compare-right">
              <p className="label grad" style={{ marginBottom: 18 }}>funkraus</p>
              {COMPARE_ROWS.map((row) => (
                <div key={row.label} className="compare-row-us">
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--sky-deep)", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 6 }}>
                    {row.label}
                  </p>
                  <p style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 600, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--sky)", flex: "none" }}>✓</span>
                    {row.us}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="vs-badge"
              style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,var(--sky),var(--sky-2))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, boxShadow: "0 8px 20px rgba(47,155,234,0.4)", border: "4px solid var(--bg)" }}
            >
              VS
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ bottom: "-4%", right: "-6%", width: 260, height: 260, opacity: 0.22 }} color="var(--mint)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "20px 32px 100px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 640 }}>
            <span className="label" style={{ color: "var(--sky)" }}>Kursinhalt</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Alles, was du für <span className="grad">BZF I &amp; II</span> brauchst — in einem Kurs.
            </h2>
          </div>
          <FeaturesShowcase />
        </div>
      </div>

      {/* CURRICULUM TABS */}
      <div id="kurs" style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "6%", right: "6%", width: 220, height: 220, opacity: 0.16 }} color="var(--sky)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "20px 32px 100px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 640 }}>
            <span className="label" style={{ color: "var(--sky)" }}>Kursstruktur</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Zwei Prüfungen, <span className="grad">ein Kurs.</span>
            </h2>
            <p style={{ marginTop: 16, fontSize: 16, color: "var(--text-dim)" }}>
              BZF II berechtigt zum deutschsprachigen Funk im deutschen Luftraum. BZF I erweitert das um Englisch und internationalen Verkehr. Beide Wege sind vollständig enthalten.
            </p>
          </div>
          <CurriculumTabs />
        </div>
      </div>

      <HowItWorksTimeline />

      {/* PRICING */}
      <div id="preis" style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "4%", left: "4%", width: 260, height: 260, opacity: 0.18 }} color="var(--sky)" />
        <Blob style={{ bottom: "2%", right: "2%", width: 220, height: 220, opacity: 0.2 }} color="var(--sky-2)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "20px 32px 110px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <span className="label" style={{ color: "var(--sky)" }}>Preis</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Erst kostenlos testen. <span className="grad">Dann einmal zahlen.</span>
            </h2>
            <p style={{ marginTop: 14, fontSize: 16.5, color: "var(--text-dim)" }}>
              Du siehst den Preis von Anfang an und musst nichts bezahlen, um den Kurs kennenzulernen.
            </p>
          </div>

          <div className="reveal" style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 28, maxWidth: 900, marginLeft: "auto", marginRight: "auto", alignItems: "stretch" }}>
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
                {FREE_CTA}
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
              <p style={{ marginTop: 2, fontSize: 12.5, color: "var(--text-faint)" }}>einmalig · kein Abo · lebenslanger Zugriff</p>
              <div style={{ textAlign: "left", marginTop: 24, display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
                {PRICE_FEATURES.map((text, i) => (
                  <div key={text} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>{i === 0 ? "" : "✓"}</span>
                    <span style={{ fontSize: 13.5, color: i === 0 ? "var(--text)" : "var(--text-dim)", fontWeight: i === 0 ? 700 : 400 }}>{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/kurs#kaufen" className="btn-ghost" style={{ display: "block", marginTop: 26, padding: 15, borderRadius: 999, fontSize: 15 }}>
                Vollzugang ansehen
              </Link>
              <p style={{ marginTop: 12, fontSize: 11.5, color: "var(--text-faint)" }}>
                Du schaltest ihn erst frei, wenn du nach Modul 1 weitermachen möchtest.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 44 }}>
            <TrustStamps />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="section-pad" style={{ padding: "20px 32px 110px", maxWidth: 760, margin: "0 auto", position: "relative" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="label" style={{ color: "var(--sky)" }}>FAQ</span>
          <h2 style={{ fontSize: "clamp(26px,3.2vw,36px)", marginTop: 14, fontWeight: 700 }}>
            Häufige <span className="grad">Fragen</span>
          </h2>
        </div>
        <FaqAccordion />
      </div>

      {/* FINAL CTA */}
      <div style={{ position: "relative", overflow: "hidden", padding: "100px 32px", borderTop: "1px solid var(--line)" }}>
        <div className="deco sky-wash" style={{ inset: 0 }} />
        <svg className="deco cloud hide-mobile" style={{ top: "10%", left: "5%", width: 180, animationDuration: "20s" } as React.CSSProperties} viewBox="0 0 200 90" fill="none">
          <ellipse cx="60" cy="55" rx="55" ry="28" fill="#ffffff" />
          <ellipse cx="110" cy="40" rx="45" ry="30" fill="#ffffff" />
        </svg>
        <svg className="deco cloud hide-mobile" style={{ bottom: "8%", right: "6%", width: 200, animationDuration: "26s", animationDirection: "alternate-reverse" } as React.CSSProperties} viewBox="0 0 200 90" fill="none">
          <ellipse cx="60" cy="55" rx="55" ry="28" fill="#ffffff" />
          <ellipse cx="110" cy="40" rx="45" ry="30" fill="#ffffff" />
        </svg>
        <div className="reveal" style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 800, lineHeight: 1.15 }}>
            Bereit, <span className="grad">klar zu funken?</span>
          </h2>
          <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>Kostenlos starten. Fester Preis für den Rest. Kein Verkaufsgespräch.</p>
          <Link href={SIGNUP_HREF} className="btn-accent" style={{ display: "inline-block", marginTop: 32, padding: "18px 38px", borderRadius: 999, fontSize: 17 }}>
            {FREE_CTA}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
