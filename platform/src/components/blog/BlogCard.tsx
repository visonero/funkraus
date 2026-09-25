import Link from "next/link";
import { readingMinutes } from "@/lib/blog/body";
import type { BlogPost } from "@/lib/blog/posts";

export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="glass blog-card" style={{ borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ aspectRatio: "16 / 9", position: "relative", background: "linear-gradient(135deg, var(--sky-deep), var(--sky) 55%, var(--sky-2))" }}>
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span className="label" style={{ position: "absolute", left: 18, bottom: 14, color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
            {post.topic ?? "funkraus Blog"}
          </span>
        )}
      </div>
      <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        {post.topic && post.coverImageUrl && (
          <span className="label" style={{ color: "var(--sky)", marginBottom: 8 }}>{post.topic}</span>
        )}
        <h2 style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.3, color: "var(--text)" }}>{post.title}</h2>
        {post.excerpt && (
          <p style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.6, color: "var(--text-dim)" }}>{post.excerpt}</p>
        )}
        <p style={{ marginTop: "auto", paddingTop: 16, fontSize: 12.5, color: "var(--text-faint)" }}>
          {formatPostDate(post.publishedAt)} · {readingMinutes(post.body)} Min. Lesezeit
        </p>
      </div>
    </Link>
  );
}
