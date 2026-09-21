import { measureText } from "@remotion/layout-utils";

// Text that always stays inside its box: picks the largest font size at which the text fits the box width,
// wraps it into at most `maxLines` lines and stays within `maxHeight`. Lines are broken explicitly so the
// wrapping that was measured is exactly the wrapping that is drawn.
export type FitOptions = {
  text: string;
  family: string;
  weight: number;
  maxWidth: number;
  maxHeight: number;
  maxSize: number;
  minSize: number;
  maxLines?: number;
  lineHeight?: number;
  letterSpacing?: string;
};
export type Fitted = { size: number; lines: string[]; height: number; lineHeight: number };

const cache = new Map<string, Fitted>();

function wrap(opts: FitOptions, size: number): string[] | null {
  const width = (text: string) => measureText({ text, fontFamily: opts.family, fontSize: size, fontWeight: opts.weight, letterSpacing: opts.letterSpacing }).width;
  const words = opts.text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (width(word) > opts.maxWidth) return null;
    const candidate = line ? `${line} ${word}` : word;
    if (width(candidate) <= opts.maxWidth) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function fitText(opts: FitOptions): Fitted {
  const key = JSON.stringify(opts);
  const cached = cache.get(key);
  if (cached) return cached;
  const lineHeight = opts.lineHeight ?? 1.15;
  const maxLines = opts.maxLines ?? 2;
  let result: Fitted | null = null;
  for (let size = opts.maxSize; size >= opts.minSize; size -= 2) {
    const lines = wrap(opts, size);
    if (!lines || lines.length > maxLines) continue;
    const height = Math.ceil(lines.length * size * lineHeight);
    if (height > opts.maxHeight) continue;
    result = { size, lines, height, lineHeight };
    break;
  }
  if (!result) {
    // Nothing fits at the allowed sizes: fall back to the smallest size (never hide text, and report it on render).
    const lines = wrap(opts, opts.minSize) ?? opts.text.split(/\s+/);
    result = { size: opts.minSize, lines, height: Math.ceil(lines.length * opts.minSize * lineHeight), lineHeight };
    console.warn(`fitText: "${opts.text}" does not fit ${opts.maxWidth}x${opts.maxHeight} at ${opts.minSize}px`);
  }
  cache.set(key, result);
  return result;
}

export function measure(text: string, family: string, weight: number, size: number, letterSpacing?: string) {
  return measureText({ text, fontFamily: family, fontSize: size, fontWeight: weight, letterSpacing }).width;
}
