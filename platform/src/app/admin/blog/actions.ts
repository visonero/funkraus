"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { SLUG_PATTERN, slugify } from "@/lib/blog/slug";
import { createAdminClient } from "@/lib/supabase/admin";

export type SaveState = { error?: string; saved?: string };

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateBlog(...slugs: (string | undefined)[]) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const s of slugs) if (s) revalidatePath(`/blog/${s}`);
  revalidatePath("/admin/blog");
}

export async function savePost(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const db = createAdminClient();

  const id = str(formData, "id");
  const intent = str(formData, "intent") === "publish" ? "publish" : "draft";
  const title = str(formData, "title");
  const slug = str(formData, "slug") || slugify(title);
  const excerpt = str(formData, "excerpt");
  const topic = str(formData, "topic");
  const cover = str(formData, "cover_image_url");
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n");

  if (title.length < 3 || title.length > 160) return { error: "Bitte gib einen Titel mit 3 bis 160 Zeichen ein." };
  if (!SLUG_PATTERN.test(slug)) return { error: "Der Link-Name darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten." };
  if (excerpt.length > 300) return { error: "Die Kurzbeschreibung ist zu lang (maximal 300 Zeichen)." };
  if (topic.length > 60) return { error: "Das Thema ist zu lang (maximal 60 Zeichen)." };
  if (cover && !/^https:\/\//i.test(cover)) return { error: "Die Bild-URL muss mit https:// beginnen." };
  if (intent === "publish") {
    if (body.trim().length < 50) return { error: "Zum Veröffentlichen braucht der Artikel etwas mehr Text." };
    if (!excerpt) return { error: "Zum Veröffentlichen fehlt die Kurzbeschreibung. Sie erscheint in Google und auf den Karten." };
  }

  const existing = id ? (await db.from("blog_posts").select("slug, status, published_at").eq("id", id).maybeSingle()).data : null;
  if (id && !existing) return { error: "Artikel nicht gefunden." };

  const now = new Date().toISOString();
  const fields = {
    slug,
    title,
    excerpt: excerpt || null,
    topic: topic || null,
    cover_image_url: cover || null,
    body,
    status: intent === "publish" ? "published" : "draft",
    published_at: intent === "publish" ? ((existing?.published_at as string | null) ?? now) : ((existing?.published_at as string | null) ?? null),
    updated_at: now,
  };

  if (!id) {
    const { data, error } = await db.from("blog_posts").insert(fields).select("id").single();
    if (error) return { error: error.code === "23505" ? "Dieser Link-Name ist schon vergeben. Bitte wähle einen anderen." : "Speichern fehlgeschlagen. Wurde die Migration 0010 in Supabase ausgeführt?" };
    revalidateBlog(slug);
    redirect(`/admin/blog/${data.id}?neu=${intent}`);
  }

  const { error } = await db.from("blog_posts").update(fields).eq("id", id);
  if (error) return { error: error.code === "23505" ? "Dieser Link-Name ist schon vergeben. Bitte wähle einen anderen." : "Speichern fehlgeschlagen." };
  revalidateBlog(slug, existing?.slug as string | undefined);
  return { saved: intent === "publish" ? "Gespeichert und veröffentlicht." : "Als Entwurf gespeichert." };
}

export async function deletePost(id: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { data } = await db.from("blog_posts").select("slug").eq("id", id).maybeSingle();
  await db.from("blog_posts").delete().eq("id", id);
  revalidateBlog(data?.slug as string | undefined);
  redirect("/admin/blog");
}
