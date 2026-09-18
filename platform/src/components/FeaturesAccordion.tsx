"use client";

import { useState } from "react";

const FEATURES = [
  {
    icon: "📘",
    title: "Offizieller Fragenkatalog",
    desc: "Der komplette, aktuelle Prüfungsfragenkatalog der Bundesnetzagentur, thematisch in den Kurs integriert.",
  },
  {
    icon: "🎧",
    title: "Audio-first Training",
    desc: "Über 40 echte Funkbeispiele zum Hören und Nachsprechen — näher an der echten Prüfung als jedes Video.",
  },
  {
    icon: "📡",
    title: "Interaktive Funksimulationen",
    desc: "Du bekommst eine Situation vorgegeben und reagierst wie im echten Funkverkehr.",
  },
  {
    icon: "✅",
    title: "Vollständige Prüfungssimulation",
    desc: "100 Fragen, 60 Minuten, exakt im Format der echten BZF-Prüfung.",
  },
  {
    icon: "🧑‍✈️",
    title: "Fachlich geprüft",
    desc: "Alle Inhalte wurden vor Veröffentlichung von einem Fluglehrer bzw. BZF-Inhaber geprüft.",
  },
  {
    icon: "♾️",
    title: "Lebenslanger Zugriff",
    desc: "Kein Abo, keine Frist. Lerne in deinem eigenen Tempo, so lange du willst.",
  },
];

export default function FeaturesAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 52, maxWidth: 760 }}>
      {FEATURES.map((f, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={f.title} className="glass reveal" style={{ borderRadius: 18, padding: "22px 26px" }}>
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 16,
                textAlign: "left",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: "rgba(34,211,238,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flex: "none",
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16.5, fontWeight: 700, flex: 1, color: "var(--text)" }}>{f.title}</h3>
              <span className={`feature-chevron${isOpen ? " is-open" : ""}`}>▾</span>
            </button>
            {isOpen && (
              <p style={{ marginTop: 16, paddingLeft: 60, fontSize: 14.5, color: "var(--text-dim)" }}>{f.desc}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
