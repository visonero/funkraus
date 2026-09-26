#!/usr/bin/env node
// Turns a chapter audio script into an MP3 plus a timings file.
//
//   node content/scripts/generate-audio.mjs <script.json> [--engine say|elevenlabs]
//
// Script formats:
//   { id, segments: [ { voice, text } | { pause: seconds } ] }   -> audio drill
//   { id, scenes:   [ { id, voice, text, visual } ] }            -> video narration (one clip per scene)
//
// Video scenes may contain cue markers such as "[[0]]" in their text. A marker is not spoken; it tells the
// video which word a card/label/item should appear on. With ElevenLabs the exact word timings come from the
// API (with-timestamps), so on-screen elements are in sync with the voice. Each scene's timings also carry
// the spoken sentences (for subtitles).
//
// Engines:
//   say         macOS voices, free, only for testing the pipeline (no exact cue times)
//   elevenlabs  real voices; needs ELEVENLABS_API_KEY and voice_id per voice in content/voices.json
//
// Output goes to content/build/<id>/ (<id>.mp3, <id>.timings.json). Speech clips are cached by content
// hash, so re-running only pays ElevenLabs credits for text that changed.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTextPreparer } from "./voice-text.mjs";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videoDir = path.join(contentDir, "video");
const SAMPLE_RATE = 24000;
const SCENE_GAP_SECONDS = 0.8;

const args = process.argv.slice(2);
const scriptPath = args.find((a) => !a.startsWith("--"));
const planOnly = args.includes("--plan");
let plannedChars = 0;
const engine = args.includes("--engine") ? args[args.indexOf("--engine") + 1] : "say";
if (!scriptPath || !["say", "elevenlabs"].includes(engine)) {
  console.error("Usage: generate-audio.mjs <script.json> [--engine say|elevenlabs]");
  process.exit(1);
}

const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const voiceConfig = JSON.parse(readFileSync(process.env.VOICES_JSON ?? path.join(contentDir, "voices.json"), "utf8"));
const voices = voiceConfig.voices;
const { applyPronunciations, lintSpoken } = createTextPreparer(voiceConfig);
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

function voiceFor(voiceName) {
  const voice = voices[voiceName];
  if (!voice) throw new Error(`Unknown voice "${voiceName}" in voices.json`);
  return voice;
}

async function synthesizeElevenLabs(voice, text, { timestamps, speed }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const { voice_id, model_id, stability, similarity_boost, style, use_speaker_boost, language_code } = voice.elevenlabs ?? {};
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");
  if (!voice_id) throw new Error("No elevenlabs.voice_id in voices.json");
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}${timestamps ? "/with-timestamps" : ""}?output_format=pcm_${SAMPLE_RATE}`;
  const voice_settings = { stability, similarity_boost, ...(style !== undefined ? { style } : {}), ...(use_speaker_boost !== undefined ? { use_speaker_boost } : {}), ...(speed ? { speed } : {}) };
  // ElevenLabs answers 429 ("system busy") or 5xx under load; waiting and retrying is safe and not billed.
  let res;
  for (let attempt = 1; ; attempt++) {
    res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id, voice_settings, ...(language_code ? { language_code } : {}) }),
    });
    if (res.ok || (res.status !== 429 && res.status < 500) || attempt >= 6) break;
    const wait = 4 * 2 ** (attempt - 1);
    console.warn(`  ElevenLabs ${res.status}, retrying in ${wait}s (attempt ${attempt}/5)`);
    await new Promise((resolve) => setTimeout(resolve, wait * 1000));
  }
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  if (!timestamps) return { pcm: Buffer.from(await res.arrayBuffer()) };
  const json = await res.json();
  return { pcm: Buffer.from(json.audio_base64, "base64"), alignment: json.alignment };
}


// Words the voice is known to say inconsistently (voices.json "verifyWords", e.g. "zwo"): each generated clip is run
// through ElevenLabs speech-to-text, and the clip is regenerated (up to 4 takes) until every such word is heard.
// The best take is cached, so verified audio is never paid for twice. Disable with --no-verify.
const verifyWords = (voiceConfig.verifyWords ?? []).map((w) => w.toLowerCase());
let verifyDisabled = args.includes("--no-verify") || engine !== "elevenlabs";
const wordPattern = (word) => new RegExp(`(?<![\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "giu");
const countWords = (text) => verifyWords.reduce((n, w) => n + (text.match(wordPattern(w))?.length ?? 0), 0);

async function transcribe(pcm) {
  const form = new FormData();
  form.append("model_id", "scribe_v1");
  form.append("language_code", "deu");
  form.append("file", new Blob([pcmToWav(pcm)], { type: "audio/wav" }), "clip.wav");
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }, body: form });
  if (!res.ok) throw new Error(`speech-to-text ${res.status}`);
  return (await res.json()).text ?? "";
}

