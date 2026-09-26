import Image from "next/image";
import Link from "next/link";
import { PRICE } from "@/lib/pricing";

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const MicIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="3.5" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
  </svg>
);

// The first thing visitors see: the product (BZF I + II course, complete question catalogue, AI radio training) in one
// glance, with a real screenshot of the AI tower and small animated cards around it.
export default function HeroAI({ signupHref, cta }: { signupHref: string; cta: string }) {
  return (
    <section className="hero-ai" aria-labelledby="hero-title">
      <svg className="hero-ai-rings" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {[140, 260, 380, 500, 620].map((r, i) => (
          <circle key={r} cx="1120" cy="360" r={r} fill="none" stroke="#7fe3ff" strokeOpacity={0.18 - i * 0.025} strokeWidth="1.5" strokeDasharray={i % 2 ? "4 10" : undefined} />
        ))}
        <circle cx="180" cy="720" r="200" fill="none" stroke="#5ab8ff" strokeOpacity="0.14" strokeWidth="1.5" />
        <circle cx="180" cy="720" r="320" fill="none" stroke="#5ab8ff" strokeOpacity="0.09" strokeWidth="1.5" strokeDasharray="4 10" />
      </svg>

      <div className="hero-ai-grid">
        <div>
          <div className="hero-ai-badge">
            <span className="ai-live-dot" />
            <b>NEU</b>
            <span>Live sprechen mit dem KI-Tower</span>
          </div>

          <h1 id="hero-title" style={{ marginTop: 22 }}>
            Der <span style={{ whiteSpace: "nowrap" }}>BZF Online-Kurs</span>{" "}
            <span className="hero-grad">
              mit <span style={{ whiteSpace: "nowrap" }}>KI-Funktraining.</span>
            </span>
          </h1>

          <p style={{ marginTop: 20, fontSize: "clamp(16px,1.6vw,19px)", lineHeight: 1.6, color: "rgba(255,255,255,0.82)", maxWidth: 560 }}>
            Sprechfunkzeugnis <strong style={{ color: "#fff" }}>BZF I &amp; BZF II</strong> in einem Kurs: mit dem kompletten offiziellen Fragenkatalog der Bundesnetzagentur und einem KI-Tower, mit dem du echten Funkverkehr per Stimme übst.
          </p>

          <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <span className="hero-pill"><Check /> BZF I &amp; II inklusive</span>
            <span className="hero-pill"><Check /> Kompletter Fragenkatalog · 261 Fragen</span>
            <span className="hero-pill"><MicIcon size={16} /> KI-Funktraining live</span>
          </div>

          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
            <Link href={signupHref} className="btn-hero">{cta}</Link>
            <a href="#ki-training" className="btn-hero-ghost">KI-Training ansehen ↓</a>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.62)", fontWeight: 500, lineHeight: 1.6, maxWidth: 520 }}>
            Die ersten 2 Module kostenlos, ohne Zahlungsdaten. Danach einmalig €{PRICE}, kein Abo. Basierend auf dem offiziellen Fragenkatalog der Bundesnetzagentur.
          </p>
        </div>

        <div className="hero-ai-visual">
          <div className="hero-ai-frame">
            <Image
              src="/screens/tower-desktop.webp"
              alt="KI-Funktraining im BZF-Online-Kurs: Gespräch mit dem KI-Tower per Sprechtaste"
              width={2880}
              height={2020}
              sizes="(max-width: 980px) 92vw, 620px"
              priority
            />
            <span className="hero-mic-ring" style={{ left: "46.9%", top: "84.6%" }} />
            <span className="hero-mic-ring" style={{ left: "46.9%", top: "84.6%", animationDelay: "0.8s" }} />
          </div>

          <div className="hero-float hero-float--tower" aria-hidden="true">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="sc-bars"><span /><span /><span /><span /><span /><span /><span /></span>
              <span className="label" style={{ color: "var(--sky-deep)", fontSize: 10.5 }}>Tower spricht</span>
            </div>
            <p style={{ marginTop: 6, fontSize: 12.5, fontWeight: 600, lineHeight: 1.4 }}>„Rollen Sie zum Rollhalt Piste zwo vier, QNH eins null eins fünf.“</p>
          </div>

          <div className="hero-float hero-float--mic" aria-hidden="true">
            <span className="sc-mic-dot"><MicIcon size={19} /></span>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 800, fontFamily: "var(--font-display)" }}>Du sprichst</p>
              <p style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>Sprechtaste halten</p>
            </div>
          </div>

          <div className="hero-float hero-float--score" aria-hidden="true">
            <p style={{ fontSize: 15, letterSpacing: 2, color: "#f5b301" }}>★★★★<span style={{ color: "#d7e3ef" }}>★</span></p>
            <p style={{ marginTop: 2, fontSize: 12, fontWeight: 700 }}>Rückbestätigung geprüft</p>
            <p style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>Feedback zu Phraseologie</p>
          </div>
        </div>
      </div>
    </section>
  );
}
