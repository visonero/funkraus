import Image from "next/image";

// Real screenshots of the learning platform (public/screens, created by scripts/capture-screens.mjs),
// framed as laptop + tablet + phone. Used once in the hero to show the platform immediately.
const DESKTOP = { width: 2880, height: 1800 };
const TABLET = { width: 1668, height: 2224 };
const PHONE = { width: 1170, height: 2532 };

export default function PlatformShowcase() {
  return (
    <div className="showcase-stage reveal">
      <div className="device-laptop">
        <Image
          src="/screens/dashboard-desktop.webp"
          alt="funkraus Dashboard: Lernfortschritt für den BZF-Sprechfunkzeugnis-Kurs"
          {...DESKTOP}
          sizes="(max-width: 1100px) 90vw, 930px"
          priority
        />
      </div>
      <div className="showcase-devices-row">
        <div className="device-phone">
          <Image src="/screens/quiz-mobile.webp" alt="BZF-Prüfungsfrage mit Erklärung auf dem Smartphone" {...PHONE} sizes="(max-width: 760px) 30vw, 160px" />
        </div>
        <div className="device-tablet">
          <Image src="/screens/lektion-video-tablet.webp" alt="Video-Lektion zur Platzrunde im BZF-Online-Kurs auf dem Tablet" {...TABLET} sizes="(max-width: 760px) 50vw, 300px" />
        </div>
      </div>
    </div>
  );
}
