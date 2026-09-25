import Link from "next/link";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/admin/BlogEditor";
import DeleteButton from "@/components/DeleteButton";
import { getKnownTopics, getPostById } from "@/lib/blog/posts";
import { dangerBtn } from "@/lib/form-styles";
import { deletePost } from "../actions";

export default async function EditBlogPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  const { id } = await params;
  const { neu } = await searchParams;
  const [post, topics] = await Promise.all([getPostById(id), getKnownTopics()]);
  if (!post) notFound();

  return (
    <div>
      <Link href="/admin/blog" className="nav-link" style={{ fontSize: 13.5 }}>← Alle Artikel</Link>
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Artikel bearbeiten</h1>
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="nav-link" style={{ fontSize: 14 }}>Live ansehen ↗</Link>
        )}
      </div>
      {neu && (
        <p style={{ marginTop: 12, fontSize: 13.5, fontWeight: 600, color: "#1a8a5f" }}>
          {neu === "publish" ? "Artikel veröffentlicht." : "Entwurf gespeichert."}
        </p>
      )}
      <BlogEditor
        key={post.updatedAt}
        topics={topics}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          topic: post.topic ?? "",
          excerpt: post.excerpt ?? "",
          coverImageUrl: post.coverImageUrl ?? "",
          body: post.body,
          status: post.status,
        }}
      />
      <div style={{ marginTop: 40 }}>
        <DeleteButton action={deletePost.bind(null, post.id)} confirmText={`Artikel „${post.title}“ wirklich endgültig löschen?`} style={dangerBtn}>
          Artikel löschen
        </DeleteButton>
      </div>
    </div>
  );
}
