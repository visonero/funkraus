import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import PartnerBenefits from "@/components/PartnerBenefits";
import PartnerContactForm from "@/components/PartnerContactForm";
import { PRICE } from "@/lib/pricing";

const DISCOUNT = 80;

export const metadata: Metadata = {
  title: "Partner werden — funkraus",
  description:
    "Werde offizieller Partner von funkraus: für Flugvereine, Flugschulen, Investoren oder jede andere Kooperationsidee. 80 € Rabatt für eure Mitglieder, 2 kostenlose Fluglehrer-Zugänge, gegenseitige Verlinkung — ohne Provision.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/partner" },
};

export default function PartnerPage() {
  const partnerPrice = Number(PRICE) - DISCOUNT;

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav />

      {/* Header */}
      <div className="section-pad" style={{ padding: "64px 32px 8px", maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
        <span className="label" style={{ color: "var(--sky)" }}>Partner</span>
        <h1 style={{ marginTop: 14, fontSize: "clamp(30px,4vw,46px)", fontWeight: 800, lineHeight: 1.15 }}>
          Werde jetzt <span className="grad">Partner von funkraus</span> und profitiere von vielen Vorteilen.
        </h1>
        <p style={{ marginTop: 16, fontSize: 17, color: "var(--text-dim)" }}>
          Egal ob Flugverein, Flugschule, Investment oder eine ganz andere Idee für eine Zusammenarbeit — wir freuen uns, von deinem Vorhaben zu hören.
        </p>
      </div>

      {/*
        Aktuelle offizielle Partner werden hier gelistet, sobald die ersten Partnerschaften bestehen.
        Bis dahin bleibt dieser Abschnitt bewusst leer.
      */}

      {/* Open for partnerships */}
      <div id="partner-werden" className="section-pad" style={{ padding: "40px 32px 110px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="reveal" style={{ maxWidth: 640, margin: "0 auto 36px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, lineHeight: 1.2 }}>
            Das bekommt ihr als <span className="grad">offizieller Partner.</span>
          </h2>
        </div>

        <PartnerBenefits discount={DISCOUNT} />

        <div
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
          className="partner-split"
        >
          <div>
            <span className="label" style={{ color: "var(--sky)" }}>Für wen das Angebot ist</span>
            <h3 style={{ marginTop: 12, fontSize: "clamp(20px,2.4vw,26px)", fontWeight: 800, lineHeight: 1.25 }}>
              Flugvereine, Flugschulen, Investoren — oder einfach eine gute Idee.
            </h3>
            <p style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.65, color: "var(--text-dim)" }}>
              Wir sind offen für Anfragen jeder Art: Partnerschaften mit Luftsportvereinen und Flugschulen, Investments in
              funkraus, technische oder inhaltliche Kooperationen — oder ein Vorhaben, das noch auf keine dieser
              Kategorien passt. Schreib uns einfach, worum es geht.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                `Vollzugang für eure Mitglieder für €${partnerPrice} statt €${PRICE}, mit eurem eigenen Rabattcode.`,
                "Bis zu 2 kostenlose Fluglehrer-Zugänge, solange die Partnerschaft besteht.",
                "Ihr werdet als offizieller Partner mit Link auf funkraus.de gelistet, wir umgekehrt auf eurer Seite.",
                "Keine Provision, keine versteckten Kosten — es fließt kein Geld an uns.",
              ].map((t) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>✓</span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--text-dim)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-strong" style={{ borderRadius: 24, padding: "32px clamp(20px,4vw,36px)" }}>
            <span className="label" style={{ color: "var(--sky)" }}>Kontakt</span>
            <h3 style={{ marginTop: 10, fontSize: 21, fontWeight: 800 }}>Erzähl uns von deinem Vorhaben</h3>
            <p style={{ marginTop: 8, marginBottom: 20, fontSize: 14, color: "var(--text-dim)" }}>
              Wir melden uns persönlich bei dir zurück.
            </p>
            <PartnerContactForm />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
