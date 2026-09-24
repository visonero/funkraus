#!/usr/bin/env node
// Renders a chapter's hook video from its narration timings.
//   node content/scripts/render-hook-video.mjs <chapter-dir> [--still]
// Run generate-audio.mjs on <chapter-dir>/hook-video.json first. --still renders one preview frame per scene.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkScenes } from "./sync-check.mjs";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videoDir = path.join(contentDir, "video");
const chapterDir = path.resolve(process.argv[2] ?? "");
const stills = process.argv.includes("--still");

const chapter = JSON.parse(readFileSync(path.join(chapterDir, "chapter.json"), "utf8"));
const script = JSON.parse(readFileSync(path.join(chapterDir, "hook-video.json"), "utf8"));
const syncProblems = checkScenes(script);
if (syncProblems.length) {
  console.error(`Sync check failed for ${script.id}:\n  ${syncProblems.join("\n  ")}\nAdd a [[n]] cue marker for every on-screen item (no marker = the item pops up on a guess).`);
  process.exit(1);
}
const buildDir = path.join(contentDir, "build", script.id);
const { totalSeconds, timings } = JSON.parse(readFileSync(path.join(buildDir, `${script.id}.timings.json`), "utf8"));

mkdirSync(path.join(videoDir, "public"), { recursive: true });
mkdirSync(path.join(videoDir, "out"), { recursive: true });
copyFileSync(path.join(buildDir, `${script.id}.mp3`), path.join(videoDir, "public", `${script.id}.mp3`));
// Photos used by "photo" scenes live in content/assets/photos (with credits.json); Remotion serves them from public/.
const photoSource = path.join(contentDir, "assets", "photos");
if (existsSync(photoSource)) {
  mkdirSync(path.join(videoDir, "public", "photos"), { recursive: true });
  for (const file of readdirSync(photoSource)) if (/\.(jpe?g|png|webp)$/i.test(file)) copyFileSync(path.join(photoSource, file), path.join(videoDir, "public", "photos", file));
}

const props = {
  audio: `${script.id}.mp3`,
  totalSeconds,
  scenes: timings.map((t) => {
    const scene = script.scenes.find((s) => s.id === t.id);
    return { ...t, visual: scene.visual, subtitles: scene.subtitles };
  }),
  lessonLabel: chapter.videoLabel ?? `Lektion ${chapter.id}`,
  lessonTitle: chapter.title.replace(/\s*\(.*\)$/, ""),
};
const propsFile = path.join(videoDir, "out", `${script.id}.props.json`);
writeFileSync(propsFile, JSON.stringify(props));

const run = (args) => execFileSync("npx", ["remotion", ...args], { cwd: videoDir, stdio: "inherit" });

if (stills) {
  for (const t of timings) {
    const frame = Math.round((t.start + (t.end - t.start) * 0.85) * 30);
    run(["still", "src/index.ts", "HookVideo", path.join("out", `${script.id}-${t.id}.png`), `--frame=${frame}`, `--props=${propsFile}`]);
  }
} else {
  const outFile = path.join(buildDir, "hook-video.mp4");
  run(["render", "src/index.ts", "HookVideo", outFile, `--props=${propsFile}`]);
  console.log(`-> ${outFile}`);
}
