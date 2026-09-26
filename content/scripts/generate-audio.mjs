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

// Spelled-out words the voice sometimes drags out ("Kah Ih" for KI -> "AAKAAII"): voices.json "maxWordSeconds"
// ({ "Kah Ih": 0.5 }). A scene is re-taken (up to 8 takes) until every such word is short enough; the best take is kept.
const maxWordSeconds = Object.entries(voiceConfig.maxWordSeconds ?? {});
function worstOverrun(spoken, alignment) {
  const chars = alignment?.characters;
  if (!chars || !maxWordSeconds.length) return 0;
  const text = chars.join("");
  let worst = 0;
  for (const [word, limit] of maxWordSeconds) {
    for (let i = text.indexOf(word); i !== -1; i = text.indexOf(word, i + 1)) {
      const span = alignment.character_end_times_seconds[i + word.length - 1] - alignment.character_start_times_seconds[i];
      worst = Math.max(worst, span / limit);
    }
  }
  return worst;
}
async function synthesizeSceneTake(voice, spoken, options) {
  let best = null;
  let bestOver = Infinity;
  for (let attempt = 1; attempt <= 8; attempt++) {
    const take = await synthesizeVerified(voice, spoken, options);
    // Extra audio after the last spoken character is the voice mumbling a stray syllable ("Uhr" after "Instrumentenflugregeln").
    const ends = take.alignment?.character_end_times_seconds;
    const trailing = ends?.length ? Math.max(0, take.pcm.length / 2 / SAMPLE_RATE - ends[ends.length - 1]) : 0;
    const over = Math.max(worstOverrun(spoken, take.alignment), trailing / 0.4);
    if (over < bestOver) {
      best = take;
      bestOver = over;
    }
    if (over <= 1) break;
    console.warn(`  a stray sound or an overlong spelled-out word in "${spoken.slice(0, 40)}…" (${over.toFixed(2)}x the limit), taking another take (${attempt}/8)`);
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
// Radio sound of the course's KI-Tower (platform/src/components/app/TowerPractice.tsx playRadio()): high-pass 380 Hz,
// low-pass 3100 Hz, waveshaper distortion, hiss and a squelch click before and after the voice. Reproduced here so
// the tower in the video sounds exactly like the tower in the course. Voices with "radio": true in voices.json.
function applyRadio(pcm) {
  const fs = SAMPLE_RATE;
  const voiceIn = new Float32Array(pcm.length / 2);
  for (let i = 0; i < voiceIn.length; i++) voiceIn[i] = pcm.readInt16LE(i * 2) / 32768;

  const biquad = (type, freq, qDb, input) => {
    const q = 10 ** (qDb / 20);
    const w0 = (2 * Math.PI * freq) / fs;
    const alpha = Math.sin(w0) / (2 * q);
    const cos = Math.cos(w0);
    const [b0, b1, b2] = type === "highpass" ? [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2] : [(1 - cos) / 2, 1 - cos, (1 - cos) / 2];
    const a0 = 1 + alpha, a1 = -2 * cos, a2 = 1 - alpha;
    const out = new Float32Array(input.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < input.length; i++) {
      const x = input[i];
      const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      out[i] = y;
    }
    return out;
  };

  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + 9) * x * 20 * (Math.PI / 180)) / (Math.PI + 9 * Math.abs(x));
  }
  const shaped = biquad("lowpass", 3100, 1, biquad("highpass", 380, 1, voiceIn)).map((x) => {
    const v = ((n - 1) / 2) * (Math.max(-1, Math.min(1, x)) + 1);
    const k = Math.min(n - 2, Math.floor(v));
    return (curve[k] + (v - k) * (curve[k + 1] - curve[k])) * 0.85;
  });

  let seed = 20260926;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const start = 0.05, voiceAt = 0.17;
  const total = Math.round((voiceAt + shaped.length / fs + 0.03 + 0.09 + 0.05) * fs);
  const mix = new Float32Array(total);
  const noise = (from, seconds, volume) => {
    const a = Math.round(from * fs);
    const b = Math.min(total, a + Math.round(seconds * fs));
    for (let i = a; i < b; i++) mix[i] += (rand() * 2 - 1) * volume;
  };
  noise(start, 0.07, 0.09); // squelch click
  noise(start, shaped.length / fs + 0.5, 0.012); // hiss
  noise(voiceAt + shaped.length / fs + 0.03, 0.09, 0.09); // release click
  const offset = Math.round(voiceAt * fs);
  for (let i = 0; i < shaped.length; i++) mix[offset + i] += shaped[i];

  // The browser plays this at the system volume; here the mix is brought to the loudness of the narration.
  let peak = 0;
  for (const v of mix) peak = Math.max(peak, Math.abs(v));
  const scale = peak > 0 ? 0.36 / peak : 1;
  const out = Buffer.alloc(total * 2);
  for (let i = 0; i < total; i++) out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i] * scale)) * 32767), i * 2);
  return { pcm: out, pre: voiceAt };
}

