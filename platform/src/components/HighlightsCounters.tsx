"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const STATS = [
  { target: 261, prefix: "", suffix: "", label: "offizielle Prüfungsfragen der Bundesnetzagentur, komplett integriert" },
  { target: 8.5, prefix: "", suffix: "h", label: "Gesamtlernzeit vom Einsteiger bis zum Sprechfunkzeugnis" },
  { target: 0, prefix: "", suffix: " EUR", label: "kostet der Start: die ersten 2 Module gratis, ohne Zahlungsdaten" },
];

export default function HighlightsCounters() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const numberEls = gsap.utils.toArray<HTMLElement>(".stat-number");

      const format = (value: number, decimals: number) => value.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

      if (prefersReduced) {
        numberEls.forEach((el) => {
          const target = Number(el.dataset.target);
          const decimals = el.dataset.target?.includes(".") ? 1 : 0;
          const prefix = el.dataset.prefix ?? "";
          const suffix = el.dataset.suffix ?? "";
          el.textContent = `${prefix}${format(target, decimals)}${suffix}`;
        });
        return;
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          numberEls.forEach((el) => {
            const target = Number(el.dataset.target);
            const decimals = el.dataset.target?.includes(".") ? 1 : 0;
            const prefix = el.dataset.prefix ?? "";
            const suffix = el.dataset.suffix ?? "";
            const counter = { val: 0 };
            gsap.to(counter, {
              val: target,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${prefix}${format(counter.val, decimals)}${suffix}`;
              },
            });
          });
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <div
      ref={sectionRef}
      className="section-pad"
      style={{ padding: "64px 32px", maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}
    >
      {STATS.map((s) => (
        <div key={s.label} className="glass reveal" style={{ borderRadius: 24, padding: "32px 28px", textAlign: "center" }}>
          <div
            className="stat-number grad"
            data-target={s.target}
            data-prefix={s.prefix}
            data-suffix={s.suffix}
            style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(34px,4.2vw,50px)" }}
          >
            {s.prefix}0{s.suffix}
          </div>
          <p style={{ marginTop: 8, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.4 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}
