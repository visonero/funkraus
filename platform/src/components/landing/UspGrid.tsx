"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

// Four main promises as a premium bento grid. The numbers count up once when the grid scrolls into view.
export default function UspGrid() {
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
        start: "top 82%",
        once: true,
        onEnter: () =>
          els.forEach((el) => {
            const o = { v: 0 };
            gsap.to(o, { v: Number(el.dataset.target), duration: 1.6, ease: "power2.out", onUpdate: () => set(el, o.v) });
          }),
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="usp-grid">
      <div className="usp-card usp-card--ai reveal">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span className="usp-icon">
            <Icon>
              <rect x="9" y="3.5" width="6" height="11" rx="3" />
              <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
            </Icon>
          </span>
          <span className="usp-tag">NEU</span>
        </div>
        <p style={{ marginTop: 26, fontFamily: "var(--font-display)", fontSize: "clamp(26px,2.5vw,34px)", fontWeight: 800, lineHeight: 1.12 }}>KI-Funktraining live</p>
        <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.86)" }}>
          Sprich per Sprechtaste mit einem KI-Tower, wie im echten Funkverkehr. Du bekommst die Antwort mit Stimme und danach Feedback zu Ablauf, Phraseologie und Rückbestätigungen.
        </p>
        <ul style={{ marginTop: 18, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9, fontSize: 14.5, color: "rgba(255,255,255,0.92)" }}>
          {["Deutsch und Englisch (BZF I)", "Jedes Mal anderes Flugzeug, Rufzeichen und anderer Flugplatz", "Akzent und Aussprache werden nicht bewertet"].map((t) => (
            <li key={t} style={{ display: "flex", gap: 9 }}>
              <span style={{ color: "#7fe3ff", fontWeight: 800 }}>✓</span>
              {t}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 26, display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 16, background: "rgba(255,255,255,0.12)" }}>
          <span className="sc-bars" style={{ height: 28 }}><span /><span /><span /><span /><span /><span /><span /></span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Live im Gespräch</span>
        </div>
      </div>

      <div className="usp-card reveal">
        <span className="usp-icon">
          <Icon>
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />
          </Icon>
        </span>
        <p className="grad usp-big">
          <span className="usp-num" data-target="12">0</span> Module
        </p>
        <p style={{ marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Kompletter BZF-Kurs</p>
        <p style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.55, color: "var(--text-dim)" }}>BZF I und BZF II in einem Kurs: von den Grundlagen bis zur Prüfungssimulation, ohne Aufpreis für das BZF I.</p>
      </div>

      <div className="usp-card reveal">
        <span className="usp-icon">
          <Icon>
            <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
            <path d="M8 9h8M8 13h8M8 17h5" />
          </Icon>
        </span>
        <p className="grad usp-big">
          <span className="usp-num" data-target="261">0</span> Fragen
        </p>
        <p style={{ marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Gesamter Fragenkatalog</p>
        <p style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.55, color: "var(--text-dim)" }}>Alle offiziellen Prüfungsfragen der Bundesnetzagentur, mit Erklärung zu jeder Antwort und als Prüfungssimulation mit 100 Fragen.</p>
      </div>

      <div className="usp-card usp-card--wide reveal">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 280px" }}>
            <span className="usp-icon">
              <Icon>
                <rect x="3" y="7.5" width="18" height="13" rx="2.5" />
                <path d="M8 7.5V6a4 4 0 0 1 8 0v1.5M12 12.5v3" />
              </Icon>
            </span>
            <p style={{ marginTop: 18, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(22px,2.4vw,28px)", lineHeight: 1.2 }}>
              Erst kostenlos starten, <span className="grad">dann einmal zahlen.</span>
            </p>
            <p style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.55, color: "var(--text-dim)" }}>Kein Abo, kein Verkaufsgespräch: Du schaltest alles mit einer Zahlung frei.</p>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ borderRadius: 18, padding: "16px 20px", background: "rgba(52,211,153,0.14)", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "#0b7a55", lineHeight: 1 }}>
                <span className="usp-num" data-target="2">0</span>
              </p>
              <p style={{ marginTop: 4, fontSize: 12.5, fontWeight: 700, color: "#0b7a55" }}>Module kostenlos</p>
            </div>
            <div style={{ borderRadius: 18, padding: "16px 20px", background: "rgba(47,155,234,0.12)", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "var(--sky-deep)", lineHeight: 1 }}>1×</p>
              <p style={{ marginTop: 4, fontSize: 12.5, fontWeight: 700, color: "var(--sky-deep)" }}>zahlen, alles frei</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
