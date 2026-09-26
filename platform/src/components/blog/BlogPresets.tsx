import Link from "next/link";
import { PRICE } from "@/lib/pricing";
import type { PresetId } from "@/lib/blog/body";

const SIGNUP_HREF = "/login?mode=signup";

export function BlogCta() {
  return (
    <aside
      style={{
        margin: "40px 0",
        borderRadius: 24,
        padding: "36px clamp(24px,4vw,44px)",
        color: "#fff",
        background: "linear-gradient(135deg, var(--sky-deep) 0%, var(--sky) 60%, var(--sky-2) 130%)",
        boxShadow: "0 24px 60px -24px rgba(28,127,208,0.6)",
      }}
    >
      <p className="label" style={{ color: "rgba(255,255,255,0.85)" }}>Kostenlos testen</p>
      <p style={{ marginTop: 10, fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,28px)", fontWeight: 800, lineHeight: 1.25 }}>
        Bereit für dein Sprechfunkzeugnis?
      </p>
      <p style={{ marginTop: 10, fontSize: 15.5, lineHeight: 1.6, color: "rgba(255,255,255,0.9)", maxWidth: 520 }}>
        Starte mit funkraus kostenlos in den BZF-Kurs: Die ersten 2 Module sind sofort offen, ganz ohne Kreditkarte.
      </p>
      <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: "8px 22px", fontSize: 14, fontWeight: 600 }}>
        <li>✓ Offizieller Fragenkatalog</li>
        <li>✓ Video &amp; Audio-Funkübungen</li>
        <li>✓ Kein Abo</li>
      </ul>
      <Link
        href={SIGNUP_HREF}
        style={{ display: "inline-block", marginTop: 24, padding: "14px 28px", borderRadius: 999, background: "#fff", color: "var(--sky-deep)", fontWeight: 700, fontSize: 15 }}
      >
        Heute kostenlos starten →
      </Link>
    </aside>
  );
}

export function BlogCtaSlim() {
  return (
    <aside
      className="glass-strong"
      style={{ margin: "32px 0", borderRadius: 18, padding: "18px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, borderLeft: "4px solid var(--sky)" }}
    >
      <p style={{ flex: "1 1 260px", fontSize: 15, lineHeight: 1.5, color: "var(--text)", fontWeight: 600 }}>
        BZF-Kurs kostenlos testen: Die ersten 2 Module ohne Kreditkarte.
      </p>
      <Link href={SIGNUP_HREF} className="btn-accent" style={{ padding: "11px 22px", borderRadius: 999, fontSize: 14 }}>
        Jetzt starten
      </Link>
    </aside>
  );
}

const HIGHLIGHTS = [
  { big: "261", small: "offizielle Prüfungsfragen mit Erklärung" },
  { big: "12", small: "Module für BZF I & II in einem Kurs" },
  { big: `${PRICE} €`, small: "einmalig, 12 Monate Zugriff, kein Abo" },
];

export function BlogHighlights() {
  return (
    <aside className="glass-strong" style={{ margin: "40px 0", borderRadius: 24, padding: "28px clamp(20px,4vw,36px)" }}>
      <p className="label" style={{ color: "var(--sky)" }}>Das steckt im Kurs</p>
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
        {HIGHLIGHTS.map((h) => (
          <div key={h.big} style={{ borderRadius: 16, padding: "18px 18px", background: "rgba(47,155,234,0.08)" }}>
            <p className="grad" style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{h.big}</p>
            <p style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.45, color: "var(--text-dim)" }}>{h.small}</p>
          </div>
        ))}
      </div>
      <Link href={SIGNUP_HREF} className="btn-accent" style={{ display: "inline-block", marginTop: 22, padding: "13px 26px", borderRadius: 999, fontSize: 15 }}>
        Kostenlos ausprobieren
      </Link>
    </aside>
  );
}

export function BlogPreset({ id }: { id: PresetId }) {
  if (id === "cta") return <BlogCta />;
  if (id === "cta-klein") return <BlogCtaSlim />;
  return <BlogHighlights />;
}