async function synthesizeVerified(voice, spoken, options) {
  const expected = verifyDisabled ? 0 : countWords(spoken);
  let best = null;
  let bestHits = -1;
  for (let attempt = 1; attempt <= (expected ? 4 : 1); attempt++) {
    const take = await synthesizeElevenLabs(voice, spoken, options);
    if (!expected) return take;
    let hits;
    try {
      hits = countWords(await transcribe(take.pcm));
    } catch (error) {
      console.warn(`  pronunciation check skipped (${error.message}); use --no-verify to silence this`);
      verifyDisabled = true;
      return take;
    }
    if (hits > bestHits) {
      best = take;
      bestHits = hits;
    }
    if (hits >= expected) break;
    console.warn(`  heard ${hits} of ${expected} expected "${verifyWords.join('", "')}" in "${spoken.slice(0, 48)}…", taking another take (${attempt}/4)`);
  }
  return best;
}

// Plain clip (audio drills): no alignment needed.
async function speak(voiceName, rawText) {
  const text = applyPronunciations(rawText);
  const risky = lintSpoken(text);
  if (risky.length) console.warn(`  lint: risky tokens in drill text (add them to the glossary): ${[...new Set(risky)].join(", ")}`);
  const voice = voiceFor(voiceName);
  // Drill clips keep their original cache key (video-only settings such as video_speed must not invalidate them).
  const { video_speed: _ignored, ...baseSettings } = voice.elevenlabs ?? {};
  const key = createHash("sha1").update(JSON.stringify([engine, engine === "elevenlabs" ? baseSettings : voice[engine], text])).digest("hex");
  const cacheFile = path.join(cacheDir, `${key}.pcm`);
  if (existsSync(cacheFile)) return readFileSync(cacheFile);
  if (planOnly) {
    plannedChars += text.length;
    return Buffer.alloc(2);
  }

  let pcm;
  if (engine === "say") {
    const tmp = path.join(cacheDir, `${key}.tmp.wav`);
    execFileSync("say", ["-v", voice.say, "--file-format=WAVE", `--data-format=LEI16@${SAMPLE_RATE}`, "-o", tmp, "--", text]);
    pcm = wavToPcm(readFileSync(tmp));
    unlinkSync(tmp);
  } else {
    ({ pcm } = await synthesizeVerified(voice, text, { timestamps: false, speed: voice.elevenlabs?.speed }));
  }
  writeFileSync(cacheFile, pcm);
  return pcm;
}

// [start, end) character ranges of the sentences in a text.
function sentenceRanges(text) {
  const ranges = [];
  const pattern = /[^.!?]*[.!?]+|[^.!?]+$/g;
  let match;
  while ((match = pattern.exec(text))) {
    const start = match.index + (match[0].length - match[0].trimStart().length);
    const end = match.index + match[0].trimEnd().length;
    if (end > start) ranges.push([start, end]);
  }
  return ranges;
}

