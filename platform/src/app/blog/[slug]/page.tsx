import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import BlogBody from "@/components/blog/BlogBody";
import BlogCard, { formatPostDate } from "@/components/blog/BlogCard";
import { readingMinutes } from "@/lib/blog/body";
import { getPublishedPost, getPublishedPosts } from "@/lib/blog/posts";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.funkraus.de";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Artikel nicht gefunden — funkraus", robots: { index: false } };
  const description = post.excerpt ?? undefined;
  return {
    title: `${post.title} — funkraus`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      locale: "de_DE",
      url: `/blog/${post.slug}`,
      siteName: "funkraus",
      title: post.title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}),
    },
    twitter: { card: "summary_large_image", title: post.title, description, ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}) },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const [all, supabase] = await Promise.all([getPublishedPosts(), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const others = all.filter((p) => p.id !== post.id);
  const related = [...others.filter((p) => post.topic && p.topic === post.topic), ...others.filter((p) => !post.topic || p.topic !== post.topic)].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt ?? undefined,
        image: post.coverImageUrl ?? undefined,
        datePublished: post.publishedAt ?? undefined,
        dateModified: post.updatedAt,
        inLanguage: "de-DE",
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        author: { "@type": "Organization", name: "funkraus", url: SITE_URL },
        publisher: { "@type": "Organization", name: "funkraus", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
        ],
      },
    ],
  };

  return (
    <div style={{ width: "100%", background: "var(--bg)", overflowX: "hidden" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteNav email={user?.email ?? null} />
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 72px" }}>
        <nav aria-label="Brotkrumen" style={{ fontSize: 13.5, color: "var(--text-faint)" }}>
          <Link href="/blog" style={{ color: "var(--sky-deep)", fontWeight: 600 }}>Blog</Link>
          {post.topic && (
            <>
              {" › "}
              <Link href={`/blog?thema=${encodeURIComponent(post.topic)}`} style={{ color: "var(--sky-deep)", fontWeight: 600 }}>{post.topic}</Link>
            </>
          )}
        </nav>
        <h1 style={{ marginTop: 16, fontSize: "clamp(28px,4.4vw,42px)", fontWeight: 800, lineHeight: 1.18 }}>{post.title}</h1>
        {post.excerpt && <p style={{ marginTop: 16, fontSize: 19, lineHeight: 1.6, color: "var(--text-dim)" }}>{post.excerpt}</p>}
        <p style={{ marginTop: 18, fontSize: 13.5, color: "var(--text-faint)" }}>
          Von funkraus · {formatPostDate(post.publishedAt)} · {readingMinutes(post.body)} Min. Lesezeit
        </p>
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt={post.title} style={{ display: "block", width: "100%", height: "auto", marginTop: 28, borderRadius: 22 }} />
        )}
        <div style={{ marginTop: 32 }}>
          <BlogBody body={post.body} />
        </div>
      </article>

      {related.length > 0 && (
        <section style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--line)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 32px 64px" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Weitere Artikel</h2>
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 24 }}>
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
