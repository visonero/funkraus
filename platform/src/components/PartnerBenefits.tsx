"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const numStyle: React.CSSProperties = { marginTop: 14, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, lineHeight: 1.1 };
const smallStyle: React.CSSProperties = { marginTop: 6, fontSize: 13, lineHeight: 1.45, color: "var(--text-dim)" };

// Same bento tiles and count-up animation as the landing page's UspGrid / the blog CTA highlights, reused for the partner offer.
export default function PartnerBenefits({ discount }: { discount: number }) {
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
    <div ref={ref} className="blog-highlight-grid">
      <div className="usp-card">
        <span className="usp-icon">
          <Icon>
            <circle cx="7.5" cy="7.5" r="2.5" />
            <circle cx="16.5" cy="16.5" r="2.5" />
            <path d="M18 6L6 18" />
          </Icon>
        </span>
        <p className="grad" style={numStyle}>
          <span className="usp-num" data-target={discount}>0</span> € Rabatt
        </p>
        <p style={smallStyle}>für jedes Mitglied, mit eurem eigenen Code</p>
      </div>

      <div className="usp-card">
        <span className="usp-icon">
          <Icon>
            <rect x="4" y="10" width="16" height="9" rx="2.5" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3" />
          </Icon>
        </span>
        <p className="grad" style={numStyle}>
          <span className="usp-num" data-target="2">0</span> Zugänge
        </p>
        <p style={smallStyle}>kostenloser Vollzugang für eure Fluglehrer</p>
      </div>

      <div className="usp-card">
        <span className="usp-icon">
          <Icon>
            <path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </Icon>
        </span>
        <p className="grad" style={numStyle}>
          <span className="usp-num" data-target="0">0</span> € Provision
        </p>
        <p style={smallStyle}>es fließt kein Geld an uns, nur echte Vorteile</p>
      </div>

      <div className="usp-card usp-card--ai">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="usp-icon">
            <Icon>
              <path d="M9 15l6-6" />
              <path d="M8 12l-2 2a3.5 3.5 0 0 0 5 5l2-2" />
              <path d="M16 12l2-2a3.5 3.5 0 0 0-5-5l-2 2" />
            </Icon>
          </span>
          <span className="usp-tag">PARTNER</span>
        </div>
        <p style={{ marginTop: 14, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, lineHeight: 1.2 }}>Offizieller Partner</p>
        <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.86)" }}>gegenseitige Verlinkung auf beiden Websites</p>
        <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "rgba(255,255,255,0.92)" }}>
          {["Backlink von funkraus.de", "Sichtbar für eure Mitglieder"].map((t) => (
            <li key={t} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#7fe3ff", fontWeight: 800 }}>✓</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
