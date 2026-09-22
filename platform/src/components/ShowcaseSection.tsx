import Image from "next/image";
import type { ReactNode } from "react";

type DeviceImage = { src: string; alt: string; width: number; height: number };

type Props = {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  text: ReactNode;
  bullets?: string[];
  laptop: DeviceImage;
  tablet?: DeviceImage;
  phone?: DeviceImage;
  reverse?: boolean;
  cta?: ReactNode;
};

// One USP told as a short story: text on one side, real screenshots on the other. Each screenshot is a
// zoomed-in crop of one specific, exciting part of the platform (not the whole browser frame, which made
// the content unreadably small) paired with the same feature on tablet/phone, using the same device-collage
// pattern as the hero's PlatformShowcase.
export default function ShowcaseSection({ id, eyebrow, title, text, bullets, laptop, tablet, phone, reverse, cta }: Props) {
  return (
    <div id={id} className="section-pad" style={{ padding: "56px 32px", maxWidth: 1180, margin: "0 auto" }}>
      <div
        className="showcase-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "center",
          direction: reverse ? "rtl" : "ltr",
        }}
      >
        <div className="reveal" style={{ direction: "ltr" }}>
          <span className="label" style={{ color: "var(--sky)" }}>{eyebrow}</span>
          <h3 style={{ fontSize: "clamp(24px,2.6vw,32px)", marginTop: 12, fontWeight: 700, lineHeight: 1.25 }}>{title}</h3>
          <p style={{ marginTop: 14, fontSize: 15.5, color: "var(--text-dim)", lineHeight: 1.65 }}>{text}</p>
          {bullets && (
            <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 9, padding: 0, listStyle: "none" }}>
              {bullets.map((b) => (
                <li key={b} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, color: "var(--text-dim)" }}>
                  <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {cta && <div style={{ marginTop: 22 }}>{cta}</div>}
        </div>

        <div className="reveal showcase-mockup showcase-devices-compact showcase-stage" style={{ direction: "ltr" }}>
          <div className="device-laptop">
            <Image src={laptop.src} alt={laptop.alt} width={laptop.width} height={laptop.height} sizes="(max-width: 900px) 92vw, 480px" />
          </div>
          {(tablet || phone) && (
            <div className="showcase-devices-row">
              {phone && (
                <div className="device-phone">
                  <Image src={phone.src} alt={phone.alt} width={phone.width} height={phone.height} sizes="(max-width: 760px) 26vw, 140px" />
                </div>
              )}
              {tablet && (
                <div className="device-tablet">
                  <Image src={tablet.src} alt={tablet.alt} width={tablet.width} height={tablet.height} sizes="(max-width: 760px) 44vw, 260px" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
