import Link from "next/link";
import { formatPostDate } from "@/components/blog/BlogCard";
import { getAllPostsForAdmin } from "@/lib/blog/posts";

export default async function AdminBlogPage() {
  const { posts, error } = await getAllPostsForAdmin();
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Blog</h1>
          <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>
            {posts.filter((p) => p.status === "published").length} veröffentlicht, {posts.filter((p) => p.status === "draft").length} Entwürfe.
          </p>
        </div>
        <Link href="/admin/blog/new" className="btn-accent" style={{ padding: "12px 24px", borderRadius: 999, fontSize: 14.5 }}>
          + Neuer Artikel
        </Link>
      </div>

      {error && (
        <p style={{ marginTop: 20, fontSize: 14, color: "#c0334d" }}>
          Die Artikel konnten nicht geladen werden ({error}). Wurde die Migration 0010_blog.sql in Supabase ausgeführt?
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        {!error && posts.length === 0 && <p style={{ fontSize: 13.5, color: "var(--text-faint)" }}>Noch keine Artikel. Lege deinen ersten an.</p>}
        {posts.map((p) => {
          const live = p.status === "published";
          return (
            <div key={p.id} className="glass" style={{ borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href={`/admin/blog/${p.id}`} style={{ flex: "1 1 260px", minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{p.title}</p>
                <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--text-faint)" }}>
                  {p.topic ?? "Ohne Thema"} · {live ? `veröffentlicht ${formatPostDate(p.publishedAt)}` : `zuletzt bearbeitet ${formatPostDate(p.updatedAt)}`}
                </p>
              </Link>
              <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: live ? "rgba(52,211,153,0.16)" : "rgba(143,162,179,0.2)", color: live ? "#1a8a5f" : "var(--text-dim)" }}>
                {live ? "Live" : "Entwurf"}
              </span>
              {live && (
                <Link href={`/blog/${p.slug}`} target="_blank" className="nav-link" style={{ fontSize: 13.5 }}>
                  Ansehen ↗
                </Link>
              )}
              <Link href={`/admin/blog/${p.id}`} className="nav-link" style={{ fontSize: 13.5 }}>
                Bearbeiten
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
