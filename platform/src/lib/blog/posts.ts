import { createAdminClient } from "@/lib/supabase/admin";

export type BlogStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  topic: string | null;
  coverImageUrl: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const toPost = (r: Record<string, unknown>): BlogPost => ({
  id: r.id as string,
  slug: r.slug as string,
  title: r.title as string,
  excerpt: (r.excerpt as string | null) ?? null,
  body: (r.body as string | null) ?? "",
  topic: (r.topic as string | null) ?? null,
  coverImageUrl: (r.cover_image_url as string | null) ?? null,
  status: r.status as BlogStatus,
  publishedAt: (r.published_at as string | null) ?? null,
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string,
});

// Public readers use the service role with an explicit status filter, so pages don't depend on visitor cookies.
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await createAdminClient()
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.warn("[blog] could not load posts:", error.message);
    return [];
  }
  return (data ?? []).map(toPost);
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const { data } = await createAdminClient().from("blog_posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return data ? toPost(data) : null;
}

export async function getAllPostsForAdmin(): Promise<{ posts: BlogPost[]; error: string | null }> {
  const { data, error } = await createAdminClient().from("blog_posts").select("*").order("updated_at", { ascending: false });
  return { posts: (data ?? []).map(toPost), error: error?.message ?? null };
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data } = await createAdminClient().from("blog_posts").select("*").eq("id", id).maybeSingle();
  return data ? toPost(data) : null;
}

export async function getKnownTopics(): Promise<string[]> {
  const { data } = await createAdminClient().from("blog_posts").select("topic").not("topic", "is", null);
  return [...new Set((data ?? []).map((r) => r.topic as string).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
}
