import type { ReactNode } from "react";

export default function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {eyebrow && (
        <span className="label" style={{ color: "var(--sky)" }}>
          {eyebrow}
        </span>
      )}
      <h1 style={{ marginTop: eyebrow ? 8 : 0, fontSize: "clamp(24px,3vw,32px)", fontWeight: 800, lineHeight: 1.15 }}>{title}</h1>
      {subtitle && <p style={{ marginTop: 8, fontSize: 15, color: "var(--text-dim)", maxWidth: 620 }}>{subtitle}</p>}
    </div>
  );
}
