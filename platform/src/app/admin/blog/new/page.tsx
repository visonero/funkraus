import Link from "next/link";
import BlogEditor from "@/components/admin/BlogEditor";
import { getKnownTopics } from "@/lib/blog/posts";

export default async function NewBlogPostPage() {
  const topics = await getKnownTopics();
  return (
    <div>
      <Link href="/admin/blog" className="nav-link" style={{ fontSize: 13.5 }}>← Alle Artikel</Link>
      <h1 style={{ marginTop: 16, fontSize: 26, fontWeight: 700 }}>Neuer Artikel</h1>
      <BlogEditor topics={topics} />
    </div>
  );
}
