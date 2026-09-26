// Splits a lesson text (Markdown) into readable steps for the step-by-step lesson view. Every "## Heading" starts
// a new section. Text before the first heading becomes an introduction, and very short pieces are merged into their
// neighbour so nobody has to click through a step that holds a single sentence.

export type Section = { title: string; markdown: string };

const MIN_CHARS = 240;

export function splitSections(body: string | null | undefined): Section[] {
  const text = (body ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const raw: Section[] = [];
  let current: Section = { title: "Einführung", markdown: "" };
  let inCode = false;
  for (const line of text.split("\n")) {
    if (/^```/.test(line)) inCode = !inCode;
    const heading = !inCode ? line.match(/^##\s+(.+?)\s*$/) : null;
    if (heading) {
      if (current.markdown.trim()) raw.push({ ...current, markdown: current.markdown.trim() });
      current = { title: heading[1], markdown: "" };
    } else {
      current.markdown += line + "\n";
    }
  }
  if (current.markdown.trim()) raw.push({ ...current, markdown: current.markdown.trim() });

  // Merge tiny sections: an intro that is too short joins the next section (keeping the next title),
  // any other short section joins the previous one.
  const out: Section[] = [];
  let carry = "";
  for (const s of raw) {
    const md = carry ? `${carry}\n\n${s.markdown}` : s.markdown;
    carry = "";
    if (md.length < MIN_CHARS && out.length === 0 && raw.length > 1 && s === raw[0]) {
      carry = md; // very short intro: hand it to the next section
      continue;
    }
    if (md.length < MIN_CHARS && out.length > 0) {
      const last = out[out.length - 1];
      last.markdown = `${last.markdown}\n\n## ${s.title}\n\n${s.markdown}`;
      continue;
    }
    out.push({ title: s.title, markdown: md });
  }
  if (carry) out.push({ title: raw[0].title, markdown: carry });
  return out;
}
