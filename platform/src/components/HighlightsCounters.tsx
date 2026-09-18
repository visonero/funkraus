"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const STATS = [
  { target: 254, prefix: "", suffix: "", label: "Offizielle Prüfungsfragen komplett abgedeckt" },
  { target: 15, prefix: "", suffix: "+", label: "Stunden Lernzeit im eigenen Tempo" },
  { target: 349, prefix: "€", suffix: "", label: "Fester Preis — keine versteckten Kosten" },
  { target: 0, prefix: "", suffix: "", label: "Verkaufsgespräche nötig" },
];

export default function HighlightsCounters() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const numberEls = gsap.utils.toArray<HTMLElement>(".stat-number");

      if (prefersReduced) {
        numberEls.forEach((el) => {
          const target = Number(el.dataset.target);
          const prefix = el.dataset.prefix ?? "";
          const suffix = el.dataset.suffix ?? "";
          el.textContent = `${prefix}${target}${suffix}`;
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
            const prefix = el.dataset.prefix ?? "";
            const suffix = el.dataset.suffix ?? "";
            const counter = { val: 0 };
            gsap.to(counter, {
              val: target,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${prefix}${Math.round(counter.val)}${suffix}`;
              },
            });
          });
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="section-pad" style={{ padding: "0 32px 90px", maxWidth: 1180, margin: "0 auto" }}>
      <div
        className="glass reveal"
        style={{
          borderRadius: 24,
          padding: "40px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 28,
          textAlign: "center",
        }}
      >
        {STATS.map((s) => (
          <div key={s.label}>
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
    </div>
  );
}
