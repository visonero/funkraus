import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  text: ReactNode;
  bullets?: string[];
  image: { src: string; alt: string; width: number; height: number };
  reverse?: boolean;
  cta?: ReactNode;
};

// One USP told as a short story: text on one side, a real screenshot (in a browser-style frame) on the
// other. Used repeatedly under "einblick" so each highlight gets its own moment instead of a feature grid.
export default function ShowcaseSection({ id, eyebrow, title, text, bullets, image, reverse, cta }: Props) {
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
        <div className="reveal mockup-frame showcase-mockup" style={{ direction: "ltr", maxWidth: "none" }}>
          <div className="mockup-topbar">
            <span className="mockup-dot" />
            <span className="mockup-dot" />
            <span className="mockup-dot" />
            <span
              style={{
                marginLeft: 10,
                fontSize: 11,
                color: "var(--text-faint)",
                fontFamily: "var(--font-mono, monospace)",
                background: "rgba(0,0,0,0.03)",
                padding: "3px 10px",
                borderRadius: 999,
              }}
            >
              app.funkraus.de
            </span>
          </div>
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 900px) 92vw, 540px" style={{ display: "block", width: "100%", height: "auto" }} />
        </div>
      </div>
    </div>
  );
}
