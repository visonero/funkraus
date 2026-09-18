import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateLesson, deleteLesson, createQuestion, updateQuestion, deleteQuestion } from "../../actions";
import DeleteButton from "@/components/DeleteButton";
import { field, label, dangerBtn, smallBtn } from "../../form-styles";

const CONTENT_TYPES = ["video", "audio", "text", "quiz"];

export default async function LessonDetailPage({ params }: PageProps<"/admin/lessons/[id]">) {
  const { id } = await params;
  const db = createAdminClient();

  const { data: lesson } = await db.from("course_lessons").select("*").eq("id", id).single();
  if (!lesson) notFound();

  const { data: mod } = await db
    .from("course_modules")
    .select("id, title")
    .eq("id", lesson.module_id)
    .single();

  const { data: questions } = await db
    .from("quiz_questions")
    .select("*")
    .eq("lesson_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <Link href={`/admin/modules/${lesson.module_id}`} className="nav-link" style={{ fontSize: 13.5 }}>
        ← {mod?.title ?? "Zurück zum Modul"}
      </Link>

      <div className="glass-strong" style={{ marginTop: 20, borderRadius: 20, padding: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Lektion bearbeiten</h1>
        <form
          action={updateLesson.bind(null, id, lesson.module_id)}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}
        >
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Titel
            <input name="title" defaultValue={lesson.title} required style={field} />
          </label>
          <label style={label}>
            Inhaltstyp
            <select name="content_type" defaultValue={lesson.content_type} style={field}>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label style={label}>
            Sortierung
            <input name="sort_order" type="number" defaultValue={lesson.sort_order} style={field} />
          </label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Medien-URL (Video/Audio, optional)
            <input name="media_url" defaultValue={lesson.media_url ?? ""} style={field} />
          </label>
          <label style={{ ...label, gridColumn: "1 / -1" }}>
            Text / Skript
            <textarea name="body" rows={5} defaultValue={lesson.body ?? ""} style={{ ...field, resize: "vertical" }} />
          </label>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn-accent" style={{ padding: "12px 24px", borderRadius: 10, border: "none" }}>
              Speichern
            </button>
            <DeleteButton
              action={deleteLesson.bind(null, id, lesson.module_id)}
              confirmText={`Lektion "${lesson.title}" inklusive aller Fragen wirklich löschen?`}
              style={dangerBtn}
            >
              Lektion löschen
            </DeleteButton>
          </div>
        </form>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 44 }}>Quizfragen</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        {(!questions || questions.length === 0) && (
          <p style={{ fontSize: 13.5, color: "var(--text-faint)" }}>Noch keine Fragen.</p>
        )}
        {questions?.map((q) => {
          const options: string[] = Array.isArray(q.options) ? q.options : ["", "", "", ""];
          return (
            <div key={q.id} className="glass" style={{ borderRadius: 16, padding: 22 }}>
              <form action={updateQuestion.bind(null, q.id, id)} style={{ display: "grid", gap: 12 }}>
                <label style={label}>
                  Frage
                  <input name="question" defaultValue={q.question} required style={field} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <label key={i} style={label}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="radio"
                          name="correct_index"
                          value={i}
                          defaultChecked={q.correct_index === i}
                        />
                        Option {i + 1}{q.correct_index === i ? " (richtig)" : ""}
                      </span>
                      <input name={`option_${i}`} defaultValue={options[i] ?? ""} required style={field} />
                    </label>
                  ))}
                </div>
                <label style={{ ...label, maxWidth: 160 }}>
                  Sortierung
                  <input name="sort_order" type="number" defaultValue={q.sort_order} style={field} />
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="submit" style={{ ...smallBtn, background: "rgba(47,155,234,0.12)", borderColor: "transparent", color: "var(--sky-deep)", fontWeight: 700 }}>
                    Speichern
                  </button>
                  <DeleteButton
                    action={deleteQuestion.bind(null, q.id, id)}
                    confirmText="Diese Frage wirklich löschen?"
                    style={dangerBtn}
                  >
                    Löschen
                  </DeleteButton>
                </div>
              </form>
            </div>
          );
        })}
      </div>

      <div className="glass-strong" style={{ marginTop: 28, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Neue Frage</h3>
        <form action={createQuestion.bind(null, id)} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <label style={label}>
            Frage
            <input name="question" required style={field} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <label key={i} style={label}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="radio" name="correct_index" value={i} defaultChecked={i === 0} />
                  Option {i + 1}
                </span>
                <input name={`option_${i}`} required style={field} />
              </label>
            ))}
          </div>
          <label style={{ ...label, maxWidth: 160 }}>
            Sortierung
            <input name="sort_order" type="number" defaultValue={0} style={field} />
          </label>
          <button type="submit" style={{ ...smallBtn, padding: 12 }}>
            Frage anlegen
          </button>
        </form>
      </div>
    </div>
  );
}
