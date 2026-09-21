#!/usr/bin/env node
// One-time migration: applies the pronunciation fixes that need NEW audio (so they wait for ElevenLabs credits).
//
//   node content/scripts/pending-voice-fixes.mjs [--modules <dir>] [--voices <voices.json>]
//
//  1. voices.json: "zwo" is written as "zwo-" (stable pronunciation), VOR/OBS are spelled out, TO/FROM are read as the
//     English words, and "verifyWords": ["zwo"] makes generate-audio re-take any clip in which speech-to-text does not
//     hear every "zwo".
//  2. Scripts: radio digit strings use "zwo" everywhere (never "zwei"), and lesson 4.5 explains that TO and FROM are the
//     English words for "nach" and "von".
// Afterwards rebuild the affected lessons with build-chapter.mjs --import (see `generate-audio.mjs --plan` for the cost).

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (flag, fallback) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : fallback);
const modulesDir = path.resolve(arg("--modules", path.join(contentDir, "modules")));
const voicesFile = path.resolve(arg("--voices", path.join(contentDir, "voices.json")));

const voices = JSON.parse(readFileSync(voicesFile, "utf8"));
voices.pronunciations.zwo = "zwo-";
voices.pronunciationsExact = {
  _comment: "Case-sensitive whole words. VOR is spelled out (the ordinary word 'vor' is untouched); TO and FROM are the English words on the VOR display (to = nach, from = von).",
  VOR: "Vau Oh Er",
  OBS: "Oh Be Es",
  TO: "Tu",
  FROM: "Fromm",
};
voices.verifyWords = ["zwo"];
writeFileSync(voicesFile, JSON.stringify(voices, null, 1));
console.log(`updated ${path.relative(process.cwd(), voicesFile)}`);

const pairs = [
  ["Komma zwei acht", "Komma zwo acht"],
  ["Kurs zwei sieben null Grad", "Kurs zwo sieben null Grad"],
  ["Komma zwei Hektopascal", "Komma zwo Hektopascal"],
  ["Bezugspeilung von null zwei fünf", "Bezugspeilung von null zwo fünf"],
];
let edits = 0;
for (const mod of readdirSync(modulesDir)) {
  if (!existsSync(path.join(modulesDir, mod, "module.json"))) continue;
  for (const chapter of readdirSync(path.join(modulesDir, mod))) {
    for (const file of ["hook-video.json", "audio-drill.json"]) {
      const target = path.join(modulesDir, mod, chapter, file);
      if (!existsSync(target)) continue;
      const script = JSON.parse(readFileSync(target, "utf8"));
      let changed = false;
      for (const item of script.scenes ?? script.segments ?? []) {
        if (typeof item.text !== "string") continue;
        for (const [from, to] of pairs) {
          if (item.text.includes(from)) {
            item.text = item.text.replaceAll(from, to);
            changed = true;
            edits++;
          }
        }
        if (file === "hook-video.json" && item.id === "tofrom" && chapter.startsWith("4.5")) {
          item.text =
            "Dazu kommt die Anzeige mit zwei englischen Wörtern: TO und FROM. TO heißt auf Deutsch nach, FROM heißt von. " +
            "[[0]]TO zeigt: Mit diesem Kurs fliegst du zur Station hin. [[1]]FROM zeigt: Du fliegst von ihr weg. " +
            "[[2]]Beim Überfliegen der Station wechselt die Anzeige von TO auf FROM. Kurz davor erscheint oft die OFF-Flagge. Das ist kein Defekt, denn du bist wahrscheinlich gerade über der Station.";
          changed = true;
          edits++;
        }
      }
      if (changed) writeFileSync(target, JSON.stringify(script, null, 2));
    }
  }
}
console.log(`edited ${edits} script texts`);
