#!/usr/bin/env node
// Prints how sample sentences are prepared for the voice and (with --generate) creates an audition MP3
// that plays the same sentences in every abbreviation style, so the styles can be compared by ear.
//
//   node --env-file=platform/.env.local content/scripts/voice-audition.mjs [--generate]

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTextPreparer } from "./voice-text.mjs";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const voiceConfig = JSON.parse(readFileSync(path.join(contentDir, "voices.json"), "utf8"));
const voice = voiceConfig.voices.trainer.elevenlabs;
const SAMPLE_RATE = 24000;

const abbreviations = "Die Kontrollzone heißt CTR. Für VFR-Flüge und IFR-Flüge gilt: Stelle das QNH ein. Auf der Karte findest du UKW, ATIS und das BZF.";
const numbers = "In 4000 ft über Grund liegt FL 100, dazu 1700 ft und 118,7 MHz. Um 13:18 Uhr meldet der METAR Sicht 9999 und SCT040.";
const styles = ["spaced", "names", "plain"];

for (const style of styles) {
  const { applyPronunciations, lintSpoken } = createTextPreparer(voiceConfig, { abbreviationStyle: style });
  console.log(`\n[${style}]\n  ${applyPronunciations(abbreviations)}`);
  if (style === styles[0]) console.log(`  numbers -> ${applyPronunciations(numbers)}\n  lint: ${lintSpoken(applyPronunciations(numbers)).join(", ") || "clean"}`);
}
if (!process.argv.includes("--generate")) process.exit(0);

async function speak(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}?output_format=pcm_${SAMPLE_RATE}`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: voice.model_id, voice_settings: { stability: voice.stability, similarity_boost: voice.similarity_boost, speed: voice.video_speed } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}
const silence = (s) => Buffer.alloc(Math.round(s * SAMPLE_RATE) * 2);

const parts = [];
const labels = { spaced: "Variante A", names: "Variante B", plain: "Variante C" };
for (const style of styles) {
  const { applyPronunciations } = createTextPreparer(voiceConfig, { abbreviationStyle: style });
  parts.push(await speak(`${labels[style]}.`), silence(0.7), await speak(applyPronunciations(abbreviations)), silence(1.6));
}
parts.push(await speak("Jetzt die Zahlen."), silence(0.7), await speak(createTextPreparer(voiceConfig).applyPronunciations(numbers)), silence(0.5));

const outDir = path.join(contentDir, "build", "audition");
mkdirSync(outDir, { recursive: true });
const pcm = Buffer.concat(parts);
const header = Buffer.alloc(44);
header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVEfmt ", 8); header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22); header.writeUInt32LE(SAMPLE_RATE, 24); header.writeUInt32LE(SAMPLE_RATE * 2, 28);
header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
writeFileSync(path.join(outDir, "audition.wav"), Buffer.concat([header, pcm]));
execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", path.join(outDir, "audition.wav"), "-codec:a", "libmp3lame", "-b:a", "96k", path.join(outDir, "abbreviation-audition.mp3")], { cwd: path.join(contentDir, "video"), stdio: "inherit" });
console.log("-> content/build/audition/abbreviation-audition.mp3");
