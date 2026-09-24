"use client";

import { useState } from "react";
import FeatureIcon, { type FeatureIconType } from "./FeatureIcon";

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
    icon: "calendar",
    title: "12 Monate Zugriff",
    desc: "Kein Abo, einmal zahlen. Ein volles Jahr Zeit, in deinem eigenen Tempo zu lernen.",
  },
];

export default function FeaturesShowcase() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
        gap: 20,
        marginTop: 40,
      }}
    >
      {FEATURES.map((f, i) => {
        const isFlipped = flipped.has(i);
        return (
          <button
            key={f.title}
            type="button"
            className="flip-card reveal"
            onClick={() => toggle(i)}
            aria-pressed={isFlipped}
            aria-label={`${f.title} — Details ${isFlipped ? "ausblenden" : "anzeigen"}`}
          >
            <div className={`flip-card-inner${isFlipped ? " is-flipped" : ""}`}>
              <div className="flip-card-face flip-card-front glass card">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "rgba(34,211,238,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FeatureIcon type={f.icon} size={28} />
                </div>
                <h3 style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{f.title}</h3>
                <span style={{ marginTop: "auto", fontSize: 12, color: "var(--sky-deep)", fontWeight: 600 }}>
                  Tippen für Details →
                </span>
              </div>
              <div className="flip-card-face flip-card-back glass-strong">
                <p style={{ fontSize: 14.5, fontWeight: 700, color: "var(--sky-deep)" }}>{f.title}</p>
                <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>{f.desc}</p>
                <span style={{ marginTop: "auto", fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>
                  ← Zurück
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
