// Article bodies are Markdown. A line containing only {{name}} is replaced by a designed preset section.
export const PRESETS = {
  cta: { label: "Kurs-Werbung (groß)", hint: "Großer Banner: kostenlos registrieren" },
  "cta-klein": { label: "Kurs-Werbung (kompakt)", hint: "Schmale Zeile mit Button, passt mitten in den Text" },
  vorteile: { label: "Kurs-Highlights", hint: "Drei Kennzahlen zum Kurs plus Button" },
} as const;

export type PresetId = keyof typeof PRESETS;

export type BodySegment = { type: "md"; text: string } | { type: "preset"; id: PresetId };

const TOKEN = /^[ \t]*\{\{\s*([a-z-]+)\s*\}\}[ \t]*$/gm;

export function splitBody(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let last = 0;
  for (const m of body.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    const text = body.slice(last, start);
    if (text.trim()) segments.push({ type: "md", text });
    const id = m[1] as PresetId;
    if (id in PRESETS) segments.push({ type: "preset", id });
    last = start + m[0].length;
  }
  const rest = body.slice(last);
  if (rest.trim()) segments.push({ type: "md", text: rest });
  return segments;
}

export function readingMinutes(body: string): number {
  const words = body.replace(/\{\{[^}]*\}\}/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
