// Small CSS-animated layers that sit on top of real screenshots in the showcase sections.
// Positions are percentages of the screenshot, so they stay aligned at every size.

export function MicOverlay() {
  return (
    <div className="sc-overlay" aria-hidden="true">
      <span className="hero-mic-ring" style={{ left: "46.9%", top: "84.6%" }} />
      <span className="hero-mic-ring" style={{ left: "46.9%", top: "84.6%", animationDelay: "0.8s" }} />
      <div className="hero-float" style={{ right: "4%", top: "6%", display: "flex", alignItems: "center", gap: 10, animationDuration: "5s" }}>
        <span className="sc-mic-dot">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3.5" width="6" height="11" rx="3" />
            <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
          </svg>
        </span>
        <span className="sc-bars" style={{ height: 26 }}><span /><span /><span /><span /><span /><span /><span /></span>
      </div>
    </div>
  );
}

export function MerkenOverlay() {
  return (
    <div className="sc-overlay" aria-hidden="true">
      <span className="sc-saved">🔖 Gemerkt</span>
      <span className="sc-click" />
      <svg className="sc-cursor" viewBox="0 0 24 24">
        <path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#1c2b3a" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function TowerChatOverlay() {
  return (
    <div className="sc-overlay" aria-hidden="true">
      <div className="sc-bubble sc-bubble--tower">
        <small>Tower</small>
        Delta Echo Hotel Oscar Lima, rollen Sie zum Rollhalt Piste zwo vier.
      </div>
      <svg className="sc-radio" viewBox="0 0 40 40">
        <path d="M8 26a16 16 0 0 1 0-12" />
        <path d="M14 23a9 9 0 0 1 0-6" />
        <path d="M20 20h.01" />
      </svg>
      <div className="sc-bubble sc-bubble--pilot">
        <small>Du</small>
        Rollen zum Rollhalt Piste zwo vier, Delta Echo Hotel Oscar Lima.
      </div>
    </div>
  );
}

export function FreeStartOverlay() {
  return (
    <div className="sc-overlay" aria-hidden="true">
      <div className="sc-ring-badge">
        <svg viewBox="0 0 84 84">
          <circle cx="42" cy="42" r="36" fill="none" stroke="rgba(30,58,95,0.12)" strokeWidth="7" />
          <circle className="fg" cx="42" cy="42" r="36" fill="none" stroke="url(#scg)" strokeWidth="7" strokeLinecap="round" />
          <defs>
            <linearGradient id="scg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2f9bea" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <span style={{ position: "relative", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--sky-deep)" }}>Start</span>
      </div>
      <div className="sc-lock">
        <i>✓</i>
        Die ersten 2 Module kostenlos
      </div>
    </div>
  );
}
