#!/usr/bin/env node
// Builds everything a chapter needs (narration, hook video, audio drill, PDF card) and optionally imports it.
//
//   node --env-file=platform/.env.local content/scripts/build-chapter.mjs <chapter-dir> [--import] [--stills]
//
// Steps run only if the matching file exists in the chapter folder:
//   hook-video.json   -> narration (ElevenLabs) + Remotion render (or --stills for one preview frame per scene)
//   audio-drill.json  -> audio drill (ElevenLabs)
//   <name>.json card  -> PDF, when chapter.json lists assets.pdf as <build-folder>/<name>.pdf
//   --import          -> import-chapter.mjs (uploads media, writes lesson and questions to Supabase)

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const chapterDir = path.resolve(process.argv.find((a, i) => i > 1 && !a.startsWith("--")) ?? "");
const flags = new Set(process.argv.filter((a) => a.startsWith("--")));
const chapter = JSON.parse(readFileSync(path.join(chapterDir, "chapter.json"), "utf8"));

function run(script, ...args) {
  const result = spawnSync(process.execPath, [path.join(scriptsDir, script), ...args], { stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    console.error(`FAILED: ${script} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

if (existsSync(path.join(chapterDir, "hook-video.json"))) {
  run("generate-audio.mjs", path.join(chapterDir, "hook-video.json"), "--engine", "elevenlabs");
  run("render-hook-video.mjs", chapterDir, ...(flags.has("--stills") ? ["--still"] : []));
}
if (existsSync(path.join(chapterDir, "audio-drill.json"))) {
  run("generate-audio.mjs", path.join(chapterDir, "audio-drill.json"), "--engine", "elevenlabs");
}
const pdf = chapter.assets?.pdf;
if (pdf) {
  const name = path.basename(pdf, ".pdf");
  if (existsSync(path.join(chapterDir, `${name}.json`))) run("build-card.mjs", chapterDir, name);
}
if (flags.has("--import")) run("import-chapter.mjs", chapterDir);
