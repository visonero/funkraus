import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ScrollRevealInit from "@/components/ScrollRevealInit";
import HighlightsCounters from "@/components/HighlightsCounters";
import HeroNetwork from "@/components/HeroNetwork";
import PlatformShowcase from "@/components/PlatformShowcase";
import ShowcaseSection from "@/components/ShowcaseSection";
import CurriculumTabs from "@/components/CurriculumTabs";
import HowItWorksTimeline from "@/components/HowItWorksTimeline";
import FaqAccordion from "@/components/FaqAccordion";
import Footer from "@/components/Footer";
import { FAQS } from "@/lib/faq";
import { ORIGINAL_PRICE, PRICE } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";

const SIGNUP_HREF = "/login?mode=signup";
const FREE_CTA = "Heute kostenlos starten";

const CMP_ROWS = [
  { label: "Einstieg", them: "Erst zahlen oder ein Verkaufsgespräch führen", us: "Kostenloses Konto: Modul 0 & 1 sofort offen" },
  { label: "Preis für den Rest", them: "Oft vierstellig, erst nach Beratung sichtbar", us: `€${PRICE} einmalig, von Anfang an sichtbar` },
  { label: "Lernformat", them: "Meist nur Video", us: "Video, Audio, Text, PDF und Quiz mit Fragenkatalog" },
  { label: "Tempo & Zugang", them: "Feste Kurstermine, Wartezeit", us: "Sofort startklar, komplett selbstbestimmt" },
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
  "12 Monate Zugriff, kein Abo",
];

