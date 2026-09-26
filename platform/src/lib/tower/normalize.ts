import type { Scenario } from "./scenarios";

// Speech recognition garbles accents and names ("Old Time Ground" for "Waldheim Ground", "... Papa Cool" for
// "... Papa Kilo"). Before a transmission is judged, the parts we know for certain are repaired in code, so neither the
// AI nor the feedback ever sees them as mistakes. Content that is really missing is left alone.

const plain = (w: string) => w.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");
const trailing = (w: string) => w.match(/[^\p{L}\p{N}]+$/u)?.[0] ?? "";

// The callsign is a run of ICAO words. If most words of some run match the expected callsign in position, the whole
// run is taken as the callsign ("Delta Echo Whiskey Papa Cool" -> "Delta Echo Whiskey Papa Victor").
function fixCallsign(words: string[], callsign: string): string[] {
  const expected = callsign.split(" ");
  const n = expected.length;
  const exp = expected.map(plain);
  const stripped = words.map(plain);
  const need = Math.ceil(n * 0.6);
  let best = { at: -1, score: 0 };
  for (let i = 0; i + n <= words.length; i++) {
    const score = exp.filter((e, j) => stripped[i + j] === e).length;
    if (score > best.score) best = { at: i, score };
  }
  if (best.at < 0 || best.score < need || best.score === n) return words;
  const out = [...words];
  const end = best.at + n - 1;
  const tail = trailing(words[end]);
  for (let j = 0; j < n; j++) out[best.at + j] = expected[j] + (j === n - 1 ? tail : "");
  return out;
}

// "<something> Turm/Tower/..." at the start of a call: whatever stands in front of the station word is the aerodrome
// name, so a misheard one is replaced by the real name. A missing name is not invented.
function fixStation(words: string[], aerodrome: string, stations: string[]): string[] {
  const limit = Math.min(words.length, 7);
  for (let k = 1; k < limit; k++) {
    if (!stations.includes(plain(words[k]))) continue;
    let from = k;
    while (from > 0 && k - from < 3 && !/[,;.:]$/.test(words[from - 1])) from--;
    if (from === k) return words;
    const current = plain(words.slice(from, k).join(""));
    if (current === plain(aerodrome)) return words;
    return [...words.slice(0, from), aerodrome, ...words.slice(k)];
  }
  return words;
}

export function normalizeTranscript(text: string, s: Scenario): string {
  let words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return text;
  words = fixCallsign(words, s.info.callsign);
  const stations = s.language === "de" ? ["turm", "rollkontrolle"] : ["tower", "ground"];
  words = fixStation(words, s.info.aerodrome, stations);
  return words.join(" ");
}