// leadIn (seconds, optional): silence before the speech, e.g. so an on-screen item can appear before the voice starts.
// With a lead-in, the first cue marker at the very start of the text lands in that silence (not on the first word).
async function speakScene(voiceName, displayTextWithCues, leadIn = 0) {
  const voice = voiceFor(voiceName);

  // Split "…[[0]]text…" into spoken text and the character offset of each cue. "[[p:0.6]]" is a pause of 0.6 s at that
  // point: it is not spoken, the silence is cut into the finished audio (so changing a pause never costs new credits).
  const pieces = displayTextWithCues.split(/\[\[(\d+|p:[\d.]+)\]\]/);
  let spoken = "";
  let display = "";
  const cueOffsets = [];
  const pauses = [];
  for (let i = 0; i < pieces.length; i++) {
    if (i % 2 === 0) {
      spoken += applyPronunciations(pieces[i]);
      display += pieces[i];
    } else if (pieces[i].startsWith("p:")) {
      pauses.push({ offset: spoken.length, seconds: Number(pieces[i].slice(2)) });
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
    ({ pcm, alignment } = await synthesizeSceneTake(voice, spoken, { timestamps: true, speed }));
    writeFileSync(pcmFile, pcm);
    writeFileSync(alignFile, JSON.stringify(alignment));
  }

  let pcmOut = pcm;
  const duration = seconds(pcm);
  const starts = alignment?.character_start_times_seconds;
  const ends = alignment?.character_end_times_seconds;
  const aligned = Array.isArray(starts) && starts.length === spoken.length;
  if (engine === "elevenlabs" && !aligned) console.warn(`  warning: no exact alignment for scene "${spoken.slice(0, 40)}…", using estimated timings`);

  const rawTimeAt = (index, edge) => {
    if (aligned) return (edge === "end" ? ends : starts)[Math.max(0, Math.min(index, spoken.length - 1))];
    return (index / Math.max(1, spoken.length)) * duration;
  };
  // Pause insertion points (seconds in the raw clip): in the gap between the last spoken character before the marker
  // and the next one after it.
  const gaps = pauses
    .map((pz) => {
      let before = Math.min(pz.offset, spoken.length) - 1;
      while (before > 0 && /\s/.test(spoken[before])) before--;
      let after = Math.min(pz.offset, spoken.length - 1);
      while (after < spoken.length - 1 && /\s/.test(spoken[after])) after++;
      const at = pz.offset >= spoken.length ? duration : (rawTimeAt(before, "end") + rawTimeAt(after, "start")) / 2;
      return { at, seconds: pz.seconds };
    })
    .sort((a, b) => a.at - b.at);
  const shiftBy = (t) => gaps.reduce((sum, g) => (g.at <= t ? sum + g.seconds : sum), 0);
  const timeAt = (index, edge) => {
    const t = rawTimeAt(index, edge);
    // a cue that sits exactly on a pause marker appears after the pause (the word it points at follows it)
    return t + shiftBy(edge === "start" ? t + 0.001 : t - 0.001);
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

  if (gaps.length) {
    const parts = [];
    let from = 0;
    for (const g of gaps) {
      const cut = Math.round(g.at * SAMPLE_RATE) * 2;
      parts.push(pcm.subarray(from, cut), silence(g.seconds));
      from = cut;
    }
    parts.push(pcm.subarray(from));
    pcmOut = Buffer.concat(parts);
  }
  let pre = 0;
  if (voice.radio) ({ pcm: pcmOut, pre } = applyRadio(pcmOut));
  const total = leadIn + pre;
  if (total > 0) {
    const shift = (t) => +(t + total).toFixed(3);
    const firstAtStart = cueOffsets.findIndex((o) => o === 0);
    return {
      pcm: Buffer.concat([silence(leadIn), pcmOut]),
      cues: cues.map((c, i) => (c === null ? null : i === firstAtStart && leadIn > 0 ? +Math.min(0.5, leadIn / 2).toFixed(3) : shift(c))),
      sentences: sentences.map((x) => ({ ...x, start: shift(x.start), end: shift(x.end) })),
    };
  }
  return { pcm: pcmOut, cues, sentences };
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
