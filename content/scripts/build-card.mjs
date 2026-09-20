#!/usr/bin/env node
// Builds a printable A4 reference card (PDF) from <chapter-dir>/<name>.json using headless Chrome.
//   node content/scripts/build-card.mjs <chapter-dir> <name>     e.g. ... 2.3-funkspruch-kuerzel kuerzel-karte
// Card format: { label, title, highlight, sections: [{ title, rows: [[key, value]], example?: { say, note } }], footer }

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chapterDir = path.resolve(process.argv[2] ?? "");
const name = process.argv[3];
const chapter = JSON.parse(readFileSync(path.join(chapterDir, "chapter.json"), "utf8"));
const card = JSON.parse(readFileSync(path.join(chapterDir, `${name}.json`), "utf8"));
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const section = (s) => `
  <section class="box">
    <h2>${esc(s.title)}</h2>
    ${s.rows.map(([k, v]) => `<div class="row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join("")}
    ${s.example ? `<div class="example"><span>${esc(s.example.say)}</span><b>${esc(s.example.note)}</b></div>` : ""}
  </section>`;

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<style>
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600&family=Poppins:wght@600;700;800&display=swap");
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; width: 210mm; height: 297mm; padding: 14mm 15mm 12mm; font-family: "Plus Jakarta Sans", sans-serif; color: #1c2b3a;
    background: radial-gradient(600px 300px at 0% 0%, rgba(47,155,234,.14), transparent 70%), radial-gradient(500px 300px at 100% 100%, rgba(34,211,238,.16), transparent 70%), #f6f9fd; }
  header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5mm; }
  .brand { font-family: Poppins; font-weight: 700; font-size: 18px; } .brand span { color: #2f9bea; }
  .label { font-family: Poppins; font-weight: 700; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #2f9bea; }
  h1 { font-family: Poppins; font-weight: 800; font-size: 28px; margin: 4px 0 0; letter-spacing: -0.02em; }
  h1 em { font-style: normal; background: linear-gradient(100deg,#2f9bea,#22d3ee); -webkit-background-clip: text; color: transparent; }
  .box { background: rgba(255,255,255,.88); border: 1px solid rgba(30,58,95,.1); border-radius: 4mm; padding: 3.2mm 5mm 2.6mm; margin-bottom: 3.6mm; }
  h2 { font-family: Poppins; font-size: 11.5px; margin: 0 0 1.6mm; color: #1c7fd0; }
  .row { display: grid; grid-template-columns: 36mm 1fr; gap: 3mm; padding: .9mm 0; border-top: 1px solid rgba(30,58,95,.07); font-size: 10.2px; line-height: 1.35; }
  .k { font-family: Poppins; font-weight: 700; color: #1c2b3a; } .v { color: #51677c; }
  .example { margin-top: 1.6mm; padding: 1.6mm 3mm; background: rgba(47,155,234,.08); border-radius: 2mm; font-size: 10px; display: flex; justify-content: space-between; gap: 4mm; }
  .example b { font-family: Poppins; color: #1c7fd0; }
  footer { position: absolute; left: 15mm; right: 15mm; bottom: 9mm; font-size: 8.5px; color: #8fa2b3; display: flex; justify-content: space-between; }
</style></head><body>
<header>
  <div><div class="label">${esc(card.label)}</div><h1>${esc(card.title)} <em>${esc(card.highlight)}</em></h1></div>
  <div class="brand">funk<span>raus</span></div>
</header>
${card.sections.map(section).join("")}
<footer><span>${esc(card.footer)}</span><span>funkraus.de</span></footer>
</body></html>`;

const buildDir = path.join(contentDir, "build", `${chapter.id}-${name}`);
mkdirSync(buildDir, { recursive: true });
const htmlFile = path.join(buildDir, `${name}.html`);
const pdfFile = path.join(buildDir, `${name}.pdf`);
writeFileSync(htmlFile, html);
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000", `--print-to-pdf=${pdfFile}`, `file://${htmlFile}`], { stdio: "ignore" });
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--virtual-time-budget=8000", `--screenshot=${path.join(buildDir, "preview.png")}`, "--window-size=794,1123", `file://${htmlFile}`], { stdio: "ignore" });
console.log(`-> ${pdfFile}`);
