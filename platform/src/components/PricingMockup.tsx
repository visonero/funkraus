export default function PricingMockup() {
  return (
    <div className="mockup-frame float" style={{ maxWidth: 460, width: "100%" }}>
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
          app.funkraus.de/kurs
        </span>
      </div>

      <div style={{ padding: 24, display: "flex", gap: 20 }}>
        <div style={{ width: 96, flex: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {["Modul 1", "Modul 2", "Modul 3"].map((m, i) => (
            <div
              key={m}
              style={{
                borderRadius: 10,
                padding: "8px 10px",
                background: i === 2 ? "rgba(47,155,234,0.14)" : "rgba(0,0,0,0.03)",
                border: i === 2 ? "1px solid rgba(47,155,234,0.4)" : "1px solid transparent",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === 2 ? "var(--sky)" : "var(--line-strong)", marginBottom: 6 }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: i === 2 ? "var(--sky-deep)" : "var(--text-faint)" }}>{m}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Modul 3 · Platzverkehr</p>
            <div style={{ height: 6, borderRadius: 999, background: "rgba(0,0,0,0.06)", marginTop: 8, overflow: "hidden" }}>
              <div style={{ width: "62%", height: "100%", background: "linear-gradient(90deg,var(--sky),var(--sky-2))", borderRadius: 999 }} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" stroke="rgba(0,0,0,0.06)" strokeWidth="8" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="var(--sky)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - 0.62)}
                transform="rotate(-90 32 32)"
              />
              <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--sky-deep)">
                62%
              </text>
            </svg>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              {[true, false, false].map((checked, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      border: checked ? "none" : "1.5px solid var(--line-strong)",
                      background: checked ? "var(--sky)" : "transparent",
                      color: "#fff",
                      fontSize: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span style={{ height: 6, borderRadius: 999, background: "rgba(0,0,0,0.06)", flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