// Video narration: returns audio plus exact cue times (seconds from clip start) and sentence timings.
// leadIn (seconds, optional): silence before the speech, e.g. so an on-screen item can appear before the voice starts.
// With a lead-in, the first cue marker at the very start of the text lands in that silence (not on the first word).
async function speakScene(voiceName, displayTextWithCues, leadIn = 0) {
  const voice = voiceFor(voiceName);

  // Split "…[[0]]text…" into spoken text and the character offset of each cue.
  const pieces = displayTextWithCues.split(/\[\[(\d+)\]\]/);
  let spoken = "";
  let display = "";
  const cueOffsets = [];
  for (let i = 0; i < pieces.length; i++) {
    if (i % 2 === 0) {
      spoken += applyPronunciations(pieces[i]);
      display += pieces[i];
    } else {
      cueOffsets[Number(pieces[i])] = spoken.length;
    }
  }

  const risky = lintSpoken(spoken);
  if (risky.length) console.warn(`  lint: risky tokens in scene text (add them to the glossary): ${[...new Set(risky)].join(", ")}`);

  const speed = voice.elevenlabs?.video_speed ?? voice.elevenlabs?.speed;
  const key = createHash("sha1").update(JSON.stringify(["scene", engine, voice[engine], speed, spoken])).digest("hex");
  const pcmFile = path.join(cacheDir, `${key}.pcm`);
  const alignFile = path.join(cacheDir, `${key}.align.json`);

  let pcm;
  let alignment = null;
  if (planOnly && !(existsSync(pcmFile) && (engine === "say" || existsSync(alignFile)))) {
    plannedChars += spoken.length;
    return { pcm: Buffer.alloc(2), cues: [], sentences: [] };
  }
  if (existsSync(pcmFile) && (engine === "say" || existsSync(alignFile))) {
    pcm = readFileSync(pcmFile);
    if (engine === "elevenlabs") alignment = JSON.parse(readFileSync(alignFile, "utf8"));
  } else if (engine === "say") {
    const tmp = path.join(cacheDir, `${key}.tmp.wav`);
    execFileSync("say", ["-v", voice.say, "--file-format=WAVE", `--data-format=LEI16@${SAMPLE_RATE}`, "-o", tmp, "--", spoken]);
    pcm = wavToPcm(readFileSync(tmp));
    unlinkSync(tmp);
    writeFileSync(pcmFile, pcm);
  } else {
    ({ pcm, alignment } = await synthesizeVerified(voice, spoken, { timestamps: true, speed }));
    writeFileSync(pcmFile, pcm);
    writeFileSync(alignFile, JSON.stringify(alignment));
  }

  const duration = seconds(pcm);
  const starts = alignment?.character_start_times_seconds;
  const ends = alignment?.character_end_times_seconds;
  const aligned = Array.isArray(starts) && starts.length === spoken.length;
  if (engine === "elevenlabs" && !aligned) console.warn(`  warning: no exact alignment for scene "${spoken.slice(0, 40)}…", using estimated timings`);

  const timeAt = (index, edge) => {
    if (aligned) return (edge === "end" ? ends : starts)[Math.max(0, Math.min(index, spoken.length - 1))];
    return (index / Math.max(1, spoken.length)) * duration;
  };
  const cues = cueOffsets.map((offset) => {
    if (offset === undefined) return null;
    let index = offset;
    while (index < spoken.length - 1 && /\s/.test(spoken[index])) index++;
    return +timeAt(index, "start").toFixed(3);
  });

  const spokenRanges = sentenceRanges(spoken);
  const displayRanges = sentenceRanges(display);
  const sentences =
    spokenRanges.length === displayRanges.length
      ? displayRanges.map(([ds, de], i) => ({
          text: display.slice(ds, de),
          start: +timeAt(spokenRanges[i][0], "start").toFixed(3),
          end: +timeAt(spokenRanges[i][1] - 1, "end").toFixed(3),
        }))
      : [{ text: display.trim(), start: 0, end: +duration.toFixed(3) }];

  if (leadIn > 0) {
    const shift = (t) => +(t + leadIn).toFixed(3);
    const firstAtStart = cueOffsets.findIndex((o) => o === 0);
    return {
      pcm: Buffer.concat([silence(leadIn), pcm]),
      cues: cues.map((c, i) => (c === null ? null : i === firstAtStart ? +Math.min(0.5, leadIn / 2).toFixed(3) : shift(c))),
      sentences: sentences.map((x) => ({ ...x, start: shift(x.start), end: shift(x.end) })),
    };
  }
  return { pcm, cues, sentences };
}

const clips = [];
const timings = [];
let cursor = 0;

const add = (pcm, meta) => {
  if (meta) timings.push({ ...meta, start: +cursor.toFixed(3), end: +(cursor + seconds(pcm)).toFixed(3) });
  clips.push(pcm);
  cursor += seconds(pcm);
};

if (script.scenes) {
  for (const [i, scene] of script.scenes.entries()) {
    const { pcm, cues, sentences } = await speakScene(scene.voice, scene.text, scene.leadIn);
    add(pcm, { id: scene.id, cues, sentences });
    if (i < script.scenes.length - 1) add(silence(SCENE_GAP_SECONDS));
  }
} else {
  for (const seg of script.segments) {
    if (seg.pause) add(silence(seg.pause));
    else add(await speak(seg.voice, seg.text), { text: seg.text });
  }
}

if (planOnly) {
  console.log(`${script.id}: would generate ${plannedChars} characters`);
  process.exit(0);
}
const wavPath = path.join(outDir, `${script.id}.wav`);
const mp3Path = path.join(outDir, `${script.id}.mp3`);
writeFileSync(wavPath, pcmToWav(Buffer.concat(clips)));
execFileSync(
  "npx",
  ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", wavPath, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-codec:a", "libmp3lame", "-b:a", "96k", "-ac", "1", "-ar", "44100", mp3Path],
  { cwd: videoDir, stdio: "inherit" },
);
writeFileSync(path.join(outDir, `${script.id}.timings.json`), JSON.stringify({ engine, totalSeconds: +cursor.toFixed(3), timings }, null, 1));

const chars = (script.scenes ?? script.segments).reduce((n, s) => n + (s.text?.replace(/\[\[\d+\]\]/g, "").length ?? 0), 0);
console.log(`${script.id}: ${cursor.toFixed(1)}s, ${chars} characters, engine=${engine} -> ${path.relative(process.cwd(), mp3Path)}`);
