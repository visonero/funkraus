import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import ScrollRevealInit from "@/components/ScrollRevealInit";
import HeroAI from "@/components/landing/HeroAI";
import UspGrid from "@/components/landing/UspGrid";
import { FreeStartOverlay, MerkenOverlay, MicOverlay, TowerChatOverlay } from "@/components/landing/Overlays";
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
  { label: "Einstieg", them: "Erst zahlen oder ein Verkaufsgespräch führen", us: "Kostenloses Konto: die ersten 2 Module sofort offen" },
  { label: "Sprechfunk üben", them: "Nur lesen, hören und Quizfragen anklicken", us: "KI-Tower: live per Stimme sprechen, mit Feedback zu deinen Funksprüchen" },
  { label: "Preis für den Rest", them: "Oft vierstellig, erst nach Beratung sichtbar", us: `€${PRICE} einmalig, von Anfang an sichtbar` },
  { label: "Lernformat", them: "Meist nur Video", us: "Video, Audio, Text, PDF und Quiz mit dem kompletten Fragenkatalog" },
  { label: "Tempo & Zugang", them: "Feste Kurstermine, Wartezeit", us: "Sofort startklar, komplett selbstbestimmt" },
];

const FREE_FEATURES = [
  "Kostenloses Konto mit persönlichem Dashboard",
  "Die ersten 2 Module komplett: Videos, Lesetexte, PDF-Merkblätter",
  "Rund 80 offizielle Prüfungsfragen mit Erklärung",
  "1 Probe-Übung im KI-Funktraining",
  "Fortschritt und Trefferquote werden gespeichert",
  "Keine Zahlungsdaten nötig, kein Ablaufdatum",
];

const PRICE_FEATURES = [
  "Alles aus dem kostenlosen Start, plus:",
  "BZF I & BZF II komplett, ein Kurs",
  "KI-Funktraining: live mit dem Tower sprechen (Beta)",
  "Kompletter offizieller Fragenkatalog als Übungsquiz",
  "Über 40 Audio-Funkbeispiele & interaktive Simulationen",
  "Vollständige Prüfungssimulationen (BZF I & II)",
  "PDF-Merkblätter & Spickzettel zum Download",
  "12 Monate Zugriff, kein Abo",
];