const MARQUEE_ITEMS = [
  "🎁 Modul 0 & 1 kostenlos",
  "📘 Offizieller Fragenkatalog",
  "💶 Fester Preis",
  "⚡ Sofortiger Zugang",
  "🎧 Audio-first Training",
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "BZF I & II Online-Kurs",
    description:
      "Online-Kurs für das Sprechfunkzeugnis BZF I und BZF II für PPL(A)- und LAPL(A)-Piloten in Deutschland, mit dem offiziellen Fragenkatalog der Bundesnetzagentur.",
    provider: { "@type": "Organization", name: "funkraus", sameAs: "https://funkraus.de" },
    offers: {
      "@type": "Offer",
      price: PRICE,
      priceCurrency: "EUR",
      category: "Vollzugang, Modul 0 und 1 kostenlos",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ScrollRevealInit />
      <SiteNav email={user?.email ?? null} />

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden", background: "#fff" }}>
        <HeroNetwork />

        <div className="section-pad" style={{ position: "relative", zIndex: 2, maxWidth: 1040, margin: "0 auto", padding: "16px 32px 4px", width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 13px", borderRadius: 999, background: "rgba(47,155,234,0.08)", border: "1px solid rgba(47,155,234,0.25)", marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sky)" }} />
            <span className="label" style={{ color: "var(--sky-deep)" }}>BZF I &amp; BZF II · Online-Kurs für PPL &amp; LAPL</span>
          </div>
          <h1 className="h1-hero" style={{ fontSize: "clamp(23px,3.2vw,36px)", lineHeight: 1.16, fontWeight: 800, overflowWrap: "break-word" }}>
            BZF-Crashkurs: <span className="grad">Sprechfunkzeugnis in unter 10 Stunden bestehen.</span>
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-dim)", maxWidth: 820, marginLeft: "auto", marginRight: "auto" }}>
            Der komplette BZF-Onlinekurs mit Video, Audio-Funkübungen, Lesetexten, PDF-Merkblättern und dem offiziellen Fragenkatalog der Bundesnetzagentur. Auf Laptop, Tablet und Smartphone.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, padding: "4px 12px", borderRadius: 999, background: "rgba(52,211,153,0.16)", border: "1px solid rgba(52,211,153,0.4)" }}>
            <span style={{ fontSize: 11.5 }}>🎁</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0b7a55" }}>Konto erstellen · Modul 0 und 1 sofort kostenlos nutzen</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, justifyContent: "center" }}>
            <Link href={SIGNUP_HREF} className="btn-accent" style={{ padding: "11px 20px", borderRadius: 999, fontSize: 13.5, display: "inline-block" }}>
              {FREE_CTA}
            </Link>
            <a href="#einblick" className="btn-ghost" style={{ padding: "11px 20px", borderRadius: 999, fontSize: 13.5, display: "inline-block" }}>
              So sieht der Kurs aus ↓
            </a>
          </div>
          <p style={{ marginTop: 10, fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>
            Kostenlos starten · Vollzugang später einmalig €{PRICE} statt €{ORIGINAL_PRICE} · Basierend auf dem offiziellen Fragenkatalog der Bundesnetzagentur
          </p>
        </div>

        <div className="section-pad hero-showcase-slot" style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "4px 32px 40px" }}>
          <PlatformShowcase />
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

      {/* USP STORY: einblick */}
      <div id="einblick" style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "6%", left: "-6%", width: 280, height: 280, opacity: 0.2 }} color="var(--sky-2)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "0px 32px 10px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <span className="label" style={{ color: "var(--sky)" }}>Einblick</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Warum funkraus der richtige <span className="grad">BZF-Kurs</span> für dich ist.
            </h2>
            <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>
              Keine Attrappe: Das sind echte Ansichten aus der Lernplattform, Schritt für Schritt erklärt.
            </p>
          </div>
        </div>

        <ShowcaseSection
          eyebrow="1 · Der komplette Crashkurs"
          title={
            <>
              Vom Einsteiger zum <span className="grad">Sprechfunkzeugnis</span> — in unter 10 Stunden.
            </>
          }
          text="Ein durchgehender Kurs für BZF I und BZF II, der bei null anfängt: Luftraumstruktur, Funkverfahren, Platzverkehr, Streckenflug und Navigation, bis zur Prüfungssimulation. Kein Springen zwischen Anbietern, keine Lücken."
          bullets={[
            "8,5 Stunden Gesamtlernzeit für den kompletten BZF-Stoff",
            "261 offizielle Prüfungsfragen der Bundesnetzagentur, passend zu jedem Kapitel",
            "Aufgebaut für PPL(A)- und LAPL(A)-Piloten ohne Vorkenntnisse",
          ]}
          image={{ src: "/screens/kurs-desktop.webp", alt: "Kursübersicht des BZF-Online-Kurses mit allen Modulen und Fortschritt", width: 2880, height: 1800 }}
        />

        <ShowcaseSection
          reverse
          eyebrow="2 · Kostenlos starten"
          title={
            <>
              Erst überzeugen lassen. <span className="grad">Dann erst zahlen.</span>
            </>
          }
          text="Anders als bei vielen BZF-Anbietern zahlst du nicht im Voraus für ein Versprechen. Du erstellst ein kostenloses Konto, lernst Modul 0 und 1 komplett durch und entscheidest erst danach, ob du den Vollzugang freischaltest."
          bullets={[
            "Keine Zahlungsdaten bei der Registrierung",
            "Kein Verkaufsgespräch, kein Countdown-Trick",
            "Dein Fortschritt bleibt erhalten, wenn du später upgradest",
          ]}
          image={{ src: "/screens/gesperrt-desktop.webp", alt: "Ansicht eines gesperrten Kapitels mit Hinweis auf den kostenlosen Einstieg", width: 2880, height: 1800 }}
        />

        <ShowcaseSection
          eyebrow="3 · Moderne, interaktive Lernplattform"
          title={
            <>
              Video, Text, Audio, PDF und Quiz — <span className="grad">für jede Lektion.</span>
            </>
          }
          text="Jede Lektion kombiniert ein Erklärvideo, einen Lesetext, echte Audio-Funkübungen zum Nachsprechen und ein PDF-Merkblatt zum Ausdrucken. Direkt darunter: die passenden Fragen aus dem offiziellen Fragenkatalog, Modul für Modul."
          bullets={[
            "Original-Fragen der Bundesnetzagentur zu jeder Lektion und jedem Modul",
            "Sofortige Erklärung bei jeder Antwort, richtig oder falsch",
            "PDF-Spickzettel zum Download für jedes Thema",
          ]}
          image={{ src: "/screens/lektion-video-desktop.webp", alt: "Video-Lektion mit Text, Audio und PDF-Karte im BZF-Kurs", width: 2880, height: 1800 }}
        />

        <ShowcaseSection
          reverse
          eyebrow="4 · Lerne, wann und wo du willst"
          title={
            <>
              Am Laptop begonnen, <span className="grad">am Handy weitergemacht.</span>
            </>
          }
          text="Die Lernplattform passt sich jedem Bildschirm an. Ob am Küchentisch auf dem Laptop, im Flugzeug-Club auf dem Tablet oder unterwegs auf dem Smartphone: dein Fortschritt ist überall sofort da."
          bullets={["Responsive auf Desktop, Tablet und Smartphone", "Automatische Synchronisierung deines Fortschritts", "Keine App-Installation nötig, läuft im Browser"]}
          image={{ src: "/screens/quiz-desktop.webp", alt: "BZF-Prüfungsfragen mit Erklärung, responsiv auf allen Geräten nutzbar", width: 2880, height: 1800 }}
          cta={
            <Link href={SIGNUP_HREF} className="btn-accent" style={{ display: "inline-block", padding: "14px 26px", borderRadius: 999, fontSize: 15 }}>
              {FREE_CTA}
            </Link>
          }
        />
      </div>

      {/* DIFFERENTIATION / COMPARE */}
      <div id="vorteile" style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "0%", left: "-8%", width: 280, height: 280, opacity: 0.22 }} color="var(--sky-2)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "60px 32px 90px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <span className="label" style={{ color: "var(--sky)" }}>Der Unterschied</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Ein BZF-Kurs, der <span className="grad">ehrlich mit dir funkt.</span>
            </h2>
          </div>

          <div className="glass-strong cmp-table reveal">
            <div className="cmp-head">
              <span className="label" style={{ color: "var(--text-faint)" }}>Andere Anbieter</span>
              <span className="label grad">funkraus</span>
            </div>
            {CMP_ROWS.map((row) => (
              <div key={row.label} className="cmp-row">
                <span className="cmp-row-label">{row.label}</span>
                <span className="cmp-them">
                  <span style={{ color: "#c65b6b", flex: "none" }}>✕</span>
                  {row.them}
                </span>
                <span className="cmp-us">
                  <span style={{ color: "var(--sky)", flex: "none" }}>✓</span>
                  {row.us}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CURRICULUM TABS */}
      <div id="kurs" style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "6%", right: "6%", width: 220, height: 220, opacity: 0.16 }} color="var(--sky)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "20px 32px 100px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <span className="label" style={{ color: "var(--sky)" }}>Kursstruktur</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Du buchst dein <span className="grad">BZF II.</span> Das BZF I bekommst du gratis dazu.
            </h2>
            <p style={{ marginTop: 16, fontSize: 16, color: "var(--text-dim)" }}>
              BZF II reicht für den deutschsprachigen Sprechfunk im deutschen Luftraum, viele PPL- und LAPL-Piloten brauchen nicht mehr. Bei funkraus bekommst du trotzdem den kompletten BZF I Kurs mit englischem Funk und internationalem Verkehr dazu — ohne Aufpreis, ohne zweite Anmeldung.
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
              <p style={{ marginTop: 2, fontSize: 12.5, color: "var(--text-faint)" }}>einmalig · kein Abo · 12 Monate Zugriff</p>
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

        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="section-pad" style={{ padding: "20px 32px 110px", maxWidth: 760, margin: "0 auto", position: "relative" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="label" style={{ color: "var(--sky)" }}>FAQ</span>
          <h2 style={{ fontSize: "clamp(26px,3.2vw,36px)", marginTop: 14, fontWeight: 700 }}>
            Alle Fragen zum BZF-Kurs, <span className="grad">beantwortet.</span>
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
