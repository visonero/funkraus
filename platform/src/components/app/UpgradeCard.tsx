import type { ReactNode } from "react";
import CheckoutButton from "@/components/CheckoutButton";
import { PRICE } from "@/lib/pricing";
import type { Catalog } from "@/lib/course/types";
import AppIcon from "./AppIcon";

// Shown wherever a free learner meets locked content: what the full access adds and the checkout button.
export default function UpgradeCard({ catalog, title, text, compact = false }: { catalog: Catalog; title?: ReactNode; text?: ReactNode; compact?: boolean }) {
  const points = [
    `Alle ${catalog.modules} Module bis zur Prüfungssimulation`,
    `${catalog.questions} offizielle Prüfungsfragen als Übungsquiz`,
    "Einmal zahlen, lebenslanger Zugriff, kein Abo",
  ];
  return (
    <div className="glass-strong dash-card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, justifyContent: "space-between" }}>
      <div style={{ flex: "1 1 320px", maxWidth: 560 }}>
        <span className="dash-icon" style={{ background: "rgba(47,155,234,0.14)", color: "var(--sky)" }}>
          <AppIcon name="lock" size={22} />
        </span>
        <h2 style={{ marginTop: 14, fontSize: 19, fontWeight: 700, lineHeight: 1.3 }}>{title ?? "Mit dem Vollzugang geht es weiter"}</h2>
        {text && <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>{text}</p>}
        {!compact && (
          <ul style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, padding: 0, listStyle: "none" }}>
            {points.map((point) => (
              <li key={point} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, color: "var(--text-dim)" }}>
                <span style={{ color: "var(--sky)", fontWeight: 800, flex: "none" }}>✓</span>
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ width: 320, maxWidth: "100%" }}>
        <CheckoutButton price={PRICE} marginTop={0} />
        <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-faint)", textAlign: "center" }}>Sichere Zahlung über Stripe · Rechnung inklusive</p>
      </div>
    </div>
  );
}
