"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { PRICE } from "@/lib/pricing";
import type { PresetId } from "@/lib/blog/body";

const SIGNUP_HREF = "/login?mode=signup";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

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

const numStyle: React.CSSProperties = { marginTop: 14, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, lineHeight: 1.1 };
const smallStyle: React.CSSProperties = { marginTop: 6, fontSize: 13, lineHeight: 1.45, color: "var(--text-dim)" };

// Same bento tiles and count-up animation as the landing page's UspGrid, condensed to four even tiles for a mid-article CTA.
export function BlogHighlights() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>(".usp-num");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const set = (el: HTMLElement, v: number) => (el.textContent = Math.round(v).toLocaleString("de-DE"));
      if (reduced) {
        els.forEach((el) => set(el, Number(el.dataset.target)));
        return;
      }
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 85%",
        once: true,
        onEnter: () =>
          els.forEach((el) => {
            const o = { v: 0 };
            gsap.to(o, { v: Number(el.dataset.target), duration: 1.4, ease: "power2.out", onUpdate: () => set(el, o.v) });
          }),
      });
    },
    { scope: ref },
  );

  return (
    <aside className="glass-strong" style={{ margin: "40px 0", borderRadius: 24, padding: "28px clamp(20px,4vw,36px)" }}>
      <p className="label" style={{ color: "var(--sky)" }}>Das steckt im Kurs</p>
      <div ref={ref} className="blog-highlight-grid" style={{ marginTop: 16 }}>
        <div className="usp-card">
          <span className="usp-icon">
            <Icon>
              <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
              <path d="M8 9h8M8 13h8M8 17h5" />
            </Icon>
          </span>
          <p className="grad" style={numStyle}>
            <span className="usp-num" data-target="261">0</span> Fragen
          </p>
          <p style={smallStyle}>offizielle Prüfungsfragen mit Erklärung</p>
        </div>

        <div className="usp-card">
          <span className="usp-icon">
            <Icon>
              <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />
            </Icon>
          </span>
          <p className="grad" style={numStyle}>
            <span className="usp-num" data-target="12">0</span> Module
          </p>
          <p style={smallStyle}>für BZF I &amp; II in einem Kurs</p>
        </div>

        <div className="usp-card">
          <span className="usp-icon">
            <Icon>
              <rect x="3" y="7.5" width="18" height="13" rx="2.5" />
              <path d="M8 7.5V6a4 4 0 0 1 8 0v1.5M12 12.5v3" />
            </Icon>
          </span>
          <p className="grad" style={numStyle}>
            <span className="usp-num" data-target={PRICE}>0</span> €
          </p>
          <p style={smallStyle}>einmalig, 12 Monate Zugriff, kein Abo</p>
        </div>

        <div className="usp-card usp-card--ai">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="usp-icon">
              <Icon>
                <rect x="9" y="3.5" width="6" height="11" rx="3" />
                <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
              </Icon>
            </span>
            <span className="usp-tag">NEU</span>
          </div>
          <p style={{ marginTop: 14, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, lineHeight: 1.2 }}>KI-Tower live</p>
          <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.86)" }}>komplette Funkübungen wie im echten Funkverkehr</p>
          <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 11px", borderRadius: 11, background: "rgba(255,255,255,0.12)" }}>
            <span className="sc-bars" style={{ height: 16 }}><span /><span /><span /><span /><span /></span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>Live im Gespräch</span>
          </div>
        </div>
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
