"use client";

import { GA_ID, OPEN_SETTINGS_EVENT } from "@/lib/consent";

export default function CookieSettingsLink() {
  if (!GA_ID) return null;
  return (
    <button
      type="button"
      className="nav-link"
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
      style={{ fontSize: 13.5, background: "transparent", border: "none", padding: "8px 4px", textAlign: "left" }}
    >
      Cookie-Einstellungen
    </button>
  );
}
