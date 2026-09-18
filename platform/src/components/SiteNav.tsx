"use client";

import { useState } from "react";
import Logo from "./Logo";

const LINKS = [
  { href: "#kurs", label: "Kurs" },
  { href: "#ablauf", label: "Ablauf" },
  { href: "#vorteile", label: "Vorteile" },
  { href: "#preis", label: "Preis" },
  { href: "#faq", label: "FAQ" },
];

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: "rgba(246,249,253,0.75)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo />
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {LINKS.map((l) => (
            <a key={l.href} className="nav-link" href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="desktop-nav" style={{ display: "flex" }}>
          <a href="#preis" className="btn-accent" style={{ padding: "11px 22px", borderRadius: 999, fontSize: 14 }}>
            Kurs freischalten
          </a>
        </div>
        <button
          className="menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menü öffnen"
          style={{
            display: "none",
            background: "rgba(255,255,255,0.6)",
            border: "1.5px solid var(--line-strong)",
            borderRadius: 10,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text)",
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>
            {menuOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>
      {menuOpen && (
        <div
          className="mobile-nav glass"
          style={{ display: "flex", flexDirection: "column", padding: "8px 24px 20px", gap: 4 }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              className="nav-link"
              style={{ padding: "12px 0" }}
              href={l.href}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#preis"
            className="btn-accent"
            style={{ padding: "12px 20px", borderRadius: 999, fontSize: 14, textAlign: "center", marginTop: 8 }}
            onClick={() => setMenuOpen(false)}
          >
            Kurs freischalten
          </a>
        </div>
      )}
    </div>
  );
}
