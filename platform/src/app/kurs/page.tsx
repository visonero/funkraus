import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import ScrollRevealInit from "@/components/ScrollRevealInit";
import FeaturesShowcase from "@/components/FeaturesShowcase";
import CurriculumTabs from "@/components/CurriculumTabs";
import FaqAccordion from "@/components/FaqAccordion";
import CheckoutButton from "@/components/CheckoutButton";
import PlatformShowcase from "@/components/PlatformShowcase";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ORIGINAL_PRICE, PRICE } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";


const PRICE_FEATURES = [
  "Alle Module ab Modul 2 (Modul 0 und 1 hast du schon kostenlos)",
  "BZF I & BZF II komplett, ein Kurs",
  "Kompletter offizieller Fragenkatalog als Übungsquiz",
  "Über 40 Audio-Funkbeispiele & interaktive Simulationen",
  "Vollständige Prüfungssimulationen (BZF I & II)",
  "PDF-Merkblätter & Spickzettel zum Download",
  "12 Monate Zugriff, kein Abo",
];


export const metadata: Metadata = {
  title: "BZF I & II Kurs — funkraus",
  description: "Der komplette Online-Kurs für dein Sprechfunkzeugnis. Heute kostenlos starten, Vollzugang einmalig zum Einführungspreis.",
  alternates: { canonical: "/kurs" },
};

export default async function KursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden", position: "relative" }}>
      <ScrollRevealInit />
      <SiteNav email={user?.email ?? null} />

      {/* INTRO */}
      <div className="sky-wash section-pad" style={{ padding: "80px 32px 60px", position: "relative" }}>
        <div className="reveal" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <span className="label" style={{ color: "var(--sky)" }}>BZF I &amp; BZF II · Online-Kurs</span>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginTop: 14, fontWeight: 800, lineHeight: 1.1 }}>
            Alles, was du für dein <span className="grad">Sprechfunkzeugnis</span> brauchst.
          </h1>
          <p style={{ marginTop: 18, fontSize: 17, color: "var(--text-dim)", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Starte kostenlos mit Modul 0 und 1. Den Rest schaltest du einmalig frei, zum festen Preis und ohne Verkaufsgespräch.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 28 }}>
            <Link href="/login?mode=signup" className="btn-accent" style={{ display: "inline-block", padding: "16px 32px", borderRadius: 999, fontSize: 16 }}>
              Heute kostenlos starten
            </Link>
            <a href="#kaufen" className="btn-ghost" style={{ display: "inline-block", padding: "16px 32px", borderRadius: 999, fontSize: 16 }}>
              Vollzugang ansehen ↓
            </a>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="section-pad" style={{ padding: "20px 32px 90px", maxWidth: 1180, margin: "0 auto" }}>
        <div className="reveal" style={{ maxWidth: 640 }}>
          <span className="label" style={{ color: "var(--sky)" }}>Kursinhalt</span>
          <h2 style={{ fontSize: "clamp(26px,3.2vw,36px)", marginTop: 14, fontWeight: 700 }}>
            Alles in <span className="grad">einem Kurs.</span>
          </h2>
        </div>
        <FeaturesShowcase />
      </div>

      {/* CURRICULUM */}
      <div className="section-pad" style={{ padding: "20px 32px 90px", maxWidth: 1180, margin: "0 auto" }}>
        <div className="reveal" style={{ maxWidth: 640 }}>
          <span className="label" style={{ color: "var(--sky)" }}>Kursstruktur</span>
          <h2 style={{ fontSize: "clamp(26px,3.2vw,36px)", marginTop: 14, fontWeight: 700 }}>
            Zwei Prüfungen, <span className="grad">ein Kurs.</span>
          </h2>
        </div>
        <CurriculumTabs />
      </div>

      {/* PLATFORM SHOWCASE */}
      <div className="section-pad" style={{ padding: "20px 32px 90px", maxWidth: 1180, margin: "0 auto" }}>
        <div className="reveal" style={{ maxWidth: 640 }}>
          <span className="label" style={{ color: "var(--sky)" }}>Einblick</span>
          <h2 style={{ fontSize: "clamp(26px,3.2vw,36px)", marginTop: 14, fontWeight: 700 }}>
            So sieht der Kurs <span className="grad">von innen aus.</span>
          </h2>
          <p style={{ marginTop: 12, fontSize: 15, color: "var(--text-dim)" }}>
            Echte Ansichten aus der Plattform. Du kannst alles selbst ausprobieren, Modul 0 und 1 sind kostenlos.
          </p>
        </div>
        <PlatformShowcase />
      </div>

      {/* BUY */}
      <div id="kaufen" style={{ position: "relative", overflow: "hidden" }}>
        <div className="deco blob hide-mobile" style={{ position: "absolute", top: "4%", left: "4%", width: 260, height: 260, opacity: 0.18, background: "var(--sky)" }} />
        <div className="deco blob hide-mobile" style={{ position: "absolute", bottom: "2%", right: "2%", width: 220, height: 220, opacity: 0.2, background: "var(--sky-2)" }} />
        <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "40px 32px 110px", maxWidth: 1180, margin: "0 auto" }}>
          <div className="reveal" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <span className="label" style={{ color: "var(--sky)" }}>Vollzugang</span>
            <h2 style={{ fontSize: "clamp(26px,3.2vw,36px)", marginTop: 14, fontWeight: 700 }}>
              Ein Preis. <span className="grad">Keine Überraschungen.</span>
            </h2>
            <p style={{ marginTop: 12, fontSize: 15.5, color: "var(--text-dim)" }}>
              Du hast Modul 0 und 1 schon kostenlos ausprobiert? Mit dem Vollzugang geht es weiter.
            </p>
          </div>

          <div className="reveal glass-strong" style={{ maxWidth: 460, margin: "40px auto 0", borderRadius: 28, padding: 44, textAlign: "center" }}>
            <span
              style={{
                display: "inline-block",
                padding: "5px 14px",
                borderRadius: 999,
                background: "rgba(255,143,179,0.16)",
                color: "#c0447a",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              🔥 Zeitlich begrenztes Einführungsangebot
            </span>
            <div>
              <span className="label" style={{ color: "var(--text-faint)" }}>BZF I &amp; II komplett</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 18, color: "var(--text-faint)", textDecoration: "line-through" }}>
              €{ORIGINAL_PRICE}
            </div>
            <div style={{ marginTop: 2, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
              <span className="grad" style={{ fontSize: 24, fontWeight: 800 }}>€</span>
              <span className="grad" style={{ fontFamily: "var(--font-display)", fontSize: 66, fontWeight: 800 }}>{PRICE}</span>
            </div>
            <p style={{ marginTop: 4, fontSize: 13.5, color: "var(--text-faint)" }}>einmalig · kein Abo · 12 Monate Zugriff</p>
            <div style={{ textAlign: "left", marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
              {PRICE_FEATURES.map((text) => (
                <div key={text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>✓</span>
                  <span style={{ fontSize: 14.5, color: "var(--text-dim)" }}>{text}</span>
                </div>
              ))}
            </div>
            <CheckoutButton price={PRICE} />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="section-pad" style={{ padding: "20px 32px 110px", maxWidth: 760, margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="label" style={{ color: "var(--sky)" }}>FAQ</span>
          <h2 style={{ fontSize: "clamp(24px,3vw,32px)", marginTop: 14, fontWeight: 700 }}>
            Alle Fragen zum BZF-Kurs, <span className="grad">beantwortet.</span>
          </h2>
        </div>
        <FaqAccordion />
      </div>

      <Footer />
    </div>
  );
}
