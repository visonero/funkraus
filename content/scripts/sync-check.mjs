#!/usr/bin/env node
// Checks that every on-screen item of a video has its own cue marker in the narration, so nothing can pop up
// before the narrator says it. Used by render-hook-video.mjs (blocks the render) and runnable on its own:
//
//   node content/scripts/sync-check.mjs [<chapter-dir> ...]      (default: every chapter under content/modules)

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function itemCount(visual) {
  switch (visual.kind) {
    case "headline":
    case "transform":
      return visual.tiles.length;
    case "grid":
      return visual.items.length;
    case "layers":
      return visual.layers.length;
    case "outro":
      return visual.pills.length;
    case "diagram":
    case "photo":
      return visual.steps.length;
    case "dialog":
      return visual.lines.length;
    case "glyphs":
      return visual.items.length;
    default:
      return 0;
  }
}

// Returns a list of problems for one video script (empty list = in sync).
export function checkScenes(script) {
  const problems = [];
  for (const scene of script.scenes) {
    const markers = [...scene.text.matchAll(/\[\[(\d+)\]\]/g)].map((m) => Number(m[1]));
    const items = itemCount(scene.visual);
    if (!items) continue;
    const label = `scene "${scene.id}"`;
    for (let i = 0; i < items; i++) {
      if (!markers.includes(i)) problems.push(`${label}: item ${i + 1} of ${items} has no cue marker [[${i}]], it would appear on a guess`);
    }
    for (const m of markers) if (m >= items) problems.push(`${label}: cue marker [[${m}]] but only ${items} items on screen`);
    const order = markers.filter((m) => m < items);
    if (order.join() !== [...order].sort((a, b) => a - b).join()) problems.push(`${label}: cue markers are not in increasing order (${markers.join(", ")})`);
  }
  return problems;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  let dirs = process.argv.slice(2).map((d) => path.resolve(d));
  if (!dirs.length) {
    const modulesDir = path.join(contentDir, "modules");
    for (const mod of readdirSync(modulesDir)) {
      const modPath = path.join(modulesDir, mod);
      if (!existsSync(path.join(modPath, "module.json"))) continue;
      for (const chapter of readdirSync(modPath)) if (existsSync(path.join(modPath, chapter, "hook-video.json"))) dirs.push(path.join(modPath, chapter));
    }
  }
  let bad = 0;
  for (const dir of dirs) {
    const problems = checkScenes(JSON.parse(readFileSync(path.join(dir, "hook-video.json"), "utf8")));
    if (problems.length) {
      bad++;
      console.log(`${path.basename(dir)}\n  ${problems.join("\n  ")}`);
    }
  }
  console.log(bad ? `\n${bad} video(s) with sync problems` : `All ${dirs.length} videos: every item has its cue marker.`);
  process.exit(bad ? 1 : 0);
}
