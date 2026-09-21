#!/usr/bin/env node
// Imports one chapter (module + lesson + quiz + media) into Supabase.
//
//   node --env-file=platform/.env.local content/scripts/import-chapter.mjs <chapter-dir> [--dry-run]
//
// Safe to re-run: modules are matched by track+num, lessons and questions by external_id.
// Requires migration 0005. Media goes to the private "course-media" storage bucket.

import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const platformRequire = createRequire(path.join(contentDir, "..", "platform", "package.json"));
const { createClient } = platformRequire("@supabase/supabase-js");

const chapterDir = path.resolve(process.argv.find((a, i) => i > 1 && !a.startsWith("--")) ?? "");
const dryRun = process.argv.includes("--dry-run");
const BUCKET = "course-media";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const moduleMeta = readJson(path.join(chapterDir, "..", "module.json"));
const chapter = readJson(path.join(chapterDir, "chapter.json"));
const quizFile = path.join(chapterDir, "quiz.json");
const quiz = existsSync(quizFile) ? readJson(quizFile) : { questions: [] };
const catalogue = new Map(readJson(path.join(contentDir, "questions", "fragenkatalog-2024.json")).questions.map((q) => [q.id, q]));
const alphabet = readJson(path.join(contentDir, "data", "alphabet.json")).letters;

const alphabetTable = [
  "| Buchstabe | Wort | Aussprache |",
  "|---|---|---|",
  ...alphabet.map((l) => `| ${l.letter} | ${l.word} | ${l.pronunciation} |`),
].join("\n");
const lessonFile = path.join(chapterDir, "lesson.md");
const body = (existsSync(lessonFile) ? readFileSync(lessonFile, "utf8") : "").replace("{{ALPHABET_TABLE}}", alphabetTable).trim();

// Deterministic shuffle so the correct answer is not always option A (as it is in the official catalogue).
function seededShuffle(items, seed) {
  let state = createHash("sha1").update(seed).digest().readUInt32LE(0);
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const questions = quiz.questions.map((q, index) => {
  const official = q.catalogue_number ? catalogue.get(q.catalogue_number) : null;
  if (q.catalogue_number && !official) throw new Error(`Catalogue question ${q.catalogue_number} not found`);
  const externalId = official ? `bnetza-2024-${official.id}` : `${chapter.id}-q${index + 1}`;
  const [correct, ...wrong] = official ? official.options : q.options;
  const options = seededShuffle([correct, ...wrong], externalId);
  return {
    external_id: externalId,
    question: q.question_text ?? (official ? official.question : q.question),
    options,
    correct_index: options.indexOf(correct),
    explanation: q.explanation ?? null,
    source_ref: official ? `BNetzA-Fragenkatalog 2024, Nr. ${official.id}` : (q.source_ref ?? null),
    sort_order: index,
  };
});

const assetTargets = [
  ["video", "media_url", "video/mp4"],
  ["audio", "audio_url", "audio/mpeg"],
  ["pdf", "pdf_url", "application/pdf"],
];
const assets = assetTargets
  .filter(([key]) => chapter.assets?.[key])
  .map(([key, column, contentType]) => ({
    column,
    contentType,
    localPath: path.join(contentDir, "build", chapter.assets[key]),
    storagePath: `${chapter.id}/${path.basename(chapter.assets[key])}`,
  }));

console.log(`Module ${moduleMeta.num} "${moduleMeta.title}" (${moduleMeta.track})`);
console.log(`Lesson ${chapter.id} "${chapter.title}" — ${body.length} chars of text`);
for (const q of questions) console.log(`  Q ${q.external_id}: ${q.question.slice(0, 70)} [correct = ${"ABCD"[q.correct_index]}]`);
for (const a of assets) console.log(`  asset ${a.storagePath} <- ${path.relative(process.cwd(), a.localPath)} ${existsSync(a.localPath) ? "" : "(MISSING)"}`);
if (dryRun) {
  console.log("Dry run: nothing written.");
  process.exit(0);
}

const missing = assets.filter((a) => !existsSync(a.localPath));
if (missing.length) throw new Error(`Missing build files: ${missing.map((a) => a.localPath).join(", ")}`);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const check = (label, { error }) => {
  if (error) throw new Error(`${label}: ${error.message}`);
};

const { data: bucket } = await supabase.storage.getBucket(BUCKET);
if (!bucket) check("create bucket", await supabase.storage.createBucket(BUCKET, { public: false }));

const lessonColumns = {};
for (const a of assets) {
  check(`upload ${a.storagePath}`, await supabase.storage.from(BUCKET).upload(a.storagePath, readFileSync(a.localPath), { upsert: true, contentType: a.contentType }));
  lessonColumns[a.column] = a.storagePath;
}

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

const moduleValues = { title: moduleMeta.title, description: moduleMeta.description, duration_minutes: moduleMeta.duration_minutes, sort_order: moduleMeta.sort_order };
let moduleId;
try {
  moduleId = await upsertBy("course_modules", { track: moduleMeta.track, num: moduleMeta.num }, { ...moduleValues, ...(moduleMeta.is_free === undefined ? {} : { is_free: moduleMeta.is_free }) });
} catch (error) {
  if (!/is_free/.test(String(error.message))) throw error;
  console.warn("  note: column is_free is missing, run migration 0006 (free modules). Importing without it.");
  moduleId = await upsertBy("course_modules", { track: moduleMeta.track, num: moduleMeta.num }, moduleValues);
}
const lessonId = await upsertBy(
  "course_lessons",
  { external_id: chapter.id },
  { module_id: moduleId, title: chapter.title, content_type: chapter.content_type, body, sort_order: chapter.sort_order, ...lessonColumns },
);
for (const q of questions) {
  const { external_id, ...values } = q;
  await upsertBy("quiz_questions", { external_id }, { lesson_id: lessonId, ...values });
}
const keep = questions.map((q) => q.external_id);
check(
  "remove stale questions",
  await supabase.from("quiz_questions").delete().eq("lesson_id", lessonId).not("external_id", "is", null).not("external_id", "in", `(${keep.join(",")})`),
);

console.log(`Imported lesson ${chapter.id} (${lessonId}) with ${questions.length} questions and ${assets.length} media files.`);
