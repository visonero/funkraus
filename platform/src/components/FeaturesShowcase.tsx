"use client";

import { useRef } from "react";
import FeatureIcon, { type FeatureIconType } from "./FeatureIcon";
import { gsap, useGSAP } from "@/lib/gsap";

const FEATURES: { icon: FeatureIconType; title: string; desc: string }[] = [
  {
    icon: "book",
    title: "Offizieller Fragenkatalog",
    desc: "Der komplette, aktuelle Prüfungsfragenkatalog der Bundesnetzagentur, thematisch in den Kurs integriert.",
  },
  {
    icon: "audio",
    title: "Audio-first Training",
    desc: "Über 40 echte Funkbeispiele zum Hören und Nachsprechen — näher an der echten Prüfung als jedes Video.",
  },
  {
    icon: "radio",
    title: "Interaktive Funksimulationen",
    desc: "Du bekommst eine Situation vorgegeben und reagierst wie im echten Funkverkehr.",
  },
  {
    icon: "check",
    title: "Vollständige Prüfungssimulation",
    desc: "100 Fragen, 60 Minuten, exakt im Format der echten BZF-Prüfung.",
  },
  {
    icon: "badge",
    title: "Fachlich geprüft",
    desc: "Alle Inhalte wurden vor Veröffentlichung von einem Fluglehrer bzw. BZF-Inhaber geprüft.",
  },
  {
    icon: "infinity",
    title: "Lebenslanger Zugriff",
    desc: "Kein Abo, keine Frist. Lerne in deinem eigenen Tempo, so lange du willst.",
  },
];

function SlideContent({ f, i }: { f: (typeof FEATURES)[number]; i: number }) {
  return (
    <div
      className="glass-strong"
      style={{
        borderRadius: 28,
        padding: "48px 44px",
        maxWidth: 520,
        width: "100%",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "rgba(47,155,234,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <FeatureIcon type={f.icon} size={40} />
      </div>
      <span className="label" style={{ color: "var(--sky)" }}>
        {String(i + 1).padStart(2, "0")} / {String(FEATURES.length).padStart(2, "0")}
      </span>
      <h3 style={{ marginTop: 10, fontSize: 24, fontWeight: 700 }}>{f.title}</h3>
      <p style={{ marginTop: 14, fontSize: 15.5, color: "var(--text-dim)" }}>{f.desc}</p>
    </div>
  );
}

export default function FeaturesShowcase() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 900px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };
          if (!isDesktop || reduceMotion || !trackRef.current || !pinRef.current) return;

          const track = trackRef.current;
          // Pacing: the pin only lasts ~55% of the full translation distance,
          // so the horizontal pan finishes well before 1 viewport-width of
          // scroll per slide (the "full" distance feels sluggish at 6 slides).
          const PACE = 0.55;
          const tween = gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: pinRef.current,
              start: "top top",
              end: () => "+=" + (track.scrollWidth - window.innerWidth) * PACE,
              pin: true,
              scrub: 1,
              snap: 1 / (FEATURES.length - 1),
              invalidateOnRefresh: true,
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: pinRef },
  );

  return (
    <div>
      {/* Desktop: pinned horizontal scroll */}
      <div className="features-desktop-pin" ref={pinRef} style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ height: "100vh", display: "flex", alignItems: "center" }}>
          <div className="features-track" ref={trackRef}>
            {FEATURES.map((f, i) => (
              <div className="feature-slide" key={f.title}>
                <SlideContent f={f} i={i} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: native swipeable scroll-snap row */}
      <div className="features-mobile-track">
        {FEATURES.map((f, i) => (
          <div className="feature-card-mobile" key={f.title}>
            <SlideContent f={f} i={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
