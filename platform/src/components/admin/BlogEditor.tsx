"use client";

import { useActionState, useRef, useState } from "react";
import { savePost, type SaveState } from "@/app/admin/blog/actions";
import BlogBody from "@/components/blog/BlogBody";
import { PRESETS, type PresetId } from "@/lib/blog/body";
import { slugify } from "@/lib/blog/slug";
import { field, label, smallBtn } from "@/lib/form-styles";

export type EditorPost = {
  id: string;
  title: string;
  slug: string;
  topic: string;
  excerpt: string;
  coverImageUrl: string;
  body: string;
  status: "draft" | "published";
};

type Tool =
  | { label: string; title: string; kind: "wrap"; before: string; after: string; placeholder: string }
  | { label: string; title: string; kind: "line"; prefix: string; placeholder: string }
  | { label: string; title: string; kind: "block"; text: string };

const TABLE_TEMPLATE = `| Überschrift 1 | Überschrift 2 | Überschrift 3 |
|---|---|---|
| Zeile 1, Spalte 1 | Zeile 1, Spalte 2 | Zeile 1, Spalte 3 |
| Zeile 2, Spalte 1 | Zeile 2, Spalte 2 | Zeile 2, Spalte 3 |`;

const TOOLS: Tool[] = [
  { label: "B", title: "Fett", kind: "wrap", before: "**", after: "**", placeholder: "fetter Text" },
  { label: "I", title: "Kursiv", kind: "wrap", before: "*", after: "*", placeholder: "kursiver Text" },
  { label: "H2", title: "Überschrift", kind: "line", prefix: "## ", placeholder: "Überschrift" },
  { label: "H3", title: "Unterüberschrift", kind: "line", prefix: "### ", placeholder: "Unterüberschrift" },
  { label: "• Liste", title: "Aufzählung", kind: "line", prefix: "- ", placeholder: "Listenpunkt" },
  { label: "❝", title: "Zitat", kind: "line", prefix: "> ", placeholder: "Zitat" },
  { label: "Link", title: "Link einfügen", kind: "wrap", before: "[", after: "](https://)", placeholder: "Linktext" },
  { label: "▦ Tabelle", title: "Tabelle einfügen (3 Spalten, 2 Zeilen)", kind: "block", text: TABLE_TEMPLATE },
  { label: "Bild", title: "Bild per URL einfügen", kind: "wrap", before: "![", after: "](https://)", placeholder: "Bildbeschreibung" },
];

const EMPTY: EditorPost = { id: "", title: "", slug: "", topic: "", excerpt: "", coverImageUrl: "", body: "", status: "draft" };