const MARQUEE_ITEMS = [
  "📘 Kompletter offizieller Fragenkatalog",
  "🚀 Sofort kostenlos starten",
  "🎁 Die ersten 2 Module kostenlos",
  "💶 Einmal zahlen, alles freischalten",
  "🎙️ KI-Training mit echter Sprachkonversation",
  "✈️ BZF I & II in einem Kurs",
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "BZF Online-Kurs für BZF I und BZF II mit KI-Funktraining",
    description:
      "Online-Kurs für das Sprechfunkzeugnis BZF I und BZF II für PPL(A)- und LAPL(A)-Piloten in Deutschland: kompletter offizieller Fragenkatalog der Bundesnetzagentur (261 Fragen), Prüfungssimulation und KI-Funktraining, bei dem du live mit einem KI-Tower sprichst.",
    inLanguage: "de",
    educationalLevel: "Beginner",
    teaches: ["Sprechfunk im Flugfunkdienst", "BZF I", "BZF II", "Flugfunk-Phraseologie", "Englischer Flugfunk", "Prüfungsvorbereitung Bundesnetzagentur"],
    provider: { "@type": "Organization", name: "funkraus", url: "https://www.funkraus.de", sameAs: "https://www.funkraus.de" },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT9H" },
    offers: {
      "@type": "Offer",
      price: PRICE,
      priceCurrency: "EUR",
      url: "https://www.funkraus.de/#preis",
      availability: "https://schema.org/InStock",
      category: "Vollzugang einmalig, die ersten 2 Module kostenlos",
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
      <HeroAI signupHref={SIGNUP_HREF} cta={FREE_CTA} />

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

      {/* MAIN USPs */}
      <div id="vorteil-gitter" className="section-pad" style={{ padding: "84px 32px 30px", maxWidth: 1180, margin: "0 auto" }}>
        <div className="reveal" style={{ maxWidth: 860, margin: "0 auto 44px", textAlign: "center" }}>
          <span className="label" style={{ color: "var(--sky)" }}>Das bekommst du</span>
          <h2 style={{ fontSize: "clamp(28px,3.6vw,44px)", marginTop: 14, fontWeight: 800, lineHeight: 1.15 }}>
            Alles für dein Sprechfunkzeugnis. <span className="grad">In einem Kurs.</span>
          </h2>
          <p style={{ marginTop: 14, fontSize: 17, color: "var(--text-dim)" }}>
            Kompletter BZF-Kurs, der gesamte offizielle Fragenkatalog und ein KI-Tower zum Sprechen üben.
          </p>
        </div>
        <UspGrid />
      </div>

      {/* USP STORY: einblick */}
      <div id="einblick" style={{ position: "relative", overflow: "hidden" }}>
        <Blob style={{ top: "6%", left: "-6%", width: 280, height: 280, opacity: 0.2 }} color="var(--sky-2)" />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "0px 32px 10px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <span className="label" style={{ color: "var(--sky)" }}>Einblick</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Warum funkraus der <span className="grad">BZF Online-Kurs</span> für dich ist.
            </h2>
            <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>
              Keine Attrappe: Das sind echte Ansichten aus der Lernplattform. Erst das Video, dann vier Dinge, die funkraus besonders machen.
            </p>
          </div>
        </div>

        <div className="reveal section-pad" style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "40px auto 0", padding: "0 32px" }}>
          <div style={{ borderRadius: 28, overflow: "hidden", boxShadow: "0 40px 80px -30px rgba(30,58,95,0.45)", border: "1px solid var(--line)" }}>
            <video controls preload="metadata" poster="/videos/sales-video-poster.webp" style={{ display: "block", width: "100%", height: "auto", background: "#0b1220" }}>
              <source src="/videos/sales-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <ShowcaseSection
          id="ki-training"
          eyebrow="1 · NEU: KI-Funktraining"
          title={
            <>
              Sprich live mit dem <span className="grad">KI-Tower.</span>
            </>
          }
          text="Halte die Sprechtaste, sprich deinen Funkspruch, und der Tower antwortet dir mit Stimme, wie im echten Funkverkehr. Danach bekommst du Feedback zu Ablauf, Phraseologie und Rückbestätigungen. Du übst Rollen, Start, Platzrunde und Landung, auf Deutsch und Englisch."
          bullets={[
            "Jedes Mal anderes Flugzeug, Rufzeichen und anderer Flugplatz",
            "Aussprache und Akzent werden nicht bewertet, nur der Inhalt",
            "Auch ohne Mikrofon nutzbar: Funksprüche einfach tippen",
          ]}
          image={{ src: "/screens/tower-desktop.webp", alt: "KI-Funktraining: Funkverkehr mit dem KI-Tower per Sprechtaste üben", width: 2880, height: 2020 }}
          overlay={<MicOverlay />}
        />

        <ShowcaseSection
          reverse
          eyebrow="2 · Der komplette Fragenkatalog"
          title={
            <>
              Alle <span className="grad">261 Prüfungsfragen.</span> Mit Erklärung.
            </>
          }
          text="Der gesamte offizielle Fragenkatalog der Bundesnetzagentur steckt direkt in den Lektionen, Frage für Frage. Zu jeder Antwort bekommst du sofort die Erklärung. Schwierige Fragen merkst du dir mit einem Klick und übst sie später gezielt."
          bullets={[
            "Immer nur eine Frage auf dem Bildschirm, ohne Ablenkung",
            "„Merken“ sammelt deine kniffligen Fragen im eigenen Bereich",
            "Rückfragen an einen echten Menschen direkt bei der Frage",
          ]}
          image={{ src: "/screens/frage-desktop.webp", alt: "Prüfungsfrage aus dem BZF-Fragenkatalog mit Erklärung und Merken-Funktion", width: 2880, height: 1800 }}
          overlay={<MerkenOverlay />}
        />

        <ShowcaseSection
          eyebrow="3 · Lektionen Schritt für Schritt"
          title={
            <>
              Jede Lektion ein <span className="grad">geführter Weg.</span>
            </>
          }
          text="Erst das Erklärvideo, dann der Lesetext in kleinen Abschnitten, die Hörübung zum Nachsprechen, die passenden Prüfungsfragen und am Ende das PDF-Merkblatt. Immer nur ein Schritt auf dem Bildschirm, mit Weiter und Zurück."
          bullets={[
            "Erklärvideos und Audio-Funkübungen wie im echten Funkverkehr",
            "Kurze Abschnitte statt endlosem Scrollen",
            "Dein Platz in der Lektion bleibt erhalten",
          ]}
          image={{ src: "/screens/lektion-video-desktop.webp", alt: "Video-Lektion im BZF-Online-Kurs mit Fortschrittsanzeige", width: 2880, height: 1800 }}
          overlay={<TowerChatOverlay />}
        />

        <ShowcaseSection
          reverse
          eyebrow="4 · Kostenlos starten"
          title={
            <>
              Die ersten 2 Module <span className="grad">kostenlos.</span>
            </>
          }
          text="Anders als bei vielen BZF-Anbietern zahlst du nicht im Voraus für ein Versprechen. Du erstellst ein kostenloses Konto, lernst die ersten 2 Module komplett durch und probierst das KI-Funktraining einmal aus. Erst danach entscheidest du, ob du alles freischaltest."
          bullets={[
            "Keine Zahlungsdaten bei der Registrierung",
            "Danach einmal zahlen, kein Abo, 12 Monate Zugriff",
            "Dein Fortschritt bleibt erhalten, wenn du freischaltest",
          ]}
          image={{ src: "/screens/dashboard-desktop.webp", alt: "Dashboard des BZF-Online-Kurses mit Lernfortschritt", width: 2880, height: 1800 }}
          overlay={<FreeStartOverlay />}
          cta={
            <Link href={SIGNUP_HREF} className="btn-accent" style={{ display: "inline-block", padding: "14px 26px", borderRadius: 999, fontSize: 15 }}>
              Jetzt kostenloses Konto erstellen
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
                {PRICE_FEATURES.map((text, i) => (
                  <div key={text} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>{i === 0 ? "" : "✓"}</span>
                    <span style={{ fontSize: 13.5, color: i === 0 ? "var(--text)" : "var(--text-dim)", fontWeight: i === 0 ? 700 : 400 }}>{text}</span>
                  </div>
                ))}
              </div>
              <Link href={SIGNUP_HREF} className="btn-ghost" style={{ display: "block", marginTop: 26, padding: 15, borderRadius: 999, fontSize: 15 }}>
                Jetzt registrieren
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
          <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>Kostenlos starten, die ersten 2 Module frei. Fester Preis für den Rest. Kein Verkaufsgespräch.</p>
          <Link href={SIGNUP_HREF} className="btn-accent" style={{ display: "inline-block", marginTop: 32, padding: "18px 38px", borderRadius: 999, fontSize: 17 }}>
            Jetzt kostenlos starten
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
