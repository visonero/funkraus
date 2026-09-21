import Image from "next/image";

// Real screenshots of the learning platform (public/screens, created by scripts/capture-screens.mjs).
const DESKTOP = { width: 2880, height: 1800 };
const TABLET = { width: 1668, height: 2224 };
const PHONE = { width: 1170, height: 2532 };

const CARDS = [
  {
    src: "/screens/kurs-desktop.webp",
    mobile: "/screens/kurs-mobile.webp",
    title: "Kursübersicht mit allen Modulen",
    text: "Jedes Modul zeigt Fortschritt und Umfang. Modul 0 und 1 sind kostenlos, alles weitere ist klar markiert.",
    alt: "Kursübersicht der funkraus-Lernplattform mit Modulen und Fortschrittsbalken",
  },
  {
    src: "/screens/lektion-video-desktop.webp",
    mobile: "/screens/lektion-video-mobile.webp",
    title: "Video-Lektionen mit Grafiken",
    text: "Kurze Erklärvideos zeigen Platzrunde, VOR oder Signale als Animation, dazu Lesetext und PDF-Merkblatt.",
    alt: "Video-Lektion zur Platzrunde mit Text und Kursnavigation",
  },
  {
    src: "/screens/quiz-desktop.webp",
    mobile: "/screens/quiz-mobile.webp",
    title: "Offizielle Fragen mit Erklärung",
    text: "Nach jeder Antwort siehst du sofort, was richtig ist, und bekommst eine kurze Begründung dazu.",
    alt: "Quizfragen zum Kapitel mit markierter richtiger Antwort und Erklärung",
  },
  {
    src: "/screens/dashboard-desktop.webp",
    mobile: "/screens/dashboard-mobile.webp",
    title: "Dein Lernfortschritt im Blick",
    text: "Fortschritt, Trefferquote und Aktivität der letzten Tage auf einem Dashboard.",
    alt: "Dashboard mit Fortschrittsring, Trefferquote und Aktivitätsdiagramm",
  },
];

export default function PlatformShowcase({ withGrid = true }: { withGrid?: boolean }) {
  return (
    <div>
      <div className="showcase-stage reveal">
        <div className="device-laptop">
          <Image src="/screens/dashboard-desktop.webp" alt="Dashboard der funkraus-Lernplattform auf dem Laptop" {...DESKTOP} sizes="(max-width: 1100px) 90vw, 930px" priority={false} />
        </div>
        <div className="showcase-devices-row">
          <div className="device-phone">
            <Image src="/screens/quiz-mobile.webp" alt="Quizfrage mit Erklärung auf dem Smartphone" {...PHONE} sizes="(max-width: 760px) 30vw, 160px" />
          </div>
          <div className="device-tablet">
            <Image src="/screens/lektion-video-tablet.webp" alt="Video-Lektion zur Platzrunde auf dem Tablet" {...TABLET} sizes="(max-width: 760px) 50vw, 300px" />
          </div>
        </div>
      </div>

      {withGrid && (
        <div className="showcase-grid">
          {CARDS.map((card) => (
            <div key={card.src} className="glass showcase-card reveal">
              <div className="showcase-shot showcase-shot-wide">
                <Image src={card.src} alt={card.alt} {...DESKTOP} sizes="(max-width: 900px) 92vw, 520px" />
              </div>
              <div className="showcase-shot showcase-shot-phone">
                <Image src={card.mobile} alt={card.alt} {...PHONE} sizes="260px" />
              </div>
              <h3 style={{ marginTop: 18, fontSize: 18, fontWeight: 700, padding: "0 6px" }}>{card.title}</h3>
              <p style={{ marginTop: 6, fontSize: 14.5, color: "var(--text-dim)", padding: "0 6px" }}>{card.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
