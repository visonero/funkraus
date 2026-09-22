import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateModule, deleteModule, createLesson, deleteLesson } from "../../actions";
import DeleteButton from "@/components/DeleteButton";
import { field, label, dangerBtn, smallBtn } from "@/lib/form-styles";

const CONTENT_TYPES = ["video", "audio", "text", "quiz", "exam"];

export default async function ModuleDetailPage({ params }: PageProps<"/admin/modules/[id]">) {
  const { id } = await params;
  const db = createAdminClient();

  const { data: mod } = await db.from("course_modules").select("*").eq("id", id).single();
  if (!mod) notFound();

  const { data: lessons } = await db
    .from("course_lessons")
    .select("id, title, content_type, sort_order")
    .eq("module_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <Link href="/admin" className="nav-link" style={{ fontSize: 13.5 }}>
        ← Alle Module
      </Link>

      <div className="glass-strong" style={{ marginTop: 20, borderRadius: 20, padding: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Modul bearbeiten</h1>
        <form action={updateModule.bind(null, id)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
          <label style={label}>
            Track
            <select name="track" defaultValue={mod.track} style={field}>
              <option value="bzf2">BZF II</option>
              <option value="bzf1">BZF I</option>
            </select>
          </label>
          <label style={label}>
            Nummer
            <input name="num" defaultValue={mod.num} required style={field} />
          </label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Titel
            <input name="title" defaultValue={mod.title} required style={field} />
          </label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Kurzbeschreibung
            <input name="description" defaultValue={mod.description ?? ""} style={field} />
          </label>
          <label style={label}>
            Dauer (Minuten)
            <input name="duration_minutes" type="number" defaultValue={mod.duration_minutes ?? ""} style={field} />
          </label>
          <label style={label}>
            Sortierung
            <input name="sort_order" type="number" defaultValue={mod.sort_order} style={field} />
          </label>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn-accent" style={{ padding: "12px 24px", borderRadius: 10, border: "none" }}>
              Speichern
            </button>
            <DeleteButton
              action={deleteModule.bind(null, id)}
              confirmText={`Modul "${mod.title}" inklusive aller Lektionen und Fragen wirklich löschen?`}
              style={dangerBtn}
            >
              Modul löschen
            </DeleteButton>
          </div>
        </form>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 44 }}>Lektionen</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {(!lessons || lessons.length === 0) && (
          <p style={{ fontSize: 13.5, color: "var(--text-faint)" }}>Noch keine Lektionen.</p>
        )}
        {lessons?.map((l) => (
          <div
            key={l.id}
            className="glass"
            style={{ borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}
          >
            <span className="label" style={{ color: "var(--text-faint)", width: 60 }}>{l.content_type}</span>
            <Link href={`/admin/lessons/${l.id}`} style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: "var(--text)" }}>
              {l.title}
            </Link>
            <Link href={`/admin/lessons/${l.id}`} className="nav-link" style={{ fontSize: 13 }}>
              Bearbeiten
            </Link>
            <DeleteButton
              action={deleteLesson.bind(null, l.id, id)}
              confirmText={`Lektion "${l.title}" inklusive aller Fragen wirklich löschen?`}
              style={dangerBtn}
            >
              Löschen
            </DeleteButton>
          </div>
        ))}
      </div>

      <div className="glass" style={{ marginTop: 28, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Neue Lektion</h3>
        <form action={createLesson.bind(null, id)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Titel
            <input name="title" required style={field} />
          </label>
          <label style={label}>
            Inhaltstyp
            <select name="content_type" defaultValue="text" style={field}>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label style={label}>
            Sortierung
            <input name="sort_order" type="number" defaultValue={0} style={field} />
          </label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Medien-URL (Video/Audio, optional)
            <input name="media_url" style={field} />
          </label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Text / Skript
            <textarea name="body" rows={4} style={{ ...field, resize: "vertical" }} />
          </label>
          <button type="submit" style={{ ...smallBtn, gridColumn: "1 / -1", padding: 12 }}>
            Lektion anlegen
          </button>
        </form>
      </div>
    </div>
  );
}
