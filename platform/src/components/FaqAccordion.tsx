"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Wie lange dauert der Kurs?",
    a: "Insgesamt umfasst der Kurs für BZF I & II rund 55 Minuten Video, dazu den kompletten offiziellen Fragenkatalog als Übungsquiz sowie zahlreiche Audio- und Simulationsübungen. Die meisten Teilnehmer benötigen 15–20 Stunden Gesamtlernzeit in ihrem eigenen Tempo.",
  },
  {
    q: "Brauche ich Vorkenntnisse?",
    a: "Nein. Das erste Modul setzt bei null an und erklärt alle nötigen Grundlagen von Anfang an.",
  },
  {
    q: "Was ist der Unterschied zwischen BZF I und BZF II?",
    a: "BZF I berechtigt zum Sprechfunk auf Deutsch und Englisch, BZF II nur auf Deutsch im deutschen Luftraum. Der Kurs deckt beide ab — du entscheidest, welche Prüfung du ablegst.",
  },
  {
    q: "Sind die Inhalte fachlich geprüft?",
    a: "Ja — alle Prüfungsfragen basieren auf dem aktuellen, offiziellen Fragenkatalog der Bundesnetzagentur, und alle Inhalte werden vor Veröffentlichung von einem Fluglehrer bzw. BZF-Inhaber geprüft.",
  },
  {
    q: "Was passiert direkt nach dem Kauf?",
    a: "Du erhältst sofort Zugang zu deinem Konto und allen Kursinhalten — ohne Wartezeit, ohne weiteres Gespräch.",
  },
  {
    q: "Gibt es eine Geld-zurück-Garantie?",
    a: "Details zu unserer Rückerstattungsregelung werden vor dem offiziellen Launch final festgelegt und hier ergänzt.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {FAQS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className="glass reveal" style={{ borderRadius: 16, padding: "18px 24px" }}>
            <button className="faq-q" onClick={() => setOpenIndex(isOpen ? -1 : i)}>
              <span>{item.q}</span>
              <span className="faq-icon">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <p style={{ padding: "10px 0 6px", fontSize: 15, color: "var(--text-dim)", maxWidth: 640 }}>
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
