export default function TrustStamps({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", ...style }}>
      <div
        className="stamp float"
        style={{ width: 96, height: 96, padding: 8, transform: "rotate(-8deg)", "--rot": "-8deg" } as React.CSSProperties}
      >
        <span style={{ fontSize: 18 }}>⚖️</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, color: "var(--sky-deep)", lineHeight: 1.25, marginTop: 4 }}>
          §5 UrhG
          <br />
          GEPRÜFT
        </span>
      </div>
      <div
        className="stamp float"
        style={{ width: 96, height: 96, padding: 8, transform: "rotate(6deg)", "--rot": "6deg", animationDelay: "-3s" } as React.CSSProperties}
      >
        <span style={{ fontSize: 18 }}>🚫📞</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10.5, color: "var(--sky-deep)", lineHeight: 1.25, marginTop: 4 }}>
          KEIN
          <br />
          VERKAUFSGESPRÄCH
        </span>
      </div>
    </div>
  );
}
