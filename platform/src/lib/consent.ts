// Analytics consent, stored in localStorage. Nothing from Google is loaded until the visitor accepts.
export const CONSENT_KEY = "funkraus-analytics-consent";
export const CONSENT_EVENT = "funkraus:consent-changed";
export const OPEN_SETTINGS_EVENT = "funkraus:open-consent";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export type Consent = "granted" | "denied" | "unset";

export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

export function writeConsent(value: "granted" | "denied") {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked: the choice just won't persist.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

// Removes Google Analytics cookies (_ga, _ga_<ID>) after consent is withdrawn.
export function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = [host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid") {
      for (const d of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}
