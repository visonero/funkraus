import type { ReadbackSpec } from "./scenarios";

// Read-backs are checked in plain code, not by the AI: they only repeat numbers and fixed phrases from the
// controller's instruction, so a deterministic check is exact, free of cost and can never invent a mistake.
// Numbers may be spoken as words, written as digits, or in ICAO style ("tree", "fife", "niner").

const WORD_DIGITS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", tree: "3", four: "4", fower: "4", five: "5", fife: "5", six: "6", seven: "7", eight: "8", nine: "9", niner: "9",
  null: "0", eins: "1", ein: "1", zwei: "2", zwo: "2", drei: "3", vier: "4", fünf: "5", funf: "5", sechs: "6", sieben: "7", acht: "8", neun: "9",
};
// Speech recognition sometimes writes number words as look-alikes; these only count next to another number.
const SOUND_ALIKES: Record<string, string> = { to: "2", too: "2", for: "4", fore: "4", won: "1", ate: "8" };
const TENS: Record<string, string> = { ten: "10", twenty: "20", thirty: "30", forty: "40" };

const isNumberToken = (t: string) => /^\d+$/.test(t) || t in WORD_DIGITS;

// Text -> tokens where every run of digits/number words is one number token ("three six" -> "36").
export function tokenize(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/take-?off/g, "take off")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter(Boolean);
  const out: string[] = [];
  let run = "";
  let afterTensWord = false; // the run so far is a single tens word ("twenty"), so a following digit completes it
  const flush = () => {
    if (run) out.push(run);
    run = "";
    afterTensWord = false;
  };
  raw.forEach((t, i) => {
    const near = (j: number) => raw[j] !== undefined && (isNumberToken(raw[j]) || raw[j] in TENS);
    let digit: string | undefined = /^\d+$/.test(t) ? t : WORD_DIGITS[t];
    let tens = false;
    if (digit === undefined && t in SOUND_ALIKES && (near(i - 1) || near(i + 1))) digit = SOUND_ALIKES[t];
    if (digit === undefined && t in TENS) {
      digit = TENS[t];
      tens = true;
    }
    if (digit === undefined) {
      flush();
      out.push(t);
      return;
    }
    // "twenty four" -> 24: a tens word followed by a single digit merges into one number.
    if (afterTensWord && digit.length === 1) {
      run = run[0] + digit;
      afterTensWord = false;
    } else {
      if (tens && run) flush();
      run += digit;
      afterTensWord = tens;
    }
  });
  flush();
  return out;
}

const squash = (text: string) => text.toLowerCase().replace(/take-?off/g, "takeoff").replace(/[^\p{L}\p{N}]+/gu, "");

export type ReadbackResult = { ok: boolean; missing: string[] };

// Callsign: the whole callsign, or at least its last two words (abbreviated callsign after first contact).
function hasCallsign(text: string, callsign: string): boolean {
  const words = callsign.toLowerCase().split(" ");
  const flat = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ")} `;
  return flat.includes(` ${words.join(" ")} `) || flat.includes(` ${words.slice(-2).join(" ")} `);
}

export function checkReadback(text: string, spec: ReadbackSpec, callsign: string): ReadbackResult {
  const tokens = tokenize(text);
  const flat = squash(text);
  const missing: string[] = [];
  for (const item of spec.items) {
    const present = item.number ? tokens.includes(item.number) : (item.anyPhrase ?? []).some((p) => flat.includes(squash(p)));
    if (!present) missing.push(item.label);
  }
  if (!hasCallsign(text, callsign)) missing.push("Rufzeichen");
  return { ok: missing.length === 0, missing };
}
