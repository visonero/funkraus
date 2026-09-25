// Article bodies are Markdown. A line containing only {{name}} is replaced by a designed preset section.
export const PRESETS = {
  cta: { label: "Kurs-Werbung (groß)", hint: "Großer Banner: kostenlos registrieren" },
  "cta-klein": { label: "Kurs-Werbung (kompakt)", hint: "Schmale Zeile mit Button, passt mitten in den Text" },
  vorteile: { label: "Kurs-Highlights", hint: "Drei Kennzahlen zum Kurs plus Button" },
} as const;

export type PresetId = keyof typeof PRESETS;

export type BodySegment = { type: "md"; text: string } | { type: "preset"; id: PresetId };

// Copying a table through some apps flattens its rows onto one line ("| A | B | | 1 | 2 |"). Rebuild the rows.
function repairTables(md: string): string {
  return md
    .split("\n")
    .map((line) => {
      if (!/\|\s*:?-{3,}:?\s*\|/.test(line)) return line;
      const cells = line.trim().split("|").map((c) => c.trim());
      if (cells[0] === "") cells.shift();
      const sepAt = cells.findIndex((c) => /^:?-{3,}:?$/.test(c));
      if (sepAt < 2) return line;
      let cols = 0;
      while (/^:?-{3,}:?$/.test(cells[sepAt + cols] ?? "")) cols++;
      if (sepAt !== cols + 1 || cells.length % (cols + 1) !== 0) return line;
      const rows: string[] = [];
      for (let i = 0; i < cells.length; i += cols + 1) {
        if (cells[i + cols] !== "") return line;
        rows.push(`| ${cells.slice(i, i + cols).join(" | ")} |`);
      }
      return `\n${rows.join("\n")}\n`;
    })
    .join("\n");
}

const TOKEN = /^[ \t]*\{\{\s*([a-z-]+)\s*\}\}[ \t]*$/gm;

export function splitBody(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let last = 0;
  for (const m of body.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    const text = body.slice(last, start);
    if (text.trim()) segments.push({ type: "md", text: repairTables(text) });
    const id = m[1] as PresetId;
    if (id in PRESETS) segments.push({ type: "preset", id });
    last = start + m[0].length;
  }
  const rest = body.slice(last);
  if (rest.trim()) segments.push({ type: "md", text: repairTables(rest) });
  return segments;
}

export function readingMinutes(body: string): number {
  const words = body.replace(/\{\{[^}]*\}\}/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