export default function BlogEditor({ post = EMPTY, topics }: { post?: EditorPost; topics: string[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(savePost, {});
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(post.slug));
  const [topic, setTopic] = useState(post.topic);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [cover, setCover] = useState(post.coverImageUrl);
  const [body, setBody] = useState(post.body);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyEdit(fn: (text: string, start: number, end: number) => { text: string; start: number; end: number }) {
    const el = ref.current;
    if (!el) return;
    const r = fn(body, el.selectionStart, el.selectionEnd);
    setBody(r.text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(r.start, r.end);
    });
  }

  function applyTool(tool: Tool) {
    if (tool.kind === "block") {
      insertBlock(tool.text);
    } else if (tool.kind === "wrap") {
      applyEdit((t, s, e) => {
        const sel = t.slice(s, e) || tool.placeholder;
        return { text: t.slice(0, s) + tool.before + sel + tool.after + t.slice(e), start: s + tool.before.length, end: s + tool.before.length + sel.length };
      });
    } else {
      applyEdit((t, s, e) => {
        const lineStart = t.lastIndexOf("\n", s - 1) + 1;
        const sel = t.slice(lineStart, e) || tool.placeholder;
        const text = sel.split("\n").map((l) => tool.prefix + l).join("\n");
        return { text: t.slice(0, lineStart) + text + t.slice(e), start: lineStart + tool.prefix.length, end: lineStart + text.length };
      });
    }
  }

  function insertBlock(block: string) {
    applyEdit((t, s) => {
      const before = t.slice(0, s);
      const after = t.slice(s);
      const lead = before === "" || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
      const trail = after === "" || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
      const text = before + lead + block + trail + after;
      const pos = (before + lead + block + trail).length;
      return { text, start: pos, end: pos };
    });
  }

  function insertPreset(id: PresetId) {
    insertBlock(`{{${id}}}`);
  }

  return (
    <form action={action} style={{ marginTop: 20 }}>
      <input type="hidden" name="id" value={post.id} />
      <div className="glass-strong" style={{ borderRadius: 20, padding: 28, display: "grid", gap: 18 }}>
        <label style={label}>
          Titel
          <input
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            style={{ ...field, fontSize: 18, fontWeight: 600 }}
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <label style={label}>
            Link-Name (URL)
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              style={field}
            />
            <span style={{ display: "block", marginTop: 4, fontWeight: 400, color: "var(--text-faint)" }}>funkraus.de/blog/{slug || "…"}</span>
          </label>
          <label style={label}>
            Thema (für den Filter)
            <input name="topic" list="blog-topics" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z. B. Prüfung, Funkverfahren" style={field} />
            <datalist id="blog-topics">
              {topics.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
        </div>
        <label style={label}>
          Kurzbeschreibung (erscheint in Google und auf der Artikelkarte)
          <textarea name="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300} style={{ ...field, resize: "vertical" }} />
          <span style={{ display: "block", marginTop: 4, fontWeight: 400, color: excerpt.length > 160 ? "#c0334d" : "var(--text-faint)" }}>
            {excerpt.length} Zeichen · Google zeigt etwa 150 bis 160
          </span>
        </label>
        <label style={label}>
          Titelbild-URL (optional, https://…)
          <input name="cover_image_url" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://…" style={field} />
        </label>
      </div>

      <div className="glass-strong" style={{ marginTop: 20, borderRadius: 20, padding: 28 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Text</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setTab("write")} className={`tab-btn${tab === "write" ? " is-active" : ""}`}>Schreiben</button>
            <button type="button" onClick={() => setTab("preview")} className={`tab-btn${tab === "preview" ? " is-active" : ""}`}>Vorschau</button>
          </div>
        </div>

        <div style={{ display: tab === "write" ? "block" : "none" }}>
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TOOLS.map((t) => (
              <button key={t.label} type="button" title={t.title} onClick={() => applyTool(t)} style={{ ...smallBtn, padding: "6px 12px", fontWeight: 600 }}>
                {t.label}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--text-faint)" }}>
            Hier siehst du den Rohtext mit Zeichen wie ## oder |. Wie der Artikel wirklich aussieht, zeigt der Reiter „Vorschau“.
          </p>
          <textarea
            ref={ref}
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={22}
            placeholder="Schreibe hier deinen Artikel. Leerzeilen trennen Absätze."
            style={{ ...field, marginTop: 12, resize: "vertical", lineHeight: 1.6, fontSize: 15 }}
          />

          <div style={{ marginTop: 18, borderRadius: 16, padding: 18, background: "rgba(47,155,234,0.08)" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Bausteine einfügen</p>
            <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-dim)" }}>
              Setze zuerst den Cursor im Text an die gewünschte Stelle, dann klicke auf einen Baustein. Er erscheint dort als Platzhalter wie {"{{cta}}"} und wird im Artikel als fertig gestalteter Bereich angezeigt.
            </p>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
              {(Object.keys(PRESETS) as PresetId[]).map((id) => (
                <button key={id} type="button" onClick={() => insertPreset(id)} className="glass" style={{ textAlign: "left", borderRadius: 14, padding: "12px 14px", border: "1px solid var(--glass-border)", cursor: "pointer" }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--sky-deep)" }}>+ {PRESETS[id].label}</span>
                  <span style={{ display: "block", marginTop: 3, fontSize: 12.5, color: "var(--text-dim)" }}>{PRESETS[id].hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {tab === "preview" && (
          <div style={{ marginTop: 18, padding: "8px 4px" }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>{title || "Titel"}</h1>
            <div style={{ marginTop: 24 }}>
              {body.trim() ? <BlogBody body={body} /> : <p style={{ color: "var(--text-faint)" }}>Noch kein Text.</p>}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <button type="submit" name="intent" value="publish" disabled={pending} className="btn-accent" style={{ padding: "13px 26px", borderRadius: 10, border: "none", opacity: pending ? 0.7 : 1 }}>
          {post.status === "published" ? "Speichern (bleibt live)" : "Veröffentlichen"}
        </button>
        <button type="submit" name="intent" value="draft" disabled={pending} style={{ ...smallBtn, padding: "12px 22px", borderRadius: 10, opacity: pending ? 0.7 : 1 }}>
          {post.status === "published" ? "Zurück zum Entwurf" : "Als Entwurf speichern"}
        </button>
        {pending && <span style={{ fontSize: 13.5, color: "var(--text-faint)" }}>Wird gespeichert…</span>}
        {state.error && <span style={{ fontSize: 13.5, color: "#c0334d" }}>{state.error}</span>}
        {state.saved && <span style={{ fontSize: 13.5, color: "#1a8a5f", fontWeight: 600 }}>{state.saved}</span>}
      </div>
    </form>
  );
}
