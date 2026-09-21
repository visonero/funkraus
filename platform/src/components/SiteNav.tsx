"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "#einblick", label: "Einblick" },
  { href: "#kurs", label: "Kurs" },
  { href: "#ablauf", label: "Ablauf" },
  { href: "#vorteile", label: "Vorteile" },
  { href: "#preis", label: "Preis" },
  { href: "#faq", label: "FAQ" },
];

export default function SiteNav({
  email,
  ctaHref = "/login?mode=signup",
}: {
  email?: string | null;
  ctaHref?: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfileOpen(false);
    router.push("/");
    router.refresh();
  }

  const initial = email ? email.charAt(0).toUpperCase() : "?";
  const primaryHref = email ? "/dashboard" : ctaHref;
  const primaryLabel = email ? "Zum Dashboard" : "Heute kostenlos starten";

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
        <Link href="/" style={{ display: "flex" }}>
          <Logo />
        </Link>
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {LINKS.map((l) => (
            <a key={l.href} className="nav-link" href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href={primaryHref} className="btn-accent" style={{ padding: "11px 22px", borderRadius: 999, fontSize: 14 }}>
            {primaryLabel}
          </Link>

          {email ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Profilmenü"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1.5px solid var(--line-strong)",
                  background: "linear-gradient(135deg,var(--sky),var(--sky-2))",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {initial}
              </button>
              {profileOpen && (
                <div
                  className="glass-strong"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 48,
                    borderRadius: 14,
                    padding: 10,
                    minWidth: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <p style={{ fontSize: 12, color: "var(--text-faint)", padding: "6px 10px" }}>{email}</p>
                  <Link
                    href="/dashboard"
                    className="nav-link"
                    style={{ padding: "8px 10px", fontSize: 14 }}
                    onClick={() => setProfileOpen(false)}
                  >
                    Mein Profil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="nav-link"
                    style={{ padding: "8px 10px", fontSize: 14, textAlign: "left", background: "transparent", border: "none" }}
                  >
                    Abmelden
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Anmelden"
              className="btn-ghost"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
              }}
            >
              👤
            </Link>
          )}
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
          {email ? (
            <>
              <Link href="/dashboard" className="nav-link" style={{ padding: "12px 0" }} onClick={() => setMenuOpen(false)}>
                Mein Profil
              </Link>
              <button
                onClick={handleSignOut}
                className="nav-link"
                style={{ padding: "12px 0", textAlign: "left", background: "transparent", border: "none" }}
              >
                Abmelden
              </button>
            </>
          ) : (
            <Link href="/login" className="nav-link" style={{ padding: "12px 0" }} onClick={() => setMenuOpen(false)}>
              Anmelden
            </Link>
          )}
          <Link
            href={primaryHref}
            className="btn-accent"
            style={{ padding: "12px 20px", borderRadius: 999, fontSize: 14, textAlign: "center", marginTop: 8 }}
            onClick={() => setMenuOpen(false)}
          >
            {primaryLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
