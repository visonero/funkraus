import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import BlogCard from "@/components/blog/BlogCard";
import { BlogCta } from "@/components/blog/BlogPresets";
import { getPublishedPosts } from "@/lib/blog/posts";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 9;

const DESCRIPTION = "Tipps, Erklärungen und Prüfungswissen rund um das Sprechfunkzeugnis BZF I & II: verständlich aufbereitet vom funkraus-Team.";

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Object.keys(params).length > 0;
  return {
    title: "Blog — Wissen rund ums Sprechfunkzeugnis | funkraus",
    description: DESCRIPTION,
    alternates: { canonical: "/blog" },
    // Filtered, sorted, searched and paginated views duplicate the main list, so only /blog itself is indexed.
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { type: "website", locale: "de_DE", url: "/blog", siteName: "funkraus", title: "funkraus Blog", description: DESCRIPTION },
  };
}

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function BlogIndexPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const topic = first(params.thema);
  const sort = first(params.sort) === "alt" ? "alt" : "neu";
  const q = first(params.q).trim();
  const page = Math.max(1, Number(first(params.seite)) || 1);

  const [all, supabase] = await Promise.all([getPublishedPosts(), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const topics = [...new Set(all.map((p) => p.topic).filter((t): t is string => !!t))].sort((a, b) => a.localeCompare(b, "de"));
  const counts = new Map(topics.map((t) => [t, all.filter((p) => p.topic === t).length]));

  const needle = q.toLowerCase();
  let posts = all.filter(
    (p) =>
      (!topic || p.topic === topic) &&
      (!needle || `${p.title} ${p.excerpt ?? ""} ${p.body}`.toLowerCase().includes(needle)),
  );
  if (sort === "alt") posts = [...posts].reverse();

  const pages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = posts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const href = (over: { thema?: string; sort?: string; q?: string; seite?: number }) => {
    const next = { thema: topic, sort: sort === "alt" ? "alt" : "", q, seite: 0, ...over };
    const usp = new URLSearchParams();
    if (next.thema) usp.set("thema", next.thema);
    if (next.sort) usp.set("sort", next.sort);
    if (next.q) usp.set("q", next.q);
    if (next.seite && next.seite > 1) usp.set("seite", String(next.seite));
    const s = usp.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  const hasFilter = Boolean(topic || q);

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <SiteNav email={user?.email ?? null} />
      <div className="sky-wash">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 32px 40px", textAlign: "center" }}>
          <span className="label" style={{ color: "var(--sky)" }}>Blog</span>
          <h1 style={{ marginTop: 10, fontSize: "clamp(30px,4.6vw,46px)", fontWeight: 800, lineHeight: 1.15, maxWidth: 760, marginInline: "auto" }}>
            Wissen rund ums <span className="grad">Sprechfunkzeugnis</span>
          </h1>
          <p style={{ marginTop: 14, fontSize: 17, lineHeight: 1.6, color: "var(--text-dim)", maxWidth: 620, marginInline: "auto" }}>{DESCRIPTION}</p>

          {all.length > 0 && (
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
              <form action="/blog" method="get" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {topic && <input type="hidden" name="thema" value={topic} />}
                {sort === "alt" && <input type="hidden" name="sort" value="alt" />}
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Artikel durchsuchen…"
                  aria-label="Artikel durchsuchen"
                  style={{ flex: "1 1 260px", maxWidth: 420, textAlign: "left", padding: "12px 16px", borderRadius: 999, border: "1.5px solid var(--line-strong)", background: "rgba(255,255,255,0.8)", fontSize: 15, fontFamily: "var(--font-body)", color: "var(--text)" }}
                />
                <button type="submit" className="btn-accent" style={{ padding: "12px 24px", borderRadius: 999, fontSize: 14.5 }}>Suchen</button>
              </form>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "center" }}>
                <Link href={href({ thema: "" })} className={`blog-chip${!topic ? " is-active" : ""}`}>Alle ({all.length})</Link>
                {topics.map((t) => (
                  <Link key={t} href={href({ thema: t })} className={`blog-chip${topic === t ? " is-active" : ""}`}>
                    {t} ({counts.get(t)})
                  </Link>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-faint)" }}>Sortieren:</span>
                <Link href={href({ sort: "" })} className={`blog-chip${sort === "neu" ? " is-active" : ""}`}>Neueste zuerst</Link>
                <Link href={href({ sort: "alt" })} className={`blog-chip${sort === "alt" ? " is-active" : ""}`}>Älteste zuerst</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 32px 72px" }}>
        {all.length === 0 ? (
          <p style={{ padding: "48px 0", fontSize: 16, color: "var(--text-dim)", textAlign: "center" }}>Hier erscheinen bald die ersten Artikel. Schau bald wieder vorbei!</p>
        ) : posts.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <p style={{ fontSize: 16, color: "var(--text-dim)" }}>Keine Artikel für diese Auswahl gefunden.</p>
            {hasFilter && <Link href="/blog" className="nav-link" style={{ display: "inline-block", marginTop: 12 }}>Filter zurücksetzen</Link>}
          </div>
        ) : (
          <>
            <p style={{ margin: "8px 0 20px", fontSize: 13.5, color: "var(--text-faint)", textAlign: "center" }}>
              {posts.length} Artikel
              {topic ? ` in „${topic}“` : ""}
              {q ? ` für „${q}“` : ""}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 24 }}>
              {visible.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
            {pages > 1 && (
              <nav aria-label="Seiten" style={{ marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
                {current > 1 ? <Link href={href({ seite: current - 1 })} className="blog-chip">← Zurück</Link> : <span />}
                <span style={{ fontSize: 13.5, color: "var(--text-faint)" }}>Seite {current} von {pages}</span>
                {current < pages ? <Link href={href({ seite: current + 1 })} className="blog-chip">Weiter →</Link> : <span />}
              </nav>
            )}
          </>
        )}
        <div style={{ maxWidth: 760, margin: "56px auto 0" }}>
          <BlogCta />
        </div>
      </div>
      <Footer />
    </div>
  );
}
