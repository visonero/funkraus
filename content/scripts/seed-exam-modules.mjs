#!/usr/bin/env node
// Creates (or updates) the two mock-exam modules and their single "exam"-type lesson each.
// These don't go through import-chapter.mjs: there's no video/audio/quiz.json, and the exam
// draws its 100 questions live from the already-imported catalogue rather than owning any
// quiz_questions rows itself (see platform/src/lib/course/exam.ts).
//
//   node --env-file=platform/.env.local content/scripts/seed-exam-modules.mjs

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const platformRequire = createRequire(path.join(contentDir, "..", "platform", "package.json"));
const { createClient } = platformRequire("@supabase/supabase-js");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const check = (label, { error }) => {
  if (error) throw new Error(`${label}: ${error.message}`);
};

async function upsertBy(table, match, values) {
  const existing = await supabase.from(table).select("id").match(match).maybeSingle();
  check(`find ${table}`, existing);
  if (existing.data) {
    check(`update ${table}`, await supabase.from(table).update(values).eq("id", existing.data.id));
    return existing.data.id;
  }
  const inserted = await supabase.from(table).insert({ ...match, ...values }).select("id").single();
  check(`insert ${table}`, inserted);
  return inserted.data.id;
}

const EXAM_BODY = "Simuliere die echte schriftliche Prüfung: 100 zufällige Fragen aus dem offiziellen BNetzA-Katalog, 60 Minuten Zeit, 75 richtige Antworten zum Bestehen.";

const modules = [
  {
    track: "bzf2",
    num: "06",
    title: "BZF II Prüfungssimulation",
    description: "100 Fragen, 60 Minuten — exakt im Format deiner echten Prüfung.",
    duration_minutes: 60,
    sort_order: 5,
    lesson: { external_id: "6.1", title: "Prüfungssimulation" },
  },
  {
    track: "bzf1",
    num: "10",
    title: "BZF I Prüfungssimulation",
    description: "Derselbe schriftliche Prüfungsteil wie beim BZF II — BZF I und BZF II teilen sich den offiziellen Fragenkatalog.",
    duration_minutes: 60,
    sort_order: 9,
    lesson: { external_id: "10.1", title: "Prüfungssimulation" },
  },
];

for (const m of modules) {
  const moduleId = await upsertBy(
    "course_modules",
    { track: m.track, num: m.num },
    { title: m.title, description: m.description, duration_minutes: m.duration_minutes, sort_order: m.sort_order, is_free: false },
  );
  const lessonId = await upsertBy(
    "course_lessons",
    { external_id: m.lesson.external_id },
    { module_id: moduleId, title: m.lesson.title, content_type: "exam", body: EXAM_BODY, sort_order: 0 },
  );
  console.log(`Module ${m.num} "${m.title}" (${m.track}) -> lesson ${m.lesson.external_id} (${lessonId})`);
}
