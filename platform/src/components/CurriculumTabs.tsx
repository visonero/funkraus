"use client";

import { useState } from "react";

const BZF2_MODULES = [
  {
    num: "01",
    title: "Luftfahrt-Basiswissen für Einsteiger",
    desc: "Luftraumstruktur, Kartenkunde und rechtliche Grundlagen — verständlich erklärt für absolute Einsteiger.",
    duration: "~1h 30min",
  },
  {
    num: "02",
    title: "Sprechfunk-Grundlagen & Standardphraseologie",
    desc: "Buchstabiertafel, Standardredewendungen und das Kürzelsystem zum Mitschreiben.",
    duration: "~25min",
  },
  {
    num: "03",
    title: "Platzverkehr — Rollen, Start & Landung",
    desc: "Der komplette Funkablauf beim Rollen, Starten und Landen — kontrolliert und unkontrolliert.",
    duration: "~30min",
  },
  {
    num: "04",
    title: "Streckenflug & besondere Verfahren",
    desc: "Überlandflug, Kontrollzonen-Durchflug und Sonder-VFR-Anweisungen.",
    duration: "~25min",
  },
  {
    num: "05",
    title: "Not- und Dringlichkeitsverfahren",
    desc: "MAYDAY, PAN PAN und Funkausfallverfahren — sicher in jeder Situation.",
    duration: "~20min",
  },
  {
    num: "06",
    title: "BZF II Prüfungssimulation",
    desc: "100 Fragen, 60 Minuten — exakt im Format deiner echten Prüfung.",
    duration: "~90min",
  },
];

const BZF1_MODULES = [
  {
    num: "07",
    title: "Englischer Sprechfunk — Grundlagen",
    desc: "Buchstabiertafel, Zahlen und Standardphrasen im englischen Funk.",
    duration: "~20min",
  },
  {
    num: "08",
    title: "Englischer Platz- und Streckenverkehr",
    desc: "Dieselben Szenarien wie zuvor — diesmal komplett auf Englisch, inklusive internationaler Besonderheiten.",
    duration: "~25min",
  },
  {
    num: "09",
    title: "Textübersetzung & Fachvokabular",
    desc: "Vorbereitung auf den englischen Prüfungsteil mit Original-Übersetzungstexten und Vokabeltrainer.",
    duration: "~20min",
  },
  {
    num: "10",
    title: "BZF I Prüfungssimulation",
    desc: "Theorie, Übersetzung und Funkverkehr kombiniert — wie am echten Prüfungstag.",
    duration: "~90min",
  },
  {
    num: "11",
    title: "Bonus: Prüfungsanmeldung & Praxistipps",
    desc: "So meldest du dich bei der Bundesnetzagentur an, plus Tipps für den Prüfungstag.",
    duration: "~10min",
  },
];

export default function CurriculumTabs() {
  const [track, setTrack] = useState<"bzf2" | "bzf1">("bzf2");
  const modules = track === "bzf1" ? BZF1_MODULES : BZF2_MODULES;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
        <button className={`tab-btn${track === "bzf2" ? " is-active" : ""}`} onClick={() => setTrack("bzf2")}>
          BZF II · Deutscher Luftraum
        </button>
        <button className={`tab-btn${track === "bzf1" ? " is-active" : ""}`} onClick={() => setTrack("bzf1")}>
          BZF I · Englisch &amp; International
        </button>
      </div>
      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
        {modules.map((mod) => (
          <div
            key={mod.num}
            className="row-compare glass"
            style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "22px 24px", borderRadius: 16 }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                color: "var(--sky)",
                fontSize: 14,
                flex: "none",
                width: 36,
                paddingTop: 2,
              }}
            >
              {mod.num}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 15.5 }}>{mod.title}</p>
              <p style={{ marginTop: 6, fontSize: 13.5, color: "var(--text-dim)" }}>{mod.desc}</p>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 12.5,
                color: "var(--text-faint)",
                flex: "none",
                paddingTop: 2,
              }}
            >
              {mod.duration}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
