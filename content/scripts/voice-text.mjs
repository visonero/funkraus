// Prepares text for the voice: glossary, digits -> German number words, abbreviations -> configured style.
// Shared by generate-audio.mjs and the audition/test scripts so they behave identically.

export function createTextPreparer(voiceConfig, overrides = {}) {
  const pronunciations = Object.entries(voiceConfig.pronunciations ?? {}).filter(([word]) => !word.startsWith("_"));
// 1. glossary (voices.json "pronunciations"): whole-word replacements, case-insensitive
// 2. digits -> German number words (the voice reads raw digits unpredictably)
// 3. remaining ALL-CAPS abbreviations -> spelled out in the configured style
// Anything still risky afterwards is reported by lintSpoken().
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const keepAsWord = new Set((voiceConfig.keepAsWord ?? []).map((w) => w.toUpperCase()));
  const abbreviationStyle = overrides.abbreviationStyle ?? voiceConfig.abbreviationStyle ?? "spaced";
const LETTER_NAMES = {
  A: "A", B: "Be", C: "Ze", D: "De", E: "E", F: "Ef", G: "Ge", H: "Ha", I: "I", J: "Jott", K: "Ka", L: "El", M: "Em",
  N: "En", O: "O", P: "Pe", Q: "Ku", R: "Er", S: "Es", T: "Te", U: "U", V: "Fau", W: "We", X: "Iks", Y: "Ypsilon", Z: "Zett",
  Ä: "Ä", Ö: "Ö", Ü: "Ü",
};

function applyGlossary(text) {
  return pronunciations.reduce(
    (result, [word, replacement]) =>
      result.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(word)}(?![\\p{L}\\p{N}])`, "giu"), (match) =>
        /^\p{Lu}/u.test(match) ? replacement[0].toUpperCase() + replacement.slice(1) : replacement,
      ),
    text,
  );
}

const ONES = ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
const TENS = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
function belowHundred(n) {
  if (n < 20) return ONES[n];
  const unit = n % 10;
  return (unit ? `${ONES[unit]}und` : "") + TENS[Math.floor(n / 10)];
}
function belowThousand(n) {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return (hundreds ? `${ONES[hundreds]}hundert` : "") + (rest || !hundreds ? belowHundred(rest) : "");
}
function numberToGerman(n) {
  if (n === 0) return "null";
  if (n === 1000) return "tausend";
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  return (thousands ? `${ONES[thousands]}tausend` : "") + (rest ? belowThousand(rest) : "");
}
const digitWords = (digits) => [...digits].map((d) => (d === "2" ? "zwei" : ONES[Number(d)])).join(" ");

function spellNumbers(text) {
  return text
    .replace(/(?<![\p{L}\p{N}])(\d{1,2}):(\d{2})(?:\s+Uhr)?(?![\p{L}\p{N}])/gu, (_, h, m) => `${numberToGerman(Number(h))} Uhr ${Number(m) ? numberToGerman(Number(m)) : ""}`.trim())
    .replace(/(?<![\p{L}\p{N}])(\d{1,4}),(\d+)(?![\p{L}\p{N}])/gu, (_, whole, decimals) => `${numberToGerman(Number(whole))} Komma ${digitWords(decimals)}`)
    .replace(/(?<![\p{L}\p{N}])(\d{1,4})(?![\p{L}\p{N}])/gu, (_, n) => numberToGerman(Number(n)));
}

function spellAbbreviations(text) {
  return text.replace(/(?<![\p{L}\p{N}])[A-ZÄÖÜ]{2,6}(?![\p{L}\p{N}])/gu, (token) => {
    if (keepAsWord.has(token)) return token;
    if (abbreviationStyle === "plain") return token;
    if (abbreviationStyle === "names") return [...token].map((c) => LETTER_NAMES[c] ?? c).join("-");
    return [...token].join(" ");
  });
}

function applyPronunciations(text) {
  return spellAbbreviations(spellNumbers(applyGlossary(text)));
}

// Anything left that the voice could misread: digits glued to letters, unknown mixed tokens.
function lintSpoken(spoken) {
  return [...spoken.matchAll(/[\p{L}\p{N}][\p{L}\p{N}\-/]*\d[\p{L}\p{N}\-/]*|\d[\p{L}\p{N}\-/]*[\p{L}][\p{L}\p{N}\-/]*/gu)].map((m) => m[0]);
}


  return { applyPronunciations, lintSpoken };
}
