#!/usr/bin/env node
// Renders still frames of one scene visual without any narration, to check layout and animation.
//
//   node content/scripts/preview-visual.mjs '<visual json>' --cues 0.5,4,8 --duration 14 --times 1,5,9,13 [--name test]
//
// Stills land in content/video/out/preview-<name>-<time>.png. The subtitle is not drawn.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videoDir = path.join(contentDir, "video");
const arg = (flag, fallback) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : fallback);
const visualArg = process.argv[2];
const visual = JSON.parse(existsSync(visualArg) ? (await import("node:fs")).readFileSync(visualArg, "utf8") : visualArg);
const cues = arg("--cues", "0.5,4,8").split(",").map(Number);
const duration = Number(arg("--duration", "14"));
const times = arg("--times", "3,7,11,13").split(",").map(Number);
const name = arg("--name", "test");

mkdirSync(path.join(videoDir, "public"), { recursive: true });
mkdirSync(path.join(videoDir, "out"), { recursive: true });
const anyMp3 = readdirSync(path.join(contentDir, "build", "cache")).find(() => false);
const audio = "preview-silence.mp3";
if (!existsSync(path.join(videoDir, "public", audio))) {
  execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "2", "-codec:a", "libmp3lame", path.join("public", audio)], { cwd: videoDir, stdio: "inherit" });
}
const props = {
  audio,
  totalSeconds: duration,
  scenes: [{ id: "preview", start: 0, end: duration, visual, cues, sentences: [] }],
  lessonLabel: "Lektion",
  lessonTitle: "Vorschau",
};
const propsFile = path.join(videoDir, "out", `preview-${name}.props.json`);
writeFileSync(propsFile, JSON.stringify(props));
for (const t of times) {
  const out = path.join("out", `preview-${name}-${t}.png`);
  execFileSync("npx", ["remotion", "still", "src/index.ts", "HookVideo", out, `--frame=${Math.round(t * 30)}`, `--props=${propsFile}`, "--log=error"], { cwd: videoDir, stdio: "inherit" });
  console.log(`-> content/video/${out}`);
}
