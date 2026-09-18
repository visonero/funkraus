import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createModule, deleteModule } from "./actions";
import DeleteButton from "@/components/DeleteButton";
import { field, label, dangerBtn } from "./form-styles";

export default async function AdminModulesPage() {
  const db = createAdminClient();
  const { data: modules } = await db
    .from("course_modules")
    .select("id, track, num, title, description, duration_minutes, sort_order")
    .order("track", { ascending: true })
    .order("sort_order", { ascending: true });

  const bzf2 = modules?.filter((m) => m.track === "bzf2") ?? [];
  const bzf1 = modules?.filter((m) => m.track === "bzf1") ?? [];

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Kursmodule</h1>
      <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--text-dim)" }}>
        Module für BZF I und BZF II. Klick auf ein Modul, um seine Lektionen zu verwalten.
      </p>

      {[
        { key: "bzf2", title: "BZF II · Deutscher Luftraum", items: bzf2 },
        { key: "bzf1", title: "BZF I · Englisch & International", items: bzf1 },
      ].map((section) => (
        <div key={section.key} style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--sky-deep)" }}>{section.title}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {section.items.length === 0 && (
              <p style={{ fontSize: 13.5, color: "var(--text-faint)" }}>Noch keine Module.</p>
            )}
            {section.items.map((m) => (
              <div
                key={m.id}
                className="glass"
                style={{
                  borderRadius: 14,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--sky)", width: 30 }}>
                  {m.num}
                </span>
                <div style={{ flex: 1 }}>
                  <Link href={`/admin/modules/${m.id}`} style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>
                    {m.title}
                  </Link>
                  {m.description && (
                    <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-dim)" }}>{m.description}</p>
                  )}
                </div>
                <span style={{ fontSize: 12.5, color: "var(--text-faint)", flex: "none" }}>
                  {m.duration_minutes ? `~${m.duration_minutes}min` : ""}
                </span>
                <Link href={`/admin/modules/${m.id}`} className="nav-link" style={{ fontSize: 13 }}>
                  Bearbeiten
                </Link>
                <DeleteButton
                  action={deleteModule.bind(null, m.id)}
                  confirmText={`Modul "${m.title}" inklusive aller Lektionen und Fragen wirklich löschen?`}
                  style={dangerBtn}
                >
                  Löschen
                </DeleteButton>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="glass-strong" style={{ marginTop: 48, borderRadius: 20, padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Neues Modul</h2>
        <form action={createModule} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
          <label style={label}>
            Track
            <select name="track" defaultValue="bzf2" style={field}>
              <option value="bzf2">BZF II</option>
              <option value="bzf1">BZF I</option>
            </select>
          </label>
          <label style={label}>
            Nummer (z.B. 01)
            <input name="num" required style={field} />
          </label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Titel
            <input name="title" required style={field} />
          </label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Kurzbeschreibung
            <input name="description" style={field} />
          </label>
          <label style={label}>
            Dauer (Minuten)
            <input name="duration_minutes" type="number" style={field} />
          </label>
          <label style={label}>
            Sortierung
            <input name="sort_order" type="number" defaultValue={0} style={field} />
          </label>
          <button type="submit" className="btn-accent" style={{ gridColumn: "1 / -1", padding: 12, borderRadius: 10, border: "none", marginTop: 8 }}>
            Modul anlegen
          </button>
        </form>
      </div>
    </div>
  );
}
