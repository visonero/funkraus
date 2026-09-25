"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, GA_ID, OPEN_SETTINGS_EVENT, clearAnalyticsCookies, readConsent, writeConsent, type Consent } from "@/lib/consent";

function subscribe(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export default function CookieConsent() {
  const consent = useSyncExternalStore<Consent | "pending">(subscribe, readConsent, () => "pending");
  const [reopened, setReopened] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  // Never measure the admin area (that's the site owner).
  useEffect(() => {
    if (!GA_ID) return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = pathname.startsWith("/admin");
  }, [pathname]);

  if (!GA_ID) return null;

  function choose(value: "granted" | "denied") {
    const wasGranted = consent === "granted";
    writeConsent(value);
    setReopened(false);
    if (value === "denied" && wasGranted) {
      clearAnalyticsCookies();
      // Reload so the already-loaded analytics script stops running.
      window.location.reload();
    }
  }

  const showBanner = consent === "unset" || (reopened && consent !== "pending");

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
          </Script>
        </>
      )}
      {showBanner && (
        <div
          role="dialog"
          aria-label="Cookie-Einstellungen"
          className="glass-strong"
          style={{ position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 100, maxWidth: 560, marginInline: "auto", borderRadius: 20, padding: "20px 22px" }}
        >
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Deine Privatsphäre</p>
          <p style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.55, color: "var(--text-dim)" }}>
            Wir möchten mit Google Analytics verstehen, wie unsere Website genutzt wird, um sie zu verbessern. Das geschieht nur mit deiner Einwilligung. Die Seite funktioniert ohne Analyse genauso. Details in der{" "}
            <Link href="/datenschutz" style={{ color: "var(--sky-deep)", textDecoration: "underline" }}>Datenschutzerklärung</Link>.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button type="button" onClick={() => choose("denied")} className="btn-ghost" style={{ flex: 1, padding: "12px 16px", borderRadius: 999, fontSize: 14.5, fontWeight: 700 }}>
              Ablehnen
            </button>
            <button type="button" onClick={() => choose("granted")} className="btn-accent" style={{ flex: 1, padding: "12px 16px", borderRadius: 999, fontSize: 14.5 }}>
              Akzeptieren
            </button>
          </div>
        </div>
      )}
    </>
  );
}
