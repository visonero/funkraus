#!/usr/bin/env node
// Builds the printable "Alphabet-Karte" PDF from content/data/alphabet.json using headless Chrome.
//   node content/scripts/build-alphabet-card.mjs <chapter-dir>

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chapterDir = path.resolve(process.argv[2] ?? "");
const chapter = JSON.parse(readFileSync(path.join(chapterDir, "chapter.json"), "utf8"));
const { source, letters } = JSON.parse(readFileSync(path.join(contentDir, "data", "alphabet.json"), "utf8"));
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const row = (l) => `
  <div class="row">
    <span class="letter">${l.letter}</span>
    <span class="word">${l.word}</span>
    <span class="pron">${l.pronunciation}</span>
  </div>`;

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<style>
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600&family=Poppins:wght@600;700;800&display=swap");
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; width: 210mm; height: 297mm; padding: 16mm 15mm 12mm; font-family: "Plus Jakarta Sans", sans-serif; color: #1c2b3a;
    background: radial-gradient(600px 300px at 0% 0%, rgba(47,155,234,.14), transparent 70%), radial-gradient(500px 300px at 100% 100%, rgba(34,211,238,.16), transparent 70%), #f6f9fd; }
  header { display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-family: Poppins; font-weight: 700; font-size: 18px; color: #1c2b3a; }
  .brand span { color: #2f9bea; }
  h1 { font-family: Poppins; font-weight: 800; font-size: 30px; margin: 4px 0 0; letter-spacing: -0.02em; }
  h1 em { font-style: normal; background: linear-gradient(100deg,#2f9bea,#22d3ee); -webkit-background-clip: text; color: transparent; }
  .lesson { font-family: Poppins; font-weight: 700; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #2f9bea; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10mm; margin-top: 8mm; }
  .row { display: grid; grid-template-columns: 11mm 1fr auto; align-items: center; gap: 3mm; padding: 2.1mm 3mm; margin-bottom: 1.6mm;
    background: rgba(255,255,255,.85); border: 1px solid rgba(30,58,95,.1); border-radius: 3mm; }
  .letter { font-family: Poppins; font-weight: 800; font-size: 19px; color: #1c7fd0; }
  .word { font-family: Poppins; font-weight: 600; font-size: 13px; letter-spacing: .02em; }
  .pron { font-size: 9.5px; color: #51677c; text-align: right; max-width: 34mm; }
  .tips { margin-top: 7mm; display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .box { background: rgba(255,255,255,.85); border: 1px solid rgba(30,58,95,.1); border-radius: 4mm; padding: 4mm 5mm; }
  .box h2 { font-family: Poppins; font-size: 12px; margin: 0 0 2mm; color: #1c7fd0; }
  .box p, .box li { font-size: 10.5px; line-height: 1.5; margin: 0; color: #51677c; }
  .box ul { margin: 0; padding-left: 4mm; }
  .plate { display: inline-block; font-family: Poppins; font-weight: 800; letter-spacing: .08em; padding: 0 2mm; border: 1.5px solid #1c2b3a; border-radius: 1.5mm; background: #fff; color: #1c2b3a; }
  footer { position: absolute; left: 15mm; right: 15mm; bottom: 10mm; font-size: 8.5px; color: #8fa2b3; display: flex; justify-content: space-between; }
</style></head><body>
<header>
  <div>
    <div class="lesson">Lektion ${chapter.id} · Alphabet-Karte</div>
    <h1>Die <em>Buchstabiertafel</em></h1>
  </div>
  <div class="brand">funk<span>raus</span></div>
</header>
<div class="grid">
  <div>${letters.slice(0, 13).map(row).join("")}</div>
  <div>${letters.slice(13).map(row).join("")}</div>
</div>
<div class="tips">
  <div class="box">
    <h2>So sprichst du es</h2>
    <ul>
      <li>Das <b>Wort</b> sprechen, nicht den Buchstaben.</li>
      <li>Deutlich und nicht zu schnell.</li>
      <li>In der Prüfung genau so schreiben: ALFA, JULIETT.</li>
    </ul>
  </div>
  <div class="box">
    <h2>Beispiel</h2>
    <p><span class="plate">D-EJFC</span></p>
    <p style="margin-top:2mm"><b>DELTA ECHO JULIETT FOXTROT CHARLIE</b></p>
  </div>
</div>
<footer>
  <span>Quelle: ${source}</span>
  <span>funkraus.de</span>
</footer>
</body></html>`;

const buildDir = path.join(contentDir, "build", `${chapter.id}-alphabet-karte`);
mkdirSync(buildDir, { recursive: true });
const htmlFile = path.join(buildDir, "alphabet-karte.html");
const pdfFile = path.join(buildDir, "alphabet-karte.pdf");
writeFileSync(htmlFile, html);
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000", `--print-to-pdf=${pdfFile}`, `file://${htmlFile}`], { stdio: "ignore" });
console.log(`-> ${pdfFile}`);
