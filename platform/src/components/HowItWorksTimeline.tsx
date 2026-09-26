"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STEPS = [
  { num: "1", title: "Kostenlos registrieren", desc: "Konto in einer Minute erstellen, ohne Zahlungsdaten. Die ersten 2 Module sind sofort für dich offen." },
  { num: "2", title: "Lernen in deinem Tempo", desc: "Video, Audio und Quizze im Wechsel, wann und wo du willst. Dein Fortschritt wird gespeichert." },
  { num: "3", title: "Vollzugang freischalten", desc: "Gefällt dir der Kurs, schaltest du einmalig alle weiteren Module frei. Kein Abo, kein Verkaufsgespräch." },
  { num: "4", title: "Prüfung bestehen", desc: "Prüfungssimulation im echten Format, dann melden wir dir den Weg zur Anmeldung bei der Bundesnetzagentur." },
];

export default function HowItWorksTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced || !fillRef.current) return;

      gsap.to(fillRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 55%",
          scrub: 0.6,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <div id="ablauf" ref={sectionRef} className="dark-band bg-hero-dark">
      <div className="section-pad" style={{ position: "relative", zIndex: 1, padding: "96px 32px 110px", maxWidth: 1180, margin: "0 auto" }}>
        <div className="reveal" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <span className="label dk-label">So einfach geht&apos;s</span>
          <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", marginTop: 14, fontWeight: 700, lineHeight: 1.2 }}>
            Von der Registrierung zur <span className="hero-grad">bestandenen Prüfung.</span>
          </h2>
        </div>

        {/* Desktop: horizontal timeline */}
        <div className="timeline-row" style={{ position: "relative", marginTop: 32, alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ position: "absolute", top: 72, left: 24, right: 24, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.18)" }}>
            <div
              ref={fillRef}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg,var(--sky),var(--sky-2))",
                transform: "scaleX(0)",
                transformOrigin: "left center",
              }}
            />
          </div>
          {STEPS.map((s) => (
            <div key={s.num} className="reveal" style={{ position: "relative", flex: 1, textAlign: "center", padding: "0 8px" }}>
              <div className="timeline-num timeline-num--dark">{s.num}</div>
              <div className="timeline-diamond timeline-diamond--dark" />
              <p style={{ marginTop: 26, fontSize: 16.5, fontWeight: 700, color: "#fff" }}>{s.title}</p>
              <p className="dk-dim" style={{ marginTop: 8, fontSize: 13.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile: simple vertical stack */}
        <div className="timeline-row-mobile" style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 48 }}>
          {STEPS.map((s) => (
            <div key={s.num} className="reveal" style={{ display: "flex", gap: 20 }}>
              <div
                className="timeline-num--dark"
                style={{
                  flex: "none",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                }}
              >
                {s.num}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{s.title}</h3>
                <p className="dk-dim" style={{ marginTop: 6, fontSize: 14 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
