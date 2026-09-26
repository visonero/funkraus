// Google Analytics events. gtag only exists after the visitor accepted analytics cookies (CookieConsent.tsx),
// so without consent every call here silently does nothing.
type Params = Record<string, string | number | boolean | undefined>;

export function track(name: string, params: Params = {}) {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") gtag("event", name, params);
  } catch {
    // Analytics must never break the page.
  }
}
