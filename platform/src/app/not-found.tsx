import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function NotFound() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav email={user?.email ?? null} />
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "100px 24px 120px",
          textAlign: "center",
        }}
      >
        <span className="label" style={{ color: "var(--sky)" }}>404</span>
        <h1 style={{ marginTop: 10, fontSize: "clamp(28px,4vw,40px)", fontWeight: 800 }}>
          Diese Seite ist nicht gelandet.
        </h1>
        <p style={{ marginTop: 14, fontSize: 15.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
          Die aufgerufene Seite existiert nicht oder wurde verschoben. Vielleicht hilft dir einer dieser Links weiter.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            className="btn-accent"
            style={{ display: "inline-block", padding: "13px 24px", borderRadius: 999, fontSize: 15 }}
          >
            Zur Startseite
          </Link>
          <Link
            href="/login?mode=signup"
            style={{
              display: "inline-block",
              padding: "13px 24px",
              borderRadius: 999,
              fontSize: 15,
              border: "1.5px solid var(--line-strong)",
              color: "var(--text)",
            }}
          >
            Jetzt registrieren
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
