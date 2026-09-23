"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

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

const COLLAPSED_HEIGHT = 300;

export default function CurriculumTabs() {
  const [track, setTrack] = useState<"bzf2" | "bzf1">("bzf2");
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const modules = track === "bzf1" ? BZF1_MODULES : BZF2_MODULES;

  function switchTrack(next: "bzf2" | "bzf1") {
    setTrack(next);
    setExpanded(false);
    if (listRef.current) {
      gsap.set(listRef.current, { height: COLLAPSED_HEIGHT });
    }
  }

  function handleExpand() {
    if (!listRef.current) return;
    const fullHeight = listRef.current.scrollHeight;
    gsap.to(listRef.current, {
      height: fullHeight,
      duration: 0.7,
      ease: "power2.inOut",
      onComplete: () => setExpanded(true),
    });
  }

  // Keep the collapsed cap correct if content or viewport size changes.
  useEffect(() => {
    if (!expanded && listRef.current) {
      gsap.set(listRef.current, { height: COLLAPSED_HEIGHT });
    }
  }, [track, expanded]);

  const needsFade = !expanded && modules.length > 3;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", justifyContent: "center" }}>
        <button className={`tab-btn${track === "bzf2" ? " is-active" : ""}`} onClick={() => switchTrack("bzf2")}>
          BZF II · Deutscher Luftraum
        </button>
        <button className={`tab-btn${track === "bzf1" ? " is-active" : ""}`} onClick={() => switchTrack("bzf1")}>
          BZF I · Englisch &amp; International
        </button>
      </div>

      <div style={{ position: "relative", marginTop: 32 }}>
        <div
          ref={listRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflow: "hidden",
            height: needsFade ? COLLAPSED_HEIGHT : undefined,
          }}
        >
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

        {needsFade && (
          <div className="curriculum-fade">
            <button
              onClick={handleExpand}
              aria-label="Alle Module anzeigen"
              className="scroll-hint-btn"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg,var(--sky),var(--sky-deep))",
                color: "#fff",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 24px -8px rgba(47,155,234,0.5)",
              }}
            >
              ↓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
