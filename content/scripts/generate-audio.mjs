#!/usr/bin/env node
// Turns a chapter audio script into an MP3 plus a timings file.
//
//   node content/scripts/generate-audio.mjs <script.json> [--engine say|elevenlabs]
//
// Script formats:
//   { id, segments: [ { voice, text } | { pause: seconds } ] }   -> audio drill
//   { id, scenes:   [ { id, voice, text } ] }                    -> video narration (one clip per scene)
//
// Engines:
//   say         macOS voices, free, only for testing the pipeline
//   elevenlabs  real voices; needs ELEVENLABS_API_KEY and voice_id per voice in content/voices.json
//
// Output goes to content/build/<id>/ (<id>.mp3, <id>.timings.json). Speech clips are cached by
// content hash, so re-running only pays ElevenLabs credits for text that changed.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videoDir = path.join(contentDir, "video");
const SAMPLE_RATE = 24000;
const SCENE_GAP_SECONDS = 0.5;

const args = process.argv.slice(2);
const scriptPath = args.find((a) => !a.startsWith("--"));
const engine = args.includes("--engine") ? args[args.indexOf("--engine") + 1] : "say";
if (!scriptPath || !["say", "elevenlabs"].includes(engine)) {
  console.error("Usage: generate-audio.mjs <script.json> [--engine say|elevenlabs]");
  process.exit(1);
}

const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const voices = JSON.parse(readFileSync(path.join(contentDir, "voices.json"), "utf8")).voices;
const outDir = path.join(contentDir, "build", script.id);
const cacheDir = path.join(contentDir, "build", "cache");
mkdirSync(outDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

function wavToPcm(buf) {
  let offset = 12;
  while (offset < buf.length - 8) {
    const id = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === "data") return buf.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + (size % 2);
  }
  throw new Error("No data chunk in WAV");
}

function pcmToWav(pcm) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

const silence = (seconds) => Buffer.alloc(Math.round(seconds * SAMPLE_RATE) * 2);
const seconds = (pcm) => pcm.length / 2 / SAMPLE_RATE;

async function speak(voiceName, text) {
  const voice = voices[voiceName];
  if (!voice) throw new Error(`Unknown voice "${voiceName}" in voices.json`);
  const key = createHash("sha1").update(JSON.stringify([engine, voice[engine], text])).digest("hex");
  const cacheFile = path.join(cacheDir, `${key}.pcm`);
  if (existsSync(cacheFile)) return readFileSync(cacheFile);

  let pcm;
  if (engine === "say") {
    const tmp = path.join(cacheDir, `${key}.tmp.wav`);
    execFileSync("say", ["-v", voice.say, "--file-format=WAVE", `--data-format=LEI16@${SAMPLE_RATE}`, "-o", tmp, "--", text]);
    pcm = wavToPcm(readFileSync(tmp));
    unlinkSync(tmp);
  } else {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const { voice_id, model_id, stability, similarity_boost } = voice.elevenlabs ?? {};
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");
    if (!voice_id) throw new Error(`No elevenlabs.voice_id for voice "${voiceName}" in voices.json`);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=pcm_${SAMPLE_RATE}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id, voice_settings: { stability, similarity_boost } }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    pcm = Buffer.from(await res.arrayBuffer());
  }
  writeFileSync(cacheFile, pcm);
  return pcm;
}

const parts = [];
const timings = [];
let cursor = 0;

const add = (pcm, meta) => {
  if (meta) timings.push({ ...meta, start: +cursor.toFixed(3), end: +(cursor + seconds(pcm)).toFixed(3) });
  parts.push(pcm);
  cursor += seconds(pcm);
};

if (script.scenes) {
  for (const [i, scene] of script.scenes.entries()) {
    add(await speak(scene.voice, scene.text), { id: scene.id });
    if (i < script.scenes.length - 1) add(silence(SCENE_GAP_SECONDS));
  }
} else {
  for (const seg of script.segments) {
    if (seg.pause) add(silence(seg.pause));
    else add(await speak(seg.voice, seg.text), { text: seg.text });
  }
}

const wavPath = path.join(outDir, `${script.id}.wav`);
const mp3Path = path.join(outDir, `${script.id}.mp3`);
writeFileSync(wavPath, pcmToWav(Buffer.concat(parts)));
execFileSync(
  "npx",
  ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", wavPath, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-codec:a", "libmp3lame", "-b:a", "96k", "-ac", "1", "-ar", "44100", mp3Path],
  { cwd: videoDir, stdio: "inherit" },
);
writeFileSync(path.join(outDir, `${script.id}.timings.json`), JSON.stringify({ engine, totalSeconds: +cursor.toFixed(3), timings }, null, 1));

const chars = (script.scenes ?? script.segments).reduce((n, s) => n + (s.text?.length ?? 0), 0);
console.log(`${script.id}: ${cursor.toFixed(1)}s, ${chars} characters, engine=${engine} -> ${path.relative(process.cwd(), mp3Path)}`);
