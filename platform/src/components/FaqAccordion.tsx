"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Was ist im kostenlosen Zugang enthalten?",
    a: "Mit einem kostenlosen Konto nutzt du das Dashboard sowie Modul 0 und Modul 1 komplett: Videos, Lesetexte, PDF-Merkblätter und die zugehörigen offiziellen Prüfungsfragen mit Erklärung. Dein Fortschritt wird gespeichert. Dafür brauchst du keine Zahlungsdaten, und der Zugang läuft nicht ab.",
  },
  {
    q: "Was passiert nach Modul 1?",
    a: "Ab Modul 2 beginnt der eigentliche Sprechfunk-Teil. Diese Module schaltest du mit dem Vollzugang frei, einmalig €349, ohne Abo. Bis dahin kannst du in Ruhe testen, ob dir der Kurs gefällt.",
  },
  {
    q: "Muss ich für die Registrierung bezahlen oder Zahlungsdaten angeben?",
    a: "Nein. Du erstellst ein Konto mit E-Mail-Adresse und Passwort und bestätigst deine E-Mail. Zahlungsdaten brauchst du erst, wenn du den Vollzugang kaufen möchtest.",
  },
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
    q: "Was passiert direkt nach dem Kauf des Vollzugangs?",
    a: "Alle weiteren Module werden in deinem bestehenden Konto sofort freigeschaltet, ohne Wartezeit und ohne weiteres Gespräch. Dein bisheriger Fortschritt bleibt erhalten.",
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
